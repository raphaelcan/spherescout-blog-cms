import { Client } from 'pg'

export const runtime = 'nodejs'

export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    const result = await client.query('SELECT NOW()')
    await client.end()
    return Response.json({ success: true, time: result.rows[0] })
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}