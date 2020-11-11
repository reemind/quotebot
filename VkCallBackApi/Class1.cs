using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace VkCallbackApi
{

    [AttributeUsage(AttributeTargets.Method)]
    public class VkMethod : Attribute
    {
        public string Method { get; private set; }

        public VkMethod(string method)
        {
            Method = method;
        }
    }

    public static class VkHandler
    {
        public static void Process<T>(T instance, CallbackResponse response)
        {
            var type = typeof(T);



            foreach (var item in type.GetMethods())
            {
                var attributes = item.GetCustomAttributes(typeof(VkMethod), true);
                if (attributes.Select(t => (t as VkMethod).Method).Contains(response.Type))
                {
                    var pars = item.GetParameters();
                    var parlist = new List<object>();
                    foreach (var par in pars)
                    {
                        switch (par.ParameterType)
                        {
                            case typeof(CallbackResponse):
                                parlist.Add(response);
                                break;
                            case typeof(JsonElement):
                                parlist.Add(response.Object);
                                break;
                            default:
                                throw new ArgumentException("Unknown parameters");
                        }
                    }
                        
                    item.Invoke(instance, parlist.ToArray());
                }
            }
        }
    }

    [Serializable]
    public class CallbackResponse
    {
        /// <summary>
        /// Тип события
        /// </summary>
        [JsonPropertyName("type")]
        public string Type { get; set; }

        /// <summary>
        /// Объект, инициировавший событие
        /// Структура объекта зависит от типа уведомления
        /// </summary>
        [JsonPropertyName("object")]
        public JsonElement Object { get; set; }

        /// <summary>
        /// ID сообщества, в котором произошло событие
        /// </summary>
        [JsonPropertyName("group_id")]
        public int GroupId { get; set; }

        [JsonPropertyName("secret")]
        public string Secret { get; set; }
    }
}
