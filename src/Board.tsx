import { Column } from './Column'
import { useBoard } from './useBoard'
import { useKeyboard } from './useKeyboard'

export function Board() {
  const [state, dispatch] = useBoard()
  useKeyboard(state, dispatch)

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <header className="mb-4 flex items-baseline gap-4">
        <h1 className="text-xl font-semibold">Vibello</h1>
        <p className="text-xs text-slate-400">
          Arrows select. Hold Shift + arrows to move. Enter toggles edit. Delete removes.
        </p>
      </header>
      <div className="flex gap-4">
        {state.columns.map((column, i) => (
          <Column
            key={column.id}
            column={column}
            index={i}
            selection={state.selection}
            mode={state.mode}
            dispatch={dispatch}
          />
        ))}
      </div>
    </div>
  )
}
