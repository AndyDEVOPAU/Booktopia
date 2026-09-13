import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const GUEST_CART_COOKIE = "guestCartId";
const GUEST_CART_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

// Cart routes need to work for BOTH logged-in users and anonymous guests,
// so this does NOT reject the request the way authMiddleware does.
// - If a valid token cookie is present, attaches req.user (same shape as
//   authMiddleware: { userId }).
// - Otherwise, ensures a guestCartId cookie exists (generating one if
//   missing) and attaches it as req.guestCartId.
// Every cart route can then assume exactly one of req.user / req.guestCartId
// is set.
const attachCartOwner = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { userId: decoded.userId };
    } catch (error) {
      // Invalid/expired token — fall through and treat as a guest rather
      // than failing the request. Cart access shouldn't hard-depend on
      // having a valid session.
    }
  }

  if (!req.user) {
    let guestCartId = req.cookies[GUEST_CART_COOKIE];
    if (!guestCartId) {
      guestCartId = crypto.randomUUID();
      res.cookie(GUEST_CART_COOKIE, guestCartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: GUEST_CART_MAX_AGE,
      });
    }
    req.guestCartId = guestCartId;
  }

  next();
};

export default attachCartOwner;
export { GUEST_CART_COOKIE };