//let host = 'https://kan.dev.douba.cn';

const Hosts = {
    host: 'http://baoma.dev.douba.cn',
    loginHost: 'http://kt-activity.dev.douba.cn',
    // ws: "wss://sale-helper.dev.douba.cn:9502",
    // host: 'https://yfb.km.91douba.com',
    // loginHost: 'https://api.douba.cn',
    // ws: 'wss://yfb.km.91douba.com:9502'
};

if (process.env.NODE_ENV === 'preRelease') {
    Hosts.host = 'https://yfb.km.91douba.com';
    Hosts.loginHost = 'https://api.douba.cn';
}

if (process.env.NODE_ENV === 'production') {
    Hosts.host = 'https://api.lanbaobei.com';
    // Hosts.host = 'https://yfb.km.91douba.com';
    Hosts.loginHost = 'https://www.ktuan.cn';
}

export const config = {
    appid: 'wxa4fea03aaa0cd389',
    version: '0.0.1', //提审版本号
};

// 素材类型
export const MATERIAL_TYPE_TEXT = new Map([
    [1, '图文清单'],
    [2, '条目清单'],
    [3, '视频清单'],
    [4, '音频清单'],
]);

export { Hosts };
