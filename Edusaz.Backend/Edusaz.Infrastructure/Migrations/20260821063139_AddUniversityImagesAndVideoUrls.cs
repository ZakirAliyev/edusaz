using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edusaz.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUniversityImagesAndVideoUrls : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Programs_Universities_UniversityId",
                table: "Programs");

            migrationBuilder.AddColumn<List<string>>(
                name: "Images",
                table: "Universities",
                type: "text[]",
                nullable: true,
                defaultValueSql: "'{}'::text[]");

            migrationBuilder.AddColumn<List<string>>(
                name: "VideoUrls",
                table: "Universities",
                type: "text[]",
                nullable: true,
                defaultValueSql: "'{}'::text[]");

            migrationBuilder.AlterColumn<Guid>(
                name: "UniversityId",
                table: "Programs",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_Programs_Universities_UniversityId",
                table: "Programs",
                column: "UniversityId",
                principalTable: "Universities",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Programs_Universities_UniversityId",
                table: "Programs");

            migrationBuilder.DropColumn(
                name: "Images",
                table: "Universities");

            migrationBuilder.DropColumn(
                name: "VideoUrls",
                table: "Universities");

            migrationBuilder.AlterColumn<Guid>(
                name: "UniversityId",
                table: "Programs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Programs_Universities_UniversityId",
                table: "Programs",
                column: "UniversityId",
                principalTable: "Universities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
