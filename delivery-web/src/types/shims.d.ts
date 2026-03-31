declare module 'react' {
  export type FormEvent<T = any> = any;
  export type ChangeEvent<T = any> = any;
  export function useState<T>(initialState: T): [T, (value: T | ((previous: T) => T)) => void];
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'zustand' {
  export type SetState<T> = (
    partial: Partial<T> | ((state: T) => Partial<T>),
    replace?: boolean,
  ) => void;

  export type StateCreator<T> = (set: SetState<T>, get: () => T, api: any) => T;

  export function create<T>(initializer: StateCreator<T>): any;
}

declare module 'zustand/middleware' {
  export function persist<T>(initializer: import('zustand').StateCreator<T>, options: any): import('zustand').StateCreator<T>;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elementName: string]: any;
  }
}
