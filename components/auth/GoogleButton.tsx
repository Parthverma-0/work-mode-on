'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'

type GoogleButtonProps = {
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  children?: React.ReactNode
}

export function GoogleButton({
  onClick,
  loading = false,
  disabled = false,
  children = 'Continue with Google',
}: GoogleButtonProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { scale: 1.01 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      className="w-full"
    >
      <Button
        type="button"
        className="h-12 w-full rounded-xl border border-black/[0.06] bg-[#0A0A0A] text-[15px] font-semibold text-white shadow-md shadow-black/10 transition-colors hover:bg-[#141414]"
        onClick={onClick}
        disabled={disabled || loading}
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.7-4.1 9.7-9.9 0-.7-.1-1.3-.2-1.9z"
          />
          <path
            fill="#34A853"
            d="M3.2 7.3 6.4 9.7C7.3 7.2 9.5 5.5 12 5.5c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2 12 2 8.2 2 4.9 4.2 3.2 7.3z"
          />
          <path
            fill="#FBBC05"
            d="M12 22c2.6 0 4.8-.8 6.4-2.3l-3-2.4c-.8.6-1.9 1-3.4 1-3.3 0-6.1-2.2-7.1-5.2l-3.1 2.4C3.5 19.2 7.4 22 12 22z"
          />
          <path
            fill="#4285F4"
            d="M21.7 12.1c0-.7-.1-1.3-.2-1.9H12v3.9h5.5c-.3 1.5-1.2 2.7-2.4 3.5l3 2.4c1.7-1.6 2.6-4.1 2.6-7.9z"
          />
        </svg>
        {loading ? 'Redirecting…' : children}
      </Button>
    </motion.div>
  )
}
