# kts-auto-proxy

This action automatically replace the repositories listed in a kotlin script
file with their equivalent proxies specified in the repos_to_proxies argument.

This is helpful for example if you're reaching the rate limit of a repository,
or if you want to ensure that the repository content is always available and/or
for security reasons (like supply chain attacks).

## Usage

```yaml
name: Replace file:Repository with their equivalent proxies

jobs:
  replace_repos_to_proxies:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Create a kts file containing dumb repos
        run: |
          cat > script.main.kts <<EOF
          @file:Repository("https://example1.org/maven/")
          @file:Repository("https://custom-maven.example3.org/")
          println("Hello, world!")
          EOF

      - name: Replace repositories with proxies
        uses: kts-auto-proxy
        with:
          input_path: 'script.main.kts'
          output_path: 'proxied-script.main.kts'
          maven_central_proxy: 'https://maven.aliyun.com/repository'
          repos_to_proxies: |
            https://example1.org/maven/ -> https://proxied-repo.example2.com/maven/
            https://custom-maven.example3.org/ -> https://us-east4-maven.pkg.dev/gcp-project/repository-name

      - name: Check the content of the file
        run: |
          diff -u <(cat proxied-script.main.kts) - <<EOF
          @file:Repository("https://maven.aliyun.com/repository")
          @file:Repository("https://proxied-repo.example2.com/maven/")
          @file:Repository("https://us-east4-maven.pkg.dev/gcp-project/repository-name")
          println("Hello, world!")
          EOF
```

## How to contribute

You need to perform some initial setup steps before you can develop your action.

> [!NOTE]
>
> You'll need to have a reasonably modern version of
> [Node.js](https://nodejs.org) handy. If you are using a version manager like
> [`nodenv`](https://github.com/nodenv/nodenv) or
> [`nvm`](https://github.com/nvm-sh/nvm), you can run `nodenv install` in the
> root of your repository to install the version specified in
> [`package.json`](./package.json). Otherwise, 20.x or later should work!

1. :hammer_and_wrench: Install the dependencies

   ```bash
   npm install
   ```

1. :building_construction: Package the JavaScript for distribution

   ```bash
   npm run bundle
   ```

1. :white_check_mark: Run the tests

   ```bash
   $ npm test

   PASS  ./index.test.js
     ✓ throws invalid number (3ms)
     ✓ wait 500 ms (504ms)
     ✓ test runs (95ms)

   ...
   ```

1. Format, test, and build the action

   ```bash
   npm run all
   ```

   > This step is important! It will run [`ncc`](https://github.com/vercel/ncc)
   > to build the final JavaScript action code with all dependencies included.
   > If you do not run this step, your action will not work correctly when it is
   > used in a workflow. This step also includes the `--license` option for
   > `ncc`, which will create a license file for all of the production node
   > modules used in your project.

1. (Optional) Test your action locally

   The [`@github/local-action`](https://github.com/github/local-action) utility
   can be used to test your action locally. It is a simple command-line tool
   that "stubs" (or simulates) the GitHub Actions Toolkit. This way, you can run
   your JavaScript action locally without having to commit and push your changes
   to a repository.

   The `local-action` utility can be run in the following ways:

   - Visual Studio Code Debugger

     Make sure to review and, if needed, update
     [`.vscode/launch.json`](./.vscode/launch.json)

   - Terminal/Command Prompt

     ```bash
     # npx @github/local action <action-yaml-path> <entrypoint> <dotenv-file>
     npx @github/local-action . src/main.js .env
     ```

   You can provide a `.env` file to the `local-action` CLI to set environment
   variables used by the GitHub Actions Toolkit. For example, setting inputs and
   event payload data used by your action. For more information, see the example
   file, [`.env.example`](./.env.example), and the
   [GitHub Actions Documentation](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables).

1. Commit your changes

   ```bash
   git add .
   git commit -m "My first action is ready!"
   ```

1. Push them to your repository

   ```bash
   git push -u origin releases/v1
   ```

1. Create a pull request and get feedback on your action

For information about versioning your action, see
[Versioning](https://github.com/actions/toolkit/blob/main/docs/action-versioning.md)
in the GitHub Actions toolkit.

### Dependency License Management

This template includes a GitHub Actions workflow,
[`licensed.yml`](./.github/workflows/licensed.yml), that uses
[Licensed](https://github.com/licensee/licensed) to check for dependencies with
missing or non-compliant licenses. This workflow is initially disabled. To
enable the workflow, follow the below steps.

1. Open [`licensed.yml`](./.github/workflows/licensed.yml)
1. Uncomment the following lines:

   ```yaml
   # pull_request:
   #   branches:
   #     - main
   # push:
   #   branches:
   #     - main
   ```

1. Save and commit the changes

Once complete, this workflow will run any time a pull request is created or
changes pushed directly to `main`. If the workflow detects any dependencies with
missing or non-compliant licenses, it will fail the workflow and provide details
on the issue(s) found.

#### Updating Licenses

Whenever you install or update dependencies, you can use the Licensed CLI to
update the licenses database. To install Licensed, see the project's
[Readme](https://github.com/licensee/licensed?tab=readme-ov-file#installation).

To update the cached licenses, run the following command:

```bash
licensed cache
```

To check the status of cached licenses, run the following command:

```bash
licensed status
```
