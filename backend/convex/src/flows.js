"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessibleFlows = exports.searchFlowsFullText = exports.searchFlowsByDescription = exports.searchFlows = exports.getDraftFlowsByCreator = exports.getActiveFlowsByCreator = exports.getFlowsByStatus = exports.getPublicFlows = exports.getFlowsByCreator = exports.getFlowByFirebaseId = exports.deleteFlow = exports.updateFlow = exports.createFlow = void 0;
const server_1 = require("./_generated/server");
const values_1 = require("convex/values");
// Create a new flow in Convex
exports.createFlow = (0, server_1.mutation)({
    args: {
        firebaseId: values_1.v.string(),
        name: values_1.v.string(),
        description: values_1.v.optional(values_1.v.string()),
        type: values_1.v.string(),
        steps: values_1.v.array(values_1.v.object({
            id: values_1.v.string(),
            name: values_1.v.string(),
            description: values_1.v.string(),
            type: values_1.v.string(),
            time: values_1.v.optional(values_1.v.string()),
            duration: values_1.v.optional(values_1.v.number()),
            isActive: values_1.v.boolean()
        })),
        status: values_1.v.union(values_1.v.literal(0), values_1.v.literal(1), values_1.v.literal("archived")),
        creator_id: values_1.v.string(),
        user: values_1.v.object({
            id: values_1.v.string(),
            name: values_1.v.optional(values_1.v.string())
        }),
        created_at: values_1.v.number(),
        updated_at: values_1.v.number(),
        public: values_1.v.optional(values_1.v.boolean()),
        cloned_from: values_1.v.optional(values_1.v.object({
            id: values_1.v.string(),
            name: values_1.v.string(),
            creator_id: values_1.v.string()
        }))
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("flows", Object.assign(Object.assign({}, args), { firebase_synced: true, last_sync: Date.now() }));
    }
});
// Update an existing flow in Convex
exports.updateFlow = (0, server_1.mutation)({
    args: {
        firebaseId: values_1.v.string(),
        updates: values_1.v.object({
            name: values_1.v.optional(values_1.v.string()),
            description: values_1.v.optional(values_1.v.string()),
            type: values_1.v.optional(values_1.v.string()),
            steps: values_1.v.optional(values_1.v.array(values_1.v.object({
                id: values_1.v.string(),
                name: values_1.v.string(),
                description: values_1.v.string(),
                type: values_1.v.string(),
                time: values_1.v.optional(values_1.v.string()),
                duration: values_1.v.optional(values_1.v.number()),
                isActive: values_1.v.boolean()
            }))),
            status: values_1.v.optional(values_1.v.union(values_1.v.literal(0), values_1.v.literal(1), values_1.v.literal("archived"))),
            updated_at: values_1.v.number(),
            public: values_1.v.optional(values_1.v.boolean())
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
        return await ctx.db.patch(flow._id, Object.assign(Object.assign({}, args.updates), { firebase_synced: true, last_sync: Date.now() }));
    }
});
// Delete a flow from Convex
exports.deleteFlow = (0, server_1.mutation)({
    args: {
        firebaseId: values_1.v.string()
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
exports.getFlowByFirebaseId = (0, server_1.query)({
    args: {
        firebaseId: values_1.v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("flows")
            .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
            .unique();
    }
});
// Get flows by creator
exports.getFlowsByCreator = (0, server_1.query)({
    args: {
        creator_id: values_1.v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("flows")
            .withIndex("by_creator", (q) => q.eq("creator_id", args.creator_id))
            .collect();
    }
});
// Get public flows
exports.getPublicFlows = (0, server_1.query)({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("flows")
            .withIndex("by_public", (q) => q.eq("public", true))
            .collect();
    }
});
// Get flows by status
exports.getFlowsByStatus = (0, server_1.query)({
    args: {
        status: values_1.v.union(values_1.v.literal(0), values_1.v.literal(1), values_1.v.literal("archived"))
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("flows")
            .withIndex("by_status", (q) => q.eq("status", args.status))
            .collect();
    }
});
// Get active flows by creator
exports.getActiveFlowsByCreator = (0, server_1.query)({
    args: {
        creator_id: values_1.v.string()
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
exports.getDraftFlowsByCreator = (0, server_1.query)({
    args: {
        creator_id: values_1.v.string()
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
exports.searchFlows = (0, server_1.query)({
    args: {
        query: values_1.v.string(),
        creator_id: values_1.v.optional(values_1.v.string()),
        public_only: values_1.v.optional(values_1.v.boolean()),
        status: values_1.v.optional(values_1.v.union(values_1.v.literal(0), values_1.v.literal(1), values_1.v.literal("archived"))),
        type: values_1.v.optional(values_1.v.string())
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
exports.searchFlowsByDescription = (0, server_1.query)({
    args: {
        query: values_1.v.string(),
        creator_id: values_1.v.optional(values_1.v.string()),
        public_only: values_1.v.optional(values_1.v.boolean()),
        status: values_1.v.optional(values_1.v.union(values_1.v.literal(0), values_1.v.literal(1), values_1.v.literal("archived"))),
        type: values_1.v.optional(values_1.v.string())
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
exports.searchFlowsFullText = (0, server_1.query)({
    args: {
        query: values_1.v.string(),
        creator_id: values_1.v.optional(values_1.v.string()),
        public_only: values_1.v.optional(values_1.v.boolean()),
        status: values_1.v.optional(values_1.v.union(values_1.v.literal(0), values_1.v.literal(1), values_1.v.literal("archived"))),
        type: values_1.v.optional(values_1.v.string())
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
        const seen = new Set();
        const combined = [];
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
exports.getAccessibleFlows = (0, server_1.query)({
    args: {
        user_id: values_1.v.string()
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
        const seen = new Set();
        const accessible = [];
        for (const flow of [...userFlows, ...publicFlows]) {
            if (!seen.has(flow._id)) {
                seen.add(flow._id);
                accessible.push(flow);
            }
        }
        return accessible;
    }
});
//# sourceMappingURL=flows.js.map