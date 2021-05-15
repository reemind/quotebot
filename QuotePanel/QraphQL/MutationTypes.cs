using HotChocolate;
using HotChocolate.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using DatabaseContext;
using Data = DatabaseContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VkNet;
using VkNet.Model;
using System.IO;
using Flurl.Http;
using System.Text.Json;
using Newtonsoft.Json;
using Serilog;

namespace QuotePanel.QraphQL
{

    public class MutationType : QueryBase
    {

        public MutationType([Service] IHttpContextAccessor httpContext,
            [Service] DataContext context, ILogger logger)
            : base(httpContext, context, logger)
        {
            
        }

        [Authorize(Policy = "GroupModer")]
        public async Task<bool> EditUserInfo(int id, int? newType, string newName, bool? forAdmin, int? groupId)
        {
            if (Role.IsMainModer(forAdmin))
            {
                var user = await DbContext.Users.FindAsync(id);
                var group = await DbContext.Groups.FindAsync(groupId);

                if (user is null ||
                    (string.IsNullOrWhiteSpace(newName) && group is null) ||
                    (DbContext.GetGroupRole(group, user)?.Role ?? UserRole.User) >= Role.Role)
                    return false;

                if (!string.IsNullOrWhiteSpace(newName))
                    user.Name = newName;

                if (newType.HasValue &&
                    newType.Value >= 0 &&
                    newType.Value < 5 &&
                    newType <= (int)Role.Role)
                    DbContext.SetRole(group, user, (UserRole)newType);

                await DbContext.SaveChangesAsync();
                return true;
            }

            var groupRole = DbContext.GroupsRoles.Include(t => t.User)
                                .FirstOrDefault(t => t.User.Id == id && t.Group == Role.Group);

            if (groupRole is null || groupRole.Role >= Role.Role || newType > (int)Role.Role)
                return false;


            if (!string.IsNullOrWhiteSpace(newName))
                groupRole.User.Name = newName;
            if (newType.HasValue && newType.Value >= 0 && newType.Value < 5)
                groupRole.Role = (UserRole)newType.Value;

            await DbContext.SaveChangesAsync();


            return true;
        }

        public bool RemoveRole(int id)
        {
            var groupRole = DbContext.GroupsRoles.Find(id);

            if (groupRole is null && groupRole.Role >= Role.Role)
                return false;

            DbContext.Remove(groupRole);
            DbContext.SaveChanges();
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

            if (DbContext.Groups.FirstOrDefault(t => t.GroupId == group.Id) != null)
                return 0;

            var code = await vk.Groups.GetCallbackConfirmationCodeAsync((ulong)group.Id);
            DbContext.Groups.Add(new Data.Group()
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
            await DbContext.SaveChangesAsync();

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

            return DbContext.Groups.FirstOrDefault(t => t.GroupId == group.Id)?.Id ?? 0;
        }

        [Authorize(Policy = "GroupModer")]
        public async Task<bool> EditPostInfo(int id, int? newMax, string newName)
        {
            var post = DbContext.GetPosts(Role.Group).SingleOrDefault(t => t.Id == id);

            if (post is null)
                return false;

            if (newMax.HasValue && newMax.Value > 0 && newMax.Value < 201)
                post.Max = newMax.Value;

            if (!string.IsNullOrWhiteSpace(newName))
                post.Text = newName;


            await DbContext.SaveChangesAsync();

            return true;
        }

        [Authorize(Policy = "GroupModer")]
        public async Task<bool> SwitchQuoteVal(int id, bool? forAdmin)
        {

            var quote = DbContext.Quotes.SingleOrDefault(t => (Role.IsMainModer(forAdmin) || t.Post.Group == Role.Group) && t.Id == id);

            if (quote is null)
                return false;

            quote.IsOut = !quote.IsOut;
            await DbContext.SaveChangesAsync();

            return true;
        }

        [Authorize(Policy = "GroupModer")]
        public async Task<bool> SwitchVerificationVal(int id, bool? forAdmin)
        {

            var reportItem = DbContext.ReportItems
                .Include(t => t.Report)
                .SingleOrDefault(t => (Role.IsMainModer(forAdmin) || t.Report.Group == Role.Group) && t.Id == id);

            if (reportItem is null || reportItem.Report.Closed)
                return false;

            reportItem.Verified = !reportItem.Verified;
            await DbContext.SaveChangesAsync();

            return true;
        }

        [Authorize(Policy = "GroupAdmin")]
        public async Task<bool> UpdateGroup(GroupInfoType inputGroup, int? id, bool? newGroup, bool? forAdmin)
        {
            var nGroup = newGroup.HasValue && newGroup.Value;
            var group = Role.Group;

            if (!nGroup && id.HasValue && Role.IsMainModer(forAdmin))
                group = DbContext.Groups.Find(id.Value);

            if (nGroup && Role.IsMainModer(forAdmin))
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
                DbContext.Add(group);

            await DbContext.SaveChangesAsync();

            return true;
        }

        [Authorize(Policy = "GroupModer")]
        public async Task<int> NotifyUsers(int postId, IEnumerable<int> quotesId)
        {
            var post = DbContext.Posts.Include(t => t.Group).Include(t => t.BindTo).SingleOrDefault(t => t.Id == postId);
            if (post is null || post.BindTo is Data.Post)
                return 0;

            var report = DbContext.CreateReport(post.Group, post);
            var reportQuotes = DbContext.GetReportItems(report).Include(t => t.FromQuote.User);
            var quotes = DbContext
                .GetQuotes(post)
                .Include(t => t.User)
                .Where(t => quotesId.Contains(t.Id))
                .Except(reportQuotes.Select(t => t.FromQuote));

            return await InteractionMethods.Interactions.NotifyAsync(DbContext, post, quotes, report);
        }

        [Authorize(Policy = "GroupModer")]
        public async Task<int> AddUsersToPost(IEnumerable<int> usersIds, int postId)
        {

            var post = DbContext.GetPosts(Role.Group).SingleOrDefault(t => t.Id == postId);
            if (post is null)
                return -1;

            var usersInPost = DbContext.GetQuotes(post).Select(t => t.User);

            var users = DbContext.GetUsers(Role.Group).Where(t => !usersInPost.Contains(t) && usersIds.Contains(t.Id));

            var count = users.Count();
            if (count == 0)
                return 0;

            DbContext.AddRange(users.Select(t => new Quote
            {
                CommentId = -1,
                Post = post,
                User = t,
                Time = DateTime.Now
            }));

            await DbContext.SaveChangesAsync();

            return count;
        }

        [Authorize(Policy = "GroupModer")]
        public async Task<bool> SendUsers(IEnumerable<int> usersIds, string message, bool? forAdmin)
        {
            var users = DbContext.GroupsRoles
                               .Include(t => t.User.House)
                               .Include(t => t.Group)
                               .Where(t => usersIds.Contains(t.User.Id) && (Role.IsMainModer(forAdmin) || t.Group == Role.Group))
                               .AsEnumerable().Select(t => t.User).GroupBy(t => t.House);

            return await InteractionMethods.Interactions.SendAsync(DbContext, users, message);
        }

        [Authorize(Policy = "GroupModer")]
        public int CreateReport(int postId, List<int> quoteIds)
        {
            var post = DbContext.Posts
                .Include(t => t.Quotes)
                .FirstOrDefault(t => t.Id == postId && t.Group == Role.Group);

            if (post == null)
                return 0;

            //var quotes = post.Quotes.Where(t => quoteIds.Contains(t.Id));
            return DbContext.CreateReport(Role.Group, post)?.Id ?? 0;
        }

        [Authorize(Policy = "GroupModer")]
        public async Task<bool> CloseReport(int id, bool? forAdmin)
        {
            var report = DbContext.Reports.Include(t => t.FromPost).SingleOrDefault(t => (Role.IsMainModer(forAdmin) || t.Group == Role.Group) && t.Id == id);

            return await InteractionMethods.Interactions.CloseReportAsync(DbContext, report);
        }

        [Authorize(Policy = "GroupModer")]
        public async Task<bool> DeletePost(int id, bool? forAdmin)
        {
            var post = DbContext.GetPosts(Role.Group).SingleOrDefault(t => t.Id == id);

            if (post is null)
                return false;

            post.Deleted = true;
            await DbContext.SaveChangesAsync();

            return true;
        }

        public async Task<UserType> ConfirmQrCode(string eReport, string eReportItem)
        {
            var reportId =  Methods.DecryptCodeString(eReport);
            var reportItemId = Methods.DecryptCodeString(eReportItem);

            if (reportId == 0 || reportItemId == 0)
                return null;

            var reportItem = DbContext.ReportItems
                .Include(t => t.User)
                .FirstOrDefault(t => t.Report.Id == reportId && !t.Report.Closed && t.Id == reportItemId);

            if (reportItem == null)
                return null;

            reportItem.Verified = true;
            await DbContext.SaveChangesAsync();

            return reportItem.User.ToUserType(UserRole.User);
        }

        [Authorize(Policy = "GroupModer")]
        public async Task<bool> SendQrCode(int id, bool? forAdmin)
        {
            if (!Role.Group.Configuration.WithQrCode)
                return false;

            //logger.LogInformation("Mutation: SendQrCode");

            var report = DbContext.Reports.SingleOrDefault(t => (Role.IsMainModer(forAdmin) || t.Group == Role.Group) && t.Id == id);

            if (report == null)
                return false;

            //logger.LogInformation($"Report: {id}");

            var groups = DbContext.GetReportItems(report)
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
                        coder.SetQRCodeData(
                            qrGenerator.CreateQrCode(Methods.EncryptCodeString(item.Id), QRCoder.QRCodeGenerator.ECCLevel.Q));

                        var picture = new MemoryStream(coder.GetGraphic(40));

                        var uploadServer = await api.Photo.GetMessagesUploadServerAsync(item.User.VkId);

                        var response = await (await uploadServer.UploadUrl.PostMultipartAsync(t =>
                        {
                            t.AddFile("photo", picture, "qrcode.png", "img/png");
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

        [Authorize(Policy = "GroupModer")]
        public async Task<bool> CreateQuotePoint(int reportId, double point)
        {
            var report = DbContext.GetReport(Role.Group, reportId);

            if (report == null)
                return false;

            var quotePoint = new QuotePoint
            {
                Group = Role.Group,
                Name = report.Name,
                Report = report
            };

            var items = DbContext.GetReportItems(report).Select(t => new QuotePointItem
            {
                Point = t.Verified ? point : -point,
                User = t.User,
                Comment = "",
                QuotePoint = quotePoint
            });

            DbContext.QuotePoints.Add(quotePoint);
            DbContext.QuotePointsItems.AddRange(items);

            await DbContext.SaveChangesAsync();

            return true;
        }

        [Authorize(Policy = "GroupModer")]
        public async Task<bool> ChangePoints(int quotePointId, Dictionary<int, double> keyValuePairs)
        {
            var quotePoint = DbContext.GetQuotePoint(Role.Group, quotePointId);

            if (quotePoint == null)
                return false;

            var items = DbContext.GetQuotePointItems(quotePoint)
                .AsEnumerable()
                .Where(t => keyValuePairs.ContainsKey(t.Id));

            foreach (var item in items)
                item.Point = keyValuePairs[item.Id];

            await DbContext.SaveChangesAsync();

            return true;
        }

        [Authorize(Policy = "GroupModer")]
        public async Task<bool> CreateTask(string startTime, int type, string dataJson, int? id)
        {
            var startTimeDateTime = new DateTime();

            var taskType = (TaskType)type;

            if (!DateTime.TryParse(startTime, out startTimeDateTime))
                return false;

            if (startTimeDateTime <= DateTime.UtcNow)
                return false;

            string dataString = "";

            if (taskType == TaskType.Notify)
            {
                var data = JsonConvert.DeserializeObject<Background.NotifyTaskData>(dataJson);

                var post = DbContext.Posts.Include(t => t.Group)
                    .FirstOrDefault(t => t.Id == data.PostId && t.Group == Role.Group);

                if (post == null)
                    return false;

                dataString = JsonConvert.SerializeObject(data);

            }
            else if (taskType == TaskType.CloseReport)
            {
                var data = JsonConvert.DeserializeObject<Background.CloseTaskData>(dataJson);

                var report = DbContext.Reports.Include(t => t.Group)
                    .FirstOrDefault(t => t.Id == data.ReportId && t.Group == Role.Group);

                if (report == null || report.Closed)
                    return false;

                dataString = JsonConvert.SerializeObject(data);


            }
            else if (taskType == TaskType.Send)
            {
                var data = JsonConvert.DeserializeObject<Background.SendTaskData>(dataJson);

                var users = DbContext.GroupsRoles
                               .Include(t => t.User)
                               .Include(t => t.User.House)
                               .Include(t => t.Group)
                               .Where(t => data.UserIds.Contains(t.User.Id) && t.Group == Role.Group)
                               .AsEnumerable().Select(t => t.User.Id);

                data.UserIds = users.ToList();

                dataString = JsonConvert.SerializeObject(data);
            }
            else
                return false;

            ScheludedTask currentTask;

            if(id.HasValue && (currentTask = DbContext.ScheludedTasks.Find(id.Value)) != null)
            {
                currentTask.Success = false;
                currentTask.StartTime = startTimeDateTime;
                currentTask.TaskType = taskType;
                currentTask.Comment = "";
                currentTask.Completed = false;
                currentTask.Creator = Role;
                currentTask.Data = dataString;
            }
            else
                DbContext.ScheludedTasks.Add(new ScheludedTask
                {
                    Data = dataString,
                    StartTime = startTimeDateTime,
                    Creator = Role,
                    TaskType = taskType,
                    Group = Role.Group,
                });

            await DbContext.SaveChangesAsync();
            return true;
        }
    }   
}