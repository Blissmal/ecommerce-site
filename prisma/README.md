# Database Design

This document provides an overview of the database schema for the e-commerce application with product variant support.

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ CartItem : has
    User ||--o{ Order : places
    User ||--o{ Review : writes
    User ||--o{ Like : gives
    
    Category ||--o{ Product : contains
    
    Product ||--o{ ProductVariant : has
    Product ||--o{ CartItem : "in"
    Product ||--o{ Review : receives
    Product ||--o{ Like : receives
    Product ||--o{ OrderItem : "in"
    
    ProductVariant ||--o{ CartItem : "in"
    ProductVariant ||--o{ OrderItem : "in"
    
    Order ||--o{ OrderItem : contains
    
    User {
        string id PK
        string authId UK
        string email UK
        string name
        string phone
        string address
        string country
        string town
        boolean verified
        string role
        datetime createdAt
    }
    
    Category {
        string id PK
        string name UK
        string slug UK
    }
    
    Product {
        string id PK
        string title
        string description
        float price
        int stock
        string imageUrl
        string[] images
        float discount
        string status
        datetime createdAt
        string categoryId FK
        string shortDescription
        string brand
        string model
        string sku UK
        float weight
        string dimensions
        string[] tags
        json specifications
        string[] availableColors
        string[] availableSizes
        string[] availableStorage
        string[] features
    }
    
    ProductVariant {
        string id PK
        string productId FK
        string sku UK
        float price
        int stock
        string color
        string size
        string storage
        string[] images
        float weight
        boolean isDefault
        datetime createdAt
        datetime updatedAt
    }
    
    CartItem {
        string id PK
        string userId FK
        string productId FK
        string variantId FK
        int quantity
    }
    
    Review {
        string id PK
        string userId FK
        string productId FK
        int rating
        string comment
        datetime createdAt
    }
    
    Like {
        string id PK
        string userId FK
        string productId FK
    }
    
    Order {
        string id PK
        string userId FK
        float total
        string receipt
        string paymentMethod
        string status
        string phoneNumber
        string checkoutRequestId UK
        string merchantRequestId
        string billingName
        string billingEmail
        string billingAddress
        string orderNotes
        datetime paymentInitiatedAt
        datetime paymentCompletedAt
        datetime createdAt
    }
    
    OrderItem {
        string id PK
        string orderId FK
        string productId FK
        string variantId FK
        int quantity
        float price
        json variantSnapshot
    }
```

## Database Schema Overview

### Core Entities

#### User
Stores user account information and authentication details.
- **Primary Key**: `id` (CUID)
- **Unique Constraints**: `authId`, `email`
- **Relationships**: Has many cart items, orders, reviews, and likes
- **Features**:
  - Email verification support via `verified` flag
  - Role-based access control via `role` field
  - Billing and shipping information storage

#### Category
Product categorization for organizing the catalog.
- **Primary Key**: `id` (CUID)
- **Unique Constraints**: `name`, `slug`
- **Relationships**: Contains many products
- **Features**:
  - SEO-friendly slugs for URLs
  - Unique category names

#### Product
Main product catalog with pricing, inventory, and media.
- **Primary Key**: `id` (CUID)
- **Foreign Keys**: `categoryId` → Category
- **Features**: 
  - Multiple images support via `images` array
  - **Aggregated stock** - Total stock across all variants
  - **Base price** - Lowest variant price for display
  - Optional discount pricing (applies to all variants)
  - Status tracking (ACTIVE, INACTIVE, DELETED)
  - Rich product details (brand, model, SKU, weight, dimensions)
  - **Available options** - Arrays defining what variants can be created:
    - `availableColors` - Color options (e.g., ["Blue", "Red", "Black"])
    - `availableSizes` - Size options (e.g., ["S", "M", "L", "XL"])
    - `availableStorage` - Storage options (e.g., ["128GB", "256GB", "512GB"])
  - **Specifications** - JSON field for product specs (e.g., chipset, camera)
  - **Features** - Array of product features (e.g., ["Free delivery", "1 year warranty"])
  - **Tags** - Array of searchable tags

#### ProductVariant (🆕 NEW)
Individual product variants with specific combinations of options.
- **Primary Key**: `id` (CUID)
- **Foreign Keys**: `productId` → Product
- **Unique Constraints**: 
  - `sku` - Unique SKU for each variant
  - `(productId, color, size, storage)` - Prevents duplicate variant combinations
- **Features**:
  - **Variant-specific pricing** - Each variant can have different price
  - **Individual stock tracking** - Stock managed per variant
  - **Variant options**:
    - `color` - Optional color (e.g., "Blue")
    - `size` - Optional size (e.g., "M", "9")
    - `storage` - Optional storage capacity (e.g., "256GB")
  - **Variant images** - Specific images for this variant
  - **Default variant** - `isDefault` flag marks the primary variant to display
  - **SKU** - Unique identifier (e.g., "IP14-256-BLU")
  - **Weight** - Variant-specific weight (may differ by storage/size)

**Example**: iPhone 14 Product
```
Product: iPhone 14
- price: 799 (minimum variant price)
- stock: 150 (sum of all variants)
- availableColors: ["Blue", "Purple", "Midnight"]
- availableStorage: ["128GB", "256GB", "512GB"]

Variants:
1. iPhone 14 128GB Blue - SKU: IP14-128-BLU, price: 799, stock: 50
2. iPhone 14 256GB Blue - SKU: IP14-256-BLU, price: 899, stock: 30
3. iPhone 14 512GB Purple - SKU: IP14-512-PUR, price: 1099, stock: 20
```

### Shopping Features

#### CartItem (🔄 UPDATED)
Represents items in a user's shopping cart.
- **Primary Key**: `id` (CUID)
- **Foreign Keys**: 
  - `userId` → User
  - `productId` → Product
  - `variantId` → ProductVariant (🆕 NEW)
- **Unique Constraint**: `(userId, productId, variantId)` - User can have one of each variant in cart
- **Features**:
  - Links to specific product variant
  - Quantity tracking per variant
  - Cascade delete when user, product, or variant is deleted

#### Like
Product wishlist/favorites functionality.
- **Primary Key**: `id` (CUID)
- **Foreign Keys**: `userId` → User, `productId` → Product
- **Unique Constraint**: `(userId, productId)` - One like per product per user
- **Note**: Likes are at product level, not variant level

#### Review
Customer product reviews and ratings.
- **Primary Key**: `id` (CUID)
- **Foreign Keys**: `userId` → User, `productId` → Product
- **Features**: 
  - Star rating (0-5)
  - Text comment
  - Timestamp tracking
- **Note**: Reviews are at product level, not variant level

### Order Management

#### Order
Customer orders with payment and fulfillment tracking.
- **Primary Key**: `id` (CUID)
- **Foreign Keys**: `userId` → User
- **Payment Methods**: M-PESA, Bank Transfer
- **Status Flow**: 
  - PENDING → PROCESSING → PAID → SHIPPED → DELIVERED
  - Or PENDING → FAILED/CANCELLED
- **M-PESA Integration**: 
  - `checkoutRequestId` - Unique identifier for payment requests
  - `merchantRequestId` - Merchant transaction reference
  - `phoneNumber` - Customer phone for M-PESA
  - Timestamp tracking for payment lifecycle
- **Billing Information**:
  - Customer name, email, address
  - Order notes from customer

#### OrderItem (🔄 UPDATED)
Line items within an order.
- **Primary Key**: `id` (CUID)
- **Foreign Keys**: 
  - `orderId` → Order
  - `productId` → Product
  - `variantId` → ProductVariant (🆕 NEW, nullable with SetNull on delete)
- **Features**: 
  - Captures quantity and price at time of order
  - **Variant snapshot** (🆕 NEW) - JSON field storing variant details at purchase time:
    ```json
    {
      "sku": "IP14-256-BLU",
      "color": "Blue",
      "size": null,
      "storage": "256GB"
    }
    ```
  - This ensures historical accuracy even if variant is later modified or deleted

## Enumerations

### PaymentMethod
- `MPESA` - Mobile money payment (Safaricom M-PESA)
- `BANK` - Bank transfer

### OrderStatus
- `PENDING` - Order created, payment not initiated
- `PROCESSING` - Payment initiated (STK push sent for M-PESA)
- `PAID` - Payment successful, order confirmed
- `FAILED` - Payment failed
- `CANCELLED` - Order cancelled by user or admin
- `SHIPPED` - Order shipped to customer
- `DELIVERED` - Order delivered and completed

### ProductStatus
- `ACTIVE` - Product visible and available for purchase
- `INACTIVE` - Product hidden but not deleted (can be reactivated)
- `DELETED` - Soft-deleted product (hidden from all listings)

## Key Features

### 🆕 Product Variant System

The variant system allows products to have multiple configurations (colors, sizes, storage options) with individual pricing and stock:

**Benefits**:
- ✅ Different prices per variant (e.g., 128GB vs 512GB iPhone)
- ✅ Individual stock tracking per variant
- ✅ Variant-specific images
- ✅ Flexible options (color + size + storage combinations)
- ✅ Prevents duplicate variants via unique constraint
- ✅ Default variant selection for product listings

**Usage Example**:
```typescript
// Product with variants
{
  title: "Nike Air Max",
  price: 89.99,  // Minimum variant price
  stock: 45,     // Total stock
  availableColors: ["Black", "White", "Red"],
  availableSizes: ["8", "9", "10", "11"],
  variants: [
    {
      sku: "NAM-8-BLK",
      color: "Black",
      size: "8",
      price: 89.99,
      stock: 5,
      isDefault: true
    },
    {
      sku: "NAM-11-RED",
      color: "Red",
      size: "11",
      price: 94.99,  // Different price
      stock: 3
    }
  ]
}
```

### Multi-Image Support
Products support multiple images through:
- `imageUrl` - Primary product image (backward compatible)
- `images[]` - Array of additional product images
- Variant `images[]` - Variant-specific images (e.g., color-specific photos)

### Price Calculation
- **Product.price** - Displays the minimum variant price ("From $X.XX")
- **ProductVariant.price** - Actual price for that specific variant
- **Discount** - Applied at product level, affects all variants proportionally

### Stock Management
- **Product.stock** - Aggregated total across all variants
- **ProductVariant.stock** - Individual stock per variant
- Stock validation happens at variant level during checkout

### M-PESA Integration
The Order model includes fields specifically for M-PESA STK Push payment flow:
- Unique checkout request tracking
- Payment status timestamps
- Customer phone number for STK push
- Receipt storage

### Historical Data Preservation

**OrderItem.variantSnapshot** preserves variant configuration at purchase time:
- Even if variant is deleted/modified later, order history remains accurate
- Includes SKU, color, size, storage at time of purchase
- Essential for returns, refunds, and analytics

### Cascade Deletion Strategy

**Soft Deletes**:
- Products: Use `ProductStatus.DELETED` instead of hard delete
- Preserves order history and analytics

**Cascade Deletes**:
- Delete User → Deletes CartItems, Orders, Reviews, Likes
- Delete Product → Deletes ProductVariants, CartItems
- Delete ProductVariant → Removes from CartItems, Sets OrderItem.variantId to NULL

**Protected References**:
- OrderItem.variant uses `onDelete: SetNull` to preserve orders when variants deleted
- OrderItem.variantSnapshot preserves details even when variant is gone

## Indexes

Performance optimization through strategic indexing:

- **CartItem**: `userId`, `productId` - Fast cart retrieval
- **ProductVariant**: `productId` - Efficient variant queries
- **Review**: `productId` - Quick review lookups
- **Order**: `userId`, `status` - Fast order history and status filtering
- **OrderItem**: `orderId` - Efficient order detail retrieval

## Data Integrity Constraints

### Unique Constraints
- **User**: `authId`, `email` - Prevent duplicate accounts
- **Category**: `name`, `slug` - Unique categories
- **Product**: `sku` - Unique product identifiers
- **ProductVariant**: `sku`, `(productId, color, size, storage)` - Prevent duplicate variants
- **CartItem**: `(userId, productId, variantId)` - One variant per cart
- **Like**: `(userId, productId)` - One like per product
- **Order**: `checkoutRequestId` - Unique payment requests

### Referential Integrity
All foreign key relationships enforced with appropriate cascade behaviors:
- Deleting a user removes their cart, orders, reviews, and likes
- Deleting a product removes its variants and cascades appropriately
- Order items preserve historical data via snapshots and nullable variant references

## Technology Stack

- **ORM**: Prisma
- **Database**: PostgreSQL
- **ID Generation**: CUID (Collision-resistant Unique Identifiers)
- **Payment Gateway**: M-PESA STK Push API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your DATABASE_URL in `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

3. Run migrations:
```bash
npx prisma migrate dev
```

4. Generate Prisma Client:
```bash
npx prisma generate
```

5. Seed database (optional):
```bash
npx prisma db seed
```

## Migration from Simple Products to Variants

If migrating existing products to the variant system:

1. Create default variant for each existing product
2. Copy product price/stock to default variant
3. Set `isDefault: true` on the default variant
4. Update cart items to reference variant IDs
5. Maintain product-level aggregations

```sql
-- Example migration script
INSERT INTO "ProductVariant" (id, "productId", sku, price, stock, "isDefault")
SELECT 
  gen_random_uuid(),
  id,
  COALESCE(sku, CONCAT('PROD-', id)),
  price,
  stock,
  true
FROM "Product";
```

## Best Practices

### Product Setup
1. Always create at least one variant per product
2. Mark one variant as `isDefault: true`
3. Keep `Product.price` = MIN(variant prices)
4. Keep `Product.stock` = SUM(variant stocks)

### Cart Operations
1. Always specify `variantId` when adding to cart
2. Validate variant stock before adding
3. Handle sold-out variants gracefully

### Order Processing
1. Snapshot variant details in `OrderItem.variantSnapshot`
2. Record exact price at purchase time
3. Preserve order history even if variants change

### Performance
1. Use indexes for common queries
2. Batch variant queries with product includes
3. Cache product + default variant for listings

## License

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.