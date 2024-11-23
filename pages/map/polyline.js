var app = getApp();
var amapFile = require('../../utils/amap-wx.js');

Page({
  data: {
    latitude: null,
    longitude: null,
    markers: [],
    distance: '',
    polyline: []
  },

  onLoad: function (options) {
    var _this = this;

    // 设置初始经纬度
    _this.setData({
      longitude: app.globalData.longitude,
      latitude: app.globalData.latitude
    });

    // 获取当前位置并规划路径
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log("当前位置获取成功:", res);
        app.globalData.latitude = res.latitude;
        app.globalData.longitude = res.longitude;

        _this.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });

        // 调用路径规划
        _this.routing(options);
      },
      fail: function () {
        console.error("定位失败");
        wx.showModal({
          title: '无法使用该功能',
          content: '请点击右上角在“关于校园导览”设置中给予定位权限',
          showCancel: false,
          success: function () {
            wx.navigateBack({
              delta: 1
            });
          }
        });
      }
    });
  },

  routing: function (options) {
    var _this = this;

    // 计算大致距离
    let distance = Math.abs(_this.data.longitude - options.longitude) + Math.abs(_this.data.latitude - options.latitude);
    console.log("大致距离（曼哈顿距离）:", distance);

    var myAmapFun = new amapFile.AMapWX({ key: require('../../config.js').key });

    // 路线规划参数
    let routeData = {
      origin: `${options.longitude},${options.latitude}`,
      destination: `${_this.data.longitude},${_this.data.latitude}`,
      success: function (data) {
        console.log("路线规划成功:", data);

        // 解析路径点数据
        var points = [];
        if (data.paths && data.paths[0] && data.paths[0].steps) {
          var steps = data.paths[0].steps;
          for (var i = 0; i < steps.length; i++) {
            var poLen = steps[i].polyline.split(';');
            for (var j = 0; j < poLen.length; j++) {
              points.push({
                longitude: parseFloat(poLen[j].split(',')[0]),
                latitude: parseFloat(poLen[j].split(',')[1])
              });
            }
          }
        }

        // 设置标记点和路径
        _this.setData({
          markers: [
            {
              width: "25",
              height: "35",
              iconPath: "/img/mapicon_end.png",
              latitude: options.latitude,
              longitude: options.longitude
            },
            {
              width: "25",
              height: "35",
              iconPath: "/img/mapicon_start.png",
              latitude: _this.data.latitude,
              longitude: _this.data.longitude
            }
          ],
          polyline: [
            {
              points: points,
              color: "#040607",
              width: 6 // 路径线宽度优化
            }
          ]
        });

        // 显示距离信息
        if (data.paths[0] && data.paths[0].distance) {
          _this.setData({
            distance: `${data.paths[0].distance}米`
          });
        }
      },
      fail: function (error) {
        console.error("路线规划失败:", error);
      }
    };

    // 判断步行或驾车
    if (distance < 0.85) {
      console.log("选择步行路径");
      myAmapFun.getWalkingRoute(routeData);
    } else {
      console.log("选择驾车路径");
      myAmapFun.getDrivingRoute(routeData);
    }
  }
});
