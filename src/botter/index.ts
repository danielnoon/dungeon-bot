import {
  None,
  None_,
  Option,
  Some,
  Some_,
  from,
  fromSome,
  isNone,
  isSome,
  map,
  maybe,
} from "../fp/Option";
import { Config } from "./config";
import {
  Client,
  Events,
  REST,
  Routes,
  CommandInteraction,
  InteractionResponse,
  BaseInteraction,
  ButtonInteraction,
} from "discord.js";
import {
  CommandEvent,
  CommandEventHandler,
  CommandEvent_,
  isCommandEvent,
} from "./event";
import { match } from "ts-pattern";
import { makeSlashCommandContext } from "./context";
import { Reply, isReply } from "./reply";
import {
  Action,
  ActionGroup,
  isAction,
  isActionGroup,
  isAwaitComponentAction,
  isDeferAction,
  isMessageReplyAction,
  isRichMessageReplyAction,
  isShowModalAction,
} from "./action";

const Handlers = () =>
  ({
    slash_commands: new Map<string, CommandEventHandler>(),
  } as const);

const State = () => ({
  replied: false,
  lastReply: None() as Option<InteractionResponse>,
  lastInteraction: None() as Option<BaseInteraction>,
});

async function runCommandAction(
  inter: CommandInteraction,
  action: Action | ActionGroup,
  state: ReturnType<typeof State>
): Promise<any> {
  try {
    return await match(action)
      .when(isMessageReplyAction, async ({ data: content }) => {
        if (state.replied) {
          await inter.editReply({ content });
        } else {
          state.lastReply = Some(await inter.reply({ content }));
          state.replied = true;
        }
      })
      .when(isDeferAction, async ({ data: [message, ephemeral, fn] }) => {
        const reply = await match(message)
          .when(isSome<string>, async ({ data: content }) =>
            inter.reply({ content, ephemeral })
          )
          .otherwise(() => inter.deferReply({ ephemeral }));

        state.lastReply = Some(reply);

        state.replied = true;

        const result = await fn();

        if (isAction(result) || isActionGroup(result)) {
          return runCommandAction(inter, result, state);
        }
      })
      .when(isActionGroup, async ({ data }) => {
        for (const action of data) {
          runCommandAction(inter, action, state);
        }
      })
      .when(isRichMessageReplyAction, async ({ data }) => {
        if (state.replied) {
          await inter.editReply(data);
        } else {
          state.lastReply = Some(await inter.reply(data));
          state.replied = true;
        }
      })
      .when(isAwaitComponentAction, async ({ data }) => {
        const [filter, timeout, errorMessage, handler] = data;

        match(state.lastReply)
          .with(None_, () =>
            inter.editReply("Error. Please contact bot administrator.")
          )
          .with(Some_, async (reply) => {
            try {
              const confirmation = await reply.awaitMessageComponent({
                filter,
                time: timeout,
              });

              state.lastInteraction = Some(confirmation);

              const action = await handler(confirmation as any);

              runCommandAction(inter, action, state);
            } catch {
              await reply.edit(errorMessage);
            }
          });
      })
      .when(isShowModalAction, async ({ data: [modal, callback] }) => {
        await match(state.lastInteraction)
          .with(None_, () => inter.editReply("Logic error. Contact developer."))
          .with(Some_, async (inter) => {
            if (inter.isMessageComponent()) {
              if (!modal.data.custom_id) throw new Error();
              await inter.showModal(modal);
              const newInter = await inter.awaitModalSubmit({
                filter: (i) => i.customId === modal.data.custom_id,
                time: 60_000 * 60,
              });

              state.lastInteraction = Some(newInter);

              const result = await callback(newInter);

              await newInter.deferReply();

              runCommandAction(newInter as any, result, state);
            }
          });
      })
      .exhaustive();
  } catch (err) {
    console.trace(err);
    if (state.replied) {
      inter.editReply("Critical server error.");
    } else {
      inter.reply("Critical server error");
    }
  }
}

export function start(config: Config) {
  const [$token, _, $intents, $handlers] = config.data;

  if ([$token, $intents, $handlers].some(isNone)) {
    throw new Error("please provide token and intent to config.");
  }

  const token = fromSome($token);
  const intents = fromSome($intents);
  const handlers = fromSome($handlers);

  const client = new Client({ intents });

  const _handlers = Handlers();

  handlers.forEach(({ data: ev }) => {
    match(ev).with(CommandEvent_, ([builder, handler]) =>
      _handlers.slash_commands.set(builder.name, handler)
    );
  });

  client.once(Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
  });

  client.on(Events.InteractionCreate, async (inter) => {
    const state = State();
    state.lastInteraction = Some(inter);

    if (inter.isCommand()) {
      const name = inter.commandName;
      const handler = from(_handlers.slash_commands.get(name));

      const ctx = makeSlashCommandContext(inter);

      const response = await maybe(Reply(), (fn) => fn(ctx), handler);

      if (isReply(response)) {
        for (const action of response.data) {
          await runCommandAction(inter, action, state);
        }
      } else {
        await runCommandAction(inter, response, state);
      }
    }
  });

  client.login(token);
}

export async function registerCommandsGlobally(config: Config) {
  const [$token, $appId, $intents, $handlers] = config.data;

  if ([$token, $intents, $handlers].some(isNone)) {
    throw new Error("please provide token and intent to config.");
  }

  const token = fromSome($token);
  const appId = fromSome($appId);
  const intents = fromSome($intents);
  const handlers = fromSome($handlers);

  const events = handlers.map((handler) => handler.data);

  const slashCommands = events
    .filter(isCommandEvent)
    .map(({ data }) => data[0].toJSON());

  console.log(
    "Registering slash commands:",
    slashCommands.map((command) => command.name)
  );

  const rest = new REST().setToken(token);
  const data = (await rest.put(Routes.applicationCommands(appId), {
    body: slashCommands,
  })) as any;

  console.log(`Successfully reloaded ${data.length} application (/) commands.`);
}
