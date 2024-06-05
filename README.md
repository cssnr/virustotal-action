# VirusTotal Action

Upload Release Assets to VirusTotal and Optionally Update Release Notes with Links.

## Inputs

| input           | required | default | description               |
|-----------------|----------|---------|---------------------------|
| github_token:   | Yes      | -       | secrets.GITHUB_TOKEN      |
| vt_api_key:     | Yes      | -       | VirusTotal API Key        |
| update_release: | No       | true    | Set to `false` to disable |

```yaml
  - name: "VirusTotal"
    uses: cssnr/virustotal-action@master
    with:
      github_token: ${{ secrets.GITHUB_TOKEN }}
      vt_api_key: ${{ secrets.VT_API_KEY }}
      update_release: true
```

## Simple Example

```yaml
name: "Test VirusTotal Workflow"

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
        uses: cssnr/virustotal-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          vt_api_key: ${{ secrets.VT_API_KEY }}
          update_release: true
```

## Full Example

It is recommended to run this after all the build/upload jobs have completed. 
Specify any jobs that upload releases in the `needs` for the VirusTotal Action.

```yaml
name: "Test VirusTotal Workflow"

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
        uses: cssnr/virustotal-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          vt_api_key: ${{ secrets.VT_API_KEY }}
          update_release: true
```
