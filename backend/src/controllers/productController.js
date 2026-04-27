import { desc, eq } from "drizzle-orm";
import { db, products } from "../db/index.js";

export const getProducts = async (req, res, next) => {
  try {
    const rows = await db.select().from(products).orderBy(desc(products.createdAt));
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, price } = req.body;
    const [product] = await db
      .insert(products)
      .values({ name, price: String(Number(price)) })
      .returning();
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, price } = req.body;
    const [updated] = await db
      .update(products)
      .set({ name, price: String(Number(price)), updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    await db.delete(products).where(eq(products.id, id));
    res.json({ message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};
