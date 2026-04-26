# Release Process

Releases are fully automated by [Changesets](https://github.com/changesets/changesets)
and the official [Changesets GitHub Action](https://github.com/changesets/action).
Cutting a release is done by merging a PR — there are no local commands to
run and no direct pushes to `main`.

## Day-to-day: shipping a change

1. Open a PR against `main` with your change.
2. Run `yarn changeset` and commit the generated `.changeset/*.md` file.
3. Get the PR reviewed and merged.

That's it. Don't bump versions, don't edit `CHANGELOG.md`, and don't create
tags. The [Release workflow](.github/workflows/release.yml) takes care of all
of that.

## Cutting a release

After any PR carrying a changeset lands on `main`, the Release workflow opens
(or updates) a single PR titled **`chore: version packages`**. This PR is the
release control panel — it accumulates all unreleased changesets and contains
a preview of:

- the bumped `package.json` version
- the appended `CHANGELOG.md` entries
- the regenerated `public/v0.X.json` JSON schema

Whenever you are ready to publish, merge this PR. On merge, the workflow will:

1. Publish the new version to NPM (`npm publish` on `typesync-cli`)
2. Create a GitHub Release with the matching `vX.Y.Z` tag and changelog body
3. Deploy the regenerated JSON schema to Firebase Hosting (`prod`)

If the `chore: version packages` PR doesn't exist, no changesets have landed
since the last release. Merge any PR with a changeset to materialize one.

To **hold** a release, just don't merge the PR — new feature merges will keep
adding to it. To **cancel** a pending release, close the PR; the changesets
remain on `main` and the next push will reopen it.

## One-time GitHub configuration

### Repository secrets

Configure under **Settings → Secrets and variables → Actions**:

| Secret                                | Purpose                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------ |
| `NPM_TOKEN`                           | NPM automation token with publish access to `typesync-cli`               |
| `HOSTING_SERVICE_ACCOUNT_BASE64_PROD` | Base64-encoded GCP service account JSON with Firebase Hosting permission |

### Workflow permissions

Under **Settings → Actions → General**, make sure the following are enabled:

- **Workflow permissions**: "Read and write permissions"
- **"Allow GitHub Actions to create and approve pull requests"**

The release workflow uses the built-in `GITHUB_TOKEN` to open the
`chore: version packages` PR; without these settings the action cannot create
or update it.

### Branch protection (recommended)

Now that nothing legitimately needs to push directly to `main`, enable branch
protection on `main`:

- Require a pull request before merging
- Require the [CI workflow](.github/workflows/ci.yml) (`lint`, `test`, `build`,
  `integration-test`) to pass
- Disallow force-pushes
