export type CardColor = 'none' | 'red' | 'amber' | 'emerald' | 'sky' | 'violet'
export type Card = { id: string; text: string; color?: CardColor }
export type Column = { id: string; title: string; cards: Card[] }
export type Target = 'cards' | 'columns'
export type CardSelection = { col: number; row: number } | null
export type ColumnSelection = number | null
export type Mode = 'idle' | 'grab' | 'edit' | 'confirmDelete'
export type BoardState = {
  columns: Column[]
  target: Target
  cardSelection: CardSelection
  columnSelection: ColumnSelection
  mode: Mode
}
