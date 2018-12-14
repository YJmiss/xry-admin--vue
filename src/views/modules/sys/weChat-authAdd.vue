<template>  
<el-dialog 
  :title="!authForm.id ? '新增' : ''"
  :close-on-click-modal="false"
  :visible.sync="visible">
  <el-form  label-width="80px" :model="authForm" :rules="dataRule" ref="authForm"  @keyup.enter.native="formSubmit()">
  <el-form-item label="微信号" prop="weixinAccount">
    <el-input v-model="authForm.weixinAccount"></el-input>
  </el-form-item>
  <el-form-item label="AppId" prop="appId">
    <el-input v-model="authForm.appId"></el-input>
  </el-form-item>
  <el-form-item label="AppSecret" prop="appSecret">
    <el-input v-model="authForm.appSecret"></el-input>
  </el-form-item>
   <el-button type="primary" @click="formSubmit()" class="submit">提交</el-button>
  </el-form>
</el-dialog>
</template>
<script>
export default {
    data(){
    return{
      visible:false,
       authForm:{
        id:'',
        weixinAccount: '',
        appId: '',
        appSecret: '',
        gzhType:2
         },
         dataRule: {
           weixinAccount:[
           { required: true, message: '请输入微信号', trigger: 'blur' },
           ],
           appId:[
            { required: true, message: '请输入AppId', trigger: 'blur' },
           ],
           appSecret:[
            {required:true, message: '请输入AppSecret', trigger: 'blur' },
            ]
          }
    }
    },
    methods:{
       //初始化数据
    init (){
     this.visible =true
      },
  // 提交表单
      formSubmit () {
        this.$refs['authForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl('/sys/weChatAuthConfig'),
              method: 'post',
              data: this.$http.adornData({
                'weixinAccount': this.authForm.weixinAccount,
                'appId': this.authForm.appId,
                'appSecret':this.authForm.appSecret,
                'gzhType':this.authForm.gzhType
              })
            }).then(({ data }) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                    this.$emit('refreshDataList')
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      }
    }
}
</script>
<style scoped>
.el-form{
  width: 80%;
  justify-content:center;
  margin-left: 20%;
}
.el-input{
  margin-left: 20px;
  width: 60%;
}
.submit{
  position: relative;
  left: 26%;
  width: 180px;
}
</style>

