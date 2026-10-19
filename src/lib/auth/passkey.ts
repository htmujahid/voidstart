import { useSyncExternalStore } from "react";

const noop = () => () => {};

export function usePasskeySupported() {
  return useSyncExternalStore(
    noop,
    () => typeof window !== "undefined" && "PublicKeyCredential" in window,
    () => false,
  );
}

const cancelledCodes = [
  "AUTH_CANCELLED",
  "REGISTRATION_CANCELLED",
  "ERROR_CEREMONY_ABORTED",
  "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
];

export function isPasskeyCancelled(error: object) {
  return "code" in error && typeof error.code === "string" && cancelledCodes.includes(error.code);
}
