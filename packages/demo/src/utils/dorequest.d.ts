/**
 * @author yiper.fan
 * @update 2021年02月02日14:14:54
 */

// export as namespace httpRequest;
export interface requestOptions {
    url: string;
    method: 'post' | 'get' | string;
    data?: object;
    catch?: boolean;
    original?: 1 | 2 | 3;
    need_token?: boolean;
    host?: string;
    header?: object;
}

export function httpRequest<T>(obj: requestOptions): Promise<T>;

export namespace httpRequest {
    function post<T>(url: string, body: object, other?: requestOptions): Promise<T>;
    function get<T>(url: string, query: object, other?: requestOptions): Promise<T>;
}
