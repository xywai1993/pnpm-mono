/**
 * 页面跳转 （不够通用）
 * @exports goTo
 * @param {String} url
 * @param {Object} [data] - query参数
 * @param {Object} params
 * @param {number} [params.type = 1] - 1 navigateTo 跳转页面 2 redirectTo 关闭当前页面跳转 3 reLaunch 关闭所有页面跳转
 * @param {'packageb'} [params.package ='packageb'] - 分包
 *
 * type 1 navigateTo 跳转页面 2 redirectTo 关闭当前页面跳转 3 reLaunch 关闭所有页面跳转，4 navigateBack
 */
export const goTo = (url, data = {}, params = {}) => {
    if (url === -1) {
        wx.navigateBack({
            delta: 1,
        });
        return;
    }

    const pms = Object.assign(
        {
            type: 1,
            data: {},
        },
        params
    );
    console.log(pms);
    let fn = null;
    switch (pms.type) {
        case 1:
            fn = wx.navigateTo;
            break;
        case 2:
            fn = wx.redirectTo;
            break;
        case 3:
            fn = wx.reLaunch;
            break;
        case 4:
            wx.navigateBack({
                delta: 1,
            });
            return;
    }

    let p = [];

    for (let key in data) {
        p.push(`${key}=${data[key]}`);
    }

    if (pms.package) {
        console.log('url:', `/${pms.package}/pages/${url}/main?${p.join('&')}`);
        fn({
            url: `/${pms.package}/pages/${url}/main?${p.join('&')}`,
        });
        return;
    }
    fn({
        url: `/pages/${url}/main?${p.join('&')}`,
    });
};

/**
 *
 * @param {String} url
 * @param {Object} obj
 * @returns {string}
 */
export const setUrlQuery = function (url, obj = {}) {
    let p = [];
    for (let key in obj) {
        const type = [typeof 0, typeof '0'];

        if (type.includes(typeof obj[key])) {
            p.push(`${key}=${obj[key]}`);
        }
    }
    return p.length ? `${url}?${p.join('&')}` : url;
};

/**
 * 拼装二维码的 scene参数
 * @param {Object} obj
 * @return {string}
 */
export const setSceneQuery = function (obj) {
    let p = [];
    for (let key in obj) {
        p.push(`${key}@${obj[key]}`);
    }
    return p.join('#');
};

/**
 * 解析二维码中的 Scene
 * @param {string} _sence1 - 类似 uid@1111#channel@33333
 */
export const parseScene = function (_sence1) {
    //uid@1111#channel@33333
    const sence = decodeURIComponent(_sence1);
    const obj = {};
    console.log('sence', sence);

    if (sence.indexOf('#') !== -1) {
        sence.split('#').forEach((item) => {
            const a = item.split('@');
            obj[a[0]] = a[1];
        });
    } else {
        const a = sence.split('@');
        obj[a[0]] = a[1];
    }
    return obj;
};

/**
 * 获取字符串长度 汉字算两个
 * @param {string} val
 * @returns {number}
 */
export const getByteLen = (val) => {
    let len = 0;
    for (let i = 0; i < val.length; i++) {
        const length = val.charCodeAt(i);
        if (length >= 0 && length <= 128) {
            len += 1;
        } else {
            len += 2;
        }
    }
    return len;
};

/**
 * 截取字符串 并添加...
 * @param {string} str
 * @param {number} num
 * @param {boolean} showEllipsis - 是否显示省略号
 * @returns {*}
 */
export const truncationFont = function (str, num, showEllipsis = true) {
    if (!str) {
        return str;
    }

    let s = '';
    for (let i of str) {
        s += i;
        if (getByteLen(s) >= num) {
            break;
        }
    }
    return showEllipsis ? (str !== s ? s + '...' : str) : s;
};

/**
 * 倒计时
 * @param {Number} times 秒
 * @param {Function} callback
 * @param {Function} endCallBack
 */

export const countDown = (times, callback, endCallBack = () => {}) => {
    var timer = null;

    timer = setInterval(function () {
        var day = 0,
            hour = 0,
            minute = 0,
            second = 0; //时间默认值
        if (times > 0) {
            day = Math.floor(times / (60 * 60 * 24));
            hour = Math.floor(times / (60 * 60)) - day * 24;
            minute = Math.floor(times / 60) - day * 24 * 60 - hour * 60;
            second = Math.floor(times) - day * 24 * 60 * 60 - hour * 60 * 60 - minute * 60;
        }
        const day2hour = day * 24 + hour;
        if (day <= 9) day = '0' + day;
        if (hour <= 9) hour = '0' + hour;
        if (minute <= 9) minute = '0' + minute;
        if (second <= 9) second = '0' + second;

        //console.log(times, hour, minute, second);
        callback({ day, hour, minute, second, day2hour });
        times--;
        if (times <= 0) {
            clearInterval(timer);
            endCallBack();
        }
    }, 1000);
    return timer;
};

/**
 * 格式化日期
 * @param d  日期时间戳或者日期字符串 2021-10-06 ,时间戳为毫秒
 * @param {string} fmt   格式化的格式 默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string}  格式化后的时间
 */
export const formatDate = function (d, fmt = 'YYYY-MM-DD HH:mm:ss') {
    let date = new Date();
    if (typeof d === 'string') {
        date = new Date(d.replace(/-/g, '/'));
    } else if (typeof d === 'number') {
        date = new Date(d);
    } else {
        console.warn('日期参数不合法');
        return '1992-11-25 11:11:11';
    }
    var o = {
        // 'Y+':date.getFullYear(),
        'M+': date.getMonth() + 1,
        'D+': date.getDate(),
        'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12,
        'H+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
    };
    var week = {
        0: '\u65e5',
        1: '\u4e00',
        2: '\u4e8c',
        3: '\u4e09',
        4: '\u56db',
        5: '\u4e94',
        6: '\u516d',
    };
    if (/(Y+)/.test(fmt)) {
        // fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        const re = /(Y+)/;
        const match = fmt.match(re);
        if (match) {
            fmt = fmt.replace(re, String(date.getFullYear()).substr(4 - match[0].length));
        }
    }
    for (var k in o) {
        // if (new RegExp('(' + k + ')').test(fmt)) {
        //     fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? String(o[k]) : ('00' + o[k]).substr(('' + o[k]).length));
        // }
        const re = new RegExp(`${k}`);
        // const match = fmt.match(re);
        fmt = fmt.replace(re, o[k] < 10 ? `0${o[k]}` : o[k]);
    }
    return fmt;
};

/**
 * 获取微信当前路由
 * @returns
 */
export function getCurrentPageUrl() {
    const pages = getCurrentPages(); //获取加载的页面

    const currentPage = pages[pages.length - 1]; //获取当前页面的对象
    console.log(currentPage.options);
    const url = currentPage.route; //当前页面url
    const options = currentPage.options;
    return { url, options };
}
