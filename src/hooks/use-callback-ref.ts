"use client"

import * as React from "react"

/**
 * Returns a stable function that always calls the latest `callback`.
 * Lets consumers pass inline callbacks without re-triggering effects.
 */
export function useCallbackRef<T extends (...args: never[]) => unknown>(
  callback: T | undefined
): T {
  const callbackRef = React.useRef(callback)

  React.useEffect(() => {
    callbackRef.current = callback
  })

  return React.useMemo(
    () => ((...args) => callbackRef.current?.(...args)) as T,
    []
  )
}
