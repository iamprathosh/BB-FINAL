import { mutation } from "./_generated/server";

export const createBBSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if we already have sample data
    const existingProducts = await ctx.db.query("products").collect();
    if (existingProducts.length > 0) {
      return `B&B Construction inventory already exists (${existingProducts.length} products found). Please clear data first.`;
    }

    // First, create categories and units
    const categories = [
      { name: "Cement & Concrete", description: "Cement, concrete mix, additives" },
      { name: "Steel & Rebar", description: "Rebar, steel bars, mesh" },
      { name: "Blocks & Bricks", description: "Concrete blocks, clay bricks" },
      { name: "Sand & Gravel", description: "Construction sand, gravel, aggregates" },
      { name: "Electrical", description: "Wires, conduits, electrical components" },
      { name: "Plumbing", description: "Pipes, fittings, plumbing supplies" },
      { name: "Hardware", description: "Bolts, screws, fasteners" },
      { name: "Tools & Equipment", description: "Hand tools, power tools, equipment" },
      { name: "Lumber & Wood", description: "Timber, plywood, wood products" },
    ];

    const createdCategories = [];
    for (const category of categories) {
      const categoryId = await ctx.db.insert("categories", {
        name: category.name,
        description: category.description,
      });
      createdCategories.push({ id: categoryId, name: category.name });
    }

    const units = [
      { name: "Bag", abbreviation: "bag" },
      { name: "Piece", abbreviation: "pcs" },
      { name: "Cubic Meter", abbreviation: "m³" },
      { name: "Meter", abbreviation: "m" },
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

    // Create B&B Construction sample products
    const bbProducts = [
      {
        name: "Portland Cement",
        sku: "CEM-001",
        quantity: 50,
        price: 10.00,
        category: "Cement & Concrete",
        unitAbbr: "bag",
        description: "Premium Portland cement for construction projects"
      },
      {
        name: "Ready Mix Concrete",
        sku: "CEM-002",
        quantity: 25,
        price: 95.00,
        category: "Cement & Concrete",
        unitAbbr: "m³",
        description: "Ready-to-use concrete mix for construction"
      },
      {
        name: "Rebar 10mm x 6m",
        sku: "RB-001",
        quantity: 200,
        price: 14.50,
        category: "Steel & Rebar",
        unitAbbr: "pcs",
        description: "Steel reinforcement bars for concrete structures"
      },
      {
        name: "Concrete Blocks 8\"",
        sku: "BLK-001",
        quantity: 500,
        price: 1.80,
        category: "Blocks & Bricks",
        unitAbbr: "pcs",
        description: "Standard 8-inch concrete blocks for walls"
      },
      {
        name: "Construction Sand",
        sku: "AGG-001",
        quantity: 15,
        price: 35.00,
        category: "Sand & Gravel",
        unitAbbr: "m³",
        description: "Fine construction sand for concrete mixing"
      },
      {
        name: "Electrical Wire 12 AWG",
        sku: "ELE-001",
        quantity: 500,
        price: 1.80,
        category: "Electrical",
        unitAbbr: "m",
        description: "12 AWG electrical wire for building wiring"
      },
      {
        name: "PVC Pipe 4\" x 6m",
        sku: "PLB-001",
        quantity: 80,
        price: 22.00,
        category: "Plumbing",
        unitAbbr: "pcs",
        description: "4-inch PVC pipe for drainage and sewer systems"
      },
      {
        name: "Galvanized Bolts 1/2\" x 6\"",
        sku: "HW-001",
        quantity: 500,
        price: 1.35,
        category: "Hardware",
        unitAbbr: "pcs",
        description: "Galvanized bolts for structural connections"
      },
      {
        name: "Shovel - Heavy Duty",
        sku: "TL-001",
        quantity: 25,
        price: 25.00,
        category: "Tools & Equipment",
        unitAbbr: "pcs",
        description: "Heavy-duty shovel for construction work"
      },
      {
        name: "2x4 Lumber 8ft",
        sku: "LBR-001",
        quantity: 200,
        price: 6.25,
        category: "Lumber & Wood",
        unitAbbr: "pcs",
        description: "2x4 lumber for framing and construction"
      }
    ];

    // Insert all products
    let createdProductIds = [];
    for (const product of bbProducts) {
      const categoryId = categoryMap.get(product.category);
      const unitId = unitMap.get(product.unitAbbr);
      
      if (categoryId && unitId) {
        const productId = await ctx.db.insert("products", {
          name: product.name,
          sku: product.sku,
          quantity: product.quantity,
          price: product.price,
          categoryId: categoryId,
          unitOfMeasureId: unitId,
          description: product.description
        });
        createdProductIds.push(productId);
      }
    }

    // Skip purchase orders for now due to schema complexity

    // Create initial inventory transactions for each product
    for (let i = 0; i < createdProductIds.length; i++) {
      const product = bbProducts[i];
      const productId = createdProductIds[i];
      
      await ctx.db.insert("inventoryTransactions", {
        productId: productId,
        type: "receive",
        quantityChange: product.quantity,
        unitCostAtTransaction: product.price,
        date: Date.now(),
        userId: "system" as any,
        notes: `Initial stock for ${product.name}`,
      });
    }

    return `B&B Construction sample data created successfully! Created ${createdProductIds.length} products and ${createdProductIds.length} initial transactions.`;
  },
});
