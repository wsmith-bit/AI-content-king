import load from "./loader.js";

const override = process.env.DOTENV_CONFIG_OVERRIDE === "true";
const pathOption = process.env.DOTENV_CONFIG_PATH;

export const parsed = load({
  path: pathOption && pathOption.length > 0 ? pathOption : undefined,
  override,
});

export default parsed;
