export namespace Any {
  export type Cast<X, Y> = X extends Y ? X : Y;
}

export namespace Number {
  // N - M
  export type Sub<
    N extends number,
    M extends number
    > = Tuple.Repeat<N> extends [...infer R, ...Tuple.Repeat<M>]
    ? R["length"]
    : never;
}

export namespace Tuple {
  // private

  // NON FUNZIONA COI REST PARAMS
  type _HEAD_TAIL_<T extends readonly any[]> = T extends readonly []
    ? never
    : T extends readonly [any?, ...infer TAIL]
    ? T extends readonly [...infer HEAD, ...TAIL]
    ? {
      HEAD: T extends any[] ? HEAD : Readonly<HEAD>;
      TAIL: T extends any[] ? TAIL : Readonly<TAIL>;
    }
    : never
    : never;

  // NON FUNZIONA COI REST PARAMS
  type _INIT_LAST_<T extends readonly any[]> = T extends readonly []
    ? never
    : T extends readonly [...infer INIT, any?]
    ? T extends readonly [...INIT, ...infer LAST]
    ? {
      INIT: T extends any[] ? INIT : Readonly<INIT>;
      LAST: T extends any[] ? LAST : Readonly<LAST>;
    }
    : never
    : never;

  interface _Props<T extends readonly any[]> {
    HEAD_AS_TUPLE: _HEAD_TAIL_<T>["HEAD"];
    HEAD: this["HEAD_AS_TUPLE"][0];
    LAST_AS_TUPLE: _INIT_LAST_<T>["LAST"];
    LAST: this["LAST_AS_TUPLE"][0];
    TAIL: _HEAD_TAIL_<T>["TAIL"];
    INIT: _INIT_LAST_<T>["INIT"];

    LENGTH: T["length"];

    // empty or never tail -> false
    HAS_TAIL: this["TAIL"]["length"] extends 0 ? false : true;
  }

  // LenUntilRest<[1, 2, ...3[], 5]> // 2
  type LenUntilRest<
    T extends readonly any[],
    R extends any[] = []
    > = T extends [any, ...any[]]
    ? LenUntilRest<Drop<T, 1>, [any, ...R]>
    : R["length"];

  // public

  export type Repeat<
    N extends Number,
    T extends any = any,
    R extends readonly any[] = []
    > = (N extends R["length"] ? R : Repeat<N, T, [T, ...R]>) extends infer X
    ? Any.Cast<X, readonly any[]>
    : never;

  export type Props<T extends readonly any[]> = _Props<T>;

  export type Concat<T extends readonly any[], U extends readonly any[]> = [
    ...T,
    ...U
  ];

  export type Prepend<P, T extends readonly any[]> = [P, ...T];

  // PartialSkipN<[1,2,3], 2> = [1,2,3?]
  export type PartialSkipN<
    T extends readonly any[],
    N extends number = T["length"],
    RN extends readonly any[] = Repeat<N>
    // warning: se T ha element rest, N diventa number => ricorsione infinita
    > = T extends readonly [...RN, ...infer LAST]
    ? // infer FIRST si rompe se T ha rest params
    T extends readonly [...infer FIRST, ...LAST]
    ? T extends any[]
    ? [...FIRST, ...Partial<LAST>]
    : Readonly<[...FIRST, ...Partial<LAST>]>
    : never
    : T;

  export type Drop<
    T extends readonly any[],
    N extends number = T["length"],
    RN extends readonly any[] = Repeat<N>
    > =
    // mi paro il sedere se N > max(T["length"]) => ritorno []
    Required<T> extends readonly [...RN, ...any[]]
    // supporto elementi opzionali prima del punto di drop
    ? T extends readonly [...Partial<RN>, ...infer REST]
    ? T extends any[] // mantengo il readonly se T è readonly any[]`
    ? REST
    : Readonly<REST>
    : never
    : [];

  // funziona male con elementi opzionali
  export type Take<
    T extends readonly any[],
    N extends number = T["length"],
    RN extends readonly any[] = Repeat<N>
    > = T extends readonly [RN, ...infer LAST]
    ? // infer FIRST si rompe se T ha rest params
    T extends readonly [...infer FIRST, ...LAST]
    ? FIRST // perdo readonly
    : never
    : T;
}

//
export { };

type test = Tuple.Drop<[1, 2?, 3?, 4?], 2>;

type test2 = [1, 2?, 3?, 4?];
