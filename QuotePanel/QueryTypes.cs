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

namespace QuotePanel.QueryTypes
{
    public class QueryType
    {
        IHttpContextAccessor httpContext;
        DataContext context;
        Group group;
        UserRole role;

        public QueryType([Service] IHttpContextAccessor httpContext, [Service] DataContext context)
        {
            this.context = context;
            this.httpContext = httpContext;

            if (httpContext.HttpContext.User.HasClaim(t => t.Type == "Role"))
                role = httpContext.HttpContext.User.Claims.First(t => t.Type == "Role").Value switch
                {
                    "User" => UserRole.User,
                    "GroupModer" => UserRole.GroupModer,
                    "GroupAdmin" => UserRole.GroupAdmin,
                    "Moder" => UserRole.Moder,
                    _ => UserRole.Admin
                };

            var claim = httpContext.HttpContext.User.Claims.FirstOrDefault(t => t.Type == "GroupId");

            if (claim is Claim)
                group = context.Groups.SingleOrDefault(t => t.Id == int.Parse(claim.Value));
        }

        [Authorize(Policy = "GroupModer")]
        public StatType GetStat(bool? forAdmin, int? groupId)
        {
            if (IsMainModer(forAdmin) && groupId.HasValue)
            {
                group = context.Groups.Find(groupId.Value);

                if (groupId == null)
                    return null;
            }

            var quotes = context.Quotes.Include(t => t.Post.Group)
                                    .Where(t => t.Post.Group == group)
                                    .GroupBy(t => t.Time.Date)
                                    .OrderBy(t => t.Key)
                                    .Select(t => new StatQuoteType
                                    {
                                        Date = t.Key.ToShortDateString(),
                                        Count = t.Count()
                                    }).ToList();

            var floor = context.GetUsers(group)
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
        {
            var groupId = int.Parse(httpContext.HttpContext.User.Claims.First(t => t.Type == "GroupId").Value);
            var group = context.Groups.Single(t => t.Id == groupId);
            var userId = int.Parse(httpContext.HttpContext.User.Claims.First(t => t.Type == "Id").Value);

            var user = context.Users.Include(t => t.House)
                .Single(t => t.Id == userId);

            return user.ToUserType(context.GetGroupRole(group, user).Role);
        }

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        [UseFiltering]
        [UseSorting]
        public IQueryable<UserType> GetUsers(bool? forAdmin)
        {
            if (IsMainModer(forAdmin))
            {
                var users = context.Users;

                return users.Include(t => t.House)
                            .Select(t => t.ToUserType(UserRole.User, t.Id, t.House));
            }
            else
            {
                var roles = context.GetGroupRoles(group);

                return roles.Include(t => t.User.House)
                            .Select(t => t.User.ToUserType(t.Role, t.User.Id, null));
            }
        }

        [Authorize(Policy = "Moder")]
        public IQueryable<RoleType> GetUserRoles(int id)
            => context.GroupsRoles.Include(t => t.Group).Where(t => t.User.Id == id).Select(t =>
            new RoleType {
            Id = t.Id,
            BuildNumber = t.Group.BuildNumber,
            Name = t.Group.Name,
            Role = (int)t.Role
            });

        bool IsMainModer(bool? forAdmin)
        {
            if (!(forAdmin ?? false))
                return false;

            return (role == UserRole.Moder || role == UserRole.Admin);
        }

        bool IsMainAdmin(bool? forAdmin)
        {
            if (!(forAdmin ?? false))
                return false;

            return (role == UserRole.Admin);
        }

        [Authorize(Policy = "GroupModer")]
        public UserType GetUser(int id, bool? forAdmin)
        {
            if (IsMainModer(forAdmin))
                return context.GetUser(id).ToUserType(UserRole.User);


            var groupRole = context.GroupsRoles.Include(t => t.User)
                                .FirstOrDefault(t => t.User.Id == id && t.Group == group);

            if (groupRole is null)
                return null;

            return groupRole.User.ToUserType(groupRole.Role);
        }

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        [UseFiltering]
        [UseSorting]
        public IQueryable<QuoteType> GetQoutes()
        {
            var groupId = int.Parse(httpContext.HttpContext.User.Claims.First(t => t.Type == "GroupId").Value);

            return context.Quotes.Where(t => t.Post.Group.Id == groupId).Select(t =>
                t.ToQuoteType(t.Post, t.User, context.GetGroupRole(t.Post.Group, t.User).Role));
        }

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        [UseFiltering]
        [UseSorting]
        public IQueryable<QuoteType> GetQoutesByPost(int id)
        {
            var groupId = int.Parse(httpContext.HttpContext.User.Claims.First(t => t.Type == "GroupId").Value);

            return context.Quotes.Where(t => t.Post.Group.Id == groupId && t.Post.Id == id)
                .OrderBy(t => t.Time)
                .Select(t =>
                t.ToQuoteType(t.Post, t.User, UserRole.User));
        }

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        [UseFiltering]
        [UseSorting]
        public IQueryable<QuoteType> GetQoutesByUser(int id, bool? forAdmin)
        {
            return context.Quotes.Where(t => (IsMainModer(forAdmin) || t.Post.Group == group) && t.User.Id == id)
                .OrderBy(t => t.Time)
                .Select(t =>
                t.ToQuoteType(t.Post, t.User, UserRole.User));
        }

        [Authorize(Policy = "GroupModer")]
        public PostType GetPost(int id)
        {
            var post = context.GetPosts(group).Include(t => t.BindTo).SingleOrDefault(t => t.Id == id);

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
        [UseFiltering]
        [UseSorting]
        public IQueryable<PostType> GetPosts()
        {

            return context.GetPosts(group)
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
        [UseFiltering]
        [UseSorting]
        public IQueryable<GroupInfoType> GetGroups()
            => context.Groups.Select(t => new GroupInfoType
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

        public GroupResponseType AuthGroups(string code, string redirectUri)
        {

            var response = JsonSerializer.Deserialize<JsonElement>(new WebClient().DownloadString($"https://oauth.vk.com/access_token?client_id=7423484&client_secret=5V7WqNVjpI8LqlyBhvLn&redirect_uri={WebUtility.UrlDecode(redirectUri)}&code={code}"));
            JsonElement tokenProp = new JsonElement();
            JsonElement idProp = new JsonElement();

            if (!response.TryGetProperty("access_token", out tokenProp) ||
                !response.TryGetProperty("user_id", out idProp))
                return null;

            var groups = context.GetGroupRoles(idProp.GetInt64()).Include(t => t.Group);

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
                                    new Claim("Id", groupRole.User.Id.ToString()),
                                    new Claim("GroupId", groupRole.Group.Id.ToString()),
                                    new Claim("Status", "Logged"),
                                    new Claim("Role", groupRole.Role.ToString())
                                }, "Login");
            }
            return "";
        }

        public GroupInfoType GetGroupInfo(int? id, bool? forAdmin, bool? newGroup)
        {
            if (id.HasValue && IsMainModer(forAdmin))
                group = context.Groups.Find(id.Value);

            if (newGroup.HasValue && newGroup.Value)
                return null;

            if (group is null)
                return null;

            return new GroupInfoType
            {
                Id = group.Id,
                Token = group.Token,
                GroupId = group.GroupId,
                Key = group.Key,
                Secret = group.Secret,
                Keyboard = group.Configuration.Keyboard,
                Enabled = group.Configuration.Enabled,
                WithFilter = group.Configuration.WithFilter,
                Name = group.Name,
                BuildNumber = group.BuildNumber,
                FilterPattern = group.Configuration.FilterPattern
            };
        }

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        [UseFiltering]
        [UseSorting]
        public IQueryable<ReportType> GetReports()
            => context.GetReports(group).Select(t => t.ToReportType());

        [Authorize(Policy = "GroupModer")]
        public ReportType GetReport(int id)
            => context.GetReport(group, id)?.ToReportType() ?? null;

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        [UseFiltering]
        [UseSorting]
        public IQueryable<ReportItemType> GetReportItems(int id)
        {
            var report = context.GetReport(group, id);

            if (report == null)
                return null;

            return context.GetReportItems(report).Select(t => t.ToReportItemType());
        }
    }



    public static class TypeConvert
    {
        public static UserType ToUserType(this User user, UserRole role, int? id = null, Group group = null) => new UserType
        {
            Id = id ?? user.Id,
            Img = user.Img,
            Name = user.Name,
            Room = user.Room,
            Role = (int)role,
            VkId = user.VkId,
            BuildNumber = user.House?.BuildNumber ?? "",
            Group = group
        };

        public static PostType ToPostType(this Post post) => new PostType
        {
            Id = post.Id,
            Text = post.Text,
            Deleted = post.Deleted,
            Max = post.Max
        };

        public static QuoteType ToQuoteType(this Quote quote, Post post, User user, UserRole role) => new QuoteType
        {
            Id = quote.Id,
            IsOut = quote.IsOut,
            User = user is null ? null : user.ToUserType(role),
            Post = post is null ? null : post.ToPostType()
        };

        public static ReportType ToReportType(this Report report) => new ReportType
        {
            Id = report.Id,
            Max = report.Max,
            Name = report.Name,
            FromPost = report.FromPost.ToPostType(),
            Closed = report.Closed
        };

        public static ReportItemType ToReportItemType(this ReportItem reportItem) => new ReportItemType
        {
            Id = reportItem.Id,
            User = reportItem.User.ToUserType(UserRole.User),
            Verified = reportItem.Verified
        };
    }

    public class GroupResponseType
    {
        public string Token { get; set; }
        public IEnumerable<GroupType> Groups { get; set; }
    }


    public class GroupType
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public int Role { get; set; }
    }

    public class RoleType
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string BuildNumber { get; set; }
        public int Role { get; set; }
    }

    public class GroupInfoType
    {
        public int? Id { get; set; }
        public string Token { get; set; }
        public long? GroupId { get; set; }
        public string Key { get; set; }
        public string Secret { get; set; }
        public bool? Keyboard { get; set; }
        public bool? Enabled { get; set; }
        public bool? WithFilter { get; set; }
        public string FilterPattern { get; set; }
        public string Name { get; set; }
        public string BuildNumber { get; set; }
    }

    public class UserType
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Room { get; set; }
        public int Role { get; set; }
        public string Img { get; set; }
        public long VkId { get; set; }
        public string BuildNumber { get; set; }
        public Group Group { get; set; }
    }

    public class PostType
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public int Max { get; set; }
        public bool Deleted { get; set; }
        public bool IsRepost { get; set; }
    }

    public class QuoteType
    {
        public int Id { get; set; }
        public PostType Post { get; set; }
        public bool IsOut { get; set; }
        public UserType User { get; set; }
    }

    public class ReportType
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Max { get; set; }
        public PostType FromPost { get; set; }
        public bool Closed { get; set; }
    }

    public class ReportItemType
    {
        public int Id { get; set; }
        public UserType User { get; set; }
        public bool Verified { get; set; }
    }

    public class StatType
    {
        public IEnumerable<StatFloorType> StatFloor { get; set; }
        public IEnumerable<StatQuoteType> StatQuotes { get; set; }
    }

    public class StatFloorType
    {
        public int Floor { get; set; }
        public int Count { get; set; }
    }

    public class StatQuoteType
    {
        public string Date { get; set; }
        public int Count { get; set; }
    }
}
