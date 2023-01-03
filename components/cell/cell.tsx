import { ReactElement } from "react";
import { useCell } from "../../hooks/use-cell";
import { ActiveCell } from "../active-cell";
import { InactiveCell } from "../inactive-cell";
import styles from "./cell.module.css";

export interface ICellProps {
  row: number;
  column: number;
  isActive: boolean;
  onBlur: () => void;
  onFocus: () => void;
}

export function Cell({
  row,
  column,
  isActive,
  onFocus,
  onBlur,
}: ICellProps): ReactElement {
  // TODO: isDirty.
  const cell = useCell({ row, column });

  if (isActive) {
    return (
      <ActiveCell
        row={row}
        column={column}
        className={styles.cell}
        onBlur={onBlur}
        initialValue={cell.value}
      />
    );
  } else {
    return (
      <InactiveCell
        className={styles.cell}
        value={cell.result}
        onFocus={onFocus}
      />
    );
  }
}
