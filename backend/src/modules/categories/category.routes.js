import { ApiError } from '../../utils/ApiError.js';
import { createCrudModule } from '../shared/crudFactory.js';
import { Category } from './category.model.js';
import { Product } from '../products/product.model.js';
import { createCategorySchema, updateCategorySchema } from './category.validation.js';

const categoryModule = createCrudModule({
  Model: Category,
  label: 'Category',
  slugSource: 'name',
  statusValues: ['active', 'inactive'],
  publicStatuses: ['active'],
  searchFields: ['name', 'description'],
  sortable: ['name', 'sortOrder', 'createdAt'],
  defaultSort: 'sortOrder',
  defaultLimit: 100,
  validation: { create: createCategorySchema, update: updateCategorySchema },
  beforeDelete: async (category) => {
    const inUse = await Product.countDocuments({ categoryId: category._id });
    if (inUse > 0) {
      throw ApiError.conflict(`Cannot delete category: ${inUse} product(s) still reference it. Reassign them first.`);
    }
  },
});

export const categoryService = categoryModule.service;
export default categoryModule.router;
