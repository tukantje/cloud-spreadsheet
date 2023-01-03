import { createContext } from "react";
import { IUseSheetHookResult } from "../use-sheet/use-sheet";

const NOOP = () => {
  // This is a noop function that we can use as a default value for the context.
};

export const SheetUpdateContext =
  createContext<IUseSheetHookResult["updateCell"]>(NOOP);
