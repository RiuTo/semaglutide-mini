var STORAGE_KEY = 'reminder'

var DEFAULT_CONFIG = {
  enabled: false,
  time: '20:00',
  advance: 30,
  subscribed: false,
  openid: ''
}

function getReminder() {
  try {
    var data = wx.getStorageSync(STORAGE_KEY)
    if (data) {
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch (e) {
          console.error('解析提醒设置失败', e)
          return DEFAULT_CONFIG
        }
      }
      data.subscribed = data.subscribed !== undefined ? data.subscribed : false
      data.openid = data.openid !== undefined ? data.openid : ''
      return data
    }
  } catch (e) {
    console.error('读取提醒设置失败', e)
  }
  return DEFAULT_CONFIG
}

function saveReminder(config) {
  try {
    var data = {
      enabled: config.enabled !== undefined ? config.enabled : false,
      time: config.time || '20:00',
      advance: config.advance !== undefined ? config.advance : 30,
      subscribed: config.subscribed !== undefined ? config.subscribed : false,
      openid: config.openid !== undefined ? config.openid : ''
    }
    wx.setStorageSync(STORAGE_KEY, data)
    console.log('提醒设置已保存:', data)
    return true
  } catch (e) {
    console.error('保存提醒设置失败', e)
    return false
  }
}

function setSubscribed(subscribed) {
  var config = getReminder()
  config.subscribed = subscribed
  saveReminder(config)
}

function setOpenid(openid) {
  var config = getReminder()
  config.openid = openid
  saveReminder(config)
}

function getOpenid() {
  var config = getReminder()
  return config.openid || ''
}

function getNextReminderText(nextInjectionDate) {
  var config = getReminder()
  if (!config.enabled || !nextInjectionDate) {
    return ''
  }

  var timeParts = config.time.split(':')
  var hour = parseInt(timeParts[0])
  var minute = parseInt(timeParts[1])

  var reminderDate = new Date(nextInjectionDate + ' ' + config.time)
  reminderDate.setMinutes(reminderDate.getMinutes() - config.advance)

  var m = reminderDate.getMonth() + 1
  var d = reminderDate.getDate()
  var h = String(reminderDate.getHours()).padStart(2, '0')
  var min = String(reminderDate.getMinutes()).padStart(2, '0')

  return m + '/' + d + ' ' + h + ':' + min
}

module.exports = {
  getReminder: getReminder,
  saveReminder: saveReminder,
  getNextReminderText: getNextReminderText,
  setSubscribed: setSubscribed,
  setOpenid: setOpenid,
  getOpenid: getOpenid,
  DEFAULT_CONFIG: DEFAULT_CONFIG
}
