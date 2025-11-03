import pool from "../db/pool.js";
import { getRandomProductImageURL } from "../utils/externalImage.js";

export async function listProducts(req, res) {
  const [rows] = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json(rows);
}

export async function getProductById(req, res) {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(rows[0]);
}

export async function createProduct(req, res) {
    const { name, description = "", price, stock } = req.body;

  // Imagen automática desde Lorem Picsum
    const image_url = getRandomProductImageURL();

    const [result] = await pool.execute(
    "INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)",
    [name, description, price, stock, image_url]
);

  const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
}

export async function updateProduct(req, res) {
    const { id } = req.params;

    const fields = [];
    const values = [];
    ["name", "description", "price", "stock", "image_url"].forEach((k) => {
    if (req.body[k] !== undefined) {
        fields.push(`${k} = ?`);
        values.push(req.body[k]);
    }
});

    if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

    values.push(id);
    const sql = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`;
    const [result] = await pool.execute(sql, values);

    if (result.affectedRows === 0) return res.status(404).json({ error: "Product not found" });

    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    res.json(rows[0]);
}

export async function deleteProduct(req, res) {
    const { id } = req.params;
    const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Product not found" });
    res.status(204).send();
}
