const { parse: vueSFCParse, compileScript } = require('@vue/compiler-sfc');
const path = require('path/posix');
const qs = require('querystring');
// const loaderUtils = require('loader-utils');
const { URL } = require('url');
const { readFileSync } = require('fs');

const { template2Set, createSetupString } = require('./template-dynamic-var.cjs');

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

module.exports = function (content, map, meta) {
    return `export default ''`;
};

module.exports.pitch = function (a) {
    if (/\.vue$/.test(a)) {
        this.addDependency(a);
        const content2 = readFileSync(a, { encoding: 'utf-8' });
        const result = vueSFCParse(content2);

        const descriptor = result.descriptor;
        const templateImport = descriptor.template ? `import template from '${a}?template'` : ``;
        const styleImports = descriptor.styles
            .map((_, i) => {
                return `import style${i} from '${a}?css'`;
            })
            .join('\n');

        let scriptContent = '';

        if (descriptor.script) {
            scriptContent = descriptor.script.content;
        }

        if (descriptor.scriptSetup) {
            const defaultFrom = `import { setup as __SETUP__ } from "@yiper.fan/wx-mini-runtime";`;
            const str = createSetupString(defaultFrom + descriptor.scriptSetup.content, [...template2Set(descriptor.template.content)]);
            scriptContent = str;
        }

        let code = `
        ${templateImport}
        ${styleImports}
        ${scriptContent}
        `;
        console.log(scriptContent);

        return code;
    }
};
