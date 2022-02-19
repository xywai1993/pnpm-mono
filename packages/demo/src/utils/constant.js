let CONSTANT = 'baoma.dev.constant.';
if (process.env.NODE_ENV === 'production') {
    CONSTANT = 'baoma.constant.';
}

function buildStorageKey(key) {
    return CONSTANT + key;
}

const constant = {
    token: buildStorageKey('token'),
    uid: buildStorageKey('uid'),
    hasUserInfo: buildStorageKey('hasUserInfo'),
    qiNiuToken: buildStorageKey('qiNiuToken'),
};

export { constant };
export default constant;
