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
        // console.log('inputs:', inputs)

        // Set Variables
        const octokit = github.getOctokit(inputs.token)
        const release = await getRelease(octokit)
        const limiter = new RateLimiter({
            tokensPerInterval: inputs.rate,
            interval: 'minute',
        })

        console.log('inputs.files:', inputs.files)
        console.log('inputs.files?.length:', inputs.files?.length)

        /** @type {Object[]} */
        let results
        if (inputs.files?.length) {
            core.info('Processing Files Glob')
            results = await processFiles(inputs, limiter)
        } else if (release) {
            core.info('Processing Release Assets')
            results = await processRelease(inputs, limiter, octokit, release)
        } else {
            return core.setFailed('No files or release to process.')
        }
        console.log('-'.repeat(40))
        console.log('results:', results)

        // Set Output
        const output = []
        for (const result of results) {
            output.push(`${result.name}/${result.id}`)
        }
        core.setOutput('results', output.join(','))

        // Update Release
        if (release && inputs.update) {
            core.info(`Updating Release ID: ${release.id}`)
            let body = release.body
            body += '\n\n🛡️ **VirusTotal Results:**'
            for (const result of results) {
                body += `\n- [${result.name}](${result.link})`
            }
            console.log('-'.repeat(40))
            console.log(`body:\n${body}`)
            await octokit.rest.repos.updateRelease({
                ...github.context.repo,
                release_id: release.id,
                body,
            })
        } else {
            core.info(
                `Skipping Release Update Because not release or not update_release: ${inputs.update}`
            )
        }

        core.info(`\u001b[32;1mFinished Success`)
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
 * @param {Object} release
 * @return {Promise<Object[{id, name, link}]>}
 */
async function processRelease(inputs, limiter, octokit, release) {
    // Get Assets
    const assets = await octokit.rest.repos.listReleaseAssets({
        ...github.context.repo,
        release_id: release.id,
    })
    if (!assets?.data?.length) {
        console.log('assets:', assets)
        throw new Error(`No Assets Found for Release: ${release.id}`)
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
        core.info(`--- Processing Asset: ${asset.name}`)
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
        const result = await processVt(inputs, asset.name, filePath)
        // console.log('result:', result)
        results.push(result)
    }
    return results
}

/**
 * @function processFiles
 * @param {Object} inputs
 * @param {RateLimiter} limiter
 * @return {Promise<Object[{id, name, link}]>}
 */
async function processFiles(inputs, limiter) {
    // const patterns = ['**/tar.gz', '**/tar.bz']
    const globber = await glob.create(inputs.files.join('\n'), {
        matchDirectories: false,
    })
    const files = await globber.glob()
    console.log('files:', files)
    if (!files.length) {
        throw new Error('No files to process.')
    }
    const results = []
    for (const file of files) {
        const name = file.split('\\').pop().split('/').pop()
        core.info(`--- Processing File: ${name}`)
        if (inputs.rate) {
            const remainingRequests = await limiter.removeTokens(1)
            console.log('remainingRequests:', remainingRequests)
        }
        const result = await processVt(inputs, name, file)
        // console.log('result:', result)
        results.push(result)
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
 * @function processRelease
 * @param {InstanceType<typeof github.GitHub>} octokit
 * @return {Promise<Object|Undefined>}
 */
async function getRelease(octokit) {
    const release_id = github.context.payload.release?.id
    console.log('release_id:', release_id)
    if (!release_id) {
        return
    }
    const release = await octokit.rest.repos.getRelease({
        ...github.context.repo,
        release_id,
    })
    return release.data
}

/**
 * @function parseInputs
 * @return {{rate: number, update: boolean, files: string[]|undefined, key: string, token: string}}
 */
function parseInputs() {
    const githubToken = core.getInput('github_token', { required: true })
    const vtApiKey = core.getInput('vt_api_key', { required: true })
    const fileGlobs = core.getInput('file_globs')
    console.log('file_globs:', fileGlobs)
    const updateRelease = core.getBooleanInput('update_release')
    console.log('update_release:', updateRelease)
    const rateLimit = core.getInput('rate_limit', { required: true })
    console.log('rate_limit:', rateLimit)
    return {
        token: githubToken,
        key: vtApiKey,
        update: updateRelease,
        rate: parseInt(rateLimit),
        files: fileGlobs?.split('\n'),
    }
}
