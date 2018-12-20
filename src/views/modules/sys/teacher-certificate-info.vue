<template>
  <div class="mod-xryuser">
    <el-dialog  :title="!dataForm.id ? '' : '查看讲师认证资料详情'" :close-on-click-modal="false" :visible.sync="visible">
      <el-form :inline="true" :data="dataForm" >
        <el-form-item label="账号/昵称：">
          <div>{{dataForm.userName}}  /  {{dataForm.userPhone}}</div>
        </el-form-item>
        <el-form-item label="讲师姓名：">
          <div>{{dataForm.real_name}}</div>
        </el-form-item>
        <el-form-item label="所属机构：">
          <div>{{dataForm.org_name}}</div>
        </el-form-item>
        <el-form-item label="审核状态：">
          <div v-if="dataForm.status === 1"><el-tag type="info">认证中</el-tag></div>
          <div v-else-if="dataForm.status === 2"><el-tag type="warning">未通过</el-tag></div>
          <div v-else><el-tag type="success">已通过</el-tag></div>
        </el-form-item>
        <el-form-item label="身份证号：">
          <div>{{dataForm.id_card}}</div>
        </el-form-item>
        </el-form-item>
          <el-form-item label="申请时间：">
          <div>{{dataForm.created}}</div>
        </el-form-item>
        <el-form-item label="证件图片：">
          <img :src="dataForm.id_card_front">
          <img :src="dataForm.id_card_back">
        </el-form-item>
        <el-form-item label="简介：" width="100">
          <div>{{dataForm.brief_intro}}</div>
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
          userName:'',
          userPhone:'',
          id_card:'',
          id_card_front:'',
          id_card_back:'',
          real_name:'',
          org_name:'',
          brief_intro:'',
          type:'',
          status: '',
          user_id:'',
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
            if (data && data.code === 0) {
              this.dataForm.id = data.teacher.id
              this.dataForm.id_card = data.teacher.id_card
              this.dataForm.org_name = data.teacher.org_name
              this.dataForm.id_card_back = data.teacher.id_card_back
              this.dataForm.id_card_front = data.teacher.id_card_front
              this.dataForm.real_name = data.teacher.real_name
              this.dataForm.type = data.teacher.type
              this.dataForm.status = data.teacher.status
              this.dataForm.user_id = data.teacher.user_id
              this.dataForm.created = data.teacher.created
              this.dataForm.userName = data.teacher.userName
              this.dataForm.userPhone = data.teacher.userPhone
              this.dataForm.brief_intro = data.teacher.brief_intro
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
