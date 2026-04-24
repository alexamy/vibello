import { useEffect, useRef } from 'react'
import type { Card as CardType, Mode } from './types'
import type { BoardDispatch } from './useBoard'
import { outlineFor } from './selection'

type Props = {
  card: CardType
  selected: boolean
  mode: Mode
  dispatch: BoardDispatch
}

export function Card({ card, selected, mode, dispatch }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const editing = selected && mode === 'edit'

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const base = 'rounded-md p-2 text-sm break-words cursor-default select-none'
  const bg =
    selected && mode === 'grab'
      ? 'bg-emerald-600 text-white'
      : 'bg-slate-700 text-slate-100'
  const outline = outlineFor(selected, mode)

  if (editing) {
    return (
      <input
        ref={inputRef}
        className={`${base} ${bg} ${outline} w-full`}
        value={card.text}
        onChange={(e) => dispatch({ type: 'setText', text: e.target.value })}
      />
    )
  }

  return (
    <div className={`${base} ${bg} ${outline} min-h-[2rem]`}>
      {card.text || <span className="text-slate-400 italic">empty</span>}
    </div>
  )
}
