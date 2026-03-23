import db from "../models/index.js";

const { Product } = db;

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({ order: [["createdAt", "DESC"]] });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, price } = req.body;
    const product = await Product.create({ name, price: Number(price) });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, price } = req.body;
    await product.update({ name, price: Number(price) });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await product.destroy();
    res.json({ message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};
