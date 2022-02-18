// const { html2json, json2html } = require('html2json');
const { json2html } = require('./lib/json2html.cjs');
const compiler = require('vue-template-compiler');
const { visit, parse: recastParse, print, types } = require('recast');

/**
 *{
  node: 'root',
  child: [
    {
      node: 'element',
      tag: 'div',
      attr: { id: '1', class: 'foo' },
      child: [
        {
          node: 'element',
          tag: 'h2',
          child: [
            { node: 'text', text: 'sample text with ' },
            { node: 'element', tag: 'code', child: [{ node: 'text', text: 'inline tag' }] }
          ]
        },
        {
          node: 'element',
          tag: 'pre',
          attr: { id: 'demo', class: ['foo', 'bar'] },
          child: [{ node: 'text', text: 'foo' }]
        },
        {
          node: 'element',
          tag: 'pre',
          attr: { id: 'output', class: 'goo' },
          child: [{ node: 'text', text: 'goo' }]
        },
        {
          node: 'element',
          tag: 'input',
          attr: { id: 'execute', type: 'button', value: 'execute' }
        }
      ]
    }
  ]
}
 */

function removeQuote(str, single = false) {
    return single ? str.replace(/\'/g, '') : str.replace(/\"/g, '');
}

function changeElementName(tagName) {
    const blockList = ['div', 'section', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'li'];
    const inlineList = ['span', 'i', 'em'];
    if (blockList.indexOf(tagName) !== -1) {
        return 'view';
    }
    if (inlineList.indexOf(tagName) !== -1) {
        return 'text';
    }
    if (tagName === 'img') {
        return 'image';
    }
    return tagName;
}

/**
 *
 * @param {string} bindStyle   类似这样的 "{'width':some+'px',height:some2}"
 * @returns {string}
 */
function changeBindStyle(bindStyle) {
    const ast = recastParse(`const test = ${bindStyle}`).program.body[0].declarations[0].init.properties;
    let styleStr = '';

    ast.forEach((style) => {
        const value = style.value;
        const key = style.key.type === 'Identifier' ? style.key.name : style.key.value;
        const code = print(value).code;
        styleStr += `;${key}:{{${code}}}`;
    });

    return styleStr;
}

/**
 *
 * @param {string} bindClass  1 [a,b,c] , 2 {'a':some,b:c};
 */
function changeBindClass(bindClass) {
    const ast = recastParse(`const test = ${bindClass}`).program.body[0].declarations[0].init;

    const classArr = [];
    // 格式1 [a,b.c,c]
    if (ast.type === 'ArrayExpression') {
        ast.elements.forEach((item) => {
            if (item.type == 'Identifier') {
                classArr.push(`{{${item.name}}}`);
            }

            if (item.type == 'MemberExpression') {
                const code = print(item);
                classArr.push(`{{${code.code}}}`);
            }
        });
    }

    // 格式2 {'a':some,b:c}
    if (ast.type === 'ObjectExpression') {
        ast.properties.forEach((item) => {
            const key = item.key.type == 'Identifier' ? `'${item.key.name}'` : item.key.raw;
            const code = print(item.value);
            const val = `(${code.code})`;

            classArr.push(`{{${val}?${key}:''}}`);
        });
    }

    return classArr;
}

/**
 *
 * @param eventString  类似 "goTo('a',1,2)" 或者 "goTo"
 */
function changeEvents(eventString, otherData) {
    const ast = recastParse(`const test = ${eventString}`).program.body[0].declarations[0].init;

    let eventName = '';
    const eventParams = [];

    // 函数带参数
    if (ast.type === 'CallExpression') {
        eventName = ast.callee.name;

        const fn = {
            Literal: (item) => {
                eventParams.push(item.value);
            },
            Identifier: (item) => {
                eventParams.push(`{{${item.name}}}`);
            },
            UnaryExpression: (item) => {
                // console.log(print(item).code);
                eventParams.push(print(item).code);
            },
            MemberExpression: (item) => {
                // if (otherData.isFor && otherData.alias == item.object.name) {
                //     eventParams.push(`{{${item.property.name}}}`);
                // } else {
                //     eventParams.push(`{{${print(item).code}}}`);
                // }
                eventParams.push(`{{${print(item).code}}}`);
            },
        };
        ast.arguments.forEach((item) => {
            if (fn.hasOwnProperty(item.type)) {
                fn[item.type](item);
            }
        });
        // 直接函数名
    } else if (ast.type === 'Identifier') {
        eventName = ast.name;
    } else if (ast.type === 'AssignmentExpression') {
        // 表达式  类似 show.value = true
        eventName = '__AssignmentExpression';
        // console.log('__AssignmentExpression', print(ast).code);
        eventParams.push(print(ast.left).code);
        eventParams.push(`{{${print(ast.right).code}}}`);
    }

    return {
        eventName,
        eventParams: eventParams.length ? eventParams.join(',') : null,
    };
}

// ast | string
function parseAstGetVar(ast) {
    const arr = [];
    const parseAst = (ast) => {
        if (ast.type === 'Identifier') {
            arr.push(ast.name);
        }
        if (ast.type === 'MemberExpression') {
            parseAst(ast.object);
        }

        if (ast.type === 'BinaryExpression') {
            parseAst(ast.left);
            parseAst(ast.right);
        }
    };

    parseAst(ast);

    return arr;
}

function t(children, idArr = []) {
    return children.map((item) => {
        const o = { node: '', type: 1, tag: '', text: '', attr: {}, child: [] };
        o.tag = item.tag;
        o.type = item.type;

        // 文本 可能包含 {{num}} 这样的
        if (item.type === 2) {
            item.tokens.forEach((token) => {
                if (typeof token === typeof {}) {
                    if (token.hasOwnProperty('@binding')) {
                        const ast = recastParse(`const test = ${token['@binding']}`).program.body[0].declarations[0].init;

                        // const arr = parseAstGetVar(ast);
                        idArr.add(...parseAstGetVar(ast));
                    }
                }
            });
        }

        if (item.if) {
            const ast = recastParse(`const test = ${item.if}`).program.body[0].declarations[0].init;

            // const arr = parseAstGetVar(ast);
            idArr.add(...parseAstGetVar(ast));
        }

        if (item.for) {
            // wx:for-item="i"
            const ast = recastParse(`const test = ${item.for}`).program.body[0].declarations[0].init;
            idArr.add(...parseAstGetVar(ast));
        }

        if (item.attrs) {
            item.attrs.forEach((attr, i) => {
                // todo: 这里很奇怪，经过vue转换后的数据 ，dynamic的值动态的为 false ，非动态为 undefined
                if (attr.dynamic === false) {
                    const ast = recastParse(`const test = ${attr.value}`).program.body[0].declarations[0].init;
                    idArr.add(...parseAstGetVar(ast));
                }
            });
        }

        if (item.props) {
            item.props.forEach((props) => {
                if (props.dynamic === false) {
                    o.attr[props.name] = `{{${props.value}}}`;
                } else {
                    // todo: 这里将来可能会有bug 强制去掉了双引号
                    o.attr[props.name] = `${props.value}`;
                }
            });
        }

        // 指令
        if (item.directives) {
            item.directives.forEach((directives) => {
                if (directives.rawName == 'v-show') {
                    o.attr['hidden'] = `{{${directives.value}}}`;
                }
            });
        }

        // 事件
        if (item.events) {
            Object.entries(item.events).forEach((key) => {
                // 转换事件名 click -> tap 、touchmove-> touchmove、等
                const bindOrCatch = key[1].modifiers?.stop ? 'catch' : 'bind';
                const wxEventName = key[0] == 'click' ? `${bindOrCatch}:tap` : `${bindOrCatch}:${key[0]}`;

                // 转换响应函数

                const otherData = { isFor: !!item.for, alias: item.alias };
                const eventResponseData = changeEvents(key[1].value, otherData);

                o.attr[wxEventName] = eventResponseData.eventName;

                if (eventResponseData.eventParams) {
                    o.attr['data-event-params'] = eventResponseData.eventParams;
                }
            });
        }

        // 动态class
        if (item.classBinding) {
            // '{a:some}' 转换为 [a:some]
            const classArr = changeBindClass(item.classBinding);
            if (o.attr.class) {
                o.attr.class.push(...classArr);
            } else {
                o.attr['class'] = classArr;
            }
        }
        // 静态style
        if (item.staticStyle) {
            let styleStr = item.attrsMap.style;

            if (o.attr.style) {
                o.attr.style += styleStr;
            } else {
                o.attr['style'] = styleStr;
            }
        }
        // 动态style
        if (item.styleBinding) {
            const styleStr = changeBindStyle(item.styleBinding);

            if (o.attr.style) {
                o.attr.style += styleStr;
            } else {
                o.attr['style'] = styleStr;
            }
        }
        // 子节点
        if (item.children) {
            o.child = t(item.children, idArr);
        }
        return o;
    });
}

function getVar(children) {
    const idArr = new Set();
    t(children, idArr);

    return idArr;
}

const template = `
<div>

<div
class="pet-type"
:class="{ 'cat-icon': petInfo.type == 1, 'dog-icon': petInfo.type == 2 }"
></div>
</div>
`;
const r = template2WxTemplate(template);

console.log(r);
function template2WxTemplate(template) {
    const result = compiler.compile(template, {});
    // return json2html({ node: 'root', child: t([result.ast]) });

    // console.log(getVar([result.ast]));
    return getVar([result.ast]);
}

module.exports = template2WxTemplate;
