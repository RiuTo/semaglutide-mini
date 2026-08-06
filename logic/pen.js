/**
 * 笔剂量计算模块
 */

/**
 * 计算剩余剂量（基于 pen 对象）
 * @param {object} pen - 笔对象 { totalDose, usedDose }
 * @returns {object} { remainDose, remainPercent }
 */
function getRemainDoseFromPen(pen) {
  if (!pen || !pen.totalDose || pen.totalDose <= 0) {
    return { remainDose: 0, remainPercent: 0 }
  }

  var usedDose = pen.usedDose || 0
  var remainDose = pen.totalDose - usedDose
  if (remainDose < 0) remainDose = 0

  var remainPercent = Math.floor((remainDose / pen.totalDose) * 100)

  return {
    remainDose: remainDose,
    remainPercent: remainPercent
  }
}

/**
 * 获取当前笔
 * @param {object} plan - 注射计划
 * @returns {object|null} 当前笔对象
 */
function getCurrentPen(plan) {
  if (!plan || !plan.pens || !plan.currentPenId) return null
  for (var i = 0; i < plan.pens.length; i++) {
    if (plan.pens[i].penId === plan.currentPenId) {
      return plan.pens[i]
    }
  }
  return null
}

/**
 * 计算当前笔剩余剂量
 * @param {object} plan - 注射计划
 * @returns {object} { remainDose, remainPercent }
 */
function getRemainDose(plan) {
  var pen = getCurrentPen(plan)
  return getRemainDoseFromPen(pen)
}

/**
 * 计算剩余百分比
 * @param {object} plan - 注射计划
 * @returns {number} 剩余百分比 0-100
 */
function getRemainPercent(plan) {
  var result = getRemainDose(plan)
  return result.remainPercent
}

module.exports = {
  getRemainDose: getRemainDose,
  getRemainPercent: getRemainPercent,
  getRemainDoseFromPen: getRemainDoseFromPen,
  getCurrentPen: getCurrentPen
}
