import { vtUpload } from './vt.js'
import { RateLimiter } from 'limiter'

const core = require('@actions/core')
const github = require('@actions/github')
const fs = require('fs')
const path = require('path')

;(async () => {
    try {
        // console.log('-'.repeat(40))
        // console.log('release', github.context.payload.release)
        // console.log('-'.repeat(40))

        // Check Release
        if (!github.context.payload.release) {
            core.info(`Skipping non-release: ${github.context.eventName}`)
            return
        }
        console.log('tag_name:', github.context.payload.release.tag_name)

        // Parse Inputs
        const githubToken = core.getInput('github_token')
        if (!githubToken) {
            return core.setFailed('Missing: github_token')
        }
        const vtApiKey = core.getInput('vt_api_key')
        if (!vtApiKey) {
            return core.setFailed('Missing: vt_api_key')
        }
        const updateRelease = core.getInput('update_release')
        console.log('update_release:', updateRelease)
        const rateLimit = parseInt(core.getInput('rate_limit'))
        console.log('rate_limit:', rateLimit)

        // Set Variables
        // const { owner, repo } = github.context.repo
        // Note: release from context does not contain updates for re-runs
        // const release = github.context.payload.release
        const release_id = github.context.payload.release.id
        console.log('release_id:', release_id)
        console.log('-'.repeat(40))
        const octokit = github.getOctokit(githubToken)
        const limiter = new RateLimiter({
            tokensPerInterval: rateLimit,
            interval: 'minute',
        })

        // Get Release
        const release = await octokit.rest.repos.getRelease({
            ...github.context.repo,
            release_id,
        })
        if (!release?.data) {
            console.log('release:', release)
            return core.setFailed(`Release Not Found: ${release_id}`)
        }

        // Get Assets
        const assets = await octokit.rest.repos.listReleaseAssets({
            ...github.context.repo,
            release_id,
        })
        if (!assets?.data?.length) {
            console.log('assets:', assets)
            return core.setFailed(`No Assets Found for Release: ${release_id}`)
        }

        // Create Temp
        console.log('RUNNER_TEMP:', process.env.RUNNER_TEMP)
        const assetsPath = path.join(process.env.RUNNER_TEMP, 'assets')
        console.log('assetsPath:', assetsPath)
        if (!fs.existsSync(assetsPath)) {
            console.log('mkdirSync:', assetsPath)
            fs.mkdirSync(assetsPath)
        }

        // Process Assets
        const results = []
        for (const asset of assets.data) {
            core.info(`----- Processing Asset: ${asset.name} -----`)
            if (rateLimit) {
                const remainingRequests = await limiter.removeTokens(1)
                console.log('remainingRequests:', remainingRequests)
            }
            // const filePath = await downloadAsset(asset, assetsPath)
            const filePath = path.join(assetsPath, asset.name)
            console.log('filePath:', filePath)
            const file = await octokit.rest.repos.getReleaseAsset({
                ...github.context.repo,
                asset_id: asset.id,
                request: {
                    headers: {
                        Accept: 'application/octet-stream',
                    },
                },
            })
            console.log('file.data')
            console.log(file.data)
            fs.writeFileSync(filePath, Buffer.from(file.data))
            const response = await vtUpload(filePath, vtApiKey)
            console.log('response.data.id:', response.data.id)
            const link = `https://www.virustotal.com/gui/file-analysis/${response.data.id}`
            console.log('link:', link)
            const result = {
                name: asset.name,
                link: link,
            }
            results.push(result)
        }
        console.log('-'.repeat(40))
        console.log('results:', results)

        // Update Release
        if (updateRelease === 'false') {
            return core.info('Skipping Release Update on: update_release')
        }
        let body = release.data.body
        body = body.concat('\n\n🛡️ **VirusTotal Results:**')
        for (const result of results) {
            body = body.concat(`\n- [${result.name}](${result.link})`)
        }
        console.log('-'.repeat(40))
        console.log(`body:\n${body}`)
        await octokit.rest.repos.updateRelease({
            ...github.context.repo,
            release_id,
            body,
        })
    } catch (e) {
        console.log(e)
        core.setFailed(e.message)
    }
})()
