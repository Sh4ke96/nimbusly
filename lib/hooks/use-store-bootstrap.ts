import { useEffect } from "react";

/** Loads store data once when not yet loaded and no fetch error. */
export function useStoreBootstrap(
  loaded: boolean,
  error: boolean,
  fetch: (force?: boolean) => Promise<void>
) {
  useEffect(() => {
    if (!loaded && !error) void fetch();
  }, [loaded, error, fetch]);
}
