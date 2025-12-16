Supabase Database Migration Guide

This document outlines the standard procedure for managing and deploying schema changes (tables, columns, types, RPC functions) to the PostgreSQL database using the Supabase CLI.

All database changes must be tracked through versioned migration files for reproducibility and auditing.

Step 1: Log In
- Run this command to open the browser and authenticate the CLI:

npx supabase login


Step 2: Link the Project
- Link your local repository to your remote Supabase project using the project reference ID.

npx supabase link --project-ref [YOUR_PROJECT_REF_ID]

Step 3: Generate a New Migration File
- Use the following command to create a new file in the supabase/migrations directory. The timestamp prefix ensures sequential execution.

npx supabase migration new create_pending_upload_rpc

Step 4: Add your SQL
- Open the newly created file (e.g., YYYYMMDDHHMMSS_create_pending_upload_rpc.sql) and paste your PostgreSQL code.

Step 5: Deploy to Remote DB
- The db push command finds any migration files in your local repository that have not been recorded as executed in the remote database's history table and runs them.

npx supabase db push

Step 6: Verify in Dashboard
- After a successful push, verify the change immediately
- Navigate to the Supabase Dashboard -> Database -> Functions.
- Your add_pending_image function should be listed there.