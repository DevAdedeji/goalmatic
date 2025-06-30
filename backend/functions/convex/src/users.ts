import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { User } from "./schema";

// Create a new user in Convex
export const createUser = mutation({
  args: {
    firebaseId: v.string(),
    username: v.string(),
    name: v.string(),
    bio: v.optional(v.union(v.string(), v.null())),
    email: v.optional(v.union(v.string(), v.null())),
    phone: v.optional(v.union(v.string(), v.null())),
    photo_url: v.optional(v.union(v.string(), v.null())),
    referral_code: v.optional(v.union(v.string(), v.null())),
    referred_by: v.optional(v.union(v.string(), v.null())),
    created_at: v.number(),
    updated_at: v.number(),
    showLogs: v.optional(v.union(v.boolean(), v.null())),
    selected_agent_id: v.optional(v.union(v.string(), v.null())),
    timezone: v.optional(v.union(v.string(), v.null())),
    signup_method: v.optional(v.union(v.string(), v.null())),
    phone_verified: v.optional(v.union(v.boolean(), v.null()))
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      ...args,
      firebase_synced: true,
      last_sync: Date.now()
    });
  }
});

// Update an existing user in Convex
export const updateUser = mutation({
  args: {
    firebaseId: v.string(),
    updates: v.object({
      username: v.optional(v.string()),
      name: v.optional(v.string()),
      bio: v.optional(v.union(v.string(), v.null())),
      email: v.optional(v.union(v.string(), v.null())),
      phone: v.optional(v.union(v.string(), v.null())),
      photo_url: v.optional(v.union(v.string(), v.null())),
      referral_code: v.optional(v.union(v.string(), v.null())),
      referred_by: v.optional(v.union(v.string(), v.null())),
      updated_at: v.number(),
      showLogs: v.optional(v.union(v.boolean(), v.null())),
      selected_agent_id: v.optional(v.union(v.string(), v.null())),
      timezone: v.optional(v.union(v.string(), v.null())),
      signup_method: v.optional(v.union(v.string(), v.null())),
      phone_verified: v.optional(v.union(v.boolean(), v.null()))
    })
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
      .unique();
    
    if (!user) {
      throw new Error(`User with firebaseId ${args.firebaseId} not found`);
    }

    return await ctx.db.patch(user._id, {
      ...args.updates,
      firebase_synced: true,
      last_sync: Date.now()
    });
  }
});

// Delete a user from Convex
export const deleteUser = mutation({
  args: {
    firebaseId: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
      .unique();
    
    if (!user) {
      throw new Error(`User with firebaseId ${args.firebaseId} not found`);
    }

    return await ctx.db.delete(user._id);
  }
});

// Get user by Firebase ID
export const getUserByFirebaseId = query({
  args: {
    firebaseId: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
      .unique();
  }
});

// Get user by username
export const getUserByUsername = query({
  args: {
    username: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
  }
});

// Get user by email
export const getUserByEmail = query({
  args: {
    email: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  }
});

// Search users by username
export const searchUsers = query({
  args: {
    query: v.string(),
    signup_method: v.optional(v.string()),
    phone_verified: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("users")
      .withSearchIndex("search_users", (q) => {
        let search = q.search("username", args.query);
        if (args.signup_method) {
          search = search.eq("signup_method", args.signup_method);
        }
        if (args.phone_verified !== undefined) {
          search = search.eq("phone_verified", args.phone_verified);
        }
        return search;
      })
      .collect();

    return results;
  }
});

// Search users by name
export const searchUsersByName = query({
  args: {
    query: v.string(),
    signup_method: v.optional(v.string()),
    phone_verified: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("users")
      .withSearchIndex("search_names", (q) => {
        let search = q.search("name", args.query);
        if (args.signup_method) {
          search = search.eq("signup_method", args.signup_method);
        }
        if (args.phone_verified !== undefined) {
          search = search.eq("phone_verified", args.phone_verified);
        }
        return search;
      })
      .collect();

    return results;
  }
});

// Combined text search across username and name
export const searchUsersFullText = query({
  args: {
    query: v.string(),
    signup_method: v.optional(v.string()),
    phone_verified: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    // Search by username
    const usernameResults = await ctx.db
      .query("users")
      .withSearchIndex("search_users", (q) => {
        let search = q.search("username", args.query);
        if (args.signup_method) {
          search = search.eq("signup_method", args.signup_method);
        }
        if (args.phone_verified !== undefined) {
          search = search.eq("phone_verified", args.phone_verified);
        }
        return search;
      })
      .collect();

    // Search by name
    const nameResults = await ctx.db
      .query("users")
      .withSearchIndex("search_names", (q) => {
        let search = q.search("name", args.query);
        if (args.signup_method) {
          search = search.eq("signup_method", args.signup_method);
        }
        if (args.phone_verified !== undefined) {
          search = search.eq("phone_verified", args.phone_verified);
        }
        return search;
      })
      .collect();

    // Combine and deduplicate results
    const seen = new Set<string>();
    const combined: User[] = [];

    for (const user of [...usernameResults, ...nameResults]) {
      if (!seen.has(user._id)) {
        seen.add(user._id);
        combined.push(user);
      }
    }

    return combined;
  }
});

// Get all users (with optional pagination)
export const getAllUsers = query({
  args: {
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("users");
    
    if (args.limit) {
      return await query.take(args.limit);
    }
    
    return await query.collect();
  }
}); 