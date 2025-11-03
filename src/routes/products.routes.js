import { Router } from "express";
import {
    listProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/products.controller.js";
import { productCreateSchema, productUpdateSchema } from "../validators/product.schema.js";

const router = Router();

function validate(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
        return res.status(400).json({
            error: "Validation error",
            details: error.details.map((d) => ({ message: d.message, path: d.path })),
        });
        }
        req.body = value;
        next();
    };
}

router.get("/", listProducts);
router.get("/:id", getProductById);
router.post("/", validate(productCreateSchema), createProduct);
router.put("/:id", validate(productUpdateSchema), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
