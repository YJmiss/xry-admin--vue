<template>
  <div class="mod-xryuser">
    <el-dialog  :title="!dataForm.id ? '' : '查看讲师认证资料详情'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :inline="true" :data="dataForm" >
      <el-form-item label="账号/昵称"  prop="nickname">
      <el-input type="text" v-model="dataForm.nickname" :disabled="true" width="100"></el-input>
      </el-form-item>
      <el-form-item label="讲师姓名"  prop="realName">
        <el-input type="text" v-model="dataForm.realName" :disabled="true"></el-input>
      </el-form-item>
      <el-form-item label="所属机构"  prop="realName">
      <el-input type="text" v-model="dataForm.realName" :disabled="true"></el-input>
     </el-form-item>
      <el-form-item label="身份证号"  prop="idCard">
      <el-input type="text" v-model="dataForm.idCard" :disabled="true"></el-input>
     </el-form-item>
      <el-form-item label="证件图片">
      <img :src="dataForm.idCardFront">
      <img :src="dataForm.idCardBack">
     </el-form-item>
      <el-form-item label="审核状态"  prop="status">
      <el-input v-model="dataForm.status" :disabled="true"></el-input>
     </el-form-item>
      <el-form-item label="申请时间"  prop="created" >
       <el-input type="text" v-model="dataForm.created" :disabled="true"></el-input>
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
          idCard:'',
          idCardBack:'',
          idCardFront:'',
          realName:'',
          type:'',
          status: '',
          userId:'',
          created: ''
        },
        dataList: []
      }
    },
    methods: {
      //初始化数据方法
       init (id) {
        this.dataForm.id = id
        this.visible = true 
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/xry/teacher/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            console.log(data)
            if (data && data.code === 0) {
              this.dataForm.id = data.teacher.id
              this.dataForm.idCard = data.teacher.idCard
              this.dataForm.idCardBack = data.teacher.idCardBack
              this.dataForm.idCardFront = data.teacher.idCardFront
              this.dataForm.realName = data.teacher.realName
              this.dataForm.type = data.teacher.type
              this.dataForm.status = data.teacher.status
              this.dataForm.userId = data.teacher.userId
              this.dataForm.created = data.teacher.created
            }
          })
        }
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
