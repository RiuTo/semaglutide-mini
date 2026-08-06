Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/home/home',
        text: '首页',
        icon: '/static/icons/home.png',
        activeIcon: '/static/icons/home-active.png'
      },
      {
        pagePath: '/pages/history/history',
        text: '记录',
        icon: '/static/icons/record.png',
        activeIcon: '/static/icons/record-active.png'
      },
      {
        pagePath: '/pages/profile/profile',
        text: '我的',
        icon: '/static/icons/profile.png',
        activeIcon: '/static/icons/profile-active.png'
      }
    ]
  },

  methods: {
    switchTab: function (e) {
      var index = e.currentTarget.dataset.index
      var url = this.data.list[index].pagePath
      wx.switchTab({
        url: url
      })
    }
  }
})
