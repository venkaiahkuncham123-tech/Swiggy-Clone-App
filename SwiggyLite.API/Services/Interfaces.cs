using SwiggyLite.API.Models;

namespace SwiggyLite.API.Services;

public interface IAuthService
{
    Task<User?> RegisterAsync(string email, string password, string fullName, string? phone);
    Task<(User? User, string? Token)> LoginAsync(string email, string password);
    Task<User?> GetUserByIdAsync(int id);
}

public interface IRestaurantService
{
    Task<IEnumerable<Restaurant>> GetAllAsync();
    Task<Restaurant?> GetByIdAsync(int id);
    Task<IEnumerable<Restaurant>> SearchAsync(string? query, string? cuisine, string? area, int? minRating);
}

public interface IMenuService
{
    Task<IEnumerable<MenuItem>> GetMenuByRestaurantAsync(int restaurantId);
    Task<MenuItem?> GetMenuItemAsync(int menuItemId);
}

public interface ICartService
{
    Task<IEnumerable<CartItem>> GetCartAsync(int userId);
    Task<CartItem?> AddToCartAsync(int userId, int menuItemId, int quantity);
    Task<CartItem?> UpdateCartItemAsync(int userId, int menuItemId, int quantity);
    Task<bool> RemoveFromCartAsync(int userId, int menuItemId);
    Task<decimal> GetCartTotalAsync(int userId);
    Task ClearCartAsync(int userId);
}

public interface IOrderService
{
    Task<Order> CreateOrderAsync(int userId, int restaurantId, string deliveryAddress, string? instructions, IEnumerable<(int menuItemId, int quantity)> items);
    Task<IEnumerable<Order>> GetUserOrdersAsync(int userId);
    Task<Order?> GetOrderByIdAsync(int orderId);
    Task<bool> UpdateOrderStatusAsync(int orderId, string newStatus);
}
