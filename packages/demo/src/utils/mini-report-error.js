import { getStorageSync } from './utils';
import { constant } from './constant';

function getCurrentPageUrl() {
    const pages = getCurrentPages(); //获取加载的页面

    const currentPage = pages[pages.length - 1]; //获取当前页面的对象
    console.log(currentPage.options);
    const url = currentPage.route; //当前页面url
    const options = currentPage.options;
    return { url, options };
}

const platform = '推米小程序';
const isProduction = process.env.NODE_ENV === 'production';
let lastErrorText = '';

/**
 * 提交error日志
 * @param {string} url https://fanep.cn/api/error-log
 * @param {object} obj - 错误内容
 * @param {string} obj.text - 错误内容
 * @param {string} [obj.platform] - 错误发生的平台
 * @param {number} [obj.sendMail=0] - 是否发送邮件  默认开发环境不发送
 * @param {number} [obj.type=0] 错误程度 0警告 1错误 2严重错误
 * @param {Object} [obj.other] 其他上报信息  任意{key:value}
 * @returns {void}
 */
export const postErrorLog = (obj) => {
    //const ua = window.navigator.userAgent;

    if (obj.text === lastErrorText) {
        return;
    }

    if (!isProduction && Math.random() > 0.5) {
        // 开发环境对半上传
        return;
    }

    const { url, options } = getCurrentPageUrl();

    if (!obj.other) {
        obj.other = {};
    }

    Object.assign(obj.other, {
        pageUrl: url,
        pageOptions: options,
        uid: getStorageSync(constant.uid),
    });
    const data = Object.assign(
        {
            platform: platform,
            sendMail: 0,
            type: 0,
            production: Number(isProduction),
        },
        obj
    );

    try {
        wx.request({
            method: 'POST',
            url: 'https://fanep.cn/api/error-log',
            data: data,
        });
        lastErrorText = obj.text;
    } catch (error) {
        lastErrorText = '';
        console.warn('错误日志提交失败', error);
    }

    // window.onerror = function (e) {
    //     postFn({ ua, text: e, host });
    // };
};
