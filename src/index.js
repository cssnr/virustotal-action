const fs = require('node:fs')
const path = require('node:path')

const core = require('@actions/core')
const github = require('@actions/github')
const glob = require('@actions/glob')

const { RateLimiter } = require('limiter')

const vtUpload = require('./vt')

;(async () => {
    try {
        core.info('🏳️ Starting VirusTotal Action')

        // Get Inputs
        core.startGroup('Inputs')
        const inputs = getInputs()
        console.log(inputs)
        core.endGroup() // Inputs

        // Set Variables
        const octokit = github.getOctokit(inputs.token)
        const release = await getRelease(octokit)
        const limiter = new RateLimiter({
            tokensPerInterval: inputs.rate,
            interval: 'minute',
        })

        // Process
        /** @type {Object[]} */
        let results
        if (inputs.files?.length) {
            // core.info('📁 Processing File Globs')
            results = await processFiles(inputs, limiter)
        } else if (release) {
            // core.info('🗄️ Processing Release Assets')
            results = await processRelease(inputs, limiter, octokit, release)
        } else {
            return core.setFailed('No files or release to process.')
        }
        core.startGroup('Results')
        console.log(results)
        core.endGroup() // Results

        // Update Release
        if (release && inputs.update) {
            core.startGroup(`Updating Release ${release.id}`)
            let body = release.body

            body += `\n\n`
            if (inputs.heading) {
                body += `${inputs.heading}\n\n`
            }
            if (inputs.collapsed) {
                body += `\n\n<details><summary>Click Here to Show Scan Results</summary>\n\n`
            }
            // const collapsed = inputs.collapsed ? '' : ' open'
            // body += `\n\n<details${collapsed}><summary>${inputs.heading}</summary>\n\n`
            for (const result of results) {
                let name = result.name
                if (inputs.name === 'id') {
                    name = result.id
                    // } else if (inputs.name === 'hash') {
                    //     name = 'TODO: ADD HASH HERE'
                }
                console.log(`name: ${name}`)
                if (inputs.name) body += `\n- [${name}](${result.link})`
            }
            if (inputs.collapsed) {
                body += '\n\n</details>\n\n'
            } else {
                body += `\n\n`
            }

            console.log(`\n${body}\n`)
            await octokit.rest.repos.updateRelease({
                ...github.context.repo,
                release_id: release.id,
                body,
            })
            core.endGroup() // Release
        } else {
            core.info('⏩ \u001b[33mSkipping Release Update')
        }

        // Set Output
        core.info('📩 Setting Outputs')
        const output = []
        for (const result of results) {
            output.push(`${result.name}/${result.id}`)
        }
        core.setOutput('results', output.join(','))
        core.setOutput('json', JSON.stringify(results))

        // Summary
        if (inputs.summary) {
            core.info('📝 Writing Job Summary')
            try {
                await addSummary(inputs, results, output)
            } catch (e) {
                console.log(e)
                core.error(`Error writing Job Summary ${e.message}`)
            }
        }

        core.info('✅ \u001b[32;1mFinished Success')
    } catch (e) {
        core.endGroup()
        console.log(e)
        if (e.response) {
            console.log(`\u001b[31m Error: ${e.response.statusText}`)
            console.log(e.response.data)
        }
        core.setFailed(e.message)
    }
})()

/**
 * Process Release Assets
 * @param {Object} inputs
 * @param {RateLimiter} limiter
 * @param {InstanceType<typeof github.GitHub>} octokit
 * @param {Object} release
 * @return {Promise<Object[{id, name, link}]>}
 */
async function processRelease(inputs, limiter, octokit, release) {
    core.startGroup('Processing Release Assets')
    core.startGroup('Release')
    console.log(release)
    core.endGroup() // Release

    // Get Assets
    const assets = await octokit.rest.repos.listReleaseAssets({
        ...github.context.repo,
        release_id: release.id,
    })
    if (!assets?.data?.length) {
        console.log('assets:', assets)
        throw new Error(`No Assets Found for Release: ${release.id}`)
    }

    // Create Temp
    console.log('RUNNER_TEMP:', process.env.RUNNER_TEMP)
    const assetsPath = path.join(process.env.RUNNER_TEMP, 'assets')
    console.log('assetsPath:', assetsPath)
    if (!fs.existsSync(assetsPath)) {
        fs.mkdirSync(assetsPath)
    }

    console.log(assets.data)
    core.endGroup() // Assets

    // Process Assets
    const results = []
    for (const asset of assets.data) {
        core.startGroup(`Processing: \u001b[36m${asset.name}`)
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
        console.log('result:', result)
        results.push(result)
        core.endGroup() // Processing
    }
    return results
}

/**
 * Process File Globs
 * @param {Object} inputs
 * @param {RateLimiter} limiter
 * @return {Promise<Object[{id, name, link}]>}
 */
async function processFiles(inputs, limiter) {
    const globber = await glob.create(inputs.files.join('\n'), {
        matchDirectories: false,
    })
    const files = await globber.glob()
    core.startGroup('Processing File Globs')
    console.log(files)
    core.endGroup() // Files
    if (!files.length) {
        throw new Error('No files to process.')
    }
    const results = []
    for (const file of files) {
        const name = file.split('\\').pop().split('/').pop()
        core.startGroup(`Processing: \u001b[36m${name}`)
        if (inputs.rate) {
            const remainingRequests = await limiter.removeTokens(1)
            console.log('remainingRequests:', remainingRequests)
        }
        const result = await processVt(inputs, name, file)
        // console.log('result:', result)
        results.push(result)
        core.endGroup() // Processing
    }
    return results
}

/**
 * Process VirusTotal
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
 * Get Release
 * @param {InstanceType<typeof github.GitHub>} octokit
 * @return {Promise<InstanceType<typeof github.GitHub>|Undefined>}
 */
async function getRelease(octokit) {
    if (!github.context.payload.release?.id) {
        return
    }
    core.info(`Getting Release: \u001b[32m${github.context.payload.release.id}`)
    const release = await octokit.rest.repos.getRelease({
        ...github.context.repo,
        release_id: github.context.payload.release.id,
    })
    return release.data
}

/**
 * Add Job Summary
 * @param {Object} inputs
 * @param {Object[]} results
 * @param {Array} output
 * @return {Promise<void>}
 */
async function addSummary(inputs, results, output) {
    core.summary.addRaw('## VirusTotal Action\n')

    const results_table = []
    for (const result of results) {
        results_table.push([
            { data: `<a href="${result.link}">${result.name}</a>` },
            { data: result.id },
        ])
    }
    core.summary.addTable([
        [
            { data: 'File', header: true },
            { data: 'ID', header: true },
        ],
        ...results_table,
    ])

    core.summary.addRaw('<details><summary>Outputs</summary>')
    core.summary.addCodeBlock(JSON.stringify(results, null, 2), 'json')
    core.summary.addCodeBlock(output.join('\n'), 'text')
    core.summary.addRaw('</details>\n')

    delete inputs.token
    delete inputs.key
    const yaml = Object.entries(inputs)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join('\n')
    core.summary.addRaw('<details><summary>Inputs</summary>')
    core.summary.addCodeBlock(yaml, 'yaml')
    core.summary.addRaw('</details>\n')

    const text = 'View Documentation, Report Issues or Request Features'
    const link = 'https://github.com/cssnr/virustotal-action'
    core.summary.addRaw(`\n[${text}](${link}?tab=readme-ov-file#readme)\n\n---`)
    await core.summary.write()
}

/**
 * Get Inputs
 * @typedef {Object} Inputs
 * @property {String} token
 * @property {String} key
 * @property {String[]} files
 * @property {Number} rate
 * @property {Boolean} update
 * @property {Boolean} collapsed
 * @property {String} name
 * @property {String} heading
 * @property {Boolean} summary
 * @return {Inputs}
 */
function getInputs() {
    return {
        token: core.getInput('github_token', { required: true }),
        key: core.getInput('vt_api_key', { required: true }),
        files: core.getInput('file_globs').split('\n').filter(Boolean),
        rate: Number.parseInt(core.getInput('rate_limit', { required: true })),
        update: core.getBooleanInput('update_release'),
        collapsed: core.getBooleanInput('collapsed'),
        name: core.getInput('file_name').toLowerCase(),
        heading: core.getInput('release_heading'),
        summary: core.getBooleanInput('summary'),
    }
}
