// app/api/db-check/route.ts
import dns from 'dns/promises';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const address = await dns.lookup('db.vnlihfpnjftcioasuprp.supabase.co');
    return Response.json({ resolved: address.address });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

