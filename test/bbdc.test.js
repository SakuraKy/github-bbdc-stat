const test = require('node:test')
const assert = require('node:assert/strict')
const summarizeStats = require('../utils/summarizeStats')
const { renderCard, renderErrorCard, normalizeColor } = require('../utils/renderCard')

test('summarizeStats adds learn, review and duration values', () => {
    const payload = {
        data_body: {
            learnList: [
                { learnNum: 10, reviewNum: 20 },
                { learnNum: 5, reviewNum: 7 }
            ],
            durationList: [
                { duration: 100 },
                { duration: 25 }
            ]
        }
    }

    assert.deepEqual(summarizeStats(payload), {
        totalDuration: 125,
        totalLearn: 15,
        totalReview: 27
    })
})

test('summarizeStats rejects malformed upstream data', () => {
    assert.equal(summarizeStats({}), null)
    assert.equal(summarizeStats({
        data_body: {
            learnList: [{ learnNum: 1, reviewNum: 1 }],
            durationList: []
        }
    }), null)
    assert.equal(summarizeStats({
        data_body: {
            learnList: [{ learnNum: 'bad', reviewNum: 1 }],
            durationList: [{ duration: 10 }]
        }
    }), null)
})

test('renderCard renders stats and escapes nickname markup', () => {
    const svg = renderCard({
        data: { totalLearn: 15, totalReview: 27, totalDuration: 125 },
        theme: 'dark',
        nickname: `<script>&"'`,
        hideBorder: false
    })

    assert.match(svg, /15 words/)
    assert.match(svg, /27 words/)
    assert.match(svg, /125 mins/)
    assert.match(svg, /&lt;script&gt;&amp;&quot;&apos;/)
    assert.doesNotMatch(svg, /<script>/)
    assert.match(svg, /role="img"/)
})

test('renderCard applies theme, colors and border options', () => {
    const svg = renderCard({
        data: { totalLearn: 0, totalReview: 0, totalDuration: 0 },
        theme: 'light',
        nickname: 'SakuraKy',
        hideBorder: true,
        titleColor: 'abc',
        textColor: 'yellow'
    })

    assert.match(svg, /fill="#FFF"/)
    assert.match(svg, /fill="#abc"/)
    assert.match(svg, /fill="yellow"/)
    assert.match(svg, /stroke="0"/)
})

test('invalid colors and themes fall back to safe defaults', () => {
    assert.equal(normalizeColor('" onload="alert(1)', '#123456'), '#123456')

    const svg = renderCard({
        data: { totalLearn: 0, totalReview: 0, totalDuration: 0 },
        theme: 'unknown',
        nickname: 'SakuraKy',
        hideBorder: false,
        titleColor: 'red;fill:url(#bad)',
        textColor: '#12'
    })

    assert.match(svg, /fill="#FFA726"/)
    assert.match(svg, /fill="#2196F3"/)
    assert.doesNotMatch(svg, /onload=/)
})

test('renderErrorCard returns renderable SVG instead of HTML', () => {
    const svg = renderErrorCard('缺少必填参数 userId')

    assert.match(svg, /^<\?xml/)
    assert.match(svg, /<svg/)
    assert.match(svg, /缺少必填参数 userId/)
    assert.doesNotMatch(svg, /<html>/)
})
