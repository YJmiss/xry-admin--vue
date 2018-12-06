<template>  
<div >
<el-form :label-position="labelPosition" status-icon label-width="90px" :model=" payForm" :rules="dataRule" ref=" payForm"  @keyup.enter.native="formSubmit()">
  <el-form-item label="回复类型" prop="replyType">
   <el-select v-model="value" placeholder="请选择">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>
  </el-form-item>
  <el-form-item label="回复内容" prop="replyContent">
      <el-select v-model="value" placeholder="请选择">
    <el-option
      v-for="item in  replyContentList"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>
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
       payForm: {
        replyType: '',
        replyContent:''
         },
         replyContentList:[],
          options: [{
          value: '1',
          label: '文字消息'
        },{
           value: '2',
          label: '图文消息'
        }
        ],
        value: '',
         dataRule: {
          merchantNumber:[
            { required: true, message: '请输入商户号', trigger: 'blur' },
           ],
          secretKey:[
            {required:true, message: '请输入商户秘钥', trigger: 'blur' },
          ],
           tradeType:[
            { required:true, message: '请输入交易类型', trigger: 'blur' },
          ],
           signType:[
              { required:true, message: '请输入签名类型', trigger: 'blur' },
           ]
          }
    }
    },
    methods:{
  // 提交表单
      formSubmit () {
        this.$refs[' payForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl('/sys/weChatPayConfig'),
              method: 'post',
              data: this.$http.adornData({
                'merchantNumber': this. payForm.merchantNumber,
                'secretKey': this. payForm.secretKey,
                'tradeType': this. payForm.tradeType,
                'signType': this. payForm.signType
              })
            }).then(({ data }) => {
              if (data && data.code === 0) {
               alert("微信支付配置成功！")
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
  padding:30px;
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
.el-select{
  width: 500px;
  padding:0;
  margin-left:-50px;
}
 .formSubmit{
   width: 500px;
   height:44px;
   margin-top:30px;
   margin-left: 480px;
 }
</style>

