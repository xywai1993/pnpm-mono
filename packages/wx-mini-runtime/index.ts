function warn(msg, ...args) {
    console.warn(`[mini-runtime warn] ${msg}`, ...args);
}
let activeEffect: null | Function; //依赖搜集
class Dep {
    subscribers: Set<Function>;
    constructor() {
        this.subscribers = new Set();
    }
    depend(cb) {
        if (activeEffect) {
            this.subscribers.add(activeEffect);
        }
        if (cb) {
            this.subscribers.add(cb);
        }
    }
    notify(p, value) {
        this.subscribers.forEach((effect) => effect(p, value));
    }
}
function watchEffect(effect: Function) {
    activeEffect = effect;
    effect();
    activeEffect = null;
}
// 递归代理
const deepProxy = (target, handler) => {
    Object.entries(target).forEach((val) => {
        if (typeof val[1] === 'object' && val[1] !== null) {
            target[val[0]] = deepProxy(val[1], handler);
        }
    });
    return new Proxy(target, handler);
};
export function pp(obj, opt = { isRef: false }) {
    const dep = new Dep();
    const handler = {
        get(target, p) {
            dep.depend();
            if (p == '__is_p') {
                return true;
            }
            if (p == '__is_p_ref') {
                return opt.isRef;
            }
            if (p === '__raw_target') {
                return target;
            }
            return Reflect.get(target, p);
        },
        set(target, p, value) {
            console.log(target, p);
            let path = p;
            let name = '';
            if (targetMap.has(target)) {
                const mapData = targetMap.get(target);
                name = mapData.join('');
            }
            // ref 自动解包
            if (opt.isRef && p === 'value') {
                path = `${name}`;
            } else {
                path = `${name}${p}`;
            }
            if (typeof value == 'object' && value !== null) {
                Reflect.set(target, p, new Proxy(value, handler));
            } else {
                Reflect.set(target, p, value);
                if (Array.isArray(target) && p !== 'length') {
                    // tip 使用push等数组方法时，JavaScript语言会会自动处理 length
                    path = `${name}[${p}]`;
                }
            }
            dep.notify(path, value);
            return true;
        },
    };
    return deepProxy(obj, handler);
}
export const ppRef = (target) => {
    return pp({ value: target }, { isRef: true });
};
export function pComputed(cb) {
    watchEffect(cb);
    return new Proxy(
        { value: cb() },
        {
            get(target, p) {
                const val = cb();
                if (p === '__is_computed') {
                    return true;
                }
                if (p === '__raw_target') {
                    return target;
                }
                if (p === 'value') {
                    return val;
                }
                return Reflect.get(target, p);
            },
            set(target, p, value) {
                warn(`${p}属性只读`);
                return true;
            },
        }
    );
}
const onLoadFnList = [];
export const onPageLoad = (cb) => {
    if (typeof cb === 'function') {
        onLoadFnList.push(cb);
    }
};
const targetMap = new WeakMap();
// 收集setData对象路径
const collectDeepData = (target, name, parent = []) => {
    if (target !== null && target.__is_p) {
        const pN = [...parent];
        let nameStr = Number.isNaN(Number(name)) ? `${name}.` : `[${Number(name)}].`;
        // tip   setData时 ppRef 对象路径自动解包 ，配合 tip1
        if (name === 'value' && target.__is_p_ref) {
            nameStr = '';
        }
        pN.push(nameStr);
        targetMap.set(target.__raw_target, pN);
        Object.entries(target).forEach((val) => {
            collectDeepData(val[1], val[0], pN);
        });
    }
};
export const setup = (callback) => {
    onLoadFnList.length = 0;
    let uiThis = null;
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
        } else if (val[1].__is_computed) {
            wxData[val[0]] = val[1].value;
            console.log('是computed');
            watchEffect(() => {
                // console.log('执行这里嘛', val[1].value);
                val[1].value;
                if (uiThis) {
                    uiThis.setData({ [`${val[0]}`]: val[1].value });
                }
            });
        } else {
            collectDeepData(val[1], val[0]);
            // tip1. wxml 内自动解包
            if (val[1].__is_p_ref) {
                wxData[val[0]] = val[1].value;
            } else {
                wxData[val[0]] = val[1];
            }
            // 界面实际更新
            watchEffect((p, value) => {
                val[1].__raw_target;
                if (uiThis) {
                    uiThis.setData({ [`${p}`]: value });
                }
            });
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
                    // 解决点击事件可以直接赋值操作 eg:  @click="show=true"
                    // tip注意：因为小程序不支持动态执行方法，因此只能做简单的赋值操作，太复杂的不支持
                    if (prop === '__AssignmentExpression') {
                        const ps = String(e.currentTarget.dataset.eventParams).split(',');
                        console.log('表达式', ps);
                        const path = ps[0].split('.');
                        const last = path.pop();
                        let tmp = null;
                        let val = ps[1];
                        if (ps[1] === 'true') {
                            val = true;
                        } else if (ps[1] === 'false') {
                            val = false;
                        }
                        path.forEach((item) => {
                            tmp = data[item];
                        });
                        tmp = tmp ? tmp[last] : data[last];
                        if (tmp.__is_p_ref) {
                            tmp.value = val;
                        } else {
                            tmp = val;
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
                            obj[prop].call(this, ...stringToNumberPs, e);
                            return;
                        }
                    }
                    obj[prop].call(this, e);
                };
            }
            return Reflect.get(obj, prop);
        },
    });
    return Page(p);
};
// export const comSetup = (callback) => {
//     const properties = {};
//     const pageLifetimes = {};
//     const defineProperties = (obj) => {
//         Object.entries(obj).forEach((val) => {
//             properties[val[0]] = val[1];
//         });
//     };
//     const definePageLifetimes = (obj) => {
//         Object.entries(obj).forEach((val) => {
//             pageLifetimes[val[0]] = val[1];
//         });
//     };
//     const data = callback({ defineProperties, definePageLifetimes });
//     const wxPage = {
//         ready: () => {},
//         methods: {},
//         properties,
//         pageLifetimes,
//     };
//     const wxData = {};
//     let uiThis = null;
//     Object.entries(data).forEach((val) => {
//         if (val[1].__v_isRef) {
//             wxData[val[0]] = val[1].value;
//             // todo:
//             // effect(() => {
//             //     // 必须在这里取值操作，因为uiThis 可能为空，后续将不会执行effect
//             //     const v = val[1].value;
//             //     if (uiThis) {
//             //         console.log('执行setData');
//             //         uiThis.setData({ [val[0]]: v });
//             //     }
//             // });
//         } else if (typeof val[1] === 'function') {
//             wxPage.methods[val[0]] = val[1];
//         }
//     });
//     wxPage['data'] = wxData;
//     const p = new Proxy(wxPage, {
//         get: function (obj, prop) {
//             if (prop === 'ready') {
//                 return function (e) {
//                     uiThis = this;
//                     obj[prop].call(e);
//                 };
//             }
//             if (typeof obj[prop] === 'function') {
//                 return function (e) {
//                     if (e.currentTarget) {
//                         if (e.currentTarget.dataset.hasOwnProperty('eventParams')) {
//                             const ps = String(e.currentTarget.dataset.eventParams).split(',');
//                             obj[prop].call(this, ...ps, e);
//                             // return Reflect.get(obj, prop, Object.assign({}, ...ps, ...arguments));
//                             return;
//                         }
//                     }
//                     obj[prop].call(this, e);
//                 };
//             }
//             return Reflect.get(obj, prop);
//         },
//     });
//     return Component(p);
// };
