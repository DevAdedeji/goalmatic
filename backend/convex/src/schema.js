"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("convex/server");
const values_1 = require("convex/values");
exports.default = (0, server_1.defineSchema)({
    agents: (0, server_1.defineTable)({
        // Core agent fields
        firebaseId: values_1.v.string(),
        name: values_1.v.string(),
        description: values_1.v.string(),
        avatar: values_1.v.optional(values_1.v.string()),
        public: values_1.v.boolean(),
        status: values_1.v.union(values_1.v.literal("DRAFT"), values_1.v.literal("PENDING"), values_1.v.literal("APPROVED"), values_1.v.literal("REJECTED")),
        // User information
        creator_id: values_1.v.string(),
        user: values_1.v.object({
            id: values_1.v.string(),
            name: values_1.v.optional(values_1.v.string())
        }),
        // Agent specification
        spec: values_1.v.object({
            systemInfo: values_1.v.string(),
            tools: values_1.v.array(values_1.v.any()),
            toolsConfig: values_1.v.optional(values_1.v.any())
        }),
        // Timestamps
        created_at: values_1.v.number(),
        updated_at: values_1.v.number(),
        last_used: values_1.v.optional(values_1.v.number()),
        // Clone information (optional)
        cloned_from: values_1.v.optional(values_1.v.object({
            id: values_1.v.string(),
            name: values_1.v.string(),
            creator_id: values_1.v.string()
        })),
        // Sync metadata
        firebase_synced: values_1.v.boolean(),
        last_sync: values_1.v.number()
    })
        .index("by_creator", ["creator_id"])
        .index("by_public", ["public"])
        .index("by_firebase_id", ["firebaseId"])
        .searchIndex("search_agents", {
        searchField: "name",
        filterFields: ["creator_id", "public", "status"]
    })
        .searchIndex("search_description", {
        searchField: "description",
        filterFields: ["creator_id", "public", "status"]
    }),
    users: (0, server_1.defineTable)({
        // Core user fields
        firebaseId: values_1.v.string(),
        username: values_1.v.string(),
        name: values_1.v.string(),
        bio: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        email: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        phone: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        photo_url: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        referral_code: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        referred_by: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        // Timestamps
        created_at: values_1.v.number(),
        updated_at: values_1.v.number(),
        // Settings
        showLogs: values_1.v.optional(values_1.v.union(values_1.v.boolean(), values_1.v.null())),
        selected_agent_id: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        timezone: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        signup_method: values_1.v.optional(values_1.v.union(values_1.v.string(), values_1.v.null())),
        phone_verified: values_1.v.optional(values_1.v.union(values_1.v.boolean(), values_1.v.null())),
        // Sync metadata
        firebase_synced: values_1.v.boolean(),
        last_sync: values_1.v.number()
    })
        .index("by_firebase_id", ["firebaseId"])
        .index("by_username", ["username"])
        .index("by_email", ["email"])
        .searchIndex("search_users", {
        searchField: "username",
        filterFields: ["signup_method", "phone_verified"]
    })
        .searchIndex("search_names", {
        searchField: "name",
        filterFields: ["signup_method", "phone_verified"]
    }),
    tables: (0, server_1.defineTable)({
        // Core table fields
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
        // Access control
        creator_id: values_1.v.string(),
        visibility: values_1.v.optional(values_1.v.string()),
        allowed_users: values_1.v.optional(values_1.v.array(values_1.v.string())),
        // Timestamps
        created_at: values_1.v.number(),
        updated_at: values_1.v.number(),
        // Sync metadata
        firebase_synced: values_1.v.boolean(),
        last_sync: values_1.v.number()
    })
        .index("by_creator", ["creator_id"])
        .index("by_firebase_id", ["firebaseId"])
        .index("by_visibility", ["visibility"])
        .searchIndex("search_tables", {
        searchField: "name",
        filterFields: ["creator_id", "visibility", "type"]
    })
        .searchIndex("search_table_description", {
        searchField: "description",
        filterFields: ["creator_id", "visibility", "type"]
    }),
    flows: (0, server_1.defineTable)({
        // Core flow fields
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
            // Allow additional properties with v.any()
        })),
        status: values_1.v.union(values_1.v.literal(0), // draft
        values_1.v.literal(1), // active
        values_1.v.literal("archived")),
        // User information
        creator_id: values_1.v.string(),
        user: values_1.v.object({
            id: values_1.v.string(),
            name: values_1.v.optional(values_1.v.string())
        }),
        // Timestamps
        created_at: values_1.v.number(),
        updated_at: values_1.v.number(),
        // Visibility
        public: values_1.v.optional(values_1.v.boolean()),
        // Clone information (optional)
        cloned_from: values_1.v.optional(values_1.v.object({
            id: values_1.v.string(),
            name: values_1.v.string(),
            creator_id: values_1.v.string()
        })),
        // Sync metadata
        firebase_synced: values_1.v.boolean(),
        last_sync: values_1.v.number()
    })
        .index("by_creator", ["creator_id"])
        .index("by_public", ["public"])
        .index("by_status", ["status"])
        .index("by_firebase_id", ["firebaseId"])
        .searchIndex("search_flows", {
        searchField: "name",
        filterFields: ["creator_id", "public", "status", "type"]
    })
        .searchIndex("search_flow_description", {
        searchField: "description",
        filterFields: ["creator_id", "public", "status", "type"]
    })
});
//# sourceMappingURL=schema.js.map