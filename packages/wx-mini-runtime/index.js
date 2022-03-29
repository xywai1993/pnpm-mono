function warn(msg, ...args) {
    console.warn(`[mini-runtime warn] ${msg}`, ...args);
}

const arrFunName = [
    "push",
    "pop",
    "shift",
    "unshift",
    "split",
    "reverse",
    "map",
    "forEach",
    "every",
    "filter",
    "fill",
    "length",
];

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
        get(target, key, receiver) {
            if (key === "__is_p") {
                return true;
            }

            if (key === "__is_target") {
                return target;
            }

            if (key === "__is_p_ref") {
                return params.isRef;
            }

            //tip 数组方法不需要包装响应式
            if (Array.isArray(target) && arrFunName.indexOf(key) !== -1) {
                return Reflect.get(target, key, receiver);
            }

            const value = getDep(target, key).value;

            if (value && typeof value === "object") {
                if (targetNameSpaceMap.has(target)) {
                    targetNameSpaceMap.set(value, `${targetNameSpaceMap.get(target)}.${key}`);
                }
                return pp(value, params);
            } else {
                return value;
            }
        },
        set(target, key, value, receiver) {
            getDep(target, key).value = value;
            if (uiThis && targetNameSpaceMap.has(target)) {
                let path = `${targetNameSpaceMap.get(target)}`;

                // 数组对象特殊处理
                if (Array.isArray(target) && !isNaN(Number(key))) {
                    path = `${path}[${key}]`;
                } else {
                    /**
                     * tip:
                     *  把中间是 ".0." 这样的格式替换为数组格式  "[0]."
                     *  eg: demoRef.value.0.demo ->  demoRef.value[0].demo
                     */
                    const re = /\.(?<num>\d+)\./g;
                    path = `${path}.${key}`.replace(re, "[$<num>].");
                }

                // 如果是ref 对象，自动解包
                if (params.isRef) {
                    const removeValueRe = /\.value/;
                    path = path.replace(removeValueRe, "");
                }
                console.log("setData path-->", path);

                //数组 .length 特殊处理
                if (Array.isArray(target) && key === "length") {
                    const removeLengthRe = /\.length/;
                    path = path.replace(removeLengthRe, "");
                    const _data = uiThis.data[path];
                    _data.length = value;
                    uiThis.setData({ [`${path}`]: _data });
                } else {
                    uiThis.setData({ [`${path}`]: value });
                }
            }

            return Reflect.set(target, key, value);
        },
    });
}

/**
 * 小程序页面生命周期
 */

const onPageLifetimesFnList = {
    onLoad: [],
};
export const onPageLifetimes = (name, cb) => {
    if (typeof cb === "function") {
        if (onPageLifetimesFnList.hasOwnProperty(name)) {
            onPageLifetimesFnList[name].push(cb);
        } else {
            onPageLifetimesFnList[name] = [cb];
        }
    }
};

/**
 * onPageLoad 快捷方式
 *
 */
export const onPageLoad = (cb) => {
    if (typeof cb === "function") {
        onPageLifetimesFnList["onLoad"].push(cb);
    }
};

export const setup = (callback) => {
    const data = callback();
    const wxPage = {
        // tip  @click="show=true" 这种写法将被 编译为 @click="__AssignmentExpression" ,因此预先内置
        __AssignmentExpression: () => {},
        //tip v-model 将被编译为 bindinput="__vModelEventResponses",因此预先内置
        __vModelEventResponses: () => {},
    };

    // 确保onLoad 必定有一个
    if (!onPageLifetimesFnList.onLoad.length) {
        onPageLifetimesFnList.onLoad.push((options) => {});
    }
    for (const [key, value] of Object.entries(onPageLifetimesFnList)) {
        if (key === "onShareAppMessage") {
            wxPage[key] = value[0];
        } else {
            wxPage[key] = function (options) {
                value.forEach((item) => {
                    item.call(this, options);
                });
            };
        }
    }

    const wxData = {};

    Object.entries(data).forEach((val) => {
        if (typeof val[1] === "function") {
            if (val[0] === "onLoad") {
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

    wxPage["data"] = wxData;

    const p = new Proxy(wxPage, {
        get: function (obj, prop) {
            if (prop === "onLoad") {
                return function (e) {
                    uiThis = this;
                    obj[prop].call(this, e);
                };
            }

            if (typeof obj[prop] === "function") {
                return function (e) {
                    /**
                     * tip
                     *  赋能点击事件可以直接赋值操作 eg:  @click="show=true 或 demo.a.b = 3 或 demo[1] = true"
                     *  注意：因为小程序不支持动态执行方法，因此只能做简单的赋值操作，太复杂的不支持
                     */

                    if (prop === "__AssignmentExpression") {
                        const ps = String(e.currentTarget.dataset.eventParams).split(",");

                        let val = ps[1];
                        if (ps[1] === "true") {
                            val = true;
                        } else if (ps[1] === "false") {
                            val = false;
                        }

                        setDataBeforeUser(data, ps[0], val);

                        return;
                    }

                    if (prop === "__vModelEventResponses") {
                        const value = e.detail.value;
                        const ps = String(e.currentTarget.dataset.vmodelParams);

                        setDataBeforeUser(data, ps, value);

                        return;
                    }

                    // tip onUnload 事件不存在 e
                    if (e && e.currentTarget) {
                        if (e.currentTarget.dataset.hasOwnProperty("eventParams")) {
                            const ps = String(e.currentTarget.dataset.eventParams).split(",");

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
                if (p === "__is_p_ref") {
                    return true;
                }
                if (p === "__is_target") {
                    return cb;
                }
                if (p === "value") {
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

/**
 * //在用户之前设置data , 即配合 v-model 之类的做一些快捷操作
 * @param data 页面数据 ----  setup中callback返回的页面数据
 * @param pathParams  数据的路径信息  eg: demoRef.a.b  , demoRef[0] , demoRef
 * @param value 要设置的值   demoRef.a.b = value
 */
function setDataBeforeUser(data, pathParams, value) {
    /**
     * tip:
     *  把中间是  "[0]"  这样的格式替换为点格式 ".0"
     *  eg:   demoRef[0].demo -> demoRef.0.demo
     */
    const re = /\[(?<num>\d+)]/g;
    let path = pathParams.replace(re, ".$<num>");

    //分割"点"（.）路径
    path = path.split(".");

    // 最后一个路径为赋值操作路径
    const last = path.pop();

    let tmp = null;

    // 存在深度路径则依次读取路径数据
    path.forEach((item) => {
        tmp = tmp ? tmp[item] : data[item];
    });

    tmp = tmp ? tmp : data[last];

    if (tmp.__is_p_ref) {
        tmp.value = value;
    } else {
        tmp[last] = value;
    }
}
