var injectStore = require('./storage/injectStore.js')

App({
  globalData: {
    // 订阅消息模板ID
    // 在微信公众平台 → 订阅消息 → 公共模板库中申请，将获取到的模板ID填入此处
    // 例如：subscribeTemplateId: 'AbC123XYZ...'
    subscribeTemplateId: 'KyYLBj_C0o0hs0RFODgG5SoczHFZlTgdzc9FFOX35EA',
    // 云开发环境ID（在云开发控制台获取）
    cloudEnvId: 'cloud1-d2gt3y07bd1c25a49' // 请填写你的云开发环境ID
  },
  onLaunch: function () {
    console.log('App Launch')
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: this.globalData.cloudEnvId || undefined,
        traceUser: true
      })
      console.log('云开发初始化成功')
    } else {
      console.warn('请使用 2.2.3 或以上的基础库以使用云能力')
    }
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },

  /**
   * 检查是否已初始化
   * 返回 true 表示已初始化
   * 返回 false 表示未初始化
   */
  checkInitialized: function () {
    return !injectStore.isFirstLaunch()
  },

  /**
   * 获取用户openid（云开发环境）
   */
  getOpenid: function () {
    return wx.cloud.getOpenId() || ''
  }
})