import { mutation } from "./_generated/server";

export const createBBData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data exists
    const existingProducts = await ctx.db.query("products").collect();
    if (existingProducts.length > 0) {
      return {
        success: false,
        message: "Data already exists. Clear first.",
        count: existingProducts.length
      };
    }

    // Create categories first
    const categories = [
      { name: "Cement & Concrete", description: "Cement, concrete mix, additives" },
      { name: "Steel & Rebar", description: "Rebar, steel bars, mesh" },
      { name: "Blocks & Bricks", description: "Concrete blocks, clay bricks" },
      { name: "Sand & Gravel", description: "Construction sand, gravel, aggregates" },
    ];

    const createdCategories = [];
    for (const category of categories) {
      const categoryId = await ctx.db.insert("categories", {
        name: category.name,
        description: category.description,
      });
      createdCategories.push({ id: categoryId, name: category.name });
    }

    // Create units of measure
    const units = [
      { name: "Bag", abbreviation: "bag" },
      { name: "Piece", abbreviation: "pcs" },
      { name: "Cubic Meter", abbreviation: "m³" },
    ];

    const createdUnits = [];
    for (const unit of units) {
      const unitId = await ctx.db.insert("unitsOfMeasure", {
        name: unit.name,
        abbreviation: unit.abbreviation,
      });
      createdUnits.push({ id: unitId, name: unit.name, abbreviation: unit.abbreviation });
    }

    // Create category and unit maps
    const categoryMap = new Map(createdCategories.map(c => [c.name, c.id]));
    const unitMap = new Map(createdUnits.map(u => [u.abbreviation, u.id]));

    // Create B&B Construction products
    const products = [
      {
        name: "Portland Cement",
        sku: "CEM-001",
        quantity: 50,
        price: 10.00,
        category: "Cement & Concrete",
        unitAbbr: "bag",
        description: "Premium Portland cement for construction"
      },
      {
        name: "Ready Mix Concrete",
        sku: "CEM-002",
        quantity: 25,
        price: 95.00,
        category: "Cement & Concrete",
        unitAbbr: "m³",
        description: "Ready-to-use concrete mix"
      },
      {
        name: "Rebar 10mm x 6m",
        sku: "RB-001",
        quantity: 200,
        price: 14.50,
        category: "Steel & Rebar",
        unitAbbr: "pcs",
        description: "Steel reinforcement bars"
      },
      {
        name: "Concrete Blocks 8\"",
        sku: "BLK-001", 
        quantity: 500,
        price: 1.80,
        category: "Blocks & Bricks",
        unitAbbr: "pcs",
        description: "Standard 8-inch concrete blocks"
      },
      {
        name: "Construction Sand",
        sku: "AGG-001",
        quantity: 15,
        price: 35.00,
        category: "Sand & Gravel",
        unitAbbr: "m³",
        description: "Fine construction sand"
      }
    ];

    // Insert products
    let createdCount = 0;
    for (const product of products) {
      const categoryId = categoryMap.get(product.category);
      const unitId = unitMap.get(product.unitAbbr);
      
      if (categoryId && unitId) {
        await ctx.db.insert("products", {
          name: product.name,
          sku: product.sku,
          quantity: product.quantity,
          price: product.price,
          categoryId: categoryId,
          unitOfMeasureId: unitId,
          description: product.description
        });
        createdCount++;
      }
    }

    return {
      success: true,
      message: "B&B Construction sample data created!",
      categoriesCreated: createdCategories.length,
      unitsCreated: createdUnits.length,
      productsCreated: createdCount
    };
  },
});
