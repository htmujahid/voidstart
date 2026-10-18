export { cn } from "cn";

export function humanizeCode(code: string) {
  const text = code.replaceAll("_", " ").toLowerCase();
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}
