const cloneDeep = require('lodash.clonedeep')
const COLORS = require('../theme')
const isHexColor = require('./isHexColor')

function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

function normalizeTheme(theme) {
    return typeof theme === 'string' && Object.prototype.hasOwnProperty.call(COLORS, theme)
        ? theme
        : 'default'
}

function normalizeColor(value, fallback) {
    if (typeof value !== 'string') {
        return fallback
    }

    const color = value.trim()
    if (isHexColor(color)) {
        return `#${color.replace(/^#/, '')}`
    }
    if (/^[a-z]+$/i.test(color)) {
        return color
    }
    return fallback
}

function renderCard({ data, theme, nickname, hideBorder, titleColor, textColor }) {
    const selectedTheme = normalizeTheme(theme)
    const renderColor = cloneDeep(COLORS[selectedTheme])
    renderColor.BORDER = hideBorder ? 0 : renderColor.BORDER
    renderColor.TITLE = normalizeColor(titleColor, renderColor.TITLE)
    renderColor.TEXT = normalizeColor(textColor, renderColor.TEXT)

    const title = escapeXml(`${nickname}'s  bbdc  Stats`)
    const totalLearn = escapeXml(data.totalLearn)
    const totalReview = escapeXml(data.totalReview)
    const totalDuration = escapeXml(data.totalDuration)

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg
version="1.1"
baseProfile="full"
width="382" height="190"
xmlns="http://www.w3.org/2000/svg"
viewBox="0 0 382 190"
role="img"
aria-labelledby="card-title"
>
<title id="card-title">${title}</title>
<defs>
    <filter id="Card" x="0" y="0" width="382" height="190" filterUnits="userSpaceOnUse">
    <feOffset dy="3" input="SourceAlpha"/>
    <feGaussianBlur stdDeviation="3" result="blur"/>
    <feFlood flood-opacity="0.161"/>
    <feComposite operator="in" in2="blur"/>
    <feComposite in="SourceGraphic"/>
    </filter>
</defs>
<g transform="matrix(1, 0, 0, 1, 0, 0)" filter="url(#Card)" stroke="${escapeXml(renderColor.BORDER)}">
<rect width="364" height="172" fill="${escapeXml(renderColor.BACKGROUND)}" rx="10" ry="10"/>
</g>
 <text x="97" y="44" fill="${escapeXml(renderColor.TITLE)}" font-size="19" font-weight="600" font-family="SegoeUI, Segoe UI">${title}</text>
 <text x="10" y="90" fill="${escapeXml(renderColor.TEXT)}" font-size="15" font-weight="600" font-family="SegoeUI, Segoe UI">Learn num</text>
 <text x="19" y="130" fill="${escapeXml(renderColor.TEXT)}" font-size="13" font-weight="600" font-family="SegoeUI, Segoe UI">${totalLearn} words</text>
 <text x="120" y="90" fill="${escapeXml(renderColor.TEXT)}" font-size="15" font-weight="600" font-family="SegoeUI, Segoe UI">Review num</text>
 <text x="135" y="130" fill="${escapeXml(renderColor.TEXT)}" font-size="13" font-weight="600" font-family="SegoeUI, Segoe UI">${totalReview} words</text>
 <text x="235" y="90" fill="${escapeXml(renderColor.TEXT)}" font-size="15" font-weight="600" font-family="SegoeUI, Segoe UI">Duration time</text>
 <text x="260" y="130" fill="${escapeXml(renderColor.TEXT)}" font-size="13" font-weight="600" font-family="SegoeUI, Segoe UI">${totalDuration} mins</text>
</svg>
`
}

function renderErrorCard(message) {
    const safeMessage = escapeXml(message || '学习数据暂时不可用，请稍后重试')
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg
version="1.1"
baseProfile="full"
width="382" height="190"
xmlns="http://www.w3.org/2000/svg"
viewBox="0 0 382 190"
role="img"
aria-labelledby="error-title"
>
<title id="error-title">BBdc Stats unavailable</title>
<rect width="364" height="172" x="1" y="1" fill="#151515" stroke="#E4E2E2" rx="10" ry="10"/>
<text x="22" y="52" fill="#FFA726" font-size="19" font-weight="600" font-family="SegoeUI, Segoe UI">BBdc Stats</text>
<text x="22" y="92" fill="#2196F3" font-size="14" font-weight="600" font-family="SegoeUI, Segoe UI">${safeMessage}</text>
<text x="22" y="124" fill="#BDBDBD" font-size="12" font-family="SegoeUI, Segoe UI">请检查配置或稍后刷新页面</text>
</svg>
`
}

module.exports = { renderCard, renderErrorCard, escapeXml, normalizeColor }
