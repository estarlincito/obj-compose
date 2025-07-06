/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ComposedResult,
  ComposeOptions,
  DeepPartialWithCallbacks,
  JsonObject,
  Overrides,
} from './types.js';
import { isPlainObject } from './utils/plain-object.js';

/**
 * Composes a new object by merging a base object with optional fragments and overrides.
 *
 * Overrides can be partial objects or callback functions that receive sources ([base, fragments])
 * and return replacement values or objects.
 *
 * The resulting type is inferred and combines base, fragments, and overrides accordingly.
 *
 * @template TBase - The base JSON object type.
 * @template TFragments - Optional fragments to merge into the base.
 * @template TOverrides - Optional overrides to apply after merging base and fragments.
 *
 * @param {import('./types').ComposeOptions<TBase, TFragments> & { overrides?: TOverrides }} options
 *   An object containing:
 *   - base: The base JSON object.
 *   - fragments: Optional fragments to merge into base.
 *   - overrides: Optional overrides applied on top of merged base + fragments.
 *
 * @returns {import('./types').ComposedResult<TBase, TFragments, TOverrides>}
 *   The composed result with overrides applied.
 *
 * @example
 * ```ts
 * import { compose, pick } from 'obj-compose';
 *
 * const result = compose({
 *   base: {
 *     signup: {
 *       form: {
 *         fields: {
 *           username: 'Choose a username',
 *         },
 *         validation: {
 *           username: 'Must be unique',
 *         },
 *       },
 *     },
 *   },
 *   fragments: {
 *     contact: {
 *       form: {
 *         fields: {
 *           email: 'Email address',
 *           'first-name': 'First name',
 *           'last-name': 'Last name',
 *         },
 *         validation: {
 *           email: 'Invalid email',
 *           'first-name': 'Required',
 *           'last-name': 'Required',
 *         },
 *       },
 *     },
 *   },
 *   overrides: {
 *     signup: {
 *       form: {
 *         fields: (sources) =>
 *           pick(
 *             [
 *               'signup.form.fields.username',
 *               'contact.form.fields.email',
 *               'contact.form.fields.first-name',
 *               'contact.form.fields.last-name',
 *             ],
 *             sources,
 *           ),
 *       },
 *     },
 *   },
 * });
 *
 * console.log(JSON.stringify(result, null, 2));
 * ```
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
  const sources: [TBase, TFragments] = [base, fragments];

  const composed: JsonObject = { ...base };
  for (const [key, value] of Object.entries(fragments)) {
    composed[key] = value;
  }

  const applyOverrides = (
    target: JsonObject,
    override: DeepPartialWithCallbacks<JsonObject, TBase, TFragments>,
  ): JsonObject => {
    if (typeof override === 'function') {
      const result = override(sources);

      return isPlainObject(result) ? result : target;
    }

    const result: JsonObject = { ...target };

    for (const [key, value] of Object.entries(override)) {
      if (typeof value === 'function') {
        result[key] = value(sources);
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

  return applyOverrides(composed, overrides as any) as ComposedResult<
    TBase,
    TFragments,
    TOverrides
  >;
};
