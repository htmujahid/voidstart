import { CopyIcon, DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { useAuthConfig } from "@/hooks/use-auth-config";

export function BackupCodes({ codes }: { codes: string[] }) {
  const { appName } = useAuthConfig();
  const text = codes.join("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ type: "success", title: "Backup codes copied" });
    } catch {
      toast.add({ type: "error", title: "Couldn't copy backup codes" });
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${appName}-backup-codes.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-3">
      <FieldDescription>
        Store these somewhere safe. Each code works once if you lose access to your other methods.
      </FieldDescription>
      <ul className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/50 p-3 font-mono text-sm">
        {codes.map((code) => (
          <li key={code} className="text-center select-all">
            {code}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={copy}>
          <CopyIcon />
          Copy
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={download}>
          <DownloadIcon />
          Download
        </Button>
      </div>
    </div>
  );
}
