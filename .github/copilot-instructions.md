# Goalmatic AI Coding Agent Instructions

## Architecture Overview

**Goalmatic** is a full-stack AI automation platform with dual-database sync architecture:
- **Frontend**: Nuxt 3 + Vue 3 Composition API + TailwindCSS
- **Backend**: Firebase Functions + Convex database with bidirectional sync
- **AI Integration**: Composio SDK for tool execution + multiple AI providers (OpenAI, Google)
- **Auth**: Firebase Auth with multi-provider support (Google, Email/Password, Phone/WhatsApp)

## Critical Architecture Patterns

### Database Sync System
The app maintains **Firebase ↔ Convex bidirectional sync** for agents, users, flows, and tables:
- **Firebase** = primary source, user-facing operations
- **Convex** = query optimization, search, real-time subscriptions
- **Sync triggers**: `backend/functions/src/convex/sync*.ts` files handle Firebase document changes
- **Environment control**: `ENABLE_CONVEX_SYNC` env var (disabled in dev by default)

```typescript
// Pattern: All sync functions check isConvexSyncEnabled()
if (!isConvexSyncEnabled()) {
  console.log('Convex sync is disabled, skipping...');
  return;
}
```

### AI Agent Architecture
Agents are central entities with tools integration via Composio:
- **Schema**: `backend/functions/convex/src/schema.ts` defines agent structure
- **Tools**: Configured per agent with Composio SDK integration
- **Execution**: `backend/functions/src/agents/` handles agent operations
- **State**: Draft/Pending/Approved/Rejected workflow

### Firebase Structure
```
users/{userId}/
  ├── integrations/{integrationId} (Gmail, WhatsApp, Calendar, etc.)
  └── chat_sessions/{sessionId}/messages/{messageId}
agents/{agentId}
flows/{flowId}
tables/{tableId}
```

## Development Workflows

### Local Development Setup
```bash
# Root level - start both services
npm run f  # Frontend (Nuxt dev)
npm run b  # Backend (Firebase emulators)

# Frontend only
cd frontend && yarn dev

# Backend with emulators + dummy data
cd backend && npm run emu
```

### Environment Configuration
- **Dev mode**: Uses `taaskly-dev` project, Convex sync OFF by default
- **Production**: Uses main project, Convex sync ON by default
- **Database switching**: `backend/functions/src/init.ts` handles env-based DB selection

### AI Integration Patterns
All AI tool integrations follow Composio patterns:
```typescript
// Standard Composio tool execution
const tools = await composio.tools.get(userId, {
  tools: agent.tools,
  strict: true
});

// Error handling pattern
try {
  const result = await composio.execute(/* ... */);
} catch (error) {
  throw new ComposioToolExecutionError(message, { originalError: error });
}
```

## Frontend Patterns

### Composition API Structure
Use this pattern for all composables (`frontend/src/composables/`):
```typescript
export const useFeatureName = () => {
  const { id: user_id } = useUser()
  const loading = ref(false)
  
  const fetchData = async () => {
    loading.value = true
    try {
      // Firebase operation
    } catch (error) {
      useAlert().openAlert({ type: 'ERROR', msg: error.message })
    } finally {
      loading.value = false
    }
  }
  
  return { loading, fetchData }
}
```

### Firebase Integration Patterns
- **Auth**: All auth flows use `composables/auth/` with `afterAuthCheck()` post-auth processing
- **Firestore**: Use helper functions from `firebase/firestore/` (create, fetch, edit, query)
- **Functions**: Call via `callFirebaseFunction(functionName, data)` wrapper

### Component Organization
```
components/
├── core/           # Reusable UI components
├── modals/         # Modal components (flows, agents, etc.)
├── auth/           # Authentication components
├── agents/         # AI agent-specific components
└── flows/          # Workflow/automation components
```

## Backend Patterns

### Firebase Functions Structure
- **Region**: All functions use `us-central1`
- **CORS**: Enable for callable functions: `{ cors: true, region: 'us-central1' }`
- **Auth**: Check `request.auth` for authenticated endpoints
- **Database**: Use `goals_db` import from `init.ts`

### Convex Integration
- **Client**: Use `getConvexClient()` from `convex/utils.ts`
- **Data transformation**: Each entity has `transformForConvex()` function
- **Sync prevention**: Add `_convexSyncSkip` field to prevent circular syncing

### WhatsApp Integration
Special authentication flow for WhatsApp users:
- Custom phone verification with OTP
- Creates Firebase Auth users with phone numbers
- Integrates with WhatsApp Business API for messaging

## Key Files Reference

### Configuration
- `frontend/nuxt.config.ts` - Nuxt configuration with security headers
- `backend/firebase.json` - Firebase services and emulator configuration
- `backend/functions/convex/convex.json` - Convex functions configuration

### Database Schemas
- `backend/functions/convex/src/schema.ts` - Complete Convex schema with indexes
- `backend/firestore.rules` - Firebase security rules

### Environment Management
- `backend/functions/src/init.ts` - Environment detection and database selection
- `frontend/src/firebase/init.ts` - Firebase client initialization with emulator connections

### AI Integration
- `backend/functions/src/ai/` - AI tool implementations
- `.cursor/rules/ai-agent-patterns.mdc` - Detailed AI agent patterns
- `.cursor/rules/composio-typescript-sdk.mdc` - Composio integration patterns

## Testing & Debugging

### Emulator Usage
Firebase emulators run on consistent ports:
- Auth: 9099, Functions: 5001, Firestore: 8181, Storage: 9199
- Import/export data via `dummy_data/` directory

### Common Issues
- **Convex sync loops**: Check for `_convexSyncSkip` field usage
- **Auth state**: Phone auth users have different auth flow than email users
- **Environment mismatches**: Verify `is_dev` vs `is_emulator` in init files

Focus on maintaining the dual-database architecture integrity and following established auth patterns when making changes.


Stop creating .md file for every new feature 