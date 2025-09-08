import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Clear all data without authentication (for initial setup)
export const clearAllData = mutation({
  args: { confirmClear: v.boolean() },
  handler: async (ctx, { confirmClear }) => {
    if (!confirmClear) {
      throw new Error("Must confirm data clearing");
    }

    const tables = [
      "inventoryTransactions",
      "vendorProducts", 
      "purchaseOrders",
      "products",
      "projects",
      "categories",
      "unitsOfMeasure", 
      "vendors",
      "files",
      "actionLogs",
      "appUsers"
    ];

    let totalDeleted = 0;
    
    for (const table of tables) {
      const records = await ctx.db.query(table as any).collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
        totalDeleted++;
      }
    }

    return {
      success: true,
      message: `Cleared ${totalDeleted} records from ${tables.length} tables`,
      totalDeleted
    };
  }
});

// Setup initial BB data without authentication
export const setupBBData = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      categories: 0,
      units: 0,
      vendors: 0,
      users: 0,
      projects: 0,
      products: 0,
      errors: [] as string[]
    };

    try {
      // 1. Create categories
      const categories = [
        { name: "Lumber", description: "Wood products and lumber materials" },
        { name: "Reinforcement", description: "Rebar and reinforcement materials" },
        { name: "Cutting Blades & Acc.", description: "Cutting blades and accessories" },
        { name: "Drill Bits", description: "Drilling equipment and bits" },
        { name: "General Items", description: "General construction items" },
        { name: "Safety Equipment & PPE", description: "Personal protective equipment" },
        { name: "Epoxy", description: "Epoxy and adhesive materials" },
        { name: "Equipment Maintenance", description: "Equipment maintenance supplies" },
        { name: "Fasteners", description: "Nails, screws, and fastening materials" }
      ];

      const createdCategories = [];
      for (const category of categories) {
        const categoryId = await ctx.db.insert("categories", category);
        createdCategories.push({ id: categoryId, name: category.name });
        results.categories++;
      }

      // 2. Create units of measure
      const units = [
        { name: "Sheet", abbreviation: "sheet" },
        { name: "Each", abbreviation: "each" },
        { name: "Pallet", abbreviation: "pallet" },
        { name: "Box", abbreviation: "box" },
        { name: "Bag", abbreviation: "bag" },
        { name: "Roll", abbreviation: "roll" },
        { name: "Case", abbreviation: "case" }
      ];

      const createdUnits = [];
      for (const unit of units) {
        const unitId = await ctx.db.insert("unitsOfMeasure", unit);
        createdUnits.push({ id: unitId, name: unit.name, abbreviation: unit.abbreviation });
        results.units++;
      }

      // 3. Create vendors
      const vendorData = [
        { name: "Internal Order", email: "info@bandbconcrete.com" },
        { name: "Grade Industrial Supply", email: "contact@gradeindustrial.com" },
        { name: "White Cap", email: "orders@whitecap.com" },
        { name: "Nyack Lumber, Inc", email: "sales@nyacklumber.com" },
        { name: "Arman Supply Inc.", email: "armansupplyinc@gmail.com", phone: "(845) 358-6446", address: "381 Route 59, West Nyack, NY 10994", contactPerson: "Lou" }
      ];

      for (const vendor of vendorData) {
        await ctx.db.insert("vendors", {
          name: vendor.name,
          email: vendor.email || undefined,
          phone: vendor.phone || undefined,
          address: vendor.address || undefined,
          contactPerson: vendor.contactPerson || undefined
        });
        results.vendors++;
      }

      // 4. Create admin user
      const adminUser = {
        name: "Admin User",
        email: "admin@bandbconcrete.com",
        role: "admin" as const,
        title: "System Administrator",
        tokenIdentifier: "admin_user_001"
      };

      const userId = await ctx.db.insert("appUsers", adminUser);
      results.users++;

      // 5. Create projects
      const projects = [
        { name: "Bedford Correctional Facility WWTP", address: "247 Harris Road, Bedford Hills, NY 10507", status: "In Progress" as const, description: "Job #21108 - Major water treatment project" },
        { name: "Florida Water Filtration", address: "315 Glennere Ave., Florida, NY 10921", status: "Completed" as const, description: "Job #23072 - Water filtration system upgrade" },
        { name: "Twin Towers", address: "112 Grand Ave, Middletown, NY 10940", status: "In Progress" as const, description: "Job #24021 - Large commercial construction project" }
      ];

      for (const project of projects) {
        await ctx.db.insert("projects", project);
        results.projects++;
      }

      // 6. Create products
      const categoryMap = new Map(createdCategories.map(c => [c.name, c.id]));
      const unitMap = new Map(createdUnits.map(u => [u.name, u.id]));

      const inventoryProducts = [
        { itemNo: "LUM 001", name: "CDX Plywood 1/2 in", category: "Lumber", uom: "Sheet", quantity: 25, price: 45.50 },
        { itemNo: "LUM 002", name: "CDX Plywood 5/8 in", category: "Lumber", uom: "Sheet", quantity: 20, price: 52.75 },
        { itemNo: "LUM 003", name: "2x4 – 16 Ft", category: "Lumber", uom: "Each", quantity: 100, price: 12.50 },
        { itemNo: "LUM 004", name: "2x6 – 16 Ft", category: "Lumber", uom: "Each", quantity: 75, price: 18.75 },
        { itemNo: "REI 001", name: "Rebar Chair 3 in", category: "Reinforcement", uom: "Pallet", quantity: 10, price: 125.00 },
        { itemNo: "REI 002", name: "Rebar Chair 4 in", category: "Reinforcement", uom: "Pallet", quantity: 8, price: 135.00 },
        { itemNo: "REI 005", name: "#3 Rebar - 20 ft", category: "Reinforcement", uom: "Each", quantity: 200, price: 8.25 },
        { itemNo: "REI 006", name: "#4 Rebar - 20 ft", category: "Reinforcement", uom: "Each", quantity: 150, price: 12.50 },
        { itemNo: "CBA 001", name: "Concrete Cutting Blade", category: "Cutting Blades & Acc.", uom: "Each", quantity: 15, price: 85.00 },
        { itemNo: "SAF 001", name: "Safety Mask", category: "Safety Equipment & PPE", uom: "Box", quantity: 50, price: 25.50 },
        { itemNo: "SAF 005", name: "Gloves", category: "Safety Equipment & PPE", uom: "Box", quantity: 30, price: 18.75 },
        { itemNo: "FAS 001", name: "Concrete Nails", category: "Fasteners", uom: "Box", quantity: 40, price: 12.25 }
      ];

      for (const item of inventoryProducts) {
        try {
          const categoryId = categoryMap.get(item.category);
          const unitId = unitMap.get(item.uom);
          
          if (categoryId && unitId) {
            const productId = await ctx.db.insert("products", {
              name: item.name,
              sku: item.itemNo,
              quantity: item.quantity,
              price: item.price,
              categoryId: categoryId,
              unitOfMeasureId: unitId,
              description: `${item.name} from BB inventory`
            });

            // Create initial inventory transaction
            await ctx.db.insert("inventoryTransactions", {
              productId: productId,
              type: "receive",
              quantityChange: item.quantity,
              unitCostAtTransaction: item.price,
              date: Date.now(),
              userId: userId,
              notes: "Initial stock from BB inventory setup"
            });

            results.products++;
          }
        } catch (error) {
          results.errors.push(`Error creating product ${item.itemNo}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      return {
        success: true,
        message: "BB data setup completed successfully!",
        results,
        summary: `Created: ${results.categories} categories, ${results.units} units, ${results.vendors} vendors, ${results.users} users, ${results.projects} projects, ${results.products} products`
      };

    } catch (error) {
      results.errors.push(error instanceof Error ? error.message : String(error));
      return {
        success: false,
        message: "BB data setup failed",
        results,
        errors: results.errors
      };
    }
  }
});
