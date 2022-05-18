import { Any, Tuple } from "./utils";

namespace V3 {
  type CurryV3<P extends readonly any[], R> = <T extends readonly any[]>(
    // T inferito da ...args direttamente dagli argomenti passati
    // se T estende Tuple.PartialSkipN<P, 1> allora args avrà tipo T, altrimenti args ha tipo Tuple.PartialSkipN<P, 1>
    // se T lo estende bene, altrimenti errore
    ...args: Any.Cast<T, Tuple.PartialSkipN<P, 1>>
  ) => (Tuple.Drop<P, T["length"]>)["length"] extends 0
    ? R
    : CurryV3<
      Tuple.Drop<P, T["length"]>,
      R
    >;

  // anziché f : F extends (...args: any[]) => any
  // dalla quale poi tirare fuori P, R con infer
  // faccio il contrario
  declare function curryV3<P extends readonly any[], R>(
    f: (...args: P) => R
  ): CurryV3<P, R>;

  const res = curryV3((a: number, b: string) => true);


  const t0 = res(4, "ciao");
  const t1 = res(4)("ciao");
  const t2 = res(4, 8);
  const t3 = res(4)();
  const t4 = res(123)
}

namespace V3bis {
  // un tempo Partial rendeva anche length opzionale, e siccome Drop lavorava sulla length era un po''
  // un problema trovarsi degli undefined...quindi si lasciava T libero (extends any[]) in modo tale che length non
  // si undefinizzasse, e semplicemente si forzava poi il tipo di args
  type CurryV3bis<P extends readonly any[], R> = <T extends Tuple.PartialSkipN<P, 1>>(
    ...args: T
  ) => (Tuple.Drop<P, T["length"]>)["length"] extends 0
    ? R
    : CurryV3bis<
      Tuple.Drop<P, T["length"]>,
      R
    >;

  // anziché f : F extends (...args: any[]) => any
  // dalla quale poi tirare fuori P, R con infer
  // faccio il contrario
  declare function curryV3bis<P extends readonly any[], R>(
    f: (...args: P) => R
  ): CurryV3bis<P, R>;

  const res = curryV3bis((a: number, b: string) => true);

  const t0 = res(4, "ciao");
  const t1 = res(4)("ciao");
  const t2 = res(4, 8);
  const t3 = res(4)();
  const t4 = res(123)
}

namespace V5 {
  // CurryV3bis sfrutta la length sul check del caso base,
  // ma se abbiamo un rest parameter la length di P è number :(
  //
  // string[], [], [...boolean[]] NON estendono [any, ...any[]]
  // perché non hanno almeno un elemento
  //
  // T "libero" ma poi forziamo il primo elemento = P[0], il resto come P ma opzionale
  type CurryV5<P extends readonly any[], R> = <T extends readonly any[]>(
    ...args: Any.Cast<T, Tuple.Concat<[P[0]], Tuple.Drop<Partial<P>, 1>>>
  ) => Tuple.Drop<P, T["length"]> extends [any, ...any[]]
    ? CurryV5<
      Tuple.Drop<P, T["length"]>,
      R>
    : R

  declare function CurryV5<P extends readonly any[], R>(
    f: (...args: P) => R
  ): CurryV5<P, R>;

  const res = CurryV5((a: number, b: string, ...cs: boolean[]) => true);

  type test = Tuple.PartialSkipN<[number, {}, ...string[]], 1> // :(

  const t0 = res(4, "ciao", false, true);
  const t1 = res(4)("ciao");
  const t1bis = res(4)("ciao", false);
  const t2 = res(4, 8);
  const t3 = res(4)();
  const t4 = res(123)
  const t5 = res() // :(
}

type test = Partial<[1,2,...3[]]>

export { };
