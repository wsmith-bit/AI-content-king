# AI Content King

AI Content King provides tools for generating and optimizing SEO friendly content across both the client and server packages in this monorepo.

## Continuous Integration

The **Node CI** workflow in `.github/workflows/node-ci.yml` runs automatically for pushes and pull requests that target the repository's default branch (exposed in GitHub as `$default-branch`, typically `main`). The workflow installs dependencies with `npm ci`, runs available type checks, and builds the application to ensure changes are production ready before merging.
