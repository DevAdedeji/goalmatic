import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    // Core agent fields
    firebaseId: v.string(), // Original Firebase document ID
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
    
    // User information
    creator_id: v.string(),
    user: v.object({
      id: v.string(),
      name: v.optional(v.string())
    }),
    
    // Agent specification
    spec: v.object({
      systemInfo: v.string(),
      tools: v.array(v.any()),
      toolsConfig: v.optional(v.any())
    }),
    
    // Timestamps
    created_at: v.number(), // Unix timestamp
    updated_at: v.number(), // Unix timestamp
    last_used: v.optional(v.number()), // Unix timestamp
    
    // Clone information (optional)
    cloned_from: v.optional(v.object({
      id: v.string(),
      name: v.string(),
      creator_id: v.string()
    })),
    
    // Sync metadata
    firebase_synced: v.boolean(),
    last_sync: v.number()
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

  users: defineTable({
    // Core user fields
    firebaseId: v.string(), // Original Firebase document ID
    username: v.string(),
    name: v.string(),
    bio: v.optional(v.union(v.string(), v.null())),
    email: v.optional(v.union(v.string(), v.null())),
    phone: v.optional(v.union(v.string(), v.null())),
    photo_url: v.optional(v.union(v.string(), v.null())),
    referral_code: v.optional(v.union(v.string(), v.null())),
    referred_by: v.optional(v.union(v.string(), v.null())),
    
    // Timestamps
    created_at: v.number(), // Unix timestamp
    updated_at: v.number(), // Unix timestamp
    
    // Settings
    showLogs: v.optional(v.union(v.boolean(), v.null())),
    selected_agent_id: v.optional(v.union(v.string(), v.null())),
    timezone: v.optional(v.union(v.string(), v.null())),
    signup_method: v.optional(v.union(v.string(), v.null())),
    phone_verified: v.optional(v.union(v.boolean(), v.null())),
    
    // Sync metadata
    firebase_synced: v.boolean(),
    last_sync: v.number()
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

  tables: defineTable({
    // Core table fields
    firebaseId: v.string(), // Original Firebase document ID
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    fields: v.array(v.object({
      id: v.string(),
      name: v.string(),
      type: v.string(),
      description: v.optional(v.string()),
      required: v.optional(v.boolean()),
      options: v.optional(v.array(v.string())),
      default: v.optional(v.any())
    })),
    
    // Access control
    creator_id: v.string(),
    visibility: v.optional(v.string()),
    allowed_users: v.optional(v.array(v.string())),
    
    // Timestamps
    created_at: v.number(), // Unix timestamp
    updated_at: v.number(), // Unix timestamp
    
    // Sync metadata
    firebase_synced: v.boolean(),
    last_sync: v.number()
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

  flows: defineTable({
    // Core flow fields
    firebaseId: v.string(), // Original Firebase document ID
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(), // 'standard' | 'automated'
    steps: v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      type: v.string(),
      time: v.optional(v.string()),
      duration: v.optional(v.number()),
      isActive: v.boolean()
      // Allow additional properties with v.any()
    })),
    status: v.union(
      v.literal(0), // draft
      v.literal(1), // active
      v.literal("archived")
    ),
    
    // User information
    creator_id: v.string(),
    user: v.object({
      id: v.string(),
      name: v.optional(v.string())
    }),
    
    // Timestamps
    created_at: v.number(), // Unix timestamp
    updated_at: v.number(), // Unix timestamp
    
    // Visibility
    public: v.optional(v.boolean()),
    
    // Clone information (optional)
    cloned_from: v.optional(v.object({
      id: v.string(),
      name: v.string(),
      creator_id: v.string()
    })),
    
    // Sync metadata
    firebase_synced: v.boolean(),
    last_sync: v.number()
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

export type Agent = {
  _id: string;
  _creationTime: number;
  firebaseId: string;
  name: string;
  description: string;
  avatar?: string;
  public: boolean;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  creator_id: string;
  user: {
    id: string;
    name?: string;
  };
  spec: {
    systemInfo: string;
    tools: any[];
    toolsConfig?: any;
  };
  created_at: number;
  updated_at: number;
  last_used?: number;
  cloned_from?: {
    id: string;
    name: string;
    creator_id: string;
  };
  firebase_synced: boolean;
  last_sync: number;
};

export type User = {
  _id: string;
  _creationTime: number;
  firebaseId: string;
  username: string;
  name: string;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  photo_url?: string | null;
  referral_code?: string | null;
  referred_by?: string | null;
  created_at: number;
  updated_at: number;
  showLogs?: boolean | null;
  selected_agent_id?: string | null;
  timezone?: string | null;
  signup_method?: string | null;
  phone_verified?: boolean | null;
  firebase_synced: boolean;
  last_sync: number;
};

export type Table = {
  _id: string;
  _creationTime: number;
  firebaseId: string;
  name: string;
  description?: string;
  type: string;
  fields: Array<{
    id: string;
    name: string;
    type: string;
    description?: string;
    required?: boolean;
    options?: string[];
    default?: any;
  }>;
  creator_id: string;
  visibility?: string;
  allowed_users?: string[];
  created_at: number;
  updated_at: number;
  firebase_synced: boolean;
  last_sync: number;
};

export type Flow = {
  _id: string;
  _creationTime: number;
  firebaseId: string;
  name: string;
  description?: string;
  type: string;
  steps: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    time?: string;
    duration?: number;
    isActive: boolean;
  }>;
  status: 0 | 1 | "archived";
  creator_id: string;
  user: {
    id: string;
    name?: string;
  };
  created_at: number;
  updated_at: number;
  public?: boolean;
  cloned_from?: {
    id: string;
    name: string;
    creator_id: string;
  };
  firebase_synced: boolean;
  last_sync: number;
}; 