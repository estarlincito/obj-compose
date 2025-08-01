/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  DeepPaths,
  JsonObject,
  JsonValue,
  LastSegment,
  PathValue,
} from '@/types.js';
import { toPath } from '@/utils/path.js';

/**
 * Picks specific deep paths from a source JSON object and returns a flat object
 * whose keys are the last segment of each path and values are the corresponding extracted values.
 *
 * @template T - The source JSON object type.
 * @template TPath - A readonly tuple/array of deep paths within T.
 *
 * @param {T} source - The object to pick values from.
 * @param {TPath} paths - Array of deep paths (dot-notation) to extract.
 * @returns {{ [K in TPath[number] as LastSegment<K>]: PathValue<T, K> }} A new object mapping each path's last segment to its value (excluding undefineds).
 *
 * @example
 * const obj = { a: { b: 1 }, c: { d: 2 } };
 * const picked = pick(obj, ['a.b', 'c.d']);
 * // Result: { b: 1, d: 2 }
 */
export const pick = <
  T extends JsonObject,
  TPath extends readonly DeepPaths<T>[],
>(
  source: T,
  paths: TPath,
): {
  [K in TPath[number] as LastSegment<K>]: PathValue<T, K>;
} => {
  const result: Record<string, JsonValue> = {};

  for (const path of paths) {
    const parts = path.split('.');
    const key = parts[parts.length - 1];
    if (!key) continue;

    const value = toPath(path, source);
    if (value !== undefined) {
      result[key] = value;
    }
  }

  return result as any;
};
