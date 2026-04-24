declare module 'quasar/wrappers' {
  export function configure(callback: (...args: any[]) => any): any;
  export function route(callback: (...args: any[]) => any): any;
  export function store(callback: (...args: any[]) => any): any;
}
