import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";

import { CodeInput } from "@/components/auth/code-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { authClient } from "@/lib/auth/auth-client";

import { BackupCodes } from "./backup-codes";
import { TextField } from "./text-field";
import { TotpSetup } from "./totp-setup";

type Method = "totp" | "otp";
type Step = "start" | "setup" | "backup";

const methodLabels: Record<Method, { label: string; description: string }> = {
  totp: {
    label: "Authenticator app",
    description: "Use a code from an app on your phone. Recommended.",
  },
  otp: {
    label: "Email code",
    description: "We'll email you a code each time you sign in.",
  },
};

export function EnableTwoFactorDialog({ requiresPassword }: { requiresPassword: boolean }) {
  const router = useRouter();
  const { twoFactor } = useAuthConfig();
  const methods = (["totp", "otp"] as const).filter((m) => twoFactor[m].enabled);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("start");
  const [totpURI, setTotpURI] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const form = useForm({
    defaultValues: { password: "", method: methods[0] },
    onSubmit: async ({ value }) => {
      const { data, error } = await authClient.twoFactor.enable({
        password: value.password,
        method: value.method,
      });
      if (error || !data) {
        toast.add({
          type: "error",
          title: "Couldn't enable two-factor authentication",
          description: error?.message ?? "Unable to start setup.",
        });
        return;
      }
      if (data.method === "otp") {
        await finish();
        return;
      }
      setTotpURI(data.totpURI ?? "");
      setBackupCodes(data.backupCodes ?? []);
      setStep(twoFactor.skipVerificationOnEnable ? "backup" : "setup");
    },
  });

  function reset() {
    setOpen(false);
    setStep("start");
    setTotpURI("");
    setBackupCodes([]);
    setCode("");
    form.reset();
  }

  async function finish() {
    reset();
    await router.invalidate();
    toast.add({ type: "success", title: "Two-factor authentication enabled" });
  }

  async function verify(value: string) {
    setVerifying(true);
    const { error } = await authClient.twoFactor.verifyTotp({ code: value });
    setVerifying(false);
    if (error) {
      setCode("");
      toast.add({
        type: "error",
        title: "Invalid code",
        description: error.message ?? "Check your authenticator app and try again.",
      });
      return;
    }
    setStep("backup");
  }

  function onOpenChange(next: boolean) {
    if (next) {
      setOpen(true);
      return;
    }
    if (step === "backup") void finish();
    else reset();
  }

  if (methods.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />}>Enable</DialogTrigger>
      <DialogContent>
        {step === "start" && (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit();
            }}
          >
            <DialogHeader>
              <DialogTitle>Enable two-factor authentication</DialogTitle>
              <DialogDescription>
                Add a second step when you sign in with a password.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              {methods.length > 1 && (
                <form.Field name="method">
                  {(field) => (
                    <RadioGroup
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value as Method)}
                    >
                      {methods.map((m) => (
                        <FieldLabel key={m} htmlFor={`method-${m}`}>
                          <Field orientation="horizontal">
                            <div className="flex flex-1 flex-col gap-1">
                              <span className="font-medium">{methodLabels[m].label}</span>
                              <FieldDescription>{methodLabels[m].description}</FieldDescription>
                            </div>
                            <RadioGroupItem id={`method-${m}`} value={m} />
                          </Field>
                        </FieldLabel>
                      ))}
                    </RadioGroup>
                  )}
                </form.Field>
              )}
              {requiresPassword && (
                <form.Field
                  name="password"
                  validators={{
                    onSubmit: ({ value }) => (value ? undefined : "Password is required."),
                  }}
                >
                  {(field) => (
                    <TextField
                      field={field}
                      label="Confirm your password"
                      type="password"
                      autoComplete="current-password"
                    />
                  )}
                </form.Field>
              )}
            </FieldGroup>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
              <form.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Spinner />}
                    Continue
                  </Button>
                )}
              </form.Subscribe>
            </DialogFooter>
          </form>
        )}

        {step === "setup" && (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (code.length === twoFactor.totp.digits) void verify(code);
            }}
          >
            <DialogHeader>
              <DialogTitle>Set up your authenticator app</DialogTitle>
              <DialogDescription>
                Then enter the {twoFactor.totp.digits}-digit code it shows to finish.
              </DialogDescription>
            </DialogHeader>
            <TotpSetup uri={totpURI} />
            <Field className="items-center">
              <FieldLabel htmlFor="setup-code">Authentication code</FieldLabel>
              <CodeInput
                id="setup-code"
                length={twoFactor.totp.digits}
                value={code}
                onChange={setCode}
                onComplete={verify}
                disabled={verifying}
              />
            </Field>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
              <Button type="submit" disabled={verifying || code.length !== twoFactor.totp.digits}>
                {verifying && <Spinner />}
                Verify and enable
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "backup" && (
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Save your backup codes</DialogTitle>
              <DialogDescription>
                Two-factor authentication is on. Keep these codes in case you lose your device.
              </DialogDescription>
            </DialogHeader>
            <BackupCodes codes={backupCodes} />
            <DialogFooter>
              <Button type="button" onClick={() => void finish()}>
                I&apos;ve saved my codes
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
