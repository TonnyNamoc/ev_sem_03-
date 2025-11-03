// src/controllers/metrics.controller.js
import pool from "../db/pool.js";

// GET /api/metrics/summary
export const summary = async (req, res) => {
  // total productos
  const [rowsTotal] = await pool.query(`
    SELECT COUNT(*) AS products
    FROM products;
  `);

  // suma de stock (si stock es VARCHAR, hacemos CAST)
  const [rowsStock] = await pool.query(`
    SELECT COALESCE(SUM(CAST(stock AS UNSIGNED)), 0) AS stock
    FROM products;
  `);

  // agregados hoy
  const [rowsToday] = await pool.query(`
    SELECT COUNT(*) AS added_today
    FROM products
    WHERE DATE(created_at) = CURDATE();
  `);

  res.json({
    products: rowsTotal[0]?.products ?? 0,
    stock: rowsStock[0]?.stock ?? 0,
    added_today: rowsToday[0]?.added_today ?? 0,
  });
};

// GET /api/metrics/added-today
// Para el gráfico por nombre (agrupa los creados hoy)
export const addedTodayByName = async (req, res) => {
  const [rows] = await pool.query(`
    SELECT name, COUNT(*) AS qty
    FROM products
    WHERE DATE(created_at) = CURDATE()
    GROUP BY name
    ORDER BY qty DESC, name ASC;
  `);

  res.json(rows);
};

// GET /api/metrics/ping (diagnóstico)
export const ping = (req, res) => {
  res.json({ ok: true, from: "metrics" });
};
