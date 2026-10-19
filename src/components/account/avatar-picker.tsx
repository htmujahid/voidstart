import { cn } from "cn";
import { CameraIcon, ImageUpIcon, Trash2Icon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldLabel } from "@/components/ui/field";
import { formatBytes, type FileUploadActions } from "@/hooks/use-file-upload";
import { AVATAR_MAX_SIZE } from "@/lib/avatar";

export function AvatarPicker({
  src,
  initials,
  pendingFile,
  isDragging,
  disabled,
  canRemove,
  actions,
  onRemove,
}: {
  src: string | undefined;
  initials: string;
  pendingFile: File | null;
  isDragging: boolean;
  disabled: boolean;
  canRemove: boolean;
  actions: FileUploadActions;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border border-dashed p-4 transition-colors sm:flex-row",
        isDragging && "border-primary bg-accent",
      )}
      onDragEnter={actions.handleDragEnter}
      onDragLeave={actions.handleDragLeave}
      onDragOver={actions.handleDragOver}
      onDrop={actions.handleDrop}
    >
      <button
        type="button"
        aria-label="Choose a profile photo"
        disabled={disabled}
        onClick={actions.openFileDialog}
        className="group/photo relative shrink-0 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none"
      >
        <Avatar className="size-20">
          <AvatarImage src={src} alt="" />
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 text-background opacity-0 transition-opacity group-hover/photo:opacity-100 group-focus-visible/photo:opacity-100">
          <CameraIcon className="size-5" />
        </span>
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1 text-center sm:text-left">
        <FieldLabel htmlFor="avatar-input" className="justify-center sm:justify-start">
          Profile photo
        </FieldLabel>
        <FieldDescription>
          {pendingFile ? (
            <>
              <span className="font-medium text-foreground">{pendingFile.name}</span> (
              {formatBytes(pendingFile.size, 0)}) is ready. Press Save to apply it.
            </>
          ) : (
            <>PNG, JPG, WebP or GIF, up to {formatBytes(AVATAR_MAX_SIZE, 0)}. Drag a file here.</>
          )}
        </FieldDescription>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={actions.openFileDialog}
        >
          <ImageUpIcon />
          {src ? "Change" : "Upload"}
        </Button>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove photo"
            disabled={disabled}
            onClick={onRemove}
          >
            <Trash2Icon />
          </Button>
        )}
      </div>
      <input
        {...actions.getInputProps({ disabled })}
        id="avatar-input"
        className="sr-only"
        tabIndex={-1}
      />
    </div>
  );
}
