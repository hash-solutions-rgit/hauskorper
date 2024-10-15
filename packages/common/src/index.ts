import {
  amber,
  blue,
  cyan,
  emerald,
  fuchsia,
  pink,
  red,
  green,
  indigo,
  orange,
  purple,
  rose,
  teal,
  violet,
  sky,
  lime,
  yellow,
} from "tailwindcss/colors";

export const stringToSlug = (str: string): string => {
  return str
    .toLowerCase() // Convert to lowercase
    .trim() // Trim whitespace from both sides
    .replace(/[^a-z0-9\s-]/g, "") // Remove all non-alphanumeric characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with a single hyphen
};

/**
 * @description Function to get the full path of an image
 * @param path string
 * @returns string
 */
export const imageFullPath = (path: string): string => {
  return `${process.env.NEXT_PUBLIC_AWS_MEDIA_BASE_URL}/${path}`;
};

// Function to convert camelCase to normal case
export function camelCaseToNormalCase(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // Add a space before each capital letter
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
}

type Shade =
  | "50"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900";

/**
 * @name randomBgColorByShade
 * @description Function to generate a random background color based on the shade provided from tailwindcss color
 * @param shade - The shade of the color to generate
 * @returns string
 * @example randomBgColorByShade("500")
 * @default "500"
 */
export const randomBgColorByShade = (shade: Shade): string => {
  const colors = [
    amber,
    blue,
    cyan,
    emerald,
    fuchsia,
    pink,
    red,
    green,
    indigo,
    orange,
    purple,
    rose,
    teal,
    violet,
    sky,
    lime,
    yellow,
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  if (!randomColor || !randomColor[shade]) return blue[500];

  return randomColor[shade];
};

export function roundToTwoCeil(value: number): number {
  return Math.ceil(value * 100) / 100;
}

export const generateOrderId = (): string => {
  return `AHMU${Math.floor(100000 + Math.random() * 999999)}`;
};

export function priceCalculatorWithTax(
  price: number,
  taxPercent: number,
): number {
  return roundToTwoCeil(price * (1 + taxPercent / 100));
}
