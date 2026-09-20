using Microsoft.EntityFrameworkCore;
using SwiggyLite.API.Models;

namespace SwiggyLite.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<MenuCategory> MenuCategories => Set<MenuCategory>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        base.OnModelCreating(mb);
        mb.Entity<User>().HasIndex(e => e.Email).IsUnique();
        mb.Entity<CartItem>().HasIndex(e => new { e.UserId, e.MenuItemId }).IsUnique();
        SeedRestaurants(mb);
        SeedCategories(mb);
        SeedMenuItems(mb);
        mb.Entity<Order>().Property(e => e.Status).HasMaxLength(50).HasConversion<string>();
    }

    private static void SeedRestaurants(ModelBuilder mb)
    {
        mb.Entity<Restaurant>().HasData(
            new() { Id = 1, Name = "Biryani Blues", Description = "Authentic Hyderabadi biryani", ImageUrl = "https://picsum.photos/seed/biryani/400/300", Cuisine = "Indian", Area = "Jubilee Hills", Rating = 4.5, Timings = "10:00 AM - 11:00 PM", DeliveryTimeMinutes = 35 },
            new() { Id = 2, Name = "Tandoori Flame", Description = "Smoky tandoori specialties", ImageUrl = "https://picsum.photos/seed/tandoor/400/300", Cuisine = "Indian", Area = "Banjara Hills", Rating = 4.3, Timings = "11:00 AM - 12:00 AM", DeliveryTimeMinutes = 40 },
            new() { Id = 3, Name = "Sushi Zen", Description = "Fresh Japanese sushi", ImageUrl = "https://picsum.photos/seed/sushi/400/300", Cuisine = "Japanese", Area = "Gachibowli", Rating = 4.7, Timings = "12:00 PM - 10:00 PM", DeliveryTimeMinutes = 30 },
            new() { Id = 4, Name = "Pizza Roma", Description = "Wood-fired Italian pizzas", ImageUrl = "https://picsum.photos/seed/pizza/400/300", Cuisine = "Italian", Area = "Madhapur", Rating = 4.2, Timings = "10:00 AM - 11:00 PM", DeliveryTimeMinutes = 45 },
            new() { Id = 5, Name = "Burger Hive", Description = "Gourmet burgers", ImageUrl = "https://picsum.photos/seed/burger/400/300", Cuisine = "American", Area = "HITEC City", Rating = 4.4, Timings = "11:00 AM - 12:00 AM", DeliveryTimeMinutes = 25 }
        );
    }

    private static void SeedCategories(ModelBuilder mb)
    {
        mb.Entity<MenuCategory>().HasData(
            new() { Id = 1, Name = "Biryani", RestaurantId = 1 },
            new() { Id = 2, Name = "Curries", RestaurantId = 1 },
            new() { Id = 3, Name = "Starters", RestaurantId = 1 },
            new() { Id = 4, Name = "Rolls", RestaurantId = 2 },
            new() { Id = 5, Name = "Sushi Sets", RestaurantId = 3 },
            new() { Id = 6, Name = "Pizzas", RestaurantId = 4 },
            new() { Id = 7, Name = "Burgers", RestaurantId = 5 }
        );
    }

    private static void SeedMenuItems(ModelBuilder mb)
    {
        mb.Entity<MenuItem>().HasData(
            new() { Id = 1, Name = "Chicken Dum Biryani", Description = "Fragrant basmati rice with spiced chicken", Price = 240.00m, ImageUrl = "https://picsum.photos/seed/biryani1/300/200", Category = "Biryani", RestaurantId = 1, MenuCategoryId = 1 },
            new() { Id = 2, Name = "Mutton Biryani", Description = "Rich and aromatic mutton biryani", Price = 320.00m, ImageUrl = "https://picsum.photos/seed/biryani2/300/200", Category = "Biryani", RestaurantId = 1, MenuCategoryId = 1 },
            new() { Id = 3, Name = "Veg Biryani", Description = "Mixed vegetable biryani with mint raita", Price = 170.00m, ImageUrl = "https://picsum.photos/seed/vegbiryani/300/200", Category = "Biryani", RestaurantId = 1, MenuCategoryId = 1 },
            new() { Id = 4, Name = "Hyderabadi Haleem", Description = "Traditional slow-cooked stew", Price = 190.00m, ImageUrl = "https://picsum.photos/seed/haleem/300/200", Category = "Curries", RestaurantId = 1, MenuCategoryId = 2 },
            new() { Id = 5, Name = "Paneer Butter Masala", Description = "Cottage cheese in creamy tomato gravy", Price = 180.00m, ImageUrl = "https://picsum.photos/seed/paneer/300/200", Category = "Curries", RestaurantId = 1, MenuCategoryId = 2 },
            new() { Id = 6, Name = "Seekh Kebabs", Description = "Spiced minced meat skewers", Price = 220.00m, ImageUrl = "https://picsum.photos/seed/seekh/300/200", Category = "Starters", RestaurantId = 1, MenuCategoryId = 3 },
            new() { Id = 7, Name = "Chicken Tikka Wrap", Description = "Grilled chicken tikka in herb wrap", Price = 160.00m, ImageUrl = "https://picsum.photos/seed/wrap/300/200", Category = "Rolls", RestaurantId = 2, MenuCategoryId = 4 },
            new() { Id = 8, Name = "Tandoori Roti", Description = "Whole wheat roti baked in clay oven", Price = 40.00m, ImageUrl = "https://picsum.photos/seed/roti/300/200", Category = "Rolls", RestaurantId = 2, MenuCategoryId = 4 },
            new() { Id = 9, Name = "Salmon Nigiri", Description = "Fresh Atlantic salmon over seasoned rice", Price = 640.00m, ImageUrl = "https://picsum.photos/seed/nigiri/300/200", Category = "Sushi Sets", RestaurantId = 3, MenuCategoryId = 5 },
            new() { Id = 10, Name = "Chicken Ramen", Description = "Rich tonkotsu broth with chashu", Price = 420.00m, ImageUrl = "https://picsum.photos/seed/ramen/300/200", Category = "Sushi Sets", RestaurantId = 3, MenuCategoryId = 5 },
            new() { Id = 11, Name = "Margherita Pizza", Description = "San Marzano tomatoes, buffalo mozzarella", Price = 320.00m, ImageUrl = "https://picsum.photos/seed/margherita/300/200", Category = "Pizzas", RestaurantId = 4, MenuCategoryId = 6 },
            new() { Id = 12, Name = "Pepperoni Pizza", Description = "Spicy pepperoni, melted mozzarella", Price = 360.00m, ImageUrl = "https://picsum.photos/seed/pepperoni/300/200", Category = "Pizzas", RestaurantId = 4, MenuCategoryId = 6 },
            new() { Id = 13, Name = "Classic Cheeseburger", Description = "Angus beef patty, cheddar, lettuce", Price = 220.00m, ImageUrl = "https://picsum.photos/seed/cheeseburger/300/200", Category = "Burgers", RestaurantId = 5, MenuCategoryId = 7 },
            new() { Id = 14, Name = "Bacon BBQ Burger", Description = "Smoked bacon, cheddar, onion rings", Price = 260.00m, ImageUrl = "https://picsum.photos/seed/bbqburger/300/200", Category = "Burgers", RestaurantId = 5, MenuCategoryId = 7 },
            new() { Id = 15, Name = "Truffle Fries", Description = "Crispy fries with truffle oil, parmesan", Price = 120.00m, ImageUrl = "https://picsum.photos/seed/trufflefries/300/200", Category = "Burgers", RestaurantId = 5, MenuCategoryId = 7 }
        );
    }
}
