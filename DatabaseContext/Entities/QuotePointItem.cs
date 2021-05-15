using System;
using System.Collections.Generic;
using System.Text;

namespace DatabaseContext
{
    public class QuotePointItem
    {
        public int Id { get; set; }
        public User User { get; set; }

        public double Point { get; set; }
        public string Comment { get; set; }
        public QuotePoint QuotePoint { get; set; }
    }
}
