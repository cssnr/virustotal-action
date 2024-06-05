# VirusTotal Action

Upload Release Assets to VirusTotal and Optionally Update Release Notes with Links.

## Inputs

| input           | required | default | description               |
|-----------------|----------|---------|---------------------------|
| github_token:   | Yes      | -       | secrets.GITHUB_TOKEN      |
| vt_api_key:     | Yes      | -       | VirusTotal API Key        |
| update_release: | No       | true    | Set to `false` to disable |

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
      - name: "Checkout"
        uses: actions/checkout@v4

      - name: "VirusTotal"
        uses: cssnr/virustotal-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          vt_api_key: ${{ secrets.VT_API_KEY }}
          update_release: true
```
