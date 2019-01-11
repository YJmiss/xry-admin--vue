<template>
 <div id="container">
<el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
<el-form-item label="分销订单ID">
<el-input v-model="dataForm.id" placeholder="请输入分销订单编号" clearable></el-input>
</el-form-item>
<el-form-item label="订单状态">
<el-select clearable v-model="dataForm.status" placeholder="请选择">
<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
</el-option>
</el-select>
</el-form-item>
<el-form-item label="创建时间">
<el-date-picker v-model="dataForm.createTime" type="date" :picker-options="pickerOptions" placeholder="选择日期" format="yyyy 年 MM 月 dd 日" value-format="yyyy 年 MM 月 dd 日"></el-date-picker>
</el-form-item>
<el-button type="primary" @click="getDataList()">查询</el-button>
</el-form>
<el-table :data="dataList" border>
<el-table-column prop="id" header-align="center" align="center" label="分销订单ID"></el-table-column>
<el-table-column prop="order_id" header-align="center" align="center" label="订单ID"></el-table-column>
<el-table-column prop="user_id" header-align="center" align="center" label="用户ID"></el-table-column>
<el-table-column prop="course_id" header-align="center" align="center" label="课程ID"></el-table-column>
<el-table-column prop="grade" header-align="center" align="center" label="用户分销等级" width="120"></el-table-column>
<el-table-column prop="appBrokerage" header-align="center" align="center" label="用户佣金" width="100"></el-table-column>
<el-table-column header-align="center" align="center" label="订单状态" width="120">
<template slot-scope="scope"  prop="status">
<el-tag v-if="scope.row.status === 1" size="small" type="info">未付款</el-tag>
<el-tag v-else-if="scope.row.status === 2" size="small" type="warning">未提现</el-tag>
<el-tag v-else-if="scope.row.status === 3" size="small" type="success">交易成功（已提现）</el-tag>
</template>    

</el-table-column>
<el-table-column prop="create_time" header-align="center" align="center" label="创建时间"></el-table-column>
<el-table-column prop="update_time" header-align="center" align="center" label="更新时间"></el-table-column>
<el-table-column prop="end_time" header-align="center" align="center" label="提现成功时间"></el-table-column>
</el-table>
<el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[12, 20, 50, 100]" 
:page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper">
</el-pagination>
 </div>   
</template>
<script>
export default {
data(){
return{
dataList:[],
pageIndex: 1,
pageSize: 12,
totalPage: 0,
dataForm:{
  id:'' ,
  status:'' ,
  createTime:''
},
 options: [{
    value: '1',
    label: '未付款'
    },{
    value: '2',
    label: '未提现（用户已付款）'
    },{
    value: '3',
    label: '交易成功（已提现）'
    }],
 pickerOptions: {
    shortcuts: [{
    text: '今天',
    onClick(picker) {
        picker.$emit('pick', new Date());
    }
    }, {
    text: '昨天',
    onClick(picker) {
        const date = new Date();
        date.setTime(date.getTime() - 3600 * 1000 * 24);
        picker.$emit('pick', date);
    }
    }, {
    text: '一周前',
    onClick(picker) {
        const date = new Date();
        date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
        picker.$emit('pick', date);
    }
    }]
    }
}   
},
activated(){
this.getDataList()
},
methods:{
//获取分销订单数据表
getDataList(){
this.$http({
url: this.$http.adornUrl('/sys/distribution/list'),
method: 'get',
params: this.$http.adornParams({
'page': this.pageIndex,
'limit': this.pageSize,
'distributionId':this.dataForm.id,//分销订单id
'status':this.dataForm.status,
'create_time':this.dataForm.createTime
})    
}).then(({ data }) => {
if (data && data.code === 0) {
 this.dataList = data.page.list
 this.totalPage = data.page.totalCount
} else {
this.dataList = []
this.totalPage = 0
}   
})
},
// 每页数
sizeChangeHandle (val) {
this.pageSize = val
this.pageIndex = 1
this.getDataList()
},
// 当前页
currentChangeHandle (val) {
this.pageIndex = val
this.getDataList()
}
}
}
</script>
<style scoped>
.el-table{
margin-top: 30px;
}
</style>


