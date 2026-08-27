# Bookstore Build Schedule (Day-by-Day)

Breaks the 6 milestones from the project plan into daily tasks. ~22 working days total, assuming one developer working solo. Adjust pacing if working part-time or with a team.

---

## Milestone 1 — Auth (3 days)

| Day | Tasks |
|---|---|
| 1 | Project scaffolding: init client + server repos, connect MongoDB Atlas, set up `.env` config, install core dependencies (Express, Mongoose, React, Tailwind) |
| 2 | Backend: User model, register/login routes, password hashing (bcrypt), JWT generation, auth middleware |
| 3 | Frontend: login/register forms, auth context, protected route wrapper, token storage/refresh handling |

---

## Milestone 2 — Book & Category CRUD + Catalog (5 days)

| Day | Tasks |
|---|---|
| 4 | Backend: Book model + Category model, CRUD routes for both, admin-only middleware on write routes |
| 5 | Backend: search/filter/sort query logic (by title, author, genre, price range), pagination |
| 6 | Frontend: catalog page — book grid/list, connect to API, loading/empty states |
| 7 | Frontend: search bar + filter/sort controls wired to backend query params |
| 8 | Frontend: book detail page (cover image, description, price, stock, add-to-cart button) |

---

## Milestone 3 — Cart + Checkout (5 days)

| Day | Tasks |
|---|---|
| 9 | Backend: Cart model + routes (add/update/remove items), stock validation logic |
| 10 | Frontend: cart page (view items, update quantity, remove item, subtotal) |
| 11 | Backend: Order model, Stripe integration (payment intent creation), stock decrement on success |
| 12 | Frontend: checkout page — shipping address form, Stripe payment form |
| 13 | Wire checkout end-to-end: cart → address → payment → order creation → confirmation page. Test both success and failure paths (stock conflict, payment decline) |

---

## Milestone 4 — Order History + Admin Panel (4 days)

| Day | Tasks |
|---|---|
| 14 | Backend: order history route (customer's own orders), admin order list route (all orders, status update) |
| 15 | Frontend: customer order history page |
| 16 | Frontend: admin panel — book management (add/edit/delete books, upload cover image via Cloudinary) |
| 17 | Frontend: admin panel — order list view, update order status (processing/shipped/delivered) |

---

## Milestone 5 — Reviews & Ratings (2 days)

| Day | Tasks |
|---|---|
| 18 | Backend: Review model + routes (create/list reviews per book, one review per user per book) |
| 19 | Frontend: review form + star rating display on book detail page, average rating calculation |

---

## Milestone 6 — Polish (3 days)

| Day | Tasks |
|---|---|
| 20 | Error handling pass: centralized backend error middleware, consistent error messages on frontend, form validation everywhere |
| 21 | Responsive UI pass (mobile/tablet breakpoints), loading skeletons, empty states |
| 22 | Full manual test of critical flow (browse → cart → checkout → order → review), deploy to staging, fix any bugs found |

---

## Summary

| Milestone | Days | Cumulative |
|---|---|---|
| 1. Auth | 3 | Day 3 |
| 2. Catalog | 5 | Day 8 |
| 3. Checkout | 5 | Day 13 |
| 4. Orders + Admin | 4 | Day 17 |
| 5. Reviews | 2 | Day 19 |
| 6. Polish | 3 | Day 22 |

**Total: 22 working days (~4-5 weeks at 5 days/week)**

Notes:
- This assumes solo, full-time focus. Part-time (e.g. 2-3 hrs/day) roughly triples the calendar time.
- Milestone 3 (checkout) is the highest-risk step — Stripe integration and stock-conflict handling take longer than expected more often than not. Buffer an extra day there if it's your first time integrating Stripe.
- Deployment to production (vs staging) isn't included above — add ~1 day once staging is fully tested.
