const core = require('@actions/core')
const github = require('@actions/github')
const glob = require('@actions/glob')
const fs = require('fs')
const path = require('path')
const { RateLimiter } = require('limiter')

const vtUpload = require('./vt')

;(async () => {
    try {
        // Parse Inputs
        const inputs = parseInputs()

        // Set Variables
        const octokit = github.getOctokit(inputs.token)
        const limiter = new RateLimiter({
            tokensPerInterval: inputs.rate,
            interval: 'minute',
        })

        /** @type {Object[]} */
        let results
        if (inputs.files) {
            results = await processFiles(inputs, limiter)
        } else if (github.context.payload.release) {
            results = await processRelease(inputs, limiter, octokit)
        } else {
            return core.setFailed('No files or release to process.')
        }

        // Set Output
        const output = []
        for (const result of results) {
            output.push(`${result.name}/${result.id}`)
        }
        core.setOutput('results', output.join(','))

        // Update Release
        if (github.context.payload.release && inputs.update) {
            let body = release.data.body
            body += '\n\n🛡️ **VirusTotal Results:**'
            for (const result of results) {
                body += `\n- [${result.name}](${result.link})`
            }
            console.log('-'.repeat(40))
            console.log(`body:\n${body}`)
            await octokit.rest.repos.updateRelease({
                ...github.context.repo,
                release_id,
                body,
            })
        } else {
            core.info(
                `Skipping Release Update Because not release or not update_release: ${inputs.update}`
            )
        }
    } catch (e) {
        console.log(e)
        core.setFailed(e.message)
    }
})()

/**
 * @function processRelease
 * @param {Object} inputs
 * @param {RateLimiter} limiter
 * @param {InstanceType<typeof github.GitHub>} octokit
 * @return {Promise<Object[{id, name, link}]>}
 */
async function processRelease(inputs, limiter, octokit) {
    const release_id = github.context.payload.release.id
    console.log('release_id:', release_id)

    // Get Release
    const release = await octokit.rest.repos.getRelease({
        ...github.context.repo,
        release_id,
    })
    if (!release?.data) {
        console.log('release:', release)
        throw new Error(`Release Not Found: ${release_id}`)
        // return core.setFailed(`Release Not Found: ${release_id}`)
    }

    // Get Assets
    const assets = await octokit.rest.repos.listReleaseAssets({
        ...github.context.repo,
        release_id,
    })
    if (!assets?.data?.length) {
        console.log('assets:', assets)
        throw new Error(`No Assets Found for Release: ${release_id}`)
        // return core.setFailed(`No Assets Found for Release: ${release_id}`)
    }

    // Create Temp
    console.log('RUNNER_TEMP:', process.env.RUNNER_TEMP)
    const assetsPath = path.join(process.env.RUNNER_TEMP, 'assets')
    console.log('assetsPath:', assetsPath)
    if (!fs.existsSync(assetsPath)) {
        fs.mkdirSync(assetsPath)
    }

    // Process Assets
    const results = []
    for (const asset of assets.data) {
        core.info(`----- Processing Asset: ${asset.name} -----`)
        if (inputs.rate) {
            const remainingRequests = await limiter.removeTokens(1)
            console.log('remainingRequests:', remainingRequests)
        }
        const filePath = path.join(assetsPath, asset.name)
        console.log('filePath:', filePath)
        const file = await octokit.rest.repos.getReleaseAsset({
            ...github.context.repo,
            asset_id: asset.id,
            headers: {
                Accept: 'application/octet-stream',
            },
        })
        fs.writeFileSync(filePath, Buffer.from(file.data))
        results.push(processVt(inputs, asset.name, filePath))
        // const response = await vtUpload(filePath, inputs.key)
        // console.log('response.data.id:', response.data.id)
        // const link = `https://www.virustotal.com/gui/file-analysis/${response.data.id}`
        // console.log('link:', link)
        // const result = {
        //     id: response.data.id,
        //     name: asset.name,
        //     link: link,
        // }
        // results.push(result)
    }
    return results
}

/**
 * @function processVt
 * @param {Object} inputs
 * @param {String} name
 * @param {String} filePath
 * @return {Promise<{name, link: string, id}>}
 */
async function processVt(inputs, name, filePath) {
    const response = await vtUpload(filePath, inputs.key)
    console.log('response.data.id:', response.data.id)
    const link = `https://www.virustotal.com/gui/file-analysis/${response.data.id}`
    console.log('link:', link)
    return { id: response.data.id, name, link }
}

/**
 * @function processFiles
 * @param {Object} inputs
 * @param {RateLimiter} limiter
 * @return {Promise<Object[{id, name, link}]>}
 */
async function processFiles(inputs, limiter) {
    // const patterns = ['**/tar.gz', '**/tar.bz']
    const globber = await glob.create(inputs.files.join('\n'))
    const files = await globber.glob()
    console.log('files:', files)
    const results = []
    for (const file of files) {
        const name = file.split('\\').pop().split('/').pop()
        console.log('name:', name)
        results.push(processVt(inputs, name, file))
    }
    return results
}

/**
 * @function parseInputs
 * @return {{rate: number, update: boolean, files: string[]|undefined, key: string, token: string}}
 */
function parseInputs() {
    const githubToken = core.getInput('github_token', { required: true })
    const vtApiKey = core.getInput('vt_api_key', { required: true })
    const updateRelease = core.getBooleanInput('update_release')
    console.log('update_release:', updateRelease)
    const rateLimit = core.getInput('rate_limit', { required: true })
    console.log('rate_limit:', rateLimit)
    const fileGlobs = core.getInput('file_globs')
    console.log('file_globs:', fileGlobs)
    return {
        token: githubToken,
        key: vtApiKey,
        update: updateRelease,
        rate: parseInt(rateLimit),
        files: fileGlobs?.split('\n'),
    }
}
