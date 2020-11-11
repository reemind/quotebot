﻿using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using Newtonsoft.Json;

namespace QuotePanel.Data
{
    public class DataContext : DbContext
    {
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupRole> GroupsRoles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Quote> Quotes { get; set; }

        public DataContext(DbContextOptions options) : base(options)
        {
            Database.EnsureCreated();
        }

        public IQueryable<Post> GetPosts(Group group)
            => Posts.Where(t => t.Group == group && !t.Deleted).OrderBy(t => t.Time);

        public Post GetPost(int id)
            => Posts.SingleOrDefault(t => t.Id == id);

        public IQueryable<Quote> GetQuotes(User user)
            => Quotes.Where(t => t.User == user).OrderBy(t => t.Time);

        public IQueryable<Quote> GetQuotes(Post post)
            => Quotes.Where(t => t.Post == post).OrderBy(t => t.Time);

        public IQueryable<User> GetUsers(Group group, params UserRole[] roles)
            => GroupsRoles.Where(t => t.Group == group && roles.Contains(t.Role)).Select(t => t.User);

        public GroupRole GetGroupRole(Group group, User user)
            => GroupsRoles.SingleOrDefault(t => t.Group == group && t.User == user);

        public GroupRole GetGroupRole(int groupId, int userId)
            => GroupsRoles
                .Include(t => t.User)
                .Include(t => t.Group)
                .SingleOrDefault(t => t.Group.Id == groupId && t.User.Id == userId);

        public GroupRole GetGroupRole(Group group, long vkUserId)
            => GroupsRoles
                .Include(t => t.User)
                .Include(t => t.Group)
                .SingleOrDefault(t => t.Group == group && t.User.VkId == vkUserId);

        public IQueryable<GroupRole> GetGroupRoles(long userId)
            => GroupsRoles.Where(t => t.User.VkId == userId);

        public IQueryable<GroupRole> GetGroupRoles(Group group)
            => GroupsRoles.Where(t => t.Group == group);

        public IQueryable<User> GetUsers(Group group)
            => GroupsRoles.Where(t => t.Group == group).Select(t => t.User);

        public bool InGroup(User user, Group group)
            => GroupsRoles
                .FirstOrDefault(g => g.Group == group && g.User == user) is GroupRole;

        public bool InGroup(User user, Group group, params UserRole[] roles)
            => user.Roles.Contains(GroupsRoles
                .FirstOrDefault(g => g.Group == group && roles.Contains(g.Role)));

        public bool InRole(User user, Group group, UserRole role)
            => GroupsRoles
                .FirstOrDefault(g => g.Group == group && g.User == user && g.Role == role) is GroupRole;

        public void SetRole(Group group, User user, UserRole role, bool saveChanges = true)
        {
            var grole = GroupsRoles.SingleOrDefault(t => t.User == user && t.Group == group);

            if (grole is GroupRole)
                grole.Role = role;
            else
                GroupsRoles.Add(new GroupRole
                {
                    Group = group,
                    User = user,
                    Role = role
                });

            if(saveChanges)
                SaveChanges();
        }

        public User GetUser(int id)
            => Users.SingleOrDefault(t => t.Id == id);

        public User GetUser(long id)
            => Users.SingleOrDefault(t => t.VkId == id);

        public bool ExistUser(int id)
            => GetUser(id) != null;

        public bool ExistUser(long id)
            => GetUser(id) != null;
    }

    public class Group
    {
        public int Id { get; set; }
        public string Token { get; set; }
        public long GroupId { get; set; }
        public string Key { get; set; }
        public string Secret { get; set; } = null;
        public string Name { get; set; }
        public List<GroupRole> Roles { get; set; }
        public List<Post> Posts { get; set; }

        public string BuildNumber { get; set; }
        [NotMapped]
        public Config Configuration { 
            get 
            {
                if(configuration is null)
                    return (configuration = JsonConvert.DeserializeObject<Config>(ConfigJson));
                return configuration;
            }
            set
            {
                configuration = value;
                ConfigJson = JsonConvert.SerializeObject(value);
            }
        }

        [NotMapped]
        Config configuration;

        public string ConfigJson { get; set; }
    }

    public class GroupRole
    {
        public int Id { get; set; }
        [Required]
        public Group Group { get; set; }
        public UserRole Role { get; set; }
        [Required]
        public User User { get; set; }
    }

    [Serializable]
    public class Config
    {
        public bool Keyboard { get; set; }
        public bool Enabled { get; set; }
        public bool WithFilter { get; set; }
        public string FilterPattern { get; set; }
    }

    public enum UserRole
    {
        User,
        GroupModer,
        GroupAdmin,
        Moder,
        Admin
    }

    public class User
    {
        [Key]
        public int Id { get; set; }
        public long VkId { get; set; }
        public List<GroupRole> Roles { get; set; }
        public string Name { get; set; }
        public int Room { get; set; }
        public string Img { get; set; }
        public List<Quote> Quotes { get; set; }
        public Group House { get; set; }
    }

    public class Post
    {
        [Key]
        public int Id { get; set; }
        public long PostId { get; set; }
        public Group Group { get; set; }
        public bool Deleted { get; set; }
        public string Text { get; set; }
        public int Max { get; set; }
        public Post BindTo { get; set; }
        public DateTime Time { get; set; }
        public List<Quote> Quotes { get; set; }
    }

    public class Quote
    {
        [Key]
        public int Id { get; set; }
        public long CommentId { get; set; }
        public User User { get; set; }
        public bool IsOut { get; set; }
        public Post Post { get; set; }
        public DateTime Time { get; set; }
    }
}