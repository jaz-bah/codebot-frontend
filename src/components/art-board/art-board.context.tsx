"use client"

import * as React from "react"

import type { ArtBoardTool } from "./art-board.types"

export interface ArtBoardContextValue {
  /** Active tool (controlled/uncontrolled). */
  tool: ArtBoardTool
  /** Switches the tool (cancels in-flight work). */
  setTool: (tool: ArtBoardTool) => void
  /** True when the board has no committed elements. */
  empty: boolean
  /** True when at least one element can be undone. */
  canUndo: boolean
  /** Whether content can be drawn (false for readOnly/disabled). */
  editable: boolean
  /** Removes the last committed element. */
  undo: () => void
  /** Removes every element. */
  clear: () => void
}

const ArtBoardContext = React.createContext<ArtBoardContextValue | null>(null)

export function ArtBoardProvider({
  value,
  children,
}: {
  value: ArtBoardContextValue
  children: React.ReactNode
}) {
  return (
    <ArtBoardContext.Provider value={value}>
      {children}
    </ArtBoardContext.Provider>
  )
}

/**
 * Access the board's headless state inside compound parts (e.g. a custom
 * toolbar rendered as a child of `<ArtBoard>`).
 */
export function useArtBoardContext() {
  const context = React.useContext(ArtBoardContext)
  if (!context) {
    throw new Error("useArtBoardContext must be used inside <ArtBoard>.")
  }
  return context
}
