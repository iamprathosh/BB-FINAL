import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Migration utility to move data from appUsers to users table
 */
export const migrateAppUsersToUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting migration from appUsers to users...");
    
    try {
      // Get all appUsers (if table exists)
      let appUsers: any[] = [];
      try {
        appUsers = await ctx.db.query("appUsers" as any).collect();
      } catch (e) {
        console.log("appUsers table not found, skipping migration");
        return { success: true, migrated: 0 };
      }

      let migrated = 0;
      for (const appUser of appUsers) {
        // Check if user already exists in users table
        const existingUser = await ctx.db
          .query("appUsers")
          .withIndex("by_token", (q) => q.eq("tokenIdentifier", appUser.authId))
          .unique();

        if (!existingUser) {
          // Create new user record
          await ctx.db.insert("appUsers", {
            name: appUser.name,
            email: appUser.email,
            imageUrl: appUser.imageUrl,
            role: appUser.role === "admin" ? "admin" : 
                  appUser.role === "supervisor" ? "supervisor" : "worker",
            tokenIdentifier: appUser.authId,
          });
          migrated++;
        }
      }

      console.log(`Migration completed: ${migrated} users migrated`);
      return { success: true, migrated };
    } catch (error) {
      console.error("Migration failed:", error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
});

/**
 * Migration utility to update product references to use new schema
 */
export const migrateProductReferences = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting product references migration...");
    
    try {
      // Get all products
      const products = await ctx.db.query("products").collect();
      
      // Create default category if none exists
      let defaultCategory = await ctx.db.query("categories").first();
      let defaultCategoryId;
      if (!defaultCategory) {
        defaultCategoryId = await ctx.db.insert("categories", {
          name: "General",
          description: "Default category for migrated products",
        });
      } else {
        defaultCategoryId = defaultCategory._id;
      }

      // Create default unit of measure if none exists
      let defaultUnit = await ctx.db.query("unitsOfMeasure").first();
      let defaultUnitId;
      if (!defaultUnit) {
        defaultUnitId = await ctx.db.insert("unitsOfMeasure", {
          name: "Piece",
          abbreviation: "pcs",
        });
      } else {
        defaultUnitId = defaultUnit._id;
      }

      let updated = 0;
      for (const product of products) {
        // Check if product has old structure
        if (!(product as any).categoryId) {
          await ctx.db.patch(product._id, {
            categoryId: defaultCategoryId,
            unitOfMeasureId: defaultUnitId,
          });
          updated++;
        }
      }

      console.log(`Product references migration completed: ${updated} products updated`);
      return { success: true, updated };
    } catch (error) {
      console.error("Product migration failed:", error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
});

/**
 * Migration utility to update transaction references
 */
export const migrateTransactionReferences = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting transaction references migration...");
    
    try {
      const transactions = await ctx.db.query("inventoryTransactions").collect();
      
      let updated = 0;
      for (const transaction of transactions) {
        const updates: any = {};
        
        // Map old fields to new fields
        if ((transaction as any).quantity && !(transaction as any).quantityChange) {
          updates.quantityChange = Math.abs((transaction as any).quantity);
        }
        
        if ((transaction as any).unitPrice && !(transaction as any).unitCostAtTransaction) {
          updates.unitCostAtTransaction = (transaction as any).unitPrice;
        }
        
        if (!transaction.date && (transaction as any)._creationTime) {
          updates.date = (transaction as any)._creationTime;
        }

        // Update transaction type to match new enum
        if ((transaction as any).type === "sale") {
          updates.type = "pull";
        } else if ((transaction as any).type === "purchase") {
          updates.type = "receive";
        }
        
        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(transaction._id, updates);
          updated++;
        }
      }

      console.log(`Transaction references migration completed: ${updated} transactions updated`);
      return { success: true, updated };
    } catch (error) {
      console.error("Transaction migration failed:", error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
});

/**
 * Check migration status
 */
export const getMigrationStatus = internalQuery({
  args: {},
  handler: async (ctx) => {
    try {
      const usersCount = await ctx.db.query("appUsers").collect().then(users => users.length);
      const categoriesCount = await ctx.db.query("categories").collect().then(cats => cats.length);
      const unitsCount = await ctx.db.query("unitsOfMeasure").collect().then(units => units.length);
      const productsCount = await ctx.db.query("products").collect().then(products => products.length);
      
      // Check for old appUsers table
      let appUsersCount = 0;
      try {
        appUsersCount = await ctx.db.query("appUsers" as any).collect().then(users => users.length);
      } catch {
        appUsersCount = 0;
      }
      
      return {
        users: usersCount,
        appUsers: appUsersCount,
        categories: categoriesCount,
        unitsOfMeasure: unitsCount,
        products: productsCount,
        migrationNeeded: appUsersCount > 0 || categoriesCount === 0 || unitsCount === 0,
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  },
});
