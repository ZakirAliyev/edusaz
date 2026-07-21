using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edusaz.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUniversityUIFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AcceptanceRate",
                table: "Universities",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Deadline",
                table: "Universities",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "HasScholarship",
                table: "Universities",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Ranking",
                table: "Universities",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TeachingLanguage",
                table: "Universities",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Tuition",
                table: "Universities",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AcceptanceRate",
                table: "Universities");

            migrationBuilder.DropColumn(
                name: "Deadline",
                table: "Universities");

            migrationBuilder.DropColumn(
                name: "HasScholarship",
                table: "Universities");

            migrationBuilder.DropColumn(
                name: "Ranking",
                table: "Universities");

            migrationBuilder.DropColumn(
                name: "TeachingLanguage",
                table: "Universities");

            migrationBuilder.DropColumn(
                name: "Tuition",
                table: "Universities");
        }
    }
}
