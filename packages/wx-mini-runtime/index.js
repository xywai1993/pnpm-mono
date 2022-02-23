function warn(msg, ...args) {
    console.warn(`[mini-runtime warn] ${msg}`, ...args);
}

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
let uiThis = null;
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

const onLoadFnList = [];
export const onPageLoad = (cb) => {
    if (typeof cb === 'function') {
        onLoadFnList.push(cb);
    }
};

export const setup = (callback) => {
    onLoadFnList.length = 0;

    const data = callback();
    const wxPage = {
        onLoad: (options) => {
            onLoadFnList.forEach((item) => {
                item(options);
            });
        },
        // tip  @click="show=true" 这种写法将被 编译为 @click="__AssignmentExpression" ,因此预先内置
        __AssignmentExpression: () => {},
    };
    const wxData = {};

    Object.entries(data).forEach((val) => {
        if (typeof val[1] === 'function') {
            if (val[0] === 'onLoad') {
                const oldOnload = wxPage.onLoad;
                wxPage[val[0]] = function (options) {
                    val[1](options);
                    oldOnload(options);
                };
            } else {
                wxPage[val[0]] = val[1];
            }
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

    wxPage['data'] = wxData;

    const p = new Proxy(wxPage, {
        get: function (obj, prop) {
            if (prop === 'onLoad') {
                return function (e) {
                    uiThis = this;
                    obj[prop].call(this, e);
                };
            }

            if (typeof obj[prop] === 'function') {
                return function (e) {
                    /**
                     * tip
                     *  赋能点击事件可以直接赋值操作 eg:  @click="show=true" 或 @click="demo.a.b = 3"
                     *  数组赋值不支持！ 即 @click="arr[1] == 3" 不支持！！
                     *  注意：因为小程序不支持动态执行方法，因此只能做简单的赋值操作，太复杂的不支持
                     */

                    if (prop === '__AssignmentExpression') {
                        const ps = String(e.currentTarget.dataset.eventParams).split(',');

                        const path = ps[0].split('.');

                        // 最后一个路径为赋值操作路径
                        const last = path.pop();

                        let tmp = null;
                        let val = ps[1];
                        if (ps[1] === 'true') {
                            val = true;
                        } else if (ps[1] === 'false') {
                            val = false;
                        }

                        // 存在深度路径则依次读取路径数据
                        path.forEach((item) => {
                            tmp = tmp ? tmp[item] : data[item];
                        });

                        tmp = tmp ? tmp : data[last];

                        if (tmp.__is_p_ref) {
                            tmp.value = val;
                        } else {
                            tmp[last] = val;
                        }

                        return;
                    }

                    // tip onUnload 事件不存在 e
                    if (e && e.currentTarget) {
                        if (e.currentTarget.dataset.hasOwnProperty('eventParams')) {
                            const ps = String(e.currentTarget.dataset.eventParams).split(',');

                            // tip 把类数字都转换为数字
                            const stringToNumberPs = ps.map((item) => {
                                if (Number.isNaN(Number(item))) {
                                    return item;
                                } else {
                                    return Number(item);
                                }
                            });
                            return obj[prop].call(this, ...stringToNumberPs, e);

                            // return;
                        }
                    }

                    return obj[prop].call(this, e);
                };
            }
            return Reflect.get(obj, prop);
        },
    });

    return Page(p);
};

export const ppRef = (data) => {
    return pp({ value: data }, { isRef: true });
};
export const pComputed = (cb) => {
    const p = new Proxy(
        { value: cb() },
        {
            get(target, p) {
                if (p == '__is_p_ref') {
                    return true;
                }
                if (p == '__is_target') {
                    return cb;
                }
                if (p == 'value') {
                    return cb();
                }
                return Reflect.get(target, p);
            },
        }
    );
    watchEffect(() => {
        p.value = cb();
        if (uiThis) {
            let path = `${targetNameSpaceMap.get(cb)}`;
            uiThis.setData({ [path]: cb() });
        }
    });

    return p;
};
