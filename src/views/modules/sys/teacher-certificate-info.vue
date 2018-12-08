<template>
  <div class="mod-xryuser">
    <el-dialog  :title="!dataForm.id ? '' : '查看讲师认证资料详情'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :inline="true" :data="dataForm" >
     <el-form-item label="账号/昵称"  prop="nickname">
      <el-input type="text" v-model="dataForm.nickname" readonly="readonly" disabled="true"></el-input>
     </el-form-item><br>
      <el-form-item label="讲师姓名"  prop="name">
      <el-input type="text" v-model="dataForm.name" readonly="readonly" disabled="true"></el-input>
     </el-form-item><br>
      <el-form-item label="所属机构"  prop="organization">
      <el-input type="text" v-model="dataForm.organization" readonly="readonly" disabled="true"></el-input>
     </el-form-item><br>
      <el-form-item label="身份证号"  prop="IDnumber">
      <el-input type="text" v-model="dataForm.IDnumber" readonly="readonly" disabled="true"></el-input>
     </el-form-item><br>
      <el-form-item label="证件图片"  prop="certificateImage">
      <img :src="imgUrl" v-model="dataForm.certificateImage1">
      <img :src="imgUrl" v-model="dataForm.certificateImage2">
     </el-form-item><br>
      <el-form-item label="审核状态"  prop="status">
      <el-input v-model="dataForm.status" readonly="readonly" disabled="true"></el-input>
     </el-form-item><br>
      <el-form-item label="申请时间"  prop="created" >
       <el-input type="text" v-model="dataForm.created" readonly="readonly" disabled="true"></el-input>
     </el-form-item>
    </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { treeDataTranslate } from '@/utils'
  export default {
    data () {
      return {
        visible:false,
        imgUrl:'',
        teacherList:[],
        dataForm:{
          nickname:'',
          name:'',
          organization:'',
          IDnumber:'',
          certificateImage1:'',
          certificateImage2:'',
          status: '',
          created: ''
        },
        dataList: []
      }
    },
    methods: {
      //初始化数据方法
       init (id) {
        this.dataForm.id = id
     this.$http({
        url: this.$http.adornUrl('/xry/teacher/list'),
        method: 'get',
        params: this.$http.adornParams()
      }).then(({ data }) => {
          this.teacherList = treeDataTranslate(data.teacherList, 'id')
        }).then(() => { 
      this.visible = true
      this.$nextTick(() => {
        // 重置form表单（清空form表单的内容）
        this.$refs['dataForm'].resetFields()
        })
      }) 
      }
    }
  }
</script>
<style scoped>
.el-form-item{
  display: flex;
  justify-content:left;
  margin-left:10%;
}
.el-form-item_label{
  padding:0px;
  display: flex;
  justify-content:right;
}
.el-input{
  width: 650px;
}
.el-input .el-input--medium{
   display: flex;
   justify-content: left;
}
img{
  display:block;
  width:320px;
  height:180px;
  float:left;
  margin-right: 10px;
}
</style>
