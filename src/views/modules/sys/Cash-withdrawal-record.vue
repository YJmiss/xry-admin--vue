<template>
<div class="container">
 <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
    <el-form-item label="用户手机号："> 
    <el-input v-model="dataForm.mobile" clearable placeholder="输入用户手机号"></el-input>
    </el-form-item>
    <el-form-item label="处理状态：">
    <el-select v-model="dataForm.status" clearable placeholder="请选择">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
    </el-select>
    </el-form-item>
    <el-form-item label="提现申请时间：">
    <el-date-picker
      v-model="dataForm.createTime"
      align="right"
      type="date"
      placeholder="选择日期"
      :picker-options="pickerOptions"
      format="yyyy 年 MM 月 dd 日"
      value-format="yyyy 年 MM 月 dd 日">
    </el-date-picker>
    </el-form-item>
    <el-form-item>
    <el-button @click="getDataList()" type="primary">查询</el-button>
    </el-form-item>
    </el-form>
      <el-table :data="dataList" border style="width: 100%;">
      <el-table-column prop="id" header-align="center" align="center" label="ID"></el-table-column>
      <el-table-column prop="mobile" header-align="center" align="center" width="160" label="用户手机号"></el-table-column>
      <el-table-column prop="user_name" header-align="center" align="center" width="120" label="持卡人姓名"></el-table-column>
      <el-table-column prop="type" header-align="center" align="center" width="160" label="银行类型"></el-table-column>
      <el-table-column prop="card_number" header-align="center" align="center"  label="银行卡号"></el-table-column>
      <el-table-column prop="cashWithdrawal_amount" header-align="center" align="center" width="100" label="提现金额"></el-table-column>
      <el-table-column prop="status" header-align="center" align="center" width="100" label="处理状态">
        <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 1" size="small" type="info">申请提现</el-tag>
            <el-tag v-else-if="scope.row.status === 2" size="small" type="success">提现成功</el-tag>
            <el-tag v-else size="small" type="info">未申请</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="create_time" header-align="center" align="center"  label="提现申请时间"></el-table-column>
      <el-table-column prop="end_time" header-align="center" align="center"  label="提现成功时间"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="left" width="100" label="操作">
        <template slot-scope="scope" porp="status">
        <el-button v-if="isAuth('xry:cashWithdrawal:handle')" type="primary" size="small" circle v-show="scope.row.status === 1" @click="cashWithdrawalHandle(scope.row.id)">处理</el-button>
        <el-tag type="success" v-show="scope.row.status === 2">已处理</el-tag>
        </template>
      </el-table-column>
    </el-table>
     <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" 
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
pageSize: 10,
totalPage: 0,
dataForm:{
mobile:'',
status:'',
createTime:''
},
options: [
    {
    value: '1',
    label: '申请提现'
    }, {
    value: '2',
    label: '提现成功'
    }],
pickerOptions: {
    disabledDate(time) {
    return time.getTime() > Date.now();
    },
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
activated () {
this.getDataList()
},
methods:{
// 获取数据列表
getDataList () {
// 查询所有提现记录数据
this.$http({
    url: this.$http.adornUrl('/sys/distribution/withdrawalList'),
    method: 'get',
    params: this.$http.adornParams({
        'page': this.pageIndex,
        'limit': this.pageSize,
        'mobile':this.dataForm.mobile,
        'status': this.dataForm.status,
        'createTime':this.dataForm.createTime
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
},
//提现申请处理
cashWithdrawalHandle(id){
this.$http({
    url: this.$http.adornUrl(''),
    method: 'get',
    params: this.$http.adornParams({
        'id': id
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
