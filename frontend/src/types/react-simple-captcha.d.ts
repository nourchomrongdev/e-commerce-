declare module "react-simple-captcha" {
  export function loadCaptchaEnginge(length: number, backgroundColor?: string, fontColor?: string, characterSet?: string): void;
  export function validateCaptcha(value: string, reload?: boolean): boolean;
  export function LoadCanvasTemplate(props?: { reloadText?: string; reloadColor?: string }): JSX.Element;
}