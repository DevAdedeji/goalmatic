how to install
- add the .env file to both the Fontend and backend repo
- cd into the frontend folder and run yarn install [we use yarn in this project]
- after that run yarn dev to start up the frontend repo
- after the frontend is running, open a new terminal and cd into the backend folder
- run npm install then cd into functions and run npm install also
- install firebase cli and run `firebase login` in the terminal 

## Environment Variables

### Convex Sync Configuration

The application supports two-way sync between Firebase and Convex databases. You can control this behavior using the `ENABLE_CONVEX_SYNC` environment variable in your backend functions:

- **Default Behavior**:
  - **Dev mode**: Sync is **OFF** by default (when project ID is 'taaskly-dev')
  - **Production**: Sync is **ON** by default

- **Override Behavior**:
  - Set `ENABLE_CONVEX_SYNC=true` to force sync ON in any environment
  - Set `ENABLE_CONVEX_SYNC=false` to force sync OFF in any environment

**Example usage:**
```bash
# To enable sync in dev mode
export ENABLE_CONVEX_SYNC=true

# To disable sync in production
export ENABLE_CONVEX_SYNC=false
```

This allows developers to work locally without triggering unnecessary Convex synchronization while maintaining full sync functionality in production. 