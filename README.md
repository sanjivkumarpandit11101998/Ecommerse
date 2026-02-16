# Ecommerce Application - Modular Monolith Architecture

A Node.js ecommerce application built with **Modular Monolith + Layered Architecture + Vertical Feature Structure**.

## Architecture Overview

This project combines three architectural patterns:

1. **Modular Monolith** - A monolithic application organized into independent, loosely-coupled modules
2. **Layered Architecture** - Each module follows traditional layers (Controller → Service → Repository)
3. **Vertical Feature Structure** - Each feature/module contains all its layers vertically organized

```
┌─────────────────────────────────────────────────────────┐
│                    MODULAR MONOLITH                      │
├─────────────────────────────────────────────────────────┤
│  Product Module          │  User Module                 │
│  ┌─────────────────────┐ │  ┌─────────────────────┐   │
│  │ Controller          │ │  │ Controller          │   │
│  ├─────────────────────┤ │  ├─────────────────────┤   │
│  │ Service             │ │  │ Service             │   │
│  ├─────────────────────┤ │  ├─────────────────────┤   │
│  │ Repository          │ │  │ Repository          │   │
│  ├─────────────────────┤ │  ├─────────────────────┤   │
│  │ Model               │ │  │ Model               │   │
│  └─────────────────────┘ │  └─────────────────────┘   │
│                          │                              │
│  Order Module            │  Cart Module                  │
│  ┌─────────────────────┐ │  ┌─────────────────────┐   │
│  │ Controller          │ │  │ Controller          │   │
│  ├─────────────────────┤ │  ├─────────────────────┤   │
│  │ Service             │ │  │ Service             │   │
│  ├─────────────────────┤ │  ├─────────────────────┤   │
│  │ Repository          │ │  │ Repository          │   │
│  ├─────────────────────┤ │  ├─────────────────────┤   │
│  │ Model               │ │  │ Model               │   │
│  └─────────────────────┘ │  └─────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Key Principles

- **Vertical Slicing**: Each module contains all layers (Controller, Service, Repository, Model)
- **Self-Contained**: Modules are independent and can be developed/maintained separately
- **Loose Coupling**: Modules communicate through well-defined interfaces
- **Shared Infrastructure**: Common utilities, config, and middleware are shared

## Project Structure

```
Ecommerce/
├── src/
│   ├── config/              # Shared Configuration
│   │   ├── app.js           # App configuration
│   │   └── database.js      # Database setup
│   │
│   ├── modules/            # Feature Modules (Vertical Structure)
│   │   │
│   │   ├── product/         # Product Module (Self-contained)
│   │   │   ├── ProductController.js    # Presentation Layer
│   │   │   ├── ProductService.js      # Business Logic Layer
│   │   │   ├── ProductRepository.js   # Data Access Layer
│   │   │   ├── Product.js              # Domain Model
│   │   │   ├── productRoutes.js       # Routes
│   │   │   └── index.js                # Module Public API
│   │   │
│   │   ├── user/            # User Module (Self-contained)
│   │   │   ├── UserController.js
│   │   │   ├── UserService.js
│   │   │   ├── UserRepository.js
│   │   │   ├── User.js
│   │   │   ├── userRoutes.js
│   │   │   └── index.js
│   │   │
│   │   ├── order/           # Order Module (Self-contained)
│   │   │   ├── OrderController.js
│   │   │   ├── OrderService.js
│   │   │   ├── OrderRepository.js
│   │   │   ├── Order.js
│   │   │   ├── orderRoutes.js
│   │   │   └── index.js
│   │   │
│   │   └── cart/            # Cart Module (Self-contained)
│   │       ├── CartController.js
│   │       ├── CartService.js
│   │       ├── CartRepository.js
│   │       ├── Cart.js
│   │       ├── cartRoutes.js
│   │       └── index.js
│   │
│   ├── shared/              # Shared Infrastructure
│   │   └── types/           # Shared types/interfaces for cross-module communication
│   │       └── index.js
│   │
│   ├── middleware/          # Shared Middleware
│   │   ├── auth.js          # Authentication
│   │   ├── errorHandler.js
│   │   └── validator.js
│   │
│   └── app.js              # Application Entry Point
│
├── .env.example
├── package.json
└── README.md
```

## Features

- ✅ **Modular Monolith** - Independent modules that can evolve separately
- ✅ **Layered Architecture** - Each module follows Controller → Service → Repository pattern
- ✅ **Vertical Feature Structure** - Each module contains all its layers (self-contained)
- ✅ **RESTful API** - Standard HTTP methods and status codes
- ✅ **Authentication & Authorization** - JWT-based auth with role-based access
- ✅ **Product Management** - CRUD operations for products
- ✅ **User Management** - Registration, login, profile management
- ✅ **Shopping Cart** - Add, remove, update cart items
- ✅ **Order Management** - Create orders from cart, track order status
- ✅ **Input Validation** - Request validation middleware
- ✅ **Error Handling** - Centralized error handling
- ✅ **Module Public APIs** - Each module exports a clean public interface

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Products
- `GET /api/products` - Get all products (with optional filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (Auth required)
- `PUT /api/users/profile` - Update user profile (Auth required)

### Cart
- `GET /api/cart` - Get user's cart (Auth required)
- `POST /api/cart/items` - Add item to cart (Auth required)
- `PUT /api/cart/items/:productId` - Update cart item quantity (Auth required)
- `DELETE /api/cart/items/:productId` - Remove item from cart (Auth required)
- `DELETE /api/cart` - Clear cart (Auth required)

### Orders
- `GET /api/orders` - Get orders (Auth required)
- `GET /api/orders/:id` - Get order by ID (Auth required)
- `POST /api/orders` - Create order from cart (Auth required)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Example Usage

### Register a user:
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get products:
```bash
curl http://localhost:3000/api/products
```

### Add to cart:
```bash
curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "productId": 1,
    "quantity": 2
  }'
```

## Architecture Benefits

### Modular Monolith Advantages
- **Independent Modules**: Each module can be developed, tested, and maintained independently
- **Clear Boundaries**: Well-defined module boundaries prevent tight coupling
- **Easy to Scale**: Modules can be extracted to microservices if needed
- **Single Deployment**: All modules deploy together (monolith benefits)

### Vertical Feature Structure Benefits
- **Self-Contained**: Each module has everything it needs (Controller, Service, Repository, Model)
- **Easy Navigation**: All related code for a feature is in one place
- **Reduced Coupling**: Modules don't share internal implementation details
- **Better Organization**: Features are organized vertically, not horizontally

### Layered Architecture Benefits
- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Layers can be tested independently
- **Maintainability**: Changes are isolated to specific layers
- **Reusability**: Business logic can be reused across different interfaces

### Layer Responsibilities

#### Controllers (Presentation Layer)
- Handle HTTP requests and responses
- Extract data from requests
- Call appropriate service methods
- Format and send responses
- **Location**: Inside each module

#### Services (Business Logic Layer)
- Implement business rules
- Orchestrate operations across repositories
- Handle business validations
- Transform data as needed
- **Location**: Inside each module

#### Repositories (Data Access Layer)
- Interact with data storage
- Perform CRUD operations
- Handle data queries and filters
- Abstract data access details
- **Location**: Inside each module

#### Models (Domain Layer)
- Define data structure
- Provide validation logic
- Handle data transformations
- **Location**: Inside each module (vertical structure)

### Cross-Module Communication
- Modules communicate through **public APIs** (exported via `index.js`)
- Shared types/interfaces in `src/shared/types/` for cross-module contracts
- Database and config are shared infrastructure

## Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] File upload for product images
- [ ] Advanced search and filtering
- [ ] Pagination
- [ ] Rate limiting
- [ ] API documentation (Swagger)
- [ ] Unit and integration tests

## License

ISC
