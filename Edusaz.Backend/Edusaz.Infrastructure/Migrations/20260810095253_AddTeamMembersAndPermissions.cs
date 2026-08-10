using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edusaz.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTeamMembersAndPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TeamMembers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UniversityId = table.Column<Guid>(type: "uuid", nullable: true),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CanViewPrograms = table.Column<bool>(type: "boolean", nullable: false),
                    CanCreatePrograms = table.Column<bool>(type: "boolean", nullable: false),
                    CanEditPrograms = table.Column<bool>(type: "boolean", nullable: false),
                    CanDeletePrograms = table.Column<bool>(type: "boolean", nullable: false),
                    CanViewScholarships = table.Column<bool>(type: "boolean", nullable: false),
                    CanCreateScholarships = table.Column<bool>(type: "boolean", nullable: false),
                    CanEditScholarships = table.Column<bool>(type: "boolean", nullable: false),
                    CanDeleteScholarships = table.Column<bool>(type: "boolean", nullable: false),
                    CanViewCampaigns = table.Column<bool>(type: "boolean", nullable: false),
                    CanCreateCampaigns = table.Column<bool>(type: "boolean", nullable: false),
                    CanEditCampaigns = table.Column<bool>(type: "boolean", nullable: false),
                    CanDeleteCampaigns = table.Column<bool>(type: "boolean", nullable: false),
                    CanEditProfile = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeamMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TeamMembers_Universities_UniversityId",
                        column: x => x.UniversityId,
                        principalTable: "Universities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_TeamMembers_UniversityId",
                table: "TeamMembers",
                column: "UniversityId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TeamMembers");
        }
    }
}
