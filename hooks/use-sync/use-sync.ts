import { useCallback, useEffect, useReducer } from "react";

// We can move this to an env file, for now unnecessary.
const BASE_URL = "http://0.0.0.0:8082";

function getBackoffTime(retryCount: number): number {
  return Math.pow(2, retryCount) * 1000;
}

const MAX_RETRY = 5;
async function retryCall<T>(fn: () => Promise<T>, retryCount = 1): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (retryCount < MAX_RETRY) {
      await waitFor(getBackoffTime(retryCount));

      return await retryCall(fn, retryCount + 1);
    } else {
      throw new Error("Max retries reached");
    }
  }
}

async function waitFor(length: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, length));
}

type TResult = IDoneResult | IInProgressResult;

interface IDoneResult {
  status: "DONE";
}

interface IInProgressResult {
  status: "IN_PROGRESS";
  id: string;
  done_at: string;
}

function isIDoneResult(obj: any): obj is IDoneResult {
  return typeof obj === "object" && obj.status === "DONE";
}

function isIInProgressResult(obj: any): obj is IInProgressResult {
  return (
    typeof obj === "object" &&
    obj.status === "IN_PROGRESS" &&
    typeof obj.id === "string" &&
    typeof obj.done_at === "string"
  );
}

function isTResult(obj: any): obj is TResult {
  return isIDoneResult(obj) || isIInProgressResult(obj);
}

export async function save<T>(data: T): Promise<TResult> {
  const response = await fetch(`${BASE_URL}/save`, {
    method: "POST",
    body: JSON.stringify({ data }),
  });

  if (response.ok) {
    const json = await response.json();

    if (isTResult(json)) {
      return json;
    }
  }

  return await retryCall(() => save(data));
}

export async function getStatus(id: string): Promise<TResult> {
  const response = await fetch(`${BASE_URL}/get-status?id=${id}`);

  if (response.ok) {
    const json = await response.json();

    if (isTResult(json)) {
      return json;
    }
  }

  return await retryCall(() => getStatus(id));
}

interface IState {
  isSyncing: boolean;
  id?: string;
  status?: "DONE" | "IN_PROGRESS";
  done_at?: string;
}
type TAction = ISyncAction | TSyncResultAction;
interface ISyncAction {
  type: "sync";
}
type TSyncResultAction = ISyncDoneResultAction | ISyncInProgressResultAction;
interface ISyncInProgressResultAction {
  type: "sync_result";
  id: string;
  status: "DONE" | "IN_PROGRESS";
  done_at: string;
}
interface ISyncDoneResultAction {
  type: "sync_result";
  status: "DONE";
}

function reducer(state: IState, action: TAction): IState {
  switch (action.type) {
    case "sync":
      return {
        ...INITIAL_STATE,
        isSyncing: true,
      };
    case "sync_result":
      if (action.status === "IN_PROGRESS") {
        return {
          ...state,
          isSyncing: false,
          id: action.id,
          status: action.status,
          done_at: action.done_at,
        };
      } else {
        return {
          ...INITIAL_STATE,
          isSyncing: false,
          status: action.status,
        };
      }
    default:
      return state;
  }
}

const INITIAL_STATE = {
  isSyncing: false,
};

export function useSync<T>() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const checkStatus = useCallback(async (result: TResult) => {
    if (!isIInProgressResult(result)) {
      return;
    }

    const waitTime =
      Math.max(0, new Date(result.done_at).getTime() - Date.now()) + 500;
    await waitFor(waitTime);

    const nextResult = await getStatus(result.id);
    dispatch({ type: "sync_result", ...nextResult });

    if (isIInProgressResult(nextResult)) {
      await checkStatus(nextResult);
    }
  }, []);
  const sync = useCallback(async (data: T) => {
    if (state.isSyncing) {
      return;
    }

    dispatch({ type: "sync" });
    const saveResult = await save(data);
    dispatch({ type: "sync_result", ...saveResult });

    if (isIInProgressResult(saveResult)) {
      checkStatus(saveResult);
    }
  }, []);

  return {
    sync,
    isSyncing: state.isSyncing,
    id: state.id,
    status: state.status,
    done_at: state.done_at,
  };
}
