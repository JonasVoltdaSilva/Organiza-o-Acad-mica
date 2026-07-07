/**
 * Clareia uma cor hex misturando-a com branco.
 * `amount` vai de 0 (cor original) a 1 (branco puro).
 * Cores fora do formato #RGB/#RRGGBB são devolvidas sem alteração.
 */
export function lighten(hex: string, amount: number): string {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return hex;

  let value = match[1];
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const channels = [0, 2, 4].map((i) => {
    const channel = parseInt(value.slice(i, i + 2), 16);
    return Math.round(channel + (255 - channel) * amount);
  });

  return `#${channels.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
