import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Agent } from "./schema";

// Create a new agent in Convex
export const createAgent = mutation({
  args: {
    firebaseId: v.string(),
    name: v.string(),
    description: v.string(),
    avatar: v.optional(v.string()),
    public: v.boolean(),
    status: v.union(
      v.literal("DRAFT"),
      v.literal("PENDING"),
      v.literal("APPROVED"),
      v.literal("REJECTED")
    ),
    creator_id: v.string(),
    user: v.object({
      id: v.string(),
      name: v.optional(v.string())
    }),
    spec: v.object({
      systemInfo: v.string(),
      tools: v.array(v.any()),
      toolsConfig: v.optional(v.any())
    }),
    created_at: v.number(),
    updated_at: v.number(),
    last_used: v.optional(v.number()),
    cloned_from: v.optional(v.object({
      id: v.string(),
      name: v.string(),
      creator_id: v.string()
    })),
    firebase_synced: v.boolean(),
    last_sync: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agents", {
      ...args,
      firebase_synced: true,
      last_sync: Date.now()
    });
  }
});

// Update an existing agent in Convex
export const updateAgent = mutation({
  args: {
    firebaseId: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      avatar: v.optional(v.string()),
      public: v.optional(v.boolean()),
      status: v.optional(v.union(
        v.literal("DRAFT"),
        v.literal("PENDING"),
        v.literal("APPROVED"),
        v.literal("REJECTED")
      )),
      spec: v.optional(v.object({
        systemInfo: v.string(),
        tools: v.array(v.any()),
        toolsConfig: v.optional(v.any())
      })),
      updated_at: v.number(),
      last_used: v.optional(v.number())
    })
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
      .unique();
    
    if (!agent) {
      throw new Error(`Agent with firebaseId ${args.firebaseId} not found`);
    }

    return await ctx.db.patch(agent._id, {
      ...args.updates,
      firebase_synced: true,
      last_sync: Date.now()
    });
  }
});

// Delete an agent from Convex
export const deleteAgent = mutation({
  args: {
    firebaseId: v.string()
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
      .unique();
    
    if (!agent) {
      throw new Error(`Agent with firebaseId ${args.firebaseId} not found`);
    }

    return await ctx.db.delete(agent._id);
  }
});

// Search agents by text
export const searchAgents = query({
  args: {
    query: v.string(),
    creator_id: v.optional(v.string()),
    public_only: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("agents")
      .withSearchIndex("search_agents", (q) =>
        q.search("name", args.query)
          .eq("creator_id", args.creator_id || "")
          .eq("public", args.public_only ?? true)
      )
      .collect();

    return results;
  }
});

// Search agents by description
export const searchAgentsByDescription = query({
  args: {
    query: v.string(),
    creator_id: v.optional(v.string()),
    public_only: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("agents")
      .withSearchIndex("search_description", (q) =>
        q.search("description", args.query)
          .eq("creator_id", args.creator_id || "")
          .eq("public", args.public_only ?? true)
      )
      .collect();

    return results;
  }
});

// Get agent by Firebase ID
export const getAgentByFirebaseId = query({
  args: {
    firebaseId: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
      .unique();
  }
});

// Get agents by creator
export const getAgentsByCreator = query({
  args: {
    creator_id: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_creator", (q) => q.eq("creator_id", args.creator_id))
      .collect();
  }
});

// Get public agents
export const getPublicAgents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_public", (q) => q.eq("public", true))
      .collect();
  }
});

// Combined text search across name and description
export const searchAgentsFullText = query({
  args: {
    query: v.string(),
    creator_id: v.optional(v.string()),
    public_only: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    // Search by name
    const nameResults = await ctx.db
      .query("agents")
      .withSearchIndex("search_agents", (q) => {
        let search = q.search("name", args.query);
        if (args.creator_id) {
          search = search.eq("creator_id", args.creator_id);
        }
        if (args.public_only !== undefined) {
          search = search.eq("public", args.public_only);
        }
        return search;
      })
      .collect();

    // Search by description
    const descResults = await ctx.db
      .query("agents")
      .withSearchIndex("search_description", (q) => {
        let search = q.search("description", args.query);
        if (args.creator_id) {
          search = search.eq("creator_id", args.creator_id);
        }
        if (args.public_only !== undefined) {
          search = search.eq("public", args.public_only);
        }
        return search;
      })
      .collect();

    // Combine and deduplicate results
    const seen = new Set<string>();
    const combined: Agent[] = [];

    for (const agent of [...nameResults, ...descResults]) {
      if (!seen.has(agent._id)) {
        seen.add(agent._id);
        combined.push(agent);
      }
    }

    return combined;
  }
}); 