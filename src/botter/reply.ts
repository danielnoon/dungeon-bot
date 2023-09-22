import { make } from "../fp/Type";
import { Action } from "./action";

const _reply = Symbol("Reply");
export const Reply = (...actions: Action[]) => make(_reply, actions);
export type Reply = ReturnType<typeof Reply>;
