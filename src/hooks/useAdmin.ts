// Stub — sem distinção de admin neste app por enquanto
export function useAdmin() {
  return { isAdmin: false, loading: false } as const;
}
