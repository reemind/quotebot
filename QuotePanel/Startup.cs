using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using HotChocolate;
using HotChocolate.AspNetCore;
using Microsoft.AspNetCore.Http;
using Serilog;
using Microsoft.AspNetCore.HttpOverrides;
using OfficeOpenXml;
using Quartz;
using System;

namespace QuotePanel
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
               

            services.AddDbContext<DatabaseContext.DataContext>((builder) =>
                builder.UseNpgsql(Configuration.GetConnectionString("DefaultConnection")), ServiceLifetime.Transient);

            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                    .AddJwtBearer(options =>
                    {
                        options.RequireHttpsMetadata = false;
                        options.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidateIssuer = true,
                            ValidIssuer = AuthOptions.ISSUER,

                            ValidateAudience = true,
                            ValidAudience = AuthOptions.AUDIENCE,
                            ValidateLifetime = true,

                            IssuerSigningKey = AuthOptions.GetSymmetricSecurityKey(),
                            ValidateIssuerSigningKey = true,
                        };
                    });

            services.AddAuthorization(opts =>
            {
                opts.AddPolicy("Admin", policy =>
                {
                    policy.RequireClaim("Status", "Logged");
                    policy.RequireClaim("Role", "Admin");
                });
                opts.AddPolicy("Moder", policy =>
                {
                    policy.RequireClaim("Status", "Logged");
                    policy.RequireClaim("Role", "Moder", "Admin");

                });
                opts.AddPolicy("GroupAdmin", policy =>
                {
                    policy.RequireClaim("Status", "Logged");
                    policy.RequireClaim("Role", "GroupAdmin", "Moder", "Admin");
                });
                opts.AddPolicy("GroupModer", policy =>
                {
                    policy.RequireClaim("Status", "Logged");
                    policy.RequireClaim("Role", "GroupModer", "GroupAdmin", "Moder", "Admin");
                    
                });
                opts.AddPolicy("User", policy =>
                {
                    policy.RequireClaim("Status", "Logged");
                    policy.RequireClaim("Role", "GroupModer", "GroupAdmin", "User", "Moder", "Admin");
                    
                });
                opts.AddPolicy("NotLogged", policy =>
                    policy.RequireClaim("Status", "NotLogged"));
            });

            services.AddGraphQL(sp => QraphQL.GraphQL.GetSchema(sp));

            services.AddControllersWithViews();
            services.AddCors();

            Methods.Manager.SetData(Configuration.GetSection("AES"));

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            services.AddQuartz(config =>
            {
                var jobKey = new JobKey("job");
                config.AddJob<Background.ScheludedJob>(jobKey);

                config.AddTrigger(config =>
                {
                    config.ForJob(jobKey);
                    config.WithSimpleSchedule(t => t.WithIntervalInSeconds(5).RepeatForever());
                });

                config.UseMicrosoftDependencyInjectionScopedJobFactory(t => { t.AllowDefaultConstructor = true; });
            });

            services.AddQuartzServer();

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "./ClientApp/build/";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env,
                          ILoggerFactory loggerFactory)
        {

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                //app.UseHsts();
            }

            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });

            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();
            app.UseCors(builder => builder.AllowAnyOrigin());

            app.UseGraphQL("/graphql");

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
            });

            // React
            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "./ClientApp/build/";

                if (env.IsDevelopment())
                {
                    //spa.UseReactDevelopmentServer(npmScript: "start");
                    spa.UseProxyToSpaDevelopmentServer("http://localhost:3000");
                }
            });
        }
    }
}
