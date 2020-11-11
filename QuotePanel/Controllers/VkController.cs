﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using QuotePanel.Data;
using System.Net;
using VkCallbackApi;
using System.Resources;

namespace QuotePanel.Controllers
{
    [ApiController]
    [Route("/vk/api")]
    public class VkController : ControllerBase
    {
        DataContext context;
        ILogger<VkController> logger;

        public VkController(DataContext _context, ILogger<VkController> _logger)
        {
            context = _context;
            logger = _logger;
        }

        [HttpPost]
        public async Task<string> Post([FromBody] CallbackResponse response)
        {
            var group = context.Groups.FirstOrDefault(t =>
                            t.GroupId == response.GroupId &&
                            t.Secret == response.Secret);

            if (group is null)
                return "Ok";

            if (response.Type == "confirmation")
                return group.Key;

            await VkHandler.HandleAsync(
                new VkCallbackApi(logger, group, context), 
                response,
                (method) => logger.LogInformation($"Method invoked: {method} in group {group.BuildNumber}"));
            return "Ok";
        }
    }
}