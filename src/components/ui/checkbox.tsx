import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {}

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, ...props }, ref) => {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={
        "peer h-5 w-5 shrink-0 rounded border border-gray-400 " +
        "focus:outline-none focus:ring-2 focus:ring-offset-2 " +
        "data-[state=checked]:bg-black data-[state=checked]:text-white " +
        (className ?? "")
      }
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center">
        {/* petit check visuel */}
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
          <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = "Checkbox"
