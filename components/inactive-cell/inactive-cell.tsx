import { ReactElement } from "react";
import { ICellProps } from "../cell";
import styles from "./inactive-cell.module.css";

interface IInactiveCellProps extends Pick<ICellProps, "onFocus"> {
  value: string;
  className: string;
}

export function InactiveCell({
  value,
  onFocus,
  className,
}: IInactiveCellProps): ReactElement {
  return (
    <td className={`${styles.inactiveCell} ${className}`} onClick={onFocus}>
      {value}
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.editIcon}
      >
        <rect
          x="0.353553"
          y="7.7605"
          width="10.475"
          height="2.08235"
          rx="1.04118"
          transform="rotate(-45 0.353553 7.7605)"
          stroke="#333030"
          stroke-width="0.5"
        />
        <rect
          x="0.353553"
          y="7.7605"
          width="2.40463"
          height="2.08235"
          rx="1.04118"
          transform="rotate(-45 0.353553 7.7605)"
          fill="#D9D9D9"
          stroke="#333030"
          stroke-width="0.5"
        />
      </svg>
    </td>
  );
}
