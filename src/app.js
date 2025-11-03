// src/app.js
import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import productsRouter from "./routes/products.routes.js";
import metricsRouter from "./routes/metrics.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandlers.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Middlewares básicos
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN === "*" ? true : process.env.ALLOWED_ORIGIN,
}));
app.use(express.json());
app.use(morgan("dev"));

// Static /uploads (ÚNICA definición)
const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..", ".."); // ajusta si tu raíz está distinta
app.use("/uploads", express.static(path.join(projectRoot, "uploads")));

// Ping opcional
app.get("/api", (req, res) => {
  res.json({ ok: true, message: "Ecommerce API", endpoints: ["/api/products", "/api/metrics"] });
});

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/metrics", metricsRouter);

// 404 & error handler
app.use(notFound);
app.use(errorHandler);

export default app;
