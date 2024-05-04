<h1 align="center">
  <a href="https://docs.typesync.org">
    Typesync
  </a>
</h1>

<p align="center">
    Autogenerate Firestore model types for all platforms
</p>

---

<p align="center">
    <a href="https://npmjs.com/package/typesync-cli" alt="Latest version">
        <img src="https://img.shields.io/npm/v/typesync-cli?label=latest" /></a>
    <a href="https://app.circleci.com/pipelines/github/kafkas/typesync" alt="Build status">
        <img src="https://circleci.com/gh/kafkas/typesync.svg?style=shield" /></a>
    <a href="https://github.com/kafkas/typesync/pulls" alt="Activity">
        <img src="https://img.shields.io/github/commit-activity/m/kafkas/typesync" /></a>
    <a href="https://github.com/kafkas/typesync">
      <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome!" /></a>
    <a href="https://www.npmjs.com/package/typesync-cli" alt="NPM unpacked size">
        <img src="https://img.shields.io/npm/unpacked-size/typesync-cli" /></a>
    <a href="https://github.com/kafkas/typesync/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg" alt="Typesync CLI is released under the AGPL-3.0-only license." /></a>
</p>

Typesync is an open-source schema management tool that simplifies managing [Firestore](https://cloud.google.com/firestore) databases. Typesync allows you to maintain a single source of truth for your Firestore architecture in a special _schema_. With this schema in place, you can seamlessly auto-generate type definitions for multiple platforms like TypeScript, Python, Swift, and more using the CLI tool.

Typesync keeps your database and application code consistent and up-to-date at all times. In addition to type definitions, it lets you generate other useful things like Security Rules, boilerplate code for Cloud Functions, and documentation for your data models.

[**View the full documentation (docs) ▸**](https://docs.typesync.org)

<div align="center">
  <img src="images/architecture.png" width="600px" alt="header" />
</div>

## Overview

1. [Installation](#installation)
1. [Quickstart](#quickstart)
1. [License](#license)

## Installation

You can install the Typesync CLI either globally or on a per-project basis (locally) depending on your use case. Both options are perfectly valid but, when possible, it's a good idea to install it locally to explicitly tie your project to a specific Typesync CLI version.

**Prerequisite:** The Typesync CLI requires [Node.js](https://nodejs.org) 18 or above to be installed on your machine.

```bash
npm i -g typesync-cli
```

## Quickstart

### Step 1: Install Typesync CLI

First, ensure you have [Node.js](https://nodejs.org) 18+ installed. Then, install the Typesync CLI using npm:

```bash
npm install -g typesync-cli
```

### Step 2: Create your schema

Create a directory within your project to store your Typesync definition files. A common practice is to name this directory `definition`.

```bash
mkdir definition
cd definition
```

Next, create a YAML file named `models.yml` in the `definition` directory. This file will contain the schema definitions for your Firestore documents. Here's a sample schema:

```yaml models.yml
# yaml-language-server: $schema=https://schema.typesync.org/v0.6.json

UserRole:
  model: alias
  docs: Represents a user's role within a project.
  type:
    type: enum
    members:
      - label: Owner
        value: owner
      - label: Admin
        value: admin
      - label: Member
        value: member

User:
  model: document
  docs: Represents a user that belongs to a project.
  type:
    type: object
    fields:
      username:
        type: string
        docs: A string that uniquely identifies the user within a project.
      role:
        type: UserRole
      website_url:
        type: string
        optional: true
      created_at:
        type: timestamp
```

### Step 3: Generate type definitions

You can now generate the types for the relevant environment. For example, if your project is a Node.js backend that uses Firebase Admin SDK (version 11), run the following command:

```bash
typesync generate-ts --definition 'definition/**/*.yml' --target firebase-admin@11 --outFile models.ts
```

This command tells Typesync to:

- take all `.yml` files in the `definition` directory as the schema definition
- generate TypeScript interfaces for use with the Firebase Admin SDK (version 11)
- write the generated types to the `models.ts` file in the current directory

Here's what the generated TypeScript file might look like:

```ts models.ts (backend)
import type { firestore } from 'firebase-admin';

/** Represents a user's role within a project. */
export type UserRole = 'owner' | 'admin' | 'member';

/** Represents a user that belongs to a project. */
export interface User {
  /** A string that uniquely identifies the user within a project. */
  username: string;
  role: UserRole;
  website_url?: string;
  created_at: firestore.Timestamp;
}
```

### Step 4: Integrate into your development workflow

You should regenerate your types anytime the schema changes. To streamline development, consider integrating the Typesync generation command into your build process or CI/CD pipeline.

#### Version Control

Decide if you want to version control the generated files. It can be beneficial for ensuring consistency across environments but may require additional maintenance.

#### Multiple Files

As your project grows, you might want to split your schema into multiple YAML/JSON files. Typesync will automatically handle all files matching the pattern that you provide to it through the `--definition` option.

# License

This project is made available under the AGPL-3.0 License.
