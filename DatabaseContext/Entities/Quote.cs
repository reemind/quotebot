using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace DatabaseContext
{
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
