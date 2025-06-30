"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAgentsFullText = exports.getPublicAgents = exports.getAgentsByCreator = exports.getAgentByFirebaseId = exports.searchAgentsByDescription = exports.searchAgents = exports.deleteAgent = exports.updateAgent = exports.createAgent = void 0;
const server_1 = require("./_generated/server");
const values_1 = require("convex/values");
// Create a new agent in Convex
exports.createAgent = (0, server_1.mutation)({
    args: {
        firebaseId: values_1.v.string(),
        name: values_1.v.string(),
        description: values_1.v.string(),
        avatar: values_1.v.optional(values_1.v.string()),
        public: values_1.v.boolean(),
        status: values_1.v.union(values_1.v.literal("DRAFT"), values_1.v.literal("PENDING"), values_1.v.literal("APPROVED"), values_1.v.literal("REJECTED")),
        creator_id: values_1.v.string(),
        user: values_1.v.object({
            id: values_1.v.string(),
            name: values_1.v.optional(values_1.v.string())
        }),
        spec: values_1.v.object({
            systemInfo: values_1.v.string(),
            tools: values_1.v.array(values_1.v.any()),
            toolsConfig: values_1.v.optional(values_1.v.any())
        }),
        created_at: values_1.v.number(),
        updated_at: values_1.v.number(),
        last_used: values_1.v.optional(values_1.v.number()),
        cloned_from: values_1.v.optional(values_1.v.object({
            id: values_1.v.string(),
            name: values_1.v.string(),
            creator_id: values_1.v.string()
        })),
        firebase_synced: values_1.v.boolean(),
        last_sync: values_1.v.number()
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("agents", Object.assign(Object.assign({}, args), { firebase_synced: true, last_sync: Date.now() }));
    }
});
// Update an existing agent in Convex
exports.updateAgent = (0, server_1.mutation)({
    args: {
        firebaseId: values_1.v.string(),
        updates: values_1.v.object({
            name: values_1.v.optional(values_1.v.string()),
            description: values_1.v.optional(values_1.v.string()),
            avatar: values_1.v.optional(values_1.v.string()),
            public: values_1.v.optional(values_1.v.boolean()),
            status: values_1.v.optional(values_1.v.union(values_1.v.literal("DRAFT"), values_1.v.literal("PENDING"), values_1.v.literal("APPROVED"), values_1.v.literal("REJECTED"))),
            spec: values_1.v.optional(values_1.v.object({
                systemInfo: values_1.v.string(),
                tools: values_1.v.array(values_1.v.any()),
                toolsConfig: values_1.v.optional(values_1.v.any())
            })),
            updated_at: values_1.v.number(),
            last_used: values_1.v.optional(values_1.v.number())
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
        return await ctx.db.patch(agent._id, Object.assign(Object.assign({}, args.updates), { firebase_synced: true, last_sync: Date.now() }));
    }
});
// Delete an agent from Convex
exports.deleteAgent = (0, server_1.mutation)({
    args: {
        firebaseId: values_1.v.string()
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
exports.searchAgents = (0, server_1.query)({
    args: {
        query: values_1.v.string(),
        creator_id: values_1.v.optional(values_1.v.string()),
        public_only: values_1.v.optional(values_1.v.boolean())
    },
    handler: async (ctx, args) => {
        const results = await ctx.db
            .query("agents")
            .withSearchIndex("search_agents", (q) => {
            var _a;
            return q.search("name", args.query)
                .eq("creator_id", args.creator_id || "")
                .eq("public", (_a = args.public_only) !== null && _a !== void 0 ? _a : true);
        })
            .collect();
        return results;
    }
});
// Search agents by description
exports.searchAgentsByDescription = (0, server_1.query)({
    args: {
        query: values_1.v.string(),
        creator_id: values_1.v.optional(values_1.v.string()),
        public_only: values_1.v.optional(values_1.v.boolean())
    },
    handler: async (ctx, args) => {
        const results = await ctx.db
            .query("agents")
            .withSearchIndex("search_description", (q) => {
            var _a;
            return q.search("description", args.query)
                .eq("creator_id", args.creator_id || "")
                .eq("public", (_a = args.public_only) !== null && _a !== void 0 ? _a : true);
        })
            .collect();
        return results;
    }
});
// Get agent by Firebase ID
exports.getAgentByFirebaseId = (0, server_1.query)({
    args: {
        firebaseId: values_1.v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("agents")
            .withIndex("by_firebase_id", (q) => q.eq("firebaseId", args.firebaseId))
            .unique();
    }
});
// Get agents by creator
exports.getAgentsByCreator = (0, server_1.query)({
    args: {
        creator_id: values_1.v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("agents")
            .withIndex("by_creator", (q) => q.eq("creator_id", args.creator_id))
            .collect();
    }
});
// Get public agents
exports.getPublicAgents = (0, server_1.query)({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("agents")
            .withIndex("by_public", (q) => q.eq("public", true))
            .collect();
    }
});
// Combined text search across name and description
exports.searchAgentsFullText = (0, server_1.query)({
    args: {
        query: values_1.v.string(),
        creator_id: values_1.v.optional(values_1.v.string()),
        public_only: values_1.v.optional(values_1.v.boolean())
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
        const seen = new Set();
        const combined = [];
        for (const agent of [...nameResults, ...descResults]) {
            if (!seen.has(agent._id)) {
                seen.add(agent._id);
                combined.push(agent);
            }
        }
        return combined;
    }
});
//# sourceMappingURL=agents.js.map