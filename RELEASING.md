# Release Process

This document outlines the process for creating new releases of Typesync.

## Prerequisites

- You must have npm publish access to the `typesync-cli` package
- You must have write access to the repository

## Steps

1. Ensure you're on the `main` branch and it's up to date:

   ```bash
   git checkout main
   git pull origin main
   ```

2. Update version in `package.json`:

   ```bash
   npm version <major|minor|patch>
   ```

3. Update the CHANGELOG.md file:

   - Add a new section for the release version
   - Document all notable changes since the last release
   - Follow the [Keep a Changelog](https://keepachangelog.com/) format

4. Commit the changes:

   ```bash
   git add CHANGELOG.md
   git commit -m "chore: prepare release v<version>"
   ```

5. Create and push a new tag:

   ```bash
   git tag v<version>
   git push origin main --tags
   ```

6. Publish to npm:

   ```bash
   npm publish
   ```

7. Create a new release on GitHub:
   - Go to the [releases page](https://github.com/kafkas/typesync/releases)
   - Click "Draft a new release"
   - Choose the tag you just created
   - Title the release "v<version>"
   - Copy the changelog entries for this version into the description
   - Click "Publish release"

## Post-Release

1. Verify the package is available on [npm](https://www.npmjs.com/package/typesync-cli)
2. Check that the documentation site reflects the latest version
3. Announce the release in relevant channels (if applicable)
