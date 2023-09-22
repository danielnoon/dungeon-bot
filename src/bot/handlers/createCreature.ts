import { CommandEvent, EventHandler } from "../../botter/event";
import { SlashCommandBuilder } from "discord.js";
import { Reply } from "../../botter/reply";
import { DeferAction, MessageReplyAction } from "../../botter/action";
import { None, Some, fromSome, isNone } from "../../fp/Option";
import { supabase } from "../supabase";

const command = new SlashCommandBuilder()
  .setName("createcreature")
  .setDescription("Creates a new creature in the database.")
  .addStringOption((option) =>
    option
      .setName("name")
      .setDescription("Name of the creature.")
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("hp")
      .setDescription("Creature's base hit points")
      .setMinValue(0)
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("mp")
      .setDescription("Creature's base magic points")
      .setMinValue(0)
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("attack")
      .setDescription("Creature's attack stat")
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("defense")
      .setDescription("Creature's defense stat")
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("magic")
      .setDescription("Creature's magic stat")
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("speed")
      .setDescription("Creature's speed stat")
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("luck")
      .setDescription("Creature's luck stat")
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("accuracy")
      .setDescription("Creature's accuracy stat")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("image_url")
      .setDescription("Link to an image of this creature.")
      .setRequired(true)
  ) as SlashCommandBuilder;

export default EventHandler(
  CommandEvent(command, (ctx) => {
    if (isNone(ctx.guildId))
      return Reply(
        MessageReplyAction("You can only use this command in a server.")
      );

    const strings = ["name", "image_url"].map(
      (val) => [val, ctx.options.getString(val)] as const
    );

    const numbers = [
      "hp",
      "mp",
      "attack",
      "defense",
      "magic",
      "speed",
      "luck",
      "accuracy",
    ].map((val) => [val, ctx.options.getNumber(val)] as const);

    const combined = [...strings, ...numbers];

    if (combined.map((v) => v[1]).some(isNone)) {
      return Reply(MessageReplyAction("Required parameters missing."));
    }

    const data = Object.fromEntries(
      combined.map(([k, v]) => [k, fromSome(v as Some<string | number>)])
    );

    return Reply(
      DeferAction(None(), false, async () => {
        const { error } = await supabase.from("creatures").insert([
          {
            name: data.name as string,
            image_url: [data.image_url as string],
            hp: data.hp as number,
            mp: data.mp as number,
            atk: data.attack as number,
            def: data.defense as number,
            mgk: data.magic as number,
            acc: data.accuracy as number,
            lck: data.luck as number,
            spd: data.speed as number,
            guild: fromSome(ctx.guildId),
          },
        ]);

        if (error) {
          return MessageReplyAction("ERROR: " + error.message);
        }

        return MessageReplyAction(
          `Successfully created creature ${data.name}.`
        );
      })
    );
  })
);
