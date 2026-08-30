import { useAuth } from "../context/useAuth";
import { Link } from "react-router-dom";

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      {user ? (
        <>
          <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-gray-500 text-sm">Role: {user.role}</p>
          <button
            onClick={logout}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition"
          >
            Log Out
          </button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold">Welcome to the Bookstore</h1>
          <div className="flex gap-3">
            <Link to="/login" className="text-blue-600 hover:underline">Log In</Link>
            <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
            <Link to="/books" className="text-blue-600 hover:underline">Browse Books</Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;