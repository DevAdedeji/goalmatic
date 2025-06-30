"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessibleTables = exports.searchTablesFullText = exports.searchTablesByDescription = exports.searchTables = exports.getTablesByVisibility = exports.getPublicTables = exports.getTablesByCreator = exports.getTableByFirebaseId = exports.deleteTable = exports.updateTable = exports.createTable = void 0;
const server_1 = require("./_generated/server");
const values_1 = require("convex/values");
// Create a new table in Convex
exports.createTable = (0, server_1.mutation)({
    args: {
        firebaseId: values_1.v.string(),
        name: values_1.v.string(),
        description: values_1.v.optional(values_1.v.string()),
        type: values_1.v.string(),
        fields: values_1.v.array(values_1.v.object({
            id: values_1.v.string(),
            name: values_1.v.string(),
            type: values_1.v.string(),
            description: values_1.v.optional(values_1.v.string()),
            required: values_1.v.optional(values_1.v.boolean()),
            options: values_1.v.optional(values_1.v.array(values_1.v.string())),
            default: values_1.v.optional(values_1.v.any())
        })),
        creator_id: values_1.v.string(),
        visibility: values_1.v.optional(values_1.v.string()),
        allowed_users: values_1.v.optional(values_1.v.array(values_1.v.string())),
        created_at: values_1.v.number(),
        updated_at: values_1.v.number()
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("tables", Object.assign(Object.assign({}, args), { firebase_synced: true, last_sync: Date.now() }));
    }
});
// Update an existing table in Convex
exports.updateTable = (0, server_1.mutation)({
    args: {
        firebaseId: values_1.v.string(),
        updates: values_1.v.object({
            name: values_1.v.optional(values_1.v.string()),
            description: values_1.v.optional(values_1.v.string()),
            type: values_1.v.optional(values_1.v.string()),
            fields: values_1.v.optional(values_1.v.array(values_1.v.object({
                id: values_1.v.string(),
                name: values_1.v.string(),
                type: values_1.v.string(),
                description: values_1.v.optional(values_1.v.string()),
                required: values_1.v.optional(values_1.v.boolean()),
                options: values_1.v.optional(values_1.v.array(values_1.v.string())),
                default: values_1.v.optional(values_1.v.any())
            }))),
            visibility: values_1.v.optional(values_1.v.string()),
            allowed_users: values_1.v.optional(values_1.v.array(values_1.v.string())),
            updated_at: values_1.v.number()
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
        return await ctx.db.patch(table._id, Object.assign(Object.assign({}, args.updates), { firebase_synced: true, last_sync: Date.now() }));
    }
});
// Delete a table from Convex
exports.deleteTable = (0, server_1.mutation)({
    args: {
        firebaseId: values_1.v.string()
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
exports.getTableByFirebaseId = (0, server_1.query)({
    args: {
        firebaseId: values_1.v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("tables")
            .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
            .unique();
    }
});
// Get tables by creator
exports.getTablesByCreator = (0, server_1.query)({
    args: {
        creator_id: values_1.v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("tables")
            .withIndex("by_creator", (q) => q.eq("creator_id", args.creator_id))
            .collect();
    }
});
// Get public tables
exports.getPublicTables = (0, server_1.query)({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("tables")
            .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
            .collect();
    }
});
// Get tables by visibility
exports.getTablesByVisibility = (0, server_1.query)({
    args: {
        visibility: values_1.v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("tables")
            .withIndex("by_visibility", (q) => q.eq("visibility", args.visibility))
            .collect();
    }
});
// Search tables by name
exports.searchTables = (0, server_1.query)({
    args: {
        query: values_1.v.string(),
        creator_id: values_1.v.optional(values_1.v.string()),
        visibility: values_1.v.optional(values_1.v.string()),
        type: values_1.v.optional(values_1.v.string())
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
exports.searchTablesByDescription = (0, server_1.query)({
    args: {
        query: values_1.v.string(),
        creator_id: values_1.v.optional(values_1.v.string()),
        visibility: values_1.v.optional(values_1.v.string()),
        type: values_1.v.optional(values_1.v.string())
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
exports.searchTablesFullText = (0, server_1.query)({
    args: {
        query: values_1.v.string(),
        creator_id: values_1.v.optional(values_1.v.string()),
        visibility: values_1.v.optional(values_1.v.string()),
        type: values_1.v.optional(values_1.v.string())
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
        const seen = new Set();
        const combined = [];
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
exports.getAccessibleTables = (0, server_1.query)({
    args: {
        user_id: values_1.v.string()
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
        const allowedTables = allTables.filter(table => table.allowed_users && table.allowed_users.includes(args.user_id));
        // Combine and deduplicate
        const seen = new Set();
        const accessible = [];
        for (const table of [...createdTables, ...publicTables, ...allowedTables]) {
            if (!seen.has(table._id)) {
                seen.add(table._id);
                accessible.push(table);
            }
        }
        return accessible;
    }
});
//# sourceMappingURL=tables.js.map