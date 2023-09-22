import { readdir } from "fs/promises";
import path from "path";
import { EventHandler, isEventHandler } from "../botter/event";

export const handlers = async (): Promise<EventHandler[]> => {
  const dir = await readdir(__dirname + "/handlers");

  const imports = await Promise.all(
    dir
      .filter((file) => [".ts", ".js"].some((ext) => file.endsWith(ext)))
      .map(
        async (file) => await import(path.join(__dirname, "/handlers/", file))
      )
  );

  return imports
    .filter((handler) => Object.keys(handler).includes("default"))
    .map((handler) => handler.default)
    .filter((handler) => isEventHandler(handler));
};
