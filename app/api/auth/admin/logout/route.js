import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('adminToken')
  
  return new Response(
    JSON.stringify({ message: 'Logged out successfully' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
