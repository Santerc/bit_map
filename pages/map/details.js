Page({
  data: {
    building: {}, // 当前建筑物信息
    messages: [], // 留言列表
    inputContent: "", // 留言输入框内容
  },

  // 页面加载时获取建筑物详情和留言
  onLoad: function (options) {
    this.fetchBuildingDetails(options.buildingId);
    this.fetchMessages(options.buildingId);
  },

  // 获取建筑物详情
  fetchBuildingDetails: function (buildingId) {
    const db = wx.cloud.database();
    db.collection('buildings').doc(buildingId).get()
      .then(res => {
        this.setData({
          building: res.data
        });
      })
      .catch(err => {
        console.error('获取建筑详情失败:', err);
      });
  },

  // 获取建筑物留言
  fetchMessages: function (buildingId) {
    const db = wx.cloud.database();
    db.collection('messages')
      .where({ buildingId: buildingId }) // 根据建筑物 ID 获取留言
      .orderBy('timestamp', 'desc')  // 按时间倒序排列
      .get()
      .then(res => {
        this.setData({
          messages: res.data
        });
      })
      .catch(err => {
        console.error('获取留言失败:', err);
      });
  },

  // 输入框内容绑定
  onInput: function (e) {
    this.setData({
      inputContent: e.detail.value
    });
  },

  // 发送留言
  sendMessage: function () {
    const content = this.data.inputContent.trim();
    if (!content) {
      wx.showToast({
        title: '留言内容不能为空',
        icon: 'none',
      });
      return;
    }

    const author = '游客'; // 可以替换为当前用户昵称
    const timestamp = new Date().toISOString(); // 留言时间

    const buildingId = this.data.building._id; // 当前建筑物的 ID
    const buildingName = this.data.building.name; // 当前建筑物名称

    // 将留言上传到云数据库
    const db = wx.cloud.database();
    db.collection('messages')
      .add({
        data: {
          content: content,
          author: author,
          timestamp: timestamp,
          buildingId: buildingId, // 关联建筑物 ID
          buildingName: buildingName, // 保存建筑物名称
        }
      })
      .then(res => {
        wx.showToast({
          title: '留言成功',
        });
        this.setData({
          inputContent: "" // 发送成功后清空输入框
        });
        this.fetchMessages(buildingId); // 重新加载留言
      })
      .catch(err => {
        console.error('留言失败:', err);
        wx.showToast({
          title: '留言失败',
          icon: 'none',
        });
      });
  }
});
