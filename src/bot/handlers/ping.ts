import { MessageReplyAction } from "../../botter/action";
import { CommandEvent, EventHandler } from "../../botter/event";
import { Reply } from "../../botter/reply";
import { SlashCommandBuilder } from "discord.js";

const command = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Testing");

export default EventHandler(
  CommandEvent(command, () => Reply(MessageReplyAction("pong")))
);
