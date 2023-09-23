import { Awaitable, SlashCommandBuilder } from "discord.js";
import { Type, make, make_is, select } from "../fp/Type";
import { Reply } from "./reply";
import { makeSlashCommandContext } from "./context";
import { Action } from "./action";

// MessageContentEvent
const _message_content_event = Symbol("MessageContentEvent");
export const MessageContentEvent = (content: string) =>
  make(_message_content_event, content);
export type MessageContentEvent = ReturnType<typeof MessageContentEvent>;
export const isMessageContentEvent = make_is<MessageContentEvent>(
  _message_content_event
);
export const MessageContentEvent_ = select(_message_content_event);

// CommandEvent
export type CommandEventHandler = (
  ctx: ReturnType<typeof makeSlashCommandContext>
) => Awaitable<Reply | Action>;

const _command_event = Symbol("CommandEvent");
export const CommandEvent = (
  ...data: [command: SlashCommandBuilder, handler: CommandEventHandler]
) => make(_command_event, data);
export type CommandEvent = ReturnType<typeof CommandEvent>;
export const isCommandEvent = make_is<CommandEvent>(_command_event);
export const CommandEvent_ = select(_command_event);

// supertype Event
export type Event = MessageContentEvent | CommandEvent;

// EventHandler
const _event_handler = Symbol("EventHandler");
export const EventHandler = (event: Event) =>
  make<typeof _event_handler, Event>(_event_handler, event);
export type EventHandler = ReturnType<typeof EventHandler>;
export const isEventHandler = make_is<EventHandler>(_event_handler);
export const EventHandler_ = select(_event_handler);
