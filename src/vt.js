const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')

export async function downloadAsset(asset, assetsPath) {
    // console.log('asset:', asset)
    // console.log('assetsDir:', assetsDir)
    const filePath = path.join(assetsPath, asset.name)
    console.log('filePath:', filePath)
    const response = await axios({
        method: 'GET',
        url: asset.browser_download_url,
        responseType: 'stream',
    })
    // console.log('response:', response)
    await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath)
        response.data.pipe(writer)
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
    console.log('wrote:', filePath)
    return filePath
}

export async function vtUpload(filePath, apiKey) {
    console.log('vtUpload:', filePath)
    const form = new FormData()
    form.append('file', fs.createReadStream(filePath))
    const url = await vtGetURL(filePath, apiKey)
    console.log('url:', url)
    const response = await axios.post(url, form, {
        headers: {
            'x-apikey': apiKey,
            ...form.getHeaders(),
        },
    })
    // console.log('response:', response)
    return response.data
}

async function vtGetURL(filePath, apiKey) {
    const stats = fs.statSync(filePath)
    console.log('stats.size:', stats.size)
    if (stats.size < 32000000) {
        return 'https://www.virustotal.com/api/v3/files'
    }
    const options = {
        method: 'GET',
        headers: { accept: 'application/json', 'x-apikey': apiKey },
    }
    const response = await fetch(
        'https://www.virustotal.com/api/v3/files/upload_url',
        options
    )
    // console.log('response:', response)
    const data = await response.json()
    // console.log('data:', data)
    return data.data
}
