using Microsoft.Extensions.Logging;
using QuoteSharp.Data;
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

namespace QuoteSharp
{
    public class VkCallbackApi
    {
        DataContext context;
        ILogger logger;
        Data.Group group;
        VkApi api;


        public VkCallbackApi(ILogger _logger, Data.Group _group, DataContext _context)
        {
            logger = _logger;
            group = _group;
            context = _context;

            api = new VkApi();
            api.Authorize(new ApiAuthParams() { AccessToken = group.Token });

            if (!api.IsAuthorized)
                logger.LogWarning("Api is not authorized");
        }

        #region VkApi Methods
        [VkMethod("message_new")]
        public void MessageNew(JsonElement vkobj)
        {
            logger.LogTrace("Method: MessageNew");
            var id = vkobj.GetProperty("message").GetProperty("from_id").GetInt64();
            var user = context.GetUsers(group)
                              .FirstOrDefault(t =>
                                    t.VkId == id);
            var text = vkobj.GetProperty("message").GetProperty("text").ToString();

            if (user is null)
            {
                if(Regex.IsMatch(text, @"\A([\w]+ [\w]+( [\w]+)?) ([\d]{3,4})"))
                {
                    Match match = Regex.Match(text, @"\A([\w]+ [\w]+( [\w]+)?) ([\d]{3,4})");

                    if (context.GetUsers(group).FirstOrDefault(t => t.Name == match.Groups[1].Value &&
                         t.Room == int.Parse(match.Groups[3].Value)) is Data.User)
                        SendMessage(user, "Такой пользователь уже зарегистрирован");
                    else
                    {
                        context.Add(user = new Data.User
                        {
                            VkId = id,
                            Name = match.Groups[1].Value,
                            Type = UserType.User,
                            Group = group,
                            Room = int.Parse(match.Groups[3].Value)
                        });
                        context.SaveChanges();
                        SendMessage(user, "Зарегистрирован");
                    }
                }
                return;
            }

            logger.LogInformation($"{user.Name} send message");


            if (user.Type == UserType.User)
                return;

            
            var (wall_exist, wall) = GetAttachment(vkobj.GetProperty("message").GetProperty("attachments"));
            var post = wall_exist ? GetPost(wall) : null;

            bool Check(string pattern) => Regex.IsMatch(text, pattern);

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

                SendMessage(user, message, post != null ? new MessagePost(group.GroupId, post.PostId) : null, keyboard);
            }

            Data.Post GetPostById(string pattern)
            {
                var id = long.Parse(Regex.Match(text, pattern).Groups[1].Value);
                return context.GetPosts(group).FirstOrDefault(t => t.Id == id);
            }

            //Response("1234", new Data.Post { PostId = 10 });

            if (Check(@"\A[Дд]обавить ([\d]{1,3})") && wall_exist)
            {
                if (post != null)
                    Response($"Запись c id={post.Id} уже в очереди", post);
                else
                {
                    var new_post = CreatePost(wall.GetProperty("wall").GetProperty("text").GetString(),
                                              wall.GetProperty("wall").GetProperty("id").GetInt32(),
                                              int.Parse(Regex.Match(text, @"\A[Дд]обавить ([\d]{1,3})").Groups[1].Value));


                    Response($"Запись добавлена в очередь: id={new_post.Id}", new_post);
                    //api.Wall.CreateComment(new VkNet.Model.RequestParams.WallCreateCommentParams
                    //{
                    //    OwnerId = -group.GroupId,
                    //    PostId = new_post.PostId,
                    //    FromGroup = group.GroupId,
                    //    Message = Resources.Resource.Reply
                    //});
                }
            }
            else if (Check(@"\A[Пп]роверить ([\d]+)"))
            {
                post = GetPostById(@"\A[Пп]роверить ([\d]+)");
                if (post == null)
                    Response("Запись не найдена");
                else
                    Response("Список участников:\n" + GetQuotes(post), null, GenerateNotifyButton(post));
            }
            else if (Check(@"\A[Пп]роверить"))
            {
                if (post == null)
                    Response("Запись не найдена");
                else
                    Response("Список участников:\n" + GetQuotes(post), null, GenerateNotifyButton(post));
            }
            else if (Check(@"\A[Уу]ведомить ([\d]+)"))
            {
                post = GetPostById(@"\A[Уу]ведомить ([\d]+)");
                if (post == null)
                    Response("Запись не найдена");
                else
                {
                    bool res = MultipleResponse(post);
                    Response("Сообщения отправлены " + (res ? "" : "не всем"));
                }
            }
            else if (Check(@"\A[Уу]ведомить"))
            {
                if (post == null)
                    Response("Запись не найдена");
                else
                {
                    bool res = MultipleResponse(post);
                    Response("Сообщения отправлены " + (res?"":"не всем"));
                }
            }
            else if (Check(@"\A[Уу]далить ([\d]+)"))
            {
                post = GetPostById(@"\A[Уу]далить ([\d]+)");

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
            else if (Check(@"\A[Уу]далить"))
            {
                if (post == null)
                    Response("Запись не найдена");
                else
                {
                    Response("Вот список перед удалением:\n" + GetQuotes(post));

                    Response($"Пост({post.Id}) удален");
                    post.Deleted = true;
                    context.SaveChanges();
                }
            }
            else if (Check(@"\A[Зз]акрыть ([\d]+)"))
            {
                post = GetPostById(@"\A[Уу]далить ([\d]+)");

                if (post == null)
                    Response("Запись не найдена");
                else
                {
                    post.Expired = true;
                    context.SaveChanges();
                    Response($"Квота поста с id={post.Id} закрыта", post);
                }
            }
            else if (Check(@"\A[Зз]акрыть"))
            {
                if (post == null)
                    Response("Запись не найдена");
                else
                {
                    post.Expired = true;
                    context.SaveChanges();
                    Response($"Квота поста с id={post.Id} закрыта", post);
                }
            }
            else if (Check(@"\A[Сс]писок"))
            {
                MessageKeyboard keyboard = null;
                var posts = context.GetPosts(group);
                if (posts.Count() <= 10)
                {
                    keyboard = new MessageKeyboard
                    {
                        Inline = true
                    };

                    keyboard.Buttons = GeneratePostsButtons(posts);
                }

                Response("Список постов:\n" + GetPosts(), null, keyboard);

            }
            else if (Check(@"\A[Пп]омощь"))
            {
                Response(Resources.Resource.Help + (user.Type == UserType.Admin ? Resources.Resource.HelpAdmin : ""));
            }
            else if (user.Type == UserType.Admin)
            {
                if (Check(@"\A[Зз]аадминить https:\/\/vk\.com\/([\S]+)"))
                {
                    var name = Regex.Match(text, @"\A[Зз]аадминить https:\/\/vk\.com\/([\S]+)").Groups[1].Value;
                    var api_user = api.Users.Get(new List<string> { name }).FirstOrDefault();
                    if (api_user is VkNet.Model.User)
                    {
                        if (context.GetUsers(group, UserType.Moder, UserType.Admin).FirstOrDefault(t => t.VkId == api_user.Id) is Data.User)
                            Response("Уже модератор");

                        else
                        {
                            Data.User moder = context.GetUsers(group, UserType.User).FirstOrDefault(t => t.VkId == api_user.Id);

                            if (moder is Data.User)
                            {
                                moder.Type = UserType.Moder;
                                context.SaveChanges();
                                Response($"@id{moder.VkId}({moder.Name}) теперь модератор");
                            }
                            else
                                Response("Модератор не найден");

                            
                        }
                    }
                }
                else if (Check(@"\A[Рр]азадминить https:\/\/vk\.com\/([\S]+)"))
                {
                    var name = Regex.Match(text, @"\A[Зз]аадминить https:\/\/vk\.com\/([\S]+)").Groups[0].Value;
                    var api_user = api.Users.Get(new List<string> { name }).FirstOrDefault();
                    var moder = context.GetUsers(group, UserType.Moder, UserType.Admin)
                                       .FirstOrDefault(t => t.VkId == api_user.Id);

                    if (moder is Data.User)
                    {
                        moder.Type = UserType.User;
                        context.SaveChanges();
                        Response($"@id{moder.VkId}({moder.Name}) удален)");
                    }
                    else
                        Response("Модератор не найден");
                }
                else if (Check(@"\A[Аа]дмины"))
                    Response("Список модераторов и админов:\n" + GetAdmins());
            }
        }

        private MessageKeyboard GenerateNotifyButton(Data.Post post)
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

        private bool MultipleResponse(Data.Post post)
        {
            bool result = true;

            try
            {
                var prms = new VkNet.Model.RequestParams.MessagesSendParams
                {
                    RandomId = (int)DateTimeOffset.Now.ToUnixTimeMilliseconds(),
                    UserIds = context.GetQuotes(post).Where(t => !t.IsOut).Select(t => t.User.VkId),
                    Message = "Ты учавствуешь!",
                    Attachments = new List<MessagePost> { new MessagePost(post) }
                };

                api.Messages.SendToUserIds(prms);
            }
            catch(Exception ex)
            {
                logger.LogError(ex.Message);
                result = false;
            }

            return result;
        }

        [VkMethod("wall_reply_new")]
        public void WallReplyNew(JsonElement vkobj)
        {
            var text = vkobj.GetProperty("text").GetString();
            var user = context.GetUsers(group).SingleOrDefault(t => t.VkId == vkobj.GetProperty("from_id").GetInt64());
            
            if ((Regex.IsMatch(text, @"\A[Уу]частвую") || !group.WithFilter) &&
                user is Data.User &&
                vkobj.EnumerateObject().Count(t => t.Name == "reply_to_comment") == 0)
            {
                using (var scope = context.Database.BeginTransaction())
                {
                    logger.LogInformation($"New comment in group {group.Id}");

                    var post = context.GetPosts(group)
                                      .SingleOrDefault(t => t.PostId == vkobj.GetProperty("post_id").GetInt64());
                    if (post is Data.Post)
                    {
                        var quotes = context.GetQuotes(post);
                        var count = quotes.Count();

                        var match = Regex.Match(text, @"([\w]+ [\w]+( [\w]+)?) ([\d]{3,4})");

                        var quote = context.GetQuotes(post)
                                                .FirstOrDefault(t => t.User == user);
                        if (quote == null)
                        {
                            count++;

                            quote = new Quote
                            {
                                CommentId = vkobj.GetProperty("id").GetInt64(),
                                Post = post,
                                User = user,
                                IsOut = (post.Max < count)
                            };
                            //if (post.Max < count)
                            //    SendReply(post, id, "Квота заполнена");
                            //else
                            //    SendReply(post, id, $"{count} из {post.Max}");

                            if (post.Max == count)
                                post.Expired = true;

                            context.Add(quote);
                            context.SaveChanges();


                            logger.LogInformation($"Quote in post {post.Id} is {count} {post.Max}");
                        }
                        //else
                        //    SendReply(post, id, "Такой участник уже в списке");
                    }

                    scope.Commit();
                }
            }
        }

        [VkMethod("wall_reply_delete")]
        public void WallDeleteReply(JsonElement vkobj)
        {
            using (var scope = context.Database.BeginTransaction())
            {
                var post = context.GetPosts(group)
                              .SingleOrDefault(t => t.PostId == vkobj.GetProperty("post_id").GetInt64());

                if (post == null)
                    return;

                var quote = context.GetQuotes(post)
                                   .FirstOrDefault(t => t.CommentId == vkobj.GetProperty("id").GetInt64());

                if (quote is Quote)
                {
                    var count = context.GetQuotes(post).Count();

                    context.Remove(quote);

                    count--;

                    logger.LogInformation($"New count {count} of {post.Max}");
                    //if (post.Max == count + 1)
                    //    api.Wall.CreateComment(new VkNet.Model.RequestParams.WallCreateCommentParams
                    //    {
                    //        OwnerId = -group.GroupId,
                    //        PostId = post.PostId,
                    //        FromGroup = group.GroupId,
                    //        Message = "Квота снова открыта"
                    //    });
                    if (post.Max == count)
                    {
                        var last_quote = context.GetQuotes(post).Where(t => t.IsOut).OrderBy(t => t.Id).First();
                        //SendReply(post, last_quote.CommentId, $"{post.Max} из {post.Max}");

                        last_quote.IsOut = false;
                    }

                    context.SaveChanges();
                }
                scope.Commit();

            }
        }

        [VkMethod("confirmation")]
        public void Confirmation(CallbackResponse response)
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
                var user = context.GetUsers(group, UserType.Admin, UserType.Moder)
                              .FirstOrDefault(t =>
                                    t.VkId == el.GetInt64());
                if (user is Data.User)
                {
                    if (context.GetPosts(group).FirstOrDefault(t => t.PostId == vkobj.GetProperty("id").GetInt32()) != null)
                    {
                        SendMessage(user, "Запись уже добавлена");
                        return;
                    }

                    var new_post = CreatePost(vkobj.GetProperty("text").GetString(),
                                              vkobj.GetProperty("id").GetInt32(),
                                              max);

                    SendMessage(user, $"Запись добавлена в очередь: id={new_post.Id}", new MessagePost(group.GroupId, new_post.PostId));
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
        private string GetAdmins()
        {
            string resp = "";
            foreach (var item in context.GetUsers(group, UserType.Admin, UserType.Moder))
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
            foreach (var item in context.GetQuotes(post).Where(t => !t.IsOut).Select(t => t.User))
                resp += $"{i++}. @id{item.VkId}({item.Name})({item.Room})\n";

            if (i == 1)
                return "Пусто";
            else
                return resp;
        }

        private string GetPosts()
        {
            string resp = "";
            foreach (var item in context.GetPosts(group))
                resp += $"id={item.Id} - {item.Text}{(item.Expired?"(Закрыто)":"")}\n";

            if (resp == "")
                return "Пусто";
            else
                return resp;
        }
        #endregion


        private IEnumerable<IEnumerable<MessageKeyboardButton>> GeneratePostsButtons(IEnumerable<Data.Post> posts)
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
        Data.Post CreatePost(string text, long id, int max)
        {
            logger.LogInformation("Command - Add");
            var index = text.IndexOf('\n');
            if (index > -1)
                text = text.Remove(index);
            var new_post = new Data.Post
            {
                Group = group,
                Text = text.Length > 20 ? text.Remove(17) : text,
                PostId = id,
                Max = max
            };
            context.Add(new_post);
            context.SaveChanges();

            return new_post;
        }

        private void SendReply(Data.Post post, long id, string message)
        {
            //api.Wall.CreateComment(new VkNet.Model.RequestParams.WallCreateCommentParams
            //{
            //    OwnerId = -group.GroupId,
            //    Message = message,
            //    PostId = post.PostId,
            //    FromGroup = group.GroupId,
            //    ReplyToComment = id
            //});
        }

        void SendMessage(Data.User user, string message, MessagePost mespost = null, MessageKeyboard keyboard = null)
        {
            //var pars = new Dictionary<string, string>
            //    {
            //        { "message", message },
            //        { "user_id", user.VkId.ToString() },
            //        { "access_token", group.Token },
            //        { "v", "5.122" },
            //        { "random_id", ((int)DateTimeOffset.Now.ToUnixTimeMilliseconds()).ToString() }
            //    };
            //if (attachments != "")
            //    pars.Add("attachment", attachments);
            //api.Invoke("messages.send", pars);

            var prms = new VkNet.Model.RequestParams.MessagesSendParams
            {
                RandomId = (int)DateTimeOffset.Now.ToUnixTimeMilliseconds(),
                UserId = user.VkId,
                Message = message
            };

            if (keyboard is MessageKeyboard && group.Keyboard)
                prms.Keyboard = keyboard;

            if (mespost is MessagePost)
                prms.Attachments = new List<MessagePost> { mespost };

            api.Messages.Send(prms);
        }
        #endregion


        #region DbHandlers
        Data.User GetUserOrCreate(long id, UserType type = UserType.User)
        {
            throw new NotImplementedException();
            var user = context.GetUsers(group).SingleOrDefault(t => t.VkId == id);

            if (user == null)
            {
                var vk_user = api.Users.Get(new List<long> { id }).FirstOrDefault();

                user = new Data.User
                {
                    Group = group,
                    Name = $"{vk_user.FirstName} {vk_user.LastName}",
                    Type = type,
                    VkId = vk_user.Id
                };
                context.Add(user);
                context.SaveChanges();
                return user;
            }
            else 
                return user;
        }
        Data.User GetUserOrCreate(string name, UserType type = UserType.User)
        {
            throw new NotImplementedException();

            var vk_user = api.Users.Get(new List<string> { name }).FirstOrDefault();

            var user = context.Users.SingleOrDefault(t => t.VkId == vk_user.Id);

            if (user == null)
            {
                user = new Data.User
                {
                    Group = group,
                    Name = $"{vk_user.FirstName} {vk_user.LastName}",
                    Type = UserType.User,
                    VkId = vk_user.Id
                };
                context.Add(user);
                context.SaveChanges();
                return user;
            }
            else
                return user;
        }
        #endregion


        #region JsonHandlers
        (bool,JsonElement) GetAttachment(JsonElement atts)
        {
            var walls = atts.EnumerateArray()
                           .Where(t => t.GetProperty("type").GetString() == "wall" &&
                                       t.GetProperty("wall").GetProperty("to_id").GetInt32() == -group.GroupId);
            return (walls.Count() > 0 ? true: false, walls.FirstOrDefault());
        }


        Data.Post GetPost(JsonElement att)
            => context.GetPosts(group).SingleOrDefault(t => t.PostId == att.GetProperty("wall").GetProperty("id").GetInt64());
        #endregion
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
