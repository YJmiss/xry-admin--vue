<template>
  <el-dialog :title="!dataForm.id ? '' : '查看讲师认证资料详情'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :inline="true" :data="dataForm">
      <el-form-item label="账号/昵称：">
        <div>{{dataForm.userName}}  /   {{dataForm.userPhone}}</div>
      </el-form-item>
      <el-form-item label="机构名称：">
        <div>{{dataForm.orgName}}</div>
      </el-form-item>
      <el-form-item label="机构代码：">
        <div>{{dataForm.orgCode}}</div>
      </el-form-item>
      <el-form-item label="法人代表：">
        <div>{{dataForm.corporator}}</div>
      </el-form-item>
      <el-form-item label="法人证件号：">
        <div>{{dataForm.idCard}}</div>  
      </el-form-item>
      <el-form-item label="联系方式：">
        <div>{{dataForm.contact}}</div>
      </el-form-item>
      <el-form-item label="审核状态：">
        <div v-if="dataForm.status === 1"><el-tag type="info">认证中</el-tag></div>
        <div v-else-if="dataForm.status === 2"><el-tag type="warning">未通过</el-tag></div>
        <div v-else><el-tag type="success">已通过</el-tag></div>
      </el-form-item>
      <el-form-item label="申请时间：">
        <div>{{dataForm.created}}</div>
      </el-form-item>
      <el-form-item label="营业执照：">
        <img :src="dataForm.businessLicense" >
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
        organizationList:[],
        dataForm:{
          contact:'',
          corporator: '',
          idCard:'',
          orgCode:'',
          orgName:'',
          businessLicense:'',
          status:'',
          userId: '',
          userName:'',
          userPhone:'',
          created: ''
        },
        dataList: [],
      }
    },
    methods: {
     //初始化数据方法
       init (id) {
        this.dataForm.id = id
        this.visible = true 
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/xry/organization/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.id = data.org.id
              this.dataForm.contact = data.org.contact
              this.dataForm.corporator = data.org.corporator
              this.dataForm.idCard = data.org.id_card
              this.dataForm.orgCode = data.org.org_code
              this.dataForm.orgName = data.org.org_name
              this.dataForm.businessLicense = data.org.business_license
              this.dataForm.status = data.org.status
              this.dataForm.userId = data.org.user_id
              this.dataForm.userName = data.org.userName
              this.dataForm.userPhone = data.org.userPhone
              this.dataForm.created = data.org.created
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