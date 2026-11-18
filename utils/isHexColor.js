function isHexColor(input) {
    return typeof input === 'string' && /^#?(?:[0-9a-f]{6}|[0-9a-f]{3})$/i.test(input)
}
module.exports = isHexColor
