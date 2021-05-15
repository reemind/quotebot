using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace QuoteBot
{

    [AttributeUsage(AttributeTargets.Method)]
    public class NewMessageMethod : Attribute
    {
        public string Pattern { get; }
        public bool IsId { get; set; }


        public NewMessageMethod(string pattern)
        {
            Pattern = pattern;
            IsId = false;
        }

        public NewMessageMethod(string pattern, bool isId)
        {
            Pattern = pattern;
            IsId = isId;
        }
    }

    public static class NewMassageHandler
    {

        public static void Handle<T>(T instance, Func<string, bool> comparer, Func<string, Match> match, Action<string> action = null, params object[] args)
            => GetMethodResult(instance, comparer, match, action, args);

        private static object GetMethodResult<T>(T instance, Func<string, bool> comparer, Func<string, Match> match, Action<string> action = null, params object[] args)
        {
            var type = typeof(T);

            foreach (var item in type.GetMethods().Where(t => t.IsDefined(typeof(NewMessageMethod))))
            {
                var attr = item.GetCustomAttribute(typeof(NewMessageMethod), true) as NewMessageMethod;
                if (comparer(attr.Pattern))
                {
                    var pars = item.GetParameters();
                    var parlist = new List<object>();

                    foreach (var par in pars)
                    {
                        if (par.ParameterType == typeof(Match))
                            parlist.Add(match(attr.Pattern));
                        else
                        {
                            var arg = args.FirstOrDefault(t => t.GetType() == par.ParameterType);
                            if (arg != null)
                                parlist.Add(arg);
                            else
                                throw new ArgumentException("Type in parameters not found");
                        }
                    }

                    action?.Invoke(attr.Pattern);
                    return item.Invoke(instance, parlist.ToArray());
                }
            }

            return null;
        }

        public static TOut Handle<T, TOut>(T instance, Func<string, bool> comparer, Func<string, Match> match, Action<string> action = null, params object[] args)
            => (TOut)GetMethodResult(instance, comparer, match, action, args);

        public static Task HandleAsync<T>(T instance, Func<string, bool> comparer, Func<string, Match> match, Action<string> action = null, params object[] args)
        {
            var result = GetMethodResult(instance, comparer, match, action, args);

            if (result is Task)
                return (result as Task);
            else
                return Task.CompletedTask;
        }

        public static Task<TOut> HandleAsync<T, TOut>(T instance, Func<string, bool> comparer, Func<string, Match> match, Action<string> action = null, params object[] args)
        {
            var result = GetMethodResult(instance, comparer, match, action, args);

            if (result is Task<TOut>)
                return (result as Task<TOut>);
            else
                return Task.FromResult((TOut)result);
        }

        private static bool IsAwaitable(MethodInfo info)
        {
            return info.ReturnType.GetRuntimeMethod("GetAwaiter", new Type[] { }) != null &&
                info.ReturnType.GetRuntimeField("IsCompleted") != null;
        }
    }
}
