using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using Newtonsoft.Json;
using System.Diagnostics.CodeAnalysis;

namespace DatabaseContext
{
    public class DataContext : DbContext
    {
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupRole> GroupsRoles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Quote> Quotes { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<ReportItem> ReportItems { get; set; }
        public DbSet<ScheludedTask> ScheludedTasks { get; set; }
        public DbSet<QuotePoint> QuotePoints { get; set; }
        public DbSet<QuotePointItem> QuotePointsItems { get; set; }


        public DataContext(DbContextOptions options) : base(options)
        {
            Database.EnsureCreated();

        }
    }

    public static class DataContextExtensions
    {
        public static IQueryable<Post> GetPosts(this DataContext context, Group group)
            => context.Posts.Where(t => t.Group == group && !t.Deleted).OrderBy(t => t.Time);

        public static Post GetPost(this DataContext context, int id)
            => context.Posts.SingleOrDefault(t => t.Id == id);

        public static IQueryable<Quote> GetQuotes(this DataContext context, User user)
            => context.Quotes.Where(t => t.User == user).OrderBy(t => t.Time);

        public static IQueryable<Quote> GetQuotes(this DataContext context, Post post)
            => context.Quotes.Where(t => t.Post == post).OrderBy(t => t.Time);

        public static IQueryable<User> GetUsers(this DataContext context, Group group, params UserRole[] roles)
            => context.GroupsRoles.Where(t => t.Group == group && roles.Contains(t.Role)).Select(t => t.User);

        public static GroupRole GetGroupRole(this DataContext context, Group group, User user)
            => context.GroupsRoles.SingleOrDefault(t => t.Group == group && t.User == user);

        public static GroupRole GetGroupRole(this DataContext context, int groupId, int userId)
            => context.GroupsRoles
                .Include(t => t.User)
                .Include(t => t.Group)
                .SingleOrDefault(t => t.Group.Id == groupId && t.User.Id == userId);

        public static GroupRole GetGroupRole(this DataContext context, Group group, long vkUserId)
            => context.GroupsRoles
                .Include(t => t.User)
                .Include(t => t.Group)
                .SingleOrDefault(t => t.Group == group && t.User.VkId == vkUserId);

        public static IQueryable<GroupRole> GetGroupRoles(this DataContext context, long userId)
            => context.GroupsRoles
                .Include(t => t.User)
                .Include(t => t.Group)
                .Where(t => t.User.VkId == userId);

        public static IQueryable<GroupRole> GetGroupRoles(this DataContext context, Group group)
            => context.GroupsRoles
                .Include(t => t.User)
                .Include(t => t.Group)
                .Where(t => t.Group == group);

        public static IQueryable<User> GetUsers(this DataContext context, Group group)
            => context.GroupsRoles.Where(t => t.Group == group).Select(t => t.User);

        public static IQueryable<Report> GetReports(this DataContext context, Group group)
            => context.Reports.Include(t => t.FromPost).Where(t => t.Group == group);

        public static IQueryable<ReportItem> GetReportItems(this DataContext context, GroupRole groupRole)
            => context.ReportItems.Where(t => t.Report.Group == groupRole.Group && t.User == groupRole.User);

        public static Report GetReport(this DataContext context, Group group, int id)
            => context.Reports.Include(t => t.FromPost).FirstOrDefault(t => t.Group == group && t.Id == id);

        public static IQueryable<ReportItem> GetReportItems(this DataContext context, Report report)
            => context.ReportItems.Include(t => t.User).Where(t => t.Report == report);

        public static QuotePoint GetQuotePoint(this DataContext context, Group group, int id)
            => context.QuotePoints.Include(t => t.Report.FromPost).SingleOrDefault(t => t.Group == group && t.Id == id);

        public static IQueryable<QuotePoint> GetQuotePoints(this DataContext context, Group group)
            => context.QuotePoints.Include(t => t.Report.FromPost).Where(t => t.Group == group);

        public static IQueryable<QuotePointItem> GetQuotePointItems(this DataContext context, QuotePoint point)
            => context.QuotePointsItems
                .Include(t => t.QuotePoint)
                .Include(t => t.User)
                .Where(t => t.QuotePoint == point);
        
        public static bool InGroup(this DataContext context, User user, Group group)
            => context.GroupsRoles
                .FirstOrDefault(g => g.Group == group && g.User == user) is GroupRole;

        public static bool InGroup(this DataContext context, User user, Group group, params UserRole[] roles)
            => user.Roles.Contains(context.GroupsRoles
                .FirstOrDefault(g => g.Group == group && roles.Contains(g.Role)));

        public static bool InRole(this DataContext context, User user, Group group, UserRole role)
            => context.GroupsRoles
                .FirstOrDefault(g => g.Group == group && g.User == user && g.Role == role) is GroupRole;

        public static void SetRole(this DataContext context, Group group, User user, UserRole role, bool saveChanges = true)
        {
            var grole = context.GroupsRoles.SingleOrDefault(t => t.User == user && t.Group == group);

            if (grole is GroupRole)
                grole.Role = role;
            else
                context.GroupsRoles.Add(new GroupRole
                {
                    Group = group,
                    User = user,
                    Role = role
                });

            if (saveChanges)
                context.SaveChanges();
        }

        public static User GetUser(this DataContext context, int id)
            => context.Users.SingleOrDefault(t => t.Id == id);

        public static User GetUser(this DataContext context, long vkId)
            => context.Users.SingleOrDefault(t => t.VkId == vkId);

        public static bool ExistUser(this DataContext context, int id)
            => context.GetUser(id) != null;

        public static bool ExistUser(this DataContext context, long id)
            => context.GetUser(id) != null;

        public static Report CreateReport(this DataContext context, Group group, Post post)
        {
            var report = context.Reports.Include(t => t.Items).FirstOrDefault(t => t.FromPost == post);

            if (report == null)
                context.Add(report = new Report()
                {
                    Group = group,
                    Max = post.Max,
                    Name = post.Text,
                    FromPost = post
                });

            context.SaveChanges();
            return report;
        }

        public static void AddReportItems(this DataContext context, Report report, IEnumerable<Quote> quotes)
        {
            var items = quotes.Select(t => new ReportItem
            {
                User = t.User,
                Verified = false,
                FromQuote = t,
                Report = report
            }).ToList();

            context.AddRange(items);

            context.SaveChanges();
        }
    }
}
