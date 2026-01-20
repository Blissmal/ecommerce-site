# 🛍️ Next.js E-Commerce Platform with Product Variants

A modern, full-stack e-commerce platform built with **Next.js 16**, **Prisma**, **PostgreSQL**, and **Redux Toolkit**. Features a complete product variant system (color, size, storage), admin panel, cart management, and M-Pesa payment integration.

![Platform Banner](./public/images/banner.png)

> **Live Demo:** [ecommerce-site.vercel.app](https://your-deployment-url.vercel.app)  
> **Repository:** [github.com/Blissmal/ecommerce-site](https://github.com/Blissmal/ecommerce-site)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Database Setup](#-database-setup)
- [Project Structure](#-project-structure)
- [Product Variant System](#-product-variant-system)
- [Admin Panel](#-admin-panel)
- [Frontend Features](#-frontend-features)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### **🎯 Core Functionality**

- ✅ **Product Variant System** - Color, size, storage options per product
- ✅ **Dynamic Pricing** - Per-variant pricing with "From $X" display
- ✅ **Stock Management** - Individual stock tracking per variant
- ✅ **Shopping Cart** - Redux-based cart with optimistic updates
- ✅ **Order Management** - Complete order system with variant snapshots
- ✅ **Admin Panel** - Full CRUD operations for products and variants
- ✅ **Payment Integration** - M-Pesa STK Push payment gateway
- ✅ **User Authentication** - Stack Auth integration
- ✅ **Responsive Design** - Mobile-first, fully responsive UI
- ✅ **Real-time Updates** - Optimistic UI updates for better UX

### **🛒 Shopping Experience**

- Browse products with filters (category, price, brand)
- View product details with variant selection
- Add specific variants to cart
- See variant details (color, size, storage) in cart
- Secure checkout with multiple payment methods
- Order history with variant information preserved

### **⚙️ Admin Features**

- Create products with multiple variants
- Auto-generate variant combinations
- Manage stock per variant
- Set variant-specific pricing
- Upload multiple images per product/variant
- Add specifications, features, and tags
- Track orders and update statuses
- View sales statistics
- Category management
- User management

---

## 🚀 Tech Stack

### **Frontend**
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Redux Toolkit** - State management
- **React Hot Toast** - Notifications
- **React Hook Form** - Form handling
- **Swiper** - Touch sliders
- **Lucide React** - Icons

### **Backend**
- **Next.js API Routes** - Serverless API
- **Prisma 6.12** - ORM and database toolkit
- **PostgreSQL** - Relational database
- **Server Actions** - Next.js server-side functions

### **Authentication**
- **Stack Auth** - User authentication and management

### **Payment**
- **M-Pesa (Daraja API)** - Mobile payment integration

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Shop     │  │    Cart    │  │   Admin    │            │
│  │   Pages    │  │   System   │  │   Panel    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Pages    │  │API Routes  │  │   Server   │            │
│  │ (RSC/SSR)  │  │ (REST API) │  │  Actions   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Redux Store                             │
│  ┌────────────────────────────────────────────────┐         │
│  │  Cart Slice (with variant tracking)            │         │
│  └────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Prisma ORM Layer                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Product   │  │  Variant   │  │   Order    │            │
│  │  Actions   │  │  Actions   │  │  Actions   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Products  │  │  Variants  │  │   Orders   │            │
│  │  Category  │  │    Cart    │  │   Users    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎬 Getting Started

### **Prerequisites**

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- Stack Auth account ([stack-auth.com](https://stack-auth.com))
- M-Pesa Daraja API credentials (optional, for payments)

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/Blissmal/ecommerce-site.git
cd ecommerce-site
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create `.env.local` in the root directory:

```env
# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:root@localhost:5432/next-ecommerce

# Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID=your_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_key
STACK_SECRET_SERVER_KEY=your_secret_key

# M-Pesa (Optional)
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
MPESA_BUSINESS_SHORT_CODE=your_shortcode
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
```

4. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push
```

5. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💾 Database Setup

### **Database Schema**

The database schema is defined in `prisma/schema.prisma`. Key models:

#### **Product** (Base product information)
- Stores base info: title, description, brand
- `price` = minimum variant price (for display/sorting)
- `stock` = sum of all variant stocks
- Links to multiple variants

#### **ProductVariant** (Specific product combinations)
- Each variant = unique combination (color + size + storage)
- Has own: SKU, price, stock, images
- `isDefault` marks the primary variant

#### **OrderItem** (Historical purchase data)
- References `variantId` (which variant was purchased)
- `variantSnapshot` preserves variant data if variant deleted
- Stores `price` at time of purchase

### **Database Commands**

```bash
# View database in GUI
npx prisma studio

# Generate Prisma client (after schema changes)
npx prisma generate

# Push schema changes (development)
npx prisma db push

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

---

## 📁 Project Structure

```
ecommerce-site-main/
├── lib/
│   └── utils/
├── prisma/
├── public/
│   └── images/
├── services/
└── src/
    ├── app/
    │   ├── (site)/
    │   │   └── (pages)/
    │   │       ├── admin/
    │   │       │   ├── categories/
    │   │       │   ├── orders/
    │   │       │   ├── products/
    │   │       │   │   ├── add/
    │   │       │   │   └── [id]/
    │   │       │   │       └── edit/
    │   │       │   └── users/
    │   │       ├── cart/
    │   │       ├── checkout/
    │   │       ├── contact/
    │   │       ├── error/
    │   │       ├── handler/
    │   │       │   └── [...stack]/
    │   │       ├── mail-success/
    │   │       ├── my-account/
    │   │       ├── order-success/
    │   │       ├── shop-details/
    │   │       │   └── [id]/
    │   │       ├── shop-with-sidebar/
    │   │       ├── signin/
    │   │       ├── signup/
    │   │       └── wishlist/
    │   ├── api/
    │   │   ├── cart/
    │   │   ├── get-billing-data/
    │   │   ├── login-check/
    │   │   ├── mpesa/
    │   │   │   ├── callback/
    │   │   │   ├── check-status/
    │   │   │   └── initiate-payment/
    │   │   ├── order/
    │   │   │   └── [orderId]/
    │   │   ├── sync-user/
    │   │   ├── update-billing/
    │   │   └── upload-image/
    │   ├── context/
    │   ├── css/
    │   └── fonts/
    ├── components/
    │   ├── Auth/
    │   │   ├── Signin/
    │   │   └── Signup/
    │   ├── Cart/
    │   ├── Checkout/
    │   ├── Common/
    │   │   └── CartSidebarModal/
    │   ├── Contact/
    │   ├── Error/
    │   ├── Footer/
    │   ├── Header/
    │   ├── Home/
    │   │   ├── Categories/
    │   │   ├── Countdown/
    │   │   ├── Hero/
    │   │   ├── NewArrivals/
    │   │   ├── PromoBanner/
    │   │   └── Testimonials/
    │   ├── MailSuccess/
    │   ├── MyAccount/
    │   ├── Orders/
    │   ├── Shop/
    │   ├── ShopDetails/
    │   │   └── RecentlyViewd/
    │   ├── ShopWithoutSidebar/
    │   ├── ShopWithSidebar/
    │   └── Wishlist/
    ├── redux/
    │   └── features/
    └── types/
```

### **Key Directories**

- **`src/app/`** - Next.js 16 App Router pages and API routes
- **`src/components/`** - Reusable React components
- **`src/redux/`** - Redux store and slices
- **`src/types/`** - TypeScript type definitions
- **`lib/`** - Server actions and utilities (root level)
- **`services/`** - Third-party service integrations (M-Pesa)
- **`prisma/`** - Database schema
- **`public/`** - Static assets

---

## 🎨 Product Variant System

### **Concept**

Products can have multiple **variants** - different combinations of:
- **Color** (Blue, Purple, Midnight, etc.)
- **Size** (S, M, L, XL or 8, 9, 10, 11)
- **Storage** (64GB, 128GB, 256GB, 512GB)

Each variant has:
- Unique SKU (e.g., "IP14-256GB-BLU")
- Own price
- Own stock count
- Optional images

![Variant Selector](./public/images/variant-selector.png)

### **Example: iPhone 14 Plus**

```typescript
Product {
  id: "cm5abc123"
  title: "iPhone 14 Plus"
  brand: "Apple"
  price: 599          // Minimum variant price
  stock: 150          // Total stock across all variants
  discount: 20        // Percentage discount
  
  availableColors: ["Blue", "Purple", "Midnight"]
  availableStorage: ["128GB", "256GB", "512GB"]
  availableSizes: []  // Not applicable for phones
  
  variants: [
    // 9 total (3 colors × 3 storage)
    {
      id: "var_1"
      sku: "IP14-128GB-BLU"
      price: 599
      stock: 50
      color: "Blue"
      storage: "128GB"
      isDefault: true
    },
    {
      id: "var_2"
      sku: "IP14-256GB-BLU"
      price: 799
      stock: 30
      color: "Blue"
      storage: "256GB"
    },
    // ... 7 more variants
  ]
}
```

### **User Journey**

```
1. Browse Shop (/shop-with-sidebar)
   ↓ User sees product card
   "iPhone 14 Plus"
   "From $599" ← Shows lowest price
   "9 Options" ← Badge showing variant count
   
2. Click Product
   ↓ Product details page opens
   Default variant auto-selected (128GB Blue)
   
3. Select Variant
   User clicks: Color = Purple
   User clicks: Storage = 256GB
   ↓ System finds matching variant
   
4. Updates Display
   Price: $599 → $799
   Stock: "30 available"
   SKU: "IP14-256GB-PUR"
   
5. Add to Cart
   Saves: productId + variantId
   Cart shows: "256GB • Purple"
   
6. Checkout
   Order created with variant snapshot
   Stock: 30 → 28 (qty: 2)
```

### **Key Features**

✅ **Smart Filtering** - Only shows valid combinations  
✅ **Dynamic Pricing** - Updates price when variant changes  
✅ **Stock Validation** - Can't exceed variant stock  
✅ **Variant Snapshots** - Order preserves variant data forever  
✅ **SKU Auto-Generation** - "IP14-256GB-BLU" format  

---

## 🎛️ Admin Panel

### **Dashboard**

![Admin Dashboard](./public/images/admin-dashboard.png)

**Access:** `/admin`

**Features:**
- Sales overview and analytics
- Recent orders
- Low stock alerts
- Quick action buttons

### **Products Management**

![Admin Products](./public/images/admin-products.png)

**Access:** `/admin/products`

**Features:**
- View all products with variant count
- Search by name, brand, SKU
- Filter by category, status
- Sort by price, stock, name, date
- Quick actions: View, Edit, Delete

### **Add Product**

![Admin Add Product](./public/images/admin-add.png)

**Access:** `/admin/products/add`

**Sections:**

1. **Basic Information**
   - Title, Description (required)
   - Category (loaded from database)
   - Brand, Model, Product SKU
   - Discount percentage

2. **Images**
   - Main image URL (required)
   - Additional images (array)
   - Preview thumbnails

3. **Features & Tags**
   - Add/remove features
   - Add/remove tags
   - Chip-style display

4. **Specifications**
   - Section-based (Display, Performance, Camera)
   - Key-value pairs
   - Multiple sections support

5. **Available Options**
   - Colors (Blue, Purple, etc.)
   - Sizes (S, M, L, etc.)
   - Storage (128GB, 256GB, etc.)

6. **Variants Manager**
   - **Auto-Generate** - Creates all combinations
   - **Manual Add** - Add custom variants
   - **Edit** - Modify price, stock, SKU
   - **Delete** - Remove variants (can't delete last one)
   - **Set Default** - Mark primary variant

**Auto-Generate Example:**
```
Colors: [Blue, Purple]
Storage: [128GB, 256GB]

Click "Auto-Generate All Combinations"
    ↓
Creates 4 variants:
├─ 128GB Blue   (SKU: IP14-128GB-BLU)
├─ 128GB Purple (SKU: IP14-128GB-PUR)
├─ 256GB Blue   (SKU: IP14-256GB-BLU)
└─ 256GB Purple (SKU: IP14-256GB-PUR)

Then set price and stock for each variant
```

### **Edit Product**

![Admin Edit Product](./public/images/admin-edit.png)

**Access:** `/admin/products/[id]/edit`

**Features:**
- Pre-filled with existing data
- Update product details
- Add/edit/delete variants
- Manage stock per variant
- Cannot delete last variant
- Categories loaded from database

### **Category Management**

**Access:** `/admin/categories`

**Features:**
- Add/edit/delete categories
- Category images
- SEO fields
- Product count per category

### **Order Management**

**Access:** `/admin/orders`

**Features:**
- View all orders
- Filter by status
- Search orders
- Update order status
- View order details with variants

### **User Management**

**Access:** `/admin/users`

**Features:**
- View all users
- User details
- Order history per user
- Role management (Admin/Customer)

---

## 🛍️ Frontend Features

### **Homepage**

![Homepage](./public/images/homepage.png)

**Features:**
- Hero banner
- Featured categories
- New arrivals
- Promotional banners
- Customer testimonials
- Countdown timer for deals

### **Shop Page**

![Shop Page](./public/images/shop.png)

**Access:** `/shop-with-sidebar`

**Features:**
- Product grid (responsive)
- Category sidebar filters
- Price range filter
- Search functionality
- Sort options (price, name, date)

**Product Card Display:**
```
┌─────────────────────────┐
│   [Product Image]       │
│   -20% OFF  9 Options   │ ← Badges
│                         │
│   iPhone 14 Plus        │
│   Apple                 │
│   ⭐⭐⭐⭐⭐ (12)          │
│                         │
│   From $599.00          │ ← "From" = multiple variants
│   $749.00 (crossed)     │
│   +8 more               │ ← Additional variants
│                         │
│   In Stock              │
└─────────────────────────┘
     ↓ (on hover)
  [Quick Add]  [♥]         ← Quick actions
```

### **Product Details**

![Product Details](./public/images/product-details.png)

**Access:** `/shop-details/[productId]`

**Features:**
- Image gallery with thumbnails
- Variant selector (button-based, not dropdowns)
- Real-time price updates
- Stock availability per variant
- SKU display
- Add to cart with quantity
- Features list
- Specifications tabs
- Reviews section
- Recently viewed products

**Variant Selector:**
```
Color: ⚫ Blue  ⚫ Purple  ⚫ Midnight

Storage: [128GB] [256GB] [512GB]

Selected: 256GB Blue
Price: $799.00
Original: $999.00 (crossed out)
Save: $200.00 (20% off)
Stock: 30 available
SKU: IP14-256GB-BLU

[- 1 +]  [Add to Cart]  [♥ Wishlist]
```

### **Shopping Cart**

![Shopping Cart](./public/images/cart.png)

**Access:** `/cart`

**Features:**
- Shows exact variant selected
- Displays: color • size • storage • SKU
- Stock warnings ("Only 5 left!")
- Quantity controls (respects variant stock)
- Price breakdown (original + discount)
- Total savings calculation
- Remove items
- Clear cart

**Cart Item Display:**
```
┌──────────────────────────────────────────┐
│ [Image]  iPhone 14 Plus                  │
│ -20% OFF  by Apple                       │
│          256GB • Blue                    │ ← Variant
│          SKU: IP14-256GB-BLU             │
│          Category: Electronics           │
│          Only 5 left!                    │ ← Stock warning
│                                          │
│          [- 1 +]    $799.00    [🗑️]      │
│                     $999.00 (crossed)    │
│                     Save $200.00         │
│                     $799.00 each         │
└──────────────────────────────────────────┘
```

### **Checkout**

![Checkout](./public/images/checkout.png)

**Access:** `/checkout`

**Features:**
- Single-page checkout
- Billing information form
- Payment method selection (M-Pesa, Bank)
- Phone number for M-Pesa
- Order summary with variants
- Order notes
- Total calculation with tax

### **My Account**

**Access:** `/my-account`

**Features:**
- Profile management
- Order history
- Order tracking
- Wishlist
- Account settings

### **Wishlist**

**Access:** `/wishlist`

**Features:**
- Save products for later
- Add to cart from wishlist
- Remove items

---

## 🔌 API Documentation

### **Cart API**

#### **Get Cart Items**
```http
GET /api/cart
Authorization: Required (Stack Auth)
```

**Response:**
```json
{
  "items": [
    {
      "id": "cart_789",
      "productId": "prod_123",
      "variantId": "var_456",
      "quantity": 2,
      "price": 799,
      "discountedPrice": 639.20,
      "product": {
        "title": "iPhone 14 Plus",
        "imageUrl": "https://...",
        "discount": 20,
        "category": "Electronics"
      },
      "variant": {
        "sku": "IP14-256GB-BLU",
        "color": "Blue",
        "storage": "256GB",
        "stock": 30
      }
    }
  ]
}
```

#### **Add to Cart**
```http
POST /api/cart
Content-Type: application/json

{
  "productId": "prod_123",
  "variantId": "var_456",
  "quantity": 1
}
```

#### **Update Quantity**
```http
PUT /api/cart
Content-Type: application/json

{
  "cartItemId": "cart_789",
  "quantity": 3
}
```

#### **Remove Item**
```http
DELETE /api/cart
Content-Type: application/json

{
  "cartItemId": "cart_789"
}
```

#### **Clear Cart**
```http
PATCH /api/cart
```

### **Orders API**

#### **Get User Orders**
```http
GET /api/order
Authorization: Required
```

#### **Create Order**
```http
POST /api/order
Content-Type: application/json

{
  "paymentMethod": "MPESA",
  "phoneNumber": "+254712345678",
  "billingName": "John Doe",
  "billingEmail": "john@example.com",
  "billingAddress": "123 Main St, Nairobi"
}
```

**Process:**
1. Validates cart has items
2. Checks variant stock
3. Creates order with variant snapshots
4. Decrements variant stock
5. Clears cart

#### **Update Order Status**
```http
PUT /api/order
Content-Type: application/json

{
  "orderId": "order_123",
  "status": "SHIPPED"
}
```

**Valid Statuses:** `PENDING`, `PROCESSING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `FAILED`

#### **Cancel Order**
```http
DELETE /api/order
Content-Type: application/json

{
  "orderId": "order_123"
}
```

### **Categories API**

#### **Get All Categories**
```http
GET /api/categories
```

**Response:**
```json
{
  "categories": [
    {
      "id": "cat_1",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices and gadgets",
      "_count": {
        "products": 45
      }
    }
  ]
}
```

---

## 🚀 Deployment

### **Vercel (Recommended)**

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Import to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "Import Project"
- Select `Blissmal/ecommerce-site`
- Configure project

3. **Add Environment Variables**

In Vercel dashboard → Settings → Environment Variables:

```
# Application
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NODE_ENV=production

# Database
DATABASE_URL=postgresql://...

# Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID=...
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=...
STACK_SECRET_SERVER_KEY=...

# M-Pesa (Production)
MPESA_BASE_URL=https://api.safaricom.co.ke
MPESA_BUSINESS_SHORT_CODE=...
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_PASSKEY=...
```

4. **Deploy**
- Click "Deploy"
- Wait for build to complete

5. **Post-Deployment Setup**

```bash
# Push database schema
DATABASE_URL="postgresql://..." npx prisma db push

# Open Prisma Studio for remote database
DATABASE_URL="postgresql://..." npx prisma studio
# Add categories and initial data via GUI
```

### **Database Hosting**

Recommended options:
- **Neon** - Serverless PostgreSQL (free tier, recommended)
- **Supabase** - PostgreSQL with additional features
- **Railway** - Full PostgreSQL instance
- **Vercel Postgres** - Integrated with Vercel

### **Environment Setup**

For Neon database:
```env
DATABASE_URL="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

For Supabase:
```env
DATABASE_URL="postgresql://postgres:password@db.xyz.supabase.co:5432/postgres"
```

---

## 🐛 Troubleshooting

### **1. Foreign Key Constraint Error**

```
Error: Foreign key constraint violated: Product_categoryId_fkey
```

**Solution:**
```bash
# Categories don't exist in database
# Add categories manually via Prisma Studio
npx prisma studio
# Or create categories via admin panel at /admin/categories
```

### **2. Variant Import Error**

```
Error: Only async functions are allowed in "use server" files
```

**Solution:**
```typescript
// ❌ Wrong - Don't import from variant.action
import { generateVariantSKU } from "@/lib/variant.action";

// ✅ Correct - Import from utils
import { generateVariantSKU } from "@/lib/utils/variant-utils";
```

### **3. Prisma Client Not Generated**

```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
npx prisma generate
```

### **4. Database Connection Issues**

```
Error: Can't reach database server
```

**Solution:**
```bash
# Check DATABASE_URL in .env.local
# Test connection
npx prisma db push

# View database
npx prisma studio
```

### **5. Build Fails in Production**

```
Error: Module not found
```

**Solution:**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### **6. M-Pesa Payment Issues**

**Sandbox vs Production:**
- Sandbox: `https://sandbox.safaricom.co.ke`
- Production: `https://api.safaricom.co.ke`

**Phone Number Format:**
- Must start with 254 (Kenya country code)
- Example: `254712345678`

---

## 📚 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npx prisma generate     # Generate Prisma client
npx prisma db push      # Push schema to database
npx prisma studio       # Open Prisma Studio GUI
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Next.js Team - Amazing framework
- Prisma Team - Best ORM for TypeScript
- Vercel - Deployment platform
- Stack Auth - Authentication solution
- Safaricom - M-Pesa API integration

---

## 📞 Contact

- **GitHub:** [@Blissmal](https://github.com/Blissmal)
- **Repository:** [github.com/Blissmal/ecommerce-site](https://github.com/Blissmal/ecommerce-site)
- **Issues:** [Report a bug](https://github.com/Blissmal/ecommerce-site/issues)

---

**Built with ❤️ using Next.js 16**

For the latest updates, visit the [GitHub repository](https://github.com/Blissmal/ecommerce-site).

---

**Happy Coding! 🚀**