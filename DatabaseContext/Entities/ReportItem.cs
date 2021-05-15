using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Text;

namespace DatabaseContext
{
    public class ReportItem
    {
        public int Id { get; set; }
        public Report Report { get; set; }
        public User User { get; set; }
        public Quote FromQuote { get; set; }
        public bool Verified { get; set; }

    }

    public class ReportItemComparer : IEqualityComparer<ReportItem>
    {
        public static ReportItemComparer New => new ReportItemComparer();


        public bool Equals(ReportItem x, ReportItem y)
        {
            return x.FromQuote == y.FromQuote;
        }

        public int GetHashCode([DisallowNull] ReportItem obj)
        {
            return base.GetHashCode();
        }

    }
}
