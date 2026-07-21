using System.Text;
using Edusaz.Application.Abstracts.Repositories.Languages;
using Edusaz.Application.Abstracts.Repositories.Universities;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;
using Edusaz.Infrastructure.Services;
using Edusaz.Application.Concretes.Services;
using Edusaz.Application.Abstracts.AI;
using Edusaz.Infrastructure.AI;
using Edusaz.Infrastructure.AI;
using Edusaz.Infrastructure.Repositories.Languages;
using Edusaz.Infrastructure.Repositories.Universities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Database
builder.Services.AddDbContext<EdusazDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSQL")));

// Configure Identity
builder.Services.AddIdentity<User, Role>()
    .AddEntityFrameworkStores<EdusazDbContext>()
    .AddDefaultTokenProviders();

// Configure JWT Authentication
var secretKey = builder.Configuration["Jwt:SecretKey"] ?? "edusaz_super_secret_key_1234567890";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

// Register Repositories & Services
builder.Services.AddScoped<ILanguageReadRepository, LanguageReadRepository>();
builder.Services.AddScoped<ILanguageWriteRepository, LanguageWriteRepository>();
builder.Services.AddScoped<IUniversityReadRepository, UniversityReadRepository>();
builder.Services.AddScoped<IUniversityWriteRepository, UniversityWriteRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ILanguageService, LanguageService>();
builder.Services.AddScoped<IUniversityService, UniversityService>();
builder.Services.AddScoped<ITranslationAIService, MockTranslationAIService>();

// Configure CORS for React Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

var app = builder.Build();

// Seed data
using (var scope = app.Services.CreateScope())
{
    await Edusaz.Infrastructure.Contexts.DataSeeder.SeedAsync(scope.ServiceProvider);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
