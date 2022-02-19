// const { html2json, json2html } = require('html2json');

const compiler = require('vue-template-compiler');
const { visit, parse: recastParse, print, types } = require('recast');

// 去除交集
function symmetricDifference(setA, setB) {
    let _difference = new Set(setA);
    for (let elem of setB) {
        if (_difference.has(elem)) {
            _difference.delete(elem);
        } else {
            _difference.add(elem);
        }
    }
    return _difference;
}

/**
 * 解析ast 或者 string
 * @param {string|object} str
 * @returns {string[]}
 */
function parseAstGetVar(str, idArr) {
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
    arr.forEach((item) => idArr.add(item));
    return arr;
}

function t(children, filterArr, idArr) {
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

                        parseAstGetVar(ast, idArr);
                    }
                }
            });
        }

        if (item.if) {
            parseAstGetVar(item.if, idArr);
        }

        if (item.for) {
            // wx:for-item="i"
            parseAstGetVar(item.for, idArr);
            filterArr.add(item.alias);
            item.iterator1 && filterArr.add(item.iterator1);
        }

        if (item.attrs) {
            item.attrs.forEach((attr, i) => {
                // todo: 这里很奇怪，经过vue转换后的数据 ，dynamic的值动态的为 false ，非动态为 undefined
                if (attr.dynamic === false) {
                    parseAstGetVar(attr.value, idArr);
                }
            });
        }

        if (item.props) {
            item.props.forEach((props) => {
                if (props.dynamic === false) {
                    parseAstGetVar(props.value, idArr);
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
                    parseAstGetVar(key[1].value, idArr);
                }
            });
        }

        // 动态class
        if (item.classBinding) {
            parseAstGetVar(item.classBinding, idArr);
        }

        // 动态style
        if (item.styleBinding) {
            parseAstGetVar(item.styleBinding, idArr);
        }
        // 子节点
        if (item.children) {
            o.child = t(item.children, filterArr, idArr);
        }
        return o;
    });
}

function getVar(children) {
    const idArr = new Set();
    const filterArr = new Set();
    t(children, filterArr, idArr);

    for (let elem of filterArr) {
        // _difference.delete(elem);
        if (idArr.has(elem)) {
            idArr.delete(elem);
        }
    }

    return idArr;
}

const template = `
<div v-for="(li,index) in petList" :key="li.id" class="pet-item" >
<div class="pet-avatar">
    <img :src="li.avatar" class="g-img" alt />
</div>
<p class="mt-5 fs-12 fsw-6em">{{ li.nickname }}</p>
</div>
`;
const r = template2Set(template);
console.log(r);
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
            // this.traverse(path);
            return false;
        },
    });

    const realBody = ExpressionStatementAst.program.body[0];

    const script = b.program([...ImportDeclaration, realBody]);
    return print(script).code;
}

module.exports = { template2Set, createSetupString };
