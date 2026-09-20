using Microsoft.EntityFrameworkCore;
using SwiggyLite.API.Data;
using SwiggyLite.API.Models;

namespace SwiggyLite.API.Services;

public class OrderService(AppDbContext db, ICartService cartService) : IOrderService
{
    private readonly AppDbContext _db = db;
    private readonly ICartService _cartService = cartService;

    public async Task<Order> CreateOrderAsync(int userId, int restaurantId, string deliveryAddress, string? instructions, IEnumerable<(int menuItemId, int quantity)> items)
    {
        var cartItems = await _cartService.GetCartAsync(userId);
        var cartTotal = await _cartService.GetCartTotalAsync(userId);

        if (!cartItems.Any())
            throw new InvalidOperationException("Cart is empty");

        var order = new Order
        {
            UserId = userId,
            RestaurantId = restaurantId,
            DeliveryAddress = deliveryAddress,
            Instructions = instructions,
            Status = "Pending",
            TotalAmount = cartTotal,
            CreatedAt = DateTime.UtcNow
        };

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        foreach (var cartItem in cartItems)
        {
            var orderItem = new OrderItem
            {
                OrderId = order.Id,
                MenuItemId = cartItem.MenuItemId,
                ItemName = cartItem.MenuItem!.Name,
                Quantity = cartItem.Quantity,
                UnitPrice = cartItem.UnitPrice,
                TotalPrice = cartItem.UnitPrice * cartItem.Quantity
            };
            _db.OrderItems.Add(orderItem);
        }

        await _db.SaveChangesAsync();
        await _cartService.ClearCartAsync(userId);

        return order;
    }

    public async Task<IEnumerable<Order>> GetUserOrdersAsync(int userId)
    {
        return await _db.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.Restaurant)
            .Include(o => o.OrderItems)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<Order?> GetOrderByIdAsync(int orderId)
    {
        return await _db.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == orderId);
    }

    public async Task<bool> UpdateOrderStatusAsync(int orderId, string newStatus)
    {
        var order = await _db.Orders.FindAsync(orderId);
        if (order == null) return false;

        order.Status = newStatus;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }
}
