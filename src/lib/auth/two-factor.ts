export const twoFactorPaths = {
  totp: "/auth/two-factor",
  otp: "/auth/two-factor/otp",
  backupCode: "/auth/two-factor/backup-code",
} as const;

export function isTwoFactorRedirect(
  data: unknown,
): data is { twoFactorRedirect: true; twoFactorMethods?: string[] } {
  return (
    typeof data === "object" &&
    data !== null &&
    "twoFactorRedirect" in data &&
    data.twoFactorRedirect === true
  );
}

export function twoFactorPath(methods: string[] = []) {
  if (methods.includes("totp")) return twoFactorPaths.totp;
  if (methods.includes("otp")) return twoFactorPaths.otp;
  return twoFactorPaths.backupCode;
}

export function parseTotpSecret(uri: string) {
  try {
    return new URL(uri).searchParams.get("secret") ?? "";
  } catch {
    return "";
  }
}
