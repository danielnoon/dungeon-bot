import { match } from "ts-pattern";
import { make, select } from "./Type";

const _some = Symbol("Some");
export const Some = <A>(a: A) => make<typeof _some, A>(_some, a);
export const Some_ = select(_some);

const _none = Symbol("None");
export const None = () => make<typeof _none, []>(_none, []);
export const None_ = select(_none);

export type Some<A> = ReturnType<typeof Some<A>>;
export type None = ReturnType<typeof None>;

export type Option<A> = Some<A> | None;

export function isSome<A>(option: Option<A>): option is Some<A> {
  return option._type === _some;
}

export function isNone(option: Option<unknown>): option is None {
  return option._type === _none;
}

export function maybe<A, B>(
  default_: B,
  fn: (val: A) => B,
  option: Option<A>
): B {
  if (isNone(option)) return default_;

  return fn(option.data);
}

export const fromSome = <A>(some: Option<A>): A => {
  if (isNone(some)) throw new Error("Tried to extract value from a none value");

  return some.data;
};

export const from = <A>(val: A): Option<Exclude<A, void | null>> => {
  if (val === null || val === undefined || Number.isNaN(val)) {
    return None();
  }

  return Some(val as Exclude<A, void | null>);
};

export const map = <A, B>(fn: (val: A) => B, option: Option<A>): Option<B> =>
  match(option)
    .when(isNone, () => None())
    .when(isSome, ({ data }) => Some(fn(data as A)))
    .otherwise(None);

export const flatMap = <A, B>(fn: (val: A) => B, list: Option<A>[]): B[] =>
  list.filter(isSome).map(({ data }) => fn(data));

export const bind = <A, B>(src: Option<A>, fn: (val: A) => Option<B>) =>
  isNone(src) ? None() : fn(src.data);
