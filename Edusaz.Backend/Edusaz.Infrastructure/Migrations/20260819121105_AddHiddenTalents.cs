using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edusaz.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHiddenTalents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HiddenTalents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    AdminNotes = table.Column<string>(type: "text", nullable: true),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Age = table.Column<string>(type: "text", nullable: true),
                    CityCountry = table.Column<string>(type: "text", nullable: true),
                    SocialLinks = table.Column<string>(type: "text", nullable: true),
                    SkillName = table.Column<string>(type: "text", nullable: false),
                    ExperienceDuration = table.Column<string>(type: "text", nullable: true),
                    SkillLevel = table.Column<string>(type: "text", nullable: true),
                    WhereUsed = table.Column<string>(type: "text", nullable: true),
                    WhatCreated = table.Column<string>(type: "text", nullable: true),
                    IdeaDescription = table.Column<string>(type: "text", nullable: true),
                    ProblemSolved = table.Column<string>(type: "text", nullable: true),
                    TargetAudience = table.Column<string>(type: "text", nullable: true),
                    CurrentProgress = table.Column<string>(type: "text", nullable: true),
                    MainGoal = table.Column<string>(type: "text", nullable: true),
                    DynamicCategoryQuestion = table.Column<string>(type: "text", nullable: true),
                    DynamicCategoryAnswer = table.Column<string>(type: "text", nullable: true),
                    VoiceNoteUrl = table.Column<string>(type: "text", nullable: true),
                    VideoUrl = table.Column<string>(type: "text", nullable: true),
                    UploadedFilesJson = table.Column<string>(type: "text", nullable: true),
                    EstimatedInvestment = table.Column<string>(type: "text", nullable: true),
                    CustomInvestmentAmount = table.Column<string>(type: "text", nullable: true),
                    NeededSupportTypes = table.Column<string>(type: "text", nullable: true),
                    OtherNeeds = table.Column<string>(type: "text", nullable: true),
                    TeamStatus = table.Column<string>(type: "text", nullable: true),
                    TeamSize = table.Column<int>(type: "integer", nullable: true),
                    TeamRoles = table.Column<string>(type: "text", nullable: true),
                    TeamNotes = table.Column<string>(type: "text", nullable: true),
                    OneYearVision = table.Column<string>(type: "text", nullable: true),
                    WantIncome = table.Column<string>(type: "text", nullable: true),
                    WantBusiness = table.Column<string>(type: "text", nullable: true),
                    UltimateAmbition = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HiddenTalents", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HiddenTalents");
        }
    }
}
