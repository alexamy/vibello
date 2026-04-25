import { Column } from './Column'
import { ColumnAdd } from './ColumnAdd'
import { useBoard } from './useBoard'
import { useKeyboard } from './useKeyboard'

export function Board() {
  const [state, dispatch] = useBoard()
  useKeyboard(state, dispatch)

  const columnAddSelected =
    state.target === 'columns' && state.columnSelection === state.columns.length

  return (
    <div data-testid="board" className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <header className="mb-4 flex items-center gap-4 flex-wrap">
        <h1 className="text-xl font-semibold">
          <a
            href="https://github.com/alexamy/vibello"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sky-400"
          >
            Vibello
          </a>
        </h1>
        <span data-testid="mode-chip" className="text-xs rounded px-2 py-1 bg-slate-800 text-slate-300">
          Mode: <span className="text-sky-400 font-semibold">{state.target}</span>{' '}
          <span className="text-slate-500">(M to toggle)</span>
        </span>
        <p className="text-xs text-slate-400">
          Arrows select. Shift+arrows move. Enter edits (Shift+Enter / Esc exits). Space adds. C tags. Delete×2 removes. <strong className="font-semibold">Tab navigation not supported yet.</strong>
        </p>
      </header>
      <div className="flex gap-4 items-start">
        {state.columns.map((column, i) => (
          <Column
            key={column.id}
            column={column}
            index={i}
            target={state.target}
            cardSelection={state.cardSelection}
            columnSelection={state.columnSelection}
            mode={state.mode}
            dispatch={dispatch}
          />
        ))}
        {state.target === 'columns' && (
          <ColumnAdd selected={columnAddSelected} mode={state.mode} dispatch={dispatch} />
        )}
      </div>
    </div>
  )
}
