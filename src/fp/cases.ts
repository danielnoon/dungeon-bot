import { Type } from "./Type";

class CaseBuilder {}

export function cases<T extends Type<unknown>>(value: T) {
  const id = value._type;
}
