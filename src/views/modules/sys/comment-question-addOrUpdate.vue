<template>
<el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
<el-form :inline="true" :model="dataForm" @keyup.enter.native="dataFormSubmit()" :rules="dataRule">
<el-form-item label="问题标题" style="position:relative;left:-50px;">
<el-input v-model="dataForm.title" placeholder="请输入问题标题" clearable style="width:300px;"></el-input>   
</el-form-item><br>
<el-form-item label="问题答案">
<textarea  v-model="dataForm.answer" placeholder="请输入问题答案" style="width:400px;height:150px;resize:vertical;"></textarea>   
</el-form-item>
<el-button type="primary" style="margin-left:42%;width:180px;">提交</el-button>
</el-form>

</el-dialog>
</template>
<script>
export default {
data(){
return{
 dataForm:{
  id:'',
  title:'',
  answer:''
   },
   visible:false,
    dataRule: {
        title: [{ required: true, message: "请填写问题标题", trigger: "blur" }],
        answer: [
          { required: true, message: "请填写问题答案", trigger: "blur" }
        ]
      }   
  }
 },
 methods:{
   //初始化数据
   init(id){
   this.visible = true
   this.dataForm.id = id || 0;
   this.url = this.$http.adornUrl('');
    if (this.dataForm.id) {
                this.$http({
        url: this.$http.adornUrl(``),
        method: "get",
        params: this.$http.adornParams()
        }).then(({ data }) => {
        if (data && data.code === 0) {
        this.dataForm.title = data.question.title;
        this.dataForm.answer = data.question.answer
        }else {
        this.$message.error(data.msg)
        }
    })
    }
   },
   //提交表单
  dataFormSubmit(){
   this.$http({
        url:this.$http.adornUrl(''),
        method:'post',
        data: this.$http.adornData({
        'title': this.dataForm.title,
        'answer':this.dataForm.answer
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
    })
  } 
 }
}
</script>
<style scoped>
.el-form-item{
    display: flex;
    justify-content: center;
}
</style>



