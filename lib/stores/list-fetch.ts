export type ListFetchState = {
  loaded: boolean;
  loading: boolean;
  error: boolean;
};

export const listFetchInitial: ListFetchState = {
  loaded: false,
  loading: false,
  error: false,
};

export async function runListFetch<T>(params: {
  set: (partial: Partial<ListFetchState>) => void;
  query: () => PromiseLike<{
    data: T | null;
    error: { message: string } | null;
  }>;
  apply: (data: T) => void;
}): Promise<void> {
  params.set({ loading: true, error: false });
  try {
    const { data, error } = await params.query();
    if (error) {
      params.set({ loading: false, loaded: true, error: true });
      return;
    }
    params.apply((data ?? []) as T);
    params.set({ loading: false, loaded: true, error: false });
  } catch {
    params.set({ loading: false, loaded: true, error: true });
  }
}
