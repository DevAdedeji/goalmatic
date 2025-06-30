"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.searchUsersFullText = exports.searchUsersByName = exports.searchUsers = exports.getUserByEmail = exports.getUserByUsername = exports.getUserByFirebaseId = exports.deleteUser = exports.updateUser = exports.createUser = void 0;
const server_1 = require("./_generated/server");
const values_1 = require("convex/values");
// Create a new user in Convex
exports.createUser = (0, server_1.mutation)({
    args: {
        firebaseId: values_1.v.string(),
        username: values_1.v.string(),
        name: values_1.v.string(),
        bio: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        email: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        phone: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        photo_url: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        referral_code: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        referred_by: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        created_at: values_1.v.number(),
        updated_at: values_1.v.number(),
        showLogs: values_1.v.optional(values_1.v.union(values_1.v.boolean(), values_1.v.null())),
        selected_agent_id: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        timezone: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        signup_method: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        phone_verified: values_1.v.optional(values_1.v.union(values_1.v.boolean(), values_1.v.null()))
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("users", Object.assign(Object.assign({}, args), { firebase_synced: true, last_sync: Date.now() }));
    }
});
// Update an existing user in Convex
exports.updateUser = (0, server_1.mutation)({
    args: {
        firebaseId: values_1.v.string(),
        updates: values_1.v.object({
            username: values_1.v.optional(values_1.v.string()),
            name: values_1.v.optional(values_1.v.string()),
            bio: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
            email: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
            phone: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
            photo_url: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
            referral_code: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
            referred_by: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
            updated_at: values_1.v.number(),
            showLogs: values_1.v.optional(values_1.v.union(values_1.v.boolean(), values_1.v.null())),
            selected_agent_id: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
            timezone: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
            signup_method: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
            phone_verified: values_1.v.optional(values_1.v.union(values_1.v.boolean(), values_1.v.null()))
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
        return await ctx.db.patch(user._id, Object.assign(Object.assign({}, args.updates), { firebase_synced: true, last_sync: Date.now() }));
    }
});
// Delete a user from Convex
exports.deleteUser = (0, server_1.mutation)({
    args: {
        firebaseId: values_1.v.string()
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
exports.getUserByFirebaseId = (0, server_1.query)({
    args: {
        firebaseId: values_1.v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
            .unique();
    }
});
// Get user by username
exports.getUserByUsername = (0, server_1.query)({
    args: {
        username: values_1.v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", args.username))
            .unique();
    }
});
// Get user by email
exports.getUserByEmail = (0, server_1.query)({
    args: {
        email: values_1.v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();
    }
});
// Search users by username
exports.searchUsers = (0, server_1.query)({
    args: {
        query: values_1.v.string(),
        signup_method: values_1.v.optional(values_1.v.string()),
        phone_verified: values_1.v.optional(values_1.v.boolean())
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
exports.searchUsersByName = (0, server_1.query)({
    args: {
        query: values_1.v.string(),
        signup_method: values_1.v.optional(values_1.v.string()),
        phone_verified: values_1.v.optional(values_1.v.boolean())
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
exports.searchUsersFullText = (0, server_1.query)({
    args: {
        query: values_1.v.string(),
        signup_method: values_1.v.optional(values_1.v.string()),
        phone_verified: values_1.v.optional(values_1.v.boolean())
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
        const seen = new Set();
        const combined = [];
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
exports.getAllUsers = (0, server_1.query)({
    args: {
        limit: values_1.v.optional(values_1.v.number())
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("users");
        if (args.limit) {
            return await query.take(args.limit);
        }
        return await query.collect();
    }
});
//# sourceMappingURL=users.js.map