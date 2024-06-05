[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=cssnr_virustotal-action&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=cssnr_virustotal-action)
# VirusTotal Action

Upload Release Assets to VirusTotal and Optionally Update Release Notes with Links.

A VirusTotal API Key is required. You can get one for free from [virustotal.com](https://www.virustotal.com/gui/sign-in).
For more information on the VirusTotal API check out [docs.virustotal.com](https://docs.virustotal.com/).

> [!NOTE]  
> This currently only works on Releases but can be expanded to work on any specified files.  
> Please submit a [Feature Request](https://github.com/cssnr/virustotal-action/discussions/categories/feature-requests) for new features
> or [Open an Issue](https://github.com/cssnr/virustotal-action/issues) if you find any bugs.

The /files/ endpoint is used for files under 32MB, otherwise, the /files/upload_url/ endpoint is used providing support for files up to **650MB**.

## Inputs

| input           | required | default | description               |
|-----------------|----------|---------|---------------------------|
| github_token:   | Yes      | -       | secrets.GITHUB_TOKEN      |
| vt_api_key:     | Yes      | -       | VirusTotal API Key        |
| update_release: | No       | true    | Set to `false` to disable |

```yaml
  - name: "VirusTotal"
    uses: cssnr/virustotal-action@v1
    with:
      github_token: ${{ secrets.GITHUB_TOKEN }}
      vt_api_key: ${{ secrets.VT_API_KEY }}
      update_release: true
```

### Update Release

The Update Release option will append text similar to this:

---
**VirusTotal Results:**
- install-linux.deb [ZDAzY2M2ZGQzZmEwZWEwZTI2NjQ5NmVjZDcwZmY0YTY6MTcxNzU2NzI3Ng==](https://www.virustotal.com/gui/file-analysis/ZDAzY2M2ZGQzZmEwZWEwZTI2NjQ5NmVjZDcwZmY0YTY6MTcxNzU2NzI3Ng==)
- install-macos.pkg [YTkzOGFjMDZhNTI3NmU5MmI4YzQzNzg5ODE3OGRkMzg6MTcxNzU2NzI3OA==](https://www.virustotal.com/gui/file-analysis/YTkzOGFjMDZhNTI3NmU5MmI4YzQzNzg5ODE3OGRkMzg6MTcxNzU2NzI3OA==)
- install-win.exe [M2JhZDJhMzRhYjcyM2Y0MDFkNjU1OGZlYjFkNjgyMmY6MTcxNzU2NzI4MA==](https://www.virustotal.com/gui/file-analysis/M2JhZDJhMzRhYjcyM2Y0MDFkNjU1OGZlYjFkNjgyMmY6MTcxNzU2NzI4MA==)
---

## Simple Example

```yaml
name: "VirusTotal Example"

on:
  workflow_dispatch:
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
          update_release: true
```

## Full Example

It is recommended to run this after all the build/upload jobs have completed.
Specify any jobs that upload releases in the `needs` for the VirusTotal Action.

```yaml
name: "VirusTotal Example"

on:
  workflow_dispatch:
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
          update_release: true
```
