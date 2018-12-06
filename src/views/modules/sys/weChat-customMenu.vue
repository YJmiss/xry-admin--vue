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
<el-button type="primary" class="button" @click="addOrUpdateHandle(0)">添加一级菜单</el-button> 
<el-button  class="button" type="primary">生成菜单</el-button>
<div class="first-menu-list">
 <p class="title">一级菜单列表</p>
 <el-table :data="firstMenuData" border>
 <el-table-column prop="menuId" label="序号" width="60px">
    </el-table-column>
 <el-table-column prop="menuName" label="菜单名称" >
    </el-table-column>
    <el-table-column prop="type" label="类型">
    </el-table-column>
     <el-table-column  fixed="right" header-align="center" align="center" label="操作" style="width:auto">
        <template slot-scope="scope" porp="status">
          <span class="td-span">二级菜单</span>
         <span> <a class="td-a" href="#"  @click="addOrUpdateHandle(scope.row.menuId)">添加</a>
          <a class="td-a" href="#"  @click="viewHandle(scope.row.id)">查看</a></span> |
          <a class="td-a red"  href="#" @click="deleteHandle(scope.row.id)">删除</a>
        </template>
      </el-table-column>
  </el-table>
</div>
<div class="second-menu-list">
 <p class="title">二级菜单列表</p>
 <el-table :data="secondMenuData" border highlight-current-row empty-text="改菜单没有二级菜单">
 <el-table-column prop="menuId" label="序号" width="60px">
    </el-table-column>
<el-table-column prop="parentMenu" label="父级菜单" >
</el-table-column>
 <el-table-column prop="menuName" label="菜单名称" >
    </el-table-column>
    <el-table-column prop="type" label="类型">
    </el-table-column>
     <el-table-column  fixed="right" header-align="center" align="center" label="操作" style="width:auto">
        <template slot-scope="scope" porp="status">
         <a class="td-a" href="#"  @click="addOrUpdateHandle(scope.row.menuId)">编辑</a>
          <a class="td-a red"  href="#" @click="deleteHandle(scope.row.id)">删除</a>
        </template>
      </el-table-column>
  </el-table>
</div>
 <!-- 弹窗，添加一级菜单  -->
 <add-first-menu v-show="AddFirstMenuVisible" ref="AddFirstMenu"> </add-first-menu>
 <!-- 弹窗，添加或修改二级菜单  -->
 <add-or-update-second-menu v-show="AddOrUpdateSecondMenuVisible" ref="AddOrUpdateSecondMenu"></add-or-update-second-menu>
</div>
</template>
<script>
import { treeDataTranslate } from '@/utils'
import AddFirstMenu from './weChat-customFirstMenuAdd'
import AddOrUpdateSecondMenu from './weChat-customSecondMenu-AddOrUpdate'
export default {
  components:{AddFirstMenu,AddOrUpdateSecondMenu},
    data(){
    return{
    AddFirstMenuVisible:false,
    AddOrUpdateSecondMenuVisible:false,
    firstMenuData:[{
          menuId: '1',
         menuName: '积分中心',
         type: '点击跳转URL'
        }],
   secondMenuData:[{
   menuId: '1',
    parentMenu: '积分中心',
    menuName: 'VIP专项',
    type: '单图文'
   }]
    }
    },
    methods:{
      //添加和修改操作处理
     addOrUpdateHandle(id) {
        if(id==0){
         this.AddFirstMenuVisible=true
        this.$nextTick(() => {
         this.$refs.AddFirstMenu.init()
        }) 
        }else{
        this.AddOrUpdateSecondMenuVisible=true
        this.$nextTick(() => {
        this.$refs.AddOrUpdateSecondMenu.init(id)
        }) 
        }
      },
      //删除数据处理
      deleteHandle(id){
          var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/weChat/customMenu/delete'),
            method: 'post',
            data: this.$http.adornData(ids, false)
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
        }).catch(() => {})
      }
    }
}
</script>
<style scoped>
.customMenu{
clear:both;
padding: 0;
width: 100%;
}
.explain{
height:auto;
margin: 0 auto 30px auto;
font-size:14px;
font-family: 微软雅黑;
color: #333333;
padding: 10px;
background: #fefefe;
line-height:30px;
border-bottom: 1px solid #cccccc;
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
width: 46%;
float:left;
}
.second-menu-list{
float:right;
width: 48%;
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

