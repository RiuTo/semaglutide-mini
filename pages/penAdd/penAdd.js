var drugCatalog = require('../../logic/drugCatalog.js')
var storage = require('../../storage/index.js')

Page({
  data: {
    drugTypes: [],
    drugKey: '',
    specs: [],
    specKey: '',
    totalDose: 0,
    purchaseDate: '',
    price: '',
    minDate: '2020-01-01'
  },

  onLoad: function () {
    var drugTypes = drugCatalog.getDrugTypes()
    var today = this.formatDate(new Date())
    var defaultDrug = drugTypes.length > 0 ? drugTypes[0].type : ''
    var specs = defaultDrug ? drugCatalog.getSpecsByDrugType(defaultDrug) : []
    var defaultSpec = specs.length > 0 ? specs[0].id : ''
    var defaultTotalDose = specs.length > 0 ? specs[0].totalDose : 0

    this.setData({
      drugTypes: drugTypes,
      drugKey: defaultDrug,
      specs: specs,
      specKey: defaultSpec,
      totalDose: defaultTotalDose,
      purchaseDate: today
    })
  },

  onDrugSelect: function (e) {
    var drugKey = e.currentTarget.dataset.key
    var specs = drugCatalog.getSpecsByDrugType(drugKey)
    var defaultSpec = specs.length > 0 ? specs[0].id : ''
    var defaultTotalDose = specs.length > 0 ? specs[0].totalDose : 0

    this.setData({
      drugKey: drugKey,
      specs: specs,
      specKey: defaultSpec,
      totalDose: defaultTotalDose
    })
  },

  onSpecSelect: function (e) {
    var specKey = e.currentTarget.dataset.key
    var spec = drugCatalog.getDrugSpec(specKey)
    this.setData({
      specKey: specKey,
      totalDose: spec ? spec.totalDose : 0
    })
  },

  onDateChange: function (e) {
    this.setData({
      purchaseDate: e.detail.value
    })
  },

  onPriceInput: function (e) {
    this.setData({
      price: e.detail.value
    })
  },

  onSave: function () {
    var specKey = this.data.specKey
    var purchaseDate = this.data.purchaseDate
    var price = parseFloat(this.data.price) || 0

    if (!specKey) {
      wx.showToast({ title: '请选择规格', icon: 'none' })
      return
    }

    if (!purchaseDate) {
      wx.showToast({ title: '请选择购买日期', icon: 'none' })
      return
    }

    var spec = drugCatalog.getDrugSpec(specKey)
    if (!spec) {
      wx.showToast({ title: '规格无效', icon: 'none' })
      return
    }

    storage.addPen({
      drug: spec.type,
      specKey: specKey,
      purchaseDate: purchaseDate,
      price: price,
      totalDose: spec.totalDose
    })

    wx.showToast({
      title: '新笔已添加',
      icon: 'success',
      duration: 1500
    })

    setTimeout(function () {
      wx.navigateBack()
    }, 1500)
  },

  onBack: function () {
    wx.navigateBack()
  },

  formatDate: function (date) {
    var year = date.getFullYear()
    var month = String(date.getMonth() + 1).padStart(2, '0')
    var day = String(date.getDate()).padStart(2, '0')
    return year + '-' + month + '-' + day
  }
})
