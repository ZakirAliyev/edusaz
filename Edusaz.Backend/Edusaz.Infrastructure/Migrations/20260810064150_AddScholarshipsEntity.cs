using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edusaz.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddScholarshipsEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Scholarships",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: false),
                    CountryId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Amount = table.Column<string>(type: "text", nullable: false),
                    Deadline = table.Column<string>(type: "text", nullable: false),
                    Eligible = table.Column<string>(type: "text", nullable: false),
                    Places = table.Column<string>(type: "text", nullable: false),
                    ButtonType = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Scholarships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Scholarships_Countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Countries",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ScholarshipTranslations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ScholarshipId = table.Column<Guid>(type: "uuid", nullable: false),
                    LanguageId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Eligible = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScholarshipTranslations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScholarshipTranslations_Languages_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "Languages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ScholarshipTranslations_Scholarships_ScholarshipId",
                        column: x => x.ScholarshipId,
                        principalTable: "Scholarships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Scholarships_CountryId",
                table: "Scholarships",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_ScholarshipTranslations_LanguageId",
                table: "ScholarshipTranslations",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_ScholarshipTranslations_ScholarshipId",
                table: "ScholarshipTranslations",
                column: "ScholarshipId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ScholarshipTranslations");

            migrationBuilder.DropTable(
                name: "Scholarships");
        }
    }
}
