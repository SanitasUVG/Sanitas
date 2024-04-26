import { afterEach } from "vitest";

async function importTestDependencies() {
  const { cleanup } = await import("@testing-library/react");
  await import("@testing-library/jest-dom/vitest");

  return { cleanup };
}

afterEach(async () => {
  const { cleanup } = await importTestDependencies();
  cleanup();
});
