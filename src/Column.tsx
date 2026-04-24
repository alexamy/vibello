import type { Column as ColumnType, Mode, Selection } from './types'
import type { BoardDispatch } from './useBoard'
import { Card } from './Card'

type Props = {
  column: ColumnType
  index: number
  selection: Selection
  mode: Mode
  dispatch: BoardDispatch
}

export function Column({ column, index, selection, mode, dispatch }: Props) {
  return (
    <div className="w-72 flex-shrink-0 bg-slate-800 rounded-lg p-3 flex flex-col gap-2">
      <h2 className="text-slate-200 font-medium text-sm uppercase tracking-wide px-1">
        {column.title}
      </h2>
      <div className="flex flex-col gap-2">
        {column.cards.map((card, row) => (
          <Card
            key={card.id}
            card={card}
            selected={selection?.col === index && selection?.row === row}
            mode={mode}
            dispatch={dispatch}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => dispatch({ type: 'addCard', col: index })}
        className="mt-auto rounded-md border border-dashed border-slate-600 text-slate-400 hover:text-slate-100 hover:border-slate-400 py-1.5 text-sm"
      >
        + Add card
      </button>
    </div>
  )
}
