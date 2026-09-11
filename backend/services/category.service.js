const Category = require('../models/Category');

class CategoryService {
  /**
   * Get all categories with default seeding if empty
   */
  async getAllCategories() {
    let categories = await Category.find().sort({ name: 1 });

    if (!categories || categories.length === 0) {
      const defaultCategories = [
        { name: 'Information Technology', slug: 'information-technology' },
        { name: 'Healthcare', slug: 'healthcare' },
        { name: 'Trades & Technical', slug: 'trades-technical' },
        { name: 'Logistics & Driver', slug: 'logistics-driver' },
        { name: 'Office & Professional', slug: 'office-professional' },
        { name: 'Education', slug: 'education' },
        { name: 'Hospitality', slug: 'hospitality' },
        { name: 'Manufacturing', slug: 'manufacturing' },
        { name: 'Retail & Sales', slug: 'retail-sales' },
        { name: 'Other', slug: 'other' }
      ];

      for (const cat of defaultCategories) {
        await Category.updateOne(
          { slug: cat.slug },
          { $setOnInsert: cat },
          { upsert: true }
        );
      }
      categories = await Category.find().sort({ name: 1 });
    }

    return categories;
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id) {
    return Category.findById(id);
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData) {
    const { name, description } = categoryData;
    const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
    return Category.create({ name: name.trim(), slug, description });
  }

  /**
   * Update category by ID
   */
  async updateCategory(id, categoryData) {
    if (categoryData.name) {
      categoryData.slug = categoryData.name.toLowerCase().trim().replace(/\s+/g, '-');
    }
    return Category.findByIdAndUpdate(id, categoryData, { new: true });
  }

  /**
   * Delete category by ID
   */
  async deleteCategory(id) {
    return Category.findByIdAndDelete(id);
  }
}

module.exports = new CategoryService();
