using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace DatabaseContext
{
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
}
