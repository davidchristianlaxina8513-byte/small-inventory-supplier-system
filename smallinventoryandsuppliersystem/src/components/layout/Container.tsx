import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-ui="container" className={cn('mx-auto w-full max-w-5xl px-6 lg:px-8', className)} {...props} />
}
