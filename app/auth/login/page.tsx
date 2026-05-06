import { LoginForm } from '@/components/auth/LoginForm'
import { AuthAmbient } from '@/components/auth/AuthAmbient'

export default function LoginPage() {
  return (
    <AuthAmbient>
      <main className="min-h-screen px-4 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-md">
          <LoginForm />
        </div>
      </main>
    </AuthAmbient>
  )
}
