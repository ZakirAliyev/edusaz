using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edusaz.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCampaignsAndUniversityIdToScholarships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UniversityId",
                table: "Scholarships",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Campaigns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UniversityId = table.Column<Guid>(type: "uuid", nullable: true),
                    Title = table.Column<string>(type: "text", nullable: false),
                    TargetRegion = table.Column<string>(type: "text", nullable: false),
                    TargetCountry = table.Column<string>(type: "text", nullable: false),
                    Budget = table.Column<string>(type: "text", nullable: false),
                    Reach = table.Column<string>(type: "text", nullable: false),
                    DailyApplications = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CampaignType = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Campaigns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Campaigns_Universities_UniversityId",
                        column: x => x.UniversityId,
                        principalTable: "Universities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CampaignTranslations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CampaignId = table.Column<Guid>(type: "uuid", nullable: false),
                    LanguageId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CampaignTranslations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CampaignTranslations_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CampaignTranslations_Languages_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "Languages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Scholarships_UniversityId",
                table: "Scholarships",
                column: "UniversityId");

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_UniversityId",
                table: "Campaigns",
                column: "UniversityId");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignTranslations_CampaignId",
                table: "CampaignTranslations",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignTranslations_LanguageId",
                table: "CampaignTranslations",
                column: "LanguageId");

            migrationBuilder.AddForeignKey(
                name: "FK_Scholarships_Universities_UniversityId",
                table: "Scholarships",
                column: "UniversityId",
                principalTable: "Universities",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Scholarships_Universities_UniversityId",
                table: "Scholarships");

            migrationBuilder.DropTable(
                name: "CampaignTranslations");

            migrationBuilder.DropTable(
                name: "Campaigns");

            migrationBuilder.DropIndex(
                name: "IX_Scholarships_UniversityId",
                table: "Scholarships");

            migrationBuilder.DropColumn(
                name: "UniversityId",
                table: "Scholarships");
        }
    }
}
