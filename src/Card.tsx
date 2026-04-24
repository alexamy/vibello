import { useEffect, useRef } from 'react'
import type { Card as CardType, Mode } from './types'
import type { BoardDispatch } from './useBoard'

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
  const outline = selected && mode !== 'grab' ? 'outline outline-2 outline-sky-400' : ''

  if (editing) {
    return (
      <input
        ref={inputRef}
        className={`${base} ${bg} ${outline} w-full bg-slate-700 outline outline-2 outline-sky-400`}
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
