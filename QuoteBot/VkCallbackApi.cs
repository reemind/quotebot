using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Data = DatabaseContext;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Drawing;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Transactions;
using VkCallbackApi;
using VkNet;
using VkNet.Enums;
using VkNet.Model;
using VkNet.Model.Attachments;
using VkNet.Model.Keyboard;
using DatabaseContext;

namespace QuotePanel
{
    public class VkCallbackApi
    {
        DataContext context;
        ILogger logger;
        Data.Group group;
        Data.GroupRole userRole;
        VkApi api;
        Dictionary<string, QuoteBot.Language> languages;
        static Dictionary<int, string> langCodes = new Dictionary<int, string>
        {
            { 0, "ru" }
        };


        public VkCallbackApi(ILogger _logger, Data.Group _group, DataContext _context, Dictionary<string, QuoteBot.Language> _languages)
        {
            logger = _logger;
            group = _group;
            context = _context;
            languages = _languages;

            api = new VkApi();
            api.Authorize(new ApiAuthParams() { AccessToken = group.Token });

            if (!api.IsAuthorized)
                logger.LogWarning("Api is not authorized");
        }

        #region VkApi Methods
        [VkMethod("message_new")]
        public void MessageNew(JsonElement vkobj)
        {
            long vkUserId = vkobj.GetProperty("message").GetProperty("from_id").GetInt64();
            long peerId = vkobj.GetProperty("message").GetProperty("peer_id").GetInt64();
            Login(vkUserId);
            var text = vkobj.GetProperty("message").GetProperty("text").ToString();
            var lang_id = vkobj.GetProperty("client_info").GetProperty("lang_id").GetInt32();
            var language = languages[langCodes.ContainsKey(lang_id) ? langCodes[lang_id] : "ru"];

            if (userRole == null && peerId == vkUserId)
            {
                if (Regex.IsMatch(text, @"\A([\w]+ [\w]+( [\w]+)?) ([\d]{3,4})"))
                {
                    Match match = Regex.Match(text, @"\A([\w]+ [\w]+( [\w]+)?) ([\d]{3,4})");
                    Data.User user = context.GetUser(vkUserId);
                    if (user == null)
                        context.Add(user = new Data.User
                        {
                            VkId = vkUserId,
                            Name = match.Groups[1].Value,
                            Room = int.Parse(match.Groups[3].Value),
                            House = group,
                        });

                    context.SetRole(group, user, UserRole.User);
                    api.SendMessage(group, user, language.Values["confirmRegistration"]);
                }
                return;
            }

            if (userRole.Role == UserRole.User)
                return;

            Log($"User {userRole.User.Name}({userRole.User.VkId}) send message({text})");


            var (wall_exist, wall) = GetAttachment(vkobj.GetProperty("message").GetProperty("attachments"));
            var post = wall_exist ? GetPost(wall) : null;

            var instance = new NewMessageMethods {
                language = language,
                context = context,
                api = api,
                post = post,
                logger = logger,
                group = group,
                role = userRole,
                wall = new Tuple<bool, JsonElement>(wall_exist, wall)
            };



            QuoteBot.NewMassageHandler.Handle(instance, 
                (pattern) => Regex.IsMatch(text, language.Patterns[pattern]), 
                (pattern) => Regex.Match(text, language.Patterns[pattern]),
                (pattern) => logger.LogInformation(pattern)
                );

            //Response("1234", new Data.Post { PostId = 10 });
                
        }

        [VkMethod("wall_reply_new")]
        public void WallReplyNew(JsonElement vkobj)
        {
            var text = vkobj.GetProperty("text").GetString();
            var post = context.GetPosts(group).Include(t => t.BindTo)
                                      .SingleOrDefault(t => t.PostId == vkobj.GetProperty("post_id").GetInt64());
            if (post == null)
                return;

            Login(vkobj.GetProperty("from_id").GetInt64());

            if ((!group.Configuration.WithFilter || Regex.IsMatch(text, group.Configuration.FilterPattern)) &&
            userRole != null &&
            vkobj.EnumerateObject().Count(t => t.Name == "reply_to_comment") == 0)
            {
                if (post.BindTo != null)
                    post = post.BindTo;

                using (var scope = context.Database.BeginTransaction())
                {
                    Log($"New comment from {userRole.User.Name}({userRole.User.VkId}) in group {group.BuildNumber}");


                    var quotes = context.GetQuotes(post);
                    var count = quotes.Count();

                    var quote = quotes.FirstOrDefault(t => t.User == userRole.User);
                    if (quote == null)
                    {
                        count++;

                        quote = new Quote
                        {
                            CommentId = vkobj.GetProperty("id").GetInt64(),
                            Post = post,
                            User = userRole.User,
                            Time = (new DateTime(1970, 1, 1, 0, 0, 0, 0)).AddSeconds(vkobj.GetProperty("date").GetInt64())
                        };
                        //if (post.Max < count)
                        //    SendReply(post, id, "Квота заполнена");
                        //else
                        //    SendReply(post, id, $"{count} из {post.Max}");

                        context.Add(quote);
                        context.SaveChanges();


                        logger.LogInformation($"Quote in post {post.Id} is {count} of {post.Max}");
                    }
                    //else
                    //    SendReply(post, id, "Такой участник уже в списке");

                    scope.Commit();
                }
            }
        }

        [VkMethod("wall_reply_delete")]
        public void WallDeleteReply(JsonElement vkobj)
        {
            using (var scope = context.Database.BeginTransaction())
            {
                var post = context.GetPosts(group).Include(t => t.BindTo)
                              .SingleOrDefault(t => t.PostId == vkobj.GetProperty("post_id").GetInt64());

                if (post.BindTo != null)
                    post = post.BindTo;

                if (post == null)
                    return;

                var quote = context.GetQuotes(post)
                                   .FirstOrDefault(t => t.CommentId == vkobj.GetProperty("id").GetInt64());

                if (quote != null)
                {
                    var count = context.GetQuotes(post).Count();

                    context.Remove(quote);

                    Log($"New count {count-1} of {post.Max}");

                    context.SaveChanges();
                }
                scope.Commit();

            }
        }

        [VkMethod("confirmation")]
        public void Confirmation(CallbackRequest response)
        {

        }

        [VkMethod("wall_post_new")]
        public void WallNewPost(JsonElement vkobj)
        {
            var text = vkobj.GetProperty("text").GetString();
            if (!Regex.IsMatch(text, @"#[Мм]ер([\d]{1,2})"))
                return;
            var max = int.Parse(Regex.Match(text, @"#[Мм]ер([\d]{1,2})", RegexOptions.Multiline).Groups[1].Value);
            JsonElement el = new JsonElement();
            if (vkobj.TryGetProperty("created_by", out el))
            {
                Login(el.GetInt64());

                if (userRole != null && userRole.Role > UserRole.User)
                {
                    if (context.GetPosts(group).FirstOrDefault(t => t.PostId == vkobj.GetProperty("id").GetInt32()) != null)
                    {
                        api.SendMessage(group, userRole.User, "Запись уже добавлена");
                        return;
                    }

                    var new_post = CreatePost(context, group, vkobj, max);

                    api.SendMessage(group, userRole.User, $"Запись добавлена в очередь: id={new_post.Id}", new MessagePost(group.GroupId, new_post.PostId));
                    //api.Wall.CreateComment(new VkNet.Model.RequestParams.WallCreateCommentParams
                    //{
                    //    OwnerId = -group.GroupId,
                    //    PostId = new_post.PostId,
                    //    FromGroup = group.GroupId,
                    //    Message = Resources.Resource.Reply
                    //});
                }

            }
        }
        #endregion


        #region TextFormating
        
        #endregion


        public static IEnumerable<IEnumerable<MessageKeyboardButton>> GeneratePostsButtons(IEnumerable<Data.Post> posts)
        {
            var buts = new List<List<MessageKeyboardButton>>();

            int i = 0;
            foreach (var item in posts)
            {
                if (i == 2)
                    i = 0;

                if (i++ == 0)
                    buts.Add(new List<MessageKeyboardButton>());

                buts.Last().Add(new MessageKeyboardButton
                {
                    Action = new MessageKeyboardButtonAction
                    {
                        Type = VkNet.Enums.SafetyEnums.KeyboardButtonActionType.Text,
                        Label = $"Проверить {item.Id}"
                    },
                    Color = VkNet.Enums.SafetyEnums.KeyboardButtonColor.Primary
                });
            }

            return buts;
        }


        #region Vk Methods
        public static Data.Post CreatePost(DataContext context, Data.Group group, JsonElement wall, int max)
        {

            var text = wall.GetProperty("text").GetString();
            var id = wall.GetProperty("id").GetInt32();
            var date = (new DateTime(1970, 1, 1, 0, 0, 0, 0))
                            .AddSeconds(wall.GetProperty("date").GetInt64());

            var index = text.IndexOf('\n');
            if (index > -1)
                text = text.Remove(index);

            Data.Post bindPost = null;
            if (wall.EnumerateObject().Count(t => t.Name == "copy_history") != 0)
            {
                var history = wall.GetProperty("copy_history").EnumerateArray()
                              .Select(t => new
                              {
                                  groupId = -t.GetProperty("owner_id").GetInt64(),
                                  postId = t.GetProperty("id").GetInt64()
                              }).FirstOrDefault();

                if (history != null) { }
                bindPost = context.Posts.FirstOrDefault(t => t.Group.GroupId == history.groupId
                                && t.PostId == history.postId);
            }

            if (string.IsNullOrWhiteSpace(text))
                text = $"Post from {date.ToLocalTime()}";

            var new_post = new Data.Post
            {
                Group = group,
                Text = text.Length > 20 ? text.Remove(17) : text,
                PostId = id,
                Max = max,
                Time = date,
                BindTo = bindPost
            };
            context.Add(new_post);
            context.SaveChanges();

            return new_post;
        }

        private void SendReply(Data.Post post, long id, string message)
        {
            api.Wall.CreateComment(new VkNet.Model.RequestParams.WallCreateCommentParams
            {
                OwnerId = -group.GroupId,
                Message = message,
                PostId = post.PostId,
                FromGroup = group.GroupId,
                ReplyToComment = id
            });
        }

        
        #endregion

        void Login(long userId) => userRole = context.GetGroupRole(group, userId);

        void Log(string text) => logger.LogInformation(text);

        #region JsonHandlers
        (bool, JsonElement) GetAttachment(JsonElement atts)
        {
            var walls = atts.EnumerateArray()
                           .Where(t => t.GetProperty("type").GetString() == "wall" &&
                                       t.GetProperty("wall").GetProperty("to_id").GetInt32() == -group.GroupId);
            return (walls.Count() > 0 ? true : false, walls.FirstOrDefault());
        }


        Data.Post GetPost(JsonElement att)
            => context.GetPosts(group).Include(t => t.BindTo).SingleOrDefault(t => t.PostId == att.GetProperty("wall").GetProperty("id").GetInt64());
        #endregion
    }

    public class NewMessageMethods
    {
        public QuoteBot.Language language;
        public DataContext context;
        public VkApi api;
        public Data.Post post;
        public Data.Group group;
        public GroupRole role;
        public ILogger logger;
        public Tuple<bool, JsonElement> wall;

        [QuoteBot.NewMessageMethod("checkAttr")]
        public async Task Check(Match match)
        {
            var post = await GetPostById(match);
            if (post == null)
                Response(language.Values["PostNotFound"], null, null);
            else
                Response("Список участников:\n" + GetQuotes(post), null, GenerateNotifyButton(post));
        }

        [QuoteBot.NewMessageMethod("check")]
        public void CheckByRepost()
        {
            if (post == null)
                Response("Запись не найдена");
            else
                Response("Список участников:\n" + GetQuotes(post), null, GenerateNotifyButton(post));
        }

        [QuoteBot.NewMessageMethod("add")]
        public void Add(Match match)
        {
            if (wall.Item1)
            {
                if (post != null)
                    Response($"Запись c id={post.Id} уже в очереди", post);
                else
                {
                    logger.LogInformation("Command - Add");
                    var new_post = VkCallbackApi.CreatePost(
                        context,
                        group,
                        wall.Item2.GetProperty("wall"), 
                        int.Parse(match.Groups[1].Value));


                    Response($"Запись добавлена в очередь: id={new_post.Id}", new_post);
                }
            }
        }

        [QuoteBot.NewMessageMethod("notifyAttr")]
        public async Task Notify(Match match)
        {
            var post = await GetPostById(match);
            if (post == null)
                Response("Запись не найдена");
            else if (post.BindTo is Data.Post)
                Response("Уведомления для репостов недоступны");
            else
            {
                int res = await MultipleResponse (post);
                Response($"Сообщения отправлены {res} людям");
            }
        }

        [QuoteBot.NewMessageMethod("notify")]
        public async Task NotifyByRepost()
        {
            if (post == null)
                Response("Запись не найдена");
            else if (post.BindTo is Data.Post)
                Response("Уведомления для репостов недоступны");
            else
            {
                int res = await MultipleResponse(post);
                Response($"Сообщения отправлены {res} людям");
            }
        }

        [QuoteBot.NewMessageMethod("deleteAttr")]
        public async Task Delete(Match match)
        {
            post = await GetPostById(match);

            if (post == null)
                Response("Запись не найдена");
            else
            {
                Response("Вот список перед удалением:\n" + GetQuotes(post));
                foreach (var item in context.GetQuotes(post))
                    context.Remove(item);
                Response($"Пост({post.Id}) удален");
                context.Remove(post);
                context.SaveChanges();
            }
        }

        [QuoteBot.NewMessageMethod("delete")]
        public async Task DeleteByRepost(Match match)
        {
            if (post == null)
                Response("Запись не найдена");
            else
            {
                Response("Вот список перед удалением:\n" + GetQuotes(post));

                Response($"Пост({post.Id}) удален");
                post.Deleted = true;
                await context.SaveChangesAsync();
            }
        }

        [QuoteBot.NewMessageMethod("close")]
        public async Task Close(Match match)
        {
            post = await GetPostById(match);

            if (post == null)
                Response("Запись не найдена");
            else
            {
                context.SaveChanges();
                Response($"Квота поста с id={post.Id} закрыта", post);
            }
        }

        [QuoteBot.NewMessageMethod("closeAttr")]
        public void CloseByRepost(Match match)
        {
            if (post == null)
                Response("Запись не найдена");
            else
            {
                context.SaveChanges();
                Response($"Квота поста с id={post.Id} закрыта", post);
            }
        }

        [QuoteBot.NewMessageMethod("list")]
        public void List(Match match)
        {
            MessageKeyboard keyboard = null;
            var posts = context.GetPosts(group);
            keyboard = new MessageKeyboard
            {
                Inline = true
            };

            keyboard.Buttons = VkCallbackApi.GeneratePostsButtons(
                posts.OrderByDescending(t => t.Id).Take(10).AsEnumerable().Reverse());

            Response("Список постов:\n" + GetPosts(), null, keyboard);
        }

        [QuoteBot.NewMessageMethod("help")]
        public void Help()
        {
            Response(language.Values["help"] + (role.Role >= UserRole.GroupAdmin ? language.Values["helpAdmin"] : ""));
        }

        [QuoteBot.NewMessageMethod("addAdmin")]
        public async Task AddAdmin(Match match)
        {
            if (role.Role >= UserRole.GroupAdmin)
            {
                var name = match.Groups[1].Value;
                var api_user = (await api.Users.GetAsync(new List<string> { name })).FirstOrDefault();
                if (api_user is VkNet.Model.User)
                {
                    if (await context.GetUsers(group, UserRole.Moder, UserRole.Admin, UserRole.GroupModer, UserRole.GroupAdmin).FirstOrDefaultAsync(t => t.VkId == api_user.Id) is Data.User)
                        Response("Уже модератор");

                    else
                    {
                        Data.User moder = await context.GetUsers(group, UserRole.User).FirstOrDefaultAsync(t => t.VkId == api_user.Id);

                        if (moder is Data.User)
                        {
                            context.SetRole(group, moder, UserRole.GroupModer);
                            Response($"@id{moder.VkId}({moder.Name}) теперь модератор");
                        }
                        else
                            Response("Модератор не найден");


                    }
                }
            }
        }

        [QuoteBot.NewMessageMethod("delAdmin")]
        public async Task DeleteAdmin(Match match)
        {
            if(role.Role >= UserRole.GroupAdmin)
            {
                var name = match.Groups[1].Value;
                var api_user = (await api.Users.GetAsync(new List<string> { name })).FirstOrDefault();
                var moder = context.GetUsers(group, UserRole.GroupModer, UserRole.Admin, UserRole.Moder, UserRole.GroupAdmin)
                                   .FirstOrDefault(t => t.VkId == api_user.Id);

                if (moder is Data.User)
                {
                    context.SetRole(group, moder, UserRole.User);
                    await context.SaveChangesAsync();
                    Response($"@id{moder.VkId}({moder.Name}) удален)");
                }
                else
                    Response("Модератор не найден");
            }
        }

        [QuoteBot.NewMessageMethod("listAdmins")]
        public void ListAdmins(Match match)
        {
            if (role.Role >= UserRole.GroupAdmin)
            {
                Response("Список модераторов и админов:\n" + GetAdmins());
            }
        }

        Task<Data.Post> GetPostById(Match match)
        {
            var id = long.Parse(match.Groups[1].Value);
            return context.GetPosts(group).Include(t => t.BindTo).FirstOrDefaultAsync(t => t.Id == id);
        }

        void Response(string message, Data.Post post = null, MessageKeyboard keyboard = null)
        {
            if (keyboard == null)
            {
                keyboard = new MessageKeyboard
                {
                    Buttons = new List<List<MessageKeyboardButton>>
                        {
                            new List<MessageKeyboardButton>
                            {
                                new MessageKeyboardButton
                                {
                                    Color = VkNet.Enums.SafetyEnums.KeyboardButtonColor.Primary,
                                    Action = new MessageKeyboardButtonAction
                                    {
                                        Label = "Список",
                                        Type = VkNet.Enums.SafetyEnums.KeyboardButtonActionType.Text
                                    }
                                },
                                new MessageKeyboardButton
                                {
                                    Action = new MessageKeyboardButtonAction
                                    {
                                        Label = "Помощь",
                                        Type = VkNet.Enums.SafetyEnums.KeyboardButtonActionType.Text
                                    }
                                }
                            }
                        }
                };
            }

            api.SendMessage(group, role.User, message, post != null ? new MessagePost(group.GroupId, post.PostId) : null, keyboard);
        }

        public static MessageKeyboard GenerateNotifyButton(Data.Post post)
            => new MessageKeyboard
            {
                Inline = true,
                Buttons = new List<List<MessageKeyboardButton>> {
                        new List<MessageKeyboardButton>
                        {
                            new MessageKeyboardButton
                            {
                                Action = new MessageKeyboardButtonAction
                                {
                                    Label = "Уведомить " + post.Id,
                                    Type = VkNet.Enums.SafetyEnums.KeyboardButtonActionType.Text
                                },
                                Color = VkNet.Enums.SafetyEnums.KeyboardButtonColor.Primary
                            }
                        }
                    }
            };

        private string GetAdmins()
        {
            string resp = "";
            foreach (var item in context.GetUsers(group, UserRole.Admin, UserRole.Moder, UserRole.GroupAdmin, UserRole.GroupModer))
                resp += $"@id{item.VkId}({item.Name})\n";

            if (resp == "")
                return "Пусто";
            else
                return resp;
        }

        private string GetQuotes(Data.Post post)
        {
            string resp = "";
            int i = 1;
            foreach (var item in context.GetQuotes(post).Where(t => !t.IsOut).Select(t => t.User).Take(post.Max))
                resp += $"{i++}. @id{item.VkId}({item.Name})({item.Room})\n";

            if (i == 1)
                return "Пусто";
            else
                return resp;
        }

        private string GetPosts()
        {
            string resp = "";
            foreach (var item in context.GetPosts(group).Include(t => t.BindTo))
                resp += $"id={item.Id} - {(item.BindTo is Data.Post ? "Repost: " : "")}{item.Text}\n";

            if (resp == "")
                return "Пусто";
            else
                return resp;
        }

        private async Task<int> MultipleResponse(Data.Post post)
        {
            var report = context.CreateReport(group, post);
            var reportQuotes = context.GetReportItems(report).Include(t => t.FromQuote.User);
            var quotes = context.GetQuotes(post)
                .Include(t => t.User)
                .Where(t => !t.IsOut)
                .Take(post.Max)
                .Except(reportQuotes.Select(t => t.FromQuote));
            var groups = quotes
                .Include(t => t.User.House)
                .Select(t => t.User)
                .AsEnumerable()
                .GroupBy(t => t.House);

            var quotesForReports = quotes.ToList();

            foreach (var gr in groups)
                try
                {
                    var api = new VkApi();
                    api.Authorize(new ApiAuthParams() { AccessToken = gr.Key.Token });
                    var prms = new VkNet.Model.RequestParams.MessagesSendParams
                    {
                        RandomId = (int)DateTimeOffset.Now.ToUnixTimeMilliseconds(),
                        UserIds = gr.Select(t => t.VkId),
                        Message = "Ты участвуешь!",
                        Attachments = new List<MessagePost> { new MessagePost(post) }
                    };

                    var sendResults = await api.Messages.SendToUserIdsAsync(prms);

                    foreach (var res in sendResults)
                        if (!res.MessageId.HasValue)
                            quotesForReports.RemoveAll(t => res.PeerId == t.User.Id);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex.Message);
                }

            context.AddReportItems(report, quotesForReports);

            return quotesForReports.Count;
        }
    }

    public static class VkExtensionMethods
    {
        public static void SendMessage(this VkApi api, Data.Group group, Data.User user, string message, MessagePost mespost = null, MessageKeyboard keyboard = null)
        {
            var prms = new VkNet.Model.RequestParams.MessagesSendParams
            {
                RandomId = (int)DateTimeOffset.Now.ToUnixTimeMilliseconds(),
                UserId = user.VkId,
                Message = message
            };

            if (keyboard is MessageKeyboard && group.Configuration.Keyboard)
                prms.Keyboard = keyboard;

            if (mespost is MessagePost)
                prms.Attachments = new List<MessagePost> { mespost };

            api.Messages.Send(prms);
        }
    }

    public class MessagePost : MediaAttachment
    {
        protected override string Alias => "wall";

        public MessagePost(long owner_id, long id)
        {
            Id = id;
            OwnerId = -owner_id;
        }

        public MessagePost(Data.Post post)
        {
            Id = post.PostId;
            OwnerId = -post.Group.GroupId;
        }
    }
}

