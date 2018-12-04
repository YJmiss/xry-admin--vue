<template>
  <div id="app">
    <router-view/> 
  </div>
</template>

<script>
export default{
 data () {
  return {
  
  }
 },
 methods: {
   //初始化weosocket
   initWebSocket(){ 
    const wsuri = `http://127.0.0.1:9001/xry/messageSocket/`
    this.websock = new WebSocket(wsuri);
    this.websock.onmessage = this.websocketonmessage;
    this.websock.onopen = this.websocketonopen;
    this.websock.onerror = this.websocketonerror;
    this.websock.onclose = this.websocketclose;
  },
  // 连接建立之后执行send方法发送数据
  websocketonopen(){ 
    this.websocketsend(this.user)
    console.log(111);
  },
  // 连接建立失败重连
  websocketonerror(){
    this.initWebSocket()
  },
  // 数据接收
  websocketonmessage(e){
    let _this = this 
    if (e.data == '连接成功') {//这个判断是我业务需求才加的
      return
    }
   //业务需求，将socket接收到的值存进vuex
    _this.$store.store.dispatch('RESET_ID') //先调用reset方法置空vuex > store里面的scorketId（为什么置空，下面标题3解释）
    _this.$store.store.dispatch('SAVE_ID', JSON.parse(e.data).areaId) //重新给store中的scorketId赋值（数据格式问题先转了json）
    // console.log(_this.$store.store.state.scorketId);
  },
  //数据发送
  websocketsend(Data){
    this.websock.send(Data)
  },
  //关闭
  websocketclose(e){  
    console.log('断开连接', e)
  }
 } 
}

</script>
