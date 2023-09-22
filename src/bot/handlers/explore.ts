import { SlashCommandBuilder } from "discord.js";
import { CommandEvent, EventHandler } from "../../botter/event";
import { Reply } from "../../botter/reply";
import { DeferAction, MessageReplyAction } from "../../botter/action";
import {
  None,
  None_,
  Option,
  Some_,
  from,
  fromSome,
  map,
} from "../../fp/Option";
import { query, supabase } from "../supabase";
import { match } from "ts-pattern";
import { Err_, Ok_, isOk } from "../../fp/Result";

const command = new SlashCommandBuilder()
  .setName("explore")
  .setDescription("Explore the world!");

function randomElement<T>(list: T[]): Option<T> {
  const idx = Math.floor(Math.random() * list.length);

  return from(list.at(idx));
}

const S_GUILD_ERROR = "You can only use this command from inside a server!";
const S_FETCH_ERROR = "There was an error fetching data from the database.";
const S_EMPTY_TABLE =
  "Could not find any creatures :(\nMaybe make one with `/createcreature`?";

export default EventHandler(
  CommandEvent(command, (ctx) =>
    Reply(
      DeferAction(None(), false, async () => {
        const result = map(
          (id) => query((s) => s.from("creatures").select().eq("guild", id)),
          ctx.guildId
        );

        const message = await match(result)
          .with(None_, () => S_GUILD_ERROR)
          .with(Some_, async (data) =>
            match(await data)
              .with(Err_, () => S_FETCH_ERROR)
              .with(Ok_, (creatures) =>
                match(creatures)
                  .with([], () => S_EMPTY_TABLE)
                  .otherwise(() => fromSome(randomElement(creatures)).name)
              )
              .exhaustive()
          )
          .exhaustive();

        return MessageReplyAction(message);
      })
    )
  )
);
