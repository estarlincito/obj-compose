/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
export type JsonPrimitive = string | number | boolean | null | undefined;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
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
        | ((sources: [TBase, TFragments]) => any);
    }
  | ((sources: [TBase, TFragments]) => any);

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

export type ComposedResult<
  TBase extends JsonObject,
  TFragments extends Record<string, JsonObject>,
  TOverrides,
> = ApplyOverrides<TBase & TFragments, TOverrides>;

/**
 * The options object used to compose a final configuration object by merging
 * a `base` object with optional `fragments` and applying optional `overrides`.
 *
 * This is the main type you can use to explicitly type the parameter of `compose()`
 * if you want to enforce structure or reuse it elsewhere.
 *
 * @template TBase - The base object that defines the main structure.
 * @template TFragments - Optional named fragments to merge into the base.
 */
export interface ComposeOptions<
  TBase extends JsonObject,
  TFragments extends Record<string, JsonObject>,
> {
  base: TBase;
  fragments?: TFragments;
  overrides?: Overrides<TBase, TFragments>;
}
