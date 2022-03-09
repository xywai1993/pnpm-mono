interface goToParams {
    /**
     * 1 navigateTo 跳转页面 2 redirectTo 关闭当前页面跳转 3 reLaunch 关闭所有页面跳转，4 navigateBack
     */
    type?: 1 | 2 | 3 | 4;
    package?: 'packageb' | 'packagec';
}
// type testUrl<T> = T extends [1, 2, 3] ? T : T;
export declare function goTo(url: string | -1, query?: object, params?: goToParams): void;

export declare function setUrlQuery(url: string, obj: object): string;

export declare function setSceneQuery(obj: object): string;

export declare function parseScene(_sence1: string): any;

export declare function getByteLen(str: string): number;

export declare function truncationFont(str: string, num: number, showEllipsis?: boolean): string;

/**
 * 倒计时
 * @param {Number} times 秒
 * @param {Function} callback
 * @param {Function} endCallBack
 */
export declare function countDown(times: number, callback: Function, endCallBack: Function): void;

/**
 * 格式化日期
 * @param d  日期时间戳或者日期字符串 2021-10-06 ,时间戳为毫秒
 * @param {string} fmt   格式化的格式 默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string}  格式化后的时间
 */
export declare function formatDate(d: string | number, fmt?: string): string;

// export declare function showToast(title: string, duration?: number): void;

// export declare function toggleLoading(key: 0 | 1, params: { mask?: true }): Promise<any>;

// export declare function setStorageSync(key: string, value: string): void;

// export declare function getStorageSync(key: string): string;

export declare function getCurrentPageUrl(): { url: string; options: object };

// export declare function previewImage(urls: string[], current: string): void;
