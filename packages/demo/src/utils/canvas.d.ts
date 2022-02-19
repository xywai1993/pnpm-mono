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
          position: { x: number; y: number };
      }
    | { type: 'img'; url: string; position: { x: number; y: number; w: number; h: number } }
    | { type: 'imgFill'; url: string; position: { x: number; y: number; w: number; h: number } }
    | { type: 'function'; fn: (ctx: CanvasRenderingContext2D) => void }
    | { type: 'qr'; url: string; position: { x: number; y: number; w: number } }
];

interface other {
    width: number;
    height: number;
    bgColor?: '#ffffff' | string;
    canvasId?: string | 'previewCanvas';
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
