import type { BoardState, Column } from './types'

const KEY = 'vibello:board:v1'

export const uid = () => crypto.randomUUID()

const defaultColumns = (): Column[] => [
  { id: uid(), title: 'To Do', cards: [{ id: uid(), text: 'Welcome — press Enter to edit' }] },
  { id: uid(), title: 'Doing', cards: [] },
  { id: uid(), title: 'Done', cards: [] },
]

export const defaultState = (): BoardState => ({
  columns: defaultColumns(),
  target: 'cards',
  cardSelection: { col: 0, row: 0 },
  columnSelection: 0,
  mode: 'idle',
})

type LegacyState = {
  columns?: unknown
  selection?: unknown
  cardSelection?: unknown
  columnSelection?: unknown
  target?: unknown
}

export function loadBoard(): BoardState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as LegacyState
    if (!Array.isArray(parsed.columns)) return defaultState()
    const columns = parsed.columns as Column[]
    const cardSelection =
      (parsed.cardSelection as BoardState['cardSelection']) ??
      (parsed.selection as BoardState['cardSelection']) ??
      null
    const columnSelection =
      typeof parsed.columnSelection === 'number' ? parsed.columnSelection : 0
    const target: BoardState['target'] = parsed.target === 'columns' ? 'columns' : 'cards'
    return { columns, cardSelection, columnSelection, target, mode: 'idle' }
  } catch {
    return defaultState()
  }
}

export function saveBoard(state: BoardState) {
  const { columns, target, cardSelection, columnSelection } = state
  localStorage.setItem(KEY, JSON.stringify({ columns, target, cardSelection, columnSelection }))
}
