import { make, make_is } from "../fp/Type";
import { Action } from "./action";

const _reply = Symbol("Reply");
export const Reply = (...actions: Action[]) => make(_reply, actions);
export type Reply = ReturnType<typeof Reply>;
export const isReply = make_is<Reply>(_reply);
