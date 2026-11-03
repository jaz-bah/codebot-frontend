"use client"

import * as React from "react"

import { useCallbackRef } from "@/hooks/use-callback-ref"

export interface UseControllableStateParams<T> {
  /** Controlled value. When defined, the hook never stores state itself. */
  prop?: T | undefined
  /** Initial value for uncontrolled usage. */
  defaultProp?: T | undefined
  /** Called with the next value whenever a change is requested. */
  onChange?: (value: T) => void
}

type SetStateFn<T> = (prevState?: T) => T

/**
 * Radix-style controlled/uncontrolled state.
 *
 * - If `prop` is defined the component is controlled: the value always mirrors
 *   `prop` and `onChange` is called on every change request.
 * - Otherwise the hook owns the value, seeded from `defaultProp`, and still
 *   calls `onChange` so consumers can observe changes.
 *
 * Every stateful prop in `src/components/**` must go through this hook
 * (ARCHITECTURE.md ADR-002).
 */
export function useControllableState<T>({
  prop,
  defaultProp,
  onChange = () => {},
}: UseControllableStateParams<T>) {
  const [uncontrolledProp, setUncontrolledProp] = useUncontrolledState({
    defaultProp,
    onChange,
  })
  const isControlled = prop !== undefined
  const value = isControlled ? prop : uncontrolledProp
  const handleChange = useCallbackRef(onChange)

  const setValue: React.Dispatch<React.SetStateAction<T | undefined>> =
    React.useCallback(
      (nextValue) => {
        if (isControlled) {
          const setter = nextValue as SetStateFn<T>
          const resolved =
            typeof nextValue === "function" ? setter(prop) : nextValue
          if (resolved !== prop) handleChange(resolved as T)
        } else {
          setUncontrolledProp(nextValue)
        }
      },
      [isControlled, prop, setUncontrolledProp, handleChange]
    )

  return [value, setValue] as const
}

function useUncontrolledState<T>({
  defaultProp,
  onChange,
}: Omit<UseControllableStateParams<T>, "prop">) {
  const uncontrolledState = React.useState<T | undefined>(defaultProp)
  const [value] = uncontrolledState
  const prevValueRef = React.useRef(value)
  const handleChange = useCallbackRef(onChange)

  React.useEffect(() => {
    if (prevValueRef.current !== value) {
      handleChange(value as T)
      prevValueRef.current = value
    }
  }, [value, handleChange])

  return uncontrolledState
}
