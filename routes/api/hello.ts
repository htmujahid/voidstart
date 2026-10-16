import { defineHandler } from "void";

export const GET = defineHandler(() => {
  return {
    message: "Hello from Void",
    database: "D1",
  };
});
