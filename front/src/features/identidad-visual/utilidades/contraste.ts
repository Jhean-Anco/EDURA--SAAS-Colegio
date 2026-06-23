export interface ContrastResult {
  ratio: number;
  passAA: boolean;
  passAALarge: boolean;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r: string, g: string, b: string) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  
  if (!result || !result[1] || !result[2] || !result[3]) {
    return null;
  }
  
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  const lR = a[0] ?? 0;
  const lG = a[1] ?? 0;
  const lB = a[2] ?? 0;
  return lR * 0.2126 + lG * 0.7152 + lB * 0.0722;
}

export function calcularContraste(colorHex1: string, colorHex2: string): ContrastResult {
  const rgb1 = hexToRgb(colorHex1);
  const rgb2 = hexToRgb(colorHex2);

  if (!rgb1 || !rgb2) {
    return { ratio: 1, passAA: false, passAALarge: false };
  }

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);

  const ratio = (brightest + 0.05) / (darkest + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    passAA: ratio >= 4.5,
    passAALarge: ratio >= 3.0,
  };
}
