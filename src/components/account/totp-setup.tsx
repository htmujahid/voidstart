import { QRCodeSVG } from "qrcode.react";

import { FieldDescription, FieldLabel } from "@/components/ui/field";
import { parseTotpSecret } from "@/lib/auth/two-factor";

export function TotpSetup({ uri }: { uri: string }) {
  const secret = parseTotpSecret(uri);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-lg bg-white p-3">
        <QRCodeSVG value={uri} size={160} />
      </div>
      {secret && (
        <div className="flex w-full flex-col gap-1 text-center">
          <FieldLabel className="justify-center">
            Can&apos;t scan? Enter this key instead
          </FieldLabel>
          <code className="rounded-md bg-muted px-2 py-1 font-mono text-sm break-all select-all">
            {secret}
          </code>
        </div>
      )}
      <FieldDescription className="text-center">
        Scan the QR code with an authenticator app such as 1Password, Authy or Google Authenticator.
      </FieldDescription>
    </div>
  );
}
