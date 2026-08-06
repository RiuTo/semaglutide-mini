var injectStore = require('../../storage/injectStore.js')

Page({
  data: {
    planType: 'weight'
  },

  onLoad: function () {
    var plan = injectStore.getPlan()
    var planType = plan.planType || 'weight'

    this.setData({
      planType: planType
    })
  },

  onBack: function () {
    wx.navigateBack()
  },

  onSelectPlanType: function (e) {
    var type = e.currentTarget.dataset.type
    this.setData({
      planType: type
    })
  },

  onSave: function () {
    var that = this
    var plan = injectStore.getPlan()
    plan.planType = this.data.planType
    injectStore.savePlan(plan)

    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1200
    })

    setTimeout(function () {
      wx.navigateBack()
    }, 1200)
  }
})
