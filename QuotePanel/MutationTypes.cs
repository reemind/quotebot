using HotChocolate;
using HotChocolate.AspNetCore.Authorization;
using HotChocolate.Types;
using HotChocolate.Types.Relay;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using DatabaseContext;
using Data = DatabaseContext;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using VkNet;
using VkNet.Model;
using System.Text;
using System.Net.Http;
using System.Net.Http.Headers;
using System.IO;
using Flurl;
using Flurl.Http;
using System.Web;
using Microsoft.Extensions.Logging;

namespace QuotePanel.QueryTypes
{

    public class MutationType
    {

        HttpContext httpContext;
        DataContext context;
        GroupRole role;
        //ILogger logger;

        public MutationType([Service] IHttpContextAccessor httpContext, [Service] DataContext context)
        {
            this.context = context;
            this.httpContext = httpContext.HttpContext;
            //this.logger = logger;

            role = context.GetDataFromClaims(this.httpContext.User);
        }

        bool IsMainModer(bool? forAdmin)
        {
            if (!(forAdmin ?? false))
                return false;

            return (role.Role == UserRole.Moder || role.Role == UserRole.Admin);
        }

        bool IsMainAdmin(bool? forAdmin)
        {
            if (!(forAdmin ?? false))
                return false;

            return (role.Role == UserRole.Admin);
        }

        [Authorize(Policy = "GroupModer")]
        public bool EditUserInfo(int id, int? newType, string newName, bool? forAdmin, int? groupId)
        {
            if (IsMainModer(forAdmin))
            {
                var user = context.Users.Find(id);
                var group = context.Groups.Find(groupId);

                if (user is null ||
                    (string.IsNullOrWhiteSpace(newName) && group is null) ||
                    (context.GetGroupRole(group, user)?.Role ?? UserRole.User) >= role.Role)
                    return false;

                if (!string.IsNullOrWhiteSpace(newName))
                    user.Name = newName;

                if (newType.HasValue &&
                    newType.Value >= 0 &&
                    newType.Value < 5 &&
                    newType <= (int)role.Role)
                    context.SetRole(group, user, (UserRole)newType);

                context.SaveChanges();
                return true;
            }

            var groupRole = context.GroupsRoles.Include(t => t.User)
                                .FirstOrDefault(t => t.User.Id == id && t.Group == role.Group);

            if (groupRole is null || groupRole.Role >= role.Role || newType > (int)role.Role)
                return false;


            if (!string.IsNullOrWhiteSpace(newName))
                groupRole.User.Name = newName;
            if (newType.HasValue && newType.Value >= 0 && newType.Value < 5)
                groupRole.Role = (UserRole)newType.Value;

            context.SaveChanges();


            return true;
        }

        public bool RemoveRole(int id)
        {
            var groupRole = context.GroupsRoles.Find(id);

            if (groupRole is null && groupRole.Role >= role.Role)
                return false;

            context.Remove(groupRole);
            context.SaveChanges();
            return true;
        }

        public async Task<int> CreateFromToken(string groupName, string token)
        {
            var vk = new VkApi();
            await vk.AuthorizeAsync(new ApiAuthParams
            {
                AccessToken = token
            });

            if (!vk.IsAuthorized)
                return 0;

            var groups = await vk.Groups.GetByIdAsync(null, groupName, VkNet.Enums.Filters.GroupsFields.All);

            if (groups.Count == 0)
                return 0;

            var group = groups.First();

            if (context.Groups.FirstOrDefault(t => t.GroupId == group.Id) != null)
                return 0;

            var code = await vk.Groups.GetCallbackConfirmationCodeAsync((ulong)group.Id);
            context.Groups.Add(new Data.Group()
            {
                Name = group.Name,
                Token = token,
                GroupId = group.Id,
                Configuration = new Config
                {
                    Enabled = true,
                    FilterPattern = "[Уу]частвую",
                    Keyboard = false,
                    WithFilter = true
                },
                Key = code,
                BuildNumber = "NotSet",
                Secret = null
            });
            await context.SaveChangesAsync();

            foreach (var serverCallback in await vk.Groups.GetCallbackServersAsync((ulong)group.Id, null))
                if (serverCallback.Title == "QuoteBot")
                    await vk.Groups.DeleteCallbackServerAsync((ulong)group.Id, (ulong)serverCallback.Id);

            var server = await vk.Groups.AddCallbackServerAsync((ulong)group.Id,
                @"https://vds.nexagon.ru/vk/api",
                "QuoteBot");

            var version = new VkNet.Infrastructure.VkApiVersionManager();
            version.SetVersion(5, 103);



            await vk.Groups.SetCallbackSettingsAsync(new VkNet.Model.RequestParams.CallbackServerParams
            {
                ApiVersion = version,
                GroupId = (ulong)group.Id,
                ServerId = server,
                CallbackSettings = new CallbackSettings()
                {
                    MessageNew = true,
                    WallReplyNew = true,
                    WallPostNew = true,
                    WallReplyDelete = true,

                }
            });

            return context.Groups.FirstOrDefault(t => t.GroupId == group.Id)?.Id ?? 0;
        }

        [Authorize(Policy = "GroupModer")]
        public bool EditPostInfo(int id, int? newMax, string newName)
        {
            var post = context.GetPosts(role.Group).SingleOrDefault(t => t.Id == id);

            if (post is null)
                return false;

            if (newMax.HasValue && newMax.Value > 0 && newMax.Value < 201)
                post.Max = newMax.Value;

            if (!string.IsNullOrWhiteSpace(newName))
                post.Text = newName;


            context.SaveChanges();

            return true;
        }

        [Authorize(Policy = "GroupModer")]
        public bool SwitchQuoteVal(int id, bool? forAdmin)
        {

            var quote = context.Quotes.SingleOrDefault(t => (IsMainModer(forAdmin) || t.Post.Group == role.Group) && t.Id == id);

            if (quote is null)
                return false;

            quote.IsOut = !quote.IsOut;
            context.SaveChanges();

            return true;
        }

        [Authorize(Policy = "GroupModer")]
        public bool SwitchVerificationVal(int id, bool? forAdmin)
        {

            var reportItem = context.ReportItems
                .Include(t => t.Report)
                .SingleOrDefault(t => (IsMainModer(forAdmin) || t.Report.Group == role.Group) && t.Id == id);

            if (reportItem is null || reportItem.Report.Closed)
                return false;

            reportItem.Verified = !reportItem.Verified;
            context.SaveChanges();

            return true;
        }

        [Authorize(Policy = "GroupAdmin")]
        public bool UpdateGroup(GroupInfoType inputGroup, int? id, bool? newGroup, bool? forAdmin)
        {
            var nGroup = newGroup.HasValue && newGroup.Value;
            var group = role.Group;

            if (!nGroup && id.HasValue && IsMainModer(forAdmin))
                group = context.Groups.Find(id.Value);

            if (nGroup && IsMainModer(forAdmin))
                group = new Data.Group { Configuration = new Config() };

            if (inputGroup is null)
                return false;

            if (!string.IsNullOrWhiteSpace(inputGroup.BuildNumber))
                group.BuildNumber = inputGroup.BuildNumber;

            if (nGroup && inputGroup.GroupId != null)
                group.GroupId = inputGroup.GroupId.Value;

            if (!string.IsNullOrWhiteSpace(inputGroup.Token))
                group.Token = inputGroup.Token;

            if (!string.IsNullOrWhiteSpace(inputGroup.Key))
                group.Key = inputGroup.Key;

            if (inputGroup.Secret != null)
                group.Secret = inputGroup.Secret == "" ? null : inputGroup.Secret;

            if (inputGroup.Keyboard.HasValue)
                group.Configuration.Keyboard = inputGroup.Keyboard.Value;

            if (inputGroup.Enabled.HasValue)
                group.Configuration.Enabled = inputGroup.Enabled.Value;

            if (inputGroup.WithQrCode.HasValue)
                group.Configuration.WithQrCode = inputGroup.WithQrCode.Value;

            if (inputGroup.WithFilter.HasValue)
                group.Configuration.WithFilter = inputGroup.WithFilter.Value;

            if (inputGroup.FilterPattern != null)
                group.Configuration.FilterPattern = inputGroup.FilterPattern;


            group.Configuration = group.Configuration;

            if (inputGroup.Name != null)
                group.Name = inputGroup.Name;

            if (nGroup)
                context.Add(group);

            context.SaveChanges();

            return true;
        }

        [Authorize(Policy = "GroupModer")]
        public int NotifyUsers(int postId, IEnumerable<int> quotesId)
        {

            var post = context.Posts.Include(t => t.BindTo).SingleOrDefault(t => t.Id == postId);
            if (post is null || post.BindTo is Post)
                return 0;

            var report = context.CreateReport(role.Group, post);
            var reportQuotes = context.GetReportItems(report).Include(t => t.FromQuote.User);
            var quotes = context
                .GetQuotes(post)
                .Include(t => t.User)
                .Where(t => quotesId.Contains(t.Id))
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

                    if (!api.IsAuthorized)
                        return 0;

                    var prms = new VkNet.Model.RequestParams.MessagesSendParams
                    {
                        RandomId = (int)DateTimeOffset.Now.ToUnixTimeMilliseconds(),
                        UserIds = gr.Select(t => t.VkId),
                        Message = "Ты участвуешь!",
                        Attachments = new List<MessagePost> { new MessagePost(post) }
                    };

                    var sendResults = api.Messages.SendToUserIds(prms);

                    foreach (var res in sendResults)
                        if (!res.MessageId.HasValue)
                            quotesForReports.RemoveAll(t => res.PeerId == t.User.Id);
                }
                catch
                {
                }

            context.AddReportItems(report, quotesForReports);

            return quotesForReports.Count;
        }

        [Authorize(Policy = "GroupModer")]
        public int AddUsersToPost(IEnumerable<int> usersIds, int postId)
        {

            var post = context.GetPosts(role.Group).SingleOrDefault(t => t.Id == postId);
            if (post is null)
                return -1;

            var usersInPost = context.GetQuotes(post).Select(t => t.User);

            var users = context.GetUsers(role.Group).Where(t => !usersInPost.Contains(t) && usersIds.Contains(t.Id));

            var count = users.Count();
            if (count == 0)
                return 0;

            context.AddRange(users.Select(t => new Quote
            {
                CommentId = -1,
                Post = post,
                User = t,
                Time = DateTime.Now
            }));

            context.SaveChanges();

            return count;
        }

        [Authorize(Policy = "GroupModer")]
        public bool SendUsers(IEnumerable<int> usersIds, string message, bool? forAdmin)
        {
            var result = true;

            var users = context.Users
                               .Include(t => t.House)
                               .Where(t => usersIds.Contains(t.Id) && (IsMainModer(forAdmin) || t.House == role.Group))
                               .AsEnumerable().GroupBy(t => t.House);

            foreach (var gr in users)
            {
                var api = new VkApi();
                api.Authorize(new ApiAuthParams() { AccessToken = gr.Key.Token });

                if (!api.IsAuthorized)
                    return false;

                try
                {
                    var prms = new VkNet.Model.RequestParams.MessagesSendParams
                    {
                        RandomId = (int)DateTimeOffset.Now.ToUnixTimeMilliseconds(),
                        UserIds = gr.Select(t => t.VkId),
                        Message = message,
                    };

                    api.Messages.SendToUserIds(prms);
                }
                catch
                {
                    result = false;
                }
            }

            return result;
        }

        [Authorize(Policy = "GroupModer")]
        public int CreateReport(int postId, List<int> quoteIds)
        {
            var post = context.Posts
                .Include(t => t.Quotes)
                .FirstOrDefault(t => t.Id == postId && t.Group == role.Group);

            if (post == null)
                return 0;

            //var quotes = post.Quotes.Where(t => quoteIds.Contains(t.Id));
            return context.CreateReport(role.Group, post)?.Id ?? 0;
        }

        [Authorize(Policy = "GroupModer")]
        public bool CloseReport(int id, bool? forAdmin)
        {
            var report = context.Reports.Include(t => t.FromPost).SingleOrDefault(t => (IsMainModer(forAdmin) || t.Group == role.Group) && t.Id == id);

            if (report is null)
                return false;

            report.FromPost.Deleted = true;
            report.Closed = true;
            context.SaveChanges();

            return true;
        }

        public bool DeletePost(int id, bool? forAdmin)
        {
            var post = context.GetPosts(role.Group).SingleOrDefault(t => t.Id == id);

            if (post is null)
                return false;

            post.Deleted = true;
            context.SaveChanges();

            return true;
        }

        public UserType ConfirmQrCode(string eReport, string eReportItem)
        {

            var reportId =  Methods.DecryptCodeString(eReport);
            var reportItemId = Methods.DecryptCodeString(eReportItem);

            if (reportId == 0 || reportItemId == 0)
                return null;

            var reportItem = context.ReportItems
                .Include(t => t.User)
                .FirstOrDefault(t => t.Report.Id == reportId && !t.Report.Closed && t.Id == reportItemId);

            if (reportItem == null)
                return null;

            reportItem.Verified = true;
            context.SaveChanges();

            return reportItem.User.ToUserType(UserRole.User);
        }

        [Authorize(Policy = "GroupModer")]
        public async Task<bool> SendQrCode(int id, bool? forAdmin)
        {
            if (!role.Group.Configuration.WithQrCode)
                return false;

            //logger.LogInformation("Mutation: SendQrCode");

            var report = context.Reports.SingleOrDefault(t => (IsMainModer(forAdmin) || t.Group == role.Group) && t.Id == id);

            if (report == null)
                return false;

            //logger.LogInformation($"Report: {id}");

            var groups = context.GetReportItems(report)
                .Include(t => t.User.House)
                .AsEnumerable()
                .GroupBy(t => t.User.House);

            //logger.LogInformation($"Count: {groups.Sum(t => t.Count())}");

            var coder = new QRCoder.PngByteQRCode();
            QRCoder.QRCodeGenerator qrGenerator = new QRCoder.QRCodeGenerator();

            foreach (var gr in groups)
            {
                var api = new VkApi();
                api.Authorize(new ApiAuthParams() { AccessToken = gr.Key.Token });

                if (!api.IsAuthorized)
                    return false;

                foreach (var item in gr)
                    try
                    {
                        //var data = Convert.ToBase64String()

                        coder.SetQRCodeData(
                            qrGenerator.CreateQrCode(Methods.EncryptCodeString(item.Id), QRCoder.QRCodeGenerator.ECCLevel.Q));

                        byte[] picture = coder.GetGraphic(40);
                        File.WriteAllBytes("img.png", picture);

                        var uploadServer = await api.Photo.GetMessagesUploadServerAsync(item.User.VkId);

                        var response = await (await uploadServer.UploadUrl.PostMultipartAsync(t =>
                        {
                            t.AddFile("photo", new MemoryStream(picture), "qrcode.png", "img/png");
                        })).GetStringAsync();

                        var photo = api.Photo.SaveMessagesPhoto(response);

                        api.Messages.Send(new VkNet.Model.RequestParams.MessagesSendParams
                        {
                            RandomId = (int)DateTimeOffset.Now.ToUnixTimeMilliseconds(),
                            PeerId = item.User.VkId,
                            Message = "Предъяви при входе",
                            Attachments = photo
                        });
                    }
                    catch (Exception ex)
                    {
                        //logger.LogError(ex, "Error");
                    }
            }

            return true;
        }
    }

    public class MessagePost : VkNet.Model.Attachments.MediaAttachment
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