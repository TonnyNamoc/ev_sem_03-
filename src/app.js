import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import productsRouter from "./routes/products.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandlers.js";

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN === "*" ? true : process.env.ALLOWED_ORIGIN,
}));
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ ok: true, message: "Ecommerce API 🚀", endpoints: "/api/products" });
});

app.use("/api/products", productsRouter);

app.use(notFound);
app.use(errorHandler);

export default app;

