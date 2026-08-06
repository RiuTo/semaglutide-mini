var STORAGE_KEY = 'share_code'
var EXPIRE_HOURS = 24
var CODE_LENGTH = 6
var CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCode() {
  var code = ''
  for (var i = 0; i < CODE_LENGTH; i++) {
    var idx = Math.floor(Math.random() * CODE_CHARS.length)
    code += CODE_CHARS.charAt(idx)
  }
  return code
}

function getShareCode() {
  try {
    var data = wx.getStorageSync(STORAGE_KEY)
    if (data && data.code && data.createdAt) {
      var now = Date.now()
      var expireTime = data.createdAt + EXPIRE_HOURS * 60 * 60 * 1000
      if (now < expireTime) {
        return data
      }
    }
  } catch (e) {
    console.error('读取共享码失败', e)
  }
  return null
}

function saveShareCode(code) {
  try {
    var data = {
      code: code,
      createdAt: Date.now(),
      permission: 'readonly'
    }
    wx.setStorageSync(STORAGE_KEY, data)
    return true
  } catch (e) {
    console.error('保存共享码失败', e)
    return false
  }
}

function createShareCode() {
  var code = generateCode()
  var success = saveShareCode(code)
  if (success) {
    return {
      code: code,
      createdAt: Date.now(),
      permission: 'readonly'
    }
  }
  return null
}

function getRemainingTime() {
  var data = getShareCode()
  if (!data) {
    return null
  }
  var now = Date.now()
  var expireTime = data.createdAt + EXPIRE_HOURS * 60 * 60 * 1000
  var remaining = expireTime - now
  if (remaining <= 0) {
    return null
  }
  var hours = Math.floor(remaining / (60 * 60 * 1000))
  var minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
  return {
    hours: hours,
    minutes: minutes,
    totalMs: remaining
  }
}

function getRemainingText() {
  var remaining = getRemainingTime()
  if (!remaining) {
    return '已过期'
  }
  if (remaining.hours > 0) {
    return remaining.hours + '小时' + remaining.minutes + '分钟'
  }
  return remaining.minutes + '分钟'
}

function isCodeValid() {
  return getShareCode() !== null
}

module.exports = {
  generateCode: generateCode,
  getShareCode: getShareCode,
  saveShareCode: saveShareCode,
  createShareCode: createShareCode,
  getRemainingTime: getRemainingTime,
  getRemainingText: getRemainingText,
  isCodeValid: isCodeValid,
  EXPIRE_HOURS: EXPIRE_HOURS
}
