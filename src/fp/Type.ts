import { P } from "ts-pattern";

export type Type<Name extends symbol, Data> = {
  readonly _type: Name;
  readonly data: Data;
  readonly toString: () => string;
};

export const make = <Name extends symbol, Data>(
  name: Name,
  data: Data
): Type<Name, Data> => {
  return {
    _type: name,
    data,
    toString() {
      return (name.description ?? "Type") + " " + data;
    },
  };
};

export const select = <T extends symbol>(name: T) => {
  return {
    _type: name,
    data: P.select(),
  };
};

export function make_is<Expected extends Type<any, any>>(name: symbol) {
  return function is(t: Type<any, any>): t is Expected {
    return t._type == name;
  };
}

export function make_is_super<Expected extends Type<any, any>>(
  ...names: symbol[]
) {
  return function is(t: Type<any, any>): t is Expected {
    return names.includes(t._type);
  };
}
