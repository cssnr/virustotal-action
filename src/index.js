const core = require('@actions/core')
const github = require('@actions/github')
const glob = require('@actions/glob')

const VTClient = require('./vt.js')

;(async () => {
    try {
        core.info('🏳️ Starting VirusTotal Action')

        // Get Inputs
        core.startGroup('Inputs')
        const inputs = getInputs()
        console.log(inputs)

        // Set Variables
        const octokit = github.getOctokit(inputs.token)
        const release = await getRelease(octokit, inputs.release_id)
        const client = new VTClient(inputs.key, inputs.rate)

        core.endGroup() // Inputs

        // Process
        /** @type {Object[]} */
        let results
        if (inputs.files?.length) {
            // core.info('📁 Processing File Globs')
            const globber = await glob.create(inputs.files.join('\n'), {
                matchDirectories: false,
            })
            results = await client.processFiles(await globber.glob())
        } else if (release) {
            // core.info('🗄️ Processing Release Assets')
            results = await client.processRelease(octokit, release.id)
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

            let existing_results = ''
            if (inputs.heading) {
                const heading_index = body.indexOf(inputs.heading)
                if (heading_index > -1) {
                    existing_results = body.slice(heading_index).trim()
                    body = body.slice(0, heading_index).trim()
                }
            }

            let existing_results_list = []
            if (existing_results) {
                const matches = [...existing_results.matchAll(/- \[(.*?)\]\((.*?)\)/g)]
                existing_results_list = matches.map((match) => ({
                    name: match[1],
                    link: match[2],
                }))
            }

            for (const result of results) {
                let name = result.name
                if (inputs.name === 'id') {
                    name = result.id
                }
                console.log(`name: ${name}`)
                if (inputs.name) {
                    // remove existing entry and append new one
                    existing_results_list = existing_results_list.filter(
                        (r) => r.name !== name
                    )
                    existing_results_list.push({
                        name,
                        link: result.link,
                    })
                }
            }

            body += `\n`
            if (inputs.heading) {
                body += `\n${inputs.heading}\n`
            }
            if (inputs.collapsed) {
                body += `\n<details><summary>Click Here to Show Scan Results</summary>\n`
            }
            // const collapsed = inputs.collapsed ? '' : ' open'
            // body += `\n\n<details${collapsed}><summary>${inputs.heading}</summary>\n\n`
            for (const result of existing_results_list) {
                body += `\n- [${result.name}](${result.link})`
            }
            if (inputs.collapsed) {
                body += '\n\n</details>'
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
        console.log(e)
        if (e.response) {
            console.log(`\u001b[31m Error: ${e.response.statusText}`)
            console.log(e.response.data)
        }
        core.setFailed(e.message)
    }
})()

/**
 * Get Release
 * @param {InstanceType<typeof github.GitHub>} octokit
 * @param {String} release_id
 * @return {Promise<InstanceType<typeof github.GitHub>|Undefined>}
 */
async function getRelease(octokit, release_id) {
    const target_release_id = release_id || github.context.payload.release?.id
    if (!target_release_id) return

    core.info(`Getting Release: \u001b[32m${target_release_id}`)

    try {
        const release = await octokit.rest.repos.getRelease({
            ...github.context.repo,
            release_id: target_release_id,
        })
        return release.data
    } catch (error) {
        if (error.status !== 404) throw error
    }

    try {
        // try getting by tag name
        const release = await octokit.rest.repos.getReleaseByTag({
            ...github.context.repo,
            tag: target_release_id,
        })
        return release.data
    } catch (error) {
        if (error.status !== 404) throw error
    }
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
 * @property {String} release_id
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
        release_id: core.getInput('release_id'),
        collapsed: core.getBooleanInput('collapsed'),
        name: core.getInput('file_name').toLowerCase(),
        heading: core.getInput('release_heading'),
        summary: core.getBooleanInput('summary'),
    }
}
