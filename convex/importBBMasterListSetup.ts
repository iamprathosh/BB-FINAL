import { mutation } from "./_generated/server";

export const setupBBMasterListData = mutation({
  args: {},
  handler: async (ctx) => {
    // This function doesn't require authentication - for initial setup only

    // B&B Master List Data (parsed from the Excel file)
    const bbMasterListData = [
      { itemNo: "LUM 001", productName: "CDX Plywood 1/2 in", category: "Lumber", uom: "Sheet", vendorId: "1033", vendorName: "Nyack Lumber, Inc" },
      { itemNo: "LUM 002", productName: "CDX Plywood 5/8 in", category: "Lumber", uom: "Sheet", vendorId: "1033", vendorName: "Nyack Lumber, Inc" },
      { itemNo: "LUM 003", productName: "2x4 - 16 Ft", category: "Lumber", uom: "Each", vendorId: "1033", vendorName: "Nyack Lumber, Inc" },
      { itemNo: "LUM 004", productName: "2x6 - 16 Ft", category: "Lumber", uom: "Each", vendorId: "1033", vendorName: "Nyack Lumber, Inc" },
      { itemNo: "LUM 005", productName: "2x12 - 16 Ft", category: "Lumber", uom: "Each", vendorId: "1033", vendorName: "Nyack Lumber, Inc" },
      { itemNo: "REI 001", productName: "Rebar Chair 3 in", category: "Reinforcement", uom: "Pallet", vendorId: "1011", vendorName: "Grade Industrial Supply" },
      { itemNo: "REI 002", productName: "Rebar Chair 4 in", category: "Reinforcement", uom: "Pallet", vendorId: "1011", vendorName: "Grade Industrial Supply" },
      { itemNo: "REI 003", productName: "Wire Mesh 4x4", category: "Reinforcement", uom: "Sheet", vendorId: "1011", vendorName: "Grade Industrial Supply" },
      { itemNo: "REI 004", productName: "Wire Mesh 6x6", category: "Reinforcement", uom: "Sheet", vendorId: "1011", vendorName: "Grade Industrial Supply" },
      { itemNo: "REI 005", productName: "#3 Rebar - 20 ft", category: "Reinforcement", uom: "Each", vendorId: "1011", vendorName: "Grade Industrial Supply" },
      { itemNo: "REI 006", productName: "#4 Rebar - 20 ft", category: "Reinforcement", uom: "Each", vendorId: "1011", vendorName: "Grade Industrial Supply" },
      { itemNo: "REI 007", productName: "#5 Rebar - 20 ft", category: "Reinforcement", uom: "Each", vendorId: "1011", vendorName: "Grade Industrial Supply" },
      { itemNo: "REI 008", productName: "#6 Rebar - 20 ft", category: "Reinforcement", uom: "Each", vendorId: "1011", vendorName: "Grade Industrial Supply" },
      { itemNo: "REI 009", productName: "#7 Rebar - 20 ft", category: "Reinforcement", uom: "Each", vendorId: "1011", vendorName: "Grade Industrial Supply" },
      { itemNo: "REI 010", productName: "#8 Rebar - 20 ft", category: "Reinforcement", uom: "Each", vendorId: "1011", vendorName: "Grade Industrial Supply" },
      { itemNo: "BLO 001", productName: "Concrete Block 8x8x16", category: "Block", uom: "Each", vendorId: "1008", vendorName: "Queens Concrete Block" },
      { itemNo: "BLO 002", productName: "Concrete Block 6x8x16", category: "Block", uom: "Each", vendorId: "1008", vendorName: "Queens Concrete Block" },
      { itemNo: "BLO 003", productName: "Concrete Block 4x8x16", category: "Block", uom: "Each", vendorId: "1008", vendorName: "Queens Concrete Block" },
      { itemNo: "BLO 004", productName: "Concrete Block 12x8x16", category: "Block", uom: "Each", vendorId: "1008", vendorName: "Queens Concrete Block" },
      { itemNo: "BLO 005", productName: "Concrete Block 10x8x16", category: "Block", uom: "Each", vendorId: "1008", vendorName: "Queens Concrete Block" },
      { itemNo: "CEM 001", productName: "Portland Cement Type I", category: "Cement", uom: "Bag", vendorId: "1002", vendorName: "Holcim Cement" },
      { itemNo: "CEM 002", productName: "Portland Cement Type II", category: "Cement", uom: "Bag", vendorId: "1002", vendorName: "Holcim Cement" },
      { itemNo: "CEM 003", productName: "Portland Cement Type III", category: "Cement", uom: "Bag", vendorId: "1002", vendorName: "Holcim Cement" },
      { itemNo: "CEM 004", productName: "Masonry Cement", category: "Cement", uom: "Bag", vendorId: "1002", vendorName: "Holcim Cement" },
      { itemNo: "AGG 001", productName: "Sand - Fine", category: "Aggregate", uom: "Ton", vendorId: "1007", vendorName: "Palisades Materials" },
      { itemNo: "AGG 002", productName: "Sand - Coarse", category: "Aggregate", uom: "Ton", vendorId: "1007", vendorName: "Palisades Materials" },
      { itemNo: "AGG 003", productName: "Gravel 3/4 in", category: "Aggregate", uom: "Ton", vendorId: "1007", vendorName: "Palisades Materials" },
      { itemNo: "AGG 004", productName: "Gravel 1 1/2 in", category: "Aggregate", uom: "Ton", vendorId: "1007", vendorName: "Palisades Materials" },
      { itemNo: "AGG 005", productName: "Stone Dust", category: "Aggregate", uom: "Ton", vendorId: "1007", vendorName: "Palisades Materials" },
      { itemNo: "HRD 001", productName: "Anchor Bolts 1/2x6", category: "Hardware", uom: "Each", vendorId: "1004", vendorName: "Fastenal" },
      { itemNo: "HRD 002", productName: "Anchor Bolts 5/8x8", category: "Hardware", uom: "Each", vendorId: "1004", vendorName: "Fastenal" },
      { itemNo: "HRD 003", productName: "Anchor Bolts 3/4x10", category: "Hardware", uom: "Each", vendorId: "1004", vendorName: "Fastenal" },
      { itemNo: "HRD 004", productName: "Hex Bolts 1/2x4", category: "Hardware", uom: "Each", vendorId: "1004", vendorName: "Fastenal" },
      { itemNo: "HRD 005", productName: "Hex Bolts 5/8x6", category: "Hardware", uom: "Each", vendorId: "1004", vendorName: "Fastenal" },
      { itemNo: "WTR 001", productName: "Waterproofing Membrane", category: "Waterproofing", uom: "Roll", vendorId: "1005", vendorName: "Henry Company" },
      { itemNo: "WTR 002", productName: "Foundation Coating", category: "Waterproofing", uom: "Gallon", vendorId: "1005", vendorName: "Henry Company" },
      { itemNo: "WTR 003", productName: "Roof Coating", category: "Waterproofing", uom: "Gallon", vendorId: "1005", vendorName: "Henry Company" },
      { itemNo: "INS 001", productName: "Foam Board Insulation 2in", category: "Insulation", uom: "Sheet", vendorId: "1006", vendorName: "Dow Chemical" },
      { itemNo: "INS 002", productName: "Foam Board Insulation 1in", category: "Insulation", uom: "Sheet", vendorId: "1006", vendorName: "Dow Chemical" },
      { itemNo: "INS 003", productName: "Spray Foam Insulation", category: "Insulation", uom: "Gallon", vendorId: "1006", vendorName: "Dow Chemical" },
      { itemNo: "DRN 001", productName: "4in PVC Drain Pipe", category: "Drainage", uom: "Linear Foot", vendorId: "1009", vendorName: "Ferguson Plumbing" },
      { itemNo: "DRN 002", productName: "6in PVC Drain Pipe", category: "Drainage", uom: "Linear Foot", vendorId: "1009", vendorName: "Ferguson Plumbing" },
      { itemNo: "DRN 003", productName: "8in PVC Drain Pipe", category: "Drainage", uom: "Linear Foot", vendorId: "1009", vendorName: "Ferguson Plumbing" },
      { itemNo: "DRN 004", productName: "Catch Basin", category: "Drainage", uom: "Each", vendorId: "1009", vendorName: "Ferguson Plumbing" },
      { itemNo: "EXC 001", productName: "Excavation Services", category: "Services", uom: "Hour", vendorId: "1001", vendorName: "Empire Excavation" },
      { itemNo: "EXC 002", productName: "Backfill Services", category: "Services", uom: "Hour", vendorId: "1001", vendorName: "Empire Excavation" },
      { itemNo: "EXC 003", productName: "Grading Services", category: "Services", uom: "Hour", vendorId: "1001", vendorName: "Empire Excavation" },
      { itemNo: "CON 001", productName: "Ready Mix Concrete 3000psi", category: "Concrete", uom: "Cubic Yard", vendorId: "1003", vendorName: "Ferrara Brothers" },
      { itemNo: "CON 002", productName: "Ready Mix Concrete 4000psi", category: "Concrete", uom: "Cubic Yard", vendorId: "1003", vendorName: "Ferrara Brothers" },
      { itemNo: "CON 003", productName: "Ready Mix Concrete 5000psi", category: "Concrete", uom: "Cubic Yard", vendorId: "1003", vendorName: "Ferrara Brothers" },
      { itemNo: "FRM 001", productName: "2x4 Lumber - 8ft", category: "Lumber", uom: "Each", vendorId: "1033", vendorName: "Nyack Lumber, Inc" },
      { itemNo: "FRM 002", productName: "2x6 Lumber - 8ft", category: "Lumber", uom: "Each", vendorId: "1033", vendorName: "Nyack Lumber, Inc" },
      { itemNo: "FRM 003", productName: "2x8 Lumber - 8ft", category: "Lumber", uom: "Each", vendorId: "1033", vendorName: "Nyack Lumber, Inc" },
      { itemNo: "FRM 004", productName: "2x10 Lumber - 8ft", category: "Lumber", uom: "Each", vendorId: "1033", vendorName: "Nyack Lumber, Inc" }
    ];

    // Extract unique categories, units, and vendors
    const categories = new Set<string>();
    const units = new Set<string>();
    const vendors = new Map<string, string>();

    bbMasterListData.forEach(item => {
      categories.add(item.category);
      units.add(item.uom);
      vendors.set(item.vendorId, item.vendorName);
    });

    // Create categories
    const categoryMap = new Map<string, any>();
    for (const categoryName of Array.from(categories)) {
      const categoryId = await ctx.db.insert("categories", {
        name: categoryName,
        description: `${categoryName} products from B&B Master List`
      });
      categoryMap.set(categoryName, categoryId);
    }

    // Create units of measure
    const unitMap = new Map<string, any>();
    const unitAbbreviations: { [key: string]: string } = {
      'Sheet': 'sht',
      'Each': 'ea',
      'Pallet': 'plt',
      'Bag': 'bag',
      'Ton': 'ton',
      'Roll': 'roll',
      'Gallon': 'gal',
      'Linear Foot': 'lf',
      'Hour': 'hr',
      'Cubic Yard': 'cy'
    };

    for (const unitName of Array.from(units)) {
      const unitId = await ctx.db.insert("unitsOfMeasure", {
        name: unitName,
        abbreviation: unitAbbreviations[unitName] || unitName.toLowerCase().substring(0, 3)
      });
      unitMap.set(unitName, unitId);
    }

    // Create vendors
    const vendorMap = new Map<string, any>();
    for (const [vendorId, vendorName] of vendors) {
      const vendorDbId = await ctx.db.insert("vendors", {
        name: vendorName
      });
      vendorMap.set(vendorId, vendorDbId);
    }

    // Create products (without user-specific transactions for now)
    let successCount = 0;
    const errors: string[] = [];

    for (const item of bbMasterListData) {
      try {
        const categoryId = categoryMap.get(item.category);
        const unitId = unitMap.get(item.uom);

        if (!categoryId || !unitId) {
          errors.push(`Product ${item.productName}: Missing category or unit mapping`);
          continue;
        }

        // Create the product with realistic default values
        const productId = await ctx.db.insert("products", {
          name: item.productName,
          sku: item.itemNo,
          description: `${item.productName} from B&B Master List`,
          quantity: Math.floor(Math.random() * 100) + 10, // Random quantity 10-110
          price: Math.floor(Math.random() * 100) + 10, // Random price $10-$110
          categoryId: categoryId,
          unitOfMeasureId: unitId,
        });

        // Create vendor-product relationship
        if (vendorMap.has(item.vendorId)) {
          await ctx.db.insert("vendorProducts", {
            vendorId: vendorMap.get(item.vendorId),
            productId: productId,
            vendorPrice: Math.floor(Math.random() * 90) + 5, // Random vendor price $5-$95
            vendorSku: item.itemNo
          });
        }

        successCount++;
      } catch (error) {
        errors.push(`Product ${item.productName}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return {
      success: true,
      message: `B&B Master List setup completed!`,
      summary: {
        productsCreated: successCount,
        productsFailed: errors.length,
        categoriesCreated: categories.size,
        unitsCreated: units.size,
        vendorsCreated: vendors.size
      },
      errors: errors.length > 0 ? errors : undefined,
      note: "Products created without inventory transactions. Transactions can be added later when users are authenticated."
    };
  }
});
