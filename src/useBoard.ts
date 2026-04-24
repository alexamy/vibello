import { useEffect, useReducer } from 'react'
import type { BoardState, Card, Selection } from './types'
import { loadBoard, saveBoard } from './storage'

const uid = () => crypto.randomUUID()

type Action =
  | { type: 'setMode'; mode: BoardState['mode'] }
  | { type: 'moveSelection'; dx: number; dy: number }
  | { type: 'moveCard'; dx: number; dy: number }
  | { type: 'addCard'; col: number }
  | { type: 'deleteCard' }
  | { type: 'setText'; text: string }
  | { type: 'select'; selection: Selection }

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

function findNonEmpty(cols: BoardState['columns'], start: number, dir: 1 | -1): number | null {
  for (let i = start; i >= 0 && i < cols.length; i += dir) {
    if (cols[i].cards.length > 0) return i
  }
  return null
}

function reducer(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case 'setMode': {
      if (action.mode === 'edit' && !state.selection) return state
      return { ...state, mode: action.mode }
    }
    case 'select':
      return { ...state, selection: action.selection }
    case 'moveSelection': {
      if (!state.selection) {
        const col = findNonEmpty(state.columns, 0, 1)
        if (col === null) return state
        return { ...state, selection: { col, row: 0 } }
      }
      const { col, row } = state.selection
      if (action.dy !== 0) {
        const cards = state.columns[col].cards
        const nextRow = clamp(row + action.dy, 0, cards.length - 1)
        return { ...state, selection: { col, row: nextRow } }
      }
      if (action.dx !== 0) {
        const dir = action.dx > 0 ? 1 : -1
        const target = findNonEmpty(state.columns, col + dir, dir)
        if (target === null) return state
        const cards = state.columns[target].cards
        const nextRow = clamp(row, 0, cards.length - 1)
        return { ...state, selection: { col: target, row: nextRow } }
      }
      return state
    }
    case 'moveCard': {
      if (!state.selection) return state
      const { col, row } = state.selection
      const columns = state.columns.map((c) => ({ ...c, cards: [...c.cards] }))
      const card = columns[col].cards[row]
      if (!card) return state

      if (action.dy !== 0) {
        const nextRow = row + action.dy
        if (nextRow < 0 || nextRow >= columns[col].cards.length) return state
        ;[columns[col].cards[row], columns[col].cards[nextRow]] = [
          columns[col].cards[nextRow],
          columns[col].cards[row],
        ]
        return { ...state, columns, selection: { col, row: nextRow } }
      }
      if (action.dx !== 0) {
        const dir = action.dx > 0 ? 1 : -1
        const target = col + dir
        if (target < 0 || target >= columns.length) return state
        columns[col].cards.splice(row, 1)
        const insertAt = clamp(row, 0, columns[target].cards.length)
        columns[target].cards.splice(insertAt, 0, card)
        return { ...state, columns, selection: { col: target, row: insertAt } }
      }
      return state
    }
    case 'addCard': {
      const columns = state.columns.map((c, i) =>
        i === action.col ? { ...c, cards: [...c.cards, { id: uid(), text: '' } as Card] } : c,
      )
      const row = columns[action.col].cards.length - 1
      return { ...state, columns, selection: { col: action.col, row }, mode: 'edit' }
    }
    case 'deleteCard': {
      if (!state.selection) return state
      const { col, row } = state.selection
      const columns = state.columns.map((c, i) =>
        i === col ? { ...c, cards: c.cards.filter((_, j) => j !== row) } : c,
      )
      const cards = columns[col].cards
      let selection: Selection = null
      if (cards.length > 0) {
        selection = { col, row: clamp(row, 0, cards.length - 1) }
      } else {
        const left = findNonEmpty(columns, col - 1, -1)
        const right = findNonEmpty(columns, col + 1, 1)
        const pick = right ?? left
        if (pick !== null) selection = { col: pick, row: 0 }
      }
      return { ...state, columns, selection, mode: 'idle' }
    }
    case 'setText': {
      if (!state.selection) return state
      const { col, row } = state.selection
      const columns = state.columns.map((c, i) =>
        i === col
          ? {
              ...c,
              cards: c.cards.map((card, j) => (j === row ? { ...card, text: action.text } : card)),
            }
          : c,
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
