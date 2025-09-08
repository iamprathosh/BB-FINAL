# Schema Migration Completion Guide

## Current Status ✅

1. ✅ **New Enhanced Schema Deployed** - The new integrated schema is live
2. ✅ **Migration Scripts Created** - Ready to migrate data
3. ✅ **Core Files Partially Updated** - users.ts, logs.ts, products.ts (partial)
4. ⏳ **TypeScript Errors Identified** - Clear list of what needs fixing

## Remaining Tasks

### Step 1: Complete Function Updates (Critical)

**Pattern to Follow:** Replace in ALL convex/*.ts files:

```typescript
// OLD ❌
.query("appUsers")
.withIndex("by_auth_id", (q) => q.eq("authId", userId))

// NEW ✅  
.query("users")
.withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
```

**Files Needing Updates:**
- `admin.ts` - 6 locations
- `analytics.ts` - Multiple field references
- `categories.ts` - 3 locations  
- `clearData.ts` - 1 location
- `emails.ts` - 1 location
- `importMasterList.ts` - 1 location
- `mauc.ts` - 1 location
- `projects.ts` - 3 locations
- `sampleData.ts` - 2 locations
- `setupAdmin.ts` - 2 locations
- `units.ts` - 4 locations
- `vendors.ts` - (likely needs updating)

### Step 2: Fix Field References

**Transaction Fields:**
```typescript
// OLD ❌
quantity: transaction.quantity
unitPrice: transaction.unitPrice

// NEW ✅
quantityChange: transaction.quantityChange  
unitCostAtTransaction: transaction.unitCostAtTransaction
```

**Product Fields:**
```typescript
// OLD ❌
category: product.category
unitOfMeasure: product.unitOfMeasure
costPrice: product.costPrice
movingAverageCost: product.movingAverageCost

// NEW ✅
categoryId: product.categoryId
unitOfMeasureId: product.unitOfMeasureId
price: product.price (MAUC is now stored in price)
```

**Project Status Values:**
```typescript
// OLD ❌
status: "active"

// NEW ✅
status: "In Progress"
```

**Purchase Order Status:**
```typescript
// OLD ❌
status: "pending"

// NEW ✅  
status: "Draft"
```

### Step 3: Run Data Migration

After fixing the TypeScript errors, run the migration:

```bash
npx convex dev --once
```

Then execute the migration function via the Convex dashboard or with a script.

### Step 4: Update Sample Data Files

Files like `bbSampleData.ts`, `createBBData.ts`, `quickSetup.ts` need:

1. **Product Creation** - Use new schema fields:
```typescript
{
  name: "Product Name",
  sku: "SKU123", 
  quantity: 100,
  price: 25.00,
  categoryId: categoryId,        // ✅ New
  unitOfMeasureId: unitId,       // ✅ New
  description: "Description"
}
```

2. **Transaction Creation:**
```typescript
{
  productId,
  userId, 
  type: "receive",               // ✅ Use enum values
  quantityChange: 10,            // ✅ New field name
  unitCostAtTransaction: 25.00,  // ✅ New field name
  date: Date.now()
}
```

## Quick Fix Script

Here's a PowerShell script to help with the bulk replacements:

```powershell
# Navigate to convex directory
cd "C:\Users\gurup\Desktop\BB new\BB-Inventory-APP\convex"

# Replace appUsers with users (be careful with files like setupAdmin.ts)
Get-ChildItem *.ts | ForEach-Object {
    (Get-Content $_.FullName) -replace '"appUsers"', '"users"' | Set-Content $_.FullName
    (Get-Content $_.FullName) -replace '"by_auth_id"', '"by_token"' | Set-Content $_.FullName  
    (Get-Content $_.FullName) -replace '"authId"', '"tokenIdentifier"' | Set-Content $_.FullName
    (Get-Content $_.FullName) -replace '"logs"', '"actionLogs"' | Set-Content $_.FullName
}

Write-Host "Basic replacements complete. Manual fixes still needed for complex cases."
```

## Manual Fixes Required

### 1. Analytics.ts
- Replace `sale` transaction types with `pull`
- Replace `quantity` with `quantityChange` 
- Replace `unitPrice` with `unitCostAtTransaction`
- Replace `product.category` with category lookup via `categoryId`
- Replace `pending` status with `Draft`

### 2. Products.ts  
- Update remaining `appUsers` references in delete/update functions
- Fix MAUC field references in receiveInventory

### 3. Projects.ts
- Replace `active` project status with `In Progress`
- Fix transaction field references in cost calculations

### 4. Sample Data Files
- Update product creation to use `categoryId`/`unitOfMeasureId`
- Fix transaction creation field names
- Update purchase order structure

## Testing the Migration

1. **Fix TypeScript errors:**
```bash
npx convex dev --once
```

2. **Run migration functions:**
```bash
# Via Convex dashboard or CLI
```

3. **Test core functionality:**
- User authentication
- Product creation
- Inventory transactions
- Project management

## Expected Outcome

After completion:
- ✅ Zero TypeScript errors
- ✅ All data migrated to new schema
- ✅ Enhanced relational structure active
- ✅ MAUC cost tracking functional
- ✅ Improved performance via strategic indexes

## Need Help?

The enhanced schema provides:
- **Better Performance** - Strategic indexes
- **Data Integrity** - Proper relational design  
- **Cost Tracking** - MAUC integration
- **Audit Trail** - Complete transaction history
- **Scalability** - Clean separation of concerns

Each table now serves a specific purpose and integrates cleanly with others, creating a cohesive inventory management system rather than separate modules.
