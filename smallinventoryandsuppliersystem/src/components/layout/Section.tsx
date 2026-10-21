import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type SectionProps = HTMLAttributes<HTMLElement> & { ui?: string }

export function Section({ className, ui = 'section', ...props }: SectionProps) {
  return <section data-ui={ui} className={cn('py-16 sm:py-24', className)} {...props} />
}
