import { useEffect } from 'react'
import type { BoardState } from './types'
import { hasItemSelection, isCardRow, isColumnRow, type BoardDispatch } from './useBoard'

export function useKeyboard(state: BoardState, dispatch: BoardDispatch) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (state.mode === 'edit') {
        if (e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault()
          dispatch({ type: 'setMode', mode: 'idle' })
        }
        return
      }

      if (e.key === 'Shift') {
        if (state.mode !== 'grab' && hasItemSelection(state)) {
          dispatch({ type: 'setMode', mode: 'grab' })
        }
        return
      }

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        dispatch({ type: 'setTarget', target: state.target === 'cards' ? 'columns' : 'cards' })
        return
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight': {
          e.preventDefault()
          const dx = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0
          const dy = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0
          if (state.mode === 'grab') {
            dispatch({ type: 'moveItem', dx, dy })
          } else {
            dispatch({ type: 'moveSelection', dx, dy })
          }
          return
        }
        case 'Enter': {
          if (state.mode !== 'idle') return
          e.preventDefault()
          if (state.target === 'columns') {
            if (isColumnRow(state)) dispatch({ type: 'setMode', mode: 'edit' })
            else dispatch({ type: 'addColumn' })
          } else {
            if (!state.cardSelection) return
            if (isCardRow(state, state.cardSelection)) {
              dispatch({ type: 'setMode', mode: 'edit' })
            } else {
              dispatch({ type: 'addCard', col: state.cardSelection.col })
            }
          }
          return
        }
        case ' ': {
          if (state.mode !== 'idle') return
          e.preventDefault()
          if (state.target === 'columns') {
            dispatch({ type: 'addColumn' })
          } else if (state.cardSelection) {
            dispatch({ type: 'addCard', col: state.cardSelection.col })
          }
          return
        }
        case 'Delete':
        case 'Backspace': {
          if (!hasItemSelection(state)) return
          e.preventDefault()
          if (state.mode === 'confirmDelete') {
            dispatch({ type: 'deleteItem' })
          } else {
            dispatch({ type: 'setMode', mode: 'confirmDelete' })
          }
          return
        }
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && state.mode === 'grab') {
        dispatch({ type: 'setMode', mode: 'idle' })
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [state, dispatch])
}
