<template>
<div>
 <el-tabs  type="card" class="card" @tab-click="handleClick">
    <el-tab-pane label="微信授权配置" name="first"></el-tab-pane>
    <el-tab-pane label="微信支付配置" name="second"></el-tab-pane>
    <el-tab-pane label="首次关注设置" name="third"></el-tab-pane>
    <el-tab-pane label="关键词回复设置" name="fourth"></el-tab-pane>
    <el-tab-pane label="自定义菜单设置" name="fifth"></el-tab-pane>
  </el-tabs>
  <el-button type="primary" class="reset">重置缓存</el-button>
    <we-chat-auth v-show='WeChatAuthVisible' ref="WeChatAuth"></we-chat-auth>
    <we-chat-pay v-show="WeChatPayVisible" ref="WeChatPay"></we-chat-pay>
    <we-chat-follow v-show="WeChatFollowVisible" ref="WeChatFollow"></we-chat-follow>
    <we-chat-key-reply v-show="WeChatKeyReplyVisible" ref="WeChatKeyReply"></we-chat-key-reply>
    <we-chat-custom-menu  v-show="WeChatCustomMenuVisible" ></we-chat-custom-menu>
  </div>
</template>
<script>
import WeChatAuth from './weChat-authTable'
import WeChatPay from './weChat-payForm'
import WeChatFollow from './weChat-firstFollowForm'
import WeChatKeyReply from './weChat-keyReplyTable'
import WeChatCustomMenu from './weChat-customMenu'
export default {
    components:{WeChatAuth,WeChatPay,WeChatFollow,WeChatKeyReply,WeChatCustomMenu},
     data(){
        return {
            WeChatAuthVisible:true,
            WeChatPayVisible:false,
            WeChatFollowVisible:false,
            WeChatKeyReplyVisible:false,
            WeChatCustomMenuVisible:false
        }
     },
     methods:{
         handleClick(tab, event) {
            console.log(tab.name)
            if ('first' == tab.name) {
             this.WeChatAuthVisible = true
             this.WeChatPayVisible = false
             this.WeChatFollowVisible = false
             this.WeChatKeyReplyVisible = false
             this.WeChatCustomMenuVisible = false
            } else if ('second' == tab.name) {
            this.WeChatAuthVisible = false
             this.WeChatPayVisible = true
             this.WeChatFollowVisible = false
             this.WeChatKeyReplyVisible = false
             this.WeChatCustomMenuVisible = false
              
           } else if('third' == tab.name){
            this.WeChatAuthVisible = false
             this.WeChatPayVisible = false
             this.WeChatFollowVisible = true
             this.WeChatKeyReplyVisible = false
             this.WeChatCustomMenuVisible = false
           }else if('fourth' == tab.name){
            this.WeChatAuthVisible = false
             this.WeChatPayVisible = false
             this.WeChatFollowVisible = false
             this.WeChatKeyReplyVisible = true
             this.WeChatCustomMenuVisible = false
           }else{
            this.WeChatAuthVisible = false
             this.WeChatPayVisible = false
             this.WeChatFollowVisible = false
             this.WeChatKeyReplyVisible = false
             this.WeChatCustomMenuVisible = true
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
    margin-right:50%;
}
.clear{
    clear:both;
}

</style>
