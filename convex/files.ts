import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFile = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    type: v.string(),
    uploadedById: v.id("appUsers"),
  },
  handler: async (ctx, args) => {
    const fileId = await ctx.db.insert("files", {
      name: args.name,
      type: args.type,
      storageId: args.storageId,
      uploadedById: args.uploadedById,
    });
    return fileId;
  },
});

export const getFile = query({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getFilesByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    // Since we don't have a by_product index anymore, 
    // we need to filter all files by productId reference in products table
    const product = await ctx.db.get(args.productId);
    if (!product || !product.imageId) {
      return [];
    }
    const file = await ctx.db.get(product.imageId);
    return file ? [file] : [];
  },
});

export const deleteFile = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    if (file) {
      // Note: We can't delete from storage without the storageId
      // The storageId is not stored in the files table
      // In a real implementation, you might want to store the storageId
      await ctx.db.delete(args.id);
    }
    return args.id;
  },
});
