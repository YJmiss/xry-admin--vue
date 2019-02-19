<template>
<div id="container">
<h2>分销配置</h2>
<el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="150px">
<el-form-item label="佣金占比：" prop='distributeFee'>
<el-input  type="number" v-model="dataForm.distributeFee"></el-input>&nbsp;&nbsp;%&nbsp;&nbsp;
<span class="textTips">指佣金占课程价格的比例</span>
</el-form-item>
<el-form-item label="可提现金额：" prop="cashWithdrawal">
<el-input type="number"  v-model="dataForm.cashWithdrawal"></el-input>&nbsp;&nbsp;&nbsp;元&nbsp;&nbsp;&nbsp;
<span class="textTips">用户佣金余额为多少时可以提现</span>
</el-form-item>
<el-button type="primary" @click="dataFormSubmit()" v-if="isAuth('sys:distribution:all')">配置</el-button>
</el-form>
</div>
</template>
<script>
export default {
data(){
return{
dataList:[],
dataForm:{
distributeFee:'',
cashWithdrawal:''
},
dataRule: {
distributeFee:[
{required: true, message: '分销占比必须设置', trigger: 'blur' }
],
cashWithdrawal: [
 {required: true, message: '可提现金额必须设置', trigger: 'blur' }
]  
}
}   
},
activated(){
this.getDataList()
},
methods:{
//获取数据
getDataList(){
this.$http({
url: this.$http.adornUrl('/sys/distribution/config'),
method: 'get',
params: this.$http.adornParams()    
 }).then(({ data }) => {
if (data && data.code === 0) {
   this.dataForm.distributeFee = data.config.distributeFee
   this.dataForm.cashWithdrawal  = data.config.cashWithdrawal
} else {
}   
})
},
//提交表单
dataFormSubmit(){
this.$refs['dataForm'].validate((valid) => {
if (valid) {
   this.$http({
      url: this.$http.adornUrl('/sys/distribution/saveConfig'),
      method: 'post',
      data: this.$http.adornData({
       'distributeFee' :this.dataForm.distributeFee,
       'cashWithdrawal':this.dataForm.cashWithdrawal
      })
    }).then(({ data }) => {
      if (data && data.code === 0) {
        this.$message({
          message: '操作成功',
          type: 'success',
          duration: 1500,
          onClose: () => {
          this.visible = false
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
.el-input{
width: 30%;
}
.textTips{
color:#1f48cf;
font-size: 13px;
}
.el-form{
margin-top: 40px;
}
h2{
padding-bottom: 10px;
border-bottom: solid 1px #f0f0f0;
}
.el-button{
  width: 120px;
  margin-left:18%;
}
</style>



