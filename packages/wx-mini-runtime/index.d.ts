export declare function pp(
    obj: any,
    opt?: {
        isRef: boolean;
    }
): any;
export declare const ppRef: (target: T) => T;
export declare function pComputed(cb: any): {
    value: any;
};
export declare const onPageLoad: (cb: Function) => void;

type pageLife =
    | 'onUnload'
    | 'onLoad'
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
export declare const setup: (callback: Function) => void;
