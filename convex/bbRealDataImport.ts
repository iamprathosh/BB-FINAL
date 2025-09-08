import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const importBBRealData = mutation({
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
      throw new Error("Only administrators can import real BB data");
    }

    console.log("Starting BB Real Data Import...");
    
    try {
      // Clear existing data first
      await clearAllData(ctx);
      
      // Import in sequence: Categories -> Units -> Vendors -> Users -> Projects -> Products
      await importCategories(ctx);
      await importUnits(ctx);
      await importVendors(ctx);
      await importUsers(ctx);
      await importProjects(ctx);
      await importProducts(ctx);
      
      return {
        success: true,
        message: "BB Real Data imported successfully!",
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error("BB Real Data Import failed:", error);
      throw new Error(`Import failed: ${error}`);
    }
  },
});

// Helper function to clear all existing data
async function clearAllData(ctx: any) {
  console.log("Clearing existing data...");
  
  // Clear in reverse dependency order
  const transactions = await ctx.db.query("inventoryTransactions").collect();
  for (const item of transactions) await ctx.db.delete(item._id);
  
  const vendorProducts = await ctx.db.query("vendorProducts").collect();
  for (const item of vendorProducts) await ctx.db.delete(item._id);
  
  const products = await ctx.db.query("products").collect();
  for (const item of products) await ctx.db.delete(item._id);
  
  const projects = await ctx.db.query("projects").collect();
  for (const item of projects) await ctx.db.delete(item._id);
  
  const vendors = await ctx.db.query("vendors").collect();
  for (const item of vendors) await ctx.db.delete(item._id);
  
  const categories = await ctx.db.query("categories").collect();
  for (const item of categories) await ctx.db.delete(item._id);
  
  const units = await ctx.db.query("unitsOfMeasure").collect();
  for (const item of units) await ctx.db.delete(item._id);
  
  console.log("✓ Existing data cleared");
}

// Import categories from inventory data
async function importCategories(ctx: any) {
  console.log("Importing categories...");
  
  const inventoryData = [
    { category: "Lumber", description: "Wood and lumber products" },
    { category: "Reinforcement", description: "Rebar and reinforcement materials" },
    { category: "Cutting Blades & Acc.", description: "Cutting tools and accessories" },
    { category: "Drill Bits", description: "Drilling tools and bits" },
    { category: "General Items", description: "General construction supplies" },
    { category: "Safety Equipment & PPE", description: "Personal protective equipment" },
    { category: "Epoxy", description: "Adhesives and epoxy products" },
    { category: "Equipment Maintenance", description: "Equipment repair and maintenance supplies" },
    { category: "Fasterners", description: "Nails, screws, and fasteners" }
  ];
  
  const categoryMap = new Map();
  for (const cat of inventoryData) {
    const categoryId = await ctx.db.insert("categories", {
      name: cat.category,
      description: cat.description
    });
    categoryMap.set(cat.category, categoryId);
  }
  
  console.log(`✓ ${inventoryData.length} categories imported`);
  return categoryMap;
}

// Import units of measure from inventory data
async function importUnits(ctx: any) {
  console.log("Importing units...");
  
  const unitData = [
    { name: "Sheet", abbreviation: "sht", type: "count" },
    { name: "Each", abbreviation: "ea", type: "count" },
    { name: "Pallet", abbreviation: "plt", type: "count" },
    { name: "Box", abbreviation: "box", type: "count" },
    { name: "Roll", abbreviation: "roll", type: "count" },
    { name: "Case", abbreviation: "case", type: "count" },
    { name: "Bag", abbreviation: "bag", type: "count" }
  ];
  
  const unitMap = new Map();
  for (const unit of unitData) {
    const unitId = await ctx.db.insert("unitsOfMeasure", {
      name: unit.name,
      abbreviation: unit.abbreviation
    });
    unitMap.set(unit.name, unitId);
  }
  
  console.log(`✓ ${unitData.length} units imported`);
  return unitMap;
}

// Import vendors from CSV data
async function importVendors(ctx: any) {
  console.log("Importing vendors...");
  
  const vendorData = [
    { vendorId: "1000", name: "Internal Order", email: "jerinsebastian@bandbconcrete.com" },
    { vendorId: "1001", name: "Arman Supply Inc.", phone: "8453586446", email: "armansupplyinc@gmail.com", address: "381 Route 59, West Nyack, NY 10994" },
    { vendorId: "1002", name: "Azores Concrete Pumping LLC", phone: "9148049101", email: "simpac24@aol.com", address: "852 Franklin Ave., Franklin Lakes, NJ 07417" },
    { vendorId: "1003", name: "Beckerle Lumber Supply Co Inc", phone: "8453594633", email: "office@beckerlelumber.com", address: "P.O Box 649 3 Chestnut St, Spring Valley, NY 10977" },
    { vendorId: "1004", name: "Bonded Concrete", phone: "5182735800", email: "ar@bondedconcrete.com", address: "PO Box 189, Watervliet, NY 12189" },
    { vendorId: "1005", name: "Brewster Transit Mix", phone: "8453594633", email: "Marilyn.tyree@brewstertransitmix.com", address: "31 Field Lane, Brewster, NY 10509" },
    { vendorId: "1006", name: "Byram Concrete & Supply LLC", phone: "8452794270", email: "billing@byramconcrete.com", address: "PO Box 410, Brewster, NY 10509" },
    { vendorId: "1007", name: "Dakota Concrete Services", phone: "9146824477", email: "AR@DAKOTA-CONCRETE.COM", address: "51 Route 100, Briarcliff Manor, NY 10510" },
    { vendorId: "1008", name: "Danbury Concrete Pumping LLC", phone: "2037918087", email: "vcarvalho@danburyconcretepumpingllc.com", address: "2 Durham Road, Danbury, CT 06811" },
    { vendorId: "1009", name: "Dick's Concrete Company", phone: "8453745966", email: "dicksconcreteny@aol.com", address: "1053 County Route 37, New Hampton, NY 10958" },
    { vendorId: "1010", name: "E. Tetz and Sons", phone: "8456924486", email: "mainoffice@etetz-sons.com", address: "130 Crotty Road, Middletown, NY 10941" },
    { vendorId: "1011", name: "Grade Industrial Supply", phone: "8457658997", email: "ar@gradeindustrial.com", address: "1418 RT 9D, Wappingers Falls, NY 12590" },
    { vendorId: "1021", name: "White Cap", phone: "5184383976", email: "Stephany.Goyette@whitecap.com", address: "PO Box 4944, Orlando, FL 32802" },
    { vendorId: "1033", name: "Nyack Lumber, Inc", phone: "8453589763", email: "nyacklumberdesk@gmail.com", address: "118 Route 59, Central Nyack, NY 10960" }
  ];
  
  const vendorMap = new Map();
  for (const vendor of vendorData) {
    const vendorDbId = await ctx.db.insert("vendors", {
      name: vendor.name,
      email: vendor.email || undefined,
      phone: vendor.phone || undefined,
      address: vendor.address || undefined,
      contactPerson: vendor.name.includes("Inc") ? "Manager" : undefined
    });
    vendorMap.set(vendor.vendorId, vendorDbId);
  }
  
  console.log(`✓ ${vendorData.length} vendors imported`);
  return vendorMap;
}

// Import users from employee data
async function importUsers(ctx: any) {
  console.log("Importing users...");
  
  const userData = [
    { id: "1001", name: "John Wesley Sebastian", role: "admin", title: "Super Admin" },
    { id: "1002", name: "Vincent Jennosa", role: "admin", title: "Super Admin" },
    { id: "1003", name: "Mathieu Blandin", role: "admin", title: "Admin" },
    { id: "1004", name: "Timothy Hoey", role: "worker", title: "Worker" },
    { id: "1005", name: "Jerin Lesley Sebastian", role: "admin", title: "Admin" },
    { id: "1006", name: "Gilma Kelly", role: "worker", title: "Worker" },
    { id: "1007", name: "Winder L Alvarez", role: "worker", title: "Worker" },
    { id: "1008", name: "Julio C Alvarracin", role: "supervisor", title: "Log Inventory" },
    { id: "1011", name: "Juan C Duchi", role: "supervisor", title: "Log Inventory" },
    { id: "1013", name: "Rui Fidalgo", role: "supervisor", title: "Log Inventory" },
    { id: "1014", name: "Patricio F Guallpa", role: "supervisor", title: "Log Inventory" },
    { id: "1015", name: "Segundo I Naula", role: "supervisor", title: "Log Inventory" },
    { id: "1016", name: "Justo G Paredes", role: "supervisor", title: "Log Inventory" },
    { id: "1018", name: "Colin Smallman", role: "supervisor", title: "Log Inventory" },
    { id: "1038", name: "Ronald Zapata", role: "supervisor", title: "Log Inventory" }
  ];
  
  let userCount = 0;
  for (const user of userData) {
    // Create users with realistic token identifiers (these won't be used for actual auth)
    await ctx.db.insert("appUsers", {
      name: user.name,
      email: `${user.name.toLowerCase().replace(/\s+/g, '.')}@bandbconcrete.com`,
      role: user.role,
      title: user.title,
      tokenIdentifier: `bb_user_${user.id}` // Placeholder token
    });
    userCount++;
  }
  
  console.log(`✓ ${userCount} users imported`);
}

// Import projects from project data
async function importProjects(ctx: any) {
  console.log("Importing projects...");
  
  const projectData = [
    { jobNumber: "21108", name: "Bedford Correctional Facility WWTP", budget: 954500, address: "247 Harris Road, Bedford Hills, NY 10507" },
    { jobNumber: "23072", name: "Florida Water Filtration", budget: 173000, address: "315 Glennere Ave., Florida, NY 10921" },
    { jobNumber: "23099", name: "Delano Hitch", budget: 315000, address: "375 Washington St., Newburgh, NY 12550" },
    { jobNumber: "23108", name: "WTP Lewisboro", budget: 299500, address: "400 Oakridge Dr, South Salem, NY 10590" },
    { jobNumber: "24021", name: "Twin Towers", budget: 2700000, address: "112 Grand Ave, Middletown, NY 10940" },
    { jobNumber: "24027", name: "Croton Harmon", budget: 108000, address: "10 Gerstein St, Croton-on-Hudson, NY 10520" },
    { jobNumber: "24030", name: "Beacon Pump Station", budget: 25600, address: "West Main Street, Beacon, NY 12508" },
    { jobNumber: "24047", name: "Brewster H.S", budget: 65785, address: "50 Foggintown rd, Brewster, NY 10509" },
    { jobNumber: "24053", name: "BOCES- Orange & Ulster", budget: 269000, address: "4 Harriman Dr, Goshen, NY 10924" },
    { jobNumber: "24059", name: "Valley Cottage - Fisherman", budget: 148000, address: "299 Rockland Lake Rd, Valley Cottage, NY 10989" },
    { jobNumber: "25032", name: "Roger Ludlowe", budget: 168500, address: "689 Unquowa Rd, Fairfield, CT 06824" },
    { jobNumber: "25034", name: "WL Morse Elementary School", budget: 750000, address: "30 Pocantico St, Sleepy Hollow, NY 10591" },
    { jobNumber: "25012", name: "Ulster Operations Center", budget: 1299000, address: "10 Paradies Lane, New Paltz, NY 12561" }
  ];
  
  for (const project of projectData) {
    await ctx.db.insert("projects", {
      name: project.name,
      description: `Project ${project.jobNumber} - ${project.name}`,
      address: project.address,
      status: Math.random() > 0.3 ? "In Progress" : "Planning", // Most projects active
      startDate: Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000), // Random start date within last year
      managerId: undefined // Will be assigned later when needed
    });
  }
  
  console.log(`✓ ${projectData.length} projects imported`);
}

// Import products from inventory data
async function importProducts(ctx: any) {
  console.log("Importing products...");
  
  const categories = await ctx.db.query("categories").collect();
  const units = await ctx.db.query("unitsOfMeasure").collect();
  const vendors = await ctx.db.query("vendors").collect();
  
  const categoryMap = new Map();
  categories.forEach((cat: any) => categoryMap.set(cat.name, cat._id));
  
  const unitMap = new Map();
  units.forEach((unit: any) => unitMap.set(unit.name, unit._id));
  
  const vendorMap = new Map();
  vendors.forEach((vendor: any) => {
    if (vendor.name === "Nyack Lumber, Inc") vendorMap.set("1033", vendor._id);
    if (vendor.name === "Grade Industrial Supply") vendorMap.set("1011", vendor._id);
    if (vendor.name === "White Cap") vendorMap.set("1021", vendor._id);
    if (vendor.name === "Internal Order") vendorMap.set("1000", vendor._id);
  });
  
  const inventoryData = [
    { itemNo: "LUM 001", name: "CDX Plywood 1/2 in", category: "Lumber", uom: "Sheet", vendorId: "1033", price: 45.99 },
    { itemNo: "LUM 002", name: "CDX Plywood 5/8 in", category: "Lumber", uom: "Sheet", vendorId: "1033", price: 52.99 },
    { itemNo: "LUM 003", name: "2x4 – 16 Ft", category: "Lumber", uom: "Each", vendorId: "1033", price: 12.99 },
    { itemNo: "LUM 004", name: "2x6 – 16 Ft", category: "Lumber", uom: "Each", vendorId: "1033", price: 19.99 },
    { itemNo: "LUM 005", name: "2x12 – 16 Ft", category: "Lumber", uom: "Each", vendorId: "1033", price: 45.99 },
    { itemNo: "REI 001", name: "Rebar Chair 3 in", category: "Reinforcement", uom: "Pallet", vendorId: "1011", price: 125.00 },
    { itemNo: "REI 002", name: "Rebar Chair 4 in", category: "Reinforcement", uom: "Pallet", vendorId: "1011", price: 145.00 },
    { itemNo: "REI 003", name: "Wire Mesh 4x4", category: "Reinforcement", uom: "Sheet", vendorId: "1011", price: 89.99 },
    { itemNo: "REI 004", name: "Wire Mesh 6x6", category: "Reinforcement", uom: "Sheet", vendorId: "1011", price: 99.99 },
    { itemNo: "REI 005", name: "#3 Rebar - 20 ft", category: "Reinforcement", uom: "Each", vendorId: "1011", price: 24.99 },
    { itemNo: "REI 006", name: "#4 Rebar - 20 ft", category: "Reinforcement", uom: "Each", vendorId: "1011", price: 28.99 },
    { itemNo: "REI 007", name: "#5 Rebar - 20 ft", category: "Reinforcement", uom: "Each", vendorId: "1011", price: 34.99 },
    { itemNo: "REI 008", name: "#6 Rebar - 20 ft", category: "Reinforcement", uom: "Each", vendorId: "1011", price: 39.99 },
    { itemNo: "REI 009", name: "#7 Rebar - 20 ft", category: "Reinforcement", uom: "Each", vendorId: "1011", price: 44.99 },
    { itemNo: "REI 010", name: "#8 Rebar - 20 ft", category: "Reinforcement", uom: "Each", vendorId: "1011", price: 49.99 },
    { itemNo: "REI 011", name: "Coil Tie Wire 16 Gauge", category: "Reinforcement", uom: "Box", vendorId: "1021", price: 65.99 },
    { itemNo: "SAF 001", name: "Safety Mask", category: "Safety Equipment & PPE", uom: "Box", vendorId: "1021", price: 29.99 },
    { itemNo: "SAF 002", name: "Safety Glass", category: "Safety Equipment & PPE", uom: "Box", vendorId: "1021", price: 35.99 },
    { itemNo: "SAF 003", name: "Rebar Caps", category: "Safety Equipment & PPE", uom: "Box", vendorId: "1021", price: 15.99 },
    { itemNo: "SAF 004", name: "Eye Wash Solution", category: "Safety Equipment & PPE", uom: "Each", vendorId: "1021", price: 12.99 },
    { itemNo: "SAF 005", name: "Gloves", category: "Safety Equipment & PPE", uom: "Box", vendorId: "1021", price: 22.99 },
    { itemNo: "SAF 006", name: "Safety Vest", category: "Safety Equipment & PPE", uom: "Each", vendorId: "1021", price: 18.99 },
    { itemNo: "GEN 001", name: "String Line", category: "General Items", uom: "Roll", vendorId: "1021", price: 8.99 },
    { itemNo: "GEN 002", name: "9 in Roller", category: "General Items", uom: "Each", vendorId: "1021", price: 6.99 },
    { itemNo: "GEN 003", name: "Sponge", category: "General Items", uom: "Each", vendorId: "1021", price: 3.99 },
    { itemNo: "FAS 001", name: "Concrete Nails", category: "Fasterners", uom: "Box", vendorId: "1021", price: 16.99 },
    { itemNo: "FAS 002", name: "16D Duplex Nail", category: "Fasterners", uom: "Box", vendorId: "1021", price: 14.99 },
    { itemNo: "FAS 003", name: "16D Common Nail", category: "Fasterners", uom: "Box", vendorId: "1021", price: 13.99 }
  ];
  
  let productCount = 0;
  for (const item of inventoryData) {
    const categoryId = categoryMap.get(item.category);
    const unitId = unitMap.get(item.uom);
    const vendorId = vendorMap.get(item.vendorId);
    
    if (!categoryId || !unitId) {
      console.log(`Skipping ${item.name} - missing category or unit`);
      continue;
    }
    
    const productId = await ctx.db.insert("products", {
      name: item.name,
      sku: item.itemNo,
      description: `${item.name} - BB Construction inventory`,
      quantity: Math.floor(Math.random() * 150) + 25, // Random quantity 25-175
      price: item.price,
      categoryId: categoryId,
      unitOfMeasureId: unitId
    });
    
    // Create vendor-product relationship if vendor exists
    if (vendorId) {
      await ctx.db.insert("vendorProducts", {
        vendorId: vendorId,
        productId: productId,
        vendorPrice: item.price * 0.85, // Vendor price slightly lower
        vendorSku: item.itemNo
      });
    }
    
    productCount++;
  }
  
  console.log(`✓ ${productCount} products imported`);
}
