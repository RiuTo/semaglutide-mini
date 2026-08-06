var STORAGE_KEY = 'injection_plan'
var INIT_KEY = 'injection_initialized'

/**
 * 数据迁移 - 兼容旧版本数据结构
 */
function migrateData(data) {
  if (!data) return null

  var migrated = false

  // 迁移 planType
  if (!data.planType) {
    data.planType = data.type || 'weight'
    migrated = true
  }

  // 迁移 startDate
  if (!data.startDate && data.records && data.records.length > 0) {
    var dates = data.records.map(function (r) { return r.date }).sort()
    data.startDate = dates[0]
    migrated = true
  } else if (!data.startDate) {
    var today = new Date()
    var year = today.getFullYear()
    var month = String(today.getMonth() + 1).padStart(2, '0')
    var day = String(today.getDate()).padStart(2, '0')
    data.startDate = year + '-' + month + '-' + day
    migrated = true
  }

  // 迁移 currentSite
  if (!data.currentSite) {
    if (data.records && data.records.length > 0) {
      data.currentSite = data.records[0].site || '腹左'
    } else {
      data.currentSite = '腹左'
    }
    migrated = true
  }

  // 删除旧 type 字段
  if (data.type) {
    delete data.type
    migrated = true
  }

  // 新增 initialized 字段
  if (data.initialized === undefined) {
    data.initialized = true
    migrated = true
  }

  // 新增 drug 字段（旧数据默认司美格鲁肽-诺和泰）
  if (!data.drug) {
    data.drug = 'semaglutide_nht'
    migrated = true
  }

  // 新增 penSize 字段（旧数据默认2mg）
  if (data.penSize === undefined) {
    data.penSize = 2
    migrated = true
  }

  // 新增 isNewPen 字段
  if (data.isNewPen === undefined) {
    data.isNewPen = false
    migrated = true
  }

  // 新增 specKey 字段
  if (!data.specKey) {
    data.specKey = 'nht_15_2mg'
    migrated = true
  }

  // 新增 nextInjectionDate 字段
  if (!data.nextInjectionDate) {
    var nextDate = new Date(data.startDate)
    nextDate.setDate(nextDate.getDate() + 7)
    data.nextInjectionDate = formatDate(nextDate)
    migrated = true
  }

  // 新增 injectionIntervalDays 字段
  if (!data.injectionIntervalDays) {
    data.injectionIntervalDays = 7
    migrated = true
  }

  // 新增 currentDose 字段
  if (data.currentDose === undefined) {
    data.currentDose = 0.25
    migrated = true
  }

  // 删除 usedCount 字段（改用 records.length 计算）
  if (data.usedCount !== undefined) {
    delete data.usedCount
    migrated = true
  }

  // 删除 penUsedDose 字段（改用 records 动态计算）
  if (data.penUsedDose !== undefined) {
    delete data.penUsedDose
    migrated = true
  }

  // 新增 penSystemEnabled 字段
  if (data.penSystemEnabled === undefined) {
    data.penSystemEnabled = false
    migrated = true
  }

  // 新增 pens 数组 + currentPenId（从旧字段迁移）
  if (!data.pens || !Array.isArray(data.pens)) {
    data.pens = []
    if (data.initialized && data.initialized !== false) {
      var initPenId = 'pen_' + Date.now()
      var initUsedDose = data.initialUsedDose || 0
      data.pens.push({
        penId: initPenId,
        drug: data.drug || 'semaglutide_nht',
        specKey: data.specKey || '',
        purchaseDate: data.startDate || formatDate(new Date()),
        price: 0,
        totalDose: data.penSize || 2,
        usedDose: initUsedDose,
        status: 'active'
      })
      data.currentPenId = initPenId
      data.penSystemEnabled = true
    } else {
      data.currentPenId = ''
    }
    migrated = true
  }

  // 删除旧的 initialUsedDose 字段
  if (data.initialUsedDose !== undefined) {
    delete data.initialUsedDose
    migrated = true
  }

  // 为已有 pen 补充 usedDose 字段
  if (data.pens && data.pens.length > 0) {
    for (var k = 0; k < data.pens.length; k++) {
      if (data.pens[k].usedDose === undefined) {
        data.pens[k].usedDose = 0
        migrated = true
      }
    }
  }

  if (data.currentPenId === undefined) {
    data.currentPenId = data.pens && data.pens.length > 0 ? data.pens[0].penId : ''
    migrated = true
  }

  if (migrated) {
    savePlan(data)
    console.log('数据迁移完成')
  }

  return data
}

/**
 * 检测是否首次启动
 */
function isFirstLaunch() {
  try {
    var initialized = wx.getStorageSync(INIT_KEY)
    return !initialized
  } catch (e) {
    console.error('检测首次启动失败', e)
    return true
  }
}

/**
 * 标记已初始化
 */
function setInitialized() {
  try {
    wx.setStorageSync(INIT_KEY, true)
  } catch (e) {
    console.error('标记初始化失败', e)
  }
}

function getPlan() {
  try {
    var data = wx.getStorageSync(STORAGE_KEY)
    if (data) {
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch (parseError) {
          console.error('解析注射计划数据失败', parseError)
          data = null
        }
      }
      if (data && typeof data === 'object') {
        return migrateData(data)
      }
    }
  } catch (e) {
    console.error('读取注射计划失败', e)
  }

  return {
    initialized: false,
    records: []
  }
}

function savePlan(plan) {
  try {
    wx.setStorageSync(STORAGE_KEY, plan)
  } catch (e) {
    console.error('保存注射计划失败', e)
  }
}

/**
 * 初始化注射计划（用于 onboarding 完成后）
 * @param {string} planType - 方案类型：'weight' 或 'diabetes'
 * @param {string} startDate - 开始日期
 * @param {object} options - 其他选项：drug, penSize, isNewPen, specKey
 */
function initPlan(planType, startDate, options) {
  options = options || {}
  var today = new Date()
  var year = today.getFullYear()
  var month = String(today.getMonth() + 1).padStart(2, '0')
  var day = String(today.getDate()).padStart(2, '0')
  var todayStr = year + '-' + month + '-' + day

  var nextDate = new Date(startDate || todayStr)
  nextDate.setDate(nextDate.getDate() + 7)
  var nextDateStr = formatDate(nextDate)

  var firstPenId = 'pen_' + Date.now()
  var penSize = options.penSize || 2
  var penUsedDose = options.usedDose !== undefined ? options.usedDose : 0

  var brandName = ''
  var typeName = ''
  var currentDose = 0
  if (options.specKey) {
    try {
      var drugCatalog = require('../logic/drugCatalog.js')
      var spec = drugCatalog.getDrugSpec(options.specKey)
      if (spec) {
        brandName = spec.brandName || ''
        typeName = spec.typeName || ''
        if (spec.doses && spec.doses.length > 0) {
          currentDose = spec.doses[0]
        }
      }
    } catch (e) {
      console.error('获取药品规格失败', e)
    }
  }

  var newPlan = {
    initialized: true,
    drug: options.drug || 'semaglutide_nht',
    penSize: penSize,
    isNewPen: options.isNewPen !== undefined ? options.isNewPen : true,
    specKey: options.specKey || '',
    brandName: brandName,
    typeName: typeName,
    planType: planType || 'weight',
    startDate: startDate || todayStr,
    currentDose: currentDose,
    currentSite: '腹左',
    nextInjectionDate: nextDateStr,
    injectionIntervalDays: 7,
    records: [],
    penSystemEnabled: true,
    currentPenId: firstPenId,
    pens: [
      {
        penId: firstPenId,
        drug: options.drug || 'semaglutide_nht',
        specKey: options.specKey || '',
        purchaseDate: startDate || todayStr,
        price: 0,
        totalDose: penSize,
        usedDose: penUsedDose,
        status: 'active'
      }
    ]
  }

  savePlan(newPlan)
  setInitialized()

  console.log('注射计划初始化完成:', newPlan)
  return newPlan
}

/**
 * 计算剩余针剂百分比
 * @param {object} plan - 注射计划对象
 * @returns {number} 剩余百分比 0-100
 */
function getRemainingPercent(plan) {
  if (!plan || !plan.pens || !plan.currentPenId) {
    return 0
  }

  var currentPen = null
  for (var i = 0; i < plan.pens.length; i++) {
    if (plan.pens[i].penId === plan.currentPenId) {
      currentPen = plan.pens[i]
      break
    }
  }

  if (!currentPen || !currentPen.totalDose || currentPen.totalDose <= 0) {
    return 0
  }

  var usedDose = currentPen.usedDose || 0
  var remaining = currentPen.totalDose - usedDose
  if (remaining < 0) remaining = 0
  return Math.round((remaining / currentPen.totalDose) * 100)
}

/**
 * 获取历史累计剂量
 */
function getTotalUsedDose(plan) {
  if (!plan || !plan.records || plan.records.length === 0) {
    return 0
  }
  var total = 0
  for (var i = 0; i < plan.records.length; i++) {
    total += plan.records[i].dose || 0
  }
  return total
}

function formatDate(date) {
  var year = date.getFullYear()
  var month = String(date.getMonth() + 1).padStart(2, '0')
  var day = String(date.getDate()).padStart(2, '0')
  return year + '-' + month + '-' + day
}

module.exports = {
  getPlan: getPlan,
  savePlan: savePlan,
  migrateData: migrateData,
  isFirstLaunch: isFirstLaunch,
  initPlan: initPlan,
  setInitialized: setInitialized,
  getRemainingPercent: getRemainingPercent,
  getTotalUsedDose: getTotalUsedDose
}
