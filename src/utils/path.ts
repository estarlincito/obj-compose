import type { JsonObject, JsonValue } from '@/types.js';

export const toPath = (
  path: string,
  obj: JsonObject,
): JsonValue | undefined => {
  const parts = path.split('.');
  let current: JsonValue = obj;

  for (const part of parts) {
    if (
      current === null ||
      typeof current !== 'object' ||
      Array.isArray(current)
    ) {
      return undefined;
    }
    current = current[part];
    if (current === undefined) return undefined;
  }

  return current;
};
