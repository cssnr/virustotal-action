[![GitHub Tag Major](https://img.shields.io/github/v/tag/cssnr/virustotal-action?sort=semver&filter=!v*.*&logo=git&logoColor=white&labelColor=585858&label=%20)](https://github.com/cssnr/virustotal-action/tags)
[![GitHub Tag Minor](https://img.shields.io/github/v/tag/cssnr/virustotal-action?sort=semver&filter=!v*.*.*&logo=git&logoColor=white&labelColor=585858&label=%20)](https://github.com/cssnr/virustotal-action/releases)
[![GitHub Release Version](https://img.shields.io/github/v/release/cssnr/virustotal-action?logo=git&logoColor=white&labelColor=585858&label=%20)](https://github.com/cssnr/virustotal-action/releases/latest)
[![GitHub Dist Size](https://img.shields.io/github/size/cssnr/virustotal-action/dist%2Findex.js?logo=bookstack&logoColor=white&label=dist%20size)](https://github.com/cssnr/virustotal-action/blob/master/src)
[![Workflow Release](https://img.shields.io/github/actions/workflow/status/cssnr/virustotal-action/release.yaml?logo=cachet&label=release)](https://github.com/cssnr/virustotal-action/actions/workflows/release.yaml)
[![Workflow Test](https://img.shields.io/github/actions/workflow/status/cssnr/virustotal-action/test.yaml?logo=cachet&label=test)](https://github.com/cssnr/virustotal-action/actions/workflows/test.yaml)
[![Workflow Lint](https://img.shields.io/github/actions/workflow/status/cssnr/virustotal-action/lint.yaml?logo=cachet&label=lint)](https://github.com/cssnr/virustotal-action/actions/workflows/lint.yaml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=cssnr_virustotal-action&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=cssnr_virustotal-action)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/cssnr/virustotal-action?logo=github&label=updated)](https://github.com/cssnr/virustotal-action/pulse)
[![Codeberg Last Commit](https://img.shields.io/gitea/last-commit/cssnr/virustotal-action/master?gitea_url=https%3A%2F%2Fcodeberg.org%2F&logo=codeberg&logoColor=white&label=updated)](https://codeberg.org/cssnr/virustotal-action)
[![GitHub Contributors](https://img.shields.io/github/contributors/cssnr/virustotal-action?logo=github)](https://github.com/cssnr/virustotal-action/graphs/contributors)
[![GitHub Repo Size](https://img.shields.io/github/repo-size/cssnr/virustotal-action?logo=bookstack&logoColor=white&label=repo%20size)](https://github.com/cssnr/virustotal-action?tab=readme-ov-file#readme)
[![GitHub Top Language](https://img.shields.io/github/languages/top/cssnr/virustotal-action?logo=htmx)](https://github.com/cssnr/virustotal-action)
[![GitHub Discussions](https://img.shields.io/github/discussions/cssnr/virustotal-action?logo=github)](https://github.com/cssnr/virustotal-action/discussions)
[![GitHub Forks](https://img.shields.io/github/forks/cssnr/virustotal-action?style=flat&logo=github)](https://github.com/cssnr/virustotal-action/forks)
[![GitHub Repo Stars](https://img.shields.io/github/stars/cssnr/virustotal-action?style=flat&logo=github)](https://github.com/cssnr/virustotal-action/stargazers)
[![GitHub Org Stars](https://img.shields.io/github/stars/cssnr?style=flat&logo=github&label=org%20stars)](https://cssnr.github.io/)
[![Discord](https://img.shields.io/discord/899171661457293343?logo=discord&logoColor=white&label=discord&color=7289da)](https://discord.gg/wXy6m2X8wY)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-72a5f2?logo=kofi&label=support)](https://ko-fi.com/cssnr)

# VirusTotal Action

- [Features](#Features)
  - [VirusTotal Badges](#virustotal-badges)
- [Inputs](#Inputs)
  - [Permissions](#Permissions)
- [Outputs](#Outputs)
- [Examples](#Examples)
- [Tags](#Tags)
- [Support](#Support)
- [Contributing](#Contributing)

Submit file globs or release assets to the VirusTotal API for scanning.

On release events the [Release Notes](#Release-Notes) will optionally be updated with links to the scan results.

You can now customize the links display and release notes heading. See the [Features](#Features) for more details.

The /files/ endpoint is used for files under 32MB, otherwise, the /files/upload_url/ endpoint is used
providing support for files up to **650MB**. Therefore, files over 32MB will consume 2 API calls.

With no inputs this will automatically process release assets.

```yaml
- name: 'VirusTotal'
  uses: cssnr/virustotal-action@v1
  with:
    vt_api_key: ${{ secrets.VT_API_KEY }}
```

Make sure to review the [Inputs](#inputs) and checkout more [Examples](#examples).

This is a fairly simple action, for more details see [src/index.js](src/index.js) and [src/vt.js](src/vt.js).

> [!TIP]  
> A new Documentation site is currently being developed:  
> https://actions.cssnr.com/virustotal/

## Features

- Supports files up to 650MB
- Upload Release Assets or File Globs
- Automatically add Results to Release Notes
  - Customize Release Notes Heading
- Rate Limited for Free Accounts
- Option to specify the Release ID

### Planned

- Add options to customize release update/output format (next on the roadmap).
- Add release body parsing to properly process new files on edited activity.
- Add option to apply file_globs to release assets.

> [!NOTE]  
> Please submit a [Feature Request](https://github.com/cssnr/virustotal-action/discussions/categories/feature-requests)
> for new features or [Open an Issue](https://github.com/cssnr/virustotal-action/issues) if you find any bugs.

### VirusTotal Badges

[![VT Release](https://badges.cssnr.com/vt/cssnr/zipline-android/app-release.apk)](https://badges.cssnr.com/vt/cssnr/zipline-android/app-release.apk)

We are also working on a Badge Server (similar to [shields.io](https://shields.io/)) that supports VirusTotal Badges.
For more details see the [Website](https://smashedr.github.io/node-badges-docs/guides/get-started) or [README.md](https://github.com/smashedr/node-badges?tab=readme-ov-file#virustotal-release-and-files).
There is also a [Discussion](https://github.com/cssnr/virustotal-action/discussions/27) in this repo.
Any feedback is helpful during this phase of development.

These badges may be eventually added to this action as an option for release notes.

## Inputs

| Input&nbsp;Name   | Default&nbsp;Value            | Description&nbsp;of&nbsp;the&nbsp;Input&nbsp;Value |
| :---------------- | :---------------------------- | :------------------------------------------------- |
| `vt_api_key`      | _Required_                    | VirusTotal API Key [⤵️](#vt_api_key)               |
| `file_globs`      | -                             | File Globs to Process [⤵️](#file_globs)            |
| `rate_limit`      | `4`                           | API Calls Per Minute [⤵️](#rate_limit)             |
| `release_id`      | -                             | Release ID to Process [⤵️](#release_id)            |
| `update_release`  | `true`                        | Update the [Release Notes](#Release-Notes)         |
| `release_heading` | _[see below](#Release-Notes)_ | Release Notes Heading [⤵️](#release_heading)       |
| `collapsed`       | `false`                       | Show Links Collapsed. [⤵️](#collapsed)             |
| `file_name`       | `name`                        | File Name Display: [`name`, `id`] [⤵️](#file_name) |
| `summary`         | `true`                        | Add Summary to Job [⤵️](#summary)                  |
| `github_token`    | `github.token`                | For use with a PAT                                 |

> For more details on inputs, see the VirusTotal API [documentation](https://docs.virustotal.com/reference/overview).

#### vt_api_key

Get your API key from: https://www.virustotal.com/gui/my-apikey

#### file_globs

If provided, will process matching files instead of release assets.  
For glob pattern, see [examples](#examples) and the [docs](https://github.com/actions/toolkit/tree/main/packages/glob#patterns).

#### rate_limit

Rate limit for file uploads. Set to `0` to disable if you know what you are doing.

#### release_id

If provided, will process the corresponding release.
The release ID can be generated from a previous step.
By providing a release ID, this action does not need to run on a release event to process a release.

#### summary

Will add result details to the job summary in the workflow.

<details><summary>👀 View Job Summary Example</summary>

---

<table><tr><th>File</th><th>ID</th></tr><tr><td><a href="https://www.virustotal.com/gui/file-analysis/YmFmZTVlZjIzMDRkMjRlMTcwNjk1Yzg0MTgyN2FmMmM6MTc0MjExMjY5Mw==">README.md</a></td><td>YmFmZTVlZjIzMDRkMjRlMTcwNjk1Yzg0MTgyN2FmMmM6MTc0MjExMjY5Mw==</td></tr><tr><td><a href="https://www.virustotal.com/gui/file-analysis/ZTM4MjBkOGFhYmRhNjBiMTY0MTEwZjZkNDE1YjViODc6MTc0MjExMjY5Mw==">.gitignore</a></td><td>ZTM4MjBkOGFhYmRhNjBiMTY0MTEwZjZkNDE1YjViODc6MTc0MjExMjY5Mw==</td></tr></table><details><summary>Outputs</summary>
<pre lang="json"><code>[
  {
    "id": "YmFmZTVlZjIzMDRkMjRlMTcwNjk1Yzg0MTgyN2FmMmM6MTc0MjExMjY5Mw==",
    "name": "README.md",
    "link": "https://www.virustotal.com/gui/file-analysis/YmFmZTVlZjIzMDRkMjRlMTcwNjk1Yzg0MTgyN2FmMmM6MTc0MjExMjY5Mw=="
  },
  {
    "id": "ZTM4MjBkOGFhYmRhNjBiMTY0MTEwZjZkNDE1YjViODc6MTc0MjExMjY5Mw==",
    "name": ".gitignore",
    "link": "https://www.virustotal.com/gui/file-analysis/ZTM4MjBkOGFhYmRhNjBiMTY0MTEwZjZkNDE1YjViODc6MTc0MjExMjY5Mw=="
  }
]
</code></pre>
<pre lang="text"><code>README.md/YmFmZTVlZjIzMDRkMjRlMTcwNjk1Yzg0MTgyN2FmMmM6MTc0MjExMjY5Mw==
.gitignore/ZTM4MjBkOGFhYmRhNjBiMTY0MTEwZjZkNDE1YjViODc6MTc0MjExMjY5Mw==</code></pre>
</details><details><summary>Config</summary>
<pre lang="yaml"><code>files: ["README.md",".gitignore"]
rate: 4
update: true
heading: "🛡️ **VirusTotal Results:**"
summary: true</code></pre>
</details>

---

</details>

To view a workflow run, click on a recent [Test](https://github.com/cssnr/virustotal-action/actions/workflows/test.yaml) job _(requires login)_.

Example with all inputs:

```yaml
- name: 'VirusTotal'
  uses: cssnr/virustotal-action@v1
  with:
    vt_api_key: ${{ secrets.VT_API_KEY }}
    file_globs: |
      file1
      release/*
    rate_limit: 4
    update_release: true
    release_heading: '🛡️ **VirusTotal Results:**'
    summary: true
```

See the [Examples](#Examples) section for more options.

### Release Notes

If run on a release event, the Release Notes are automatically updated with the results unless you set `update_release` to `false`.
You can customize the heading or remove it by specifying an empty string.

#### update_release

If triggered from a release workflow, will update the release notes and append the results.

#### release_heading

Customize the Release Notes Heading.  
Default: `🛡️ **VirusTotal Results:**`

#### collapsed

Set to `true` to collapse the result links by default. _Experimental._

#### file_name

Customize the Release Notes File Name Display. This can be one of `name`, or `id`.

### Example Release Notes

---

🛡️ **VirusTotal Results:**

- [install-linux.deb](https://www.virustotal.com/gui/file-analysis/ODA3ZWUyN2E4YjhjMTJlODRlZTBmOTJjMmE5MzBlMmQ6MTcyNjg3MjQyMw==)
- [install-macos.pkg](https://www.virustotal.com/gui/file-analysis/YTAwN2I4MWQwZjkzNDJjZTVmMWFhNzBjY2Y0ZGJkODE6MTcyNjg3MjQyNQ==)
- [install-win.exe](https://www.virustotal.com/gui/file-analysis/N2JlODFiMWMwZGY1M2EzMzg5MWY1ZDQ0N2QyMWU0MWI6MTcyNjg3MjQyNw==)

---

### Permissions

This action requires the following permissions to edit releases notes:

```yaml
permissions:
  contents: write
```

Permissions documentation for [Workflows](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/controlling-permissions-for-github_token) and [Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication).

## Outputs

| Output    | Output&nbsp;Description             |
| :-------- | :---------------------------------- |
| `results` | Comma Seperated String of `file/id` |
| `json`    | JSON Object Results List            |

json object: `{ id, name, link, sha256 }`

Web links can be generated by appending the ID to this URL:

```text
https://www.virustotal.com/gui/file-analysis/
```

<details><summary>Example Results</summary>

```text
README.md/MGM1YTkxMzc5OGU3Y2UyNjViNTkxYzY5OTZmNTg3NjI6MTc2MDEyMzYzOA==,.gitignore/ZmIzNTcyMDI5NTAxN2VkYzRiZmRmMTg4NzhjNWJjY2Y6MTc2MDEyMzYzOQ==
```

</details>

<details><summary>Example JSON</summary>

```json
[
  {
    "id": "MGM1YTkxMzc5OGU3Y2UyNjViNTkxYzY5OTZmNTg3NjI6MTc2MDEyMzYzOA==",
    "name": "README.md",
    "link": "https://www.virustotal.com/gui/file-analysis/MGM1YTkxMzc5OGU3Y2UyNjViNTkxYzY5OTZmNTg3NjI6MTc2MDEyMzYzOA==",
    "sha256": "75f762919859572abf753008cc5a1f5b75e05e9d0876080c0d28b2338ca46c26"
  },
  {
    "id": "ZmIzNTcyMDI5NTAxN2VkYzRiZmRmMTg4NzhjNWJjY2Y6MTc2MDEyMzYzOQ==",
    "name": ".gitignore",
    "link": "https://www.virustotal.com/gui/file-analysis/ZmIzNTcyMDI5NTAxN2VkYzRiZmRmMTg4NzhjNWJjY2Y6MTc2MDEyMzYzOQ==",
    "sha256": "4c534768e93cc21269fecf0dea55eb9191ab649cb2fff8952f40cbf7a21057fe"
  }
]
```

</details>

Using the outputs.

```yaml
- name: 'VirusTotal'
  uses: cssnr/virustotal-action@v1
  id: vt
  with:
    vt_api_key: ${{ secrets.VT_API_KEY }}

- name: 'Echo Results'
  run: |
    echo results: ${{ steps.vt.outputs.results }}
    echo json: ${{ steps.vt.outputs.json }}
```

## Examples

💡 _Click on an example heading to expand or collapse the example._

<details open><summary>Process release assets</summary>

```yaml
- name: 'VirusTotal'
  uses: cssnr/virustotal-action@v1
  with:
    vt_api_key: ${{ secrets.VT_API_KEY }}
```

</details>
<details><summary>Customize release notes heading</summary>

```yaml
- name: 'VirusTotal'
  uses: cssnr/virustotal-action@v1
  if: ${{ github.event_name == 'release' }}
  with:
    vt_api_key: ${{ secrets.VT_API_KEY }}
    release_heading: '### Scan Results'
```

</details>
<details><summary>Only run on a release event</summary>

```yaml
- name: 'VirusTotal'
  uses: cssnr/virustotal-action@v1
  if: ${{ github.event_name == 'release' }}
  with:
    vt_api_key: ${{ secrets.VT_API_KEY }}
```

</details>
<details><summary>Using file globs</summary>

```yaml
- name: 'VirusTotal'
  uses: cssnr/virustotal-action@v1
  with:
    vt_api_key: ${{ secrets.VT_API_KEY }}
    file_globs: artifacts/*
```

</details>
<details open><summary>Multiple file globs</summary>

```yaml
- name: 'VirusTotal'
  uses: cssnr/virustotal-action@v1
  with:
    vt_api_key: ${{ secrets.VT_API_KEY }}
    file_globs: |
      artifacts/*
      assets/asset.zip
```

</details>
<details><summary>With all inputs</summary>

```yaml
- name: 'VirusTotal'
  uses: cssnr/virustotal-action@v1
  with:
    vt_api_key: ${{ secrets.VT_API_KEY }}
    file_globs: |
      file1
      release/*
    rate_limit: 4
    update_release: true
    release_heading: '🛡️ **VirusTotal Results:**'
    summary: true
```

</details>
<details><summary>Simple workflow example</summary>

```yaml
name: 'VirusTotal Example'

on:
  release:
    types: [published]

jobs:
  release:
    name: 'Release'
    runs-on: ubuntu-latest
    timeout-minutes: 5
    permissions:
      contents: write

    steps:
      - name: 'VirusTotal Action'
        uses: cssnr/virustotal-action@v1
        with:
          vt_api_key: ${{ secrets.VT_API_KEY }}
```

Note: the permissions are applied to the individual job here.

</details>
<details><summary>Full workflow example</summary>

```yaml
name: 'VirusTotal Example'

on:
  release:
    types: [published]

permissions:
  contents: write

jobs:
  windows:
    name: 'Windows Build'
    runs-on: windows-latest
    timeout-minutes: 5

    steps:
      - name: 'Checkout'
        uses: actions/checkout@v5

      - name: 'Build'
        uses: Minionguyjpro/Inno-Setup-Action@v1.2.2
        with:
          path: client.iss
          options: '/DMyAppVersion=${{ github.ref_name }}'

      - name: 'Upload to Release'
        uses: svenstaro/upload-release-action@v2
        if: ${{ github.event_name == 'release' }}
        with:
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          file: out/*
          tag: ${{ github.ref }}
          overwrite: true
          file_glob: true

  virustotal:
    name: 'VirusTotal'
    runs-on: ubuntu-latest
    needs: [windows]
    timeout-minutes: 5
    if: ${{ github.event_name == 'release' }}

    steps:
      - name: 'VirusTotal Action'
        uses: cssnr/virustotal-action@v1
        with:
          vt_api_key: ${{ secrets.VT_API_KEY }}
          rate_limit: 4
          update_release: true
```

Note: the permissions are applied to the entire workflow here.

</details>

To see this used in a build/release/scan workflow, check out:  
https://github.com/cssnr/hls-downloader-client/blob/master/.github/workflows/build.yaml

For more examples, you can check out other projects using this action:  
https://github.com/cssnr/virustotal-action/network/dependents

## Tags

The following rolling [tags](https://github.com/cssnr/virustotal-action/tags) are maintained.

| Version&nbsp;Tag                                                                                                                                                                                                   | Rolling | Bugs | Feat. |   Name    |  Target  | Example  |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: | :--: | :---: | :-------: | :------: | :------- |
| [![GitHub Tag Major](https://img.shields.io/github/v/tag/cssnr/virustotal-action?sort=semver&filter=!v*.*&style=for-the-badge&label=%20&color=44cc10)](https://github.com/cssnr/virustotal-action/releases/latest) |   ✅    |  ✅  |  ✅   | **Major** | `vN.x.x` | `vN`     |
| [![GitHub Tag Minor](https://img.shields.io/github/v/tag/cssnr/virustotal-action?sort=semver&filter=!v*.*.*&style=for-the-badge&label=%20&color=blue)](https://github.com/cssnr/virustotal-action/releases/latest) |   ✅    |  ✅  |  ❌   | **Minor** | `vN.N.x` | `vN.N`   |
| [![GitHub Release](https://img.shields.io/github/v/release/cssnr/virustotal-action?style=for-the-badge&label=%20&color=red)](https://github.com/cssnr/virustotal-action/releases/latest)                           |   ❌    |  ❌  |  ❌   | **Micro** | `vN.N.N` | `vN.N.N` |

You can view the release notes for each version on the [releases](https://github.com/cssnr/virustotal-action/releases) page.

The **Major** tag is recommended. It is the most up-to-date and always backwards compatible.
Breaking changes would result in a **Major** version bump. At a minimum you should use a **Minor** tag.

# Support

For general help or to request a feature see:

- Q&A Discussion: https://github.com/cssnr/virustotal-action/discussions/categories/q-a
- Request a Feature: https://github.com/cssnr/virustotal-action/discussions/categories/feature-requests

If you are experiencing an issue/bug or getting unexpected results you can:

- Report an Issue: https://github.com/cssnr/virustotal-action/issues
- Chat with us on Discord: https://discord.gg/wXy6m2X8wY
- Provide General Feedback: [https://cssnr.github.io/feedback/](https://cssnr.github.io/feedback/?app=VirusTotal%20Scan)

For more information, see the CSSNR [SUPPORT.md](https://github.com/cssnr/.github/blob/master/.github/SUPPORT.md#support).

# Contributing

Please consider making a donation to support the development of this project
and [additional](https://cssnr.com/) open source projects.

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/cssnr)

If you would like to submit a PR, please review the [CONTRIBUTING.md](#contributing-ov-file).

Additionally, you can support other GitHub Actions I have published:

- [Stack Deploy Action](https://github.com/cssnr/stack-deploy-action?tab=readme-ov-file#readme)
- [Portainer Stack Deploy Action](https://github.com/cssnr/portainer-stack-deploy-action?tab=readme-ov-file#readme)
- [Docker Context Action](https://github.com/cssnr/docker-context-action?tab=readme-ov-file#readme)
- [VirusTotal Action](https://github.com/cssnr/virustotal-action?tab=readme-ov-file#readme)
- [Mirror Repository Action](https://github.com/cssnr/mirror-repository-action?tab=readme-ov-file#readme)
- [Update Version Tags Action](https://github.com/cssnr/update-version-tags-action?tab=readme-ov-file#readme)
- [Docker Tags Action](https://github.com/cssnr/docker-tags-action?tab=readme-ov-file#readme)
- [Update JSON Value Action](https://github.com/cssnr/update-json-value-action?tab=readme-ov-file#readme)
- [JSON Key Value Check Action](https://github.com/cssnr/json-key-value-check-action?tab=readme-ov-file#readme)
- [Parse Issue Form Action](https://github.com/cssnr/parse-issue-form-action?tab=readme-ov-file#readme)
- [Cloudflare Purge Cache Action](https://github.com/cssnr/cloudflare-purge-cache-action?tab=readme-ov-file#readme)
- [Mozilla Addon Update Action](https://github.com/cssnr/mozilla-addon-update-action?tab=readme-ov-file#readme)
- [Package Changelog Action](https://github.com/cssnr/package-changelog-action?tab=readme-ov-file#readme)
- [NPM Outdated Check Action](https://github.com/cssnr/npm-outdated-action?tab=readme-ov-file#readme)
- [Label Creator Action](https://github.com/cssnr/label-creator-action?tab=readme-ov-file#readme)
- [Algolia Crawler Action](https://github.com/cssnr/algolia-crawler-action?tab=readme-ov-file#readme)
- [Upload Release Action](https://github.com/cssnr/upload-release-action?tab=readme-ov-file#readme)
- [Check Build Action](https://github.com/cssnr/check-build-action?tab=readme-ov-file#readme)
- [Web Request Action](https://github.com/cssnr/web-request-action?tab=readme-ov-file#readme)
- [Get Commit Action](https://github.com/cssnr/get-commit-action?tab=readme-ov-file#readme)

<details><summary>❔ Unpublished Actions</summary>

These actions are not published on the Marketplace, but may be useful.

- [cssnr/draft-release-action](https://github.com/cssnr/draft-release-action?tab=readme-ov-file#readme) - Keep a draft release ready to publish.
- [cssnr/env-json-action](https://github.com/cssnr/env-json-action?tab=readme-ov-file#readme) - Convert env file to json or vice versa.
- [cssnr/push-artifacts-action](https://github.com/cssnr/push-artifacts-action?tab=readme-ov-file#readme) - Sync files to a remote host with rsync.
- [smashedr/update-release-notes-action](https://github.com/smashedr/update-release-notes-action?tab=readme-ov-file#readme) - Update release notes.
- [smashedr/combine-release-notes-action](https://github.com/smashedr/combine-release-notes-action?tab=readme-ov-file#readme) - Combine release notes.

---

</details>

<details><summary>📝 Template Actions</summary>

These are basic action templates that I use for creating new actions.

- [js-test-action](https://github.com/smashedr/js-test-action?tab=readme-ov-file#readme) - JavaScript
- [py-test-action](https://github.com/smashedr/py-test-action?tab=readme-ov-file#readme) - Python
- [ts-test-action](https://github.com/smashedr/ts-test-action?tab=readme-ov-file#readme) - TypeScript
- [docker-test-action](https://github.com/smashedr/docker-test-action?tab=readme-ov-file#readme) - Docker Image

Note: The `docker-test-action` builds, runs and pushes images to [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).

---

</details>

For a full list of current projects visit: [https://cssnr.github.io/](https://cssnr.github.io/)
