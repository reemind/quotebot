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
        HttpContext httpContext;
        DataContext context;
        GroupRole role;

        public QueryType([Service] IHttpContextAccessor httpContext, [Service] DataContext context)
        {
            this.context = context;
            this.httpContext = httpContext.HttpContext;

            role = context.GetDataFromClaims(this.httpContext.User);
        }

        [Authorize(Policy = "GroupModer")]
        public StatType GetStat(bool? forAdmin, int? groupId)
        {
            if (IsMainModer(forAdmin) && groupId.HasValue)
            {
                role.Group = context.Groups.Find(groupId.Value);

                if (groupId == null)
                    return null;
            }

            var quotes = context.Quotes.Include(t => t.Post.Group)
                                    .Where(t => t.Post.Group == role.Group)
                                    .GroupBy(t => t.Time.Date)
                                    .OrderBy(t => t.Key)
                                    .Select(t => new StatQuoteType
                                    {
                                        Date = t.Key.ToShortDateString(),
                                        Count = t.Count()
                                    }).ToList();

            var floor = context.GetUsers(role.Group)
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
            return role.User.ToUserType(role.Role);
        }

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        //[UseFiltering]
        //[UseSorting]
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
                var roles = context.GetGroupRoles(role.Group);

                return roles.Include(t => t.User.House)
                            .Select(t => t.User.ToUserType(t.Role, t.User.Id, null));
            }
        }

        [Authorize(Policy = "Moder")]
        public IQueryable<RoleType> GetUserRoles(int id)
            => context.GroupsRoles.Include(t => t.Group).Where(t => t.User.Id == id).Select(t =>
            new RoleType
            {
                Id = t.Id,
                BuildNumber = t.Group.BuildNumber,
                Name = t.Group.Name,
                Role = (int)t.Role
            });

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
        public UserType GetUser(int id, bool? forAdmin)
        {
            if (IsMainModer(forAdmin))
                return context.GetUser(id).ToUserType(UserRole.User);


            var groupRole = context.GroupsRoles.Include(t => t.User)
                                .FirstOrDefault(t => t.User.Id == id && t.Group == role.Group);

            if (groupRole is null)
                return null;

            return groupRole.User.ToUserType(groupRole.Role);
        }

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        //[UseFiltering]
        //[UseSorting]
        public IQueryable<QuoteType> GetQoutes()
        {
            return context.Quotes.Where(t => t.Post.Group == role.Group).Select(t =>
                t.ToQuoteType(t.Post, t.User, context.GetGroupRole(t.Post.Group, t.User).Role));
        }

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        //[UseFiltering]
        //[UseSorting]
        public IQueryable<QuoteType> GetQoutesByPost(int id)
        {
            return context.Quotes.Where(t => t.Post.Group == role.Group && t.Post.Id == id)
                .OrderBy(t => t.Time)
                .Select(t =>
                t.ToQuoteType(t.Post, t.User, UserRole.User));
        }

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        //[UseFiltering]
        //[UseSorting]
        public IQueryable<QuoteType> GetQoutesByUser(int id, bool? forAdmin)
        {
            return context.Quotes.Where(t => (IsMainModer(forAdmin) || t.Post.Group == role.Group) && t.User.Id == id)
                .OrderBy(t => t.Time)
                .Select(t =>
                t.ToQuoteType(t.Post, t.User, UserRole.User));
        }

        [Authorize(Policy = "GroupModer")]
        public PostType GetPost(int id)
        {
            var post = context.GetPosts(role.Group).Include(t => t.BindTo).SingleOrDefault(t => t.Id == id);

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
        //[UseFiltering]
        //[UseSorting]
        public IQueryable<PostType> GetPosts()
        {

            return context.GetPosts(role.Group)
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
        //[UseFiltering]
        //[UseSorting]
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
                                    new Claim("Status", "Logged"),
                                    new Claim("RoleId", groupRole.Id.ToString()),
                                    new Claim("Role", groupRole.Role.ToString())
                                }, "Login");
            }
            return "";
        }

        public GroupInfoType GetGroupInfo(int? id, bool? forAdmin, bool? newGroup)
        {
            if (id.HasValue && IsMainModer(forAdmin))
                role.Group = context.Groups.Find(id.Value);

            if (newGroup.HasValue && newGroup.Value)
                return null;

            if (role.Group is null)
                return null;

            return new GroupInfoType
            {
                Id = role.Group.Id,
                Token = role.Group.Token,
                GroupId = role.Group.GroupId,
                Key = role.Group.Key,
                Secret = role.Group.Secret,
                Keyboard = role.Group.Configuration.Keyboard,
                Enabled = role.Group.Configuration.Enabled,
                WithFilter = role.Group.Configuration.WithFilter,
                Name = role.Group.Name,
                BuildNumber = role.Group.BuildNumber,
                FilterPattern = role.Group.Configuration.FilterPattern,
                WithQrCode = role.Group.Configuration.WithQrCode
            };
        }

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        [UseFiltering]
        [UseSorting]
        public IQueryable<ReportType> GetReports()
            => context.GetReports(role.Group)
                .OrderByDescending(t => t.Id)
                .Select(t => t.ToReportType());

        [Authorize(Policy = "GroupModer")]
        public ReportType GetReport(int id)
            => context.GetReport(role.Group, id)?.ToReportType() ?? null;

        [Authorize(Policy = "GroupModer")]
        [UsePaging]
        //[UseFiltering]
        //[UseSorting]
        public IQueryable<ReportItemType> GetReportItems(int id)
        {
            var report = context.GetReport(role.Group, id);

            if (report == null)
                return null;

            return context.GetReportItems(report).Select(t => t.ToReportItemType(null));
        }

        [Authorize(Policy = "GroupModer")]
        public string GetReportCode(int id)
        {
            var report = context.GetReport(role.Group, id);

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
                                    new Claim("RoleId", role.Id.ToString()),
                                    new Claim("Role", role.Role.ToString())
                                },
                                "Login",
                                expires
                                );
        }

        #region User

        [Authorize(Policy = "User")]
        public UserInfoType GetUserInfo()
            => new UserInfoType
            {
                Quotes = context.GetQuotes(role.User)
                    .Include(t => t.Post)
                    .Select(t => t.ToQuoteType(t.Post, role.User, role.Role)).ToList(),
                ReportItems = context.GetReportItems(role)
                    .Include(t => t.Report.FromPost)
                    .Select(t => t.ToReportItemType(t.Report)).ToList()
            };

        #endregion
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

        public static ReportItemType ToReportItemType(this ReportItem reportItem, Report report) => new ReportItemType
        {
            Id = reportItem.Id,
            User = reportItem.User.ToUserType(UserRole.User),
            Verified = reportItem.Verified,
            FromPost = report?.FromPost.ToPostType() ?? null,
            Closed = report?.Closed ?? null
        };

        public static QuoteType ChangeOut(this QuoteType quoteType, bool isOut)
        {
            quoteType.IsOut = isOut;
            return quoteType;
        }
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
        public bool? WithQrCode { get; set; }
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
        public PostType FromPost { get; set; }
        public bool? Closed { get; set; }
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

    public class UserInfoType
    {
        public IEnumerable<ReportItemType> ReportItems { get; set; }
        public IEnumerable<QuoteType> Quotes { get; set; }
    }
}
