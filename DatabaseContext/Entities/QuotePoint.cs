using System;
using System.Collections.Generic;
using System.Text;

namespace DatabaseContext
{
    public class QuotePoint
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Report Report { get; set; }
        public Group Group { get; set; }
        public List<QuotePointItem> Items { get; set; }
    }
}
