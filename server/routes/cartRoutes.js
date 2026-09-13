import express from "express";
import attachCartOwner from "../middleware/attachCartOwner.js";
import { getCart, addItem, updateItem, removeItem } from "../controllers/cartController.js";

const router = express.Router();

// Every cart route works for both logged-in users and guests — that's
// the whole point of attachCartOwner over the stricter authMiddleware.
router.use(attachCartOwner);

router.get("/", getCart);
router.post("/items", addItem);
router.put("/items/:bookId", updateItem);
router.delete("/items/:bookId", removeItem);

export default router;