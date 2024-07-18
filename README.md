[![Tags](https://img.shields.io/github/actions/workflow/status/cssnr/virustotal-action/tags.yaml?logo=github&logoColor=white&label=tags)](https://github.com/cssnr/virustotal-action/actions/workflows/tags.yaml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=cssnr_virustotal-action&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=cssnr_virustotal-action)
[![CSSNR Website](https://img.shields.io/badge/pages-website-blue?logo=github&logoColor=white&color=blue)](https://cssnr.github.io/)
[![Discord](https://img.shields.io/discord/899171661457293343?logo=discord&logoColor=white&label=discord&color=7289da)](https://discord.gg/wXy6m2X8wY)

# VirusTotal Action

Upload Release Assets to VirusTotal and Optionally Update Release Notes with Links.

A VirusTotal API Key is required. You can get one for free from
[virustotal.com](https://www.virustotal.com/gui/sign-in).
For more information on the VirusTotal API check out [docs.virustotal.com](https://docs.virustotal.com/).

* [Inputs](#Inputs)
* [Outputs](#Outputs)
* [Planned Features](#Planned-Features)
* [Simple Example](#Simple-Example)
* [Full Example](#Full-Example)
* [Support](#Support)

> [!NOTE]  
> This currently only works on Releases but can be expanded to work on any files.  
> Please submit a [Feature Request](https://github.com/cssnr/virustotal-action/discussions/categories/feature-requests)
> for new features
> or [Open an Issue](https://github.com/cssnr/virustotal-action/issues) if you find any bugs.

The /files/ endpoint is used for files under 32MB, otherwise, the /files/upload_url/ endpoint is used providing support
for files up to **650MB**. Therefore, files over 32MB will consume 2 API calls.

## Inputs

| input          | required | default | description                                     |
|----------------|----------|---------|-------------------------------------------------|
| github_token   | Yes      | -       | GitHub Token from secrets.GITHUB_TOKEN          |
| vt_api_key     | Yes      | -       | VirusTotal API Key from VirusTotal.             |
| rate_limit     | No       | 4       | API Calls Per Minute. Set to `0` to disable     |
| update_release | No       | true    | Update Release Notes. Set to `false` to disable |

It is recommended to add API Keys to
[GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions).
The `GITHUB_TOKEN` secret does not have to be manually added and is automatically generated for each workflow run.

```yaml
  - name: "VirusTotal"
    uses: cssnr/virustotal-action@v1
    with:
      github_token: ${{ secrets.GITHUB_TOKEN }}
      vt_api_key: ${{ secrets.VT_API_KEY }}
      rate_limit: 4
      update_release: true
```

### Update Release

The Update Release option will append text similar to this:

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

## Planned Features

- Add `files` glob to allow processing any specified files/paths.
- Add release body parsing to properly process new files on `edited` activity.
- Add options to customize release update format.

## Simple Example

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

## Full Example

It is recommended to run this after all the build/upload jobs have completed.
Specify any jobs that upload releases in the `needs` for the VirusTotal Action.

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

# Support

For general help or to request a feature see:

- Q&A Discussion: https://github.com/cssnr/virustotal-action/discussions/categories/q-a
- Request a Feature: https://github.com/cssnr/virustotal-action/discussions/categories/feature-requests

If you are experiencing an issue/bug or getting unexpected results you can:

- Report an Issue: https://github.com/cssnr/virustotal-action/issues
- Chat with us on Discord: https://discord.gg/wXy6m2X8wY
- Provide General Feedback: [https://cssnr.github.io/feedback/](https://cssnr.github.io/feedback/?app=VirusTotal%20Scan)
