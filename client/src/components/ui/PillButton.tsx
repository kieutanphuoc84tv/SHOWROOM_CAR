import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

type PillButtonProps = {
  to?: string
  href?: string
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit'
  onClick?: () => void
}

export function PillButton({ to, href, children, className, type = 'button', onClick }: PillButtonProps) {
  const inner = (
    <>
      <span>{children}</span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black">
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </span>
    </>
  )

  const classes = cn(
    'inline-flex items-center gap-3 rounded-full bg-black pl-5 pr-1.5 py-1.5',
    'text-[13px] font-medium text-white',
    'transition-transform duration-200 hover:scale-[0.98] active:scale-[0.96]',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black',
    className
  )

  if (to) {
    return (
      <Link to={to} className={classes}>
        {inner}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes}>
        {inner}
      </a>
    )
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {inner}
    </button>
  )
}

export function SearchPill({ placeholder }: { placeholder: string }) {
  return (
    <div className="flex items-center rounded-full bg-white p-1.5 pl-5 shadow-sm border border-black/5 min-w-[200px] md:min-w-[260px]">
      <input
        type="search"
        placeholder={placeholder}
        className="flex-1 bg-transparent text-[13px] text-black placeholder:text-neutral-400 outline-none min-w-0"
        aria-label={placeholder}
      />
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        aria-label="Search"
      >
        <Search className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  )
}

export function StatFloatCard({
  icon: Icon,
  value,
  label,
  className,
  noFloat,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  value: string
  label: string
  className?: string
  noFloat?: boolean
}) {
  return (
    <div
      {...(!noFloat && { 'data-float': true })}
      className={cn(
        'flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-md border border-black/5',
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
        <Icon className="h-5 w-5 text-black" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-black leading-tight">{value}</p>
        <p className="text-[11px] text-neutral-500 leading-tight">{label}</p>
      </div>
    </div>
  )
}
