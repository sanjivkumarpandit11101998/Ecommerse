# Architecture Documentation

## Modular Monolith + Layered Architecture + Vertical Feature Structure

This document explains the architectural patterns used in this ecommerce application.

## Architecture Patterns

### 1. Modular Monolith
A monolithic application organized into independent, loosely-coupled modules. All modules run in the same process but maintain clear boundaries.

**Benefits:**
- Single deployment unit
- Easier development and debugging
- Can evolve to microservices if needed
- Clear module boundaries

### 2. Layered Architecture
Each module follows a traditional layered architecture:
- **Controller** → **Service** → **Repository** → **Model**

**Benefits:**
- Clear separation of concerns
- Easy to test each layer independently
- Standardized structure across modules

### 3. Vertical Feature Structure
Each feature/module contains all its layers vertically organized. Everything related to a feature is in one place.

**Benefits:**
- Self-contained modules
- Easy to navigate code
- Reduced coupling between modules
- Better feature isolation

## Module Structure

Each module follows this structure:

```
module-name/
├── [Module]Controller.js    # Presentation Layer - HTTP handling
├── [Module]Service.js       # Business Logic Layer - Business rules
├── [Module]Repository.js     # Data Access Layer - Database operations
├── [Module].js               # Domain Model - Entity definition
├── [module]Routes.js         # Route definitions
└── index.js                  # Public API - Module exports
```

## Module Communication

### Internal Communication (Within Module)
```
Controller → Service → Repository → Model
```

### Cross-Module Communication
Modules communicate through:
1. **Public APIs** - Each module exports its public interface via `index.js`
2. **Shared Types** - Common interfaces/types in `src/shared/types/`
3. **Shared Infrastructure** - Database, config, middleware

### Example: Order Module using Product Module
```javascript
// In OrderService.js
const productRepository = require('../product/ProductRepository');
// Access through module's public API
```

## Directory Structure

```
src/
├── config/              # Shared configuration
├── modules/              # Feature modules (vertical structure)
│   ├── product/         # Complete product feature
│   ├── user/            # Complete user feature
│   ├── order/           # Complete order feature
│   └── cart/            # Complete cart feature
├── shared/              # Shared code
│   └── types/           # Shared types/interfaces
├── middleware/          # Shared middleware
└── app.js              # Application entry point
```

## Module Independence

Each module:
- ✅ Has its own Controller, Service, Repository, Model
- ✅ Defines its own routes
- ✅ Exports a public API via `index.js`
- ✅ Can be developed independently
- ✅ Can be tested in isolation

## Shared Resources

The following are shared across modules:
- **Database** (`src/config/database.js`) - Shared data storage
- **Configuration** (`src/config/app.js`) - App-wide settings
- **Middleware** (`src/middleware/`) - Auth, validation, error handling
- **Types** (`src/shared/types/`) - Cross-module interfaces

## Adding a New Module

To add a new feature module:

1. Create module directory: `src/modules/[feature-name]/`
2. Add all layers:
   - `[Feature]Controller.js`
   - `[Feature]Service.js`
   - `[Feature]Repository.js`
   - `[Feature].js` (model)
   - `[feature]Routes.js`
   - `index.js` (public API)
3. Register routes in `src/app.js`
4. Update documentation

## Migration Path

This architecture allows for future migration:
- **Current**: Modular Monolith (all modules in one process)
- **Future**: Microservices (each module can become a separate service)

The vertical structure makes extraction easier because each module is already self-contained.

## Best Practices

1. **Keep modules independent** - Don't create circular dependencies
2. **Use public APIs** - Access other modules through their `index.js`
3. **Share only infrastructure** - Don't share business logic between modules
4. **Maintain layer boundaries** - Controllers shouldn't call repositories directly
5. **Test each layer** - Write tests for Controller, Service, and Repository separately

## Example Module: Product

```
product/
├── ProductController.js    # Handles HTTP requests
├── ProductService.js       # Business logic (stock validation, etc.)
├── ProductRepository.js    # Database operations
├── Product.js              # Product entity/model
├── productRoutes.js        # Express routes
└── index.js                # Exports: { ProductController, ProductService, ProductRepository, productRoutes }
```

## Benefits Summary

1. **Modular Monolith**: Single deployment, clear boundaries
2. **Layered Architecture**: Standardized structure, easy to test
3. **Vertical Structure**: Self-contained features, easy navigation
4. **Scalability**: Can extract modules to microservices later
5. **Maintainability**: Changes are isolated to specific modules/layers
