var reminderStorage = require('../../storage/reminder.js')
var notify = require('../../services/notify.js')
var injectStorage = require('../../storage/injectStore.js')

Page({
  data: {
    enabled: false,
    time: '20:00',
    advance: 30,
    advanceOptions: [0, 10, 15, 30, 45, 60],
    advanceIndex: 3,
    subscribed: false
  },

  onLoad: function () {
    this.loadConfig()
  },

  onShow: function () {
    this.loadConfig()
  },

  loadConfig: function () {
    var config = reminderStorage.getReminder()
    var advanceOptions = this.data.advanceOptions
    var advanceIndex = advanceOptions.indexOf(config.advance)
    if (advanceIndex < 0) {
      advanceIndex = 3
    }

    this.setData({
      enabled: config.enabled,
      time: config.time,
      advance: config.advance,
      advanceIndex: advanceIndex,
      subscribed: config.subscribed || false
    })
  },

  onSwitchChange: function () {
    this.setData({
      enabled: !this.data.enabled
    })
  },

  onTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  },

  onAdvanceChange: function (e) {
    var index = parseInt(e.detail.value)
    this.setData({
      advanceIndex: index,
      advance: this.data.advanceOptions[index]
    })
  },

  onSubscribe: function () {
    var that = this
    wx.vibrateShort({ type: 'light' })
    this.doSubscribe(function () {})
  },

  doSubscribe: function (callback) {
    var that = this
    notify.requestSubscribe(function (success, message) {
      if (success) {
        that.setData({
          subscribed: true
        })
      }
      if (callback) callback(success, message)
    })
  },

  onSave: function () {
    var that = this
    var data = this.data

    // 开启提醒且未订阅 → 请求订阅授权
    if (data.enabled && !data.subscribed) {
      this.doSubscribe(function (success) {
        that.saveReminder(success)
      })
      return
    }

    // 关闭提醒 → 直接保存，无需取消订阅（微信无取消API）
    // 开启提醒且已订阅 → 直接保存
    this.saveReminder(data.subscribed)
  },

  saveReminder: function (subscribed) {
    var that = this
    var data = this.data
    var plan = injectStorage.getPlan() || {}

    var enabled = data.enabled
    var finalSubscribed = subscribed !== undefined ? subscribed : data.subscribed

    // 关闭提醒时，subscribed保持不变，enabled设为false
    if (!enabled) {
      finalSubscribed = data.subscribed
    }

    // 保存到本地
    var success = reminderStorage.saveReminder({
      enabled: enabled,
      time: data.time,
      advance: data.advance,
      subscribed: finalSubscribed
    })

    if (success) {
      // 同步到云数据库
      notify.syncReminderToCloud({
        enabled: enabled,
        subscribed: finalSubscribed,
        nextInjectionDate: plan.nextInjectionDate || '',
        drugName: plan.drugName || '司美格鲁肽',
        dose: plan.currentDose ? plan.currentDose + 'mg' : '0.25mg',
        reminderTime: data.time
      }).then(function () {
        console.log('[reminder] 同步配置到云数据库成功')
      }).catch(function (err) {
        console.error('[reminder] 同步配置失败:', err)
      })

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      setTimeout(function () {
        wx.navigateBack()
      }, 1000)
    } else {
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  onBack: function () {
    wx.navigateBack()
  }
})
