var storage = require('../../storage/index.js')
var drugCatalog = require('../../logic/drugCatalog.js')

Page({
  data: {
    pens: [],
    currentPenId: ''
  },

  onLoad: function () {
    this.loadPens()
  },

  onShow: function () {
    this.loadPens()
  },

  loadPens: function () {
    var plan = storage.getInjectionPlan()
    var pens = storage.getPens()
    var list = []

    for (var i = 0; i < pens.length; i++) {
      var pen = pens[i]
      var spec = drugCatalog.getDrugSpec(pen.specKey)
      var usedDose = pen.usedDose || 0
      list.push({
        penId: pen.penId,
        drugName: spec ? (spec.drugName + ' ' + spec.brandName) : pen.drug,
        specName: spec ? (spec.totalDose + 'mg / ' + spec.volume + 'ml') : '',
        purchaseDate: pen.purchaseDate,
        price: pen.price || 0,
        totalDose: pen.totalDose,
        usedDose: usedDose,
        remainDose: Math.max(0, pen.totalDose - usedDose),
        status: pen.status,
        isCurrent: pen.penId === (plan ? plan.currentPenId : '')
      })
    }

    list.sort(function (a, b) {
      return new Date(b.purchaseDate) - new Date(a.purchaseDate)
    })

    this.setData({
      pens: list,
      currentPenId: plan ? plan.currentPenId : ''
    })
  },

  onAddPen: function () {
    wx.navigateTo({
      url: '/pages/penAdd/penAdd'
    })
  },

  onTapPen: function (e) {
    var penId = e.currentTarget.dataset.penId
    var pens = this.data.pens
    var targetPen = null
    for (var i = 0; i < pens.length; i++) {
      if (pens[i].penId === penId) {
        targetPen = pens[i]
        break
      }
    }
    if (!targetPen) return
    if (targetPen.status !== 'sealed') return

    var that = this
    wx.showModal({
      title: '启用新笔',
      content: '是否启用这支新笔？启用后当前使用中的笔将标记为已用完。',
      confirmText: '启用',
      success: function (res) {
        if (res.confirm) {
          that.activatePen(penId)
        }
      }
    })
  },

  activatePen: function (newPenId) {
    var plan = storage.getInjectionPlan()
    var pens = plan.pens || []

    for (var i = 0; i < pens.length; i++) {
      if (pens[i].penId === plan.currentPenId) {
        pens[i].status = 'used'
      }
    }

    storage.switchCurrentPen(newPenId)

    wx.showToast({
      title: '已启用新笔',
      icon: 'success'
    })

    this.loadPens()
  },

  onBack: function () {
    wx.navigateBack()
  }
})
