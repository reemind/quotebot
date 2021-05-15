using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace DatabaseContext
{
    public class GroupRole
    {
        public int Id { get; set; }
        [Required]
        public Group Group { get; set; }
        public UserRole Role { get; set; }
        [Required]
        public User User { get; set; }
    }

    public enum UserRole
    {
        User,
        GroupModer,
        GroupAdmin,
        Moder,
        Admin
    }
}
