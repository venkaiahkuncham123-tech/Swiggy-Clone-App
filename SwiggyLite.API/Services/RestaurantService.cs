using Microsoft.EntityFrameworkCore;
using SwiggyLite.API.Data;
using SwiggyLite.API.Models;

namespace SwiggyLite.API.Services;

public class RestaurantService(AppDbContext db) : IRestaurantService
{
    private readonly AppDbContext _db = db;

    public async Task<IEnumerable<Restaurant>> GetAllAsync()
    {
        return await _db.Restaurants
            .Where(r => r.IsActive)
            .OrderByDescending(r => r.Rating)
            .ToListAsync();
    }

    public async Task<Restaurant?> GetByIdAsync(int id)
    {
        return await _db.Restaurants
            .FirstOrDefaultAsync(r => r.Id == id && r.IsActive);
    }

    public async Task<IEnumerable<Restaurant>> SearchAsync(string? query, string? cuisine, string? area, int? minRating)
    {
        var restaurants = _db.Restaurants.Where(r => r.IsActive).AsQueryable();

        if (!string.IsNullOrWhiteSpace(query))
        {
            var q = query.ToLower();
            restaurants = restaurants.Where(r => r.Name.ToLower().Contains(q) || (r.Description != null && r.Description.ToLower().Contains(q)));
        }

        if (!string.IsNullOrWhiteSpace(cuisine))
        {
            restaurants = restaurants.Where(r => r.Cuisine.ToLower() == cuisine.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(area))
        {
            restaurants = restaurants.Where(r => r.Area != null && r.Area.ToLower().Contains(area.ToLower()));
        }

        if (minRating.HasValue)
        {
            restaurants = restaurants.Where(r => r.Rating >= minRating.Value);
        }

        return await restaurants.OrderByDescending(r => r.Rating).ToListAsync();
    }
}
