import { Router } from "express";
import { listProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/products.controller.js";
import { productCreateSchema, productUpdateSchema } from "../validators/product.schema.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Middleware para validar JSON cuando NO es multipart
function validate(schema) {
  return (req, res, next) => {
    // Si viene multipart/form-data, dejamos que el controller haga el parsing básico.
    if (req.headers["content-type"]?.includes("multipart/form-data")) return next();

    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: "Validation error",
        details: error.details.map(d => ({ message: d.message, path: d.path })),
      });
    }
    req.body = value;
    next();
  };
}

router.get("/", listProducts);
router.get("/:id", getProductById);

// POST acepta archivo (campo "image") o image_url en JSON
router.post("/", upload.single("image"), validate(productCreateSchema), createProduct);

// PUT idem
router.put("/:id", upload.single("image"), validate(productUpdateSchema), updateProduct);

router.delete("/:id", deleteProduct);

export default router;
