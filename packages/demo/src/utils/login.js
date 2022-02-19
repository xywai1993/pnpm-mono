/**
 * @author yiper.fan
 * @update 2021年03月10日16:39:45
 */

import { constant } from './constant';
import { getStorageSync, setStorageSync, showToast, wxPromise } from './utils';
import { httpRequest } from './dorequest';
import { Hosts } from './config';
import { checkToken, Login } from '../server';
// import { store } from '../store/global-store';
// import { LOGIN } from '../store/mutation';

function loginFn({ code, iv, encryptedData }) {
    //todo login
    return httpRequest({
        need_token: false,
        url: '/api/users/login',
        catch: true,
        header: {},
        data: {
            code,
            iv,
            encryptedData,
            type: 'mini_program',
        },
    });
}

function success({ token, user_id }) {
    setStorageSync(constant.token, token);
    setStorageSync(constant.uid, user_id);
    // store.commit(LOGIN, true);
}

/**
 * 通用登录，在需要登录的页面调用
 * @param {object} param0
 * @param {number} [param0.time=3] 重试次数
 */
export async function login({ time, scope } = { time: 3, scope: false }) {
    const token = getStorageSync(constant.token);

    const codeLogin = async () => {
        // 静默登录
        const data = await wxPromise(wx.login);
        console.log('wx.login');

        try {
            const loginData = await Login(data.code);
            success(loginData);
            return Promise.resolve({ status: true, code: data.code });
        } catch (e) {
            console.log(e);
            if (time <= 0) {
                showToast('网络错误，请检查网络后重试', 10000);
                return Promise.reject({ status: false, code: data.code });
            } else {
                time--;
                await login({ scope, time });
            }
        }
    };

    if (scope) {
        return codeLogin();
    } else {
        if (token) {
            try {
                const data = await checkToken();
                if (data.status === 1) {
                    return Promise.resolve({ status: true });
                } else {
                    setStorageSync(constant.token, '');
                    await login({ scope, time });
                }
            } catch (error) {
                console.log(error);
                if (time <= 0) {
                    showToast('网络错误，请检查网络后重试', 10000);
                } else {
                    time--;
                    console.log('再次login', time);
                    await login({ scope, time });
                }
            }
        } else {
            return codeLogin();
        }
    }
    //不存在token的情况， 1 可能是新用户 2 可能删除过小程序
}

// 强制授权登录 ，仅授权页/授权框 使用

/**
 *
 * @param {object} param0 wx.getUserInfo 的iv和encryptedData
 * @param {string} param0.iv
 * @param {string} param0.encryptedData encryptedData
 * @param {number} time 重试次数
 */
export async function scopeLogin(data = {}, time = 3) {
    try {
        const loginData = await loginFn(data);
        success(loginData);
        return Promise.resolve({ status: true });
    } catch (e) {
        console.log(e);
        if (time <= 1) {
            showToast('网络错误，请检查网络后重试', 10000);
            return Promise.reject({ status: false });
        } else {
            time--;
            await scopeLogin(data, time);
        }
    }
}
