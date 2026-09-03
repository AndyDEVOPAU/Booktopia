import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

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
                    <Route path="/" element={<Home />} />
                    <Route path="/books" element={<BookList />} />
                    <Route path="/books/:id" element={<BookDetail />} />

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
                        path="/admin/books"
                        element={
                            <AdminRoute>
                                <AdminBookList />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/books/new"
                        element={
                            <AdminRoute>
                                <AdminBookForm />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/books/:id/edit"
                        element={
                            <AdminRoute>
                                <AdminBookForm />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/categories"
                        element={
                            <AdminRoute>
                                <AdminCategoryList />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/categories/new"
                        element={
                            <AdminRoute>
                                <AdminCategoryForm />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/categories/:id/edit"
                        element={
                            <AdminRoute>
                                <AdminCategoryForm />
                            </AdminRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
