# Project Plan: Online Bookstore (Single-Vendor)

Filled out using the 8-step planning framework. Scoped as single-vendor: the store manages all inventory itself — no third-party sellers listing their own books.

---

## Step 1 — Problem and Goal

**One sentence:** An online bookstore where readers can browse, search, and buy physical and digital books, and the store admin manages inventory and orders.

**Why this needs to exist:**
- Small/independent bookstores need an online storefront to compete with large marketplaces.
- Readers want fast search by title/author/genre plus reviews before buying.
- The store needs simple inventory and order management without a bloated enterprise tool.

---

## Step 2 — Users and Roles

| Role | What they can do |
|---|---|
| **Guest** | Browse catalog, search, view book details, view reviews, add to cart (cart persists on login) |
| **Customer** | Everything Guest can do + checkout, track orders, write reviews/ratings, manage wishlist, view order history |
| **Admin** | Manage all books, categories, and orders; manage users; view sales analytics; manage discounts/coupons |

---

## Step 3 — Core Features (MVP vs Later)

**MVP (build first):**
- User registration/login (JWT auth)
- Book catalog: list, search, filter by genre/author/price, sort
- Book detail page (title, author, description, price, stock, cover image)
- Cart (add/remove/update quantity)
- Checkout with one payment method (Stripe)
- Order confirmation + order history
- Basic admin panel: add/edit/delete books, view orders
- Reviews and star ratings on book detail page

**Later (post-MVP):**
- Wishlist
- Discount codes / coupons
- Recommendations ("customers also bought")
- Ebook/PDF delivery for digital purchases
- Advanced search (full-text search, autocomplete)
- Inventory alerts (low stock)
- Multiple payment methods / international currency
- Admin sales analytics dashboard
- Email notifications (order confirmation, shipping updates)

---

## Step 4 — Core Entities and Relationships

| Entity | Key fields |
|---|---|
| **User** | name, email, password (hashed), role, address(es) |
| **Book** | title, author, description, price, stock, genre, coverImageUrl, isbn, format (physical/ebook) — owned by the store, no seller reference needed |
| **Category** | name, slug |
| **Cart** | user (ref), items: [{ book (ref), quantity }] |
| **Order** | user (ref), items: [{ book (ref), quantity, priceAtPurchase }], status, shippingAddress, paymentStatus, total |
| **Review** | user (ref), book (ref), rating, comment, createdAt |

**Relationships:**
- One User has many Orders, one Cart, many Reviews
- One Book belongs to one or more Categories, has many Reviews
- One Order has many Order Items, each referencing one Book
- One Cart has many Cart Items, each referencing one Book

---

## Step 5 — Critical User Flow: Checkout

1. Customer adds book(s) to cart from catalog or detail page.
2. Customer opens cart, reviews items/quantities, clicks "Checkout."
3. If not logged in → redirect to login/register, then return to checkout.
4. Customer enters/selects shipping address.
5. Customer enters payment details (Stripe).
6. System validates stock is still available for each item.
   - **Error case:** item out of stock → show error, remove/adjust item, return to cart.
7. Payment is processed.
   - **Error case:** payment fails → show error, allow retry, do not create order.
8. On success: create Order, decrement stock, clear cart, show confirmation page with order number.
9. Customer can view this order under "Order History."

---

## Step 6 — Stack and Architecture

| Decision | Choice |
|---|---|
| Frontend | React + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB (Atlas) + Mongoose |
| Auth | JWT (access + refresh token, httpOnly cookies) |
| Payments | Stripe |
| Image storage | Cloudinary (book cover images) |
| Hosting — frontend | Vercel |
| Hosting — backend | Render |
| Hosting — database | MongoDB Atlas |
| State management | React Context (upgrade to Redux Toolkit only if admin/dashboard state grows complex) |

---

## Step 7 — Milestones

| # | Milestone | Est. time |
|---|---|---|
| 1 | Auth (register/login/JWT middleware) | 3 days |
| 2 | Book & Category CRUD (backend) + catalog/search/filter (frontend) | 5 days |
| 3 | Cart + Checkout flow end-to-end (Stripe integration) | 5 days |
| 4 | Order history + admin panel (manage books/orders, single inventory) | 4 days |
| 5 | Reviews & ratings | 2 days |
| 6 | Polish: error handling, validation, responsive UI, loading states | 3 days |

**Total MVP estimate: ~22 working days**

*(Checkout, milestone 3, is under half the total time — MVP scope looks reasonable.)*

---

## Step 8 — Testing, Deployment, and Feedback

- **Staging:** separate Render service + separate Atlas database from production.
- **Manual test before every deploy:** full checkout flow (add to cart → pay → order confirmation), login/register, admin book creation.
- **Automated tests (minimum):** API tests for auth and checkout endpoints (Jest + Supertest).
- **Feedback loop:** simple "Rate your experience" prompt after checkout + basic analytics (page views on catalog, cart abandonment rate) to prioritize the "Later" feature list.

---

## Quick Reference

| Step | Bookstore output |
|---|---|
| 1. Problem & goal | Single-vendor online bookstore for browsing/buying books |
| 2. Users & roles | Guest, Customer, Admin |
| 3. Features | Catalog, cart, checkout, reviews (MVP) → wishlist, coupons (Later) |
| 4. Entities | User, Book, Category, Cart, Order, Review |
| 5. Critical flow | Cart → checkout → payment → order confirmation |
| 6. Stack | MERN + Stripe + Cloudinary, Vercel/Render/Atlas |
| 7. Milestones | ~22 days across 6 milestones |
| 8. Testing/deployment | Staging env, manual checkout test, feedback prompt |
