/**
 * @author yiper.fan update 2022年02月10日17:20:21
 */

export const getImageInfo = (url, canvas) => {
    return new Promise((resolve, reject) => {
        // const img = new Image();
        const img = canvas.createImage();
        img.onload = () => {
            const width = img.width;
            const height = img.height;

            resolve({ width, height, path: img });
        };

        img.src = url;
        img.onerror = function (e) {
            //  showToast(`获取图片失败`);
            console.warn(`获取图片失败:${url}`);
            reject(e);
        };
    });
};

/**
 * 字符超过指定宽度自动换行
 * @param {string} str - 要绘制的字符串
 * @param {string} ctx - canvas对象
 * @param {number} initX - x坐标
 * @param {number} initY - y坐标
 * @param {number} width - 最大宽度
 * @param {number} lineHeight - 行高
 */
function canvasTextAutoLine(str, ctx, initX, initY, width = 100, lineHeight = 25) {
    var lineWidth = 0;

    var lastSubStrIndex = 0;
    for (let i = 0; i < str.length; i++) {
        lineWidth += ctx.measureText(str[i]).width;
        if (lineWidth > width) {
            ctx.fillText(str.substring(lastSubStrIndex, i), initX, initY);
            initY += lineHeight;
            lineWidth = 0;
            lastSubStrIndex = i;
        }
        if (i == str.length - 1) {
            ctx.fillText(str.substring(lastSubStrIndex, i + 1), initX, initY);
        }
    }
}

/**
 * 图片等比压缩绘制 类似 accostFill
 * @param ctx - canvas 上下文
 * @param {string} img - 图片地址
 * @param {number} x - canvas x坐标
 * @param {number} y - canvas y坐标
 * @param {number} w - 绘制宽度
 * @param {number} h - 绘制高度
 * @param {number} imgW - 原图width
 * @param {number} imgH - 原图高度
 * @param {number} [offsetX = 0.5] 图像偏移 默认中心
 * @param {number}  [offsetY = 0.5] 图像偏移 默认中心
 */
function drawImageProp(ctx, img, x, y, w, h, imgW, imgH, offsetX = 0.5, offsetY = 0.5) {
    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    // offsetX = typeof offsetX === 'number' ? offsetX : 0.5;
    // offsetY = typeof offsetY === 'number' ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    let iw = imgW,
        ih = imgH,
        r = Math.min(w / iw, h / ih),
        nw = iw * r, // new prop. width
        nh = ih * r, // new prop. height
        cx,
        cy,
        cw,
        ch,
        ar = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) {
        ar = h / nh;
    } // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

// 不同圆角绘制
export function drawRoundRect(ctx, x, y, w, h, radius) {
    let r = typeof radius == 'number' ? [radius, radius, radius, radius] : radius;
    // var min_size = Math.min(w, h);
    // if (r > min_size / 2) r = min_size / 2;
    // 开始绘制
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + r[0], y);
    if (r[0]) {
        ctx.arcTo(x + w, y, x + w, y + h, r[0]);
    } else {
        ctx.lineTo(x + w, y);
        // ctx.lineTo(x + w, y + h);
    }

    if (r[1]) {
        ctx.arcTo(x + w, y + h, x, y + h, r[1]);
    } else {
        ctx.lineTo(x + w, y + h);
    }

    if (r[2]) {
        ctx.arcTo(x, y + h, x, y, r[2]);
    } else {
        ctx.lineTo(x, y + h);
    }

    if (r[3]) {
        ctx.arcTo(x, y, x + w, y, r[3]);
    } else {
        ctx.lineTo(x, y);
    }

    // ctx.arcTo(x + w, y + h, x, y + h, r);
    // ctx.arcTo(x, y + h, x, y, r);
    // ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.restore();
}

const otherObj = {
    width: 375,
    height: 667,
    bgColor: '#ffffff',
    canvasId: 'previewCanvas',
    componentContext: null,
};

export const getCanvas = (id, context) => {
    return new Promise((resolve) => {
        const query = context ? context.createSelectorQuery() : wx.createSelectorQuery();
        query
            .select('#' + id)
            .fields({ node: true, size: true })
            .exec((res) => {
                const canvas = res[0].node;

                resolve(canvas);
            });
    });
};
/**
 *
 * @param {Array} data - 绘图数据
 * @param {object} otherData - 画布数据
 * @param {Function} callback
 * @return {<void>}
 */

const drawImage = async (data, otherData) => {
    const other = Object.assign(otherObj, otherData);

    // const ctx = wx.createCanvasContext(other.canvasId);
    const canvas = await getCanvas(other.canvasId, other.componentContext);
    const ctx = canvas.getContext('2d');
    // 确保dpr 为整数，小数将变形
    const dpr = Math.ceil(wx.getSystemInfoSync().pixelRatio);

    canvas.width = other.width * dpr;
    canvas.height = other.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = other.bgColor;

    //默认字体
    ctx.font = 'bold 12px serif';
    ctx.textBaseline = 'top';

    ctx.fillRect(0, 0, other.width, other.height);
    const imgDataPromise = data
        .filter((item) => ['img', 'qr', 'imgFill', 'roundRectImg'].indexOf(item.type) !== -1)
        .map((item) => getImageInfo(item.url, canvas));

    const imgData = await Promise.all(imgDataPromise);

    let imgIndex = 0;
    let r;
    let pos;
    for (let i = 0; i < data.length; i++) {
        pos = data[i].position;
        if (pos && Array.isArray(pos)) {
            pos = { x: pos[0], y: pos[1], w: pos[2], h: pos[3] };
        }
        switch (data[i].type) {
            case 'img':
                //var src = data[i].url;

                if (data[i].mode === 'width') {
                    const h = (imgData[imgIndex].height * pos.w) / imgData[imgIndex].width;

                    ctx.drawImage(imgData[imgIndex].path, pos.x, pos.y, pos.w, parseInt(h));
                } else if (data[i].mode === 'height') {
                    const w = (imgData[imgIndex].width * pos.h) / imgData[imgIndex].height;
                    ctx.drawImage(imgData[imgIndex].path, pos.x, pos.y, parseInt(w), pos.h);
                } else {
                    ctx.drawImage(imgData[imgIndex].path, pos.x, pos.y, pos.w, pos.h);
                }

                imgIndex++;
                break;
            case 'imgFill':
                // pos = data[i].position;
                drawImageProp(ctx, imgData[imgIndex].path, pos.x, pos.y, pos.w, pos.h, imgData[imgIndex].width, imgData[imgIndex].height);
                imgIndex++;
                break;
            case 'qr':
                r = pos.w / 2;
                ctx.save();
                ctx.beginPath();
                ctx.arc(pos.x + r, pos.y + r, r, 0, 2 * Math.PI);
                ctx.clip();
                ctx.drawImage(imgData[imgIndex].path, pos.x, pos.y, r * 2, r * 2);
                ctx.restore();
                imgIndex++;
                break;
            case 'text':
                ctx.save();

                if (data[i].font) {
                    ctx.font = data[i].font;
                } else {
                    ctx.font = `${data[i].fontBold || '400'} ${data[i].fontSize || '12px'} ${data[i].fontFamily || 'serif'} `;
                    console.log(`${data[i].fontSize || '12px'} ${data[i].fontFamily || 'serif'} ${data[i].fontBold || '400'}`);
                }

                ctx.fillStyle = data[i].fillColor || '#000';
                ctx.textAlign = data[i].align || 'left';
                canvasTextAutoLine(String(data[i].content), ctx, pos.x, pos.y, data[i].maxWidth, data[i].lineHeight);

                ctx.restore();
                break;
            case 'roundRect':
                ctx.fillStyle = data[i].fillColor || '#fff';
                drawRoundRect(ctx, pos.x, pos.y, pos.w, pos.h, data[i].radius);
                ctx.fill();
                break;

            case 'roundRectImg':
                // ctx.fillStyle = data[i].fillColor || '#fff';
                ctx.save();
                // pattern = ctx.createPattern(imgData[imgIndex].path, 'no-repeat');
                // ctx.fillStyle = pattern;
                drawRoundRect(ctx, pos.x, pos.y, pos.w, pos.h, data[i].radius);
                ctx.clip();
                ctx.drawImage(imgData[imgIndex].path, pos.x, pos.y, pos.w, pos.h);
                // ctx.fill();
                ctx.restore();
                imgIndex++;
                break;
            case 'function':
                data[i].fn(ctx);
                break;

            default:
                break;
        }
    }

    const ddd = await wx.canvasToTempFilePath({
        canvas: canvas,
        destWidth: other.width * dpr,
        destHeight: other.height * dpr,
        x: 0,
        y: 0,
        width: other.width,
        height: other.height,
        fileType: 'jpg',
        quality: 1.0,
    });

    return ddd.tempFilePath;
};

export { drawImage };
