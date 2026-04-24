import { useEffect } from 'react'
import type { BoardState } from './types'
import type { BoardDispatch } from './useBoard'

export function useKeyboard(state: BoardState, dispatch: BoardDispatch) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (state.mode === 'edit') {
        if (e.key === 'Enter') {
          e.preventDefault()
          dispatch({ type: 'setMode', mode: 'idle' })
        }
        return
      }

      if (e.key === 'Shift') {
        if (state.mode === 'idle' && state.selection) {
          dispatch({ type: 'setMode', mode: 'grab' })
        }
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
            dispatch({ type: 'moveCard', dx, dy })
          } else {
            dispatch({ type: 'moveSelection', dx, dy })
          }
          return
        }
        case 'Enter': {
          if (state.selection && state.mode === 'idle') {
            e.preventDefault()
            dispatch({ type: 'setMode', mode: 'edit' })
          }
          return
        }
        case 'Delete':
        case 'Backspace': {
          if (state.selection) {
            e.preventDefault()
            dispatch({ type: 'deleteCard' })
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
