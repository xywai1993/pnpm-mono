// const { html2json, json2html } = require('html2json');

const compiler = require('vue-template-compiler');
const { visit, parse: recastParse, print, types } = require('recast');

/**
 * 解析ast 或者 string
 * @param {string|object} str
 * @returns {string[]}
 */
function parseAstGetVar(str) {
    const arr = [];
    let ast = str;
    const parseAst = (ast) => {
        const fn = {
            Identifier: () => {
                arr.push(ast.name);
            },
            MemberExpression: () => {
                parseAst(ast.object);
            },
            BinaryExpression: () => {
                parseAst(ast.left);
                parseAst(ast.right);
            },
            CallExpression: () => {
                parseAst(ast.callee);
                ast.arguments.forEach((item) => parseAst(item));
            },
            ArrayExpression: () => {
                ast.elements.forEach((item) => parseAst(item));
            },
            ObjectExpression: () => {
                ast.properties.forEach((item) => parseAst(item.value));
            },
        };

        if (fn.hasOwnProperty(ast.type)) {
            fn[ast.type]();
        }
    };

    if (typeof str === typeof '') {
        ast = recastParse(`const test = ${str}`).program.body[0].declarations[0].init;
    }
    parseAst(ast);

    return arr;
}

// 排除循环参数
function filterIterator1(arr, Iterator1Name) {
    return arr.filter((ele) => ele !== Iterator1Name);
}

function t(children, isFor = { isFor: false, Iterator1Name: undefined }, idArr = []) {
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

                        filterIterator1(parseAstGetVar(ast), isFor.Iterator1Name).forEach((item) => idArr.add(item));
                    }
                }
            });
        }

        if (item.if) {
            filterIterator1(parseAstGetVar(item.if), isFor.Iterator1Name).forEach((item) => idArr.add(item));
        }

        if (item.for) {
            // wx:for-item="i"
            const ast = recastParse(`const test = ${item.for}`).program.body[0].declarations[0].init;
            parseAstGetVar(ast)
                .filter((ele) => ele !== item.iterator1)
                .forEach((ele) => idArr.add(ele));
        }

        if (item.attrs) {
            item.attrs.forEach((attr, i) => {
                // todo: 这里很奇怪，经过vue转换后的数据 ，dynamic的值动态的为 false ，非动态为 undefined
                if (attr.dynamic === false) {
                    parseAstGetVar(attr.value).forEach((item) => idArr.add(item));
                }
            });
        }

        if (item.props) {
            item.props.forEach((props) => {
                if (props.dynamic === false) {
                    parseAstGetVar(props.value).forEach((item) => idArr.add(item));
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
                if (key[1].dynamic === false) {
                    parseAstGetVar(key[1].value).forEach((item) => idArr.add(item));
                }
            });
        }

        // 动态class
        if (item.classBinding) {
            // '{a:some}' 转换为 [a:some]
            // parseAstGetVar(item.classBinding).forEach((item) => idArr.add(item));

            filterIterator1(parseAstGetVar(item.classBinding), isFor.Iterator1Name).forEach((item) => idArr.add(item));
        }

        // 动态style
        if (item.styleBinding) {
            filterIterator1(parseAstGetVar(item.styleBinding), isFor.Iterator1Name).forEach((item) => idArr.add(item));
        }
        // 子节点
        if (item.children) {
            o.child = t(item.children, { isFor: !!item.for, Iterator1Name: item.iterator1 }, idArr);
        }
        return o;
    });
}

function getVar(children) {
    const idArr = new Set();
    t(children, { isFor: false, Iterator1Name: undefined }, idArr);

    return idArr;
}

const template = `
<mp-navigation-bar v-for="(li,index) in list"  > 
<div :class="['item'+index]"></div>
<div v-for="(li,index2) in list2">{{index2}}</div>
</mp-navigation-bar>
`;
// const r = template2Set(template);
// console.log(r);
function template2Set(template) {
    const result = compiler.compile(template, {});
    return getVar([result.ast]);
}

function createSetupString(oldCodeString, varArr) {
    const ExpressionStatementAst = recastParse(`__SETUP__(()=>{return {}})`);
    const ImportDeclaration = [];
    const other = [];
    const oldAst = recastParse(oldCodeString);
    const b = types.builders;
    oldAst.program.body.forEach((item) => {
        if (item.type === 'ImportDeclaration') {
            ImportDeclaration.push(item);
        } else {
            other.push(item);
        }
    });

    visit(ExpressionStatementAst, {
        names: [],
        visitBlockStatement: function (path) {
            const val = varArr.map((item) => {
                return b.property('init', b.identifier(item), b.identifier(item));
            });
            const newBody = b.blockStatement([...other, b.returnStatement(b.objectExpression(val))]);
            path.replace(newBody);
            this.traverse(path);
        },
    });

    const realBody = ExpressionStatementAst.program.body[0];

    const script = b.program([...ImportDeclaration, realBody]);
    return print(script).code;
}

module.exports = { template2Set, createSetupString };
