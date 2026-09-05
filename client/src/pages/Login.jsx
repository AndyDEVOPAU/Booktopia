import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import ErrorMessage from "../components/common/ErrorMessage";
import Button from "../components/common/Button";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await login(email, password);
      navigate(data.user.role === "admin" ? "/admin/books" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-background p-8 rounded-lg shadow-md ring-1 ring-text/10"
      >
        <h1 className="text-2xl font-semibold mb-6 text-text">Log In</h1>

        {error && <ErrorMessage message={error} />}

        <label className="block mb-4">
          <span className="text-sm text-text/70">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded border border-text/15 bg-background px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label className="block mb-6">
          <span className="text-sm text-text/70">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded border border-text/15 bg-background px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>
        <Button type="submit" loading={submitting}>
          {submitting ? "Logging in..." : "Log In"}
        </Button>

        <p className="mt-4 text-sm text-text/60 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;