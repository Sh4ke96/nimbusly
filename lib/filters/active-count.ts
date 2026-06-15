export const FILTER_ALL_VALUE = "all";

export function countActiveFilters(
  values: string[],
  allValue: string = FILTER_ALL_VALUE
): number {
  return values.filter((value) => value !== allValue).length;
}
