using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edusaz.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCountryUniversityRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CountryId",
                table: "Universities",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Universities_CountryId",
                table: "Universities",
                column: "CountryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Universities_Countries_CountryId",
                table: "Universities",
                column: "CountryId",
                principalTable: "Countries",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Universities_Countries_CountryId",
                table: "Universities");

            migrationBuilder.DropIndex(
                name: "IX_Universities_CountryId",
                table: "Universities");

            migrationBuilder.DropColumn(
                name: "CountryId",
                table: "Universities");
        }
    }
}
