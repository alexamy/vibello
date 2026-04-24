export type Card = { id: string; text: string }
export type Column = { id: string; title: string; cards: Card[] }
export type Selection = { col: number; row: number } | null
export type Mode = 'idle' | 'grab' | 'edit' | 'confirmDelete'
export type BoardState = {
  columns: Column[]
  selection: Selection
  mode: Mode
}
