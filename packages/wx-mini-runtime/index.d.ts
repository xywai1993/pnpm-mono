export declare function pp<T extends object>(obj: T): T;
export declare function ppRef<T>(target: T): { value: T };
export declare function pComputed(cb: Function): {
    value: any;
};
export declare const onPageLoad: (cb: Function) => void;

type pageLife =
    | 'onLoad'
    | 'onUnload'
    | 'onReady'
    | 'onShow'
    | 'onHide'
    | 'onShareAppMessage'
    | 'onResize'
    | 'onTabItemTap'
    | 'onShareTimeline'
    | 'onAddToFavorites'
    | 'onPageScroll'
    | 'onPullDownRefresh';
export declare const onPageLifetimes: (name: pageLife, cb: Function) => void;

/**
 * 需返回模板中要用到的数据
 */
type setupCallback = () => object;
export declare const setup: (callback: setupCallback) => void;

export declare const watchEffect: (cb: Function) => void;
