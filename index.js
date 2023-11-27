function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const W = 400
const H = 250
const BLOCK_SIZE = 80;
const CONTAINER = document.querySelector('#captcha')
const BG_CANVAS = document.createElement('canvas')
const BLOCK_CANVAS = document.createElement('canvas')
const BAR = document.createElement('div')
const BAR_BLOCK = document.createElement('div')
const BG_CTX = BG_CANVAS.getContext('2d', { willReadFrequently: true })
const BLOCK_CTX = BLOCK_CANVAS.getContext('2d')
let IMG = null
const PADDING = 10
let BLOCK_X = 0
let BLOCK_Y = 0
const GAP = 10
const BAR_H = 50
const BAR_BLOCK_W = 80
let BAR_BLOCK_X = 0
let CLICK_X = 0
let DRAG_ABLE = false

function loadImg() {
    return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = ''
        img.src = `https://picsum.photos/${W}/${H}?time=${Date.now()}`;
        img.onload = () => {
            resolve(img)
        }
        img.onerror = () => {
            resolve(null)
        }
    })
}

function dragStart(e) {
    DRAG_ABLE = true
    BAR_BLOCK_X = BAR_BLOCK.offsetLeft
    CLICK_X = e.clientX
}

function drag(e) {
    if (!DRAG_ABLE) return
    function _calcLeft() {
        const relativeLeft = e.clientX - CLICK_X
        if (BAR_BLOCK_X + relativeLeft + BAR_BLOCK_W > W) return W - BAR_BLOCK_W
        if (BAR_BLOCK_X + relativeLeft < 0) return 0
        return BAR_BLOCK_X + relativeLeft
    }
    const left = _calcLeft()
    BAR_BLOCK.style.left = `${left}px`
    BLOCK_CANVAS.style.left = `${left}px`
}

function dragEnd() {
    DRAG_ABLE = false
    const min = BLOCK_X - GAP
    const max = BLOCK_X + GAP
    const left = BLOCK_CANVAS.offsetLeft
    if (min <= left && left <= max) {
        BAR_BLOCK.style.backgroundColor = 'red'
        BAR_BLOCK.innerText = 'success'
    } else {
        BAR_BLOCK.innerText = 'error'
        render()
    }
}

async function render() {
    const img = await loadImg()
    if (!img) {
        throw new Error('图片加载失败')
    }
    BG_CTX.clearRect(0, 0, W, H)
    BLOCK_CTX.clearRect(0, 0, BLOCK_SIZE, H)
    BAR_BLOCK.style.left = '0'
    BLOCK_CANVAS.style.left = '0'
    BAR_BLOCK.innerText = 'drag'
    BG_CTX.drawImage(img, 0, 0, W, H)
    BLOCK_X = getRandom(BLOCK_SIZE + PADDING, W - BLOCK_SIZE - PADDING)
    BLOCK_Y = getRandom(PADDING, H - BLOCK_SIZE - PADDING)
    const imgData = BG_CTX.getImageData(BLOCK_X, BLOCK_Y, BLOCK_SIZE, BLOCK_SIZE)
    BLOCK_CTX.putImageData(imgData, 0, BLOCK_Y)
    BG_CTX.beginPath()
    BG_CTX.moveTo(BLOCK_X, BLOCK_Y)
    BG_CTX.lineTo(BLOCK_X + BLOCK_SIZE, BLOCK_Y)
    BG_CTX.lineTo(BLOCK_X + BLOCK_SIZE, BLOCK_Y + BLOCK_SIZE)
    BG_CTX.lineTo(BLOCK_X, BLOCK_Y + BLOCK_SIZE)
    BG_CTX.closePath()
    BG_CTX.fillStyle = 'white'
    BG_CTX.fill()
}

function init() {
    CONTAINER.style.cssText = `
        position: relative;
        left:0;
        top:0;
        width:${W}px;
        height:${H + BAR_H + 20}px;
    `
    BG_CANVAS.width = W
    BG_CANVAS.height = H
    BG_CANVAS.style.cssText = `
        box-shadow: #0000004f 0px 0px 10px;
        position: absolute;
        left:0;
        top:0;
    `
    BLOCK_CANVAS.width = BLOCK_SIZE
    BLOCK_CANVAS.height = H
    BLOCK_CANVAS.style.cssText = `
        position: absolute;
        left:0;
        top:0;
    `
    BAR.style.cssText = `
        position: absolute;
        bottom:0;
        left:0;
        width: ${W}px;
        height: ${BAR_H}px;
        background-color: white;
        box-shadow: #0000004f 0px 0px 10px;
    `
    BAR_BLOCK.style.cssText = `
        position: absolute;
        bottom:0;
        left:0;
        width: ${BAR_BLOCK_W}px;
        height: ${BAR_H}px;
        background-color: blue;
        text-align:center;
        line-height: ${BAR_H}px;
        color:white;
    `
    BAR.appendChild(BAR_BLOCK)
    BAR_BLOCK.addEventListener('mousedown', dragStart)
    window.addEventListener('mousemove', drag)
    BAR.addEventListener('mouseup', dragEnd)
    CONTAINER.appendChild(BG_CANVAS)
    CONTAINER.appendChild(BLOCK_CANVAS)
    CONTAINER.appendChild(BAR)
    render()
}

init()