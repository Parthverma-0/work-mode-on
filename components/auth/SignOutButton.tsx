'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SignOutButtonProps = {
  variant?: React.ComponentProps<typeof Button>['variant']
  size?: React.ComponentProps<typeof Button>['size']
  className?: string
  /** Sidebar-style row button */
  layout?: 'button' | 'nav-row' | 'text-link'
  label?: string
}

export function SignOutButton({
  variant = 'outline',
  size,
  className,
  layout = 'button',
  label = 'Sign out',
}: SignOutButtonProps) {
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function confirm() {
    setBusy(true)
    try {
      await signOut()
    } finally {
      setBusy(false)
      setOpen(false)
    }
  }

  if (layout === 'text-link') {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className={cn('font-medium text-[#4F46E5] hover:underline disabled:opacity-50', className)}
          >
            {label}
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg" disabled={busy}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-[#EF4444] hover:bg-red-600"
              disabled={busy}
              onClick={(e) => {
                e.preventDefault()
                confirm()
              }}
            >
              {busy ? 'Signing out…' : 'Sign out'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  if (layout === 'nav-row') {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#6B7280] transition-colors hover:bg-white hover:text-[#EF4444]',
              className,
            )}
          >
            <LogOut className="size-[18px] shrink-0" aria-hidden />
            {label}
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll need to sign in again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg" disabled={busy}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-[#EF4444] hover:bg-red-600"
              disabled={busy}
              onClick={(e) => {
                e.preventDefault()
                confirm()
              }}
            >
              {busy ? 'Signing out…' : 'Sign out'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant={variant} size={size} className={cn('rounded-lg', className)}>
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out?</AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;ll need to sign in again to access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-lg" disabled={busy}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-lg bg-[#EF4444] hover:bg-red-600"
            disabled={busy}
            onClick={(e) => {
              e.preventDefault()
              confirm()
            }}
          >
            {busy ? 'Signing out…' : 'Sign out'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
