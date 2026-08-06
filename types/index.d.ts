declare interface IAppOption {
  globalData: {
    [key: string]: any
  }
}

declare const App: (options: WechatMiniprogram.App.Options) => void
declare const Page: (options: WechatMiniprogram.Page.Options<any, any>) => void
declare const Component: (options: WechatMiniprogram.Component.Options<any, any, any>) => void
declare const getApp: () => IAppOption
declare const getCurrentPages: () => WechatMiniprogram.Page.Instance<any, any>[]

declare namespace wx {
  function getStorageSync(key: string): any
  function setStorageSync(key: string, data: any): void
  function removeStorageSync(key: string): void
  function showToast(options: { title: string; icon?: string; duration?: number }): void
  function showModal(options: {
    title: string
    content: string
    success?: (res: { confirm: boolean; cancel: boolean }) => void
    fail?: () => void
    complete?: () => void
  }): void
}
