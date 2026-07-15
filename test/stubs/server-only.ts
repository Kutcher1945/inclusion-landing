// Stub for the `server-only` marker package: it throws by design outside the
// `react-server` module condition (see node_modules/server-only/index.js), which
// Vitest doesn't set. Aliased here so server-only modules stay testable as plain
// TS without pulling Vitest into a full RSC-aware setup.
export {};
