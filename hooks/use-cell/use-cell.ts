import { useCells } from "../use-cells";
import { ICell } from "../use-sheet";

interface IUseCellParams {
  row: number;
  column: number;
}

function isFormula(value: string) {
  return value.startsWith("=");
}

type TOperator = "+" | "-" | "*" | "/";

function split(expression: string, operator: TOperator) {
  const result = [];

  let braces = 0;
  let currentChunk = "";

  for (let i = 0; i < expression.length; i++) {
    const currentChar = expression[i];

    if (currentChar === "(") {
      braces++;
    } else if (currentChar === ")") {
      braces--;
    }

    if (braces == 0 && currentChar === operator) {
      result.push(currentChunk);
      currentChunk = "";
    } else {
      currentChunk += currentChar;
    }
  }

  if (currentChunk !== "") {
    result.push(currentChunk);
  }

  return result;
}

function parsePlusExpression(expression: string): number {
  const numbersString = split(expression, "+");
  const numbers = numbersString.map((numberString) =>
    parseMinusExpression(numberString)
  );
  const initialValue = 0.0;
  const result = numbers.reduce(
    (accumulator, current) => accumulator + current,
    initialValue
  );
  return result;
}
function parseMinusExpression(expression: string): number {
  const numbersString = split(expression, "-");
  const numbers = numbersString.map((numberString) =>
    parseMultiplicationExpression(numberString)
  );
  const initialValue = numbers[0];
  const result = numbers
    .slice(1)
    .reduce((accumulator, current) => accumulator - current, initialValue);
  return result;
}
function parseMultiplicationExpression(expression: string): number {
  const numbersString = split(expression, "*");
  const numbers = numbersString.map((numberString) => {
    return parseDivisionExpression(numberString);
  });
  const initialValue = 1.0;
  const result = numbers.reduce(
    (accumulator, current) => accumulator * current,
    initialValue
  );
  return result;
}
function parseDivisionExpression(expression: string) {
  const numbersString = split(expression, "/");
  const numbers = numbersString.map((numberString) => {
    if (numberString[0] === "(") {
      const expr = numberString.substr(1, numberString.length - 2);
      // recursive call to the main function
      return parsePlusExpression(expr);
    }
    return +numberString;
  });
  const initialValue = numbers[0];
  const result = numbers
    .slice(1)
    .reduce((accumulator, current) => accumulator / current, initialValue);
  return result;
}

function getCellColumnIndex(cell: string) {
  return cell.charCodeAt(0) - 65;
}

function parseFormula(value: string, cells: ICell[][]): string {
  const referenceRegex = /([A-Z][0-9]+)/g;
  let expression = isFormula(value) ? value.slice(1) : value;
  expression = expression.replace(referenceRegex, (match) => {
    const columnIndex = getCellColumnIndex(match);
    const rowIndex: number = +match.slice(1);

    const cell = cells[rowIndex]?.[columnIndex];

    return parseFormula(cell?.value, cells);
  });

  return String(parsePlusExpression(expression));
}

export function useCell({ row, column }: IUseCellParams) {
  const cells = useCells();
  const cellValue = cells[row]?.[column]?.value ?? "";

  if (isFormula(cellValue)) {
    return {
      result: parseFormula(cellValue, cells),
      value: cellValue,
    };
  }

  return {
    result: cellValue,
    value: cellValue,
  };
}
