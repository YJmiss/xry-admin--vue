import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import VueCookie from 'vue-cookie' // api: https://github.com/alfhen/vue-cookie
import httpRequest from '@/utils/httpRequest' // api: https://github.com/axios/axios
import { isAuth } from '@/utils'
import cloneDeep from 'lodash/cloneDeep'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import 'element-ui/lib/theme-chalk/index.css'
import '@/styles/index.scss' // global css
import '@/element-ui' // api: https://github.com/ElemeFE/element
import '@/element-ui-theme'
import '@/assets/scss/index.scss'
import '@/icons' // icon
Vue.use(VueCookie)
Vue.config.productionTip = false

// 引入axios
import axios from 'axios'
Vue.prototype.$ajax = axios;

// 引入jquery.js
import $ from 'jquery'
Vue.prototype.$jquery=$

// vue-quill-editor富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 挂载全局
Vue.prototype.$http = httpRequest// ajax请求方法
Vue.prototype.isAuth = isAuth // 权限方法

// 引入socket
// import VueSocketio from 'vue-socket.io';
// import socketio from 'socket.io-client';
// Vue.use(VueSocketio, socketio('http://127.0.0.1:9001'), store);

// 保存整站vuex本地储存初始状态
window.SITE_CONFIG['storeState'] = cloneDeep(store.state)

//富文本编辑器
import '../static/UE/ueditor.config.js'
import '../static/UE/ueditor.all.js'
import '../static/UE/lang/zh-cn/zh-cn.js'
import '../static/UE/ueditor.parse.js'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  render: h => h(App)
});
