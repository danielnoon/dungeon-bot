import { configDotenv } from "dotenv";
import { registerCommandsGlobally, start } from "./botter";
import { Config } from "./botter/config";
import { Some, from, maybe } from "./fp/Option";
import { handlers } from "./bot";
import { c2 } from "./fp";
import { eq } from "./fp/ord";
import { GatewayIntentBits } from "discord.js";

configDotenv();

const runner = maybe(false, c2(eq)("push"), from(process.argv.at(-1)))
  ? registerCommandsGlobally
  : start;

(async () =>
  runner(
    Config(
      from(process.env.BOT_TOKEN),
      from(process.env.APP_ID),
      Some(GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent),
      from(await handlers())
    )
  ))();
