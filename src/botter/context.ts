import { None, bind, from, map } from "../fp/Option";
import { CommandInteraction, CommandInteractionOption, User } from "discord.js";
import { Option } from "../fp/Option";

export function makeSlashCommandContext(inter: CommandInteraction) {
  const getString = (name: string): Option<string> =>
    from(inter.options.get(name)?.value?.toString());

  const get = (name: string): Option<CommandInteractionOption> =>
    from(inter.options.get(name));

  const getStrings = (...names: string[]): Option<string>[] =>
    names.map(getString);

  const getNumber = (name: string): Option<number> =>
    bind(get(name), (option) =>
      typeof option.value === "number" ? from(option.value) : None()
    );

  const getNumbers = (...names: string[]): Option<number>[] =>
    names.map(getNumber);

  const getUser = (name: string): Option<User> =>
    from(inter.options.getUser(name));

  return {
    channel: from(inter.channel),
    channelId: inter.channelId,
    command: from(inter.command),
    commandGuildId: from(inter.commandGuildId),
    commandId: inter.commandId,
    commandName: inter.commandName,
    commandType: inter.commandType,
    guild: from(inter.guild),
    guildId: from(inter.guildId),
    user: inter.user,
    options: {
      get,
      getString,
      getStrings,
      getNumber,
      getNumbers,
      getUser,
    },
  };
}
