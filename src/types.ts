/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
export type JsonPrimitive = string | number | boolean | null | undefined;
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue;
}

export type DeepPaths<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${DeepPaths<T[K]>}` | `${K}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

export type PathValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? PathValue<T[K], R>
    : never
  : never;

export type LastSegment<T extends string> = T extends `${string}.${infer Tail}`
  ? LastSegment<Tail>
  : T;

export type DeepPartialWithCallbacks<T, TBase, TFragments> =
  | {
      [P in keyof T]?:
        | (T[P] extends JsonObject
            ? DeepPartialWithCallbacks<T[P], TBase, TFragments>
            : T[P])
        | ((source: TBase & TFragments) => any);
    }
  | ((source: TBase & TFragments) => any);

export type Overrides<
  TBase extends JsonObject,
  TFragments extends Record<string, JsonObject>,
> = DeepPartialWithCallbacks<TBase & TFragments, TBase, TFragments>;

type RemainingKeys<T, O> = Exclude<keyof T, keyof O>;

export type ApplyOverrides<T, O> = O extends (...args: any[]) => any
  ? ReturnType<O>
  : O extends object
  ? T extends object
    ? RemainingKeys<T, O> extends never
      ? {
          [K in keyof O]: ApplyOverrides<
            K extends keyof T ? T[K] : never,
            O[K]
          >;
        }
      : {
          [K in keyof O]: ApplyOverrides<
            K extends keyof T ? T[K] : never,
            O[K]
          >;
        } & {
          [K in RemainingKeys<T, O>]: T[K];
        }
    : O
  : O extends undefined
  ? T
  : O;

export type DeepOmit<
  T,
  Path extends string,
> = Path extends `${infer Head}.${infer Tail}`
  ? Head extends keyof T
    ? {
        [K in keyof T]: K extends Head ? DeepOmit<T[K], Tail> : T[K];
      }
    : T
  : Path extends keyof T
  ? Omit<T, Path>
  : T;

export type ComposedResult<
  TBase extends JsonObject,
  TFragments extends Record<string, JsonObject>,
  TOverrides,
> = ApplyOverrides<TBase & TFragments, TOverrides>;

/**
 * Options for composing a base JSON object with named fragment pieces and optional overrides.
 *
 * @template TBase - The shape of the base JSON object.
 * @template TFragments - A record whose keys are fragment names and values are JSON objects to be merged/used alongside `base`.
 *
 * @property {TBase} base - The primary JSON object to start from.
 * @property {TFragments} [fragments] - Optional named fragments that can be composed with or applied to the base.
 * @property {Overrides<TBase, TFragments>} [overrides] - Optional instructions to override or adjust properties between `base` and `fragments`.
 */
export interface ComposeOptions<
  TBase extends JsonObject,
  TFragments extends Record<string, JsonObject>,
> {
  base: TBase;
  fragments?: TFragments;
  overrides?: Overrides<TBase, TFragments>;
}
