import { Type, make, make_is, make_is_super } from "../fp/Type";
import { Option } from "../fp/Option";
import {
  Awaitable,
  BaseInteraction,
  ButtonInteraction,
  InteractionReplyOptions,
  ModalBuilder,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
} from "discord.js";
import { makeSlashCommandContext } from "./context";

// MessageReplyAction
const _message_reply_action = Symbol("MessageReplyAction");
export const MessageReplyAction = (text: string) =>
  make(_message_reply_action, text);
export type MessageReplyAction = ReturnType<typeof MessageReplyAction>;
export const isMessageReplyAction = make_is<MessageReplyAction>(
  _message_reply_action
);

// RichMessageReplyAction
const _rich_message_reply_action = Symbol("RichMessageReplyAction");
export const RichMessageReplyAction = (data: InteractionReplyOptions) =>
  make(_rich_message_reply_action, data);
export type RichMessageReplyAction = ReturnType<typeof RichMessageReplyAction>;
export const isRichMessageReplyAction = make_is<RichMessageReplyAction>(
  _rich_message_reply_action
);

// AwaitInteractionAction
type Filter = (interaction: BaseInteraction) => boolean;
type AwaitComponentHandler = (
  interaction: StringSelectMenuInteraction | ButtonInteraction
) => Awaitable<Action | ActionGroup>;
const _await_component_action = Symbol("AwaitInteractionAction");
export const AwaitComponentAction = (
  ...data: [
    filter: Filter,
    timeout: number,
    errorMessage: string,
    handler: AwaitComponentHandler
  ]
) =>
  make<typeof _await_component_action, typeof data>(
    _await_component_action,
    data
  );
export type AwaitComponentAction = ReturnType<typeof AwaitComponentAction>;
export const isAwaitComponentAction = make_is<AwaitComponentAction>(
  _await_component_action
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

// ShowModalAction
type ModalCallback = (
  ctx: ModalSubmitInteraction
) => Awaitable<Action | ActionGroup>;
const _show_modal_action = Symbol("ShowModalAction");
export const ShowModalAction = (
  ...data: [modal: ModalBuilder, callback: ModalCallback]
) => make(_show_modal_action, data);
export type ShowModalAction = ReturnType<typeof ShowModalAction>;
export const isShowModalAction = make_is<ShowModalAction>(_show_modal_action);

// supertype Action
export type Action =
  | MessageReplyAction
  | DeferAction
  | RichMessageReplyAction
  | AwaitComponentAction
  | ShowModalAction;

export const isAction = make_is_super<Action>(
  _message_reply_action,
  _defer_action,
  _rich_message_reply_action,
  _show_modal_action
);

// ActionGroup
const _action_group: unique symbol = Symbol("ActionGroup");
export const ActionGroup = (...actions: Action[]) =>
  make(_action_group, actions);
export type ActionGroup = ReturnType<typeof ActionGroup>;
export const isActionGroup = make_is<ActionGroup>(_action_group);
