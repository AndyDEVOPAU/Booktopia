import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import PublicLayout from "./components/PublicLayout";
import AdminLayout from "./components/admin/AdminLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookList from "./pages/BookList";
import BookDetail from "./pages/BookDetail";
import CartPage from "./pages/CartPage";
import AdminBookList from "./pages/admin/AdminBookList";
import AdminBookForm from "./pages/admin/AdminBookForm";
import AdminCategoryList from "./pages/admin/AdminCategoryList";
import AdminCategoryForm from "./pages/admin/AdminCategoryForm";
// import Checkout from "./pages/Checkout"; // Milestone 3, Day 12

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* CartProvider needs to be inside AuthProvider (it reads useAuth()
            to know when to re-fetch after login/logout) and outside Routes
            (Navbar's cart badge needs it on every page, not just /cart). */}
        <CartProvider>
          <Routes>
            {/* Public site — everything under here gets the Navbar/Footer */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/books" element={<BookList />} />
              <Route path="/books/:id" element={<BookDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Cart is NOT behind ProtectedRoute — guests get a cart too,
                  via the backend's anonymous session-cookie cart. Only
                  checkout (Milestone 3, Day 12) requires login. */}
              <Route path="/cart" element={<CartPage />} />

              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    {/* <Checkout /> */}
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Admin — everything under here gets the AdminSidebar via AdminLayout,
                and is gated by AdminRoute at the parent level. */}
            <Route
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route path="/admin/books" element={<AdminBookList />} />
              <Route path="/admin/books/new" element={<AdminBookForm />} />
              <Route path="/admin/books/:id/edit" element={<AdminBookForm />} />
              <Route path="/admin/categories" element={<AdminCategoryList />} />
              <Route path="/admin/categories/new" element={<AdminCategoryForm />} />
              <Route path="/admin/categories/:id/edit" element={<AdminCategoryForm />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
