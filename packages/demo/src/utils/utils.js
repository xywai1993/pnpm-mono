function formatNumber(n) {
    const str = n.toString();
    return str[1] ? str : `0${str}`;
}

function formatTime(date = new Date(), split = '/') {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    const t1 = [year, month, day].map(formatNumber).join(split);
    const t2 = [hour, minute, second].map(formatNumber).join(':');
    const t3 = [month, day].map(formatNumber).join('-');
    const t4 = [hour, minute].map(formatNumber).join(':');

    return { ymd: t1, hms: t2, custom: `${t3} ${t4}` };
}

/**
 *
 * @param {String} url
 * @param {Object} obj
 * @returns {string}
 */
const setUrlQuery = function (url, obj = {}) {
    let p = [];
    for (let key in obj) {
        p.push(`${key}=${obj[key]}`);
    }
    return `${url}?${p.join('&')}`;
};

/**
 * 页面跳转
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
        console.log(fn);
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
 * @param {Function} wxapi  微信API  eg: wx.login
 * @param {Object} obj
 * @returns {Promise<any>}
 */
const wxPromise = (wxapi, obj = {}) => {
    return new Promise((resolve, reject) => {
        let params = {
            success(data) {
                resolve(data);
            },
            fail(data) {
                reject(data);
            },
        };
        Object.assign(params, obj);

        wxapi(params);
    });
};

/**
 * 提示框
 * @param title
 * @param {number} duration 延迟消失时间
 */
const showToast = function (title, duration = 1500) {
    wx.showToast({
        title,
        icon: 'none',
        duration,
        mask: true,
    });
};

/**
 * 提示框  promise版本
 * @param title
 * @param icon
 * @param duration
 * @param mask
 *
 */
export function showToastP(title, { icon = 'none', duration = 1500, mask = true } = {}) {
    //wx.showToast({title,icon,duration,mask});
    return wxPromise(wx.showToast, { title, icon, duration, mask }).then(() => {
        return new Promise((resolve) => {
            setTimeout(resolve, duration + 100);
        });
    });
}

/**
 *
 * @param {object} obj
 * @param {string} obj.content - 提示内容
 * @returns {Promise<any | never>}
 */
const showModal = function (obj) {
    return wxPromise(wx.showModal, obj).then((res) => {
        if (res.confirm) {
            return Promise.resolve(res);
        } else {
            return Promise.reject(res);
        }
    });
};

/**
 * 设置本地数据
 * @exports setStorageSync
 * @param {string} key
 * @param {*} val
 */
const setStorageSync = function (key, val) {
    if (!key) {
        throw 'setStorageSync: key is null';
    }
    wx.setStorageSync(key, val);
};

/**
 * 获取本地数据
 * @param {String} key
 * @returns {(string | Object | number)}
 */
const getStorageSync = function (key) {
    return wx.getStorageSync(key);
};

/**
 * 预览图片
 * @param {Array} urls - 图片数组
 * @param {string} current - 当前图片地址
 * @returns {Promise<any>}
 */
const previewImage = function (urls, current = urls[0]) {
    return wxPromise(wx.previewImage, { urls, current });
};

/**
 * 显示隐藏 loading 菊花
 * @param {number} key - 0或1
 * @param {Object} [params = {title:'xxx',mask:'true'}]
 * @returns {Promise<any>}
 */
const toggleLoading = function (key, params = { mask: true }) {
    if (key) {
        return wxPromise(wx.showLoading, params);
    } else {
        return wxPromise(wx.hideLoading);
    }
};

/**
 * 解析二维码中的 Scene
 * @param {string} _sence1 - 类似 uid@1111#channel@33333
 */
const parseScene = function (_sence1) {
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
const truncationFont = function (str, num, showEllipsis = true) {
    if (!str) {
        return str;
    }

    let s = '';
    for (let i of str) {
        s += i;
        if (getByteLen(s) > (num - 2) * 2) {
            break;
        }
    }

    return showEllipsis ? (str !== s ? s + '...' : str) : s;
    // return getByteLen(str) <= num * 2 ? str : showEllipsis ? str.substr(0, num) + '...' : str.substr(0, num);
};

/**
 * 深度克隆一个Object
 * @param object
 * @returns {any}
 */
const deepClone = function (object) {
    return JSON.parse(JSON.stringify(object));
};

/**
 *
 * @param {Number} times 秒
 * @param {Function} callback
 * @param {Function} endCallBack
 */

const countDown = (times, callback, endCallBack = () => {}) => {
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
 * 格式化价格
 * @param {number} price 价格
 * @param {number} discount 折扣率 %
 * @param {number} toFix - toFix 格式化小数点后几位
 * @returns {string}
 */
const formatPrice = function (price, discount = 100, toFix = 2) {
    return ((price * discount) / 10000).toFixed(toFix);
};

export {
    formatPrice,
    formatNumber,
    formatTime,
    wxPromise,
    showToast,
    setStorageSync,
    getStorageSync,
    setUrlQuery,
    previewImage,
    parseScene,
    toggleLoading,
    truncationFont,
    deepClone,
    showModal,
    countDown,
};

/**
 * 返回当天所在的一周
 * @param {string} date 日期字符串
 * @returns {Object}
 */

export const weekDay = (date) => {
    const time = new Date(date);
    const week = time.getDay();
    const before = new Date(date);
    before.setDate(before.getDate() - week);
    const after = new Date(date);
    after.setDate(after.getDate() + (6 - week));
    console.log(formatTime(before).ymd, formatTime(after).ymd);
    return {
        afterYMD: formatTime(after).ymd,
        beforeYMD: formatTime(before).ymd,
        after,
        before,
    };
};

/**
 * 返回当天所在的一周
 * @param {string} date 日期字符串
 * @returns {Object}
 */

export const monthDay = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth();
    const before = new Date(date.getFullYear(), month, 1);

    //tips 获取当月最大的天数 new Date(2018,12,0) 即可获取12月份最大的天数
    const after = new Date(date.getFullYear(), month + 1, 0);

    console.log(formatTime(before).ymd, formatTime(after).ymd);
    return {
        afterYMD: formatTime(after).ymd,
        beforeYMD: formatTime(before).ymd,
        after,
        before,
    };
};

/**
 *
 * 控制执行频率
 * @param func {Function} 要执行的方法
 * @param wait {number}  间隔时间
 * @param immediate {Boolean}  布尔值    true 间隔前执行   false 间隔后执行
 * @returns {Function}  返回要执行的方法
 */
export const debounce = function (func, wait, immediate) {
    let timeout, args, context, timestamp, result;

    const later = function () {
        console.log(1111, new Date().getTime(), timestamp);
        var last = new Date().getTime() - timestamp;

        if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            }
        }
    };

    return function () {
        context = this;
        args = arguments;
        timestamp = new Date().getTime();
        const callNow = immediate && !timeout;
        console.log(timeout);
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };
};

/**
 * 获取自定义的URL的search参数
 * @param {string} url - 自定义的URL
 * @return {Object}
 */
export const getUrlSearch = function (url) {
    const href = url.split('?');
    console.log(href, 'href', href.length, href.length === 2);
    const obj = {};
    if (href.length === 2) {
        const arr = href[1].split('&');
        for (let i = 0; i < arr.length; i++) {
            let ar = arr[i].split('=');
            obj[ar[0]] = ar[1];
        }
    }
    return obj;
};
