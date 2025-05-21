declare module 'react-color' {
  import { FC } from 'react';

  export interface ColorResult {
    hex: string;
    rgb: { r: number; g: number; b: number; a: number };
    hsl: { h: number; s: number; l: number; a: number };
  }

  export interface ChromePickerProps {
    color?: string;
    onChange?: (color: ColorResult) => void;
    onChangeComplete?: (color: ColorResult) => void;
  }

  export const ChromePicker: FC<ChromePickerProps>;
}
