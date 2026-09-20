using Microsoft.EntityFrameworkCore;
using SwiggyLite.API.Data;
using SwiggyLite.API.Models;

namespace SwiggyLite.API.Services;

public class MenuService(AppDbContext db) : IMenuService
{
    private readonly AppDbContext _db = db;

    public async Task<IEnumerable<MenuItem>> GetMenuByRestaurantAsync(int restaurantId)
    {
        return await _db.MenuItems
            .Where(m => m.RestaurantId == restaurantId && m.IsAvailable)
            .Include(m => m.MenuCategory)
            .OrderBy(m => m.Category)
            .ThenBy(m => m.Name)
            .ToListAsync();
    }

    public async Task<MenuItem?> GetMenuItemAsync(int menuItemId)
    {
        return await _db.MenuItems
            .FirstOrDefaultAsync(m => m.Id == menuItemId && m.IsAvailable);
    }
}
