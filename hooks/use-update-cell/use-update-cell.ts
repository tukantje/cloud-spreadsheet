import { useContext } from "react";
import { SheetUpdateContext } from "./sheet-update-context";

export function useUpdateCell() {
  const updateCell = useContext(SheetUpdateContext);

  return updateCell;
}
