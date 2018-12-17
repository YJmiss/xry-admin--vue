<template>  
<el-dialog  :title="!dataForm.id ? '首次关注设置' : ''" :close-on-click-modal="false" :visible.sync="visible">
<el-form  status-icon label-width="100px" :model=" dataForm" :rules="dataRule" ref=" dataForm"  @keyup.enter.native="formSubmit()">
  <el-form-item label="回复类型" prop="replyType">
   <el-select v-model="dataForm.replyType" placeholder="请选择">
    <el-option v-for="item in replyTypeList" :key="item.id" :label="item.replyType" :value="item.id"> </el-option>
  </el-select>
  </el-form-item>
  <el-form-item label="回复内容" prop="replyContent">
    <el-select v-model="dataForm.replyContent" placeholder="请选择">
    <el-option v-for="item in  replyContentList" :key="item.id" :label="item.replyContent" :value="item.id">
    </el-option>
  </el-select>
  </el-form-item>
  <el-button type="primary" class="formSubmit" @click="formSubmit()">提交</el-button>
</el-form>
</el-dialog>
</template>
<script>
export default {
    data(){
       return{
       visible:false,
       dataForm: {
         id:'',
        replyType: '',
        replyContent:'',
         },
        replyTypeList:[],
        replyContentList:[],
         dataRule: {
         replyType:[
            { required: true, message: '请选择恢复类型', trigger: 'blur' },
                ],
         replyContent:[
            {required:true, message: '请选择回复内容', trigger: 'blur' },
          ]}
        }
    },
    methods:{
      init(){
        this.visible=true
        },
  // 提交表单
      formSubmit () {
        this.$refs[' dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl('/sys/weChatPayConfig'),
              method: 'post',
              data: this.$http.adornData({
                'replyType': this.dataForm.replyType,
                'replyContent': this.dataForm.replyContent
              })
            }).then(({ data }) => {
              if (data && data.code === 0) {
               alert("首次关注设置成功！")
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
    justify-content:center;
    align-items: center;
    }
    .el-form-item label{
      padding: 0px;
    }
    .el-select{
      width: 250px;
      padding:0;
      margin-left:-50px;
    }
    .formSubmit{
      width: 250px;
      height:40px;
      margin-top:20px;
      position: relative;
      left:44%;

    }
    </style>

