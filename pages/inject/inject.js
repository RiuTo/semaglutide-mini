var logic = require('../../logic/index.js')
var rotate = require('../../logic/rotate.js')
var storage = require('../../storage/index.js')
var drug = require('../../logic/drugCatalog.js')
var pen = require('../../logic/pen.js')
var notify = require('../../services/notify.js')

var PRESET_SITES = ['腹左', '腹右', '腿左', '腿右', '臂左', '臂右']

Page({
  data: {
    // 日期
    injectDate: '',
    minDate: '2020-01-01',
    maxDate: '',

    // 剂量
    dose: '',
    doseDisplay: '',
    doseOptions: [],

    // 部位
    site: '',
    siteDisplay: '',
    isSiteCustom: false,

    // 剩余剂量
    remainDose: 0,
    penSize: 0,

    // 备注
    note: '',

    // 预设选项
    presetSites: PRESET_SITES,

    // 笔选择弹窗
    showPenPicker: false,
    availablePens: [],
    selectedPenId: ''
  },

  onLoad: function () {
    var today = this.formatDate(new Date())
    this.setData({
      injectDate: today,
      maxDate: today
    })
    this.refreshPageData()
  },

  onShow: function () {
    this.refreshPageData()
  },

  refreshPageData: function () {
    var plan = logic.getCurrentPlan()
    var drugType = plan.drug || 'semaglutide_nht'
    var doseOptions = drug.getDosesByDrugType(drugType)

    var currentDose = plan.currentDose || doseOptions[0]

    var remain = pen.getRemainDose(plan)

    this.setData({
      doseOptions: doseOptions,
      dose: currentDose,
      doseDisplay: currentDose.toString(),
      remainDose: remain.remainDose,
      penSize: plan.penSize || 0
    })
  },

  // 日期选择
  onDateChange: function (e) {
    var selectedDate = e.detail.value
    var today = this.formatDate(new Date())

    if (selectedDate > today) {
      wx.showToast({
        title: '注射日期不能晚于今天',
        icon: 'none'
      })
      return
    }

    this.setData({
      injectDate: selectedDate
    })
  },

  // 剂量选择
  onDoseSelect: function (e) {
    var index = parseInt(e.currentTarget.dataset.index)
    var dose = this.data.doseOptions[index]
    this.setData({
      dose: dose,
      doseDisplay: dose.toString()
    })
  },

  // 部位选择
  onSiteSelect: function (e) {
    var index = parseInt(e.currentTarget.dataset.index)
    var site = PRESET_SITES[index]
    this.setData({
      site: site,
      siteDisplay: site,
      isSiteCustom: false
    })
  },

  // 部位自定义输入
  onSiteInput: function (e) {
    var value = e.detail.value
    if (value) {
      this.setData({
        site: value,
        siteDisplay: value,
        isSiteCustom: true
      })
    }
  },

  // 备注输入
  onNoteInput: function (e) {
    this.setData({
      note: e.detail.value
    })
  },

  // 保存注射记录
  onSave: function () {
    var dose = parseFloat(this.data.dose)
    var site = this.data.site
    var injectDate = this.data.injectDate
    var note = this.data.note
    var remainDose = this.data.remainDose

    // 验证
    if (!dose || dose <= 0) {
      wx.showToast({
        title: '请选择或输入剂量',
        icon: 'none'
      })
      return
    }

    if (!site) {
      wx.showToast({
        title: '请选择或输入部位',
        icon: 'none'
      })
      return
    }

    if (!injectDate) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      })
      return
    }

    // 剂量与剩余比较
    if (dose > remainDose) {
      var that = this
      wx.showModal({
        title: '剂量不足',
        content: '当前笔剩余 ' + remainDose + 'mg，本次使用 ' + dose + 'mg。是否更换新笔？',
        confirmText: '更换新笔',
        cancelText: '取消',
        success: function (res) {
          if (res.confirm) {
            that.onChangePen()
          }
        }
      })
      return
    }

    // 检查是否已存在该日期的记录
    var plan = logic.getCurrentPlan()
    if (plan && plan.records) {
      for (var i = 0; i < plan.records.length; i++) {
        if (plan.records[i].date === injectDate) {
          wx.showModal({
            title: '记录已存在',
            content: injectDate + ' 已有一条注射记录，是否覆盖？',
            success: function (res) {
              if (res.confirm) {
                this.doSave(dose, site, injectDate, note)
              }
            }.bind(this)
          })
          return
        }
      }
    }

    // 直接保存
    this.doSave(dose, site, injectDate, note)
  },

  doSave: function (dose, site, injectDate, note) {
    var now = new Date()
    var hours = String(now.getHours()).padStart(2, '0')
    var minutes = String(now.getMinutes()).padStart(2, '0')
    var timeStr = hours + ':' + minutes

    var record = {
      id: 'record_' + Date.now(),
      date: injectDate,
      time: timeStr,
      dose: dose,
      site: site,
      note: note || ''
    }

    // 添加到存储
    storage.addInjectionRecord(record)

    // 更新下次注射日期（如果记录日期是今天或之后）
    var today = this.formatDate(new Date())
    var plan = logic.getCurrentPlan()
    var nextDate = new Date(injectDate)
    nextDate.setDate(nextDate.getDate() + (plan.injectionIntervalDays || 7))

    var todayDate = new Date(today)
    var recordDate = new Date(injectDate)

    if (recordDate >= todayDate) {
      storage.updateNextInjectionDate(this.formatDate(nextDate))
    }

    // 更新当前剂量
    storage.updateCurrentDose(parseFloat(dose))

    // 更新部位轮换
    rotate.recordInjection()

    wx.showToast({
      title: '记录已保存',
      icon: 'success',
      duration: 1500
    })

    // 判断笔ID是否变化，同一支笔保持提醒现状，换笔才触发订阅提醒
    this.checkPenAndRequestReminder(injectDate, dose)
  },

  /**
   * 检查笔ID是否变化，决定是否触发订阅提醒
   */
  checkPenAndRequestReminder: function (injectDate, dose) {
    var that = this
    var plan = logic.getCurrentPlan()
    var currentPenId = plan.currentPenId || ''

    // 获取最近一条注射记录的笔ID
    var lastRecordPenId = ''
    if (plan.records && plan.records.length > 1) {
      // 取第二条（刚保存的是第一条）
      lastRecordPenId = plan.records[1].penId || ''
    }

    console.log('[inject] 当前笔ID:', currentPenId, '上次笔ID:', lastRecordPenId)

    // 同一支笔，不触发订阅提醒，直接返回
    if (currentPenId && lastRecordPenId && currentPenId === lastRecordPenId) {
      console.log('[inject] 同一支笔，保持提醒现状')
      setTimeout(function () {
        wx.navigateBack()
      }, 1500)
      return
    }

    // 笔ID变化或没有上次记录，触发订阅提醒
    this.requestNextReminder(injectDate, dose)
  },

  /**
   * 请求下一次注射的订阅提醒
   */
  requestNextReminder: function (injectDate, dose) {
    var that = this

    // 计算下一次注射日期
    var plan = logic.getCurrentPlan()
    var nextDate = new Date(injectDate)
    nextDate.setDate(nextDate.getDate() + (plan.injectionIntervalDays || 7))
    var nextDateStr = this.formatDate(nextDate)

    // 请求订阅授权
    notify.requestSubscribe(function (success, message) {
      if (success) {
        // 用户同意订阅，同步配置到云数据库并设置提醒
        that.scheduleReminder(nextDateStr, dose, plan, function () {
          wx.navigateBack()
        })
      } else {
        console.log('[inject] 用户未授权订阅:', message)
        // 用户拒绝或取消，也返回首页
        setTimeout(function () {
          wx.navigateBack()
        }, 500)
      }
    })
  },

  /**
   * 设置提醒：同步配置到云数据库，由定时触发器发送提醒
   */
  scheduleReminder: function (nextDateStr, dose, plan, callback) {
    var drugName = plan.drugName || '司美格鲁肽'
    var doseStr = dose + 'mg'

    // 同步配置到云数据库
    notify.syncReminderToCloud({
      enabled: true,
      subscribed: true,
      nextInjectionDate: nextDateStr,
      drugName: drugName,
      dose: doseStr,
      reminderTime: '09:00'
    }).then(function (result) {
      console.log('[inject] 同步提醒配置成功:', result)
      wx.showToast({
        title: '已设置提醒',
        icon: 'success',
        duration: 1500
      })
      if (callback) {
        setTimeout(callback, 1500)
      }
    }).catch(function (err) {
      console.error('[inject] 同步提醒配置失败:', err)
      wx.showToast({
        title: '提醒设置失败',
        icon: 'none',
        duration: 1500
      })
      if (callback) {
        setTimeout(callback, 1500)
      }
    })
  },

  // 更换新笔
  onChangePen: function () {
    var availablePens = storage.getAvailablePens()
    var plan = storage.getInjectionPlan()
    var currentPenId = plan ? plan.currentPenId : ''
    var list = []
    for (var i = 0; i < availablePens.length; i++) {
      var pen = availablePens[i]
      if (pen.penId === currentPenId) continue
      var spec = drug.getDrugSpec(pen.specKey)
      var usedDose = pen.usedDose || 0
      list.push({
        penId: pen.penId,
        drugName: spec ? (spec.drugName + ' ' + spec.brandName) : pen.drug,
        specName: spec ? (spec.totalDose + 'mg / ' + spec.volume + 'ml') : '',
        purchaseDate: pen.purchaseDate,
        remainDose: Math.max(0, pen.totalDose - usedDose)
      })
    }
    if (list.length === 0) {
      wx.navigateTo({
        url: '/pages/penAdd/penAdd'
      })
      return
    }
    this.setData({
      availablePens: list,
      selectedPenId: '',
      showPenPicker: true
    })
  },

  // 关闭笔选择弹窗
  onClosePenPicker: function () {
    this.setData({
      showPenPicker: false
    })
  },

  // 选择笔
  onPenSelect: function (e) {
    var penId = e.currentTarget.dataset.penId
    this.setData({
      selectedPenId: penId
    })
  },

  // 确认选择笔
  onConfirmPen: function () {
    var penId = this.data.selectedPenId
    if (!penId) return
    var success = storage.switchCurrentPen(penId)
    if (success) {
      var plan = logic.getCurrentPlan()
      var remain = pen.getRemainDose(plan)
      var drugType = plan.drug || 'semaglutide_nht'
      var doseOptions = drug.getDosesByDrugType(drugType)
      var currentDose = plan.currentDose || doseOptions[0]

      this.setData({
        showPenPicker: false,
        remainDose: remain.remainDose,
        penSize: plan.penSize || 0,
        doseOptions: doseOptions,
        dose: currentDose,
        doseDisplay: currentDose.toString()
      })
      wx.showToast({
        title: '已更换笔',
        icon: 'success'
      })
    }
  },

  // 跳转添加新笔
  onGoAddPen: function () {
    this.setData({
      showPenPicker: false
    })
    wx.navigateTo({
      url: '/pages/penAdd/penAdd'
    })
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