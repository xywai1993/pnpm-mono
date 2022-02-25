let activeEffect;

class Dep {
    constructor(value) {
        this.subscribers = new Set();
        this._value = value;
    }

    get value() {
        this.depend();
        return this._value;
    }

    set value(value) {
        this._value = value;
        this.notify();
    }

    depend() {
        if (activeEffect) {
            this.subscribers.add(activeEffect);
        }
    }

    notify() {
        this.subscribers.forEach((effect) => {
            effect();
        });
    }
}

export function watchEffect(effect) {
    activeEffect = effect;
    effect();
    activeEffect = null;
}

const targetToHashMap = new WeakMap();
const targetNameSpaceMap = new WeakMap();
function getDep(target, key) {
    let depMap = targetToHashMap.get(target);
    if (!depMap) {
        depMap = new Map();
        targetToHashMap.set(target, depMap);
    }

    let dep = depMap.get(key);
    if (!dep) {
        dep = new Dep(target[key]);
        depMap.set(key, dep);
    }

    return dep;
}

export function pp(obj, params = { isRef: false }) {
    return new Proxy(obj, {
        get(target, key) {
            if (key === '__is_p') {
                return true;
            }

            if (key == '__is_target') {
                return target;
            }

            if (key == '__is_p_ref') {
                return params.isRef;
            }

            const value = getDep(target, key).value;
            if (value && typeof value === 'object') {
                if (targetNameSpaceMap.has(target)) {
                    targetNameSpaceMap.set(value, `${targetNameSpaceMap.get(target)}.${key}`);
                }
                return pp(value, params);
            } else {
                return value;
            }
        },
        set(target, key, value) {
            if (uiThis && targetNameSpaceMap.has(target)) {
                let path = `${targetNameSpaceMap.get(target)}`;

                // 数组对象特殊处理
                if (Array.isArray(target) && Number(key) !== NaN) {
                    path = `${path}[${key}]`;

                    // console.log('数组路径', `${path}`);
                } else {
                    /**
                     * tip:
                     *  把中间是 ".0." 这样的格式替换为数组格式  "[0]."
                     *  eg: demoRef.value.0.demo ->  demoRef.value[0].demo
                     */
                    const re = /\.(?<num>\d+)\./g;
                    path = `${path}.${key}`.replace(re, '[$<num>].');

                    // console.log('常规路径', path);
                }

                // 如果是ref 对象，自动解包
                if (params.isRef) {
                    const removeValueRe = /\.value/;
                    path = path.replace(removeValueRe, '');
                }
                console.log('setData path-->', path);
                uiThis.setData({ [`${path}`]: value });
            }
            getDep(target, key).value = value;
            return true;
        },
    });
}

let uiThis = null;
let lifetimes = {};
export function componentLifetimes(name, cb) {
    if (typeof cb === 'function') {
        if (lifetimes.hasOwnProperty(name)) {
            lifetimes[name].push(cb);
        } else {
            lifetimes[name] = [cb];
        }
    }
}

export function componentSetup(cb) {
    const data = cb();

    const wxData = {};
    const wxMethods = {};

    Object.entries(data).forEach((val) => {
        if (typeof val[1] === 'function') {
            // todo: 处理函数
            wxMethods[val[0]] = val[1];
        } else {
            targetNameSpaceMap.set(val[1].__is_target, val[0]);

            // ref 对象自动解包
            if (val[1].__is_p_ref) {
                wxData[val[0]] = val[1].value;
            } else {
                wxData[val[0]] = val[1];
            }
        }
    });

    const componentPage = {
        options: {
            addGlobalClass: true,
        },
        properties: {
            // 这里定义了innerText属性，属性值可以在组件使用时指定
            msg: {
                type: String,
                value: '',
                observer: function (newVal, oldVal) {
                    // this.tag = tagClassName[newVal.type - 1];
                    // 属性值变化时执行
                    // this.setData({ tag: tagClassName[newVal.type - 1] });
                },
            },
        },
        data: wxData,
        methods: wxMethods,
        lifetimes: {},
    };

    // 确保created 必定有一个
    if (!lifetimes.created) {
        lifetimes.created = [(options) => {}];
    }
    for (const [key, value] of Object.entries(lifetimes)) {
        lifetimes[key] = function (options) {
            value.forEach((item) => {
                item.call(this, options);
            });
        };
    }

    const lifetimesProxy = new Proxy(lifetimes, {
        get(target, prop) {
            if (prop === 'created') {
                return function (e) {
                    uiThis = this;
                    target[prop].call(this, e);
                };
            }

            if (typeof target[prop] === 'function') {
                console.log(prop);
            }
            return Reflect.get(target, prop);
        },
    });

    componentPage.lifetimes = lifetimesProxy;

    // const p = new Proxy(componentPage, {});

    return Component(componentPage);
}
