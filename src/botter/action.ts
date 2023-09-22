import { Type, make, make_is, make_is_super } from "../fp/Type";
import { Option } from "../fp/Option";
import { Awaitable } from "discord.js";

// MessageReplyAction
const _message_reply_action = Symbol("MessageReplyAction");
export const MessageReplyAction = (text: string) =>
  make(_message_reply_action, text);
export type MessageReplyAction = ReturnType<typeof MessageReplyAction>;
export const isMessageReplyAction = make_is<MessageReplyAction>(
  _message_reply_action
);

// DeferAction
const _defer_action: unique symbol = Symbol("DeferAction");
export const DeferAction = (
  message: Option<string>,
  ephemeral: boolean,
  fn: () => Awaitable<Type<any, any>>
) => make(_defer_action, [message, ephemeral, fn] as const);
export type DeferAction = ReturnType<typeof DeferAction>;
export const isDeferAction = make_is<DeferAction>(_defer_action);

// supertype Action
export type Action = MessageReplyAction | DeferAction;
export const isAction = make_is_super<Action>(
  _message_reply_action,
  _defer_action
);

// ActionGroup
const _action_group: unique symbol = Symbol("ActionGroup");
export const ActionGroup = (...actions: Action[]) =>
  make(_action_group, actions);
export type ActionGroup = ReturnType<typeof ActionGroup>;
export const isActionGroup = make_is<ActionGroup>(_action_group);
