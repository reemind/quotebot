using System;
using System.Collections.Generic;
using System.Text;

namespace DatabaseContext
{
    [Serializable]
    public class Config
    {
        public bool Keyboard { get; set; }
        public bool Enabled { get; set; }
        public bool WithFilter { get; set; }
        public string FilterPattern { get; set; }
        public bool WithQrCode { get; set; }
    }
}
