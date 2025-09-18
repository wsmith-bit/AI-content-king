import load from "./loader.js";

export function config(options = {}) {
  const parsed = load(options);
  return { parsed };
}

export default {
  config,
};
