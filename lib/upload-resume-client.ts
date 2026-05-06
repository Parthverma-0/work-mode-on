import { supabase } from '@/lib/supabase'

const UPLOAD_TIMEOUT_MS = 60_000
const SIGNED_URL_TIMEOUT_MS = 20_000

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  rejectWith: () => Error,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(rejectWith()), ms)
    promise.then(
      (v) => {
        clearTimeout(t)
        resolve(v)
      },
      (e) => {
        clearTimeout(t)
        reject(e)
      },
    )
  })
}

/**
 * Uploads a resume via the Storage REST API (bounded by fetch AbortSignal).
 * Avoids hanging promises seen with some `@supabase/supabase-js` storage uploads in browsers.
 */
export async function uploadCandidateResumeBlob(file: File, userId: string): Promise<string> {
  const rawExt = file.name.split('.').pop()?.toLowerCase() || 'pdf'
  const safeExt = ['pdf', 'doc', 'docx'].includes(rawExt) ? rawExt : 'pdf'
  const path = `${userId}/${Date.now()}.${safeExt}`

  const {
    data: { session },
    error: sessionErr,
  } = await supabase.auth.getSession()

  if (sessionErr || !session?.access_token) {
    throw new Error('Your session expired. Refresh the page and sign in again, then retry.')
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!baseUrl || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }

  const pathEncoded = path.split('/').map(encodeURIComponent).join('/')
  const uploadUrl = `${baseUrl}/storage/v1/object/resumes/${pathEncoded}?upsert=true`

  const controller = new AbortController()
  const deadline = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: anonKey,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
      signal: controller.signal,
    })
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error(
        `Resume upload timed out after ${UPLOAD_TIMEOUT_MS / 1000}s. Try a smaller file, another network, and confirm Storage bucket "resumes" exists with upload allowed for authenticated users.`,
      )
    }
    throw e instanceof Error ? e : new Error('Resume upload failed (network error).')
  } finally {
    clearTimeout(deadline)
  }

  if (!res.ok) {
    const hint = await res.text().catch(() => '')
    throw new Error(
      `Storage returned ${res.status}. ${hint || res.statusText} — In Supabase: create bucket "resumes" and policies so INSERT is allowed on path \`${userId}/%\` for authenticated users.`,
    )
  }

  const signedPromise = supabase.storage.from('resumes').createSignedUrl(path, 60 * 60 * 24 * 365)

  const { data: signedData, error: signedError } = await withTimeout(
    signedPromise,
    SIGNED_URL_TIMEOUT_MS,
    () =>
      new Error(
        `Signed link timed out after ${SIGNED_URL_TIMEOUT_MS / 1000}s. Ask your admin to enable SELECT on bucket "resumes" for authenticated users.`,
      ),
  )

  if (signedError || !signedData?.signedUrl) {
    throw new Error(
      signedError?.message ??
        'Upload finished but could not create a viewing link — check Storage SELECT policy.',
    )
  }

  return signedData.signedUrl
}
