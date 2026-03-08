/**
 * Generates a deterministic SVG avatar from a seed string.
 * Uses the seed to derive colors and a simple geometric pattern.
 */
export const generateAvatarSvg = (seed: string, size = 80): string => {
  // Simple hash from seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit int
  }

  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40) % 360;
  const hue3 = (hue1 + 120) % 360;

  // Use hash bits to determine pattern
  const pattern = Math.abs(hash >> 8) % 4;
  const bgColor = `hsl(${hue1}, 35%, 85%)`;
  const fg1 = `hsl(${hue2}, 45%, 55%)`;
  const fg2 = `hsl(${hue3}, 40%, 65%)`;

  let shapes = "";
  const c = size / 2;
  const r = size * 0.35;

  switch (pattern) {
    case 0: // Concentric circles
      shapes = `
        <circle cx="${c}" cy="${c}" r="${r}" fill="${fg1}" opacity="0.7"/>
        <circle cx="${c}" cy="${c}" r="${r * 0.55}" fill="${fg2}" opacity="0.8"/>
      `;
      break;
    case 1: // Flower petals
      shapes = Array.from({ length: 5 }, (_, i) => {
        const angle = (i * 72 - 90) * (Math.PI / 180);
        const cx = c + Math.cos(angle) * r * 0.5;
        const cy = c + Math.sin(angle) * r * 0.5;
        return `<circle cx="${cx}" cy="${cy}" r="${r * 0.35}" fill="${i % 2 === 0 ? fg1 : fg2}" opacity="0.7"/>`;
      }).join("");
      shapes += `<circle cx="${c}" cy="${c}" r="${r * 0.2}" fill="${fg1}"/>`;
      break;
    case 2: // Diamond
      shapes = `
        <rect x="${c - r * 0.5}" y="${c - r * 0.5}" width="${r}" height="${r}" rx="4"
              fill="${fg1}" opacity="0.7" transform="rotate(45 ${c} ${c})"/>
        <circle cx="${c}" cy="${c}" r="${r * 0.2}" fill="${fg2}"/>
      `;
      break;
    case 3: // Leaf
      shapes = `
        <ellipse cx="${c - r * 0.15}" cy="${c}" rx="${r * 0.55}" ry="${r * 0.3}" fill="${fg1}" opacity="0.7" transform="rotate(-30 ${c} ${c})"/>
        <ellipse cx="${c + r * 0.15}" cy="${c}" rx="${r * 0.55}" ry="${r * 0.3}" fill="${fg2}" opacity="0.6" transform="rotate(30 ${c} ${c})"/>
      `;
      break;
  }

  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="${bgColor}"/>
      ${shapes}
    </svg>`
  )}`;
};
