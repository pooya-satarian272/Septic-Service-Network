"use client"

import * as React from "react"

/**
 * Minimal Slot component that renders its child with merged props.
 * Replaces Radix UI's Slot for use with asChild pattern.
 */
const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }>(
  ({ children, ...props }, ref) => {
    if (!React.isValidElement(children)) {
      return null
    }

    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      ...mergeProps(props, (children as React.ReactElement<Record<string, unknown>>).props),
      ref: ref
        ? composeRefs(ref, (children as React.ReactElement<{ ref?: React.Ref<unknown> }>).props.ref ?? null)
        : (children as React.ReactElement<{ ref?: React.Ref<unknown> }>).props.ref,
    })
  }
)
Slot.displayName = "Slot"

function mergeProps(slotProps: Record<string, unknown>, childProps: Record<string, unknown>) {
  const merged: Record<string, unknown> = { ...childProps }

  for (const propName in slotProps) {
    const slotVal = slotProps[propName]
    const childVal = childProps[propName]

    if (propName === "style") {
      merged[propName] = { ...(slotVal as object), ...(childVal as object) }
    } else if (propName === "className") {
      merged[propName] = [slotVal, childVal].filter(Boolean).join(" ")
    } else if (propName.startsWith("on") && typeof slotVal === "function") {
      if (typeof childVal === "function") {
        merged[propName] = (...args: unknown[]) => {
          ;(childVal as (...a: unknown[]) => void)(...args)
          ;(slotVal as (...a: unknown[]) => void)(...args)
        }
      } else {
        merged[propName] = slotVal
      }
    } else {
      merged[propName] = slotVal !== undefined ? slotVal : childVal
    }
  }

  return merged
}

function composeRefs<T>(...refs: (React.Ref<T> | null | undefined)[]): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value)
      } else if (ref && typeof ref === "object") {
        ;(ref as React.MutableRefObject<T | null>).current = value
      }
    })
  }
}

export { Slot }
