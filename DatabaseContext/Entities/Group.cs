using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DatabaseContext
{
    public class Group
    {
        public int Id { get; set; }
        public string Token { get; set; }
        public long GroupId { get; set; }
        public string Key { get; set; }
        public string Secret { get; set; } = null;
        public string Name { get; set; }
        public List<GroupRole> Roles { get; set; }
        public List<Post> Posts { get; set; }
        public List<Report> Reports { get; set; }

        public string BuildNumber { get; set; }
        [NotMapped]
        public Config Configuration
        {
            get
            {
                if (configuration is null)
                    return (configuration = JsonConvert.DeserializeObject<Config>(ConfigJson));
                return configuration;
            }
            set
            {
                configuration = value;
                ConfigJson = JsonConvert.SerializeObject(value);
            }
        }

        [NotMapped]
        Config configuration;

        public string ConfigJson { get; set; }
    }
}
