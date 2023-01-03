import { PropsWithChildren, ReactElement } from "react";
import styles from "./identifier.module.css";

interface IIdentifierProps extends PropsWithChildren {
  scope: "row" | "col";
}

export function Identifier({
  children,
  scope,
}: IIdentifierProps): ReactElement {
  return (
    <th scope={scope} className={styles.identifier}>
      {children}
    </th>
  );
}
