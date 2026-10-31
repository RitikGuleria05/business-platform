using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace BusinessPlatform.Tests.Integration_Tests;

public static class TestJwtTokenGenerator
{
    public static string GenerateToken(Guid userId,string key)
    {
        var claims = new List<Claim>
        {
            new("id", userId.ToString()),
            new(ClaimTypes.Email, "integration@test.com"),
            new(ClaimTypes.Role, "Employee")
        };

        var signingKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key));

        var credentials = new SigningCredentials(
            signingKey,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(5),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}