import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { CommandEvent, EventHandler } from "../../botter/event";
import {
  ActionGroup,
  AwaitComponentAction,
  DeferAction,
  MessageReplyAction,
  RichMessageReplyAction,
  ShowModalAction,
} from "../../botter/action";
import { None, fromSome } from "../../fp/Option";
import { query, supabase } from "../supabase";
import { P, match } from "ts-pattern";
import { Err_, Ok_ } from "../../fp/Result";

const S_SUCCESS = "Looks like you're ready to make your character!";
const S_EXISTS =
  "Looks like you already have a character made. Ask your DM for more details.";
const S_DB_ERROR = "There was an error querying the database.";

const command = new SlashCommandBuilder()
  .setName("createcharacter")
  .setDescription("Create your character!");

const continueButton = new ButtonBuilder()
  .setLabel("Create your character!")
  .setStyle(ButtonStyle.Primary)
  .setCustomId("create-character");

const successActions = new ActionRowBuilder<ButtonBuilder>().addComponents(
  continueButton
);

const success = RichMessageReplyAction({
  components: [successActions],
  content: S_SUCCESS,
});

const failure_exists = MessageReplyAction(S_EXISTS);
const failure_error = MessageReplyAction(S_DB_ERROR);

const NAME_ID = "characterBuilderName";
const PORTRAIT_ID = "characterBuilderPortrait";

const characterNameInput = new TextInputBuilder()
  .setCustomId(NAME_ID)
  .setLabel("Character name")
  .setStyle(TextInputStyle.Short)
  .setRequired(true);

const characterPortraitInput = new TextInputBuilder()
  .setCustomId(PORTRAIT_ID)
  .setLabel("Character portrait url")
  .setStyle(TextInputStyle.Short)
  .setRequired(false);

const characterModal = new ModalBuilder()
  .setTitle("Create Character")
  .setCustomId("createCharacterModal")
  .addComponents(
    [characterNameInput, characterPortraitInput].map((input) =>
      new ActionRowBuilder<TextInputBuilder>().addComponents(input)
    )
  );

const createCharacter = async (ctx: ModalSubmitInteraction) => {
  const name = ctx.fields.getTextInputValue(NAME_ID);
  const portrait = ctx.fields.getTextInputValue(PORTRAIT_ID);

  const { error } = await supabase.from("players").insert({
    name,
    portrait,
    guild: ctx.guildId!,
    user: ctx.user.id,
  });

  if (error) return MessageReplyAction("Something went wrong.");

  return MessageReplyAction(`Congrats! ${name} was created 🎉`);
};

const clickHandler = (userId: string) =>
  AwaitComponentAction(
    (i) => i.user.id === userId,
    60_000,
    "Too slow, please try again.",
    () => ShowModalAction(characterModal, createCharacter)
  );

export default EventHandler(
  CommandEvent(command, (ctx) =>
    DeferAction(None(), false, async () => {
      const guild = fromSome(ctx.guildId);

      const $player = await query((sb) =>
        sb.from("players").select().eq("guild", guild)
      );

      return match($player)
        .with(Err_, () => failure_error)
        .with(Ok_, (data) =>
          match(data)
            .with(P.not([]), () => failure_exists)
            .otherwise(() => ActionGroup(success, clickHandler(ctx.user.id)))
        )
        .exhaustive();
    })
  )
);
