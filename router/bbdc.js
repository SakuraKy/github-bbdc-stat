const express = require('express');
const { get } = require('axios');
const baseURL = require('../baseURL')
const summarizeStats = require('../utils/summarizeStats')
const { renderCard, renderErrorCard } = require('../utils/renderCard')
const bbdcRouter = express.Router();

function normalizeNickname(nickname) {
    if (typeof nickname !== 'string' || nickname.trim() === '') {
        return 'leftover'
    }
    return nickname.trim().slice(0, 64)
}

function sendSvg(res, svg, { cacheable = false, errorCode } = {}) {
    res.set({
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': cacheable
            ? 'public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400'
            : 'no-store'
    })
    if (errorCode) {
        res.set('X-BBDC-Error', errorCode)
    }
    res.status(200).send(svg)
}

function sendErrorCard(res, errorCode, message) {
    return sendSvg(res, renderErrorCard(message), { errorCode })
}

bbdcRouter.get('/bbdc', async (req, res) => {
    const { userId, theme, nickname, hide_border, title_color, text_color } = req.query

    if (typeof userId !== 'string' || userId.trim() === '') {
        return sendErrorCard(res, 'missing-user-id', '缺少必填参数 userId')
    }

    const normalizedUserId = userId.trim()
    if (!/^\d+$/.test(normalizedUserId)) {
        return sendErrorCard(res, 'invalid-user-id', 'userId 格式不正确')
    }

    try {
        const { data } = await get('profile/search', {
            baseURL,
            params: { userId: normalizedUserId },
            timeout: 10000
        })

        if (data.result_code === 20000) {
            return sendErrorCard(res, 'invalid-user-id', 'userId 不正确')
        }

        const stats = summarizeStats(data)
        if (stats === null || data.result_code !== 200) {
            return sendErrorCard(res, 'invalid-upstream-data', '学习数据暂时不可用')
        }

        const svg = renderCard({
            data: stats,
            theme,
            nickname: normalizeNickname(nickname),
            hideBorder: hide_border === 'true',
            titleColor: title_color,
            textColor: text_color
        })
        return sendSvg(res, svg, { cacheable: true })
    } catch (err) {
        console.error(`Failed to load bbdc stats for userId ${normalizedUserId}:`, err.message)
        return sendErrorCard(res, 'upstream-error', '学习数据加载失败，请稍后重试')
    }
})

module.exports = bbdcRouter
