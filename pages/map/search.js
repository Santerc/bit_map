// pages/map/search.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    keyword: null,
    showData: null,  // 显示的搜索结果
    cursor: 0,
    imgCDN: app.imgCDN
  },

  /**
   * 输入框变化时触发搜索
   */
  bindSearchInput: function (e) {
    const inputData = e.detail.value.trim();  // 清除前后空白
    const db = wx.cloud.database();  // 获取云数据库实例
    const _this = this;

    if (inputData) {
      // 如果有输入内容，进行云数据库查询
      db.collection('location')  // 假设数据库集合名为 'locations'
        .where({
          // 这里假设你想模糊搜索 'name', 'floor' 和 'description' 字段
          name: db.RegExp({
            regexp: inputData,  // 搜索关键字
            options: 'i'  // 不区分大小写
          })
        })
        .get({
          success(res) {
            console.log('搜索结果：', res.data);
            _this.setData({
              showData: res.data  // 将搜索结果显示在页面上
            });
          },
          fail(err) {
            console.error('查询失败：', err);
            wx.showToast({
              title: '搜索失败',
              icon: 'none'
            });
          }
        });
    } else {
      // 如果输入框为空，清空结果
      this.setData({
        showData: null
      });
    }
  },

  /**
   * 页面生命周期函数
   */
  onLoad: function (options) {},
  onReady: function () {},
  onShow: function () {},
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {},

  /**
   * 清空搜索框
   */
  reset: function () {
    this.setData({
      keyword: null,
      showData: null  // 清空显示的结果
    });
  }
});
