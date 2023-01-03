import { ReactElement, useEffect, useRef } from "react";
import { useUpdateCell } from "../../hooks/use-update-cell";
import { ICellProps } from "../cell";
import styles from "./active-cell.module.css";

interface IActiveCellProps
  extends Pick<ICellProps, "onBlur" | "row" | "column"> {
  initialValue: string;
  className: string;
}

export function ActiveCell({
  row,
  column,
  onBlur: onBlurParam,
  initialValue,
  className,
}: IActiveCellProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const updateCell = useUpdateCell();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function onBlur(event: React.FocusEvent<HTMLInputElement>) {
    onBlurParam();

    updateCell({ row, column, value: event.target.value ?? "" });
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
  }

  return (
    <td className={className}>
      <input
        ref={inputRef}
        className={`${styles.cellInput} ${className}`}
        type="text"
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        defaultValue={initialValue}
      />
    </td>
  );
}
