using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuotePanel.Background
{
    [Serializable]
    public class NotifyTaskData
    {
        public int PostId { get; set; } = -1;
    }

    [Serializable]
    public class CloseTaskData
    {
        public int ReportId { get; set; }
    }

    [Serializable]
    public class SendTaskData
    {
        public List<int> UserIds { get; set; }
        public string Message { get; set; }
    }
}
