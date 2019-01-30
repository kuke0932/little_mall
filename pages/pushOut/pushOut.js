// pages/pushOut/pushOut.js
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var user = require('../../utils/user.js');

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cash: 0,
    shareImage: '',
    shareUrl: '',
    qrcodeUrl: '',
    showPopup: false,
    totalPromotionMoney: 0,
    remainMoney: 0,
    promotionMoney: 0,
    hasLogin: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    that.setData({
      shareImage: wx.getStorageSync('shareImage')
    })

    if (app.globalData.hasLogin) {
      that.fatchData()
    } else {
      wx.redirectTo({
        url: '/pages/auth/login/login'
      });
    }

    this.setData({
      hasLogin: app.globalData.hasLogin
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  fatchData() {
    const that = this
    util.request(api.GetShareUrl).then(function (res) {
      that.setData({
        shareUrl: res.data.data
      })
    })
    util.request(api.GetPurseMoney).then(function (res) {
      that.setData({
        totalPromotionMoney: (res.data.totalPromotionMoney).toFixed(2),
        remainMoney: (res.data.remainMoney).toFixed(2),
        promotionMoney: (res.data.promotionMoney).toFixed(2)
      })
    })
    util.request(api.GetQrCode).then(function (res) {
      that.setData({
        qrcodeUrl: res.data.url
      })
    })
  },
  // 打开提现对话框
  getCash() {
    const that = this
    this.setData({
      showCashPopup: !this.data.showCashPopup,
      cash: 0
    })
  },
  // 获取输入金额
  getValue(event) {
    var value = (event.detail.value).replace(/\.{2,}/g, ".") // 只能输入一个小数点
    var arr = (value).split('.')[1] || []
    if (arr.length > 2) {
      this.setData({
        cash: parseFloat(value).toFixed(2)
      })
    } else {
      this.setData({
        cash: value
      })
    }
  },
  // 确认提现
  confirmCash() {
    const that = this
    this.setData({
      cash: parseFloat(that.data.cash)
    })
    if (this.data.cash === 0) {
      wx.showToast({
        title: '请输入正确的金额',
        icon: 'none',
        duration: 2000
      })
      return
    }
    util.request(api.DrawCash, {cash: that.data.cash}, "POST").then(function(res){
      if (res.errno) {
        wx.showToast({
          title: res.errmsg,
          icon: 'none',
          duration: 2000
        })
      } else {
        wx.showToast({
          title: '提现成功',
          icon: 'success',
          duration: 1000
        })
        util.request(api.GetPurseMoney).then(function (res) {
          that.setData({
            totalPromotionMoney: (res.data.totalPromotionMoney).toFixed(2),
            remainMoney: (res.data.remainMoney).toFixed(2),
            promotionMoney: (res.data.promotionMoney).toFixed(2)
          })
        })
        that.cancelCash()
      }
    })
  },
  // 取消提现 关闭对话框
  cancelCash() {
    this.setData({
      showCashPopup: false
    })
  },
  // 打开二维码
  showPopup() {
    this.setData({
      showPopup: !this.data.showPopup
    })
  },
  // 关闭二维码啊
  closePopup() {
    this.setData({
      showPopup: false
    })
  },
  // 保存二维码
  saveQrcode() {
    let that = this;
    wx.downloadFile({
      url: that.data.qrcodeUrl,
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (res) {
            wx.showModal({
              title: '保存成功',
              content: '图片成功保存到相册了，可以分享给朋友了！',
              showCancel: false,
              confirmText: '好的',
              confirmColor: '#47B34F',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定');
                }
              }
            });
            wx.hideLoading();
          },
          fail: function (res) {
            console.log('fail')
          }
        })
      },
      fail: function () {
        console.log('fail')
      }
    })
  },
  // 无用事件
  doNothing() {
    return
  },
   /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let that = this;
    console.log(that.data.shareUrl, that.data.shareImage)  
    return {
      desc: '富锌鹌鹑蛋',
      path: that.data.shareUrl,
      imageUrl: that.data.shareImage,
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: "分享成功",
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        // 分享失败
      }
    }
  }
})