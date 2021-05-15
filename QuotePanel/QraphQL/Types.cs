using DatabaseContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuotePanel.QraphQL
{
    public static class TypeConvert
    {
        public static UserType ToUserType(this User user, UserRole role = 0, int? id = null, Group group = null) => new UserType
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

        public static UserType ToUserType(GroupRole role)
            => ToUserType(role.User, role.Role, role.User.Id, role.Group);

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

        public static ScheludedTaskType ToTaskType(this ScheludedTask scheludedTask) => new ScheludedTaskType
        {
            Id = scheludedTask.Id,
            Comment = scheludedTask.Comment,
            TaskType = (int)scheludedTask.TaskType,
            StartTime = scheludedTask.StartTime,
            Creator = ToUserType(scheludedTask.Creator),
            Completed = scheludedTask.Completed,
            Success = scheludedTask.Success,
            Data = scheludedTask.Data
        };

        public static QuotePointType ToQuotePointType(this QuotePoint point)
            => new QuotePointType
            {
                Id = point.Id,
                Report = point.Report.ToReportType(),
                Name = point.Name
            };

        public static QuotePointItemType ToQuotePointItemType(this QuotePointItem point)
            => new QuotePointItemType
            {
                Id = point.Id,
                User = point.User.ToUserType(),
                Point = point.Point,
                Comment = point.Comment
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

    public class QuotePointType
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public ReportType Report { get; set; }
    }

    public class QuotePointItemType
    {
        public int Id { get; set; }
        public UserType User { get; set; }

        public double Point { get; set; }
        public string Comment { get; set; }
    }

    public class ScheludedTaskType
    {
        public int Id { get; set; }
        public DateTime StartTime { get; set; }
        public bool Completed { get; set; }
        public int TaskType { get; set; }
        public string Data { get; set; }
        public UserType Creator { get; set; }
        public bool Success { get; set; }
        public string Comment { get; set; }
    }
}
