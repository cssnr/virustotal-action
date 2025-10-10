const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const { createReadStream } = require('node:fs')

const core = require('@actions/core')
const github = require('@actions/github')
const axios = require('axios')
const FormData = require('form-data')
const { RateLimiter } = require('limiter')

class VTClient {
    /**
     * @param {Inputs} inputs
     */
    #apiKey
    #sha256 = false
    #limiter = null
    constructor(inputs) {
        console.log('constructor: inputs:', inputs)
        console.log('inputs.key:', inputs.key)
        this.#apiKey = inputs.key
        this.#sha256 = inputs.sha256
        if (inputs.rate) {
            this.#limiter = new RateLimiter({
                tokensPerInterval: inputs.rate,
                interval: 'minute',
            })
        }
    }

    /**
     * Get the correct upload URL for the file size
     * @param {String} filePath
     * @return {Promise<String>}
     */
    async #getUploadURL(filePath) {
        const stats = fs.statSync(filePath)
        console.log('stats.size:', stats.size)
        if (stats.size < 32000000) return 'https://www.virustotal.com/api/v3/files'
        const response = await axios.get(
            'https://www.virustotal.com/api/v3/files/upload_url',
            {
                headers: { accept: 'application/json', 'x-apikey': this.#apiKey },
            }
        )
        return response.data.data
    }

    /**
     * Upload a file to VirusTotal
     * @param {String} filePath
     * @return {Promise<Object>}
     */
    async #upload(filePath) {
        console.log('vtUpload:', filePath)
        const form = new FormData()
        form.append('file', fs.createReadStream(filePath))
        const url = await this.#getUploadURL(filePath)
        console.log('url:', url)
        const response = await axios.post(url, form, {
            headers: { 'x-apikey': this.#apiKey, ...form.getHeaders() },
        })
        return response.data
    }

    /**
     * Process a file
     * @param {String} name
     * @param {String} filePath
     * @return {Promise<{name, link: string, id}>}
     */
    async #process(name, filePath) {
        if (this.#limiter) {
            const remainingRequests = await this.#limiter.removeTokens(1)
            console.log('remainingRequests:', remainingRequests)
        }
        const response = await this.#upload(filePath)
        console.log('response.data.id:', response.data.id)
        const link = `https://www.virustotal.com/gui/file-analysis/${response.data.id}`
        console.log('link:', link)
        const data = { id: response.data.id, name, link }
        if (this.#sha256) {
            const sha256 = await this.#getFileHash(filePath)
            console.log('sha256:', sha256)
            data['sha256'] = sha256
        }
        return data
    }

    async #getFileHash(path) {
        return new Promise((resolve, reject) => {
            const hash = createHash('sha256')
            const stream = createReadStream(path)
            stream.on('error', reject)
            stream.on('data', (chunk) => hash.update(chunk))
            stream.on('end', () => resolve(hash.digest('hex')))
        })
    }

    /**
     * Process Files
     * @param {String[]} files
     * @return {Promise<Object[{id, name, link}]>}
     */
    async processFiles(files) {
        if (!files.length) {
            throw new Error('No files to process.')
        }
        core.startGroup('Processing Files')
        console.log(files)
        core.endGroup() // Files
        const results = []
        for (const file of files) {
            const name = path.basename(file)
            core.startGroup(`Processing: \u001b[36m${name}`)
            results.push(await this.#process(name, file))
            core.endGroup() // Processing
        }
        return results
    }

    /**
     * Process Release Assets
     * @param {InstanceType<typeof github.GitHub>} octokit
     * @param {String} release_id
     * @return {Promise<Object[{id, name, link}]>}
     */
    async processRelease(octokit, release_id) {
        core.startGroup('Processing Release Assets')

        // Get Assets
        let page = 0
        const allAssets = []
        const { data } = await octokit.rest.rateLimit.get()
        const ghLimiter = new RateLimiter({
            tokensPerInterval: data.resources.core.limit,
            interval: 'hour',
        })
        while (true) {
            await ghLimiter.removeTokens(1)
            const assets = await octokit.rest.repos.listReleaseAssets({
                ...github.context.repo,
                release_id: release_id,
                per_page: 100,
                page: ++page,
            })
            if (!assets.data.length) break
            allAssets.push(...assets.data)
        }
        if (!allAssets.length) {
            throw new Error(`No Assets Found for Release: ${release_id}`)
        }

        // Create Temp
        console.log('RUNNER_TEMP:', process.env.RUNNER_TEMP)
        const assetsPath = path.join(process.env.RUNNER_TEMP, 'assets')
        console.log('assetsPath:', assetsPath)
        if (!fs.existsSync(assetsPath)) fs.mkdirSync(assetsPath)

        // Process Assets
        const files = []
        for (const asset of allAssets) {
            const filePath = path.join(assetsPath, asset.name)
            const file = await octokit.rest.repos.getReleaseAsset({
                ...github.context.repo,
                asset_id: asset.id,
                headers: { Accept: 'application/octet-stream' },
            })
            fs.writeFileSync(filePath, Buffer.from(file.data))
            files.push(filePath)
        }

        core.endGroup() // Assets

        return await this.processFiles(files)
    }
}

module.exports = VTClient
