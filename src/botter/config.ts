import { make } from "../fp/Type";
import { Option } from "../fp/Option";
import { EventHandler } from "./event";

type Data = [
  token: Option<string>,
  appId: Option<string>,
  intents: Option<number>,
  handlers: Option<EventHandler[]>
];

const _config = Symbol("Config");
export const Config = (...data: Data) => make(_config, data);
export type Config = ReturnType<typeof Config>;
