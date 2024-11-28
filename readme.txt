校园智图

 一款北理工智能生活地图微信小程序

 使用方法
使用微信开发者应用打开，新建user，comment，location数据库，将cloud_sql文件夹中的json文件导入location数据库中，编译，开袋既食！
结构
├─cloud_sql
├─img
│  ├─background
│  └─ico
├─pages
│  ├─introduce  团队介绍
│  ├─map  地图主界面相关
│  ├─usr  用户操作相关
│  └─web-views
├─resources
└─utils
致谢
本项目采用了部分莞香广科团队 http://www.gxgkcat.com 的 ico 项目布局与实现思路(调用API完成导航实现)，在此对其开源精神表示感谢

注：更详细的README可以查看本项目正式readme.md
