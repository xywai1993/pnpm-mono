const { parse: vueSFCParse, compileScript } = require('@vue/compiler-sfc');
// const path = require('path/posix');
const path = require('path')
const qs = require('querystring');
const { platform } = require('os');

// const loaderUtils = require('loader-utils');
const { URL } = require('url');
const { readFileSync } = require('fs');

const { template2Set, createSetupString } = require('./template-dynamic-var.cjs');
const {usePathToPosix} = require("./lib/utils.cjs");



module.exports = function (content, map, meta) {
    return `export default ''`;
};

module.exports.pitch = function (a) {
    if (/\.vue$/.test(a)) {
        this.addDependency(a);
        const content2 = readFileSync(a, { encoding: 'utf-8' });
        const result = vueSFCParse(content2);

        const descriptor = result.descriptor;

        const templateImport = descriptor.template ? `import template from '${usePathToPosix(a)}?template'` : ``;
        const styleImports = descriptor.styles
            .map((_, i) => {
                return `import style${i} from '${usePathToPosix(a)}?css'`;
            })
            .join('\n');

        let scriptContent = '';

        if (descriptor.script) {
            scriptContent = descriptor.script.content;
        }

        if (descriptor.scriptSetup) {
            const defaultFrom = `import { setup as __SETUP__ } from "@yiper.fan/wx-mini-runtime";`;
            scriptContent = createSetupString(defaultFrom + descriptor.scriptSetup.content, [...template2Set(descriptor.template.content)]);
        }

        let code = `
        ${templateImport}
        ${styleImports}
        ${scriptContent}
        `;

        return code;
    }
};
