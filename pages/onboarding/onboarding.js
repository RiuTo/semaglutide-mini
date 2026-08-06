var injectStore = require('../../storage/injectStore.js')
var drugLogic = require('../../logic/drugCatalog.js')
var drugRule = require('../../logic/drugRule.js')

Page({
  data: {
    currentStep: 0,
    totalSteps: 5,
    steps: [
      { title: '欢迎使用', desc: '' },
      { title: '药物选择', desc: '' },
      { title: '规格选择', desc: '' },
      { title: '当前状态', desc: '' },
      { title: '方案设置', desc: '' }
    ],

    // 步骤2：药物选择
    drugKey: '',
    drugName: '',
    drugList: [],

    // 步骤3：规格选择
    specKey: '',
    specName: '',
    specDisplayName: '',
    specList: [],
    totalDose: 0,
    totalVolume: 0,
    concentration: 0,
    doseOptions: [],

    // 步骤4：是否新拆封
    isNewPen: true,
    usedRecords: [],
    groupedRecords: [],
    selectedDose: 0.25,
    maxUsage: 7,
    remainingPercent: 100,
    remainingValue: 0,

    // 步骤5：方案选择
    planType: 'weight',
    planTypeName: '减重方案',
    startDate: '',
    minDate: '2020-01-01'
  },

  onLoad: function () {
    var today = this.formatDate(new Date())
    this.setData({
      drugList: drugLogic.getDrugTypes(),
      startDate: today,
      minDate: '2020-01-01'
    })
  },

  // 步骤1：开始
  onStart: function () {
    this.setData({
      currentStep: 1
    })
  },

  // 步骤2：选择药物
  onSelectDrug: function (e) {
    var drugKey = e.currentTarget.dataset.key
    var drugTypes = drugLogic.getDrugTypes()
    var selectedDrug = null
    for (var i = 0; i < drugTypes.length; i++) {
      if (drugTypes[i].type === drugKey) {
        selectedDrug = drugTypes[i]
        break
      }
    }
    var specList = drugLogic.getSpecsByDrugType(drugKey)
    var maxUsage = drugRule.getMaxUsage(drugKey)

    this.setData({
      drugKey: drugKey,
      drugName: selectedDrug ? (selectedDrug.brandName || selectedDrug.drugName) : '',
      specList: specList,
      specKey: '',
      specName: '',
      totalDose: 0,
      doseOptions: [],
      usedRecords: [],
      maxUsage: maxUsage
    })
  },

  // 步骤3：选择规格
  onSelectSpec: function (e) {
    var specKey = e.currentTarget.dataset.key
    var spec = drugLogic.getDrugSpec(specKey)

    // 根据药物类型使用固定剂量选项
    var doseOptions = []
    if (this.data.drugKey === 'semaglutide_nht') {
      doseOptions = [0.25, 0.5, 0.75, 1]
    } else if (this.data.drugKey === 'semaglutide_nhy') {
      doseOptions = [0.25, 0.5, 0.75, 1, 1.7, 2.4]
    } else if (this.data.drugKey === 'tirzepatide') {
      doseOptions = [2.5, 5, 7.5, 10]
    } else {
      doseOptions = spec.doses && spec.doses.length > 0 ? spec.doses : [1]
    }

    var firstDose = doseOptions.length > 0 ? doseOptions[0] : 0

    // 规格显示名称
    var specDisplayName = ''
    if (this.data.drugKey === 'tirzepatide') {
      specDisplayName = spec.volume + ' mL:' + spec.totalDose + ' mg'
    } else {
      specDisplayName = spec.concentration + 'mg/ml，' + spec.volume + 'ml' + spec.form
    }

    this.setData({
      specKey: specKey,
      specName: specDisplayName,
      specDisplayName: specDisplayName,
      totalDose: spec.totalDose,
      totalVolume: spec.volume,
      concentration: spec.concentration || 0,
      doseVolume: spec.doseVolume || 0,
      doseOptions: doseOptions,
      selectedDose: firstDose,
      usedRecords: [],
      remainingValue: spec.totalDose,
      remainingPercent: 100
    })
  },

  // 步骤4：是否新拆封
  onNewPenChange: function (e) {
    var isNew = e.currentTarget.dataset.value === 'true'

    this.setData({
      isNewPen: isNew,
      usedRecords: [],
      remainingValue: this.data.totalDose,
      remainingPercent: 100
    })
  },

  // 步骤4：选择剂量
  onSelectDose: function (e) {
    var dose = parseFloat(e.currentTarget.dataset.dose)
    this.setData({
      selectedDose: dose
    })
  },

  // 分组统计记录
  groupRecords: function (records) {
    var groups = {}
    for (var i = 0; i < records.length; i++) {
      var dose = records[i].dose
      if (!groups[dose]) {
        groups[dose] = { dose: dose, count: 0, ids: [] }
      }
      groups[dose].count++
      groups[dose].ids.push(records[i].id)
    }
    var result = []
    for (var key in groups) {
      result.push(groups[key])
    }
    return result
  },

  // 步骤4：添加使用记录
  onAddRecord: function () {
    if (this.data.usedRecords.length >= this.data.maxUsage) {
      wx.showToast({
        title: '超过最大使用次数',
        icon: 'none'
      })
      return
    }

    var totalUsed = 0
    for (var i = 0; i < this.data.usedRecords.length; i++) {
      totalUsed += this.data.usedRecords[i].dose
    }

    var remaining = this.data.totalDose - totalUsed
    if (this.data.selectedDose > remaining + 0.001) {
      wx.showToast({
        title: '剩余剂量不足',
        icon: 'none'
      })
      return
    }

    var records = this.data.usedRecords.slice()
    records.unshift({
      id: Date.now(),
      dose: this.data.selectedDose
    })

    var newRemaining = this.data.totalDose - totalUsed - this.data.selectedDose
    if (newRemaining < 0) newRemaining = 0
    var newPercent = this.data.totalDose > 0
      ? Math.floor((newRemaining / this.data.totalDose) * 100)
      : 0

    this.setData({
      usedRecords: records,
      groupedRecords: this.groupRecords(records),
      remainingValue: newRemaining,
      remainingPercent: newPercent
    })
  },

  // 步骤4：删除使用记录
  onRemoveRecord: function (e) {
    var dose = parseFloat(e.currentTarget.dataset.dose)
    var records = this.data.usedRecords.slice()
    for (var i = 0; i < records.length; i++) {
      if (records[i].dose === dose) {
        records.splice(i, 1)
        break
      }
    }

    var totalUsed = 0
    for (var j = 0; j < records.length; j++) {
      totalUsed += records[j].dose
    }

    var newRemaining = this.data.totalDose - totalUsed
    if (newRemaining < 0) newRemaining = 0
    var newPercent = this.data.totalDose > 0
      ? Math.floor((newRemaining / this.data.totalDose) * 100)
      : 0

    this.setData({
      usedRecords: records,
      groupedRecords: this.groupRecords(records),
      remainingValue: newRemaining,
      remainingPercent: newPercent
    })
  },

  // 步骤5：方案选择
  onSelectPlan: function (e) {
    var type = e.currentTarget.dataset.type
    var name = type === 'weight' ? '减重方案' : '糖尿病方案'
    this.setData({
      planType: type,
      planTypeName: name
    })
  },

  onDateChange: function (e) {
    this.setData({
      startDate: e.detail.value
    })
  },

  // 下一步
  onNext: function () {
    var currentStep = this.data.currentStep

    // 验证
    if (currentStep === 1 && !this.data.drugKey) {
      wx.showToast({
        title: '请选择药物',
        icon: 'none'
      })
      return
    }
    if (currentStep === 2 && !this.data.specKey) {
      wx.showToast({
        title: '请选择规格',
        icon: 'none'
      })
      return
    }
    if (currentStep === 3 && !this.data.isNewPen && this.data.usedRecords.length === 0) {
      wx.showToast({
        title: '请添加使用记录',
        icon: 'none'
      })
      return
    }

    if (currentStep < 4) {
      this.setData({
        currentStep: currentStep + 1
      })
    }
  },

  // 上一步
  onPrev: function () {
    var currentStep = this.data.currentStep
    if (currentStep <= 0) return

    var data = {}

    if (currentStep === 3) {
      data.isNewPen = true
      data.usedRecords = []
      data.groupedRecords = []
      data.selectedDose = this.data.doseOptions.length > 0 ? this.data.doseOptions[0] : 0.25
      data.remainingValue = this.data.totalDose
      data.remainingPercent = 100
    } else if (currentStep === 2) {
      data.specKey = ''
      data.specName = ''
      data.specDisplayName = ''
      data.totalDose = 0
      data.totalVolume = 0
      data.concentration = 0
      data.doseOptions = []
      data.isNewPen = true
      data.usedRecords = []
      data.groupedRecords = []
      data.selectedDose = 0.25
      data.remainingValue = 0
      data.remainingPercent = 100
    } else if (currentStep === 1) {
      data.drugKey = ''
      data.drugName = ''
      data.specKey = ''
      data.specName = ''
      data.specDisplayName = ''
      data.totalDose = 0
      data.totalVolume = 0
      data.concentration = 0
      data.doseOptions = []
      data.isNewPen = true
      data.usedRecords = []
      data.groupedRecords = []
      data.selectedDose = 0.25
      data.remainingValue = 0
      data.remainingPercent = 100
    }

    data.currentStep = currentStep - 1
    this.setData(data)
  },

  // 完成
  onComplete: function () {
    var that = this

    // 初始化注射计划
    var plan = injectStore.initPlan(
      this.data.planType,
      this.data.startDate,
      {
        drug: this.data.drugKey,
        penSize: this.data.totalDose,
        isNewPen: this.data.isNewPen,
        specKey: this.data.specKey,
        usedDose: this.data.totalDose - this.data.remainingValue
      }
    )

    // 同步写入 initialized 状态
    wx.setStorageSync('injection_initialized', true)

    wx.showToast({
      title: '初始化完成',
      icon: 'success',
      duration: 1500
    })

    setTimeout(function () {
      wx.reLaunch({
        url: '/pages/home/home'
      })
    }, 1500)
  },

  formatDate: function (date) {
    var year = date.getFullYear()
    var month = String(date.getMonth() + 1).padStart(2, '0')
    var day = String(date.getDate()).padStart(2, '0')
    return year + '-' + month + '-' + day
  }
})