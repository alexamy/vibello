import type { BoardState, Column } from './types'

const KEY = 'vibello:board:v1'

const uid = () => crypto.randomUUID()

const defaultColumns = (): Column[] => [
  { id: uid(), title: 'To Do', cards: [{ id: uid(), text: 'Welcome — press Enter to edit' }] },
  { id: uid(), title: 'Doing', cards: [] },
  { id: uid(), title: 'Done', cards: [] },
]

export const defaultState = (): BoardState => {
  const columns = defaultColumns()
  return { columns, selection: { col: 0, row: 0 }, mode: 'idle' }
}

export function loadBoard(): BoardState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<BoardState>
    if (!parsed.columns || !Array.isArray(parsed.columns)) return defaultState()
    return {
      columns: parsed.columns as Column[],
      selection: parsed.selection ?? null,
      mode: 'idle',
    }
  } catch {
    return defaultState()
  }
}

export function saveBoard(state: BoardState) {
  const { columns, selection } = state
  localStorage.setItem(KEY, JSON.stringify({ columns, selection }))
}
