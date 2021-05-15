using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace DatabaseContext
{
    public class ScheludedTask
    {
        [Key]
        public int Id { get; set; }
        public DateTime StartTime { get; set; }
        public bool Completed { get; set; } = false;
        public TaskType TaskType { get; set; }
        public string Data { get; set; }
        public GroupRole Creator { get; set; }
        public Group Group { get; set; }
        public bool Success { get; set; } = false;
        public string Comment { get; set; } = "";
    }

    public enum TaskType
    {
        Notify,
        CloseReport,
        Send
    }
}
