<template>
<div>
 <el-tabs type="card" v-model="activeName" class="card" @tab-click="handleClick">
    <el-tab-pane label="微信授权配置" name="first"></el-tab-pane>
    <el-tab-pane label="微信支付配置" name="second"></el-tab-pane>
    <el-tab-pane label="关键词回复设置" name="fourth"></el-tab-pane>
    <el-tab-pane label="自定义菜单设置" name="fifth"></el-tab-pane>
  </el-tabs>
  <el-button type="primary" class="reset">重置缓存</el-button>
    <we-chat-auth v-show='WeChatAuthVisible' ref="WeChatAuth"></we-chat-auth>
    <we-chat-pay v-show="WeChatPayVisible" ref="WeChatPay"></we-chat-pay>
    <we-chat-key-reply v-show="WeChatKeyReplyVisible" ref="WeChatKeyReply"></we-chat-key-reply>
    <we-chat-custom-menu  v-show="WeChatCustomMenuVisible" ref="WeChatCustomMenu"></we-chat-custom-menu>
  </div>
</template>
<script>
import WeChatAuth from './weChat-authTable'
import WeChatPay from './weChat-payForm'
import WeChatKeyReply from './weChat-keyReplyTable'
import WeChatCustomMenu from './weChat-customMenu'
export default {
    components:{WeChatAuth,WeChatPay,WeChatKeyReply,WeChatCustomMenu},
     data(){
        return {
             activeName: 'first',
            WeChatAuthVisible:true,
            WeChatPayVisible:false,
            WeChatKeyReplyVisible:false,
            WeChatCustomMenuVisible:false
            }
         },
     methods:{
         handleClick(tab, event) {
            if ('first' == tab.name) {
             this.WeChatAuthVisible = true
             this.WeChatPayVisible = false
             this.WeChatKeyReplyVisible = false
             this.WeChatCustomMenuVisible = false
             this.weChatMaterialVisible = false
            } else if ('second' == tab.name) {
             this.WeChatAuthVisible = false
             this.WeChatPayVisible = true
             this.WeChatKeyReplyVisible = false
             this.WeChatCustomMenuVisible = false
             this.weChatMaterialVisible = false 
           }else if('fourth' == tab.name){
            this.WeChatAuthVisible = false
             this.WeChatPayVisible = false
             this.WeChatKeyReplyVisible = true
             this.WeChatCustomMenuVisible = false
             this.weChatMaterialVisible = false
           }else{
            this.WeChatAuthVisible = false
             this.WeChatPayVisible = false
             this.WeChatKeyReplyVisible = false
             this.WeChatCustomMenuVisible = true
             this.weChatMaterialVisible = false
           }
        }
     }
};
</script>
<style scoped>
.card{
    float: left;
    margin-bottom:20px;
}
.reset{
    float: right;
}
.clear{
    clear:both;
}

</style>
