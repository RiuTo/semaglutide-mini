/**
 * 药物使用规则模块
 */

var MAX_USAGE = {
  semaglutide: 7,
  tirzepatide: 4
}

/**
 * 获取药物最大使用次数
 * @param {string} drugType - 药物类型
 * @returns {number} 最大使用次数
 */
function getMaxUsage(drugType) {
  if (!drugType) return 7
  if (MAX_USAGE[drugType] !== undefined) {
    return MAX_USAGE[drugType]
  }
  if (drugType.indexOf('semaglutide') !== -1) {
    return MAX_USAGE.semaglutide
  }
  if (drugType.indexOf('tirzepatide') !== -1) {
    return MAX_USAGE.tirzepatide
  }
  return 7
}

/**
 * 验证使用次数是否合法
 * @param {string} drugType - 药物类型
 * @param {number} usedCount - 已使用次数
 * @returns {boolean} true=合法
 */
function isValidUsage(drugType, usedCount) {
  var max = getMaxUsage(drugType)
  return usedCount >= 0 && usedCount <= max
}

module.exports = {
  getMaxUsage: getMaxUsage,
  isValidUsage: isValidUsage
}
