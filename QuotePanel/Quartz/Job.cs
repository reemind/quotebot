using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using DatabaseContext;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Serilog;

namespace QuotePanel.Background
{
    public class ScheludedJob : IJob
    {
        DataContext dbContext;

        public ScheludedJob(DataContext context)
        {
            dbContext = context;
        }

        public async Task Execute(IJobExecutionContext context)
        {

            var tasks = dbContext.ScheludedTasks.Where(t => t.StartTime < DateTime.UtcNow && !t.Completed).ToList();
            foreach(var task in tasks)
            {
                switch (task.TaskType)
                {
                    case TaskType.Notify:
                        await Notify(task, JsonConvert.DeserializeObject<NotifyTaskData>(task.Data));
                        break;
                    case TaskType.CloseReport:
                        await CloseReport(task, JsonConvert.DeserializeObject<CloseTaskData>(task.Data));
                        break;
                    case TaskType.Send:
                        await Send(task, JsonConvert.DeserializeObject<SendTaskData>(task.Data));
                        break;
                }
                task.Completed = true;
            }

            await dbContext.SaveChangesAsync();

            if (tasks.Count > 0)
                Log.Logger.Information($"{tasks.Count} tasks executed");
        }

        public async Task Notify(ScheludedTask task, NotifyTaskData data)
        {

            var report = dbContext.Reports.Include(t => t.FromPost)
                .FirstOrDefault(t => t.FromPost.Id == data.PostId);

            if(report != null)
            {
                task.Success = false;
                task.Comment = "Report was been alreay created";
                return;
            }


            var post = dbContext.Posts.Include(t => t.Group).FirstOrDefault(t => t.Id == data.PostId);

            report = dbContext.CreateReport(post.Group, post);

            var quotes = dbContext.GetQuotes(post)
                .Include(t => t.User)
                .Where(t => !t.IsOut)
                .Take(post.Max);

            var count = await InteractionMethods.Interactions.NotifyAsync(dbContext, post, quotes, report);

            task.Success = true;
            task.Comment = $"{count} message sended";
        }

        public async Task CloseReport(ScheludedTask task, CloseTaskData data)
        {
            var report = dbContext.Reports
                .Include(t => t.FromPost)
                .SingleOrDefault(t => t.Id == data.ReportId);

            if(report == null)
            {
                task.Comment = "Report not found";
                task.Success = false;
                return;
            }

            if (report.Closed)
            {
                task.Comment = "Report was been alreay closed";
                task.Success = false;
                return;
            }

            await InteractionMethods.Interactions.CloseReportAsync(dbContext, report);

            task.Success = true;
            task.Comment = $"Report closed";
        }

        public async Task Send(ScheludedTask task, SendTaskData data)
        {

            var users = dbContext.Users
                               .Include(t => t.House)
                               .Where(t => data.UserIds.Contains(t.Id))
                               .AsEnumerable().GroupBy(t => t.House);

            if(users.Count() == 0)
            {
                task.Comment = "Users not found";
                task.Success = false;
                return;
            }

            var status = await InteractionMethods.Interactions.SendAsync(dbContext, users, data.Message);

            if (status)
            {
                task.Success = true;
                task.Comment = $"Message sended";
            }
            else
            {
                task.Success = false;
                task.Comment = $"Message not sended";
            }
        }
    }
}
