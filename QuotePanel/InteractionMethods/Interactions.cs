using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Data = DatabaseContext;
using static DatabaseContext.DataContextExtensions;
using VkNet;
using VkNet.Model;

namespace QuotePanel.InteractionMethods
{
    public static class Interactions
    {
        public static async Task<bool> SendAsync(Data.DataContext context, IEnumerable<IGrouping<Data.Group, Data.User>> users, string message)
        {
            var result = true;

            foreach (var gr in users)
            {
                var api = new VkApi();
                await api.AuthorizeAsync(new ApiAuthParams() { AccessToken = gr.Key.Token });

                if (!api.IsAuthorized)
                    return false;

                try
                {
                    var prms = new VkNet.Model.RequestParams.MessagesSendParams
                    {
                        RandomId = (int)DateTimeOffset.Now.ToUnixTimeMilliseconds(),
                        UserIds = gr.Select(t => t.VkId),
                        Message = message,
                    };

                    await api.Messages.SendToUserIdsAsync(prms);
                }
                catch
                {
                    result = false;
                }
            }

            return result;
        }

        public static async Task<int> NotifyAsync(Data.DataContext context, Data.Post post, IQueryable<Data.Quote> quotes, Data.Report report)
        {
            var groups = quotes
                .Include(t => t.User.House)
                .Select(t => t.User)
                .AsEnumerable()
                .GroupBy(t => t.House);

            var quotesForReports = quotes.ToList();

            foreach (var gr in groups)
                try
                {
                    var api = new VkApi();
                    await api.AuthorizeAsync(new ApiAuthParams() { AccessToken = gr.Key.Token });

                    if (!api.IsAuthorized)
                        return 0;

                    var prms = new VkNet.Model.RequestParams.MessagesSendParams
                    {
                        RandomId = (int)DateTimeOffset.Now.ToUnixTimeMilliseconds(),
                        UserIds = gr.Select(t => t.VkId),
                        Message = "Ты участвуешь!",
                        Attachments = new List<MessagePost> { new MessagePost(post) }
                    };

                    var sendResults = await api.Messages.SendToUserIdsAsync(prms);

                    foreach (var res in sendResults)
                        if (!res.MessageId.HasValue)
                            quotesForReports.RemoveAll(t => res.PeerId == t.User.Id);
                }
                catch
                {
                }
            context.AddReportItems(report, quotesForReports);

            return quotesForReports.Count;
        }

        public static async Task<bool> CloseReportAsync(Data.DataContext context, Data.Report report)
        {
            if (report?.FromPost is null)
                return false;

            report.FromPost.Deleted = true;
            report.Closed = true;
            report.CloseTime = DateTime.UtcNow;
            await context.SaveChangesAsync();

            return true;
        }
    }

    public class MessagePost : VkNet.Model.Attachments.MediaAttachment
    {
        protected override string Alias => "wall";

        public MessagePost(long owner_id, long id)
        {
            Id = id;
            OwnerId = -owner_id;
        }

        public MessagePost(Data.Post post)
        {
            Id = post.PostId;
            OwnerId = -post.Group.GroupId;
        }
    }
}
