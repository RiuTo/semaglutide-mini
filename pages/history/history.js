var logic = require('../../logic/index.js')
var storage = require('../../storage/index.js')
var drugCatalog = require('../../logic/drugCatalog.js')

Page({
  data: {
    groups: []
  },

  onLoad: function () {
    this.loadHistory()
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
    this.loadHistory()
  },

  loadHistory: function () {
    var records = logic.getRecentRecords(100)
    var plan = storage.getInjectionPlan()
    var pens = (plan && plan.pens) ? plan.pens : []
    var currentPenId = plan ? plan.currentPenId : ''

    // 构建笔信息映射
    var penMap = {}
    for (var i = 0; i < pens.length; i++) {
      var pen = pens[i]
      var spec = drugCatalog.getDrugSpec(pen.specKey)
      penMap[pen.penId] = {
        penId: pen.penId,
        drugName: spec ? (spec.drugName + ' ' + spec.brandName) : pen.drug,
        specName: spec ? (spec.totalDose + 'mg / ' + spec.volume + 'ml') : '',
        purchaseDate: pen.purchaseDate,
        totalDose: pen.totalDose,
        usedDose: pen.usedDose || 0,
        remainDose: Math.max(0, pen.totalDose - (pen.usedDose || 0)),
        isCurrent: pen.penId === currentPenId,
        status: pen.status
      }
    }

    // 按 penId 分组
    var groupMap = {}
    var groupOrder = []
    for (var j = 0; j < records.length; j++) {
      var record = records[j]
      var penId = record.penId || ''
      if (!groupMap[penId]) {
        groupMap[penId] = []
        groupOrder.push(penId)
      }
      groupMap[penId].push(record)
    }

    // 组装分组数据
    var groups = []
    for (var k = 0; k < groupOrder.length; k++) {
      var pid = groupOrder[k]
      var penInfo = penMap[pid] || {
        penId: pid,
        drugName: '未知笔',
        specName: '',
        purchaseDate: '',
        totalDose: 0,
        usedDose: 0,
        remainDose: 0,
        isCurrent: false,
        status: 'unknown'
      }
      var groupRecords = groupMap[pid]
      // 统计该笔使用记录数和总剂量
      var totalUsed = 0
      for (var m = 0; m < groupRecords.length; m++) {
        totalUsed += (groupRecords[m].dose || 0)
      }
      var isUsed = penInfo.status === 'used'
      var collapsed = isUsed
      var spacerHeight = this.calcSpacerHeight(isUsed, collapsed, groupRecords.length, k, groupOrder, penMap)
      groups.push({
        penId: pid,
        penInfo: penInfo,
        records: groupRecords,
        recordCount: groupRecords.length,
        totalUsed: totalUsed,
        collapsed: collapsed,
        spacerHeight: spacerHeight
      })
    }

    this.setData({
      groups: groups
    })
  },

  onToggleGroup: function (e) {
    var index = e.currentTarget.dataset.index
    var groups = this.data.groups.slice()
    groups[index].collapsed = !groups[index].collapsed
    var plan = storage.getInjectionPlan()
    var pens = (plan && plan.pens) ? plan.pens : []
    var penMap = {}
    for (var i = 0; i < pens.length; i++) {
      penMap[pens[i].penId] = pens[i]
    }
    var groupOrder = []
    for (var j = 0; j < groups.length; j++) {
      groupOrder.push(groups[j].penId)
    }
    for (var k = 0; k < groups.length; k++) {
      var isUsed = groups[k].penInfo.status === 'used'
      groups[k].spacerHeight = this.calcSpacerHeight(
        isUsed,
        groups[k].collapsed,
        groups[k].recordCount,
        k,
        groupOrder,
        this.buildPenMap(plan)
      )
    }
    this.setData({
      groups: groups
    })
  },

  buildPenMap: function (plan) {
    var pens = (plan && plan.pens) ? plan.pens : []
    var penMap = {}
    for (var i = 0; i < pens.length; i++) {
      penMap[pens[i].penId] = pens[i]
    }
    return penMap
  },

  calcSpacerHeight: function (isUsed, collapsed, recordCount, index, groupOrder, penMap) {
    var DEFAULT_SPACER = 32
    if (index >= groupOrder.length - 1) {
      return DEFAULT_SPACER
    }
    var nextPenId = groupOrder[index + 1]
    var nextPenInfo = penMap[nextPenId] || { status: 'unknown' }
    var nextIsUsed = nextPenInfo.status === 'used'
    if (!isUsed && nextIsUsed) {
      if (recordCount > 5) return 64
      if (recordCount > 2) return 48
      return 32
    }
    if (isUsed && nextIsUsed) {
      return collapsed ? 16 : 24
    }
    return DEFAULT_SPACER
  },

  onBack: function () {
    wx.switchTab({
      url: '/pages/home/home'
    })
  }
})
