const {platform} = require("os");
const path = require("path");

function usePathToPosix(winPath) {
    if (platform() === 'win32') {
        return winPath.split('\\').join('/');
    } else {
        return winPath;
    }
}

function usePathInfo(src) {
    const dirSrc = path.dirname(src);
    const extName = path.extname(src);
    const fileName = path.basename(src, extName);

    return {
        dirSrc,
        fileName,
        extName,
    };
}
module.exports= {
    usePathToPosix,
    usePathInfo
}