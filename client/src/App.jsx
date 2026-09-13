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
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import AdminBookList from "./pages/admin/AdminBookList";
import AdminBookForm from "./pages/admin/AdminBookForm";
import AdminCategoryList from "./pages/admin/AdminCategoryList";
import AdminCategoryForm from "./pages/admin/AdminCategoryForm";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public site — everything under here gets the Navbar/Footer */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/books" element={<BookList />} />
              <Route path="/books/:id" element={<BookDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Guests get a cart too (backend anonymous session cart) */}
              <Route path="/cart" element={<CartPage />} />

              {/* Checkout requires login — the actual gate we designed */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-confirmation/:id"
                element={
                  <ProtectedRoute>
                    <OrderConfirmation />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Admin — nested under AdminLayout for the sidebar, gated by AdminRoute */}
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
