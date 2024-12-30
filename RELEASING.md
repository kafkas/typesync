# Release Process

## Steps

1. **Development Changes**

   - All changes should be made through Pull Requests
   - Each PR must include a changeset (created using `changeset` CLI)
   - Merge approved PRs into `main`

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
   - Create a new tag (e.g., `v0.12.0`)
   - Title: `v0.12.0`
   - Description: Copy the relevant changelog entries
   - Publish the release
