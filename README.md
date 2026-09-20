# SwiggyLite - Food Delivery Application

A full-stack food delivery application inspired by Swiggy, built with:

- **Frontend:** React.js + Vite + TypeScript + Bootstrap 5
- **Backend:** .NET 8 Web API
- **Database:** MySQL with Entity Framework Core (Pomelo)
- **Authentication:** JWT Bearer tokens
- **Real-time:** ASP.NET Core SignalR
- **API Docs:** Swagger/OpenAPI

## Key Features

- Browse restaurants by cuisine, area, or search
- View restaurant details and menu items
- Add items to cart and manage quantities
- Place orders with delivery address
- View order history and status tracking
- User authentication (register/login)
- **Real-time order status updates via SignalR**
- Order status simulation (Pending → Confirmed → Preparing → OutForDelivery → Delivered)
- Responsive design with Bootstrap 5
- Swagger API documentation

## Real-Time Order Tracking (SignalR)

The application uses **ASP.NET Core SignalR** for real-time order status updates. When a user places an order, they see live status changes without page refresh.

### Hub Methods

**Client → Server:**
- `JoinOrderGroup(orderId)` — Join a specific order's group
- `JoinUserOrderFeed(userId)` — Join all orders for a user
- `LeaveOrderGroup(orderId)` — Leave an order's group

**Server → Client:**
- `OrderStatusUpdated(orderId, newStatus)` — Pushed when an order's status changes
- `OrderCreated(orderId, status)` — Pushed when a new order is created

### Status Simulation

A background `OrderStatusSimulator` service automatically advances all non-delivered/cancelled orders through the pipeline every 5 seconds.

### Frontend SignalR Client

- **`src/api/signalr.ts`** — Manages the SignalR connection lifecycle
- **`src/pages/Orders.tsx`** — Connects on mount, displays live status updates with timeline
- **`src/components/CartSidebar.tsx`** — Mini-cart with checkout flow

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [MySQL Server 8+](https://dev.mysql.com/downloads/mysql/)

## Setup

### 1. Database Setup

```bash
# Start MySQL server, then run:
mysql -u root -p < mysql-init.sql
```

This creates the `swigglitedb` database with all tables, constraints, and seed data (2 restaurants, 6 menu items, and a test user).

### 2. Backend Setup

1. Update the connection string in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "server=localhost;port=3306;database=swigglitedb;user=root;password=your_password;SSL Mode=None;"
     },
     "Jwt": {
       "Key": "your-super-secret-key-that-is-at-least-32-characters-long!!",
       "Issuer": "swigglitedb",
       "Audience": "swigglitedbApp",
       "ExpiryMinutes": 60
     }
   }
   ```

2. Build and run the API:
   ```bash
   cd SwiggyLite.API
   dotnet restore
   dotnet build
   dotnet run
   ```

   The API will start at `https://localhost:5063`. Explore **Swagger UI** at `https://localhost:5063/swagger`.

### 3. Frontend Setup

```bash
cd SwiggyLite.Frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` with Vite HMR. API and SignalR requests are proxied to the backend.

For production:
```bash
npm run build
```
The frontend builds into `../SwiggyLite.API/wwwroot` for the backend to serve static files.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/restaurants` | List restaurants (with filters) |
| GET | `/api/restaurants/{id}` | Get restaurant details |
| GET | `/api/menus/restaurant/{id}` | Get menu for a restaurant |
| GET | `/api/cart` | Get current user's cart |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/update` | Update cart item quantity |
| DELETE | `/api/cart/remove/{menuItemId}` | Remove item from cart |
| DELETE | `/api/cart/clear` | Clear entire cart |
| POST | `/api/orders` | Place new order |
| GET | `/api/orders` | Get user's order history |
| GET | `/api/orders/{id}` | Get order by ID |

## Default Users

After running the seed script, you can use:

| Email | Password |
|-------|----------|
| `test@example.com` | `password123` |

## Usage Guide

### 1. Register / Login
Navigate to the **Sign Up** page to create a new account, or log in with the seeded test credentials.

### 2. Browse Restaurants
Once logged in, the home page shows all available restaurants. Use the search bar or cuisine filter to narrow results.

### 3. Order Food
1. Click any restaurant to view its menu
2. Add items using the **Add to Cart** buttons (floating mini-cart updates automatically)
3. Click **View Cart** in the mini-cart or the **Cart** nav link
4. On the cart page, review items, adjust quantities, then click **Proceed to Checkout**
5. Enter your delivery address and place the order

### 4. Track Your Order (Real-Time)
After placing an order, you're redirected to the **Orders** page where:
- An animated **status timeline** shows your order's progress
- Status updates arrive **in real-time** via SignalR
- The status automatically cycles: Pending → Confirmed → Preparing → OutForDelivery → Delivered

### 5. Admin: Order Simulation
When the backend runs, a background `OrderStatusSimulator` automatically advances all non-delivered orders every 5 seconds, demonstrating the real-time pipeline end-to-end.