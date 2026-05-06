import { Suspense } from 'react'
import { SignupForm } from '@/components/auth/SignupForm'
import { AuthAmbient } from '@/components/auth/AuthAmbient'

export default function SignupPage() {
  return (
    <AuthAmbient>
      <main className="min-h-screen px-4 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-xl">
          <Suspense
            fallback={
              <div className="min-h-[28rem] animate-pulse rounded-3xl bg-white/40 shadow-[0_24px_80px_-20px_rgba(79,70,229,0.15)] ring-1 ring-white/60 backdrop-blur-md" />
            }
          >
            <SignupForm />
          </Suspense>
        </div>
      </main>
    </AuthAmbient>
  )
}
