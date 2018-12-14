<template>
 <div class="customMenu">
<div class='explain'>
 1. 您的公众平台帐号类型必须升级为 <span class="red">服务号</span>  <br>
 2. 升级为服务号后，必须在微信公众平台申请接口使用的<span class="red">AppId</span> 和 <span class="red">AppSecret</span>，然后在【<a class="light" href="#">微信授权配置</a>】中设置。<br>
 3.最多创建<span class="red">3</span>个一级菜单，每个一级菜单下最多可以创建<span class="red">5</span>个二级菜单，菜单最多支持两层。<br>
 4. 拖动树形菜单可以对菜单重排序，但最终只有“<span class="red">发布菜单</span>”后才会生效，公众平台限制了每天的发布次数，请勿频繁操作。<br>
 5. 微信公众平台规定，<span class="red">菜单发布24小时后生效</span>。您也可先取消关注，再重新关注即可马上看到菜单。<br>
 6. 点击“<span class="red">删除菜单</span>”操作只删除微信公众平台上的菜单，并不是删除本系统已经设置好的菜单。
</div>
<el-button type="primary" class="button" @click="AddHandle(1)">添加一级菜单</el-button> 
<el-button type="primary" class="button" @click="AddHandle(2)">添加二级菜单</el-button> 
<div class="first-menu-list">
 <p class="title">一级菜单列表</p>
 <el-table :data="parentList" border>
    <el-table-column prop="menuId" header-align="center" align="center" label="序号" width="200px">
    </el-table-column>
    <el-table-column prop="menuName" header-align="center" align="center" label="菜单名称" width="100px">
    </el-table-column>
    <el-table-column prop="menuType" header-align="center" align="center" label="菜单类型" width="90px">
      <template slot-scope="scope">
      <el-tag v-if="scope.row.menuType === '1'" size="small" type="success">发送消息</el-tag>
      <el-tag v-else-if="scope.row.menuType === '2'" size="small" type="success">跳转网页</el-tag>
      <el-tag v-else-if="scope.row.menuType === '3'" size="small" type="success">跳转小程序</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="status" header-align="center" align="center" label="状态" width="80px">
      <template slot-scope="scope">
      <el-tag v-if="scope.row.status === 0" size="small" type="success">启用</el-tag>
      <el-tag v-else-if="scope.row.status === 1" size="small" type="info">停用</el-tag>
      <el-tag v-else-if="scope.row.status === 2" size="small" type="info">移除</el-tag>
      </template>
    </el-table-column>
     <el-table-column  fixed="right" header-align="center" align="center" label="操作">
        <template slot-scope="scope">
           <el-button   type="success" size="small" @click="EnableOrDisableHandle(scope.row.menuId)" :disabled="scope.row.status ===2">启用</el-button>
          <el-button   type="warning" size="small" @click="EnableOrDisableHandle(scope.row.menuId)" :disabled="scope.row.status === 1" >停用</el-button>
          <el-button   type="danger" size="small" @click="removeHandle(scope.row.menuId)" :disabled="scope.row.status === 0">移除</el-button>
        </template>
      </el-table-column>
  </el-table>
</div>
<div class="second-menu-list">
 <p class="title">二级菜单列表</p>
 <el-table :data="sonList" border >
 <el-table-column prop="menuId" header-align="center" align="center"  label="序号" width="200px">
    </el-table-column>
    <el-table-column prop="parentId" header-align="center" align="center" label="父级菜单" width="100px">
    </el-table-column>
    <el-table-column prop="menuName" header-align="center" align="center"  label="菜单名称" width="100px">
    </el-table-column>
    <el-table-column prop="menuType" header-align="center" align="center"  label="菜单类型"  width="90px">
      <template slot-scope="scope">
      <el-tag v-if="scope.row.menuType === '1'" size="small" type="success">文字消息</el-tag>
      <el-tag v-else-if="scope.row.menuType === '2'" size="small" type="success">图文消息</el-tag>
      <el-tag v-else-if="scope.row.menuType === '3'" size="small" type="success">跳转页面</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="status" header-align="center" align="center"  label="状态" width="80px">
      <template slot-scope="scope">
      <el-tag v-if="scope.row.status === 0" size="small" type="success">启用</el-tag>
      <el-tag v-else-if="scope.row.status === 1" size="small" type="info">停用</el-tag>
      <el-tag v-else-if="scope.row.status === 2" size="small" type="info">移除</el-tag>
      </template>
    </el-table-column>
     <el-table-column  fixed="right" header-align="center" align="center" label="操作">
        <template slot-scope="scope" porp="status">
          <el-button   type="success" size="small" @click="EnableOrDisableHandle(scope.row.menuId)" :disabled="scope.row.status ===2">启用</el-button>
          <el-button   type="warning" size="small" @click="EnableOrDisableHandle(scope.row.menuId)" :disabled="scope.row.status === 1" >停用</el-button>
          <el-button   type="danger" size="small" @click="removeHandle(scope.row.menuId)" :disabled="scope.row.status === 0">移除</el-button>
        </template>
      </el-table-column>
  </el-table>
</div>
 <!-- 弹窗，添加一级菜单  -->
 <add-first-menu v-show="AddFirstMenuVisible" ref="AddFirstMenu"> </add-first-menu>
 <!-- 弹窗，添加或修改二级菜单  -->
 <add-second-menu v-show="AddSecondMenuVisible" ref="AddSecondMenu"></add-second-menu>
</div>
</template>
<script>
import { treeDataTranslate } from '@/utils'
import AddFirstMenu from './weChat-customFirstMenu-Add'
import AddSecondMenu from './weChat-customSecondMenu-Add'
export default {
  components:{AddFirstMenu,AddSecondMenu},
    data(){
    return{
     dataForm:{
        parentId:'',
        parentMenu:'',
        menuId: '',
        menuName: '',
        menuType: '',
        eventType:'',
        status:0
      },
      parentList:[],
      sonList:[],
      AddFirstMenuVisible:false,
      AddSecondMenuVisible:false
    }
    },
    activated () {
    this.getDataList()
    },
    methods:{
      // 获取数据
    getDataList () {
        this.$http({
          url: this.$http.adornUrl('/sys/weChatParentMeunList'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          if (data && data.code === 0) {
           this.parentList = data.parentMeun
          }
        }).then(() =>{
          this.$http({
          url: this.$http.adornUrl('/sys/weChatSonMeunList'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.sonList = data.sonMeun
           }
        })
        })
      },
    //菜单添加操作处理
      AddHandle(menuId){
      if(menuId == 1){
      this.AddFirstMenuVisible = true
      this.$nextTick(() =>{
      this.$refs.AddFirstMenu.init()
      })
      }else{
      this.AddSecondMenuVisible = true
      this.$nextTick(() =>{
      this.$refs.AddSecondMenu.init()
      })
      }
      },
      //移除操作处理
     removeHandle(menuId){
       
      },
       //菜单启用和停用
     EnableOrDisableHandle(menuId){
         this.$http({
            url: this.$http.adornUrl(`/sys/weChatUpdateMeun`),
            method: 'get',
            params: this.$http.adornParams({
              'menuId':menuId,
              'status':this.dataForm.status
            })
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
        <style scoped>
        .el-card__body{
         min-height:1200px;
        }
        .customMenu{
        clear:both;
        padding: 0;
        width:100%;
        }
        .explain{
        height:auto;
        width: 100%;
        margin:20px 0 16px -20px;
        font-size:14px;
        font-family: 微软雅黑;
        color: #333333;
        padding: 10px;
        background: #ebebeb;
        line-height:30px;
        clear: both;
        position:fixed;
        bottom: 0;
        }
        .red{
        color:#ff0000;
        }
        .light{
        color:#17B3A3;
        }
        .button{
        margin:0 40px 20px 0;
        width:180px;
        float:left;
        }
        .td-a{
        font-size:16px;
        padding:2px;
        }
        .td-span{
        font-size: 14px;
        float: left;
        font-family: 微软雅黑;
        color:#222222;
        }
        .first-menu-list{
        clear:both;
        width:45%;
        height:auto;
        float: left;
        }
        .second-menu-list{
        float: right;
        width: 50%;
        height: auto;
        margin: auto;
        }
        .title{
        font: 18px bolder 微软雅黑;
        color: #222222;
        margin-bottom: 20px;
        }
        .el-table{
        width: 100%;
        }
        .el-table-column{
        color:#222222;
        }
        </style>

