import { buildMock, type Mock } from "./data";

let cached: Mock | null = null;
export function getMock(): Mock {
  if (!cached) cached = buildMock(42);
  return cached;
}
