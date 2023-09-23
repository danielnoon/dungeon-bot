import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { CommandEvent, EventHandler } from "../../botter/event";
import {
  DeferAction,
  MessageReplyAction,
  RichMessageReplyAction,
} from "../../botter/action";
import { None } from "../../fp/Option";
import { query } from "../supabase";
import { P, match } from "ts-pattern";
import { Err_, Ok_ } from "../../fp/Result";
import { Database } from "../../types/supabase";

const command = new SlashCommandBuilder()
  .setName("showme")
  .setDescription("Show your character card.");

const makeCharacterCard = (
  character: Database["public"]["Tables"]["players"]["Row"]
): RichMessageReplyAction => {
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(character.name)
    .setImage(character.portrait);

  return RichMessageReplyAction({ embeds: [embed] });
};

export default EventHandler(
  CommandEvent(command, (ctx) =>
    DeferAction(None(), false, async () => {
      const result = await query((sb) =>
        sb.from("players").select().eq("user", ctx.user.id)
      );

      return match(result)
        .with(Err_, () => MessageReplyAction("❌ There was a database error."))
        .with(Ok_, (characters) =>
          match(characters)
            .with([], () =>
              MessageReplyAction(
                "❌ There is no character associated with this user."
              )
            )
            .with([P.select()], makeCharacterCard)
            .otherwise(() => MessageReplyAction("❌ Error [001]"))
        )
        .exhaustive();
    })
  )
);
