/**
 * @author yiper.fan
 * @update 2021年02月02日14:14:54
 */

import { constant } from './constant.js';
import { Hosts, config } from './config.js';

import { setStorageSync } from './utils.js';
import { postErrorLog } from './mini-report-error.js';

const failFn = (msg = '网络错误') => {
    wx.showToast({
        title: msg || '网络错误',
        icon: 'none',
    });
};

// function getCurrentPageUrl() {
//     const pages = getCurrentPages(); //获取加载的页面

//     const currentPage = pages[pages.length - 1]; //获取当前页面的对象
//     console.log(currentPage.options);
//     const url = currentPage.route; //当前页面url
//     const options = currentPage.options;
//     return { url, options };
// }

/**
 * promise版本的请求
 * @param {Object} obj
 * @param {string} obj.url - 请求地址
 * @param {string} [obj.method='POST']- 请求方式
 * @param {Object} [obj.data] - 请求数据
 * @param {boolean} [obj.catch=false] - 为true时，不会弹出服务器报的错，需自行处理
 * @param {Number} [obj.original=3] - 1 wx返回的数据 2 服务端返回的数据 3 code为200返回的数据  默认为3
 * @returns {Promise}
 */
const httpRequest = (obj) => {
    const params = Object.assign(
        {
            need_token: true,
            method: 'POST',
            host: Hosts.host,
            catch: false,
            original: 3,
            header: {
                appid: config.appid,
            },
        },
        obj
    );

    // url
    params.url = params.host + params.url;

    // header
    if (params.method) {
        params.method = params.method.toUpperCase();
    } else {
        params.method = 'POST';
    }

    if (params.need_token) {
        // TODO: remove default value
        let token = wx.getStorageSync(constant.token);
        // params.header = Object.assign({ Authorization: token }, params.header);
        params.header.Authorization = token;
    }

    return new Promise((resolve, reject) => {
        params.success = (res) => {
            if (Number(res.statusCode) === 500) {
                reject(res);
                failFn();
                postErrorLog({ text: '服务器报500！！！！！', type: 2 });
                return;
            }

            if (Number(res.data.code) === 401) {
                setStorageSync(constant.token, '');

                //  const { url, options } = getCurrentPageUrl();

                // login().then(() => {
                //     //todo 可以自动登录后刷新该页面，待定，可能有体验问题
                //     // wx.redirectTo({ url:'/'+url});
                //     console.log('token完成');
                // });
                reject(res);
                return;
            }

            switch (Number(params.original)) {
                case 1:
                    resolve(res);
                    break;
                case 2:
                    resolve(res.data);
                    break;
                case 3:
                    if (Number(res.data.code) === 200) {
                        resolve(res.data.data);
                    } else {
                        if (!params.catch) {
                            failFn(res.data.msg);
                        }
                        reject(res.data);

                        postErrorLog({
                            type: 0,
                            text: res.data.msg,
                            other: {
                                requestUrl: params.url,
                                requestData: params.data,
                                responseCode: res.data.code,
                            },
                        });
                    }
            }
        };

        params.fail = (data) => {
            if (params.catch) {
                reject(data);
            } else {
                failFn();
            }

            postErrorLog({
                type: 2,
                text: JSON.stringify(data),
                other: {
                    requestUrl: params.url,
                },
            });
        };

        wx.request(params);
    });
};

httpRequest.post = (url, options, other = {}) => {
    const data = Object.assign(
        {
            method: 'post',
            url,
            data: options,
        },
        other
    );
    return httpRequest(data);
};

/**
 * get请求
 * @param {string} url -请求地址
 * @param {object} options -请求参数
 */
httpRequest.get = (url, options, other = {}) => {
    const data = Object.assign(
        {
            method: 'get',
            url,
            data: options,
        },
        other
    );
    return httpRequest(data);
};

export { httpRequest };
export default httpRequest;
