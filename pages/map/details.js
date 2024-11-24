Page({
  data: {
    building: {}, // 当前建筑物信息
    messages: [], // 当前建筑物的留言列表
    inputContent: "", // 留言输入框内容
    user: null, // 存储当前用户信息
  },

  // 页面加载时获取建筑物详情和留言
  onLoad: function (options) {
    const bid = options.bid; // 获取传递的建筑物 ID
    if (bid) {
      this.fetchBuildingDetails(bid); // 获取建筑物详情
      this.fetchMessages(bid); // 获取该建筑物的留言
    } else {
      console.error('建筑物 ID 无效');
    }

    // 获取当前用户信息（这里假设用户信息保存在本地存储中）
    const user = wx.getStorageSync('user');
    this.setData({ user });
  },

  // 获取建筑物详情
  fetchBuildingDetails: function (buildingId) {
    const db = wx.cloud.database();
    db.collection('location').doc(buildingId).get()
      .then(res => {
        this.setData({
          building: res.data
        });
      })
      .catch(err => {
        console.error('获取建筑详情失败:', err);
      });
  },

  // 获取指定建筑物的留言
  fetchMessages: function (buildingId) {
    const db = wx.cloud.database();
    db.collection('comment')
      .where({ posid: buildingId })  // 根据建筑物的 posid 查询留言
      .orderBy('timestamp', 'desc')  // 按时间倒序排列
      .get()
      .then(res => {
        this.setData({
          messages: res.data  // 将查询结果中的留言数据赋值给 messages
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

    const user = this.data.user;
    if (!user) {
      // 用户未登录，显示提示
      wx.showToast({
        title: '请登录后留言',
        icon: 'none',
      });
      return;
    }

    const author = user.name || '游客'; // 用户的昵称，如果没有则使用 '游客'
    const timestamp = new Date().toISOString(); // 留言时间
    const buildingId = this.data.building._id; // 当前建筑物的 ID
    const buildingName = this.data.building.name; // 当前建筑物名称

    // 构建留言对象
    const message = {
      author: author,
      content: content,
      liked: 0,
      userLikes: null,
      posid: buildingId, // 关联建筑物 ID
      rootcommentid: "0", // 根留言 ID（如果是直接留言，设置为 0）
      usrid: user._id || "\"f5835fa6674183f3003d5afb4047f615\"", // 用户 ID（假设从用户信息中获取，未登录时使用默认值）
    };

    // 将留言上传到云数据库
    const db = wx.cloud.database();
    db.collection('comment')
      .add({
        data: message
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
  },
  // 处理点赞和取消点赞功能
  likeMessage: function (e) {
    const user = wx.getStorageSync('user');
    const messageId = e.currentTarget.dataset.id;
    const db = wx.cloud.database();
    const messages = this.data.messages;

    // 查找留言
    const message = messages.find(item => item._id === messageId);
    if (message) {
      // 获取当前用户的点赞状态
      const userLikes = message.userLikes || [];
      const isUserLiked = userLikes.includes(user._id); // 检查当前用户是否已经点赞

      if (isUserLiked) {
        // 用户已经点赞，取消点赞
        const newLiked = message.liked - 1; // 点赞数减少
        const newUserLikes = userLikes.filter(userId => userId !== user._id); // 从已点赞用户中移除当前用户

        // 更新数据库：取消点赞
        db.collection('comment').doc(messageId).update({
          data: {
            liked: newLiked,
            userLikes: newUserLikes,  // 移除当前用户ID
          }
        })
        .then(() => {
          wx.showToast({
            title: '取消点赞成功',
            icon: 'success'
          });
          // 更新本地点赞数
          message.liked = newLiked;
          message.userLikes = newUserLikes;
          this.setData({
            messages: [...messages] // 更新数据
          });
        })
        .catch(err => {
          console.error('取消点赞失败:', err);
        });

      } else {
        // 用户没有点赞，进行点赞
        const newLiked = message.liked + 1; // 点赞数增加
        userLikes.push(user._id); // 将当前用户的ID添加到已点赞用户列表

        // 更新数据库：进行点赞
        db.collection('comment').doc(messageId).update({
          data: {
            liked: newLiked,
            userLikes: userLikes,  // 添加当前用户ID
          }
        })
        .then(() => {
          wx.showToast({
            title: '点赞成功',
            icon: 'success'
          });
          // 更新本地点赞数
          message.liked = newLiked;
          message.userLikes = userLikes;
          this.setData({
            messages: [...messages] // 更新数据
          });
        })
        .catch(err => {
          console.error('点赞失败:', err);
        });
      }
    }
  }
});
