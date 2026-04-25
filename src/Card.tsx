import { useEffect, useRef } from 'react'
import type { Card as CardType, CardColor, Mode } from './types'
import type { BoardDispatch } from './useBoard'
import { outlineFor } from './selection'

type Props = {
  card: CardType
  col: number
  row: number
  selected: boolean
  mode: Mode
  dispatch: BoardDispatch
}

const COLOR_BORDER: Record<CardColor, string> = {
  none: '',
  red: 'border-l-4 border-red-500',
  amber: 'border-l-4 border-amber-400',
  emerald: 'border-l-4 border-emerald-400',
  sky: 'border-l-4 border-sky-400',
  violet: 'border-l-4 border-violet-400',
}

export function Card({ card, col, row, selected, mode, dispatch }: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const editing = selected && mode === 'edit'

  useEffect(() => {
    if (editing) {
      const el = inputRef.current
      if (!el) return
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    }
  }, [editing])

  const base = 'rounded-md p-2 text-sm break-words cursor-default select-none whitespace-pre-wrap'
  const bg =
    selected && mode === 'grab'
      ? 'bg-emerald-600 text-white'
      : 'bg-slate-700 text-slate-100'
  const outline = outlineFor(selected, mode)
  const colorBorder = COLOR_BORDER[card.color ?? 'none']
  const testId = `card-${col}-${row}`

  if (editing) {
    return (
      <textarea
        ref={inputRef}
        data-testid={testId}
        data-card-col={col}
        data-card-row={row}
        rows={Math.max(1, card.text.split('\n').length)}
        className={`${base} ${bg} ${outline} ${colorBorder} w-full resize-none font-sans`}
        value={card.text}
        onChange={(e) => dispatch({ type: 'setText', text: e.target.value })}
      />
    )
  }

  return (
    <div
      data-testid={testId}
      data-card-col={col}
      data-card-row={row}
      className={`${base} ${bg} ${outline} ${colorBorder} min-h-[2rem]`}
    >
      {card.text || <span className="text-slate-400 italic">empty</span>}
    </div>
  )
}
