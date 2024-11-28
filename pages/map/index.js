const PAGE_SIZE = 20;  // 每次请求的条数

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 获取应用实例
var app = getApp();
var amapFile = require('../../utils/amap-wx.js');

Page({
  data: {
    fullscreen: false,
    latitude: 39.735678,
    longitude: 116.171271,
    buildlData: [],  // 初始为空数组
    windowHeight: "",
    windowWidth: "",
    isSelectedBuild: 0,
    isSelectedBuildType: 0,
    imgCDN: app.imgCDN,
    islocation: true,
    bottomBarBottom: '-200rpx',
    startY: 0, // 触摸开始位置
    isDragging: false, // 是否正在拖动
    page: 1,  // 初始化页码
    hasMore: true,  // 初始状态假设有更多数据
    isLoading: false,  // 是否正在加载
  },

  onLoad: function () {
    wx.cloud.init();
    wx.showShareMenu({
      withShareTicket: true
    });

    // 获取设备信息
    var _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
        });
      }
    });

    // 初始化页码和是否有更多数据
    this.setData({
      page: 1,
      hasMore: true,
      buildlData: [],
    });

    // 初始加载数据
    this.fetchBuildingTypes();
    this.fetchPositions();
  },

  onShow: function () {
    this.fetchBuildingTypes();
    this.fetchPositions();
  },

  showBottomBar() {
    this.setData({
      bottomBarBottom: '0rpx', // 拉起底部栏
    });
  },

  closeBottomBar() {
    this.setData({
      bottomBarBottom: '-200rpx', // 隐藏底部栏
    });
  },

  // 获取地点数据（分页处理）
  fetchPositions: function () {
  // 防止在正在加载或没有更多数据时重复请求
  if (this.data.isLoading || !this.data.hasMore) {
    console.log("No more data or loading in progress.");
    return;
  }

  // 设置为加载中状态
  this.setData({
    isLoading: true,
  });

  var db = wx.cloud.database();
  var { page } = this.data;
  
  // 查询数据
  db.collection('location')
    .skip((page - 1) * PAGE_SIZE)  // 根据页码跳过数据
    .limit(PAGE_SIZE)  // 每次查询 20 条数据
    .get()
    .then(res => {
      console.log('从云端获取的地点数据:', res.data);

      // 判断是否有更多数据
      var hasMore = res.data.length === PAGE_SIZE;
      console.log('更多？:', res.data.length);

      // 处理数据：按建筑类型分组或直接显示
      var newBuildlData = this.processBuildingData(res.data);

      // 去重：确保新加载的数据不与现有数据重复
      var allData = this.data.buildlData.concat(newBuildlData);
      var uniqueData = this.removeDuplicates(allData);

      // 更新数据
      this.setData({
        buildlData: uniqueData,  // 合并去重后的新数据
        page: hasMore ? this.data.page + 1 : this.data.page,  // 增加页码
        hasMore: hasMore,  // 更新是否有更多数据
        isLoading: false,  // 设置为加载完成
      });

      // 如果没有更多数据
      if (!hasMore) {
        console.log("No more data to load.");
      }
    })
    .catch(err => {
      console.error('获取地点数据失败:', err);
      this.setData({
        isLoading: false,  // 设置加载完成
      });
    });
},


  // 处理地点数据（例如按建筑类型分组）
  processBuildingData: function (data) {
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

  // 去重：通过 _id 确保每个建筑物只出现一次
  removeDuplicates: function (data) {
    const uniqueData = [];
    const seenIds = new Set();

    data.forEach(item => {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        uniqueData.push(item);
      }
    });

    return uniqueData;
  },

  // 获取建筑类型
  fetchBuildingTypes: function () {
    const db = wx.cloud.database();
    db.collection('location')
      .get()
      .then(res => {
        const buildings = res.data;
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

  changePage: function (event) {
    const selectedIndex = event.currentTarget.id;
    const selectedTypeData = this.data.buildlData[selectedIndex];

    // 更新当前选中的建筑类型
    this.setData({
      isSelectedBuildType: selectedIndex
    });

    const markers = selectedTypeData.buildings.map(building => ({
      id: building._id,
      latitude: parseFloat(building.latitude),
      longitude: parseFloat(building.longitude),
      title: building.name,
      iconPath: '/img/ico/景点.png',
      width: 30,
      height: 30
    }));

    // 更新地图标注数据
    this.setData({
      markers: markers
    });
  },

  // 监听页面触底事件，加载更多数据
  onReachBottom: function () {
    this.fetchPositions();
  },

  onShareAppMessage: function (res) {
    return {
      title: app.globalData.introduce.name + ' - 校园导览',
      path: '/pages/map/index',
    };
  },

  regionchange(e) {
    console.log(e.type);
  },

  markertap(e) {
    const buildingId = e.markerId;
    const selectedBuilding = this.data.buildlData.flatMap(item => item.buildings)
      .find(building => building._id === buildingId);

    if (selectedBuilding) {
      wx.navigateTo({
        url: `/pages/map/details?bid=${selectedBuilding._id}`,
      });
    } else {
      wx.showToast({
        title: '未找到该建筑物信息',
        icon: 'none',
      });
    }
  },

  navigateSearch() {
    wx.navigateTo({
      url: 'search'
    });
  },

  add() {
    wx.navigateTo({
      url: '/pages/map/add',
    });
  },

  location: function () {
    var _this = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        app.globalData.latitude = res.latitude;
        app.globalData.longitude = res.longitude;
        _this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        });
      }
    });
  },

  clickButton: function (e) {
    this.setData({
      fullscreen: !this.data.fullscreen
    });
  },

  mydata() {
    wx.navigateTo({
      url: '/pages/usr/mydata',
    });
  },

  toggleAddressBar() {
    this.setData({
      showAddressBar: !this.data.showAddressBar,
    });
  },
});
