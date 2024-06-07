const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')

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
    // This does not consume per-minute api quota, consider using axios
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
