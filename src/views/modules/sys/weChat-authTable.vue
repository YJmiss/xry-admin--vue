<template>  
<div >
<el-button type="primary" v-if="isAuth('sys:weChatConfig:add')"  @click="AddHandle()" class="clearFix add-button">新增</el-button>
<el-table :data="authorizes"  style="width: 100%" border class="clearFix"> 
  <el-table-column prop="id" label="序号" width="180" header-align="center" align="center"></el-table-column>
  <el-table-column prop="weixinAccount" label="微信号" width="280" header-align="center" align="center"></el-table-column>
  <el-table-column prop="appId" label="AppId" width="300" header-align="center" align="center"> </el-table-column>
  <el-table-column prop="appSecret" label="AppSecret" width="320" header-align="center" align="center"></el-table-column>
  <el-table-column prop="gzhType" label="状态"  width="180" header-align="center" align="center">
    <template slot-scope="scope">
    <el-tag v-if="scope.row.gzhType === 1" size="small" type="success">启用</el-tag>
    <el-tag v-else-if="scope.row.gzhType === 2" size="small" type="info">停用</el-tag>
    </template>
  </el-table-column>
  <el-table-column  fixed="right" header-align="center" align="center"  label="操作">
   <template slot-scope="scope">
    <el-button   type="success" size="small" @click="EnableOrDisableHandle(scope.row.id)" :disabled="scope.row.gzhType === 1">启用</el-button>
     <el-button  type="warning" size="small" @click="EnableOrDisableHandle(scope.row.id)" :disabled="scope.row.gzhType === 2">停用</el-button>
  </template>
  </el-table-column>
   </el-table>
    <!-- 弹窗, 新增 / 修改 -->
  <add v-show="AddVisible" ref="Add"></add>
 <div class='explain'>
  1.在公众平台申请接口使用的<span class="red">AppId</span>和<span class="red">AppSecret</span>，然后填入下边表单。<br>
  2.<span class="red">服务认证号</span>请在微信公众平台<span class="red">开发者中心->网页服务->网页账号->网页授权获取用户基本信息</span>设置授权回调页面域名
   </div>
</div>
</template>
<script>
import Add from './weChat-authAdd'
export default {
   components: {Add},
    data(){
      return{
       dataForm:{
         id:'',
         weixinAccount:'',
         appId: '',
         appSecret: '',
         gzhType:''
         },
       authorizes:[],
       AddVisible: false
       }
    },
    activated () {
    this.getDataList()
    },
    methods:{
  // 获取数据
   getDataList () {
        this.$http({
          url: this.$http.adornUrl('/sys/weChatAuthConfig/list'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          if (data && data.code === 0) {
          this.authorizes = data.authorizes
          this.dataForm.id = data.id
          this.dataForm.weixinAccount = data.weixinAccount
          this.dataForm.appId = data.appId
          this.dataForm.appSecret = data.appSecret
          this.dataForm.gzhType = data.gzhType
          }
        })
        },
      //新增处理
      AddHandle(){
      this.AddVisible = true
      this.$nextTick(() =>{
      this.$refs.Add.init()
      })
      },
     //配置用户信息启用和停用
     EnableOrDisableHandle(id){
         this.$http({
            url: this.$http.adornUrl(`/sys/weChatAuthConfig/updateAuthorizeById`),
            method: 'get',
            params: this.$http.adornParams({
              'id':id})
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.getDataList()
                }
              })
            } else {
              this.$message.error(data.msg)
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
.el-table{
  margin: 30px auto 30px auto;
}
.explain{
 padding: 20px 0 20px 20px;
 background: #f1f1f1;
 width:100%;
 justify-content:center;
 line-height: 30px;
  position: absolute;
  bottom: 0;
  left: 16px;
 }
.red{
  color: #ff0000;
 }
 .clearFix{
   clear: both;
 }
 .add-button{
   margin-bottom: 20px;
   float: left;
 }
</style>

