export as namespace drawImage;

type arr = [
    | {
          type: 'text';
          content: string;
          align?: 'left' | 'center' | 'right';
          lineHeight?: number;
          font?: string;
          fontSize?: string;
          fontFamily?: string;
          fontBold?: string;
          fillColor?: string;
          maxWidth?: number;
          position: { x: number; y: number } | number[];
      }
    | {
          type: 'img';
          url: string;
          position: { x: number; y: number; w: number; h: number } | number[];
          /**
           * 绘制模式， 按width等比缩放，按height等比缩放，none，直接绘制
           */
          mode: 'width' | 'height' | 'none';
      }
    | { type: 'imgFill'; url: string; position: { x: number; y: number; w: number; h: number } | number[] }
    | { type: 'function'; fn: (ctx: CanvasRenderingContext2D) => void }
    | { type: 'qr'; url: string; position: { x: number; y: number; w: number } | number[] }
    | {
          /**
           * 圆角矩形
           */
          type: 'roundRect';
          position: { x: number; y: number; w: number; h: number } | number[];
          fillColor?: string;
          radius: number | [number, number, number, number];
      }
    | {
          /**
           * 圆角矩形图片
           */
          type: 'roundRectImg';
          url: string;
          position: { x: number; y: number; w: number; h: number } | number[];
          /**
           * 右上，右下，左下，左上
           */
          radius: number | [number, number, number, number];
      }
];

interface other {
    width: number;
    height: number;
    bgColor?: '#ffffff' | string;
    canvasId?: string | 'previewCanvas';
    /**
     * 组件上下文，即this
     */
    componentContext?: null | any;
}

// interface cb {
//     (url: string): void;
// }
type url = string;
// interface drawFun {
//     (data: arr, otherData: other): Promise<url>;
// }
// export declare const drawImage: drawFun;

export function drawImage(data: arr, otherData: other): Promise<url>;

/**
 *
 * @param id canvas id
 * @param context 页面或组件上下文this， 当为页面时可忽略
 */
export function getCanvas(id: string, context?: any): Promise<object>;

export function getImageInfo(url: string, canvas: object): Promise<{ width: number; height: number; path: object }>;
