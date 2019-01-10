<template>
<div id="container">
<h2>分销配置</h2>
<el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="150px">
<el-form-item label="分销占比：" prop='distributeFee'>
<el-input  type="number" v-model="dataForm.distributeFee"></el-input>&nbsp;&nbsp;%&nbsp;&nbsp;
<span class="textTips">分销占比=分销金额÷课程价格，（分销金额:抽取课程价格的百分之几用作“分销金额”）</span>
</el-form-item>
<el-form-item label="一级佣金占比：" prop="firstLevelFee" >
<el-input  type="number" v-model="dataForm.firstLevelFee"></el-input>&nbsp;&nbsp;%&nbsp;&nbsp;
<span class="textTips">一级佣金占比 = 一级佣金÷分销金额</span>
</el-form-item>
<el-form-item label="二级佣金占比：" prop="secondLevelFee">
<el-input  type="number" v-model="dataForm.secondLevelFee "></el-input>&nbsp;&nbsp;%&nbsp;&nbsp;
<span class="textTips">二级佣金占比 = 二级佣金÷分销金额</span>
</el-form-item>
<el-form-item label="可提现金额：" prop="cashWithdrawal">
<el-input type="number"  v-model="dataForm.cashWithdrawal"></el-input>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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
firstLevelFee:'',
secondLevelFee:'',
cashWithdrawal:''
},
dataRule: {
distributeFee:[
{required: true, message: '分销占比必须设置', trigger: 'blur' }
],
firstLevelFee: [
{required: true, message: '一级佣金占比必须设置', trigger: 'blur' }
],
secondLevelFee: [
 {required: true, message: '二级佣金占比必须设置', trigger: 'blur' }
],
cashWithdrawal: [
 {required: true, message: '可提现金额必须设置', trigger: 'blur' }
]  
}
}   
},
computed:{
checkCommission:function(){
return (parseInt(this.dataForm.firstLevelFee) + parseInt(this.dataForm.secondLevelFee))
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
   this.dataForm.firstLevelFee = data.config.firstLevelFee
   this.dataForm.secondLevelFee = data.config.secondLevelFee
   this.dataForm.cashWithdrawal  = data.config.cashWithdrawal
} else {
}   
})
},
//提交表单
dataFormSubmit(){
this.$refs['dataForm'].validate((valid) => {
if (valid) {
if(100 !== this.checkCommission){
    this.$confirm(`请输入规范的佣金占比值，“一级佣金占比” 加上 “二级佣金占比”的和为100%`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).catch(() => {})
   }else{
   this.$http({
      url: this.$http.adornUrl('/sys/distribution/saveConfig'),
      method: 'post',
      data: this.$http.adornData({
       'distributeFee' :this.dataForm.distributeFee,
       'firstLevelFee' :this.dataForm.firstLevelFee,
       'secondLevelFee' :this.dataForm.secondLevelFee,
       'cashWithdrawal' :this.dataForm.cashWithdrawal
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



