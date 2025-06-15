# Orbital Monorepo Commands

This document describes how to use the CLI and Yarn scripts provided by the  
Orbital Monorepo Template.

## Yarn Scripts

- **build**: `yarn build`  
  Runs `turbo run build` to compile all workspaces.

- **test**: `yarn test`  
  Runs `turbo run test` to execute all tests in all workspaces (libs, services, clients, orb).

- **lint**: `yarn lint`  
  Runs `turbo run lint` to lint all workspaces.

- **orb**: `yarn orb <command>`  
  Launches the custom CLI (Orb) for scaffolding and managing projects.

## Orb CLI Commands (via `yarn orb`)

The Orb CLI offers the following commands:

**`yarn orb help`**  
 Displays help information and available commands.

**Monorepo management**

- `yarn orb monorepo install`  
  Installs the `monorepo-template` remote in your Git repository.
- `yarn orb monorepo update`  
  Fetches and merges upstream changes from the `monorepo-template` remote.
- `yarn orb monorepo test`  
  Runs monorepo-template integration tests (equivalent to `yarn test:monorepo-template`).

**Project scaffolding**

- `yarn orb create <category> <template> <name>`  
   Creates a new project from a template.
  - `category`: `library`, `service`, or `client`.
  - `template`: e.g., `ts-lib`, `nestjs`, `client`.
  - `name`: Package name (scoped names allowed, e.g., `@org/pkg`).  
    Example:

```bash
yarn orb create library ts-lib @myorg/utils
```

**Interactive management**

- `yarn orb manage`  
  Launches an interactive prompt to create projects, manage environment variables, or run monorepo commands.

## Running Monorepo Tests

To test only the monorepo template itself:

```bash
yarn orb monorepo test
```

Or equivalently:

```bash
yarn test:monorepo-template
```

## Running All Tests

To run all tests across your workspace:

```bash
yarn test
```
