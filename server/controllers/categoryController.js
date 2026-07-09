import { Category } from '../models/Category.js';

export async function listCategories(_req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.json({
      data: categories.map((category) => ({
        id: category._id.toString(),
        name: category.name,
        image: category.image,
      })),
    });
  } catch (error) {
    next(error);
  }
}
