import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Define a reusable type for user roles to ensure consistency.
const userRoles = v.union(
  v.literal("admin"),
  v.literal("supervisor"),
  v.literal("worker")
);

export default defineSchema({
  // Authentication tables (required by Convex Auth)
  ...authTables,

  // =================================================================
  // Core User and Authentication Tables
  // =================================================================

  /**
   * @table users
   * @description Stores application-specific user data, linking to the
   * authentication identity. This table holds profiles and role-based
   * access control information.
   */
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    title: v.optional(v.string()), // E.g., "Site Manager", "Foreman"
    role: userRoles,
    // This connects the user to the authentication provider.
    authId: v.string(),
  }).index("by_auth_id", ["authId"]), // Essential for mapping auth user to app user.

  // =================================================================
  // Inventory Management Tables
  // =================================================================

  /**
   * @table products
   * @description Central repository for all inventory items.
   */
  products: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    sku: v.optional(v.string()), // Stock Keeping Unit
    partNumber: v.optional(v.string()), // Manufacturer Part Number
    quantity: v.number(), // Current quantity on hand.
    // This price represents the Moving Average Unit Cost (MAUC).
    price: v.number(),
    location: v.optional(v.string()), // E.g., "Warehouse A, Shelf 3"
    categoryId: v.id("categories"),
    unitOfMeasureId: v.id("unitsOfMeasure"),
    imageId: v.optional(v.id("files")),
  })
    .index("by_category", ["categoryId"])
    // Search index for fast text-based searching on product names and SKUs.
    .searchIndex("search_name_sku", {
      searchField: "name",
      filterFields: ["categoryId"],
    }),

  /**
   * @table categories
   * @description Organizes products into logical groups.
   */
  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
  }).index("by_name", ["name"]),

  /**
   * @table unitsOfMeasure
   * @description Defines the measurement units for products (e.g., kg, m, piece).
   */
  unitsOfMeasure: defineTable({
    name: v.string(), // E.g., "Kilogram", "Piece", "Meter"
    abbreviation: v.string(), // E.g., "kg", "pcs", "m"
  }).index("by_name", ["name"]),

  /**
   * @table inventoryTransactions
   * @description Logs every single movement of inventory for auditing and
   * accurate cost tracking.
   */
  inventoryTransactions: defineTable({
    productId: v.id("products"),
    // If inventory is pulled for a project, this links the transaction.
    projectId: v.optional(v.id("projects")),
    // If inventory is part of a PO receipt, this links the transaction.
    purchaseOrderId: v.optional(v.id("purchaseOrders")),
    userId: v.id("users"), // User who performed the action.
    type: v.union(
      v.literal("pull"), // Pulled from inventory for a project.
      v.literal("return"), // Returned to inventory from a project.
      v.literal("receive"), // Received from a vendor via PO.
      v.literal("adjustment") // Manual stock adjustment.
    ),
    quantityChange: v.number(), // Can be negative (pull) or positive (receive).
    // The MAUC of the product *before* this transaction occurred.
    // Critical for historical cost analysis.
    unitCostAtTransaction: v.number(),
    notes: v.optional(v.string()),
    date: v.number(), // Transaction timestamp
  })
    .index("by_product", ["productId"])
    .index("by_project", ["projectId"])
    .index("by_date", ["date"])
    .index("by_user", ["userId"])
    .index("by_type", ["type"]),

  // =================================================================
  // Project Management Tables
  // =================================================================

  /**
   * @table projects
   * @description Manages construction projects that consume inventory.
   */
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    status: v.union(
      v.literal("Planning"),
      v.literal("In Progress"),
      v.literal("On Hold"),
      v.literal("Completed"),
      v.literal("Cancelled")
    ),
    startDate: v.optional(v.number()), // Stored as Unix timestamp.
    endDate: v.optional(v.number()), // Stored as Unix timestamp.
    managerId: v.optional(v.id("users")), // Link to the project manager.
  })
    .index("by_status", ["status"])
    .index("by_manager", ["managerId"]),

  // =================================================================
  // Vendor and Procurement Tables
  // =================================================================

  /**
   * @table vendors
   * @description Stores information about suppliers and vendors.
   */
  vendors: defineTable({
    name: v.string(),
    contactPerson: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    website: v.optional(v.string()),
  }).index("by_name", ["name"]),

  /**
   * @table purchaseOrders
   * @description Manages purchase orders for acquiring new inventory from vendors.
   */
  purchaseOrders: defineTable({
    vendorId: v.id("vendors"),
    createdById: v.id("users"),
    approvedById: v.optional(v.id("users")),
    orderDate: v.number(),
    expectedDeliveryDate: v.optional(v.number()),
    status: v.union(
      v.literal("Draft"),
      v.literal("Submitted"),
      v.literal("Approved"),
      v.literal("Received"),
      v.literal("Cancelled")
    ),
    // Embedding line items directly is efficient for document-based DBs like Convex.
    lineItems: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        unitPrice: v.number(), // The price quoted by the vendor for this PO.
      })
    ),
    totalCost: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_vendor", ["vendorId"])
    .index("by_status", ["status"])
    .index("by_created_by", ["createdById"]),

  /**
   * @table vendorProducts
   * @description A join table linking vendors to the specific products they supply,
   * including their pricing and part numbers.
   */
  vendorProducts: defineTable({
    vendorId: v.id("vendors"),
    productId: v.id("products"),
    vendorPrice: v.number(), // The standard price from this vendor.
    vendorSku: v.optional(v.string()), // The vendor's specific SKU for the product.
  })
    // This composite index is crucial for efficiently querying:
    // 1. All products supplied by a vendor.
    // 2. All vendors who supply a specific product.
    .index("by_vendor_product", ["vendorId", "productId"]),

  // =================================================================
  // System and Utility Tables
  // =================================================================

  /**
   * @table files
   * @description Stores metadata for uploaded files, like product images,
   * linked to Convex's file storage.
   */
  files: defineTable({
    storageId: v.id("_storage"), // Connects to Convex's blob storage.
    name: v.string(), // Original file name.
    type: v.string(), // MIME type, e.g., "image/png".
    uploadedById: v.id("users"),
  }),

  /**
   * @table actionLogs
   * @description A general-purpose table for logging user actions for
   * auditing and debugging purposes. Renamed from 'logs' for clarity.
   */
  actionLogs: defineTable({
    userId: v.id("users"),
    action: v.string(), // E.g., "create_product", "pull_inventory", "approve_po"
    // `v.any()` allows for flexible, action-specific metadata to be stored.
    details: v.optional(v.any()),
    timestamp: v.number(), // When the action occurred
  }).index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),
});
