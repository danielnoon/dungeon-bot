import { from, fromSome, isNone, isSome, map, maybe } from "../fp/Option";
import { Config } from "./config";
import { Client, Events, REST, Routes, CommandInteraction } from "discord.js";
import {
  CommandEvent,
  CommandEventHandler,
  CommandEvent_,
  isCommandEvent,
} from "./event";
import { match } from "ts-pattern";
import { makeSlashCommandContext } from "./context";
import { Reply } from "./reply";
import {
  Action,
  ActionGroup,
  isAction,
  isActionGroup,
  isDeferAction,
  isMessageReplyAction,
} from "./action";

const Handlers = () =>
  ({
    slash_commands: new Map<string, CommandEventHandler>(),
  } as const);

const State = () => ({
  replied: false,
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
          await inter.reply({ content });
        }
      })
      .when(isDeferAction, async ({ data: [message, ephemeral, fn] }) => {
        await match(message)
          .when(isSome<string>, ({ data: content }) =>
            inter.reply({ content, ephemeral })
          )
          .otherwise(() => inter.deferReply({ ephemeral }));

        const result = await fn();

        if (isAction(result) || isActionGroup(result)) {
          return runCommandAction(inter, result, { ...state, replied: true });
        }
      })
      .when(isActionGroup, async ({ data }) => {
        for (const action of data) {
          runCommandAction(inter, action, state);
        }
      })
      .exhaustive();
  } catch (err) {
    console.trace(err);
    if (inter.replied) {
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

    if (inter.isCommand()) {
      const name = inter.commandName;
      const handler = from(_handlers.slash_commands.get(name));

      const ctx = makeSlashCommandContext(inter);

      const response = await maybe(Reply(), (fn) => fn(ctx), handler);

      for (const action of response.data) {
        await runCommandAction(inter, action, state);
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
