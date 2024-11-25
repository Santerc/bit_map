//获取应用实例
var app = getApp();
var amapFile = require('../../utils/amap-wx.js');
Page({
  data: {
    fullscreen: false,
    latitude: 39.735678,
    longitude: 116.171271,
    buildlData: app.globalData.map,
    windowHeight: "",
    windowWidth: "",
    isSelectedBuild: 0,
    isSelectedBuildType: 0,
    imgCDN: app.imgCDN,
    islocation: true,
    bottomBarBottom: '-200rpx',
    startY: 0, // 触摸开始位置
    isDragging: false, // 是否正在拖动 
  },
  onLoad: function () {
    wx.cloud.init();
    wx.showShareMenu({
      withShareTicket: true
    })
    var _this = this;
    this.setData({
      bottomBarBottom: '-200rpx',
    })
    wx.getSystemInfo({
      success: function (res) {
        //获取当前设备宽度与高度，用于定位控键的位置
        _this.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
        })
        console.log(res.windowWidth)
      }
    })
    //载入更新后的数据
    this.fetchBuildingTypes();
    this.fetchPositions();
  },

  // 显示底部栏
  showBottomBar() {
    this.setData({
      bottomBarBottom: '0rpx', // 拉起底部栏
    });
  },

  // 收起底部栏
  closeBottomBar() {
    this.setData({
      bottomBarBottom: '-200rpx', // 隐藏底部栏
    });
  },

  // 从云数据库获取地点数据
  fetchPositions: function () {
    const db = wx.cloud.database();
    db.collection('location')
      .get()
      .then(res => {
        console.log('从云端获取的地点数据:', res.data);

        // 处理数据：将数据按建筑类型分组或者直接用来显示
        const buildlData = this.processBuildingData(res.data);
        this.setData({
          type: buildlData // 更新数据
        });
      })
      .catch(err => {
        console.error('获取地点数据失败:', err);
      });
  },

  // 处理地点数据（例如按建筑类型分组）
  processBuildingData: function (data) {
    // 假设按 'type' 字段分组
    const buildlData = data.map(item => {
      return {
        name: item.name, // 建筑名称
        type: item.type, // 建筑类型
        id: item._id, // 唯一标识符
        latitude: item.latitude,
        longitude: item.longitude,

      };
    });

    return buildlData;
  },

  // 从数据库获取建筑数据
  fetchBuildingTypes: function () {
    const db = wx.cloud.database();
    db.collection('location') // 假设建筑物数据存储在 position 集合中
      .get()
      .then(res => {
        const buildings = res.data;

        // 将建筑物按类型分组
        const buildlData = this.groupByType(buildings);

        // 更新数据
        this.setData({
          buildlData: buildlData
        });
      })
      .catch(err => {
        console.error('获取建筑类型数据失败:', err);
      });
  },

  // 按类型分组建筑数据
  groupByType: function (buildings) {
    const groupedData = [];

    buildings.forEach(building => {
      const existingType = groupedData.find(item => item.type === building.type);

      if (existingType) {
        existingType.buildings.push(building);
      } else {
        groupedData.push({
          type: building.type,
          buildings: [building]
        });
      }
    });

    return groupedData;
  },

  // 点击建筑类型标签时触发的函数
  changePage: function (event) {
    const selectedIndex = event.currentTarget.id; // 获取被点击的建筑类型索引
    const selectedTypeData = this.data.buildlData[selectedIndex]; // 获取该类型的建筑物数据

    // 更新当前选中的建筑类型
    this.setData({
      isSelectedBuildType: selectedIndex
    });

    // 获取该建筑类型下所有建筑的坐标并标注
    const markers = selectedTypeData.buildings.map(building => ({
      id: building._id,
      latitude: parseFloat(building.latitude),
      longitude: parseFloat(building.longitude),
      title: building.name, // 使用建筑物名称作为标注标题
      iconPath: '/img/marker.png', // 自定义标注图标路径
      width: 30, // 图标宽度
      height: 30 // 图标高度
    }));

    // 更新地图标注数据
    this.setData({
      markers: markers
    });
  },

  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: app.globalData.introduce.name + ' - 校园导览',
      path: '/pages/map/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  regionchange(e) {
    // 视野变化
    // console.log(e.type)
  },
  markertap(e) {
    // 获取点击的标记 ID
    const buildingId = e.markerId;
  
    // 获取该建筑物的详细信息
    const selectedBuilding = this.data.buildlData.flatMap(item => item.buildings)
      .find(building => building._id === buildingId);
  
    if (selectedBuilding) {
      // 使用 wx.navigateTo 跳转到详情页，并传递建筑物 ID
      wx.navigateTo({
        url: `/pages/map/details?bid=${selectedBuilding._id}`,
      });
    }
    // 如果没有找到对应的建筑物，输出提示信息
    else {
      wx.showToast({
        title: '未找到该建筑物信息',
        icon: 'none',
      });
    }
  },

  navigateSearch() {
    wx.navigateTo({
      url: 'search'
    })
  },
  location: function () {
    var _this = this
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标  
      success: function (res) {
        app.globalData.latitude = res.latitude;
        app.globalData.longitude = res.longitude;
        _this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })
      }
    })
  },
  clickButton: function (e) {
    //console.log(this.data.fullscreen)
    //打印所有关于点击对象的信息
    this.setData({
      fullscreen: !this.data.fullscreen
    })
  },
  mydata() {
    wx.navigateTo({
      url: '/pages/usr/mydata',
    })
  },

  toggleAddressBar() {
    this.setData({
      showAddressBar: !this.data.showAddressBar,
    });
  },
})