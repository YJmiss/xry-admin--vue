<template>
    <el-dialog :title="!dataForm.id ? '' : '查看讲师认证资料详情'" :close-on-click-modal="false" :visible.sync="visible">
     <el-form :inline="true" :data="dataForm">
      <el-form-item label="账号/昵称"  prop="nickname">
      <el-input type="text" v-model="dataForm.nickname" readonly="readonly" disabled></el-input>
      </el-form-item><br>
       <el-form-item label="机构名称" prop="organizationName">
      <el-input v-model="dataForm.organizationName" readonly="readonly" disabled></el-input>
      </el-form-item><br>
       <el-form-item label="机构代码" prop="Organ_number">
      <el-input v-model="dataForm.Organ_number" readonly="readonly" disabled></el-input>
      </el-form-item><br>
      <el-form-item label="营业执照" prop="certificateImage">
      <img :src="imgUrl" >
      <img :src="imgUrl" > 
      </el-form-item><br>
      <el-form-item label="法人代表" prop="corporateName">
      <el-input v-model="dataForm.corporateName" readonly="readonly" disabled></el-input>
      </el-form-item><br>
       <el-form-item label="法人证件号" prop="corporateIDnumber">
      <el-input v-model="dataForm.corporateIDnumber" readonly="readonly" disabled></el-input>
      </el-form-item><br>
       <el-form-item label="联系方式" prop="contactInfo">
      <el-input v-model="dataForm.contactInfo" readonly="readonly" disabled></el-input>
      </el-form-item><br>
      <el-form-item label="审核状态" prop="status">
      <el-input v-model="dataForm.status" readonly="readonly" disabled></el-input>  
      </el-form-item><br>
      <el-form-item label="申请时间" prop="created">
      <el-input v-model="dataForm.created" readonly="readonly" disabled></el-input>  
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script>
import { treeDataTranslate } from '@/utils'
  export default {
    data () {
      return {
         visible:false,
         imgUrl:'',
         organizationList:[],
         dataForm:{
          nickname:'',
         contactInfo: '',
         organizationName:'',
         Organ_number:'',
          certificateImage:'',
          corporateName:'',
          corporateIDnumber:'',
          status: '',
          created: ''
        },
        dataList: [],
      }
    },
    methods: {
     //初始化数据方法
       init (id) {
        this.dataForm.id = id
        this.visible=true
      this.$http({
        url: this.$http.adornUrl('/xry/organization/list'),
        method: 'get',
        params: this.$http.adornParams()
      }).then(({ data }) => {
          this.organizationList = treeDataTranslate(data.organizationList, 'id')
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