using System.Threading.Tasks;
using Edusaz.Application.Dtos;

namespace Edusaz.Application.Abstracts.Services;

public interface IPartnershipService
{
    Task<PartnershipApplicationResponseDto> CreatePartnershipApplicationAsync(CreatePartnershipApplicationDto dto);
}
