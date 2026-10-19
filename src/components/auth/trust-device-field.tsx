import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { formatDuration } from "@/lib/duration";

export function TrustDeviceField({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const { twoFactor } = useAuthConfig();
  return (
    <Field orientation="horizontal">
      <Checkbox
        id="trust-device"
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onChange(value)}
      />
      <FieldLabel htmlFor="trust-device">
        Trust this device for {formatDuration(twoFactor.trustDeviceMaxAge)}
      </FieldLabel>
    </Field>
  );
}
