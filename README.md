# NK Fashion Store 🛍️

A full-stack e-commerce platform for **NK Fashion Store** — a Sri Lankan fashion boutique based in Tangalle, selling women's wear, men's wear, kids' wear, and accessories island-wide via Cash on Delivery.

---

## 🌐 Live Preview

> Deploy URL goes here (Vercel / Firebase Hosting)

---

## ✨ Features

### Storefront
- **Animated Home Page** — Framer Motion hero with floating bubbles, staggered text, shuffling image tray
- **Shop / Catalog** — Client-side filtering by category, size, price range & availability
- **Product Detail** — Image gallery, size/color variant selector, low stock alerts, Add to Cart (requires login)
- **Cart** — Persistent via localStorage, qty stepper, order summary
- **Checkout** — COD-only, delivery form, auto-filled from customer profile
- **Order Confirmation** — Order number, full summary, delivery details
- **Order Tracking** — Look up by order number or phone number, step progress tracker
- **Customer Accounts** — Sign up / Log in / My Orders / Profile
- **About & Contact** — Brand story, contact form (EmailJS integration ready)

### Admin Panel (`/admin`)
- **Role-Based Access Control (RBAC)** — Super Admin / Inventory Manager / Order Manager / Content Manager / Customer Support
- **Products** — Full CRUD, Cloudinary image upload, variant editor (size/color/stock)
- **Orders** — Status management, expandable order detail, customer info
- **Categories** — Add/edit/delete with subcategory tag input, seed defaults
- **Customers** — Derived from order history, sortable, order history per customer
- **Reports & Analytics** — Revenue chart, best-sellers, status breakdown, low stock alerts, date range filter
- **Content & Promotions** — Hero text, CTA strip, featured product pins
- **Settings** — Delivery fee, store contact info, social links
- **Users & Roles** — Assign roles to admins, create/edit/delete permission roles

### Technical
- **Firebase Auth** — Customer + Admin (separate flows, same Firebase project)
- **Firestore** — Products, orders, categories, admins, roles, settings, customers
- **Cloudinary** — Product image uploads (unsigned preset)
- **EmailJS** — Order confirmation emails (Gmail service for inbox delivery)
- **Meta Pixel + TikTok Pixel** — ViewContent, AddToCart, Purchase tracking
- **Next.js Sitemap + Robots** — SEO-ready, admin/cart/checkout excluded
- **Framer Motion** — Page animations, scroll-triggered effects, micro-interactions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Images | Cloudinary |
| Email | EmailJS (Gmail service) |
| Analytics | Meta Pixel, TikTok Pixel |

---

## 📁 Project Structure

```
app/
├── page.tsx                    # Home page
├── shop/                       # Shop catalog
├── product/[id]/               # Product detail
├── cart/                       # Cart (auth-gated)
├── checkout/                   # Checkout (auth-gated)
├── order-confirmation/[orderNumber]/
├── track-order/
├── about/, contact/
├── account/                    # login, signup, account page
└── admin/                      # Full admin panel
    ├── dashboard/
    ├── products/               # CRUD + image upload
    ├── orders/
    ├── categories/
    ├── customers/
    ├── reports/
    ├── content/
    ├── settings/
    └── users/                  # RBAC management

components/
├── Navbar.tsx / Footer.tsx
├── home/                       # AnimatedHero, HeroImageShuffle, etc.
├── admin/                      # AdminShell, ProductForm, ProtectedRoute
└── ...

lib/
├── firebase.js
├── types.ts                    # All TypeScript interfaces
├── productService.ts
├── orderService.ts
├── categoryService.ts
├── roleService.ts
├── adminService.ts
├── settingsService.ts
├── permissions.ts              # hasPermission() helper
├── pixels.ts                   # Meta + TikTok tracking
└── sendOrderEmail.ts           # EmailJS integration

context/
├── CartContext.tsx
├── CustomerAuthContext.tsx
└── AdminAuthContext.tsx
```

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/chamika217/nk-fashion-store--E-commerce-Platform.git
cd nk-fashion-store--E-commerce-Platform
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

# EmailJS
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=

# Pixels (optional)
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
```

### 4. Firebase Setup
- Create a Firebase project → enable **Firestore** and **Authentication (Email/Password)**
- Deploy `firestore.rules` via Firebase Console → Firestore → Rules
- Create an `admins/{uid}` document manually for your admin account
- Seed roles via `/admin/users` → "Seed Default Roles" → assign `roleId` to your admin doc

### 5. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Admin Access

1. Go to `/admin/login`
2. Sign in with your Firebase Auth email/password
3. Ensure your `admins/{uid}` Firestore doc has a `roleId` pointing to a seeded role

---

## 🏪 Business Info

- **Brand:** NK Fashion Store
- **Location:** Tangalle, Sri Lanka
- **Delivery:** Island-wide, Cash on Delivery
- **Social:** [Facebook](https://www.facebook.com/share/1cNJSsvhvH/) · [TikTok](https://www.tiktok.com/@nimzkp)

---

## 📄 License

Private project — all rights reserved © 2026 NK Fashion Store.
