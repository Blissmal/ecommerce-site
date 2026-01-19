# Database Design

This document provides an overview of the database schema for the e-commerce application.

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ CartItem : has
    User ||--o{ Order : places
    User ||--o{ Review : writes
    User ||--o{ Like : gives
    
    Category ||--o{ Product : contains
    
    Product ||--o{ CartItem : "in"
    Product ||--o{ Review : receives
    Product ||--o{ Like : receives
    Product ||--o{ OrderItem : "in"
    
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
    }
    
    CartItem {
        string id PK
        string userId FK
        string productId FK
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
        int quantity
        float price
    }
```

## Database Schema Overview

### Core Entities

#### User
Stores user account information and authentication details.
- **Primary Key**: `id` (CUID)
- **Unique Constraints**: `authId`, `email`
- **Relationships**: Has many cart items, orders, reviews, and likes

#### Category
Product categorization for organizing the catalog.
- **Primary Key**: `id` (CUID)
- **Unique Constraints**: `name`, `slug`
- **Relationships**: Contains many products

#### Product
Main product catalog with pricing, inventory, and media.
- **Primary Key**: `id` (CUID)
- **Foreign Keys**: `categoryId` → Category
- **Features**: 
  - Multiple images support via `images` array
  - Stock management
  - Optional discount pricing
  - Status tracking (ACTIVE, INACTIVE, DELETED)

### Shopping Features

#### CartItem
Represents items in a user's shopping cart.
- **Primary Key**: `id` (CUID)
- **Foreign Keys**: `userId` → User, `productId` → Product
- **Unique Constraint**: `(userId, productId)` - prevents duplicate cart entries

#### Like
Product wishlist/favorites functionality.
- **Primary Key**: `id` (CUID)
- **Foreign Keys**: `userId` → User, `productId` → Product
- **Unique Constraint**: `(userId, productId)` - one like per product per user

#### Review
Customer product reviews and ratings.
- **Primary Key**: `id` (CUID)
- **Foreign Keys**: `userId` → User, `productId` → Product
- **Features**: Star rating (0-5) and text comment

### Order Management

#### Order
Customer orders with payment and fulfillment tracking.
- **Primary Key**: `id` (CUID)
- **Foreign Keys**: `userId` → User
- **Payment Methods**: M-PESA, Bank Transfer
- **Status Flow**: 
  - PENDING → PROCESSING → PAID → SHIPPED → DELIVERED
  - Or PENDING → FAILED/CANCELLED
- **M-PESA Integration**: Tracks `checkoutRequestId` and `merchantRequestId`

#### OrderItem
Line items within an order.
- **Primary Key**: `id` (CUID)
- **Foreign Keys**: `orderId` → Order, `productId` → Product
- **Features**: Captures quantity and price at time of order

## Enumerations

### PaymentMethod
- `MPESA` - Mobile money payment
- `BANK` - Bank transfer

### OrderStatus
- `PENDING` - Order created, payment not initiated
- `PROCESSING` - Payment initiated (STK push sent)
- `PAID` - Payment successful
- `FAILED` - Payment failed
- `CANCELLED` - Order cancelled
- `SHIPPED` - Order shipped
- `DELIVERED` - Order delivered

### ProductStatus
- `ACTIVE` - Product visible and available
- `INACTIVE` - Product hidden but not deleted
- `DELETED` - Soft-deleted product

## Key Features

### Multi-Image Support
Products support multiple images through the `images` array field, while maintaining backward compatibility with the `imageUrl` field for the primary image.

### M-PESA Integration
The Order model includes fields specifically for M-PESA STK Push payment flow:
- `checkoutRequestId` - Unique identifier for payment requests
- `merchantRequestId` - Merchant transaction reference
- `phoneNumber` - Customer phone for M-PESA
- Timestamp tracking for payment lifecycle

### User Verification
Users have a `verified` flag for email/phone verification workflows.

### Role-Based Access
The `role` field on User supports different access levels (USER, ADMIN, etc.).

## Technology Stack

- **ORM**: Prisma
- **Database**: PostgreSQL
- **ID Generation**: CUID (Collision-resistant Unique Identifiers)

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
