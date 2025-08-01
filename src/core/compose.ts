/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  ComposedResult,
  ComposeOptions,
  DeepPartialWithCallbacks,
  JsonObject,
  Overrides,
} from '@/types.js';
import { isPlainObject } from '@/utils/plain.js';

/**
 * Composes a base object with optional named fragments and applies overrides (which can be
 * plain partials with nested callbacks or a function) to produce a final merged result.
 *
 * @template TBase - The base JSON object type.
 * @template TFragments - A record of fragment JSON objects to merge alongside the base.
 * @template TOverrides - The overrides shape (can be a deep partial or function) that can adjust or replace parts of the merged result.
 *
 * @param {ComposeOptions<TBase, TFragments> & { overrides?: TOverrides }} options - Composition inputs including base, fragments, and overrides.
 * @returns {ComposedResult<TBase, TFragments, TOverrides>} The composed object after merging and applying overrides.
 *
 * @example
 * const base = { a: 1 };
 * const fragments = { b: 2 };
 * const overrides = { a: (merged) => merged.b + 10 };
 * const result = compose({ base, fragments, overrides });
 * // result: { a: 12, b: 2 }
 */
export const compose = <
  TBase extends JsonObject,
  TFragments extends Record<string, JsonObject>,
  TOverrides extends Overrides<TBase, TFragments>,
>(
  options: ComposeOptions<TBase, TFragments> & {
    overrides?: TOverrides;
  },
): ComposedResult<TBase, TFragments, TOverrides> => {
  const {
    base,
    fragments = {} as TFragments,
    overrides = {} as TOverrides,
  } = options;

  const merged: TBase & TFragments = { ...base, ...fragments };

  const applyOverrides = (
    target: JsonObject,
    override: DeepPartialWithCallbacks<JsonObject, TBase, TFragments>,
  ): JsonObject => {
    if (typeof override === 'function') {
      const result = override(merged);

      return isPlainObject(result) ? result : target;
    }

    const result: JsonObject = { ...target };

    for (const [key, value] of Object.entries(override)) {
      if (typeof value === 'function') {
        result[key] = value(merged);
      } else if (isPlainObject(value) && isPlainObject(result[key])) {
        result[key] = applyOverrides(
          result[key],
          value as DeepPartialWithCallbacks<JsonObject, TBase, TFragments>,
        );
      } else {
        result[key] = value;
      }
    }

    return result;
  };

  return applyOverrides(merged, overrides as any) as ComposedResult<
    TBase,
    TFragments,
    TOverrides
  >;
};
