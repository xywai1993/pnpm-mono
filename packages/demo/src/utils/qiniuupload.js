import { getStorageSync, setStorageSync, wxPromise } from './utils';
import { constant } from './constant';
import { GetQiNiuToken } from '../server';

/**
 * @param {number} count 上传数量，最多九张
 * @returns {Promise<string>} url
 */
export async function qiniuUpload(count = 1) {
    let tokenData = getStorageSync(constant.qiNiuToken);
    if (!(tokenData && tokenData.expires * 1000 > new Date().getTime() + 60000)) {
        tokenData = await GetQiNiuToken();
        setStorageSync(constant.qiNiuToken, tokenData);
    }

    return wxPromise(wx.chooseImage, { count })
        .then((res) => {
            wx.showLoading({
                title: '上传中...',
            });

            const promiseFn = res.tempFilePaths.map((item) => {
                const fileName = item.split('//')[1];
                return wxPromise(wx.uploadFile, {
                    url: tokenData.qiniu_host,
                    filePath: item,
                    name: 'file',
                    formData: {
                        key: tokenData.prefix + fileName,
                        token: tokenData.token,
                    },
                });
            });

            return Promise.all(promiseFn);
        })
        .then((data) => {
            console.log('upload', data);

            const urlList = data.map((item) => {
                const da = JSON.parse(item.data);
                const key = da.key;
                const url = tokenData.domain + '/' + key;
                return url;
            });
            wx.hideLoading();
            return urlList;

            // if (this.isShow === 1) {
            //     this.url = url;
            // }

            // this.$emit("input", url);
        });
}
