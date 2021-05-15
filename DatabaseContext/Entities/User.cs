using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace DatabaseContext
{
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
}
