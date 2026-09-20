using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SwiggyLite.API.Data;
using SwiggyLite.API.Models;

namespace SwiggyLite.API.Services;

// AuthService handles user registration, login, and JWT token generation.
// It uses BCrypt for password hashing and ASP.NET Core Identity's JWT support for token creation.

public class AuthService(AppDbContext db, IConfiguration config) : IAuthService
{
    private readonly AppDbContext _db = db;
    private readonly IConfiguration _config = config;

    public async Task<User?> RegisterAsync(string email, string password, string fullName, string? phone)
    {
        // Check if email is already registered
        if (await _db.Users.AnyAsync(u => u.Email == email))
            return null;

        // Create new user with hashed password
        var user = new User
        {
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            FullName = fullName,
            Phone = phone
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return user;
    }

    public async Task<(User? User, string? Token)> LoginAsync(string email, string password)
    {
        // Find user by email
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return (null, null);

        // Generate JWT token
        var token = GenerateJwtToken(user);
        return (user, token);
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _db.Users.FindAsync(id);
    }

    private string GenerateJwtToken(User user)
    {
        // Create security key from configuration
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "SuperSecretKeyForDevelopment12345!"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Create claims for the token
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Name, user.FullName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User")
        };

        // Create and return the JWT token
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "SwiggyLite",
            audience: _config["Jwt:Audience"] ?? "SwiggyLiteApp",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
