import { supabase } from '@/lib/supabase'

const TIMEOUT_MS = 45_000

export async function uploadCompanyLogo(file: File, userId: string): Promise<string> {
  const rawExt = file.name.split('.').pop()?.toLowerCase() || 'png'
  const ext = ['png', 'jpg', 'jpeg', 'webp'].includes(rawExt) ? rawExt : 'png'
  const path = `${userId}/logo.${ext}`

  const {
    data: { session },
    error: sessionErr,
  } = await supabase.auth.getSession()

  if (sessionErr || !session?.access_token) {
    throw new Error('Sign in again to upload your logo.')
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const pathEncoded = path.split('/').map(encodeURIComponent).join('/')
  const uploadUrl = `${baseUrl}/storage/v1/object/logos/${pathEncoded}?upsert=true`

  const controller = new AbortController()
  const deadline = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: anonKey,
        'Content-Type': file.type || `image/${ext}`,
      },
      body: file,
      signal: controller.signal,
    })

    if (!res.ok) {
      const t = await res.text().catch(() => '')
      throw new Error(
        `Logo upload failed (${res.status}): ${t || res.statusText}. Create Storage bucket "logos" (public) with authenticated INSERT.`,
      )
    }
  } finally {
    clearTimeout(deadline)
  }

  const { data } = supabase.storage.from('logos').getPublicUrl(path)
  if (!data?.publicUrl) throw new Error('Could not build public URL for logo.')
  return data.publicUrl
}
