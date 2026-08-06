var injectStore = require('./injectStore.js')
var drugCatalog = require('../logic/drugCatalog.js')
var STORAGE_KEY = 'injection_plan'

function getInjectionPlan() {
  return injectStore.getPlan()
}

function setInjectionPlan(plan) {
  injectStore.savePlan(plan)
}

function addInjectionRecord(record) {
  var plan = getInjectionPlan()
  if (plan && plan.initialized !== false) {
    if (!plan.records) plan.records = []
    record.penId = plan.currentPenId || ''
    plan.records.unshift(record)
    if (plan.isNewPen) {
      plan.isNewPen = false
    }

    if (plan.pens && plan.currentPenId) {
      for (var i = 0; i < plan.pens.length; i++) {
        if (plan.pens[i].penId === plan.currentPenId) {
          plan.pens[i].usedDose = (plan.pens[i].usedDose || 0) + (record.dose || 0)
          if (plan.pens[i].usedDose >= plan.pens[i].totalDose) {
            plan.pens[i].status = 'used'
          }
          break
        }
      }
    }

    injectStore.savePlan(plan)
  }
}

function updateCurrentDose(dose) {
  var plan = getInjectionPlan()
  if (plan && plan.initialized !== false) {
    plan.currentDose = dose
    injectStore.savePlan(plan)
  }
}

function updateNextInjectionDate(date) {
  var plan = getInjectionPlan()
  if (plan && plan.initialized !== false) {
    plan.nextInjectionDate = date
    injectStore.savePlan(plan)
  }
}

function clearInjectionPlan() {
  try {
    wx.removeStorageSync(STORAGE_KEY)
    wx.removeStorageSync('injection_initialized')
  } catch (e) {
    console.error('清除注射计划失败', e)
  }
}

function getPens() {
  var plan = getInjectionPlan()
  if (plan && plan.pens && Array.isArray(plan.pens)) {
    return plan.pens
  }
  return []
}

function getCurrentPen() {
  var plan = getInjectionPlan()
  if (!plan || !plan.currentPenId || !plan.pens) return null
  for (var i = 0; i < plan.pens.length; i++) {
    if (plan.pens[i].penId === plan.currentPenId) {
      return plan.pens[i]
    }
  }
  return null
}

function addPen(penData) {
  var plan = getInjectionPlan()
  if (plan && plan.initialized !== false) {
    if (!plan.pens) plan.pens = []
    if (!plan.records) plan.records = []

    var newPen = {
      penId: 'pen_' + Date.now(),
      drug: penData.drug || 'semaglutide_nht',
      specKey: penData.specKey || '',
      purchaseDate: penData.purchaseDate || formatDate(new Date()),
      price: penData.price || 0,
      totalDose: penData.totalDose || 2,
      usedDose: 0,
      status: 'sealed'
    }
    plan.pens.push(newPen)
    plan.penSystemEnabled = true

    injectStore.savePlan(plan)
    return newPen
  }
  return null
}

function replacePen() {
  var plan = getInjectionPlan()
  if (plan && plan.initialized !== false) {
    plan.isNewPen = true
    if (plan.pens && plan.currentPenId) {
      for (var i = 0; i < plan.pens.length; i++) {
        if (plan.pens[i].penId === plan.currentPenId) {
          plan.pens[i].usedDose = 0
          break
        }
      }
    }
    injectStore.savePlan(plan)
  }
}

function switchCurrentPen(penId) {
  var plan = getInjectionPlan()
  if (plan && plan.initialized !== false && plan.pens) {
    var targetPen = null
    for (var i = 0; i < plan.pens.length; i++) {
      if (plan.pens[i].penId === penId) {
        targetPen = plan.pens[i]
        break
      }
    }
    if (!targetPen) return false

    targetPen.status = 'active'
    plan.currentPenId = penId

    var penSpec = drugCatalog.getDrugSpec(targetPen.specKey)
    if (penSpec) {
      var penDrugType = penSpec.type
      var penBrandName = penSpec.brandName
      var penTypeName = penSpec.typeName
      var penTotalDose = penSpec.totalDose

      var changed = false

      if (plan.drug !== penDrugType) {
        plan.drug = penDrugType
        changed = true
      }

      if (plan.specKey !== targetPen.specKey) {
        plan.specKey = targetPen.specKey
        changed = true
      }

      if (plan.penSize !== penTotalDose) {
        plan.penSize = penTotalDose
        changed = true
      }

      if (!plan.brandName || plan.brandName !== penBrandName) {
        plan.brandName = penBrandName
        changed = true
      }

      if (!plan.typeName || plan.typeName !== penTypeName) {
        plan.typeName = penTypeName
        changed = true
      }

      if (changed && penSpec.doses && penSpec.doses.length > 0) {
        var currentDoseValid = false
        for (var j = 0; j < penSpec.doses.length; j++) {
          if (penSpec.doses[j] === plan.currentDose) {
            currentDoseValid = true
            break
          }
        }
        if (!currentDoseValid) {
          plan.currentDose = penSpec.doses[0]
        }
      }
    } else {
      if (plan.drug !== targetPen.drug) {
        plan.drug = targetPen.drug
      }
      if (plan.specKey !== targetPen.specKey) {
        plan.specKey = targetPen.specKey
      }
      if (plan.penSize !== targetPen.totalDose) {
        plan.penSize = targetPen.totalDose
      }
    }

    plan.isNewPen = (targetPen.usedDose || 0) === 0
    injectStore.savePlan(plan)
    return true
  }
  return false
}

function getAvailablePens() {
  var pens = getPens()
  var available = []
  for (var i = 0; i < pens.length; i++) {
    var pen = pens[i]
    var usedDose = pen.usedDose || 0
    if (usedDose < pen.totalDose && pen.status !== 'used') {
      available.push(pen)
    }
  }
  return available
}

function formatDate(date) {
  var year = date.getFullYear()
  var month = String(date.getMonth() + 1).padStart(2, '0')
  var day = String(date.getDate()).padStart(2, '0')
  return year + '-' + month + '-' + day
}

module.exports = {
  getInjectionPlan: getInjectionPlan,
  setInjectionPlan: setInjectionPlan,
  addInjectionRecord: addInjectionRecord,
  updateCurrentDose: updateCurrentDose,
  updateNextInjectionDate: updateNextInjectionDate,
  clearInjectionPlan: clearInjectionPlan,
  replacePen: replacePen,
  getPens: getPens,
  getCurrentPen: getCurrentPen,
  addPen: addPen,
  switchCurrentPen: switchCurrentPen,
  getAvailablePens: getAvailablePens
}