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
    <a href="https://github.com/kafkas/typesync/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Typesync is released under the MIT license." /></a>
    <a href="https://npmjs.com/package/typesync-cli" alt="Version">
        <img src="https://img.shields.io/npm/v/typesync-cli" /></a>
    <a href="https://npmjs.com/package/typesync-cli" alt="Size">
        <img src="https://img.shields.io/bundlephobia/min/typesync-cli" /></a>
    <a href="https://github.com/kafkas/typesync">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome!" /></a>
</p>

Typesync is an open-source schema management tool for [Firestore](https://cloud.google.com/firestore). It allows you to maintain a single source of truth for your Firestore architecture. With this schema in place, you can effortlessly auto-generate type definitions for multiple platforms like TypeScript, Python, Swift and more using the CLI tool. Typesync also lets you generate other useful things like Firestore Rules, Cloud Functions boilerplate and documentation for your models.

[**View the full documentation (docs) ▸**](https://docs.typesync.org)

```mermaid
%%{
  init: {
    'theme': 'base',
    'themeVariables': {
      'primaryColor': '#fff',
      'primaryTextColor': '#000',
      'primaryBorderColor': '#000',
      'lineColor': '#000',
      'secondaryColor': '#006100',
      'tertiaryColor': '#fff'
    }
  }
}%%
graph LR;
    A[Typesync schema];
    A --> B[CLI];
    B --> C[TypeScript];
    B --> D[Swift];
    B --> E[Python];
    B --> F[Cloud Functions boilerplate];
    B --> G[Security Rules];
    C --> H[Codebase];
    D --> H;
    E --> H;
    F --> H;
    G --> H;
```
