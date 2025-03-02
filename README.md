[![Release](https://img.shields.io/github/actions/workflow/status/cssnr/virustotal-action/release.yaml?logo=github&logoColor=white&label=release)](https://github.com/cssnr/virustotal-action/actions/workflows/release.yaml)
[![Test](https://img.shields.io/github/actions/workflow/status/cssnr/virustotal-action/test.yaml?logo=github&logoColor=white&label=test)](https://github.com/cssnr/virustotal-action/actions/workflows/test.yaml)
[![Lint](https://img.shields.io/github/actions/workflow/status/cssnr/virustotal-action/lint.yaml?logo=github&logoColor=white&label=lint)](https://github.com/cssnr/virustotal-action/actions/workflows/lint.yaml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=cssnr_virustotal-action&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=cssnr_virustotal-action)
[![GitHub Release Version](https://img.shields.io/github/v/release/cssnr/virustotal-action?logo=github)](https://github.com/cssnr/virustotal-action/releases/latest)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/cssnr/virustotal-action?logo=github&logoColor=white&label=updated)](https://github.com/cssnr/virustotal-action/graphs/commit-activity)
[![Codeberg Last Commit](https://img.shields.io/gitea/last-commit/cssnr/virustotal-action/master?gitea_url=https%3A%2F%2Fcodeberg.org%2F&logo=codeberg&logoColor=white&label=updated)](https://codeberg.org/cssnr/virustotal-action)
[![GitHub Top Language](https://img.shields.io/github/languages/top/cssnr/virustotal-action?logo=htmx&logoColor=white)](https://github.com/cssnr/virustotal-action)
[![GitHub Org Stars](https://img.shields.io/github/stars/cssnr?style=flat&logo=github&logoColor=white)](https://cssnr.github.io/)
[![Discord](https://img.shields.io/discord/899171661457293343?logo=discord&logoColor=white&label=discord&color=7289da)](https://discord.gg/wXy6m2X8wY)

# VirusTotal Action

- [Inputs](#Inputs)
- [Outputs](#Outputs)
- [Examples](#Examples)
- [Planned Features](#Planned-Features)
- [Support](#Support)
- [Contributing](#Contributing)

Upload Release Assets or Specified File Globs to VirusTotal and Optionally Update Release Notes with Links.

The /files/ endpoint is used for files under 32MB, otherwise, the /files/upload_url/ endpoint is used providing support
for files up to **650MB**. Therefore, files over 32MB will consume 2 API calls.

> [!NOTE]  
> Please submit a [Feature Request](https://github.com/cssnr/virustotal-action/discussions/categories/feature-requests)
> for new features or [Open an Issue](https://github.com/cssnr/virustotal-action/issues) if you find any bugs.

## Inputs

| input          | required | default        | description              |
| -------------- | -------- | -------------- | ------------------------ |
| vt_api_key     | **Yes**  | -              | VirusTotal API Key \*    |
| file_globs     | No       | -              | File Globs to Process \* |
| rate_limit     | No       | `4`            | API Calls Per Minute \*  |
| update_release | No       | `true`         | Update Release Notes \*  |
| summary        | No       | `true`         | Add Summary to Job \*    |
| github_token   | No       | `github.token` | Only for external or PAT |

**vt_api_key** - Get your API key from: https://www.virustotal.com/gui/my-apikey

**file_globs** - If provided, will process matching files instead of release assets.
For glob pattern [examples](#examples), see https://github.com/actions/toolkit/tree/main/packages/glob#patterns

**rate_limit** - Rate limit for file uploads. Set to `0` to disable if you know what you are doing.

**update_release** - If triggered from a release workflow, will update the release notes and append the results.

<details><summary>📜 View Release Notes Update Example</summary>

---

🛡️ **VirusTotal Results:**

- [install-linux.deb](https://www.virustotal.com/gui/file-analysis/ZDAzY2M2ZGQzZmEwZWEwZTI2NjQ5NmVjZDcwZmY0YTY6MTcxNzU2NzI3Ng==)
- [install-macos.pkg](https://www.virustotal.com/gui/file-analysis/YTkzOGFjMDZhNTI3NmU5MmI4YzQzNzg5ODE3OGRkMzg6MTcxNzU2NzI3OA==)
- [install-win.exe](https://www.virustotal.com/gui/file-analysis/M2JhZDJhMzRhYjcyM2Y0MDFkNjU1OGZlYjFkNjgyMmY6MTcxNzU2NzI4MA==)

---

</details>

**summary** - Will add result details to the job summary in the workflow

<details><summary>📜 View Job Summary Example</summary>

---

<table><tr><th>File</th><th>ID</th></tr><tr><td><a href="https://www.virustotal.com/gui/file-analysis/ZWFkNTUwMDlhYTM4MTU3MzljYWE1NWRlMjQ5MzE5Y2E6MTc0MDE3NDA5Ng==">README.md</a></td><td>ZWFkNTUwMDlhYTM4MTU3MzljYWE1NWRlMjQ5MzE5Y2E6MTc0MDE3NDA5Ng==</td></tr><tr><td><a href="https://www.virustotal.com/gui/file-analysis/ZTM4MjBkOGFhYmRhNjBiMTY0MTEwZjZkNDE1YjViODc6MTc0MDE3NDA5Ng==">.gitignore</a></td><td>ZTM4MjBkOGFhYmRhNjBiMTY0MTEwZjZkNDE1YjViODc6MTc0MDE3NDA5Ng==</td></tr></table>
<details><summary><strong>Outputs</strong></summary>

```json
[
  {
    "id": "ZWFkNTUwMDlhYTM4MTU3MzljYWE1NWRlMjQ5MzE5Y2E6MTc0MDE3NDA5Ng==",
    "name": "README.md",
    "link": "https://www.virustotal.com/gui/file-analysis/ZWFkNTUwMDlhYTM4MTU3MzljYWE1NWRlMjQ5MzE5Y2E6MTc0MDE3NDA5Ng=="
  },
  {
    "id": "ZTM4MjBkOGFhYmRhNjBiMTY0MTEwZjZkNDE1YjViODc6MTc0MDE3NDA5Ng==",
    "name": ".gitignore",
    "link": "https://www.virustotal.com/gui/file-analysis/ZTM4MjBkOGFhYmRhNjBiMTY0MTEwZjZkNDE1YjViODc6MTc0MDE3NDA5Ng=="
  }
]
```

```text
README.md/ZWFkNTUwMDlhYTM4MTU3MzljYWE1NWRlMjQ5MzE5Y2E6MTc0MDE3NDA5Ng==
.gitignore/ZTM4MjBkOGFhYmRhNjBiMTY0MTEwZjZkNDE1YjViODc6MTc0MDE3NDA5Ng==
```

</details>
<details><summary>Inputs</summary><table><tr><th>Input</th><th>Value</th></tr><tr><td>file_globs</td><td><code>README.md,.gitignore</code></td></tr><tr><td>rate_limit</td><td><code>4</code></td></tr><tr><td>update_release</td><td><code>true</code></td></tr><tr><td>summary</td><td><code>true</code></td></tr></table>
</details>

---

</details>

To see a workflow run you can view a recent
[test.yaml workflow run](https://github.com/cssnr/virustotal-action/actions/workflows/test.yaml)
_(requires login)_.

With minimal inputs (to process release assets automatically):

```yaml
- name: 'VirusTotal'
  uses: cssnr/virustotal-action@v1
  with:
    vt_api_key: ${{ secrets.VT_API_KEY }}
```

With all inputs:

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
    summary: true
```

See [Examples](#Examples) for more...

## Outputs

| output  | description                         |
| ------- | ----------------------------------- |
| results | Comma Seperated String of `file/id` |
| json    | JSON Object List Results String     |

Example results:

```text
install-linux.deb/ZDAzY2M2ZGQzZmEwZWEwZTI2NjQ5NmVjZDcwZmY0YTY6MTcxNzU2NzI3Ng==,install-macos.pkg/YTkzOGFjMDZhNTI3NmU5MmI4YzQzNzg5ODE3OGRkMzg6MTcxNzU2NzI3OA==,install-win.exe/M2JhZDJhMzRhYjcyM2Y0MDFkNjU1OGZlYjFkNjgyMmY6MTcxNzU2NzI4MA==
```

Example json (note: `link` is manually generated and added):

```json
[
  {
    "id": "ZDAzY2M2ZGQzZmEwZWEwZTI2NjQ5NmVjZDcwZmY0YTY6MTcxNzU2NzI3Ng==",
    "name": "install-linux.deb",
    "link": "https://www.virustotal.com/gui/file-analysis/ZDAzY2M2ZGQzZmEwZWEwZTI2NjQ5NmVjZDcwZmY0YTY6MTcxNzU2NzI3Ng=="
  }
]
```

Using the outputs:

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

_Note: URLs are generated by appending the ID to this url: https://www.virustotal.com/gui/file-analysis/_

## Examples

Ensure the step only runs on a release event:

```yaml
- name: 'VirusTotal'
  uses: cssnr/virustotal-action@v1
  if: ${{ github.event_name == 'release' }}
  with:
    vt_api_key: ${{ secrets.VT_API_KEY }}
```

With File Globs:

```yaml
- name: 'VirusTotal'
  uses: cssnr/virustotal-action@v1
  with:
    vt_api_key: ${{ secrets.VT_API_KEY }}
    file_globs: artifacts/*
```

Multiple Globs:

```yaml
- name: 'VirusTotal'
  uses: cssnr/virustotal-action@v1
  with:
    vt_api_key: ${{ secrets.VT_API_KEY }}
    file_globs: |
      artifacts/*
      assets/asset.zip
```

Simple Example:

```yaml
name: 'VirusTotal Example'

on:
  release:
    types: [published]

jobs:
  test:
    name: 'Test'
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: 'VirusTotal'
        uses: cssnr/virustotal-action@v1
        with:
          vt_api_key: ${{ secrets.VT_API_KEY }}
```

Full Example:

```yaml
name: 'VirusTotal Example'

on:
  release:
    types: [published]

jobs:
  windows:
    name: 'Windows Build'
    runs-on: windows-latest
    timeout-minutes: 5

    steps:
      - name: 'Checkout'
        uses: actions/checkout@v4

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
    name: 'VirusTotal Scan'
    runs-on: ubuntu-latest
    needs: [windows]
    timeout-minutes: 5
    if: ${{ github.event_name == 'release' }}

    steps:
      - name: 'VirusTotal'
        uses: cssnr/virustotal-action@v1
        with:
          vt_api_key: ${{ secrets.VT_API_KEY }}
          rate_limit: 4
          update_release: true
```

To see this used in a build/release/scan workflow, check out:  
https://github.com/cssnr/hls-downloader-client/blob/master/.github/workflows/build.yaml

## Planned Features

- Add release body parsing to properly process new files on edited activity.
- Add options to customize release update/output format.
- Add option to apply file_globs to release assets.
- Refactor vt.js as a Class to clean up index.js.

# Support

For general help or to request a feature see:

- Q&A Discussion: https://github.com/cssnr/virustotal-action/discussions/categories/q-a
- Request a Feature: https://github.com/cssnr/virustotal-action/discussions/categories/feature-requests

If you are experiencing an issue/bug or getting unexpected results you can:

- Report an Issue: https://github.com/cssnr/virustotal-action/issues
- Chat with us on Discord: https://discord.gg/wXy6m2X8wY
- Provide General Feedback: [https://cssnr.github.io/feedback/](https://cssnr.github.io/feedback/?app=VirusTotal%20Scan)

# Contributing

Currently, the best way to contribute to this project is to star this project on GitHub.

Additionally, you can support other GitHub Actions I have published:

- [Stack Deploy Action](https://github.com/cssnr/stack-deploy-action?tab=readme-ov-file#readme)
- [Portainer Stack Deploy](https://github.com/cssnr/portainer-stack-deploy-action?tab=readme-ov-file#readme)
- [VirusTotal Action](https://github.com/cssnr/virustotal-action?tab=readme-ov-file#readme)
- [Mirror Repository Action](https://github.com/cssnr/mirror-repository-action?tab=readme-ov-file#readme)
- [Update Version Tags Action](https://github.com/cssnr/update-version-tags-action?tab=readme-ov-file#readme)
- [Update JSON Value Action](https://github.com/cssnr/update-json-value-action?tab=readme-ov-file#readme)
- [Parse Issue Form Action](https://github.com/cssnr/parse-issue-form-action?tab=readme-ov-file#readme)
- [Cloudflare Purge Cache Action](https://github.com/cssnr/cloudflare-purge-cache-action?tab=readme-ov-file#readme)
- [Mozilla Addon Update Action](https://github.com/cssnr/mozilla-addon-update-action?tab=readme-ov-file#readme)
- [Docker Tags Action](https://github.com/cssnr/docker-tags-action?tab=readme-ov-file#readme)

For a full list of current projects to support visit: [https://cssnr.github.io/](https://cssnr.github.io/)
