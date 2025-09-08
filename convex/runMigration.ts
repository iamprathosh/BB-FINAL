import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Run complete schema migration
 * This should be called after the new schema is deployed
 */
export const runCompleteSchemaChange = internalMutation({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; results?: any; error?: string }> => {
    console.log("Starting complete schema migration...");
    
    try {
      // Step 1: Migrate users
      const userMigration: any = await ctx.runMutation(internal.migrate.migrateAppUsersToUsers);
      console.log("User migration result:", userMigration);

      // Step 2: Migrate product references
      const productMigration: any = await ctx.runMutation(internal.migrate.migrateProductReferences);
      console.log("Product migration result:", productMigration);

      // Step 3: Migrate transaction references  
      const transactionMigration: any = await ctx.runMutation(internal.migrate.migrateTransactionReferences);
      console.log("Transaction migration result:", transactionMigration);

      return {
        success: true,
        results: {
          users: userMigration,
          products: productMigration,
          transactions: transactionMigration,
        }
      };
    } catch (error) {
      console.error("Migration failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },
});
