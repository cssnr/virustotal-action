import { downloadAsset, vtUpload } from './vt.js'
import { RateLimiter } from 'limiter'

const core = require('@actions/core')
const github = require('@actions/github')
const fs = require('fs')
const path = require('path')

;(async () => {
    try {
        console.log('-'.repeat(40))
        console.log('release', github.context.payload.release)
        console.log('-'.repeat(40))

        // Check Release
        if (github.context.eventName !== 'release') {
            console.log('Skipping non-release:', github.context.eventName)
            return
        }

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

        const releaseTag = github.context.ref.replace('refs/tags/', '')
        console.log('releaseTag:', releaseTag)
        console.log('tag_name:', github.context.payload.release.tag_name)
        console.log('GITHUB_REF_NAME:', process.env.GITHUB_REF_NAME)

        const octokit = github.getOctokit(githubToken)

        // Get Release
        const release = await octokit.rest.repos.getReleaseByTag({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            tag: releaseTag,
        })
        console.log('-'.repeat(40))
        console.log('release:', release)
        console.log('-'.repeat(40))
        if (!release?.data) {
            console.log('release:', release)
            return core.setFailed(`Release Not Found for tag: ${releaseTag}`)
        }

        // Get Assets
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

        // Create Temp
        console.log('RUNNER_TEMP:', process.env.RUNNER_TEMP)
        const assetsPath = path.join(process.env.RUNNER_TEMP, 'assets')
        console.log('assetsPath:', assetsPath)
        if (!fs.existsSync(assetsPath)) {
            console.log('mkdirSync:', assetsPath)
            fs.mkdirSync(assetsPath)
        }

        // Process Assets
        const limiter = new RateLimiter({
            tokensPerInterval: rateLimit,
            interval: 'minute',
        })
        const results = []
        for (const asset of assets.data) {
            if (rateLimit) {
                const remainingRequests = await limiter.removeTokens(1)
                console.log('remainingRequests:', remainingRequests)
            }
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
            return core.info('Skipping Release Update due to update_release.')
        }

        // Update Release
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
    } catch (e) {
        console.log(e)
        core.setFailed(e.message)
    }
})()
