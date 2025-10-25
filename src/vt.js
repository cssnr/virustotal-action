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
    fail
    retries
    cooldown
    multiplier
    constructor(inputs) {
        this.#apiKey = inputs.key
        this.#sha256 = inputs.sha256
        this.fail = inputs.fail
        this.retries = inputs.retries
        this.cooldown = inputs.cooldown / inputs.multiplier
        this.multiplier = inputs.multiplier
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
     * @return {Promise<{Object}>}
     */
    async #process(name, filePath) {
        if (this.#limiter) {
            const remainingRequests = await this.#limiter.removeTokens(1)
            console.log('remainingRequests:', remainingRequests)
        }
        // const error = new Error('Its Broken')
        // error.status = 409
        // throw error
        // return { name: '', link: '', id: 1 }
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
        let failed = 0

        while (files.length > 0) {
            const file = files.shift()
            const name = path.basename(file)
            core.startGroup(`Processing: \u001b[36m${name}`)
            try {
                const result = await this.#process(name, file)
                results.push(result)
                core.endGroup() // Processing
            } catch (e) {
                // NOTE: Need to use a limiter with ability to add tokens...

                core.startGroup(`Error: ${e.status}`)
                // console.log('e:', e)
                console.log('e.message:', e.message)
                console.log('e.status:', e.status) // number?
                console.log('e.code:', e.code) // string?
                console.log('e.response?.status:', e.response?.status)
                console.log('e.response?.statusText:', e.response?.statusText)
                console.log('e.response?.headers:', e.response?.headers)
                console.log('e.response?.data:', e.response?.data)
                core.endGroup() // Error

                if (e.status === 409 && this.retries > 0) {
                    this.retries--
                    files.unshift(file) // NOTE: Consider adding to back of stack...
                    console.log('this.retries:', this.retries)
                    this.cooldown = this.cooldown * this.multiplier
                    console.log('this.cooldown:', this.cooldown)
                    await new Promise((r) => setTimeout(r, this.cooldown * 1000))
                    continue
                }

                failed++
                if (this.fail === 'any') {
                    console.log(`\u001b[35m Throw on FAIL: [any], all, none`)
                    throw new Error(e)
                }
            }
            if (this.fail === 'all' && !results.length) {
                console.log(`\u001b[35m Throw on FAIL: any, [all], none`)
                throw new Error('All files failed and fail mode set to all.')
            }
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
