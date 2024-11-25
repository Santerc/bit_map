Page({
  data: {
    // 团队信息
    teamInfo: {
      name: "题目四第三小组",
    },

    // 团队成员数据
    members: [
      { id: 1, name: "刘赜源", position: "后端，前端逻辑编写与地图API接入" },
      { id: 2, name: "郭恬源", position: "优化用户交互体验和界面设计" },
      { id: 3, name: "李博浩", position: "前端，前端界面编写及界面排版，地图API设置" },
      { id: 4, name: "梁嘉祎", position: "前端登录和注册以及数据库" },
      { id: 5, name: "路文慧", position: "后端，地图API查询" },
      { id: 6, name: "张云轩", position: "后端，数据库和软件测试" }
    ]
  },

  onLoad: function () {
    // 页面加载时可以进行一些初始化操作，现阶段无特别需求
  }
});
