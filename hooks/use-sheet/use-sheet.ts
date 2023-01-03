import { useEffect, useReducer, useRef } from "react";
import { useSync } from "../use-sync";

export interface ICell {
  value: string;
}

type IUpdateCellFn = (params: {
  row: number;
  column: number;
  value: string;
}) => void;

export interface IUseSheetHookResult {
  cells: ICell[][];
  updateCell: IUpdateCellFn;
  syncInfo: Omit<ReturnType<typeof useSync>, "sync">;
}

function cloneOrCreateCell(
  row: number,
  column: number,
  cells: ICell[][]
): ICell {
  if (cells[row] && cells[row][column]) {
    return { ...cells[row][column] };
  } else {
    return { value: "" };
  }
}

interface IUpdateCellAction {
  type: "update_cell";
  row: number;
  column: number;
  value: string;
}

type TAction = IUpdateCellAction;
type TState = ICell[][];

function reducer(state: TState, action: TAction): TState {
  switch (action.type) {
    case "update_cell":
      const cells = [...state];
      const row = cells[action.row] ? [...cells[action.row]] : [];

      row[action.column] = cloneOrCreateCell(action.row, action.column, cells);
      row[action.column].value = action.value;
      cells[action.row] = row;

      return cells;
    default:
      throw new Error();
  }
}

function formatToCSV(data: TState, rows: number, columns: number): string {
  let csv = "";
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const cell = data[row]?.[column];
      if (cell) {
        csv += cell.value;
      }

      if (column < columns - 1) {
        csv += ",";
      }
    }

    if (row < rows - 1) {
      csv += "\n";
    }
  }

  return csv;
}

export function useSheet(rows: number, columns: number): IUseSheetHookResult {
  const [cells, dispatch] = useReducer(reducer, []);
  const previousCells = useRef(cells);
  const { sync, ...syncInfo } = useSync();

  const updateCell: IUpdateCellFn = ({ row, column, value }) => {
    dispatch({ type: "update_cell", row, column, value });
  };

  useEffect(() => {
    if (cells !== previousCells.current) {
      sync(formatToCSV(cells, rows, columns));
    }
  }, [cells, sync]);

  return {
    cells,
    updateCell,
    syncInfo,
  };
}
