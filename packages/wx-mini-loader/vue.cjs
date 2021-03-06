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

function camel2median(str) {
    const re = /([A-Z])/g
    // console.log(str.replace(re,'-$1').toLowerCase())
    return str.replace(re,'-$1').toLowerCase();
}

/**
 *
 * @param {string} bindStyle   类似这样的 "{'width':some+'px',height:some2}"
 * @returns {string}
 */
function changeBindStyle(bindStyle) {
    const ast = recastParse(`const test = ${bindStyle}`).program.body[0].declarations[0].init;

    // 类似这样的 "{'width':some+'px',height:some2}"
    if (ast.type === 'ObjectExpression') {
        let styleStr = '';
        ast.properties.forEach((style) => {
            const key = style.key.type === 'Identifier' ? camel2median(style.key.name)  : style.key.value;
            let code = '';
            const value = style.value;
            code = print(value).code;
            if(value.type === 'TemplateLiteral'){
                const re = /(\${(.+)})/;
                value.quasis.forEach(v=>{
                    code = code.replace(re,'{{$2}}')
                })

                code = code.replace(/^`/,'').replace(/`$/,'');

                styleStr +=`;${key}:${code}`

            }else{
                styleStr += `;${key}:{{${code}}}`;
            }



        });

        return styleStr;
    }

    if (ast.type === 'Identifier') {
        return `{{${ast.name}}}`;
    }

    if (ast.type === 'MemberExpression') {
        return `{{${print(ast).code}}}`;
    }
}

/**
 *
 * @param {string} bindClass  1 [a,b,c] , 2 {'a':some,b:c};
 */
function changeBindClass(bindClass) {
    const ast = recastParse(`const test = ${bindClass}`).program.body[0].declarations[0].init;

    const classArr = [];
    // 格式1 [a,b.c,c+'f']
    if (ast.type === 'ArrayExpression') {
        ast.elements.forEach((item) => {
            if (item.type === 'Identifier') {
                classArr.push(`{{${item.name}}}`);
            }

            const codeType = ['ConditionalExpression', 'MemberExpression', 'BinaryExpression'];
            if (codeType.indexOf(item.type) !== -1) {
                const code = print(item);
                classArr.push(`{{${code.code}}}`);
            }
        });
    }

    // 格式2 {'a':some,b:c}
    if (ast.type === 'ObjectExpression') {
        ast.properties.forEach((item) => {
            const key = item.key.type === 'Identifier' ? `'${item.key.name}'` : item.key.raw;
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

function t(children) {
    return children.map((item) => {
        const o = { node: '', type: 1, tag: '', text: '', attr: {}, child: [] };
        o.tag = item.tag;
        o.type = item.type;

        if (item.type === 1) {
            o.node = 'element';
            o.tag = changeElementName(item.tag);
        }

        if (item.type === 2) {
            o.node = 'text';
            o.text = item.text;
        }

        if (item.type === 3) {
            o.node = 'text';
            o.text = item.text;
        }

        if (item.if) {
            o.attr['wx:if'] = `{{${item.if}}}`;
        }

        if (item.for) {
            o.attr['wx:for'] = `{{${item.for}}}`;
            // wx:for-item="i"
            o.attr['wx:for-item'] = `${item.alias}`;

            if (item.iterator1) {
                o.attr['wx:for-index'] = `${item.iterator1}`;
            } else {
                o.attr['wx:for-index'] = `index`;
            }

            // eg:  li.id -> id  wx:key="id"
            if (item.key) {
                const re = new RegExp(`^${item.alias}\.`);
                o.attr['wx:key'] = `${item.key.replace(re, '')}`;
            }
        }

        if (item.attrs) {
            item.attrs.forEach((attr, i) => {
                const name = item.attrs[i].name;

                // tips: 这里很奇怪，经过vue转换后的数据 ，dynamic的值动态的为 false ，非动态为 undefined
                if (attr.dynamic === false) {
                    o.attr[name] = `{{${attr.value}}}`;
                } else {
                    // todo: 这里将来可能会有bug 强制去掉了双引号
                    o.attr[name] = attr.value.replace(/\"/g, '');
                }
            });

            // 特殊属性is
            if (item.attrsMap.is) {
                o.attr['is'] = item.attrsMap.is;
            }

            // 填充默认值
            if (o.tag === 'image') {
                if (!o.attr['mode']) {
                    o.attr['mode'] = 'aspectFill';
                }
            }
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
                if (directives.rawName === 'v-show') {
                    o.attr['hidden'] = `{{${directives.value}}}`;
                }

                const input = ['input','textarea'];
                if(directives.rawName === 'v-model' && input.indexOf(item.tag) !== -1){
                    o.attr['value'] = `{{${directives.value}}}`
                    o.attr['bindinput'] = `__vModelEventResponses`
                    o.attr['data-vmodel-params'] = `${directives.value}`
                }
            });
        }

        // 事件
        if (item.events) {
            Object.entries(item.events).forEach((key) => {
                //存在v-model时 input不处理,由directives处理
                if(key[0]==='input' && item.attrsMap.hasOwnProperty('v-model')){
                    return ;
                }
                // 转换事件名 click -> tap 、touchmove-> touchmove、等
                const bindOrCatch = key[1].modifiers?.stop ? 'catch' : 'bind';
                const wxEventName = key[0] === 'click' ? `${bindOrCatch}:tap` : `${bindOrCatch}:${key[0]}`;

                // 转换响应函数

                const otherData = { isFor: !!item.for, alias: item.alias };
                const eventResponseData = changeEvents(key[1].value, otherData);

                o.attr[wxEventName] = eventResponseData.eventName;

                if (eventResponseData.eventParams) {
                    o.attr['data-event-params'] = eventResponseData.eventParams;
                }
            });
        }
        // 静态class
        if (item.staticClass) {
            if ( Array.isArray(o.attr.class) ) {
                o.attr.class.push(item.staticClass);
            } else {
                o.attr['class'] = [removeQuote(item.staticClass)];
            }
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
            o.child = t(item.children);
        }
        return o;
    });
}

const template = `<input @input="handle"/>`
// const template = '<div class="aaa" class="bbb"></div>'

const r = template2WxTemplate(template);








function template2WxTemplate(template) {
    const result = compiler.compile(template, {});
    return json2html({ node: 'root', child: t([result.ast]) });
}

module.exports = template2WxTemplate;
