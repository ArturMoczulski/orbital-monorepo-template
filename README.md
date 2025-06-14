# Orbital Monorepo Template

This repository contains a **living template** for a full-stack monorepo powered by Yarn Workspaces, Turborepo, and TypeScript. It provides a standardized directory structure, testing setup, and a CLI tool (`yarn orb`) to scaffold new packages.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Yarn Scripts](#yarn-scripts)
- [CLI Usage](#cli-usage)
- [Environment Variables](#environment-variables)
- [Package Templates](#package-templates)
- [Contributing](#contributing)
- [License](#license)

## Features

- Monorepo structure with `libs/`, `services/`, and `clients/` folders
- Yarn Plug’n’Play (PnP) support
- Turborepo for fast task pipelines (`build`, `test`, `lint`)
- Built-in scaffolding CLI (`yarn orb`)
- Environment management using `dotenv-flow`
- Preconfigured Jest (unit/integration/e2e) with `ts-jest`

## Getting Started

Clone or fork the repository:

```bash
git clone git@github.com:ArturMoczulski/orbital-monorepo-template.git my-project
# or fork on GitHub and then clone your fork
cd my-project
yarn orb monorepo install
```

**Note:** If you cloned the repository directly (instead of forking), after running `yarn orb monorepo install`, update your `origin` remote to point to your new GitHub repository:

```bash
git remote set-url origin git@github.com:<your-username>/<your-repo>.git
```

## Staying Up to Date

When the upstream monorepo receives updates, you can pull new changes into your project:

```bash
yarn orb monorepo update
```

## Yarn Scripts

All commands run across workspaces via Turborepo:

```bash
yarn build      # Build all packages
yarn test       # Run all tests
yarn lint       # Lint all packages
yarn orb        # Launch the interactive CLI
yarn orb monorepo install # Install the 'monorepo-template' remote for this repo.
yarn orb monorepo update  # Update the monorepo by merging from monorepo-template remote
```

## CLI Usage

Scaffold new packages:

```bash
# Show help
yarn orb help

# Generate a new library from the ts-lib template
yarn orb generate library ts-lib my-lib

# Create a new service from the nestjs template
yarn orb create service nestjs my-service
```

Manage existing projects and environment variables:

```bash
yarn orb manage
yarn orb monorepo install # Install the 'monorepo-template' remote for this repo.
yarn orb monorepo update  # Update the monorepo by merging from monorepo-template remote
```

## Environment Variables

This monorepo uses [`dotenv-flow`](https://github.com/kerimdzhanov/dotenv-flow) to load layered env files:

1. Root files: `.env`, `.env.development`, `.env.production`, etc.
2. Package files: `packages/<name>/.env.template`, `.env.development`, etc.

Variables merge in order, with package-level overrides. Use `dotenv-flow` in scripts or via the CLI.

## Package Templates

Located in the `templates/` directory:

- `ts-lib`: TypeScript library scaffold
- `nestjs`: NestJS service scaffold

## Contributing

- Fork this repo or use it as a GitHub Template.
- Pull requests are welcome for new features or fixes.
- Maintain versioned releases for downstream projects.

## License

MIT
