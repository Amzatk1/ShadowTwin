export function formatConfidence(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

