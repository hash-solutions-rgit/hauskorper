import { Address } from "@vapestation/database";

export function formatAddress(address: Address): string {
  return `${address.line1}, ${address.line2 ? address.line2 + "," : ""} ${address.city}, ${address.post_code}`.trim();
}
