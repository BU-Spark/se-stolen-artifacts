import { NextRequest, NextResponse } from 'next/server';

import { handleCreate, type CreateRequest } from '@/lib/crud-handlers/create';
import { handleUpdate, type UpdateRequest } from '@/lib/crud-handlers/update';
import { CrudRequest, TABLE_REGISTRY } from '@/lib/registry';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CrudRequest>;

    if (!body?.table || !body?.action) {
      return NextResponse.json({ error: 'Missing required fields: table and action' }, { status: 400 });
    }

    const tableConfig = TABLE_REGISTRY[body.table];
    if (!tableConfig) {
      return NextResponse.json({ error: `Table "${body.table}" is not registered` }, { status: 404 });
    }

    if (!tableConfig.allowedActions.includes(body.action)) {
      return NextResponse.json(
        { error: `Action "${body.action}" is not permitted for table "${body.table}"` },
        { status: 403 }
      );
    }

    const result = await dispatchAction(body as CrudRequest);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    if (error instanceof NotImplementedError) {
      return NextResponse.json(
        {
          error: error.message,
          nextStep: `Create lib/crud-handlers/${error.action}.ts and wire it into dispatchAction()`,
        },
        { status: 501 }
      );
    }

    console.error('Error handling admin CRUD request', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

async function dispatchAction(payload: CrudRequest) {
  switch (payload.action) {
    case 'create':
      return handleCreate(payload as CreateRequest);
    case 'update':
      return handleUpdate(payload as UpdateRequest);
    // TODO: uncomment when completed
    // case "read":
    //     return handleRead(payload as CreateRequest);
    // case "delete":
    //     return handleDelete(payload as CreateRequest);
    default:
      throw new Error(`Unsupported action: ${payload.action as string}`);
  }
}

class NotImplementedError extends Error {
  constructor(public action: string) {
    super(`Action "${action}" is not implemented yet`);
    this.name = 'NotImplementedError';
  }
}
