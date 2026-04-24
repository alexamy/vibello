# Vibello

A minimal, keyboard-first Trello-like board. Two layers — cards and columns — share the same interaction model: arrows select, Shift+arrows move, Enter edits, Delete×2 removes. State persists in `localStorage`.

Built with React 19, TypeScript, and Tailwind v4.

## Run

```bash
pnpm install
pnpm dev      # vite dev server
pnpm build    # type-check + production build
pnpm preview  # serve dist/
```

## Keyboard

| Key                | In `cards` target                    | In `columns` target               |
| ------------------ | ------------------------------------ | --------------------------------- |
| `M`                | switch to `columns`                  | switch to `cards`                 |
| `←` `→`            | move selection between columns       | move selection between columns    |
| `↑` `↓`            | move selection within column         | (no-op)                           |
| `Shift` + arrows   | reorder card (within / across cols)  | reorder column                    |
| `Enter`            | edit card text / activate `+` button | edit column title / `+` button    |
| `Esc` / `Enter`    | exit edit mode                       | exit edit mode                    |
| `Space`            | activate `+ Add card` button         | activate `+ Add column` button    |
| `Delete` (×2)      | first arms (red outline), second deletes | same                          |

The selection cursor lands on the trailing `+` slot when you arrow past the last item; press Enter or Space there to add.

### Visual states

- **Sky outline** — selected (idle)
- **Amber outline** — editing
- **Red outline** — armed for delete (press Delete again to confirm)
- **Emerald fill** — held while reordering (Shift)

The mode chip in the header shows the active target.

## Project layout

```
src/
  Board.tsx       top-level layout
  Column.tsx      column with header + cards + add-card button
  Card.tsx        card render (text or input in edit mode)
  ColumnAdd.tsx   trailing "+ Add column" button
  useBoard.ts     reducer, action types, target-aware logic
  useKeyboard.ts  global window keydown/keyup → actions
  selection.ts    outlineFor() helper + outline color map
  storage.ts      localStorage load/save with legacy migration
  types.ts        BoardState, Card, Column, Mode, Target
```

The reducer is **target-aware**: actions like `moveSelection`, `moveItem`, `setText`, `deleteItem` branch on `state.target` rather than being duplicated. Selection per layer (`cardSelection`, `columnSelection`) is preserved across `M` toggles.
