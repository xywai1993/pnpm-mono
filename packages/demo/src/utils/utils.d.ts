interface goToParams {
    type?: 1 | 2 | 3;
    package?: 'packageb' | 'packagec';
}
// type testUrl<T> = T extends [1, 2, 3] ? T : T;
export declare function goTo(url: string, query?: object, params?: goToParams): void;

export declare function showToast(title: string, duration?: number): void;

export declare function parseScene(_sence1: string): any;

export declare function toggleLoading(key: 0 | 1, params: { mask?: true }): Promise<any>;

export declare function setUrlQuery(url: string, obj: object): string;

export declare function setStorageSync(key: string, value: string): void;

export declare function getStorageSync(key: string): string;
