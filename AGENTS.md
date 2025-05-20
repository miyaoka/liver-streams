# Contributor Guide

## Testing Instructions

- From the package root you can just call `pnpm vitest run`. The commit should pass all tests before you merge.
- To focus on one step, add the Vitest pattern: `pnpm vitest run "<file path>" -t "<test name>"`.
- Fix any test or type errors until the whole suite is green.
- After moving files or changing imports, run `pnpm run lint` and `pnpm run type-check` to be sure ESLint and TypeScript rules still pass.
- Add or update tests for the code you change, even if nobody asked.
