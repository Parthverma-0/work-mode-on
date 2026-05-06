import { supabase } from '@/lib/supabase'

/** Opens resume: DB may store a signed URL or a storage path under bucket `resumes`. */
export async function resolveResumeDownloadUrl(
  resumeUrl: string | null | undefined,
): Promise<{ url: string | null; error?: string }> {
  if (!resumeUrl?.trim()) return { url: null }
  const raw = resumeUrl.trim()
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return { url: raw }
  }
  const { data, error } = await supabase.storage.from('resumes').createSignedUrl(raw, 3600)
  if (error || !data?.signedUrl) {
    return { url: null, error: error?.message ?? 'Could not create resume link.' }
  }
  return { url: data.signedUrl }
}
