const path = require('path');
// const { URL } = require('url');
// const postcss = require('postcss');
// const postUrl = require('postcss-url');
const { parse: vueSFCParse, compileScript } = require('@vue/compiler-sfc');
// var Px2rpx = require('px2rpx');
// var px2rpxIns = new Px2rpx({ baseDpr: 1, rpxUnit: 0.5 });

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
module.exports = function (content) {
    const { _compiler, resource, resourcePath, request, resourceQuery, target, minimize, sourceMap, context, rootContext, query, importModule, loadModule } =
        this;

    // this.callback(null, `export default ''`);
    const { dirSrc, fileName } = usePathInfo(resourcePath);
    const rootPath = path.join(rootContext, query.root);
    const basePathContext = context.replace(rootPath, '');

    // let templateJson = html2json(content);

    // templateJson.child = transformTmp(templateJson.child);

    // // const callback = this.async();

    const result = vueSFCParse(content);
    const descriptor = result.descriptor;
    const templateContent = descriptor.template.content;
    const styleContent = result.descriptor.styles[0].content;
    // try {
    //     const newCssText = px2rpxIns.generaterpx(styleContent); // generate rpx version stylesheet
    //     console.log(newCssText);
    // } catch (error) {
    //     console.log({ error });
    // }
    // var newCssText2 = px2rpxIns.generateThree(originCssText, 2); // generate @1x, @2x and @3x version
    return styleContent;
    // return newCssText;
};
