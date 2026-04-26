# Release Process

## Steps

1. **Development Changes**

   - All changes should be made through Pull Requests
   - Each PR must include a changeset (created using `changeset` CLI)
   - Merge approved PRs into `main` once the [CI workflow](.github/workflows/ci.yml) passes

2. **Prepare Release**

   ```bash
   yarn run prepare-release
   ```

   This command will:

   - Update versions based on changesets
   - Update changelog
   - Generate JSON schema for definition files

3. **Commit and Push**

   ```bash
   git add .
   git commit -m "0.12.0"
   git push origin main
   ```

4. **Create GitHub Release**

   - Go to [GitHub Releases](https://github.com/kafkas/typesync/releases)
   - Click "Draft a new release"
   - Create a new tag (e.g., `v0.12.0`) targeting the release commit on `main`
   - Title: `v0.12.0`
   - Description: Copy the relevant changelog entries
   - Publish the release

   Publishing the release pushes the tag, which triggers the
   [Release workflow](.github/workflows/release.yml). It runs two jobs in parallel:

   - **`publish-npm`** — builds the package and runs `npm publish` against
     `registry.npmjs.org` using the `NPM_TOKEN` secret.
   - **`publish-json-schema`** — verifies the committed JSON schema matches the
     one generated from the current version, then deploys `public/` to Firebase
     Hosting (`prod`) using the `HOSTING_SERVICE_ACCOUNT_BASE64_PROD` secret.

   Watch the run in the
   [Actions tab](https://github.com/kafkas/typesync/actions/workflows/release.yml).
   If either job fails, fix the issue, delete the tag/release, and retry from
   step 4.

## Required GitHub Secrets

The release workflow expects the following repository secrets to be configured
under **Settings → Secrets and variables → Actions**:

| Secret                                  | Used by               | Purpose                                                                  |
| --------------------------------------- | --------------------- | ------------------------------------------------------------------------ |
| `NPM_TOKEN`                             | `publish-npm`         | NPM automation token with publish access to `typesync-cli`               |
| `HOSTING_SERVICE_ACCOUNT_BASE64_PROD`   | `publish-json-schema` | Base64-encoded GCP service account JSON with Firebase Hosting permission |
