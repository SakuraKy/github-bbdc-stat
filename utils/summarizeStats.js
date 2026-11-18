function toFiniteNumber(value) {
    const number = Number(value)
    return Number.isFinite(number) ? number : null
}

function summarizeStats(payload) {
    const dataBody = payload && payload.data_body
    if (!dataBody || !Array.isArray(dataBody.learnList) || !Array.isArray(dataBody.durationList)) {
        return null
    }
    if (dataBody.learnList.length === 0 || dataBody.learnList.length !== dataBody.durationList.length) {
        return null
    }

    let totalDuration = 0
    let totalLearn = 0
    let totalReview = 0

    for (let i = 0; i < dataBody.learnList.length; i++) {
        const learn = dataBody.learnList[i]
        const duration = toFiniteNumber(dataBody.durationList[i].duration)
        const learnNum = toFiniteNumber(learn.learnNum)
        const reviewNum = toFiniteNumber(learn.reviewNum)

        if (duration === null || learnNum === null || reviewNum === null) {
            return null
        }

        totalDuration += duration
        totalLearn += learnNum
        totalReview += reviewNum
    }

    return { totalDuration, totalLearn, totalReview }
}

module.exports = summarizeStats
