import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Table } from "./schema";

// Create a new table in Convex
export const createTable = mutation({
  args: {
    firebaseId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    fields: v.array(v.object({
      id: v.string(),
      name: v.string(),
      type: v.string(),
      description: v.optional(v.string()),
      required: v.optional(v.boolean()),
      preventDuplicates: v.optional(v.boolean()),
      options: v.optional(v.array(v.string())),
      default: v.optional(v.any())
    })),
    creator_id: v.string(),
    visibility: v.optional(v.string()),
    allowed_users: v.optional(v.array(v.string())),
    created_at: v.number(),
    updated_at: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tables", {
      ...args,
      firebase_synced: true,
      last_sync: Date.now()
    });
  }
});

// Update an existing table in Convex
export const updateTable = mutation({
  args: {
    firebaseId: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      type: v.optional(v.string()),
      fields: v.optional(v.array(v.object({
        id: v.string(),
        name: v.string(),
        type: v.string(),
        description: v.optional(v.string()),
        required: v.optional(v.boolean()),
        preventDuplicates: v.optional(v.boolean()),
        options: v.optional(v.array(v.string())),
        default: v.optional(v.any())
      }))),
      visibility: v.optional(v.string()),
      allowed_users: v.optional(v.array(v.string())),
      updated_at: v.number()
    })
  },
  handler: async (ctx, args) => {
    const table = await ctx.db
      .query("tables")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
      .unique();
    
    if (!table) {
      throw new Error(`Table with firebaseId ${args.firebaseId} not found`);
    }

    return await ctx.db.patch(table._id, {
      ...args.updates,
      firebase_synced: true,
      last_sync: Date.now()
    });
  }
});

// Delete a table from Convex
export const deleteTable = mutation({
  args: {
    firebaseId: v.string()
  },
  handler: async (ctx, args) => {
    const table = await ctx.db
      .query("tables")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
      .unique();
    
    if (!table) {
      throw new Error(`Table with firebaseId ${args.firebaseId} not found`);
    }

    return await ctx.db.delete(table._id);
  }
});

// Get table by Firebase ID
export const getTableByFirebaseId = query({
  args: {
    firebaseId: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tables")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
      .unique();
  }
});

// Get tables by creator
export const getTablesByCreator = query({
  args: {
    creator_id: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tables")
      .withIndex("by_creator", (q) => q.eq("creator_id", args.creator_id))
      .collect();
  }
});

// Get public tables
export const getPublicTables = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("tables")
      .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
      .collect();
  }
});

// Get tables by visibility
export const getTablesByVisibility = query({
  args: {
    visibility: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tables")
      .withIndex("by_visibility", (q) => q.eq("visibility", args.visibility))
      .collect();
  }
});

// Search tables by name
export const searchTables = query({
  args: {
    query: v.string(),
    creator_id: v.optional(v.string()),
    visibility: v.optional(v.string()),
    type: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("tables")
      .withSearchIndex("search_tables", (q) => {
        let search = q.search("name", args.query);
        if (args.creator_id) {
          search = search.eq("creator_id", args.creator_id);
        }
        if (args.visibility) {
          search = search.eq("visibility", args.visibility);
        }
        if (args.type) {
          search = search.eq("type", args.type);
        }
        return search;
      })
      .collect();

    return results;
  }
});

// Search tables by description
export const searchTablesByDescription = query({
  args: {
    query: v.string(),
    creator_id: v.optional(v.string()),
    visibility: v.optional(v.string()),
    type: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("tables")
      .withSearchIndex("search_table_description", (q) => {
        let search = q.search("description", args.query);
        if (args.creator_id) {
          search = search.eq("creator_id", args.creator_id);
        }
        if (args.visibility) {
          search = search.eq("visibility", args.visibility);
        }
        if (args.type) {
          search = search.eq("type", args.type);
        }
        return search;
      })
      .collect();

    return results;
  }
});

// Combined text search across name and description
export const searchTablesFullText = query({
  args: {
    query: v.string(),
    creator_id: v.optional(v.string()),
    visibility: v.optional(v.string()),
    type: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Search by name
    const nameResults = await ctx.db
      .query("tables")
      .withSearchIndex("search_tables", (q) => {
        let search = q.search("name", args.query);
        if (args.creator_id) {
          search = search.eq("creator_id", args.creator_id);
        }
        if (args.visibility) {
          search = search.eq("visibility", args.visibility);
        }
        if (args.type) {
          search = search.eq("type", args.type);
        }
        return search;
      })
      .collect();

    // Search by description
    const descResults = await ctx.db
      .query("tables")
      .withSearchIndex("search_table_description", (q) => {
        let search = q.search("description", args.query);
        if (args.creator_id) {
          search = search.eq("creator_id", args.creator_id);
        }
        if (args.visibility) {
          search = search.eq("visibility", args.visibility);
        }
        if (args.type) {
          search = search.eq("type", args.type);
        }
        return search;
      })
      .collect();

    // Combine and deduplicate results
    const seen = new Set<string>();
    const combined: Table[] = [];

    for (const table of [...nameResults, ...descResults]) {
      if (!seen.has(table._id)) {
        seen.add(table._id);
        combined.push(table);
      }
    }

    return combined;
  }
});

// Get tables that a user has access to (creator or in allowed_users)
export const getAccessibleTables = query({
  args: {
    user_id: v.string()
  },
  handler: async (ctx, args) => {
    // Get tables where user is creator
    const createdTables = await ctx.db
      .query("tables")
      .withIndex("by_creator", (q) => q.eq("creator_id", args.user_id))
      .collect();

    // Get public tables
    const publicTables = await ctx.db
      .query("tables")
      .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
      .collect();

    // Get all tables and filter for those where user is in allowed_users
    const allTables = await ctx.db.query("tables").collect();
    const allowedTables = allTables.filter(table => 
      table.allowed_users && table.allowed_users.includes(args.user_id)
    );

    // Combine and deduplicate
    const seen = new Set<string>();
    const accessible: Table[] = [];

    for (const table of [...createdTables, ...publicTables, ...allowedTables]) {
      if (!seen.has(table._id)) {
        seen.add(table._id);
        accessible.push(table);
      }
    }

    return accessible;
  }
}); 