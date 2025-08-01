/* eslint-disable @typescript-eslint/no-unused-vars */

import type { DeepOmit, DeepPaths, JsonObject } from '@/types.js';
import { toPath } from '@/utils/path.js';

/**
 * Returns a copy of `source` with the given deep paths omitted.
 *
 * @template T - The source JSON object type.
 * @template TPaths - A readonly tuple/array of deep paths within T to remove.
 *
 * @param {T} source - The object to omit from.
 * @param {TPaths} paths - Deep paths (dot-notation) to remove from the source.
 * @returns {DeepOmit<T, TPaths[number]>} A new object with the specified paths omitted.
 *
 * @example
 * const obj = { a: { b: 1, c: 2 }, d: 3 };
 * const result = omit(obj, ['a.b']);
 * // result: { a: { c: 2 }, d: 3 }
 */
export const omit = <
  T extends JsonObject,
  const TPaths extends readonly DeepPaths<T>[],
>(
  source: T,
  paths: TPaths,
): DeepOmit<T, TPaths[number]> => {
  const result = JSON.parse(JSON.stringify(source)) as T;
  const pathSet = new Set(paths);
  const sortedPaths = [...paths].sort((a, b) => b.length - a.length);

  for (const path of sortedPaths) {
    const parts = path.split('.');
    const parentPath = parts.slice(0, -1).join('.') as DeepPaths<T>;
    const lastKey = parts[parts.length - 1];

    if (parentPath && pathSet.has(parentPath)) continue;

    const parent = parentPath ? toPath(parentPath, result) : result;

    if (
      parent &&
      typeof parent === 'object' &&
      !Array.isArray(parent) &&
      lastKey in parent
    ) {
      const { [lastKey as keyof typeof parent]: _, ...rest } = parent;

      if (parentPath) {
        const grandParentPath = parts.slice(0, -2).join('.') as DeepPaths<T>;
        const grandParent = grandParentPath
          ? toPath(grandParentPath, result)
          : result;
        const parentKey = parts[parts.length - 2];

        if (
          grandParent &&
          typeof grandParent === 'object' &&
          !Array.isArray(grandParent)
        ) {
          grandParent[parentKey] = rest;
        }
      } else {
        Object.assign(result, rest);
      }
    }
  }

  return result as DeepOmit<T, TPaths[number]>;
};
