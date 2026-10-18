const browsers = [
  ["Edge", /Edg\//],
  ["Opera", /OPR\//],
  ["Chrome", /Chrome\//],
  ["Firefox", /Firefox\//],
  ["Safari", /Safari\//],
] as const;

const systems = [
  ["Windows", /Windows/],
  ["Android", /Android/],
  ["iOS", /iPhone|iPad/],
  ["macOS", /Mac OS X/],
  ["Linux", /Linux/],
] as const;

export function describeUserAgent(userAgent?: string | null) {
  if (!userAgent) return "Unknown device";
  const browser = browsers.find(([, pattern]) => pattern.test(userAgent))?.[0];
  const system = systems.find(([, pattern]) => pattern.test(userAgent))?.[0];
  if (browser && system) return `${browser} on ${system}`;
  return browser ?? system ?? "Unknown device";
}
