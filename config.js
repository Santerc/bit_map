module.exports = {
  // 调试模式开关，调试模式下只调用本地数据
  debug: true,
  // 学校数据配置名称，学校英文缩写
  school: "bit",
  // 高德路线规划密钥，必须加入https://restapi.amap.com为request合法域名
  // 密钥申请地址http://lbs.amap.com/api/javascript-api/summary/
  key: "e2578bfb3e067fa49994044edb227a3b", 
  // 地图更新地址，用于热修补，无需每次都提交审核
  updateUrl: "https://www.qq.com/json.json",
  // 图片CDN域名
  imgCDN: "https://www.gxgkcat.com/"
}