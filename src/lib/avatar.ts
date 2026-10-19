export const AVATAR_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
export const AVATAR_MAX_SIZE = 2 * 1024 * 1024;

export async function uploadAvatar(file: File) {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/avatars", { method: "POST", body });
  const data = (await response.json().catch(() => null)) as {
    url?: string;
    error?: string;
  } | null;
  if (!response.ok || !data?.url) throw new Error(data?.error ?? "Couldn't upload the image.");
  return data.url;
}

export async function deleteAvatar() {
  const response = await fetch("/api/avatars", { method: "DELETE" });
  if (!response.ok) throw new Error("Couldn't remove the image.");
}
