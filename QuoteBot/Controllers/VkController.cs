using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Net;
using VkCallbackApi;
using System.Resources;
using DatabaseContext;
using QuoteBot;

namespace QuotePanel.Controllers
{
    [ApiController]
    [Route("/vk/api")]
    public class VkController : ControllerBase
    {
        DataContext context;
        ILogger<VkController> logger;
        Dictionary<string, Language> languages;

        public VkController(DataContext _context, ILogger<VkController> _logger, Dictionary<string, Language> _languages)
        {
            context = _context;
            logger = _logger;
            languages = _languages;
        }

        [HttpPost]
        public async Task<string> Post([FromBody] CallbackRequest request)
        {
            var group = context.Groups.FirstOrDefault(t =>
                            t.GroupId == request.GroupId &&
                            t.Secret == request.Secret);

            if (group is null)
                return "Ok";

            if (request.Type == "confirmation")
                return group.Key;

            VkHandler.Handle(
                new VkCallbackApi(logger, group, context, languages),
                request,
                (method) => logger.LogInformation($"Method invoked: {method} in group {group.BuildNumber}"));
            return "Ok";
        }
    }
}
