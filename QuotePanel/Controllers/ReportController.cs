﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml;
using QuotePanel.Data;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace QuotePanel.Controllers
{
    [Route("/provider/report")]
    public class ReportController : Controller
    {
        DataContext context;
        Group group;
        UserRole role;

        public ReportController(DataContext context, IHttpContextAccessor accessor)
        {
            var httpContext = accessor.HttpContext;

            this.context = context;
            if (httpContext.User.HasClaim(t => t.Type == "Role"))
                role = httpContext.User.Claims.First(t => t.Type == "Role").Value switch
                {
                    "User" => UserRole.User,
                    "GroupModer" => UserRole.GroupModer,
                    "GroupAdmin" => UserRole.GroupAdmin,
                    "Moder" => UserRole.Moder,
                    _ => UserRole.Admin
                };

            var claim = httpContext.User.Claims.FirstOrDefault(t => t.Type == "GroupId");

            if (claim is Claim)
                group = context.Groups.SingleOrDefault(t => t.Id == int.Parse(claim.Value));
        }

        [Route("{id}")]
        [Authorize(Policy = "GroupModer")]
        public IActionResult Index([FromRoute]int id)
        {
            var report = context.GetReport(group, id);

            if (report == null)
                return NotFound();

            var reportItems = context.GetReportItems(report).ToList();

            using (var excel = new ExcelPackage())
            {
                var worksheet = excel.Workbook.Worksheets.Add(report.Name);
                worksheet.Select();

                worksheet.Cells[1, 1].Value = "№";
                worksheet.Cells[1, 2].Value = "Name";
                worksheet.Cells[1, 3].Value = "Room";


                int i = 0;
                for (i = 0; i < reportItems.Count; i++)
                {
                    var color = reportItems[i].Verified ? System.Drawing.Color.LightGreen : System.Drawing.Color.Red;
                    worksheet.Cells[i + 2, 1].Value = i + 1;
                    worksheet.Cells[i + 2, 2].Value = reportItems[i].User.Name;
                    worksheet.Cells[i + 2, 3].Value = reportItems[i].User.Room;
                    
                    worksheet.Cells[i + 2, 1, i + 2, 3].Style.Fill.SetBackground(color);

                    
                }
                worksheet.Cells.Style.Font.Size = 16;

                var maxCell = worksheet.Cells[i + 3, 1, i + 3, 3];
                maxCell.Merge = true;
                maxCell.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                maxCell.Value = $"Max: {report.Max}, in report: {i}";


                worksheet.Column(2).AutoFit();

                return File(excel.GetAsByteArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            }
        }
    }
}