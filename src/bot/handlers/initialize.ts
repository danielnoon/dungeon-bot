import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { CommandEvent, EventHandler } from "../../botter/event";
import { None, None_, fromSome } from "../../fp/Option";
import { Reply } from "../../botter/reply";
import { DeferAction, MessageReplyAction } from "../../botter/action";
import { query, supabase } from "../supabase";
import { match } from "ts-pattern";
import { Err_, Ok_ } from "../../fp/Result";

const command = new SlashCommandBuilder()
  .setName("init")
  .setDescription("initialize this server with a dungeon master")
  .addUserOption((o) =>
    o
      .setName("dm")
      .setDescription("this server's dungeon master")
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export default EventHandler(
  CommandEvent(command, (ctx) => {
    const $dm = ctx.options.getUser("dm");
    const $id = ctx.guildId;

    const dm = fromSome($dm);
    const id = fromSome($id);

    return Reply(
      DeferAction(None(), false, async () => {
        const current = await query((sb) =>
          sb.from("guild").select().eq("id", id)
        );

        return await match(current)
          .with(Err_, (message) => MessageReplyAction(message.message))
          .with(Ok_, (res) =>
            match(res)
              .with([], async () => {
                const { error } = await supabase
                  .from("guild")
                  .insert({ dm: dm.id, id });

                if (error) return MessageReplyAction("Failed to initialize.");

                return MessageReplyAction("Successfully initialized server!");
              })
              .otherwise(() =>
                MessageReplyAction("This server is already set up!")
              )
          )
          .exhaustive();
      })
    );
  })
);
