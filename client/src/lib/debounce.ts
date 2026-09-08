export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return ((...args: Parameters<T>) => {
    // Cancel the previous scheduled call if called again
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => fn(...args), delay);
  }) as T;
}
