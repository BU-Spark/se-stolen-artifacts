# Approval Drawer Component

## Overview

A drawer UI that appears when admins click "Approve" or "Deny" on pending image submissions. Allows folder selection before finalizing the approval.

## Features

- ✅ Right-side drawer with image preview
- ✅ Radio button selection for destination folders
- ✅ Visual confirmation of selected folder
- ✅ Two action buttons: "Approve & Move to Folder" and "Deny Submission"
- ✅ Mobile responsive design

## Current Implementation Status

### ✅ Completed

- Drawer UI component with Material-UI
- Folder selection interface with radio buttons
- Image preview in drawer
- State management for drawer open/close
- Integration with PendingImageCard component
- TypeScript type definitions

### 🚧 TODO - Backend Integration

#### 1. Create Folders/Categories System in Supabase

**Option A: Simple Folders Table**

```sql
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample folders
INSERT INTO folders (id, name, description) VALUES
  ('folder-1', 'Folder 1', 'Primary collection'),
  ('folder-2', 'Folder 2', 'Secondary collection'),
  ('folder-3', 'Folder 3', 'Special artifacts');
```

**Option B: Add folder_id to images table**

```sql
ALTER TABLE images ADD COLUMN folder_id UUID REFERENCES folders(id);
```

#### 2. Update Approval Status Enum

Make sure your `approval_status` enum has these values:

```sql
-- Check current enum values
SELECT enum_range(NULL::approval_status);

-- If needed, add new status values
ALTER TYPE approval_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE approval_status ADD VALUE IF NOT EXISTS 'denied';
```

#### 3. Create API Endpoints

**File: `/app/api/admin/approve/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  const { imageId, folderId } = await request.json();

  // Update approval status
  const { error: approvalError } = await supabase
    .from('approval')
    .update({ status: 'approved' })
    .eq('image_id', imageId);

  if (approvalError) {
    return NextResponse.json({ error: approvalError.message }, { status: 500 });
  }

  // Update image folder
  const { error: imageError } = await supabase
    .from('images')
    .update({ folder_id: folderId })
    .eq('internal_reference_number', imageId);

  if (imageError) {
    return NextResponse.json({ error: imageError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

**File: `/app/api/admin/deny/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/db/supabase';

export async function POST(request: Request) {
  const { imageId } = await request.json();

  const { error } = await supabase.from('approval').update({ status: 'denied' }).eq('image_id', imageId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

#### 4. Fetch Folders Dynamically

Update `ApprovalDrawer.tsx` to fetch folders from API:

```typescript
const [folders, setFolders] = useState<Folder[]>([]);

useEffect(() => {
  if (open) {
    fetch('/api/admin/folders')
      .then((res) => res.json())
      .then((data) => setFolders(data.folders));
  }
}, [open]);
```

#### 5. Uncomment API Calls in page.tsx

In `/app/admin/admin-review/page.tsx`, uncomment the TODO sections:

- Line 79-83: Approve API call
- Line 99-103: Deny API call

## Usage

```typescript
<ApprovalDrawer
  open={isOpen}
  imageId="9a226561-a291-4ca0-878d-3714a9abcc10"
  imageUrl="https://..."
  imageTitle="Ancient Statue"
  onClose={() => setIsOpen(false)}
  onApprove={(imageId, folderId) => {
    // Handle approval with folder selection
  }}
  onDeny={(imageId) => {
    // Handle denial
  }}
/>
```

## Files Created

1. `ApprovalDrawer/ApprovalDrawer.tsx` - Main drawer component
2. `ApprovalDrawer/ApprovalDrawer.types.ts` - TypeScript types
3. `ApprovalDrawer/index.ts` - Exports
4. Updated `PendingImageCard/PendingImageCard.tsx` - Integration

## Next Steps

1. Create the folders table in Supabase
2. Create the API routes for approve/deny
3. Fetch folders dynamically from database
4. Test the complete flow
5. Add success/error notifications (optional)
