<template>  
<div >
<el-form :label-position="labelPosition" status-icon label-width="100px" :model="authForm" :rules="dataRule" ref="authForm"  @keyup.enter.native="formSubmit()">
  <div class='explain'>
  1.在公众平台申请接口使用的<span class="red">AppId</span>和<span class="red">AppSecret</span>，然后填入下边表单。<br>
  2.<span class="red">服务认证号</span>请在微信公众平台<span class="red">开发者中心->网页服务->网页账号->网页授权获取用户基本信息</span>设置授权回调页面域名
   </div>
  <el-form-item label="微信号" prop="number">
    <el-input v-model="authForm.number"></el-input>
  </el-form-item>
  <el-form-item label="AppId" prop="appId">
    <el-input v-model="authForm.appId"></el-input>
  </el-form-item>
  <el-form-item label="AppSecret" prop="secret">
    <el-input v-model="authForm.secret"></el-input>
  </el-form-item>
  <el-form-item label="公众号类型" prop="type">
    <el-radio-group v-model="radio">
    <el-radio :label="1">订阅号</el-radio>
    <el-radio :label="2">订阅号认证</el-radio>
    <el-radio :label="3">服务号</el-radio>
     <el-radio :label="4">服务号认证</el-radio>
  </el-radio-group>
  </el-form-item>
  <el-button type="primary" class="formSubmit" @click="formSubmit">提交</el-button>
</el-form>
</div>
</template>
<script>
export default {
    data(){
return{
   labelPosition: 'right',
       radio:4,
       authForm: {
         number: '',
         appId: '',
         secret: '',
         type:''
         },
         dataRule: {
           appId:[
            { required: true, message: '请输入AppId', trigger: 'blur' },
           ],
          secret:[
            {required:true, message: '请输入AppSecret', trigger: 'blur' },
          ],
          type:[
            { required:true, message: '请选择公众号类型', trigger: 'blur' },
          ]
          }
    }
    },
    methods:{
  // 提交表单
      formSubmit () {
        this.$refs['authForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl('/sys/weChatAuthConfig'),
              method: 'post',
              data: this.$http.adornData({
                'number': this.authForm.number,
                'appId': this.authForm.appId,
                'secret': this.authForm.secret,
                'type': this.authForm.type
              })
            }).then(({ data }) => {
              if (data && data.code === 0) {
               alert("微信授权配置成功！")
              } else{
              this.$message.error(data.msg)
              }
            })
          }
        })
      }
    }
}
</script>
<style  scoped>
html, body{
  margin: 0px;
  padding: 0px;
}
.el-form{
  clear:both;
  height:auto;
  padding: 0px;
}
.el-form-item{
display: flex;
justify-content:left;
align-items: center;
margin-left: 350px;
}
.el-form-item label{
  padding: 0px;
}
.el-input{
  width: 500px;
  padding:0;
  margin-left:-50px;
}
.el-input_inner{
  padding: 0px;
}
.explain{
 padding: 10px 0px 10px 20px;
 background: #f1f1f1;
 margin-bottom: 50px;
 width:100%;
 line-height:30px;
 }
 .red{
  color: #ff0000;
 }
 .formSubmit{
   width: 500px;
   height:44px;
   margin-top:36px;
   margin-left:500px;
 }
</style>

