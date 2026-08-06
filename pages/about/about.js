var config = require('../../config/index.js')

Page({
  data: {
    version: '',
    buildDate: '',
    fullVersion: '',
    env: '',
    features: [],
    changelog: []
  },

  onLoad: function () {
    this.loadVersionInfo()
  },

  loadVersionInfo: function () {
    this.setData({
      version: config.getVersion(),
      buildDate: config.getBuildDate(),
      fullVersion: config.getFullVersion(),
      env: config.getEnv(),
      features: config.getFeatures(),
      changelog: config.getChangelog()
    })
  },

  onBack: function () {
    wx.navigateBack()
  },

  onCopyVersion: function () {
    wx.setClipboardData({
      data: this.data.fullVersion,
      success: function () {
        wx.showToast({
          title: '已复制版本号',
          icon: 'success'
        })
      }
    })
  }
})