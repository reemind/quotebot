using System;
using System.Collections.Generic;
using System.Text;

namespace DatabaseContext
{
    public class Report
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Max { get; set; }
        public Post FromPost { get; set; }
        public List<ReportItem> Items { get; set; }
        public Group Group { get; set; }
        public bool Closed { get; set; }
        public DateTime? CloseTime { get; set; }
    }
}
