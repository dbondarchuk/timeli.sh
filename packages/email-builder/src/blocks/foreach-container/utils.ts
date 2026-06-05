export function sliceForeachArray<T>(
  array: T[],
  skip?: number,
  take?: number,
): T[] {
  const start = skip ?? 0;
  const end = take !== undefined ? start + take : undefined;
  return array.slice(start, end);
}
