using System.Threading.Tasks;
using Edusaz.Application.Dtos;

namespace Edusaz.Application.Abstracts.Services;

public interface IAuthService
{
    Task<bool> RegisterAsync(RegisterDto registerDto);
    Task<TokenDto> LoginAsync(LoginDto loginDto);
    Task<UserProfileDto?> GetUserProfileAsync(string email);
    Task<UserProfileDto> UpdateUserProfileAsync(string email, UpdateUserProfileDto dto);
}
