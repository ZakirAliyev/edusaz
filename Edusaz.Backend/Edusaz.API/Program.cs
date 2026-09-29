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
using Edusaz.Infrastructure.Repositories.Languages;
using Edusaz.Infrastructure.Repositories.Universities;
using Edusaz.Application.Abstracts.Repositories.Countries;
using Edusaz.Infrastructure.Repositories.Countries;
using Edusaz.Application.Abstracts.Repositories.UniversityMedias;
using Edusaz.Infrastructure.Repositories.UniversityMedias;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Server-only secrets that must never live in this (public) repository, e.g. {"Jwt":{"SecretKey":"..."}}.
// The deploy workflow creates the file on the VPS; its values override appsettings*.json.
var secretsFile = Environment.GetEnvironmentVariable("EDUSAZ_SECRETS_FILE") ?? "/etc/edusaz/secrets.json";
builder.Configuration.AddJsonFile(secretsFile, optional: true, reloadOnChange: false);
builder.Configuration.AddEnvironmentVariables();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Database
builder.Services.AddDbContext<EdusazDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSQL")));

// Configure Identity
builder.Services.AddIdentity<User, Role>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 4;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
    options.User.RequireUniqueEmail = true;
})
    .AddEntityFrameworkStores<EdusazDbContext>()
    .AddDefaultTokenProviders();

// Configure JWT Authentication
// The old hard-coded key is public on GitHub, so tokens signed with it are never accepted again.
const string LegacyPublicJwtKey = "edusaz_super_secret_key_1234567890";
var secretKey = builder.Configuration["Jwt:SecretKey"];
if (string.IsNullOrWhiteSpace(secretKey) || secretKey == LegacyPublicJwtKey || secretKey.Length < 32)
{
    if (!builder.Environment.IsDevelopment())
        throw new InvalidOperationException($"Jwt:SecretKey is missing or insecure. Set it in {secretsFile}.");
    secretKey = "edusaz-local-development-only-signing-key-0123456789";
}
// Token issuing services read the same value from configuration.
builder.Configuration["Jwt:SecretKey"] = secretKey;
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
builder.Services.AddScoped<IUniversityMediaReadRepository, UniversityMediaReadRepository>();
builder.Services.AddScoped<IUniversityMediaWriteRepository, UniversityMediaWriteRepository>();
builder.Services.AddScoped<ICountryReadRepository, CountryReadRepository>();
builder.Services.AddScoped<ICountryWriteRepository, CountryWriteRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ILanguageService, LanguageService>();
builder.Services.AddScoped<IUniversityService, UniversityService>();
builder.Services.AddScoped<ICountryService, CountryService>();
builder.Services.AddScoped<IProgramService, ProgramService>();
builder.Services.AddScoped<IScholarshipService, ScholarshipService>();
builder.Services.AddScoped<ICampaignService, CampaignService>();
builder.Services.AddScoped<ITeamMemberService, TeamMemberService>();
builder.Services.AddScoped<IPartnershipService, PartnershipService>();
builder.Services.AddScoped<IInstructorService, InstructorService>();
builder.Services.AddScoped<IHiddenTalentService, HiddenTalentService>();
builder.Services.AddScoped<IFileService, FileService>();
builder.Services.AddScoped<ITranslationAIService, GoogleTranslationService>();
builder.Services.AddScoped<IEmailNotificationService, EmailNotificationService>();
builder.Services.AddHttpClient("GoogleTranslate");


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

Console.WriteLine($"[Edusaz] Environment: {app.Environment.EnvironmentName}");

// Seed data safely without crashing application
try
{
    using (var scope = app.Services.CreateScope())
    {
        await Edusaz.Infrastructure.Contexts.DataSeeder.SeedAsync(scope.ServiceProvider);
    }
}
catch (Exception ex)
{
    Console.WriteLine($"[CRITICAL] Data seeding error on startup: {ex.Message}");
}

// Enable Swagger UI in all environments (including Production at /swagger)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Edusaz API v1");
    c.RoutePrefix = "swagger";
});

// Locally the API runs on plain http (launchSettings "http" profile), so only force HTTPS outside Development.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseStaticFiles();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapGet("/", () => Results.Redirect("/swagger/index.html"));
app.MapGet("/swagger", () => Results.Redirect("/swagger/index.html"));
app.MapControllers();

app.Run();
