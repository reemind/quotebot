using DatabaseContext;
using HotChocolate;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Serilog;

namespace QuotePanel.QraphQL
{
    public static class GraphQL
    {
        public static ISchema GetSchema(IServiceProvider serviceProvider)
            => SchemaBuilder.New()
                    .AddQueryType<QueryType>()
                    .AddMutationType<MutationType>()
                    .AddType<UserType>()
                    .AddType<GroupType>()
                    .AddType<PostType>()
                    .AddType<QuoteType>()
                    .AddType<ReportType>()
                    .AddType<ReportItemType>()
                    .AddType<UserInfoType>()
                    .AddType<QuotePointType>()
                    .AddType<QuotePointItemType>()
                    .AddType<ScheludedTaskType>()
                    .AddServices(serviceProvider)
                    .AddAuthorizeDirectiveType().Create();
    }

    public abstract class QueryBase
    {
        protected HttpContext HttpContext { get; }
        protected DataContext DbContext { get; }
        protected ILogger Logger { get; }
        protected GroupRole Role { get; }

        protected QueryBase([Service] IHttpContextAccessor httpContext, 
            [Service] DataContext context,
            [Service] ILogger logger)
        {
            DbContext = context;
            HttpContext = httpContext.HttpContext;
            Logger = logger;

            Role = context.GetDataFromClaims(HttpContext.User);
        }
    }
}
