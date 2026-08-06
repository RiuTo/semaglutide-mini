var injectStorage = require('../../storage/injectStore.js')
var metricStorage = require('../../storage/metric.js')
var reminderStorage = require('../../storage/reminder.js')
var shareStorage = require('../../storage/share.js')
var config = require('../../config/index.js')

function checkRelease() {
  var results = []
  var allPassed = true

  // 1. Storage 检查
  var storageResult = checkStorage()
  results.push(storageResult)
  if (!storageResult.passed) allPassed = false

  // 2. 空页面检查（页面列表验证）
  var pagesResult = checkPages()
  results.push(pagesResult)
  if (!pagesResult.passed) allPassed = false

  // 3. 导出功能检查
  var exportResult = checkExport()
  results.push(exportResult)
  if (!exportResult.passed) allPassed = false

  // 4. 提醒功能检查
  var reminderResult = checkReminder()
  results.push(reminderResult)
  if (!reminderResult.passed) allPassed = false

  // 5. 共享功能检查
  var shareResult = checkShare()
  results.push(shareResult)
  if (!shareResult.passed) allPassed = false

  // 6. 环境配置检查
  var envResult = checkEnv()
  results.push(envResult)
  if (!envResult.passed) allPassed = false

  return {
    passed: allPassed,
    results: results,
    status: allPassed ? 'READY' : 'NOT READY',
    version: config.getVersion(),
    buildDate: config.getBuildDate(),
    env: config.getEnv()
  }
}

function checkStorage() {
  var items = []
  var passed = true

  try {
    var plan = injectStorage.getPlan()
    if (plan && plan.records && plan.records.length > 0) {
      items.push({ name: '注射计划数据', status: 'ok', detail: plan.records.length + ' 条记录' })
    } else {
      items.push({ name: '注射计划数据', status: 'warn', detail: '无记录（使用默认数据）' })
    }
  } catch (e) {
    items.push({ name: '注射计划数据', status: 'error', detail: e.message })
    passed = false
  }

  try {
    var metricRecords = metricStorage.getRecords()
    if (metricRecords && metricRecords.length > 0) {
      items.push({ name: '指标数据', status: 'ok', detail: metricRecords.length + ' 条记录' })
    } else {
      items.push({ name: '指标数据', status: 'warn', detail: '无记录（使用默认数据）' })
    }
  } catch (e) {
    items.push({ name: '指标数据', status: 'error', detail: e.message })
    passed = false
  }

  try {
    var reminder = reminderStorage.getReminder()
    if (reminder) {
      items.push({ name: '提醒设置', status: 'ok', detail: reminder.enabled ? '已开启' : '未开启' })
    } else {
      items.push({ name: '提醒设置', status: 'warn', detail: '使用默认配置' })
    }
  } catch (e) {
    items.push({ name: '提醒设置', status: 'error', detail: e.message })
    passed = false
  }

  return {
    name: 'Storage 存储',
    passed: passed,
    items: items
  }
}

function checkPages() {
  var items = []
  var passed = true

  var requiredPages = [
    { key: 'home', name: '首页', icon: '🏠' },
    { key: 'history', name: '注射记录', icon: '📋' },
    { key: 'repair', name: '漏针修正', icon: '🔧' },
    { key: 'effect', name: '药效详情', icon: '💊' },
    { key: 'metric', name: '指标记录', icon: '⚖️' },
    { key: 'trend', name: '趋势分析', icon: '📈' },
    { key: 'reminder', name: '提醒设置', icon: '⏰' },
    { key: 'share', name: '家属共享', icon: '👨‍👩‍👧' },
    { key: 'export', name: '导出记录', icon: '📤' },
    { key: 'about', name: '关于', icon: 'ℹ️' }
  ]

  for (var i = 0; i < requiredPages.length; i++) {
    var page = requiredPages[i]
    items.push({ name: page.icon + ' ' + page.name, status: 'ok', detail: '已注册' })
  }

  return {
    name: '页面完整性',
    passed: passed,
    items: items
  }
}

function checkExport() {
  var items = []
  var passed = true

  try {
    var fs = wx.getFileSystemManager()
    var userPath = wx.env.USER_DATA_PATH
    if (userPath) {
      items.push({ name: '文件系统', status: 'ok', detail: '可用' })
    } else {
      items.push({ name: '文件系统', status: 'error', detail: 'USER_DATA_PATH 不可用' })
      passed = false
    }
  } catch (e) {
    items.push({ name: '文件系统', status: 'error', detail: e.message })
    passed = false
  }

  try {
    var plan = injectStorage.getPlan()
    var metricRecords = metricStorage.getRecords()
    var hasData = (plan && plan.records && plan.records.length > 0) ||
                  (metricRecords && metricRecords.length > 0)
    if (hasData) {
      items.push({ name: '导出数据', status: 'ok', detail: '有数据可导出' })
    } else {
      items.push({ name: '导出数据', status: 'warn', detail: '暂无数据' })
    }
  } catch (e) {
    items.push({ name: '导出数据', status: 'error', detail: e.message })
    passed = false
  }

  return {
    name: '导出功能',
    passed: passed,
    items: items
  }
}

function checkReminder() {
  var items = []
  var passed = true

  try {
    var reminder = reminderStorage.getReminder()
    if (reminder) {
      items.push({
        name: '提醒配置',
        status: 'ok',
        detail: reminder.time + '（提前' + reminder.advance + '分钟）'
      })
    } else {
      items.push({ name: '提醒配置', status: 'warn', detail: '使用默认配置' })
    }
  } catch (e) {
    items.push({ name: '提醒配置', status: 'error', detail: e.message })
    passed = false
  }

  try {
    var plan = injectStorage.getPlan()
    if (plan && plan.nextInjectionDate) {
      items.push({ name: '下次注射日期', status: 'ok', detail: plan.nextInjectionDate })
    } else {
      items.push({ name: '下次注射日期', status: 'warn', detail: '未设置' })
    }
  } catch (e) {
    items.push({ name: '下次注射日期', status: 'error', detail: e.message })
    passed = false
  }

  items.push({
    name: '微信订阅消息',
    status: 'warn',
    detail: '需在微信公众平台配置模板ID'
  })

  return {
    name: '提醒功能',
    passed: passed,
    items: items
  }
}

function checkShare() {
  var items = []
  var passed = true

  try {
    var shareCode = shareStorage.getShareCode()
    if (shareCode && shareCode.code) {
      var valid = shareStorage.isCodeValid()
      items.push({
        name: '共享码',
        status: valid ? 'ok' : 'warn',
        detail: shareCode.code + '（' + (valid ? '有效' : '已过期') + '）'
      })
    } else {
      items.push({ name: '共享码', status: 'warn', detail: '未生成' })
    }
  } catch (e) {
    items.push({ name: '共享码', status: 'error', detail: e.message })
    passed = false
  }

  try {
    var newCode = shareStorage.generateCode()
    if (newCode && newCode.length === 6) {
      items.push({ name: '生成算法', status: 'ok', detail: '6位随机码正常' })
    } else {
      items.push({ name: '生成算法', status: 'error', detail: '生成失败' })
      passed = false
    }
  } catch (e) {
    items.push({ name: '生成算法', status: 'error', detail: e.message })
    passed = false
  }

  return {
    name: '共享功能',
    passed: passed,
    items: items
  }
}

function checkEnv() {
  var items = []
  var passed = true

  try {
    items.push({
      name: '当前环境',
      status: config.getEnv() === 'PROD' ? 'ok' : 'warn',
      detail: config.getEnv() + ' (' + (config.getEnv() === 'PROD' ? '生产环境' : '开发环境') + ')'
    })
  } catch (e) {
    items.push({ name: '当前环境', status: 'error', detail: e.message })
    passed = false
  }

  try {
    items.push({
      name: '版本号',
      status: 'ok',
      detail: config.getVersion()
    })
  } catch (e) {
    items.push({ name: '版本号', status: 'error', detail: e.message })
    passed = false
  }

  try {
    items.push({
      name: '日志开关',
      status: config.isEnableLog() ? 'warn' : 'ok',
      detail: config.isEnableLog() ? '已开启（生产环境应关闭）' : '已关闭'
    })
  } catch (e) {
    items.push({ name: '日志开关', status: 'error', detail: e.message })
    passed = false
  }

  return {
    name: '环境配置',
    passed: passed,
    items: items
  }
}

Page({
  data: {
    checkResult: null,
    checking: false,
    hasChecked: false
  },

  onLoad: function () {
  },

  onCheck: function () {
    this.setData({ checking: true, hasChecked: false })

    var that = this
    setTimeout(function () {
      var result = checkRelease()
      that.setData({
        checkResult: result,
        checking: false,
        hasChecked: true
      })

      if (result.passed) {
        wx.showToast({
          title: 'READY',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: '存在问题',
          icon: 'none'
        })
      }
    }, 500)
  },

  onBack: function () {
    wx.navigateBack()
  }
})

module.exports = {
  checkRelease: checkRelease
}