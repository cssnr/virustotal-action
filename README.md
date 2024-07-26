[![Tags](https://img.shields.io/github/actions/workflow/status/cssnr/virustotal-action/tags.yaml?logo=github&logoColor=white&label=tags)](https://github.com/cssnr/virustotal-action/actions/workflows/tags.yaml)
[![Test](https://img.shields.io/github/actions/workflow/status/cssnr/virustotal-action/test.yaml?logo=github&logoColor=white&label=test)](https://github.com/cssnr/virustotal-action/actions/workflows/test.yaml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=cssnr_virustotal-action&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=cssnr_virustotal-action)
[![GitHub Release Version](https://img.shields.io/github/v/release/cssnr/virustotal-action?logo=github)](https://github.com/cssnr/virustotal-action/releases/latest)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/cssnr/virustotal-action?logo=github&logoColor=white&label=updated)](https://github.com/cssnr/virustotal-action/graphs/commit-activity)
[![GitHub Top Language](https://img.shields.io/github/languages/top/cssnr/virustotal-action?logo=htmx&logoColor=white)](https://github.com/cssnr/virustotal-action)
[![GitHub Org Stars](https://img.shields.io/github/stars/cssnr?style=flat&logo=github&logoColor=white)](https://cssnr.github.io/)
[![Discord](https://img.shields.io/discord/899171661457293343?logo=discord&logoColor=white&label=discord&color=7289da)](https://discord.gg/wXy6m2X8wY)

# VirusTotal Action

Upload Release Assets or Specified File Globs to VirusTotal and Optionally Update Release Notes with Links.

* [Inputs](#Inputs)
* [Outputs](#Outputs)
* [Examples](#Examples)
* [Planned Features](#Planned-Features)
* [Support](#Support)
* [Contributing](#Contributing)

> [!NOTE]  
> Please submit a [Feature Request](https://github.com/cssnr/virustotal-action/discussions/categories/feature-requests)
> for new features or [Open an Issue](https://github.com/cssnr/virustotal-action/issues) if you find any bugs.

The /files/ endpoint is used for files under 32MB, otherwise, the /files/upload_url/ endpoint is used providing support
for files up to **650MB**. Therefore, files over 32MB will consume 2 API calls.

## Inputs

| input          | required | default | description                                 |
|----------------|----------|---------|---------------------------------------------|
| github_token   | Yes      | -       | GitHub Token: `${{ secrets.GITHUB_TOKEN }}` |
| vt_api_key     | Yes      | -       | VirusTotal API Key from VirusTotal *        |
| file_globs     | No       | -       | File Globs to Process, newline seperated *  |
| rate_limit     | No       | 4       | API Calls Per Minute, `0` to disable        |
| update_release | No       | true    | Update Release Notes, `false` to disable    |

**vt_api_key** - Get your API key from: https://www.virustotal.com/gui/my-apikey

**file_globs** - For glob pattern examples, see: https://github.com/actions/toolkit/tree/main/packages/glob#patterns

```yaml
  - name: "VirusTotal"
    uses: cssnr/virustotal-action@v1
    with:
      github_token: ${{ secrets.GITHUB_TOKEN }}
      vt_api_key: ${{ secrets.VT_API_KEY }}
```

### Update Release

The Update Release option will append text similar to this to the release body:

---
🛡️ **VirusTotal Results:**

- [install-linux.deb](https://www.virustotal.com/gui/file-analysis/ZDAzY2M2ZGQzZmEwZWEwZTI2NjQ5NmVjZDcwZmY0YTY6MTcxNzU2NzI3Ng==)
- [install-macos.pkg](https://www.virustotal.com/gui/file-analysis/YTkzOGFjMDZhNTI3NmU5MmI4YzQzNzg5ODE3OGRkMzg6MTcxNzU2NzI3OA==)
- [install-win.exe](https://www.virustotal.com/gui/file-analysis/M2JhZDJhMzRhYjcyM2Y0MDFkNjU1OGZlYjFkNjgyMmY6MTcxNzU2NzI4MA==)

---

## Outputs

| output  | description                         |
|---------|-------------------------------------|
| results | Comma Seperated String of `file/id` |

Example Output:

```text
install-linux.deb/ZDAzY2M2ZGQzZmEwZWEwZTI2NjQ5NmVjZDcwZmY0YTY6MTcxNzU2NzI3Ng==,install-macos.pkg/YTkzOGFjMDZhNTI3NmU5MmI4YzQzNzg5ODE3OGRkMzg6MTcxNzU2NzI3OA==,install-win.exe/M2JhZDJhMzRhYjcyM2Y0MDFkNjU1OGZlYjFkNjgyMmY6MTcxNzU2NzI4MA==
```

```yaml
  - name: "VirusTotal"
    uses: cssnr/virustotal-action@v1
    id: vt
    with:
      github_token: ${{ secrets.GITHUB_TOKEN }}
      vt_api_key: ${{ secrets.VT_API_KEY }}

  - name: "Echo Results"
    run: echo ${{ steps.vt.outputs.results }}
```

## Examples

With File Globs:

```yaml
  - name: "VirusTotal"
    uses: cssnr/virustotal-action@v1
    with:
      github_token: ${{ secrets.GITHUB_TOKEN }}
      vt_api_key: ${{ secrets.VT_API_KEY }}
      file_globs: artifacts/*
```

Multiple Globs:

```yaml
  - name: "VirusTotal"
    uses: cssnr/virustotal-action@v1
    with:
      github_token: ${{ secrets.GITHUB_TOKEN }}
      vt_api_key: ${{ secrets.VT_API_KEY }}
      file_globs: |
        artifacts/*
        assets/asset.zip
```

Simple Example:

```yaml
name: "VirusTotal Example"

on:
  release:
    types: [ published ]

jobs:
  test:
    name: "Test"
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: "VirusTotal"
        uses: cssnr/virustotal-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          vt_api_key: ${{ secrets.VT_API_KEY }}
```

Full Example:

```yaml
name: "VirusTotal Example"

on:
  release:
    types: [ published ]

jobs:
  windows:
    name: "Windows Build"
    runs-on: windows-latest
    timeout-minutes: 5

    steps:
      - name: "Checkout"
        uses: actions/checkout@v4

      - name: "Build"
        uses: Minionguyjpro/Inno-Setup-Action@v1.2.2
        with:
          path: client.iss
          options: "/DMyAppVersion=${{ github.ref_name }}"

      - name: "Upload to Release"
        uses: svenstaro/upload-release-action@v2
        if: ${{ github.event_name == 'release' }}
        with:
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          file: out/*
          tag: ${{ github.ref }}
          overwrite: true
          file_glob: true

  virustotal:
    name: "VirusTotal Scan"
    runs-on: ubuntu-latest
    needs: [ windows ]
    timeout-minutes: 5
    if: ${{ github.event_name == 'release' }}

    steps:
      - name: "VirusTotal"
        uses: cssnr/virustotal-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          vt_api_key: ${{ secrets.VT_API_KEY }}
          rate_limit: 4
          update_release: true
```

To see this used in a build/release/scan workflow, check out:  
https://github.com/cssnr/hls-downloader-client/blob/master/.github/workflows/build.yaml

## Planned Features

- Add release body parsing to properly process new files on `edited` activity.
- Add workflow summary to workflow results.
- Add options to customize release update format.

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

- [VirusTotal Action](https://github.com/cssnr/virustotal-action)
- [Update Version Tags Action](https://github.com/cssnr/update-version-tags-action)
- [Update JSON Value Action](https://github.com/cssnr/update-json-value-action)
- [Parse Issue Form Action](https://github.com/cssnr/parse-issue-form-action)
- [Portainer Stack Deploy](https://github.com/cssnr/portainer-stack-deploy-action)
- [Mozilla Addon Update Action](https://github.com/cssnr/mozilla-addon-update-action)

For a full list of current projects to support visit: [https://cssnr.github.io/](https://cssnr.github.io/)
