using HotChocolate;
using HotChocolate.AspNetCore.Authorization;
using HotChocolate.Types;
using HotChocolate.Types.Relay;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using DatabaseContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Security.Claims;
using System.Security.Principal;
using System.Text.Json;
using System.Threading.Tasks;
using VkNet.Utils;
using Flurl.Http;
using Serilog;

namespace QuotePanel.QraphQL
{
    public class QueryType : QueryBase
    {
        public QueryType([Service] IHttpContextAccessor httpContext, 
            [Service] DataContext context, 
            [Service] ILogger logger)
            : base(httpContext, context, logger)
        {
            
        }

        [Authorize(Policy = "GroupModer")]
        public StatType GetStat(bool? forAdmin, int? groupId)
        {
            if (Role.IsMainModer(forAdmin) && groupId.HasValue)
            {
                Role.Group = DbContext.Groups.Find(groupId.Value);

                if (groupId == null)
                    return null;
            }

            var quotes = DbContext.Quotes.Include(t => t.Post.Group)
                                    .Where(t => t.Post.Group == Role.Group)
                                    .GroupBy(t => t.Time.Date)
                                    .OrderBy(t => t.Key)
                                    .Select(t => new StatQuoteType
                                    {
                                        Date = t.Key.ToShortDateString(),
                                        Count = t.Count()
                                    }).ToList();

            var floor = DbContext.GetUsers(Role.Group)
                                    .GroupBy(t => t.Room / 100)
                                    .OrderBy(t => t.Key)
                                    .Select((t) => new StatFloorType { Floor = t.Key, Count = t.Count() })
                                    .ToList();

            return new StatType
            {
                StatFloor = floor,
                StatQuotes = quotes
            };
        }

        [Authorize(Policy = "GroupModer")]
        public UserType GetProfile()
            => Role.User.ToUserType(Role.Role);

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        public IQueryable<UserType> GetUsers(bool? forAdmin)
        {
            if (Role.IsMainModer(forAdmin))
            {
                var users = DbContext.Users;

                return users.Include(t => t.House)
                            .Select(t => t.ToUserType(UserRole.User, t.Id, t.House));
            }
            else
            {
                var roles = DbContext.GetGroupRoles(Role.Group);

                return roles.Include(t => t.User.House)
                            .Select(t => t.User.ToUserType(t.Role, t.User.Id, null));
            }
        }

        [Authorize(Policy = "Moder")]
        public IQueryable<RoleType> GetUserRoles(int id)
            => DbContext.GroupsRoles.Include(t => t.Group).Where(t => t.User.Id == id).Select(t =>
            new RoleType
            {
                Id = t.Id,
                BuildNumber = t.Group.BuildNumber,
                Name = t.Group.Name,
                Role = (int)t.Role
            });

        [Authorize(Policy = "GroupModer")]
        public UserType GetUser(int id, bool? forAdmin)
        {
            if (Role.IsMainModer(forAdmin))
                return DbContext.GetUser(id).ToUserType(UserRole.User);


            var groupRole = DbContext.GroupsRoles.Include(t => t.User)
                                .FirstOrDefault(t => t.User.Id == id && t.Group == Role.Group);

            if (groupRole is null)
                return null;

            return groupRole.User.ToUserType(groupRole.Role);
        }

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        public IQueryable<QuoteType> GetQoutes()
        {
            return DbContext.Quotes.Where(t => t.Post.Group == Role.Group).Select(t =>
                t.ToQuoteType(t.Post, t.User, DbContext.GetGroupRole(t.Post.Group, t.User).Role));
        }

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        public IQueryable<QuoteType> GetQoutesByPost(int id)
        {
            return DbContext.Quotes.Where(t => t.Post.Group == Role.Group && t.Post.Id == id)
                .OrderBy(t => t.Time)
                .Select(t =>
                t.ToQuoteType(t.Post, t.User, UserRole.User));
        }

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        public IQueryable<QuoteType> GetQoutesByUser(int id, bool? forAdmin)
        {
            return DbContext.Quotes.Where(t => (Role.IsMainModer(forAdmin) || t.Post.Group == Role.Group) && t.User.Id == id)
                .OrderBy(t => t.Time)
                .Select(t =>
                t.ToQuoteType(t.Post, t.User, UserRole.User));
        }

        [Authorize(Policy = "GroupModer")]
        public PostType GetPost(int id)
        {
            var post = DbContext.GetPosts(Role.Group).Include(t => t.BindTo).SingleOrDefault(t => t.Id == id);

            if (post is null)
                return null;

            return new PostType
            {
                Id = post.Id,
                Text = post.Text,
                Deleted = post.Deleted,
                Max = post.Max,
                IsRepost = post.BindTo != null
            };
        }

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        public IQueryable<PostType> GetPosts()
        {

            return DbContext.GetPosts(Role.Group)
                .Include(t => t.BindTo)
                .OrderByDescending(t => t.Time)
                .Select(t => new PostType
                {
                    Id = t.Id,
                    Text = t.Text,
                    Deleted = t.Deleted,
                    Max = t.Max,
                    IsRepost = t.BindTo != null
                });
        }

        [Authorize(Policy = "Moder")]
        [UsePaging]
        public IQueryable<GroupInfoType> GetGroups()
            => DbContext.Groups.Select(t => new GroupInfoType
            {
                Id = t.Id,
                Enabled = t.Configuration.Enabled,
                WithFilter = t.Configuration.WithFilter,
                Keyboard = t.Configuration.Keyboard,
                FilterPattern = t.Configuration.FilterPattern,
                GroupId = t.GroupId,
                Name = t.Name,
                Key = t.Key,
                Secret = t.Secret,
                Token = t.Token,
                BuildNumber = t.BuildNumber
            });

        public async Task<GroupResponseType> AuthGroups(string code, string redirectUri)
        {
            var request = $"https://oauth.vk.com/access_token?client_id=7423484&client_secret=5V7WqNVjpI8LqlyBhvLn&redirect_uri={WebUtility.UrlDecode(redirectUri)}&code={code}&v=5.130";
            var responseString = await request.GetStringAsync();
            var response = JsonSerializer.Deserialize<JsonElement>(responseString);
            JsonElement tokenProp = new JsonElement();
            JsonElement idProp = new JsonElement();

            if (!response.TryGetProperty("access_token", out tokenProp) ||
                !response.TryGetProperty("user_id", out idProp))
                return null;

            var groups = DbContext.GetGroupRoles(idProp.GetInt64()).Include(t => t.Group);

            return new GroupResponseType
            {
                Groups = groups.Select(t => new GroupType
                {
                    Id = t.Group.GroupId,
                    Name = t.Group.Name,
                    Role = (int)t.Role
                }),
                Token = Methods.CreateToken(new List<Claim>
                {
                    new Claim("VkToken", tokenProp.GetString()),
                    new Claim("Status", "NotLogged")
                }, "NotLogin")
            };
        }

        [Authorize(Policy = "NotLogged")]
        public string Token([Service] IHttpContextAccessor httpContext, [Service] DataContext context, long groupId)
        {
            VkNet.VkApi api = new VkNet.VkApi();
            api.Authorize(new VkNet.Model.ApiAuthParams
            {
                AccessToken = httpContext.HttpContext.User.Claims.First(t => t.Type == "VkToken").Value,

            });
            if (api.IsAuthorized)
            {
                var info = (api.Users.Get(new List<long>(), VkNet.Enums.Filters.ProfileFields.Photo100)).First();

                var groupRole = context.GroupsRoles.Include(t => t.User).Include(t => t.Group).SingleOrDefault(t => t.Group.GroupId == groupId && t.User.VkId == info.Id);

                if (groupRole is null)
                    return "";

                return Methods.CreateToken(new List<Claim>
                                {
                                    new Claim("Status", "Logged"),
                                    new Claim("RoleId", groupRole.Id.ToString()),
                                    new Claim("Role", groupRole.Role.ToString())
                                }, "Login");
            }
            return "";
        }

        [Authorize(Policy = "GroupModer")]
        public GroupInfoType GetGroupInfo(int? id, bool? forAdmin, bool? newGroup)
        {
            if (id.HasValue && Role.IsMainModer(forAdmin))
                Role.Group = DbContext.Groups.Find(id.Value);

            if (newGroup.HasValue && newGroup.Value)
                return null;

            if (Role.Group is null)
                return null;

            return new GroupInfoType
            {
                Id = Role.Group.Id,
                Token = Role.Group.Token,
                GroupId = Role.Group.GroupId,
                Key = Role.Group.Key,
                Secret = Role.Group.Secret,
                Keyboard = Role.Group.Configuration.Keyboard,
                Enabled = Role.Group.Configuration.Enabled,
                WithFilter = Role.Group.Configuration.WithFilter,
                Name = Role.Group.Name,
                BuildNumber = Role.Group.BuildNumber,
                FilterPattern = Role.Group.Configuration.FilterPattern,
                WithQrCode = Role.Group.Configuration.WithQrCode
            };
        }

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        public IQueryable<ReportType> GetReports()
            => DbContext.GetReports(Role.Group)
                .OrderByDescending(t => t.Id)
                .Select(t => t.ToReportType());

        [Authorize(Policy = "GroupModer")]
        public ReportType GetReport(int id)
            => DbContext.GetReport(Role.Group, id)?.ToReportType() ?? null;

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        public IQueryable<ReportItemType> GetReportItems(int id)
        {
            var report = DbContext.GetReport(Role.Group, id);

            if (report == null)
                return null;

            return DbContext.GetReportItems(report).Select(t => t.ToReportItemType(null));
        }

        [Authorize(Policy = "GroupModer")]
        public string GetReportCode(int id)
        {
            var report = DbContext.GetReport(Role.Group, id);

            if (report == null)
                return null;

            return Methods.EncryptCodeString(id);
        }


        [Authorize(Policy = "Admin")]
        public string GetLifetimeToken()
        {
            var expires = DateTime.Now.AddYears(10);
            return Methods.CreateToken(new List<Claim>
                                {
                                    new Claim("Status", "Logged"),
                                    new Claim("RoleId", Role.Id.ToString()),
                                    new Claim("Role", Role.Role.ToString())
                                },
                                "Login",
                                expires
                                );
        }


        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        public IQueryable<QuotePointType> GetQuotePoints()
            => DbContext.GetQuotePoints(Role.Group)
                .Select(t => t.ToQuotePointType());

        [Authorize(Policy = "GroupModer")]
        public QuotePointType GetQuotePoint(int id)
            => DbContext.GetQuotePoint(Role.Group, id)?.ToQuotePointType();


        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        public IQueryable<QuotePointItemType> GetQuotePointItems(int reportId)
            => DbContext.GetQuotePointItems(DbContext.GetQuotePoint(Role.Group, reportId))
            .Select(t => t.ToQuotePointItemType());


        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        public IQueryable<ScheludedTaskType> GetTasks()
            => DbContext.ScheludedTasks
                .Include(t => t.Group)
                .Include(t => t.Creator.User)
                .Include(t => t.Creator.Group)
                .Where(t => t.Group == Role.Group)
                .OrderByDescending(t => t.StartTime)
                .Select(t => t.ToTaskType());


        [Authorize(Policy = "GroupModer")]
        public ScheludedTaskType GetTask(int id)
            => DbContext.ScheludedTasks
                .Include(t => t.Group)
                .Include(t => t.Creator.User)
                .Include(t => t.Creator.Group)
                .FirstOrDefault(t => t.Group == Role.Group && t.Id == id)
                ?.ToTaskType() ?? null;


        [Authorize(Policy = "User")]
        public UserInfoType GetUserInfo()
            => new UserInfoType
            {
                Quotes = DbContext.GetQuotes(Role.User)
                    .Include(t => t.Post)
                    .Select(t => t.ToQuoteType(t.Post, Role.User, Role.Role)).ToList(),
                ReportItems = DbContext.GetReportItems(Role)
                    .Include(t => t.Report.FromPost)
                    .Select(t => t.ToReportItemType(t.Report)).ToList()
            };
    }
}
