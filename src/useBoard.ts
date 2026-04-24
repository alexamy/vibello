import { useEffect, useReducer } from 'react'
import type {
  BoardState,
  CardSelection,
  Column,
  ColumnSelection,
  Mode,
  Target,
} from './types'
import { loadBoard, saveBoard, uid } from './storage'

type Action =
  | { type: 'setMode'; mode: Mode }
  | { type: 'setTarget'; target: Target }
  | { type: 'moveSelection'; dx: number; dy: number }
  | { type: 'moveItem'; dx: number; dy: number }
  | { type: 'addCard'; col: number }
  | { type: 'addColumn' }
  | { type: 'deleteItem' }
  | { type: 'setText'; text: string }
  | { type: 'selectCard'; selection: CardSelection }
  | { type: 'selectColumn'; selection: ColumnSelection }

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

export const isCardRow = (state: BoardState, sel: NonNullable<CardSelection>) =>
  sel.row < state.columns[sel.col].cards.length

export const isColumnRow = (state: BoardState) =>
  state.columnSelection !== null && state.columnSelection < state.columns.length

export const hasItemSelection = (state: BoardState): boolean => {
  if (state.target === 'cards') return !!state.cardSelection && isCardRow(state, state.cardSelection)
  return isColumnRow(state)
}

const updateColumnCards = (
  columns: Column[],
  col: number,
  fn: (cards: Column['cards']) => Column['cards'],
): Column[] => columns.map((c, i) => (i === col ? { ...c, cards: fn(c.cards) } : c))

function reducer(state: BoardState, action: Action): BoardState {
  const next = step(state, action)
  const keepsArm =
    (action.type === 'setMode' && action.mode === 'confirmDelete') ||
    action.type === 'deleteItem'
  if (!keepsArm && next.mode === 'confirmDelete') {
    return { ...next, mode: 'idle' }
  }
  return next
}

function step(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case 'setMode': {
      const needsItem =
        action.mode === 'edit' || action.mode === 'grab' || action.mode === 'confirmDelete'
      if (needsItem && !hasItemSelection(state)) return state
      if (state.mode === action.mode) return state
      return { ...state, mode: action.mode }
    }
    case 'setTarget': {
      if (state.target === action.target) return state
      return { ...state, target: action.target, mode: 'idle' }
    }
    case 'selectCard':
      return { ...state, cardSelection: action.selection }
    case 'selectColumn':
      return { ...state, columnSelection: action.selection }

    case 'moveSelection': {
      if (state.target === 'columns') {
        if (action.dx === 0) return state
        const cur = state.columnSelection ?? 0
        const next = clamp(cur + action.dx, 0, state.columns.length)
        if (next === cur) return state
        return { ...state, columnSelection: next }
      }
      const sel = state.cardSelection ?? { col: 0, row: state.columns[0]?.cards.length ?? 0 }
      const { col, row } = sel
      if (action.dy !== 0) {
        const nextRow = clamp(row + action.dy, 0, state.columns[col].cards.length)
        if (nextRow === row && state.cardSelection) return state
        return { ...state, cardSelection: { col, row: nextRow } }
      }
      if (action.dx !== 0) {
        const dir = action.dx > 0 ? 1 : -1
        const target = col + dir
        if (target < 0 || target >= state.columns.length) return state
        const nextRow = clamp(row, 0, state.columns[target].cards.length)
        return { ...state, cardSelection: { col: target, row: nextRow } }
      }
      return state
    }

    case 'moveItem': {
      if (state.target === 'columns') {
        if (action.dx === 0 || !isColumnRow(state)) return state
        const from = state.columnSelection!
        const to = from + (action.dx > 0 ? 1 : -1)
        if (to < 0 || to >= state.columns.length) return state
        const columns = [...state.columns]
        ;[columns[from], columns[to]] = [columns[to], columns[from]]
        return { ...state, columns, columnSelection: to }
      }
      if (!state.cardSelection || !isCardRow(state, state.cardSelection)) return state
      const { col, row } = state.cardSelection

      if (action.dy !== 0) {
        const nextRow = row + action.dy
        if (nextRow < 0 || nextRow >= state.columns[col].cards.length) return state
        const columns = updateColumnCards(state.columns, col, (cards) => {
          const next = [...cards]
          ;[next[row], next[nextRow]] = [next[nextRow], next[row]]
          return next
        })
        return { ...state, columns, cardSelection: { col, row: nextRow } }
      }
      if (action.dx !== 0) {
        const dir = action.dx > 0 ? 1 : -1
        const targetCol = col + dir
        if (targetCol < 0 || targetCol >= state.columns.length) return state
        const card = state.columns[col].cards[row]
        const insertAt = clamp(row, 0, state.columns[targetCol].cards.length)
        let columns = updateColumnCards(state.columns, col, (cards) =>
          cards.filter((_, j) => j !== row),
        )
        columns = updateColumnCards(columns, targetCol, (cards) => {
          const next = [...cards]
          next.splice(insertAt, 0, card)
          return next
        })
        return { ...state, columns, cardSelection: { col: targetCol, row: insertAt } }
      }
      return state
    }

    case 'addCard': {
      const columns = updateColumnCards(state.columns, action.col, (cards) => [
        ...cards,
        { id: uid(), text: '' },
      ])
      const row = columns[action.col].cards.length - 1
      return {
        ...state,
        columns,
        target: 'cards',
        cardSelection: { col: action.col, row },
        mode: 'edit',
      }
    }
    case 'addColumn': {
      const columns = [...state.columns, { id: uid(), title: '', cards: [] }]
      return {
        ...state,
        columns,
        target: 'columns',
        columnSelection: columns.length - 1,
        mode: 'edit',
      }
    }
    case 'deleteItem': {
      if (state.target === 'columns') {
        if (!isColumnRow(state)) return state
        const idx = state.columnSelection!
        const columns = state.columns.filter((_, i) => i !== idx)
        const columnSelection = clamp(idx, 0, columns.length)
        return { ...state, columns, columnSelection, mode: 'idle' }
      }
      if (!state.cardSelection || !isCardRow(state, state.cardSelection)) return state
      const { col, row } = state.cardSelection
      const columns = updateColumnCards(state.columns, col, (cards) =>
        cards.filter((_, j) => j !== row),
      )
      const nextRow = clamp(row, 0, columns[col].cards.length)
      return { ...state, columns, cardSelection: { col, row: nextRow }, mode: 'idle' }
    }
    case 'setText': {
      if (state.target === 'columns') {
        if (!isColumnRow(state)) return state
        const idx = state.columnSelection!
        const columns = state.columns.map((c, i) => (i === idx ? { ...c, title: action.text } : c))
        return { ...state, columns }
      }
      if (!state.cardSelection || !isCardRow(state, state.cardSelection)) return state
      const { col, row } = state.cardSelection
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
