<template>  
<div >
<el-form :label-position="labelPosition" status-icon label-width="90px" :model=" payForm" :rules="dataRule" ref=" payForm"  @keyup.enter.native="formSubmit()">
  <div class='explain'>
 1.微信<span class="red">商户号</span>必须跟<span class="red">微信公众号匹配</span>，否则将导致支付失败
   </div>
  <el-form-item label="商户号" prop="merchantNumber">
    <el-input v-model="payForm.merchantNumber"></el-input>
  </el-form-item>
  <el-form-item label="商户秘钥" prop="secretKey">
    <el-input v-model=" payForm.secretKey"></el-input>
  </el-form-item>
  <el-form-item label="交易类型" prop="tradeType">
   <el-select v-model="value" placeholder="请选择">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>
  </el-form-item>
  <el-form-item label="签名类型" prop="signType">
      <el-select v-model="value2" placeholder="请选择">
    <el-option
      v-for="item in options2"
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
        merchantNumber: '',
         secretKey: '',
         tradeType: '',
         signType:''
         },
          options: [{
          value: '1',
          label: 'JSAPI'
        }],
        value: '',
          options2: [{
          value: '1',
          label: 'MD5'
        }],
        value2: '',
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
.el-input,.el-select{
  width: 500px;
  padding:0;
  margin-left:-50px;
}
.el-input_inner{
  padding: 0px;
}
.explain{
 padding: 20px 0 20px 20px;
 background: #f1f1f1;
 margin-bottom: 50px;
 width:100%;
 }
 .red{
  color: #ff0000;
 }
 .formSubmit{
   width: 500px;
   height:44px;
   margin-top:40px;
   margin-left: 480px;
 }
</style>

