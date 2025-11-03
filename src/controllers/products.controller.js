import pool from "../db/pool.js";
import { getRandomProductImageURL } from "../utils/externalImage.js";

function buildAbsoluteUrl(req, relativePath) {
  const host = req.get("host");
  const proto = req.protocol;
  return `${proto}://${host}${relativePath}`;
}

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
  // Si viene multipart, price/stock llegan como string → casteamos
  const name = req.body.name;
  const description = req.body.description ?? "";
  const price = Number(req.body.price);
  const stock = Number(req.body.stock);

  let image_url;

  if (req.file) {
    // Imagen subida desde el PC
    image_url = buildAbsoluteUrl(req, `/uploads/${req.file.filename}`);
  } else if (req.body.image_url && req.body.image_url.trim() !== "") {
    // Imagen por URL enviada desde front
    image_url = req.body.image_url.trim();
  } else {
    // Fallback a Lorem Picsum
    image_url = getRandomProductImageURL();
  }

  const [result] = await pool.execute(
    "INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)",
    [name, description, price, stock, image_url]
  );

  const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [result.insertId]);
  res.status(201).json(rows[0]);
}

    export async function updateProduct(req, res) {
    const { id } = req.params;
    const data = { ...req.body };

    // 🛡️ helper robusto para números
    const toNum = (v) => {
        if (v === undefined || v === null || v === "") return undefined;
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
    };

    const updates = {};

    if (data.name !== undefined) updates.name = String(data.name);
    if (data.description !== undefined) updates.description = String(data.description);

    const price = toNum(data.price);
    if (price !== undefined) updates.price = price;

    const stock = toNum(data.stock);
    if (stock !== undefined) updates.stock = stock;

    // Si subieron archivo, reemplaza image_url
    if (req.file) {
        const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        updates.image_url = url;
    }

    const fields = [];
    const values = [];
    for (const k of ["name", "description", "price", "stock", "image_url"]) {
        if (updates[k] !== undefined) {
        fields.push(`${k} = ?`);
        values.push(updates[k]);
        }
    }

    if (fields.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);

    const [result] = await pool.execute(
        `UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
        values
    );
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
