// pages/me/me.js
Page({
  data: {
  loginOK: false,
  avatarUrl: ""
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
  
  // 选择头像并上传
  chooseAvatar() {
    wx.chooseImage({
      count: 1,  // 选择1张图片
      sizeType: ['original', 'compressed'], // 可以选择原图或者压缩图
      sourceType: ['album', 'camera'], // 可以选择相册或拍照
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]; // 获取图片路径

        // 上传图片到云存储
        wx.cloud.uploadFile({
          cloudPath: 'avatars/' + Date.now() + '.png',  // 云存储中的路径
          filePath: tempFilePath,  // 本地文件路径
          success: (uploadRes) => {
            console.log('上传成功', uploadRes);

            // 获取文件的云存储路径
            const fileID = uploadRes.fileID;

            // 保存文件ID到数据库或本地
            this.saveAvatarUrl(fileID);
          },
          fail: (err) => {
            console.error('上传失败', err);
          },
        });
      },
      fail: (err) => {
        console.error('选择图片失败', err);
      },
    });
  },

  // 保存头像URL到云数据库
  saveAvatarUrl(fileID) {
    const db = wx.cloud.database();
    const usersCollection = db.collection('user');  // 假设你有一个用户信息集合

    usersCollection.add({
      data: {
        picUrl: fileID,  // 保存云存储中的文件ID
        name: this.data.name,
      },
      success: (res) => {
        console.log('头像保存成功', res);
        this.setData({
          avatarUrl: fileID,  // 更新页面上的头像URL
        });
      },
      fail: (err) => {
        console.error('保存头像失败', err);
      },
    });
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
  },

  mainpage(){
    wx.navigateTo({
      url: '/pages/map/index',
     })
  }

  })
