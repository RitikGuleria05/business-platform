using BusinessPlatform.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace BusinessPlatform.Infrastructure.Security
{
    public class JwtService : ITokenService
    {
        private readonly string _key;

        public JwtService(IConfiguration configuration)
        {
            _key = configuration["Jwt:Key"]!;
        }

        public string GenerateToken(Guid userId,string email,string role)
        {
            var claims = new List<Claim>
            {
                new Claim("id", userId.ToString()),

                new Claim(ClaimTypes.Email,email),

                new Claim(ClaimTypes.Role, role)

            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));

            var discriptor = new SecurityTokenDescriptor
             {
                Subject = new ClaimsIdentity(claims),


                Expires = DateTime.UtcNow.AddMinutes(15),// can change according to the need


                SigningCredentials =
                    new SigningCredentials(
                        key,
                        SecurityAlgorithms.HmacSha256
                    )
            };

            var handler = new JsonWebTokenHandler();

            return handler.CreateToken(discriptor);
        }

        public string GenerateRefreshToken()
        {
            return Guid.NewGuid().ToString();
        }

    }
}
