Page({
  data: {
    loginOK: false,
    avatarUrl: "",
    name: "",
  },

  // 页面加载时检查用户是否已登录
  onShow() {
    let user = wx.getStorageSync('user');
    if (user && user.name) {
      this.setData({
        loginOK: true,
        name: user.name,
        avatarUrl: user.picUrl || "", // 使用存储的头像URL
      });
    } else {
      this.setData({
        loginOK: false,
      });
    }
  },

  // 登录页面
  login() {
    wx.navigateTo({
      url: '/pages/usr/login',
    });
  },

  // 注册页面
  register() {
    wx.navigateTo({
      url: '/pages/usr/register',
    });
  },

  // 选择头像并上传
  chooseAvatar() {
    wx.chooseImage({
      count: 1, // 选择1张图片
      sizeType: ['original', 'compressed'], // 可以选择原图或压缩图
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

            // 保存头像URL到云数据库
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

  // 保存头像URL到数据库
  saveAvatarUrl(fileID) {
    const db = wx.cloud.database();
    const usersCollection = db.collection('user');  // 假设你有一个用户信息集合

    // 更新头像URL到数据库
    usersCollection.where({
      phone: wx.getStorageSync('user').phone, // 根据手机号更新
    }).update({
      data: {
        picUrl: fileID,  // 保存云存储中的文件ID
      },
      success: (res) => {
        console.log('头像保存成功', res);

        // 更新页面上的头像URL
        this.setData({
          avatarUrl: fileID,
        });

        // 更新本地存储的用户信息
        let user = wx.getStorageSync('user');
        user.picUrl = fileID;
        wx.setStorageSync('user', user);
      },
      fail: (err) => {
        console.error('保存头像失败', err);
      },
    });
  },

  // 退出登录
  logout() {
    wx.setStorageSync('user', null);
    this.setData({
      loginOK: false,
      avatarUrl: "",
      name: "",
    });
  },

  // 返回主页
  mainpage() {
    wx.navigateTo({
      url: '/pages/map/index',
    });
  },
});
