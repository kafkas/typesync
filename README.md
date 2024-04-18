<h1 align="center">
  <a href="https://docs.typesync.org">
    Typesync
  </a>
</h1>

<p align="center">
    Autogenerate Firestore type definitions for all platforms
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

Typesync is an open-source schema management tool for [Firestore](https://cloud.google.com/firestore). It allows you to maintain a single source of truth for your Firestore architecture. With this schema in place, you can effortlessly auto-generate type definitions for multiple platforms like TypeScript, Python, Swift and more using the CLI tool. Typesync also lets you generate other useful things like Firestore Rules, Cloud Functions boilerplate and documentation for your models.

[**View the full documentation (docs) ▸**](https://docs.typesync.org)

<div align="center">
  <img src="images/architecture.png" width="600px" alt="header" />
</div>

## Overview

1. [Installation](#Installation)
1. [Quick Start](#Quick-Start)
1. [License](#License)

## Installation

You can install the Typesync CLI either globally or on a per-project basis (locally) depending on your use case. Both options are perfectly valid but, when possible, it's a good idea to install it locally to explicitly tie your project to a specific Typesync CLI version.

**Prerequisite:** The Typesync CLI requires [Node.js](https://nodejs.org) 18 or above to be installed on your machine.

```bash
npm i -g typesync-cli
```

## Quick Start

Once you've installed the Typesync CLI, create a directory within your project for your Typesync definition (e.g. `/definition`) and add the following YAML file into it.

```yaml models.yml
# yaml-language-server: $schema=https://schema.typesync.org/v0.1.json

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
      created_at:
        type: timestamp
```

Then run `typesync generate` to generate the types for the relevant platform. For example, if your project is a Node.js backend that uses Firebase Admin SDK (version 11), run the following command:

```bash
typesync generate --definition 'definition/**/*.yml' --platform ts:firebase-admin:11 --outFile models.ts
```

This will generate the types and write them to the specified `outFile`. Feel free to change this to any other path within your project.

You can now edit the definition as you wish. Feel free to add, remove or rename the models and run the generation command as many times as you need.

You can also split your definition into multiple files. The `--definition 'definition/**/*.yml'` option ensures that the Typesync CLI will treat all the YAML files under `/definition` as your Typesync definition.

# License

This project is made available under the AGPL-3.0 License.
