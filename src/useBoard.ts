import { useEffect, useReducer } from 'react'
import type { BoardState, Card, Column, Selection } from './types'
import { loadBoard, saveBoard, uid } from './storage'

type Action =
  | { type: 'setMode'; mode: BoardState['mode'] }
  | { type: 'moveSelection'; dx: number; dy: number }
  | { type: 'moveCard'; dx: number; dy: number }
  | { type: 'addCard'; col: number }
  | { type: 'deleteCard' }
  | { type: 'setText'; text: string }
  | { type: 'select'; selection: Selection }

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

export const isCardRow = (state: BoardState, sel: NonNullable<Selection>) =>
  sel.row < state.columns[sel.col].cards.length

const updateColumnCards = (
  columns: Column[],
  col: number,
  fn: (cards: Card[]) => Card[],
): Column[] => columns.map((c, i) => (i === col ? { ...c, cards: fn(c.cards) } : c))

const sameSelection = (a: Selection, b: Selection) =>
  a === b || (!!a && !!b && a.col === b.col && a.row === b.row)

function reducer(state: BoardState, action: Action): BoardState {
  const next = step(state, action)
  const keepsArm =
    (action.type === 'setMode' && action.mode === 'confirmDelete') ||
    action.type === 'deleteCard'
  if (!keepsArm && next.mode === 'confirmDelete') {
    return { ...next, mode: 'idle' }
  }
  return next
}

function step(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case 'setMode': {
      const needsCard =
        action.mode === 'edit' || action.mode === 'grab' || action.mode === 'confirmDelete'
      if (needsCard && (!state.selection || !isCardRow(state, state.selection))) {
        return state
      }
      if (state.mode === action.mode) return state
      return { ...state, mode: action.mode }
    }
    case 'select':
      if (sameSelection(state.selection, action.selection)) return state
      return { ...state, selection: action.selection }
    case 'moveSelection': {
      const sel = state.selection ?? { col: 0, row: state.columns[0].cards.length }
      const { col, row } = sel
      if (action.dy !== 0) {
        const nextRow = clamp(row + action.dy, 0, state.columns[col].cards.length)
        if (nextRow === row && state.selection) return state
        return { ...state, selection: { col, row: nextRow } }
      }
      if (action.dx !== 0) {
        const dir = action.dx > 0 ? 1 : -1
        const target = col + dir
        if (target < 0 || target >= state.columns.length) return state
        const nextRow = clamp(row, 0, state.columns[target].cards.length)
        return { ...state, selection: { col: target, row: nextRow } }
      }
      return state
    }
    case 'moveCard': {
      if (!state.selection || !isCardRow(state, state.selection)) return state
      const { col, row } = state.selection

      if (action.dy !== 0) {
        const nextRow = row + action.dy
        if (nextRow < 0 || nextRow >= state.columns[col].cards.length) return state
        const columns = updateColumnCards(state.columns, col, (cards) => {
          const next = [...cards]
          ;[next[row], next[nextRow]] = [next[nextRow], next[row]]
          return next
        })
        return { ...state, columns, selection: { col, row: nextRow } }
      }
      if (action.dx !== 0) {
        const dir = action.dx > 0 ? 1 : -1
        const target = col + dir
        if (target < 0 || target >= state.columns.length) return state
        const card = state.columns[col].cards[row]
        const insertAt = clamp(row, 0, state.columns[target].cards.length)
        let columns = updateColumnCards(state.columns, col, (cards) =>
          cards.filter((_, j) => j !== row),
        )
        columns = updateColumnCards(columns, target, (cards) => {
          const next = [...cards]
          next.splice(insertAt, 0, card)
          return next
        })
        return { ...state, columns, selection: { col: target, row: insertAt } }
      }
      return state
    }
    case 'addCard': {
      const columns = updateColumnCards(state.columns, action.col, (cards) => [
        ...cards,
        { id: uid(), text: '' },
      ])
      const row = columns[action.col].cards.length - 1
      return { ...state, columns, selection: { col: action.col, row }, mode: 'edit' }
    }
    case 'deleteCard': {
      if (!state.selection || !isCardRow(state, state.selection)) return state
      const { col, row } = state.selection
      const columns = updateColumnCards(state.columns, col, (cards) =>
        cards.filter((_, j) => j !== row),
      )
      const nextRow = clamp(row, 0, columns[col].cards.length)
      return { ...state, columns, selection: { col, row: nextRow }, mode: 'idle' }
    }
    case 'setText': {
      if (!state.selection || !isCardRow(state, state.selection)) return state
      const { col, row } = state.selection
      const columns = updateColumnCards(state.columns, col, (cards) =>
        cards.map((card, j) => (j === row ? { ...card, text: action.text } : card)),
      )
      return { ...state, columns }
    }
  }
}

export function useBoard() {
  const [state, dispatch] = useReducer(reducer, undefined, loadBoard)

  useEffect(() => {
    saveBoard(state)
  }, [state])

  return [state, dispatch] as const
}

export type BoardDispatch = ReturnType<typeof useBoard>[1]
