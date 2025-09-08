# CSV Import System - BB Inventory App

## Overview

The BB Inventory App includes a comprehensive CSV import system that allows you to bulk import data for various entity types. This system provides validation, error handling, and flexible import options.

## Supported Import Types

1. **Products** - Inventory items with categories and units
2. **Categories** - Product categorization
3. **Vendors** - Supplier information
4. **Units of Measure** - Measurement units for products
5. **Projects** - Construction projects
6. **Users** - System users (admin/supervisor/worker)

## How to Use

### 1. Basic Import Process

```javascript
// Import from CSV
await convex.mutation(api.csvImport.importFromCSV, {
  csvData: "name,description\nCement,Building cement\nSteel,Steel rebar",
  importType: "categories",
  options: {
    skipDuplicates: true,
    createDependencies: true
  }
});
```

### 2. Available Options

- **skipDuplicates**: Skip rows that already exist in the database
- **updateExisting**: Update existing records (future enhancement)
- **validateOnly**: Only validate data, don't actually import
- **createDependencies**: Auto-create missing categories/units for products

### 3. Validation Before Import

```javascript
// Validate CSV before importing
const validation = await convex.query(api.csvUtils.validateCSV, {
  csvData: csvString,
  importType: "products"
});

if (!validation.valid) {
  console.log("Errors:", validation.errors);
  console.log("Warnings:", validation.warnings);
}
```

## CSV Format Requirements

### Products CSV Format

**Required Columns:**
- `name` - Product name
- `quantity` - Current stock quantity (number)
- `price` - Unit price (number)
- `categoryName` - Category name (must exist or use createDependencies)
- `unitName` - Unit of measure name (must exist or use createDependencies)

**Optional Columns:**
- `description` - Product description
- `sku` - Stock keeping unit
- `partNumber` - Manufacturer part number
- `location` - Storage location

**Example:**
```csv
name,description,sku,partNumber,quantity,price,categoryName,unitName,location
Portland Cement,High quality cement,CEM-001,PC-42.5,50,12.50,Cement & Concrete,bag,Warehouse A
Ready Mix Concrete,Pre-mixed concrete,CEM-002,RMC-3000,25,120.00,Cement & Concrete,m³,Warehouse B
```

### Categories CSV Format

**Required Columns:**
- `name` - Category name

**Optional Columns:**
- `description` - Category description

**Example:**
```csv
name,description
Cement & Concrete,Cement and concrete products
Steel & Rebar,Steel reinforcement materials
```

### Vendors CSV Format

**Required Columns:**
- `name` - Vendor name

**Optional Columns:**
- `email` - Contact email
- `phone` - Phone number
- `address` - Physical address
- `contactPerson` - Primary contact person
- `website` - Company website

**Example:**
```csv
name,email,phone,address,contactPerson,website
ABC Supply,orders@abc.com,(555) 123-4567,123 Industrial Blvd,John Smith,www.abc.com
```

### Units of Measure CSV Format

**Required Columns:**
- `name` - Unit name (e.g., "Kilogram")
- `abbreviation` - Unit abbreviation (e.g., "kg")

**Example:**
```csv
name,abbreviation
Kilogram,kg
Piece,pcs
Meter,m
```

### Projects CSV Format

**Required Columns:**
- `name` - Project name
- `status` - Project status (Planning/In Progress/On Hold/Completed/Cancelled)

**Optional Columns:**
- `description` - Project description
- `address` - Project address
- `startDate` - Start date (YYYY-MM-DD format)
- `endDate` - End date (YYYY-MM-DD format)
- `managerEmail` - Project manager email (must exist in users table)

**Example:**
```csv
name,description,address,status,startDate,endDate,managerEmail
New Building Construction,Office building project,123 Business Ave,Planning,2024-01-01,2024-12-31,manager@company.com
```

### Users CSV Format

**Required Columns:**
- `name` - User name
- `email` - User email address
- `role` - User role (admin/supervisor/worker)
- `tokenIdentifier` - Authentication token identifier

**Optional Columns:**
- `title` - Job title
- `imageUrl` - Profile image URL

**Example:**
```csv
name,email,role,title,tokenIdentifier
John Manager,john@company.com,admin,Site Manager,auth0|user123
```

## Advanced Features

### 1. Get CSV Templates

```javascript
// Get a template for specific import type
const template = await convex.mutation(api.csvImport.getCSVTemplate, {
  importType: "products"
});

console.log(template.template); // CSV template content
console.log(template.filename); // Suggested filename
```

### 2. Import Statistics

```javascript
// Get current data statistics
const stats = await convex.query(api.csvUtils.getImportStats, {
  importType: "products"
});

console.log(`Total products: ${stats.totalCount}`);
console.log(`Recent imports: ${stats.recentCount}`);
```

### 3. Clear Data Before Re-import

```javascript
// Clear existing data (use with caution!)
const result = await convex.mutation(api.csvUtils.clearImportData, {
  importType: "products",
  confirmDelete: true
});
```

### 4. Batch Processing

```javascript
// Process large CSV files in batches
const batches = await convex.mutation(api.csvUtils.processCSVInBatches, {
  csvData: largeCsvString,
  importType: "products",
  batchSize: 100
});

// Then import each batch separately
for (const batch of batches.batches) {
  await convex.mutation(api.csvImport.importFromCSV, {
    csvData: batch.csvData,
    importType: "products",
    options: { skipDuplicates: true }
  });
}
```

## Error Handling

The system provides detailed error reporting:

```javascript
const result = await convex.mutation(api.csvImport.importFromCSV, {
  csvData: csvString,
  importType: "products"
});

console.log(`Success: ${result.success}`);
console.log(`Imported: ${result.imported}`);
console.log(`Failed: ${result.failed}`);
console.log(`Skipped: ${result.skipped}`);
console.log(`Errors: ${result.errors}`);
```

## Best Practices

1. **Always validate first**: Use `validateCSV` before importing large datasets
2. **Use small batches**: For large files, use batch processing
3. **Handle dependencies**: Import categories and units before products
4. **Backup data**: Consider exporting existing data before bulk imports
5. **Test with small samples**: Test your CSV format with a few rows first
6. **Check for duplicates**: Use `skipDuplicates` option to avoid conflicts

## Common Issues and Solutions

### Issue: "Category not found" error
**Solution**: Either create categories first, or use `createDependencies: true` option

### Issue: "Invalid numeric values" error
**Solution**: Ensure quantity and price fields contain valid numbers (no letters or special characters except decimal points)

### Issue: "Missing required columns" error
**Solution**: Check that your CSV has all required column headers for the import type

### Issue: Large file import fails
**Solution**: Use batch processing for files with more than 1000 rows

## Sample Files

Sample CSV files are available in the `/public/templates/` directory:
- `products_template.csv`
- `categories_template.csv` 
- `vendors_template.csv`

These files show the exact format expected by the import system.
