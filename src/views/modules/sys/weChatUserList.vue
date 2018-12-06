<template>
<div class="content">
<h4>当前用户总数:2</h4>
<div class="line"></div>
<span class="select-label">关注状态:</span><el-select v-model="value" placeholder="请选择">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>
  <el-button type="primary" class="query">查询</el-button>
   <el-table :data="tableData">
    <el-table-column prop="id" label="序号" width="180">
    </el-table-column>
    <el-table-column prop="headImage" label="头像" width="180">
    </el-table-column>
    <el-table-column prop="nickName" label="昵称">
    </el-table-column>
    <el-table-column prop="sex" label="性别" width="180">
    </el-table-column>
    <el-table-column prop="city" label="城市" width="180">
    </el-table-column>
    <el-table-column prop="openId" label="openid">
    </el-table-column>
     <el-table-column prop="status" label="关注状态">
    </el-table-column>
    </el-table>
</div>
</template>
<script>
export default {
data(){
    return{
         options: [{
          value: '1',
          label: '关注'
        }, {
          value: '2',
          label: '取消关注'
        }],
        value: '',
         tableData: [{
            id:1,
            headImage: '暂无头像',
           nickName: '小小',
            sex: '女',
            city:'昆明',
            openId:'6789sfvdf5677fdfgk',
            status:'关注'
          },{
            id:2,
            headImage: '暂无头像',
           nickName: '菲菲',
            sex: '男',
            city:'北京',
            openId:'67213sfvdf5656ferrre',
            status:'取消关注'
          }],
          methods:{

          }
    }
}
}
</script>
<style scoped>
.line{
width: 100%;
height:2px;
background:#e7e7e7;
margin: 20px auto;
}
.select-label{
    padding-right:14px;
    font: 16px bolder;
}
.query{
 position: relative;
 left: 2%;
}
.el-table{
width: 98%;
margin: 2% auto;
}
.el-table hr{
background-color: #e7e7e7;
}
</style>

