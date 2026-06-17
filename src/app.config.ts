export default defineAppConfig({
  pages: [
    'pages/material/index',
    'pages/mixing/index',
    'pages/process/index',
    'pages/product/index',
    'pages/order/index',
    'pages/customer/index',
    'pages/sales/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#8B4513',
    navigationBarTitleText: '匠心笔坊',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FDF5E6',
  },
  tabBar: {
    color: '#7a7a7a',
    selectedColor: '#8B4513',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/material/index',
        text: '原料',
      },
      {
        pagePath: 'pages/mixing/index',
        text: '配料',
      },
      {
        pagePath: 'pages/process/index',
        text: '工序',
      },
      {
        pagePath: 'pages/product/index',
        text: '成品',
      },
      {
        pagePath: 'pages/order/index',
        text: '订单',
      },
    ],
  },
});
