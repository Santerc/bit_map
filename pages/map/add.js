var app = getApp();

Page({
  data: {
    latitude: 39.735678,
    longitude: 116.171271,
    showAddPlaceModal: false,  // 控制弹框显示
    newPlaceName: '',          // 新地点的名称
    newPlaceType: '',          // 新地点的类型
    newPlaceLatitude: null,    // 新地点的纬度
    newPlaceLongitude: null,   // 新地点的经度
    markers: []                // 存储地图上的标记
  },

  onLoad: function () {
    wx.cloud.init();
    // 设置默认的地图中心点为某位置
    this.setData({
      latitude: 39.735678,
      longitude: 116.171271
    });
  },

  // 点击地图，记录点击的位置，弹出添加地点的对话框
  onMapTap: function (e) {
    const { latitude, longitude } = e.detail;

    // 更新点击位置的经纬度
    this.setData({
      newPlaceLatitude: latitude,
      newPlaceLongitude: longitude,
      showAddPlaceModal: true,  // 显示输入框
    });

    // 在点击位置添加标记，并移除之前的标记
    this.addMarker(latitude, longitude);
  },

  // 在地图上添加标记
  addMarker: function (latitude, longitude) {
    const newMarker = {
      id: Date.now(),  // 使用当前时间作为唯一ID
      latitude: latitude,
      longitude: longitude,
      iconPath: '/img/marker.png',  // 自定义标记图标路径
      width: 30,  // 图标宽度
      height: 30,  // 图标高度
      title: "新地点",  // 默认标题
    };

    // 清空之前的标记，只保留当前点击位置的标记
    this.setData({
      markers: [newMarker]
    });
  },

  // 关闭弹框
  closeModal: function () {
    this.setData({
      showAddPlaceModal: false,
      newPlaceName: '',
      newPlaceType: '',
    });
  },

  // 输入地点名称
  handlePlaceNameInput: function (e) {
    this.setData({
      newPlaceName: e.detail.value
    });
  },

  // 输入地点类型
  handlePlaceTypeInput: function (e) {
    this.setData({
      newPlaceType: e.detail.value
    });
  },

  // 确认添加地点
  addPlace: function () {
    const { newPlaceName, newPlaceType, newPlaceLatitude, newPlaceLongitude } = this.data;

    if (!newPlaceName || !newPlaceType) {
      wx.showToast({
        title: '请输入完整的地点信息',
        icon: 'none',
      });
      return;
    }

    // 将新地点数据上传到云数据库
    const db = wx.cloud.database();
    db.collection('location').add({
      data: {
        name: newPlaceName,
        type: newPlaceType,
        latitude: newPlaceLatitude,
        longitude: newPlaceLongitude,
        width: "30",
        height: "30"
      }
    })
    .then(res => {
      wx.showToast({
        title: '地点添加成功',
        icon: 'success',
      });
      this.setData({
        showAddPlaceModal: false,
      });
      // 可选择更新地图标记或重新加载数据
    })
    .catch(err => {
      console.error('添加地点失败:', err);
      wx.showToast({
        title: '添加地点失败',
        icon: 'none',
      });
    });
  }
});
