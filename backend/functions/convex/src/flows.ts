import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Flow } from "./schema";

// Create a new flow in Convex
export const createFlow = mutation({
  args: {
    firebaseId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    steps: v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      type: v.string(),
      time: v.optional(v.string()),
      duration: v.optional(v.number()),
      isActive: v.boolean()
    })),
    status: v.union(
      v.literal(0),
      v.literal(1),
      v.literal("archived")
    ),
    creator_id: v.string(),
    user: v.object({
      id: v.string(),
      name: v.optional(v.string())
    }),
    created_at: v.number(),
    updated_at: v.number(),
    public: v.optional(v.boolean()),
    cloned_from: v.optional(v.object({
      id: v.string(),
      name: v.string(),
      creator_id: v.string()
    }))
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("flows", {
      ...args,
      firebase_synced: true,
      last_sync: Date.now()
    });
  }
});

// Update an existing flow in Convex
export const updateFlow = mutation({
  args: {
    firebaseId: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      type: v.optional(v.string()),
      steps: v.optional(v.array(v.object({
        id: v.string(),
        name: v.string(),
        description: v.string(),
        type: v.string(),
        time: v.optional(v.string()),
        duration: v.optional(v.number()),
        isActive: v.boolean()
      }))),
      status: v.optional(v.union(
        v.literal(0),
        v.literal(1),
        v.literal("archived")
      )),
      updated_at: v.number(),
      public: v.optional(v.boolean())
    })
  },
  handler: async (ctx, args) => {
    const flow = await ctx.db
      .query("flows")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
      .unique();
    
    if (!flow) {
      throw new Error(`Flow with firebaseId ${args.firebaseId} not found`);
    }

    return await ctx.db.patch(flow._id, {
      ...args.updates,
      firebase_synced: true,
      last_sync: Date.now()
    });
  }
});

// Delete a flow from Convex
export const deleteFlow = mutation({
  args: {
    firebaseId: v.string()
  },
  handler: async (ctx, args) => {
    const flow = await ctx.db
      .query("flows")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
      .unique();
    
    if (!flow) {
      throw new Error(`Flow with firebaseId ${args.firebaseId} not found`);
    }

    return await ctx.db.delete(flow._id);
  }
});

// Get flow by Firebase ID
export const getFlowByFirebaseId = query({
  args: {
    firebaseId: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flows")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
      .unique();
  }
});

// Get flows by creator
export const getFlowsByCreator = query({
  args: {
    creator_id: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flows")
      .withIndex("by_creator", (q) => q.eq("creator_id", args.creator_id))
      .collect();
  }
});

// Get public flows
export const getPublicFlows = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("flows")
      .withIndex("by_public", (q) => q.eq("public", true))
      .collect();
  }
});

// Get flows by status
export const getFlowsByStatus = query({
  args: {
    status: v.union(
      v.literal(0),
      v.literal(1),
      v.literal("archived")
    )
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flows")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  }
});

// Get active flows by creator
export const getActiveFlowsByCreator = query({
  args: {
    creator_id: v.string()
  },
  handler: async (ctx, args) => {
    const allFlows = await ctx.db
      .query("flows")
      .withIndex("by_creator", (q) => q.eq("creator_id", args.creator_id))
      .collect();
    
    return allFlows.filter(flow => flow.status === 1);
  }
});

// Get draft flows by creator
export const getDraftFlowsByCreator = query({
  args: {
    creator_id: v.string()
  },
  handler: async (ctx, args) => {
    const allFlows = await ctx.db
      .query("flows")
      .withIndex("by_creator", (q) => q.eq("creator_id", args.creator_id))
      .collect();
    
    return allFlows.filter(flow => flow.status === 0);
  }
});

// Search flows by name
export const searchFlows = query({
  args: {
    query: v.string(),
    creator_id: v.optional(v.string()),
    public_only: v.optional(v.boolean()),
    status: v.optional(v.union(
      v.literal(0),
      v.literal(1),
      v.literal("archived")
    )),
    type: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("flows")
      .withSearchIndex("search_flows", (q) => {
        let search = q.search("name", args.query);
        if (args.creator_id) {
          search = search.eq("creator_id", args.creator_id);
        }
        if (args.public_only !== undefined) {
          search = search.eq("public", args.public_only);
        }
        if (args.status !== undefined) {
          search = search.eq("status", args.status);
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

// Search flows by description
export const searchFlowsByDescription = query({
  args: {
    query: v.string(),
    creator_id: v.optional(v.string()),
    public_only: v.optional(v.boolean()),
    status: v.optional(v.union(
      v.literal(0),
      v.literal(1),
      v.literal("archived")
    )),
    type: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("flows")
      .withSearchIndex("search_flow_description", (q) => {
        let search = q.search("description", args.query);
        if (args.creator_id) {
          search = search.eq("creator_id", args.creator_id);
        }
        if (args.public_only !== undefined) {
          search = search.eq("public", args.public_only);
        }
        if (args.status !== undefined) {
          search = search.eq("status", args.status);
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
export const searchFlowsFullText = query({
  args: {
    query: v.string(),
    creator_id: v.optional(v.string()),
    public_only: v.optional(v.boolean()),
    status: v.optional(v.union(
      v.literal(0),
      v.literal(1),
      v.literal("archived")
    )),
    type: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Search by name
    const nameResults = await ctx.db
      .query("flows")
      .withSearchIndex("search_flows", (q) => {
        let search = q.search("name", args.query);
        if (args.creator_id) {
          search = search.eq("creator_id", args.creator_id);
        }
        if (args.public_only !== undefined) {
          search = search.eq("public", args.public_only);
        }
        if (args.status !== undefined) {
          search = search.eq("status", args.status);
        }
        if (args.type) {
          search = search.eq("type", args.type);
        }
        return search;
      })
      .collect();

    // Search by description
    const descResults = await ctx.db
      .query("flows")
      .withSearchIndex("search_flow_description", (q) => {
        let search = q.search("description", args.query);
        if (args.creator_id) {
          search = search.eq("creator_id", args.creator_id);
        }
        if (args.public_only !== undefined) {
          search = search.eq("public", args.public_only);
        }
        if (args.status !== undefined) {
          search = search.eq("status", args.status);
        }
        if (args.type) {
          search = search.eq("type", args.type);
        }
        return search;
      })
      .collect();

    // Combine and deduplicate results
    const seen = new Set<string>();
    const combined: Flow[] = [];

    for (const flow of [...nameResults, ...descResults]) {
      if (!seen.has(flow._id)) {
        seen.add(flow._id);
        combined.push(flow);
      }
    }

    return combined;
  }
});

// Get flows accessible to a user (public flows or flows created by the user)
export const getAccessibleFlows = query({
  args: {
    user_id: v.string()
  },
  handler: async (ctx, args) => {
    // Get flows created by the user
    const userFlows = await ctx.db
      .query("flows")
      .withIndex("by_creator", (q) => q.eq("creator_id", args.user_id))
      .collect();

    // Get public flows
    const publicFlows = await ctx.db
      .query("flows")
      .withIndex("by_public", (q) => q.eq("public", true))
      .collect();

    // Combine and deduplicate
    const seen = new Set<string>();
    const accessible: Flow[] = [];

    for (const flow of [...userFlows, ...publicFlows]) {
      if (!seen.has(flow._id)) {
        seen.add(flow._id);
        accessible.push(flow);
      }
    }

    return accessible;
  }
}); 