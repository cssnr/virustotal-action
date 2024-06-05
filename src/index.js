import { downloadAsset, vtUpload } from './vt.js'

const core = require('@actions/core')
const github = require('@actions/github')
const fs = require('fs')
const path = require('path')
// const crypto = require('crypto')

;(async () => {
    try {
        // console.log('github.context', github.context)
        // console.log('process.env:', process.env)
        if (github.context.eventName !== 'release') {
            console.log('Skipping non-release:', github.context.eventName)
            return
        }

        const vtApiKey = core.getInput('vt_api_key')
        if (!vtApiKey) {
            core.setFailed('Missing: vt_api_key')
        }
        const githubToken = core.getInput('github_token')
        if (!githubToken) {
            core.setFailed('Missing: github_token')
        }
        const updateRelease = core.getInput('update_release')
        console.log('update_release:', updateRelease)

        const octokit = github.getOctokit(githubToken)
        // console.log('octokit:', octokit)

        const releaseTag = github.context.ref.replace('refs/tags/', '')
        // const releaseTag = '0.1.12'
        console.log('releaseTag:', releaseTag)
        console.log('GITHUB_REF_NAME:', process.env.GITHUB_REF_NAME)

        const release = await octokit.rest.repos.getReleaseByTag({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            tag: releaseTag,
        })
        // console.log('release:', release)
        if (!release?.data) {
            console.log('Release Not Found:', release)
            core.setFailed(`Release Not Found: ${releaseTag}`)
            return
        }

        const assets = await octokit.rest.repos.listReleaseAssets({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            release_id: release.data.id,
        })
        // console.log('assets:', assets)
        if (!assets.data?.length) {
            console.log('No Assets Found:', assets)
            core.setFailed('No Assets Found')
            return
        }

        console.log('RUNNER_TEMP:', process.env.RUNNER_TEMP)
        const assetsPath = path.join(process.env.RUNNER_TEMP, 'assets')
        console.log('assetsPath:', assetsPath)
        if (!fs.existsSync(assetsPath)) {
            console.log('mkdirSync:', assetsPath)
            fs.mkdirSync(assetsPath)
        }

        const results = []
        for (const asset of assets.data) {
            console.log(`name: ${asset.name}`)
            const filePath = await downloadAsset(asset, assetsPath)
            console.log('filePath:', filePath)
            const response = await vtUpload(filePath, vtApiKey)
            console.log('response.data.id:', response.data.id)
            const link = `https://www.virustotal.com/gui/file-analysis/${response.data.id}`
            console.log('link:', link)
            const data = {
                name: asset.name,
                link: link,
            }
            results.push(data)
        }
        console.log('results:', results)

        if (updateRelease === 'false') {
            console.log('Skipping update_release:', updateRelease)
            return
        }

        let body = release.data.body
        body = body.concat('\n\n**VirusTotal Results:**')
        for (const result of results) {
            const parts = result.link.split('/')
            const hash = parts[parts.length - 1]
            body = body.concat(`\n- ${result.name} [${hash}](${result.link})`)
        }
        console.log(`body:\n\n${body}`)

        await octokit.rest.repos.updateRelease({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            release_id: release.data.id,
            body: body,
        })
    } catch (error) {
        console.log(error)
        core.setFailed(error.message)
    }
})()
