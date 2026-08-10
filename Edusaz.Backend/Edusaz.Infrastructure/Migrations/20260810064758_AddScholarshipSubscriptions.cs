using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edusaz.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddScholarshipSubscriptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DegreeLevel",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DesiredField",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "EnglishScore",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "Gpa",
                table: "AspNetUsers",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.CreateTable(
                name: "ScholarshipSubscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ScholarshipId = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    MatchScore = table.Column<int>(type: "integer", nullable: false),
                    AnalysisSummary = table.Column<string>(type: "text", nullable: false),
                    RequirementBreakdown = table.Column<string>(type: "text", nullable: false),
                    IsEmailSent = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScholarshipSubscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScholarshipSubscriptions_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ScholarshipSubscriptions_Scholarships_ScholarshipId",
                        column: x => x.ScholarshipId,
                        principalTable: "Scholarships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ScholarshipSubscriptions_ScholarshipId",
                table: "ScholarshipSubscriptions",
                column: "ScholarshipId");

            migrationBuilder.CreateIndex(
                name: "IX_ScholarshipSubscriptions_UserId",
                table: "ScholarshipSubscriptions",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ScholarshipSubscriptions");

            migrationBuilder.DropColumn(
                name: "DegreeLevel",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "DesiredField",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "EnglishScore",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Gpa",
                table: "AspNetUsers");
        }
    }
}
