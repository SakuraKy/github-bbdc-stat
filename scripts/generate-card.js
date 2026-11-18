const { writeFile } = require('node:fs/promises')
const { get } = require('axios')
const baseURL = require('../baseURL')
const summarizeStats = require('../utils/summarizeStats')
const { renderCard } = require('../utils/renderCard')

async function main() {
    const userId = (process.env.BBDC_USER_ID || '').trim()
    const nickname = (process.env.BBDC_NICKNAME || '').trim()
    const output = process.env.BBDC_OUTPUT || 'bbdc-card.svg'

    if (!/^\d+$/.test(userId)) {
        throw new Error('BBDC_USER_ID must contain digits only')
    }
    if (nickname === '') {
        throw new Error('BBDC_NICKNAME must not be empty')
    }

    const { data } = await get('profile/search', {
        baseURL,
        params: { userId },
        timeout: 10000
    })
    const stats = summarizeStats(data)
    if (data.result_code !== 200 || stats === null) {
        throw new Error('The BBdc API returned invalid data')
    }

    const svg = renderCard({
        data: stats,
        theme: 'dark',
        nickname: nickname.slice(0, 64),
        hideBorder: false
    })
    await writeFile(output, svg, 'utf8')
    console.log(`Generated ${output} for ${nickname} (${stats.totalLearn} learned, ${stats.totalReview} reviewed)`)
}

main().catch(err => {
    console.error(err.message)
    process.exitCode = 1
})
