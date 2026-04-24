import type { Mode } from './types'
import type { BoardDispatch } from './useBoard'
import { outlineFor } from './selection'

type Props = {
  selected: boolean
  mode: Mode
  dispatch: BoardDispatch
}

export function ColumnAdd({ selected, mode, dispatch }: Props) {
  const outline = outlineFor(selected, mode)
  return (
    <button
      type="button"
      data-testid="add-column"
      onClick={() => dispatch({ type: 'addColumn' })}
      className={`w-72 flex-shrink-0 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:text-slate-100 hover:border-slate-400 text-sm py-2 ${outline}`}
    >
      + Add column
    </button>
  )
}
