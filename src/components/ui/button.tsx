import * as React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline'
}

export function Button({ className = '', variant = 'default', ...props }: Props) {
  const base =
    'inline-flex items-center justify-center h-11 px-4 rounded-2xl text-sm font-medium transition border'
  const styles =
    variant === 'outline'
      ? 'bg-transparent border-gray-300 hover:bg-gray-100'
      : 'bg-gray-900 text-white border-transparent hover:opacity-90'
  return <button className={`${base} ${styles} ${className}`} {...props} />
}
