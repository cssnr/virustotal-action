const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')

/**
 * https://docs.virustotal.com/reference/files-scan
 * @function vtUpload
 * @param {string} filePath
 * @param {string} apiKey
 * @return {Promise<*|object>}
 */
async function vtUpload(filePath, apiKey) {
    console.log('vtUpload:', filePath)
    const form = new FormData()
    form.append('file', fs.createReadStream(filePath))
    const url = await vtGetURL(filePath, apiKey)
    console.log('url:', url)
    const response = await axios.post(url, form, {
        headers: { 'x-apikey': apiKey, ...form.getHeaders() },
    })
    // console.log('response.data:', response.data)
    return response.data
}

/**
 * https://docs.virustotal.com/reference/files-upload-url
 * @function vtGetURL
 * @param {string} filePath
 * @param {string} apiKey
 * @return {Promise<*|string>}
 */
async function vtGetURL(filePath, apiKey) {
    // This does not consume per-minute api quota, consider using axios
    const stats = fs.statSync(filePath)
    console.log('stats.size:', stats.size)
    if (stats.size < 32000000) {
        return 'https://www.virustotal.com/api/v3/files'
    }

    const response = await axios.get(
        'https://www.virustotal.com/api/v3/files/upload_url',
        {
            headers: { accept: 'application/json', 'x-apikey': apiKey },
        }
    )
    // console.log('response.data:', response.data)
    return response.data.data
}

module.exports = vtUpload
