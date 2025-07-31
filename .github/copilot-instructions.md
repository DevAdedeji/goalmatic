### 🧠 Coding Agent Instructions

1. **Understand the Feature in Context:**

   * Before doing anything, first **analyze the feature being requested** in relation to the **entire codebase architecture**, not just in isolation.
   * If needed, **create a `codebase-understanding.md` file** to document relevant parts of the architecture, data flow, or dependencies that relate to the feature.
   * This understanding file should be updated over time and **referenced for future requests**, reducing repeated analysis work.

2. **Think Step by Step:**

   * After establishing context, **think through the implementation plan step-by-step**.
   * Break down the feature or task into logical, sequential steps that clearly show what must be done and why.

3. **Plan Before Execution:**

   * With the step-by-step breakdown in mind, **identify the exact files, components, and services** that will be involved.
   * Ensure no part of the implementation is done blindly — always plan file-level impact first.

4. **Make Only Necessary Code Changes:**

   * Navigate to the exact files identified during planning and **make only the necessary changes** to implement the feature, fix the bug, or update behavior.
   * Preserve the integrity of patterns in use — such as **dual-database architecture** and **authentication/authorization flows**.

5. **Do Not Deploy:**

   * **Never run deployment or production-related commands** (e.g., pushing to main, running `deploy`, `build`, or cloud-specific commands).
   * Assume another system or person handles staging and production deployment.

6. **Handle New or Unfamiliar Technologies Cautiously:**

   * If asked to use an unfamiliar tool or library:

     * Use `context7 mcp` to fetch relevant internal documentation.
     * **Search the web and check GitHub repositories** for best practices, sample implementations, and common patterns.

7. **Stop Creating `.md` Files for Every New Feature:**

   * Only create documentation when:

     * The feature affects multiple parts of the system.
     * The logic is complex enough to require future reference.
     * It impacts codebase understanding (see Step 1).
   * Avoid cluttering the repo with redundant or unnecessary markdown documentation.


