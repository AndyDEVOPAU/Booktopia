import User from "../models/User.js";

// Stacks AFTER authMiddleware (relies on req.user.userId already being set).
// Used only on Book/Category write routes (POST/PUT/DELETE).
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (error) {
    console.error("isAdmin error:", error.name);
    return res.status(500).json({ message: "Server error" });
  }
};

export default isAdmin;