export function parseDateUTC(dateStr: string): Date {
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  }
  const clean = String(dateStr).replace(/[^0-9]/g, "");
  if (clean.length >= 8) {
    return new Date(Date.UTC(
      Number(clean.substring(0, 4)),
      Number(clean.substring(4, 6)) - 1,
      Number(clean.substring(6, 8)),
    ));
  }
  return new Date(dateStr);
}

export function firestoreDateToString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const d = value.toDate();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  }
  return String(value ?? "");
}

export const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export const MONTH_ABBRS = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];
