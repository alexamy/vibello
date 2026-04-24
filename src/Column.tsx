import { useEffect, useRef } from 'react'
import type {
  CardSelection,
  Column as ColumnType,
  ColumnSelection,
  Mode,
  Target,
} from './types'
import type { BoardDispatch } from './useBoard'
import { Card } from './Card'
import { outlineFor } from './selection'

type Props = {
  column: ColumnType
  index: number
  target: Target
  cardSelection: CardSelection
  columnSelection: ColumnSelection
  mode: Mode
  dispatch: BoardDispatch
}

export function Column({
  column,
  index,
  target,
  cardSelection,
  columnSelection,
  mode,
  dispatch,
}: Props) {
  const headerInputRef = useRef<HTMLInputElement>(null)

  const selfSelected = target === 'columns' && columnSelection === index
  const editingHeader = selfSelected && mode === 'edit'
  const columnOutline = outlineFor(selfSelected, mode)
  const bg =
    selfSelected && mode === 'grab' ? 'bg-emerald-700' : 'bg-slate-800'

  useEffect(() => {
    if (editingHeader) headerInputRef.current?.focus()
  }, [editingHeader])

  const addSelected =
    target === 'cards' &&
    cardSelection?.col === index &&
    cardSelection?.row === column.cards.length
  const addOutline = outlineFor(addSelected, mode)

  return (
    <div
      data-testid={`column-${index}`}
      className={`w-72 flex-shrink-0 ${bg} rounded-lg p-3 flex flex-col gap-2 ${columnOutline}`}
    >
      {editingHeader ? (
        <input
          ref={headerInputRef}
          data-testid={`column-title-${index}`}
          value={column.title}
          onChange={(e) => dispatch({ type: 'setText', text: e.target.value })}
          className="bg-slate-700 text-slate-100 font-medium text-sm uppercase tracking-wide px-2 py-1 rounded outline outline-2 outline-amber-400"
        />
      ) : (
        <h2
          data-testid={`column-title-${index}`}
          className="text-slate-200 font-medium text-sm uppercase tracking-wide px-1 min-h-[1.5rem]"
        >
          {column.title || <span className="italic text-slate-500">untitled</span>}
        </h2>
      )}
      <div className="flex flex-col gap-2">
        {column.cards.map((card, row) => (
          <Card
            key={card.id}
            card={card}
            col={index}
            row={row}
            selected={
              target === 'cards' && cardSelection?.col === index && cardSelection?.row === row
            }
            mode={mode}
            dispatch={dispatch}
          />
        ))}
      </div>
      {target === 'cards' && (
        <button
          type="button"
          data-testid={`add-card-${index}`}
          onClick={() => dispatch({ type: 'addCard', col: index })}
          className={`mt-auto rounded-md border border-dashed border-slate-600 text-slate-400 hover:text-slate-100 hover:border-slate-400 py-1.5 text-sm ${addOutline}`}
        >
          + Add card
        </button>
      )}
    </div>
  )
}
