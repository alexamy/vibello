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

const isCardRow = (state: BoardState, sel: NonNullable<Selection>) =>
  sel.row < state.columns[sel.col].cards.length

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
      return { ...state, mode: action.mode }
    }
    case 'select':
      return { ...state, selection: action.selection }
    case 'moveSelection': {
      const sel = state.selection ?? { col: 0, row: state.columns[0].cards.length }
      const { col, row } = sel
      if (action.dy !== 0) {
        const max = state.columns[col].cards.length
        const nextRow = clamp(row + action.dy, 0, max)
        return { ...state, selection: { col, row: nextRow } }
      }
      if (action.dx !== 0) {
        const dir = action.dx > 0 ? 1 : -1
        const target = col + dir
        if (target < 0 || target >= state.columns.length) return state
        const max = state.columns[target].cards.length
        const nextRow = clamp(row, 0, max)
        return { ...state, selection: { col: target, row: nextRow } }
      }
      return state
    }
    case 'moveCard': {
      if (!state.selection || !isCardRow(state, state.selection)) return state
      const { col, row } = state.selection
      const columns = state.columns.map((c) => ({ ...c, cards: [...c.cards] }))
      const card = columns[col].cards[row]

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
      if (!state.selection || !isCardRow(state, state.selection)) return state
      const { col, row } = state.selection
      const columns = state.columns.map((c, i) =>
        i === col ? { ...c, cards: c.cards.filter((_, j) => j !== row) } : c,
      )
      const nextRow = clamp(row, 0, columns[col].cards.length)
      return {
        ...state,
        columns,
        selection: { col, row: nextRow },
        mode: 'idle',
      }
    }
    case 'setText': {
      if (!state.selection || !isCardRow(state, state.selection)) return state
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
