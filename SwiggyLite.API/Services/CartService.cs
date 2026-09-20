using Microsoft.EntityFrameworkCore;
using SwiggyLite.API.Data;
using SwiggyLite.API.Models;

namespace SwiggyLite.API.Services;

public class CartService(AppDbContext db) : ICartService
{
    private readonly AppDbContext _db = db;

    public async Task<IEnumerable<CartItem>> GetCartAsync(int userId)
    {
        return await _db.CartItems
            .Where(c => c.UserId == userId)
            .Include(c => c.MenuItem)
                .ThenInclude(m => m!.Restaurant)
            .OrderByDescending(c => c.AddedAt)
            .ToListAsync();
    }

    public async Task<CartItem?> AddToCartAsync(int userId, int menuItemId, int quantity)
    {
        var menuItem = await _db.MenuItems.FirstOrDefaultAsync(m => m.Id == menuItemId && m.IsAvailable);
        if (menuItem == null) return null;

        var existing = await _db.CartItems.FirstOrDefaultAsync(c => c.UserId == userId && c.MenuItemId == menuItemId);
        if (existing != null)
        {
            existing.Quantity += quantity;
            existing.UnitPrice = menuItem.Price;
            await _db.SaveChangesAsync();
            return existing;
        }

        var cartItem = new CartItem
        {
            UserId = userId,
            MenuItemId = menuItemId,
            Quantity = quantity,
            UnitPrice = menuItem.Price
        };

        _db.CartItems.Add(cartItem);
        await _db.SaveChangesAsync();
        return cartItem;
    }

    public async Task<CartItem?> UpdateCartItemAsync(int userId, int menuItemId, int quantity)
    {
        var cartItem = await _db.CartItems.FirstOrDefaultAsync(c => c.UserId == userId && c.MenuItemId == menuItemId);
        if (cartItem == null) return null;

        if (quantity <= 0)
        {
            _db.CartItems.Remove(cartItem);
        }
        else
        {
            cartItem.Quantity = quantity;
        }

        await _db.SaveChangesAsync();
        return cartItem;
    }

    public async Task<bool> RemoveFromCartAsync(int userId, int menuItemId)
    {
        var cartItem = await _db.CartItems.FirstOrDefaultAsync(c => c.UserId == userId && c.MenuItemId == menuItemId);
        if (cartItem == null) return false;

        _db.CartItems.Remove(cartItem);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<decimal> GetCartTotalAsync(int userId)
    {
        return await _db.CartItems
            .Where(c => c.UserId == userId)
            .SumAsync(c => c.UnitPrice * c.Quantity);
    }

    public async Task ClearCartAsync(int userId)
    {
        var items = await _db.CartItems.Where(c => c.UserId == userId).ToListAsync();
        _db.CartItems.RemoveRange(items);
        await _db.SaveChangesAsync();
    }
}
