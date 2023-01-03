import { createContext } from "react";
import type { ICell } from "../use-sheet";

export const SheetContext = createContext<ICell[][]>([]);
