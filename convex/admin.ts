import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Clear all sample data from the database (preserving user accounts)
export const clearAllSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get current user to verify admin access
    const user = await ctx.db
      .query("appUsers")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is admin
    if (user.role !== "admin") {
      throw new Error("Only administrators can clear sample data");
    }

    let deletedCount = 0;

    try {
      // Clear inventory transactions
      const transactions = await ctx.db.query("inventoryTransactions").collect();
      for (const transaction of transactions) {
        await ctx.db.delete(transaction._id);
        deletedCount++;
      }

      // Clear purchase orders
      const purchaseOrders = await ctx.db.query("purchaseOrders").collect();
      for (const po of purchaseOrders) {
        await ctx.db.delete(po._id);
        deletedCount++;
      }

      // Clear products
      const products = await ctx.db.query("products").collect();
      for (const product of products) {
        await ctx.db.delete(product._id);
        deletedCount++;
      }

      // Clear vendor products relationships
      const vendorProducts = await ctx.db.query("vendorProducts").collect();
      for (const vp of vendorProducts) {
        await ctx.db.delete(vp._id);
        deletedCount++;
      }

      // Clear vendors
      const vendors = await ctx.db.query("vendors").collect();
      for (const vendor of vendors) {
        await ctx.db.delete(vendor._id);
        deletedCount++;
      }

      // Clear categories
      const categories = await ctx.db.query("categories").collect();
      for (const category of categories) {
        await ctx.db.delete(category._id);
        deletedCount++;
      }

      // Clear units of measure
      const units = await ctx.db.query("unitsOfMeasure").collect();
      for (const unit of units) {
        await ctx.db.delete(unit._id);
        deletedCount++;
      }

      // Clear projects
      const projects = await ctx.db.query("projects").collect();
      for (const project of projects) {
        await ctx.db.delete(project._id);
        deletedCount++;
      }

      // Clear logs (optional - you might want to keep these for audit purposes)
      const logs = await ctx.db.query("actionLogs").collect();
      for (const log of logs) {
        await ctx.db.delete(log._id);
        deletedCount++;
      }

      // Clear files
      const files = await ctx.db.query("files").collect();
      for (const file of files) {
        await ctx.db.delete(file._id);
        deletedCount++;
      }

      return {
        success: true,
        message: `Successfully cleared all sample data! Deleted ${deletedCount} records.`,
        deletedCount
      };

    } catch (error) {
      console.error("Error clearing sample data:", error);
      throw new Error(`Failed to clear sample data: ${error}`);
    }
  },
});

// Re-export the import function from importMasterList for convenience
export const importBBInventoryMasterList = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get current user to verify admin access
    const user = await ctx.db
      .query("appUsers")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is admin
    if (user.role !== "admin") {
      throw new Error("Only administrators can import master inventory data");
    }

    // First, create essential categories and units that will be needed
    const categories = [
      { name: "Cement & Concrete", description: "Cement, concrete mix, additives", icon: "🧱" },
      { name: "Steel & Rebar", description: "Rebar, steel bars, mesh", icon: "🔩" },
      { name: "Blocks & Bricks", description: "Concrete blocks, clay bricks", icon: "🧱" },
      { name: "Sand & Gravel", description: "Construction sand, gravel, aggregates", icon: "⛏️" },
      { name: "Electrical", description: "Wires, conduits, electrical components", icon: "⚡" },
      { name: "Plumbing", description: "Pipes, fittings, plumbing supplies", icon: "🔧" },
      { name: "Tools & Equipment", description: "Hand tools, power tools, equipment", icon: "🔨" },
      { name: "Hardware", description: "Bolts, screws, fasteners", icon: "🔩" },
      { name: "Paint & Finishes", description: "Paint, primers, finishing materials", icon: "🎨" },
      { name: "Lumber & Wood", description: "Timber, plywood, wood products", icon: "🌲" },
    ];

    const units = [
      { name: "Bag", abbreviation: "bag", type: "count" },
      { name: "Piece", abbreviation: "pcs", type: "count" },
      { name: "Kilogram", abbreviation: "kg", type: "weight" },
      { name: "Ton", abbreviation: "ton", type: "weight" },
      { name: "Meter", abbreviation: "m", type: "length" },
      { name: "Cubic Meter", abbreviation: "m³", type: "volume" },
      { name: "Square Meter", abbreviation: "m²", type: "area" },
      { name: "Roll", abbreviation: "roll", type: "count" },
      { name: "Bundle", abbreviation: "bundle", type: "count" },
      { name: "Sheet", abbreviation: "sheet", type: "count" },
      { name: "Gallon", abbreviation: "gal", type: "volume" },
      { name: "Liter", abbreviation: "L", type: "volume" },
    ];

    // Create categories
    const createdCategories = [];
    for (const category of categories) {
      const categoryId = await ctx.db.insert("categories", {
        name: category.name,
        description: category.description,
      });
      createdCategories.push({ id: categoryId, name: category.name });
    }

    // Create units
    const createdUnits = [];
    for (const unit of units) {
      const unitId = await ctx.db.insert("unitsOfMeasure", {
        name: unit.name,
        abbreviation: unit.abbreviation,
      });
      createdUnits.push({ id: unitId, name: unit.name, abbreviation: unit.abbreviation });
    }

    // Create sample products based on typical B&B inventory
    const products = [
      // Cement & Concrete
      { name: "Portland Cement", sku: "CEM-001", category: "Cement & Concrete", unit: "bag", quantity: 50, price: 12.50, costPrice: 10.00 },
      { name: "Ready Mix Concrete", sku: "CEM-002", category: "Cement & Concrete", unit: "m³", quantity: 25, price: 120.00, costPrice: 95.00 },
      { name: "Concrete Blocks 8\"", sku: "BLK-001", category: "Blocks & Bricks", unit: "pcs", quantity: 500, price: 2.50, costPrice: 1.80 },
      { name: "Concrete Blocks 6\"", sku: "BLK-002", category: "Blocks & Bricks", unit: "pcs", quantity: 300, price: 2.25, costPrice: 1.60 },
      
      // Steel & Rebar
      { name: "Rebar 10mm x 6m", sku: "RB-001", category: "Steel & Rebar", unit: "pcs", quantity: 200, price: 18.50, costPrice: 14.50 },
      { name: "Rebar 12mm x 6m", sku: "RB-002", category: "Steel & Rebar", unit: "pcs", quantity: 150, price: 22.75, costPrice: 18.50 },
      { name: "Steel Mesh 6x6", sku: "SM-001", category: "Steel & Rebar", unit: "sheet", quantity: 80, price: 45.00, costPrice: 35.00 },
      
      // Sand & Gravel
      { name: "Construction Sand", sku: "AGG-001", category: "Sand & Gravel", unit: "m³", quantity: 15, price: 45.00, costPrice: 35.00 },
      { name: "Crushed Gravel 3/4\"", sku: "AGG-002", category: "Sand & Gravel", unit: "m³", quantity: 12, price: 55.00, costPrice: 42.00 },
      { name: "Fill Dirt", sku: "AGG-003", category: "Sand & Gravel", unit: "m³", quantity: 20, price: 25.00, costPrice: 18.00 },
      
      // Electrical
      { name: "Electrical Wire 12 AWG", sku: "ELE-001", category: "Electrical", unit: "m", quantity: 500, price: 2.50, costPrice: 1.80 },
      { name: "PVC Conduit 1/2\"", sku: "ELE-002", category: "Electrical", unit: "m", quantity: 300, price: 3.25, costPrice: 2.40 },
      { name: "Junction Box", sku: "ELE-003", category: "Electrical", unit: "pcs", quantity: 100, price: 8.50, costPrice: 6.20 },
      
      // Plumbing
      { name: "PVC Pipe 4\" x 6m", sku: "PLB-001", category: "Plumbing", unit: "pcs", quantity: 80, price: 28.50, costPrice: 22.00 },
      { name: "PVC Pipe 2\" x 6m", sku: "PLB-002", category: "Plumbing", unit: "pcs", quantity: 120, price: 15.75, costPrice: 12.50 },
      { name: "PVC Elbow 4\"", sku: "PLB-003", category: "Plumbing", unit: "pcs", quantity: 200, price: 4.25, costPrice: 3.10 },
      
      // Hardware
      { name: "Galvanized Bolts 1/2\" x 6\"", sku: "HW-001", category: "Hardware", unit: "pcs", quantity: 500, price: 1.85, costPrice: 1.35 },
      { name: "Concrete Screws", sku: "HW-002", category: "Hardware", unit: "pcs", quantity: 1000, price: 0.95, costPrice: 0.65 },
      { name: "Anchor Bolts", sku: "HW-003", category: "Hardware", unit: "pcs", quantity: 300, price: 3.50, costPrice: 2.75 },
      
      // Tools & Equipment
      { name: "Shovel - Heavy Duty", sku: "TL-001", category: "Tools & Equipment", unit: "pcs", quantity: 25, price: 35.00, costPrice: 25.00 },
      { name: "Wheelbarrow", sku: "TL-002", category: "Tools & Equipment", unit: "pcs", quantity: 10, price: 125.00, costPrice: 95.00 },
      { name: "Level 4ft", sku: "TL-003", category: "Tools & Equipment", unit: "pcs", quantity: 15, price: 45.00, costPrice: 32.00 },
      
      // Paint & Finishes
      { name: "Exterior Paint - White", sku: "PT-001", category: "Paint & Finishes", unit: "gal", quantity: 50, price: 38.50, costPrice: 28.00 },
      { name: "Primer - Universal", sku: "PT-002", category: "Paint & Finishes", unit: "gal", quantity: 40, price: 32.00, costPrice: 24.50 },
      
      // Lumber & Wood
      { name: "2x4 Lumber 8ft", sku: "LBR-001", category: "Lumber & Wood", unit: "pcs", quantity: 200, price: 8.50, costPrice: 6.25 },
      { name: "2x6 Lumber 10ft", sku: "LBR-002", category: "Lumber & Wood", unit: "pcs", quantity: 150, price: 15.75, costPrice: 12.50 },
      { name: "Plywood 3/4\" 4x8", sku: "PLY-001", category: "Lumber & Wood", unit: "sheet", quantity: 75, price: 65.00, costPrice: 48.00 },
    ];

    // Find category and unit IDs for products
    const categoryMap = new Map(createdCategories.map(c => [c.name, c.id]));

    let createdProducts = 0;
    for (const product of products) {
      const categoryId = categoryMap.get(product.category);
      const unit = createdUnits.find(u => u.abbreviation === product.unit);
      
      if (categoryId && unit) {
        const productId = await ctx.db.insert("products", {
          name: product.name,
          sku: product.sku,
          quantity: product.quantity,
          price: product.costPrice, // Use costPrice as the MAUC in price field
          categoryId: categoryId,
          unitOfMeasureId: unit.id,
          description: `${product.name} for construction use`,
        });
        createdProducts++;
        
        // Create initial inventory transaction for stock receipt
        await ctx.db.insert("inventoryTransactions", {
          productId: productId,
          type: "receive",
          quantityChange: product.quantity,
          unitCostAtTransaction: product.costPrice,
          date: Date.now(),
          userId: user._id,
          notes: "Initial stock import from B&B Master List",
        });
      }
    }

    return {
      success: true,
      message: "B&B Inventory Master List imported successfully!",
      imported: {
        categories: createdCategories.length,
        units: createdUnits.length,
        products: createdProducts,
      }
    };
  },
});
