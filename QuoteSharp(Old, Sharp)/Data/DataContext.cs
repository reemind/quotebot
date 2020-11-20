using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuoteSharp.Data
{
    public class DataContext : DbContext
    {
        public DbSet<Group> Groups { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Quote> Quotes { get; set; }

        public DataContext(DbContextOptions options) : base(options)
        {
            Database.EnsureCreated();
        }

        public IQueryable<Post> GetPosts(Group group)
            => Posts.Where(t => t.Group == group && !t.Deleted);

        public IQueryable<Quote> GetQuotes(Post post)
            => Quotes.Where(t => t.Post == post);

        public IQueryable<User> GetUsers(Group group, params UserType[] types)
            => Users.Where(t => t.Group == group && types.Contains(t.Type));

        public IQueryable<User> GetUsers(Group group)
            => Users.Where(t => t.Group == group);
    }

    public class Group
    {
        public int Id { get; set; }
        public string Token { get; set; }
        public long GroupId { get; set; }
        public string Key { get; set; }
        public string Secret { get; set; } = null;
        public bool Keyboard { get; set; }
        public bool Enabled { get; set; }
        public bool WithFilter { get; set; } = true;

    }

    public enum UserType
    {
        User,
        Moder,
        Admin
    }

    public class User
    {
        public int Id { get; set; }
        public long VkId { get; set; }
        public UserType Type { get; set; }
        public Group Group { get; set; }
        public string Name { get; set; }
        public int Room { get; set; }
    }

    public class Post
    {
        public int Id { get; set; }
        public long PostId { get; set; }
        public Group Group { get; set; }
        public bool Expired { get; set; }
        public bool Deleted { get; set; }
        public string Text { get; set; }
        public int Max { get; set; }
    }

    public class Quote
    {
        public int Id { get; set; }
        public long CommentId { get; set; }
        public User User { get; set; }
        public bool IsOut { get; set; }
        public Post Post { get; set; }
    }
}
