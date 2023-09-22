export const c2 =
  <F extends (a: any, b: any) => any>(fn: F) =>
  <A extends Parameters<F>[0]>(a: A) =>
  <B extends Parameters<F>[1]>(b: B) =>
    fn(a, b) as ReturnType<F>;

export const c3 =
  <F extends (a: any, b: any, c: any) => any>(fn: F) =>
  <A extends Parameters<F>[0]>(a: A) =>
  <B extends Parameters<F>[1]>(b: B) =>
  <C extends Parameters<F>[2]>(c: C) =>
    fn(a, b, c) as ReturnType<F>;
