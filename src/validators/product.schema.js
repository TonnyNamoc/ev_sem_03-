import Joi from "joi";

export const productCreateSchema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    description: Joi.string().allow("").max(5000),
    price: Joi.number().precision(2).min(0).required(),
    stock: Joi.number().integer().min(0).required(),
});

export const productUpdateSchema = Joi.object({
    name: Joi.string().min(2).max(255),
    description: Joi.string().allow("").max(5000),
    price: Joi.number().precision(2).min(0),
    stock: Joi.number().integer().min(0),
    image_url: Joi.string().uri(),
}).min(1);
