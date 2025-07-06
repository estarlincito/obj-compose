/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  DeepPaths,
  JsonObject,
  JsonValue,
  LastSegment,
  PathValue,
} from './types.js';
import { get } from './utils/get.js';

/**
 * Selects specific deep paths from the base and fragment sources and returns
 * an object where the keys are the last segments of the paths, and the values
 * are taken from the first source that contains the value (base, then fragments).
 *
 * Útil para crear overrides dinámicos basados en los datos ya definidos en `base` y `fragments`.
 *
 * @template TBase - The base object type.
 * @template TFragments - The fragments object type.
 * @template TPath - The array of string paths to pick.
 *
 * @param {readonly TPath[]} paths - An array of dot-separated paths to extract.
 * @param {[TBase, TFragments]} sources - A tuple containing [base, fragments].
 *   The paths will be resolved in order from left to right (base takes priority).
 *
 * @returns {{
 *   [K in TPath[number] as import('./types').LastSegment<K>]: import('./types').PathValue<TBase & TFragments, K>
 * }} A new object with the extracted values, keyed by the last segment of each path.
 *
 * @example
 * ```ts
 * import { pick } from 'obj-compose';
 *
 * const base = {
 *   user: {
 *     info: {
 *       email: 'test@example.com',
 *     },
 *   },
 * };
 *
 * const fragments = {
 *   profile: {
 *     info: {
 *       name: 'Carly',
 *       age: 30,
 *     },
 *   },
 * };
 *
 * const result = pick(
 *   ['user.info.email', 'profile.info.name', 'profile.info.age'],
 *   [base, fragments]
 * );
 *
 * console.log(result);
 * // {
 * //   email: 'test@example.com',
 * //   name: 'Carly',
 * //   age: 30
 * // }
 * ```
 */
export function pick<
  TBase extends JsonObject,
  TFragments extends Record<string, JsonObject>,
  TPath extends readonly DeepPaths<TBase & TFragments>[],
>(
  paths: TPath,
  sources: [TBase, TFragments],
): {
  [K in TPath[number] as LastSegment<K>]: PathValue<TBase & TFragments, K>;
} {
  const result: Record<string, JsonValue> = {};

  for (const path of paths) {
    const parts = path.split('.');
    const key = parts[parts.length - 1];
    if (!key) continue;

    for (const source of sources) {
      const value = get(path, source);
      if (value !== undefined) {
        result[key] = value;
        break;
      }
    }
  }

  return result as any;
}
