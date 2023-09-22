import { make, make_is, select } from "./Type";

const _ok: unique symbol = Symbol("Ok");
export const Ok = <T>(value: T) => make(_ok, value);
export type Ok<T> = ReturnType<typeof Ok<T>>;
export const Ok_ = select(_ok);

const _err: unique symbol = Symbol("Err");
export const Err = <T>(value: T) => make(_err, value);
export type Err<T> = ReturnType<typeof Err<T>>;
export const Err_ = select(_err);

export type Result<T, E> = Ok<T> | Err<E>;

export function isOk<T>(t: Result<T, any>): t is Ok<T> {
  return t._type === _ok;
}

export function isErr<T>(t: Result<any, T>): t is Err<T> {
  return t._type === _err;
}

export function from<T, E>(
  ok: T | null | undefined,
  err: E | null | undefined
): Result<NonNullable<T>, NonNullable<E>> {
  if (err) return Err(err!);
  return Ok(ok!);
}
