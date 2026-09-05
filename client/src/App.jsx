import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Container from "./components/common/Container";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookList from "./pages/BookList";
import BookDetail from "./pages/BookDetail";
import AdminBookList from "./pages/admin/AdminBookList";
import AdminBookForm from "./pages/admin/AdminBookForm";
import AdminCategoryList from "./pages/admin/AdminCategoryList";
import AdminCategoryForm from "./pages/admin/AdminCategoryForm";

// import Cart from "./pages/Cart";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Container><Home /></Container>} />
                    <Route path="/books" element={<Container><BookList /></Container>} />
                    <Route path="/books/:id" element={<Container><BookDetail /></Container>} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/cart"
                        element={
                            <ProtectedRoute>
                                {/* <Cart /> */}
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminLayout />
                            </AdminRoute>
                        }
                    >
                        <Route path="books" element={<AdminBookList />} />
                        <Route path="books/new" element={<AdminBookForm />} />
                        <Route path="books/:id/edit" element={<AdminBookForm />} />
                        <Route path="categories" element={<AdminCategoryList />} />
                        <Route path="categories/new" element={<AdminCategoryForm />} />
                        <Route path="categories/:id/edit" element={<AdminCategoryForm />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
