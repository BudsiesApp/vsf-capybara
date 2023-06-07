export function getFirstFieldWithErrorName (
  errors: Record<string, string[]>
): string | undefined {
  for (const key in errors) {
    if (errors[key] && !!errors[key].length) {
      return key;
    }
  }
}
