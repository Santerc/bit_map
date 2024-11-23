// pages/me/me.js
Page({
  data: {
  loginOK: false
  },
  //去登陆页
  login() {
  wx.navigateTo({
   url: '/pages/usr/login',
  })
  },
  //去注册页
  register() {
  wx.navigateTo({
   url: '/pages/usr/register',
  })
  },
  onShow() {
  let user = wx.getStorageSync('user')
  if (user && user.name) {
   this.setData({
    loginOK: true,
    name: user.name
   })
  } else {
   this.setData({
    loginOK: false
   })
  }
  },
  
  //退出登陆
  logout() {
  wx.setStorageSync('user', null)
  let user = wx.getStorageSync('user')
  if (user && user.name) {
   this.setData({
    loginOK: true,
    name: user.name
   })
  } else {
   this.setData({
    loginOK: false
   })
  }
  }
  })
