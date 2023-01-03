import { useContext } from "react";
import { SheetContext } from "./sheet-context";

export function useCells() {
  const cells = useContext(SheetContext);

  return cells;
}
