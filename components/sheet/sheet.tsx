import { ReactElement, useState } from "react";
import { useSheet } from "../../hooks/use-sheet";
import { SheetContext } from "../../hooks/use-cells";
import { SheetUpdateContext } from "../../hooks/use-update-cell";
import { Cell } from "../cell";
import { Identifier } from "../identifier";
import styles from "./sheet.module.css";

interface ISheetProps {
  // TODO: We should support an infinited number of rows. That can be handled with a "window" of rows that are rendered at a time.
  rowAmount: number;
  // TODO: We should support an infinited number of columns. That can be handled with a "window" of columns that are rendered at a time.
  columnAmount: number;
  title: string;
}

interface IRow {
  id: `row-${number | "identifier"}`;
  cells: ICell[];
}

interface ICell {
  id: `cell-${number | "identifier"}-${number}`;
  element: ReactElement<typeof Cell>;
}

const ASCII_CODE_A = 65;
const ENGLISH_ALPHABET = Array.from(Array(26)).map((_, index) =>
  String.fromCharCode(index + ASCII_CODE_A)
);

function getColumnIdentifier(column: number): string {
  const letter = ENGLISH_ALPHABET[column % ENGLISH_ALPHABET.length];
  const number = Math.floor(column / ENGLISH_ALPHABET.length);

  return `${letter}${number > 0 ? number : ""}`;
}

export function Sheet({
  title,
  rowAmount,
  columnAmount,
}: ISheetProps): ReactElement {
  const [activeCell, setActiveCell] = useState<
    { row: number; column: number } | undefined
  >(undefined);
  const { cells, updateCell, syncInfo } = useSheet(rowAmount, columnAmount);

  const isCellActive = (row: number, column: number) =>
    !!(activeCell && activeCell.row === row && activeCell.column === column);
  const onCellFocus = (row: number, column: number) =>
    setActiveCell({ row, column });
  const onCellBlur = () => setActiveCell(undefined);

  const rows: IRow[] = [];

  const identifierRow: IRow = {
    id: `row-identifier`,
    cells: [],
  };

  for (let i = 0; i < columnAmount; i++) {
    const cell: ICell = {
      id: `cell-identifier-${i}`,
      element: (
        <Identifier key={`cell-identifier-${i}`} scope="col">
          {getColumnIdentifier(i)}
        </Identifier>
      ),
    };

    identifierRow.cells.push(cell);
  }

  for (let i = 0; i < rowAmount; i++) {
    const row: IRow = {
      id: `row-${i}`,
      cells: [],
    };

    for (let j = 0; j < columnAmount; j++) {
      const cell: ICell = {
        id: `cell-${i}-${j}`,
        element: (
          <Cell
            key={`cell-${i}-${j}`}
            row={i}
            column={j}
            isActive={isCellActive(i, j)}
            onFocus={() => onCellFocus(i, j)}
            onBlur={onCellBlur}
          />
        ),
      };
      row.cells.push(cell);
    }

    rows.push(row);
  }

  return (
    <SheetContext.Provider value={cells}>
      <SheetUpdateContext.Provider value={updateCell}>
        <h1 className={styles.title}>{title}</h1>
        <table className={styles.sheet}>
          <tbody>
            <tr
              key={identifierRow.id}
              className={`${styles.row} ${styles.identifier}`}
            >
              <Identifier scope="row" />
              {identifierRow.cells.map((cell) => cell.element)}
            </tr>
            {rows.map((row, rowIndex) => (
              <tr key={row.id} className={styles.row}>
                <Identifier scope="row">{rowIndex}</Identifier>
                {row.cells.map((cell) => cell.element)}
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          {syncInfo.id && <span>{`Id: ${syncInfo.id}`}</span>}
          <br />
          {syncInfo.status && <span>{`Status: ${syncInfo.status}`}</span>}
          <br />
          {syncInfo.isSyncing && <span>Syncing</span>}
          <br />
          {syncInfo.done_at && (
            <span>{`Awaiting until ${syncInfo.done_at}`}</span>
          )}
        </div>
      </SheetUpdateContext.Provider>
    </SheetContext.Provider>
  );
}
