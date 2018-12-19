<template>
    <div class="orderList">
     <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="订单ID">
        <el-input v-model="dataForm.orderId" placeholder="请输入订单编号" clearable></el-input>
      </el-form-item>
      <el-form-item label="订单状态">
       <el-select v-model="dataForm.status" placeholder="请选择">
       <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
      </el-option>
      </el-select>
      </el-form-item>
       <el-form-item label="买家电话">
        <el-input v-model="dataForm.buyerPhone" placeholder="输入买家手机号" clearable></el-input>
      </el-form-item>
      <el-form-item label="下单时间">
        <el-date-picker v-model="dataForm.createTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
      </el-form-item>
     
      <el-button type="primary" @click="getDataList()">查询</el-button>
      </el-form>
      <el-table :data="dataList" border style="width: 100%;" >
      <el-table-column prop="orderId" header-align="center" align="center" width="200" label="订单ID"></el-table-column>
      <el-table-column prop="buyerPhone" header-align="center" align="center" width="120" label="买家电话"></el-table-column>
      <el-table-column prop="payment" header-align="center" align="center" width="80" label="实付金额"></el-table-column>
      <el-table-column prop="totalFee" header-align="center" align="center" width="95" label="订单总金额"></el-table-column>
      <el-table-column prop="paymentType" header-align="center" align="center" width="120" label="支付方式">
         <template slot-scope="scope">
          <p v-if="scope.row.paymentType === 0" size="small" type="info">微信支付</p>
          <p v-else-if="scope.row.paymentType === 1" size="small" type="danger">支付宝</p>
        </template>
      </el-table-column>
      <el-table-column prop="status" header-align="center" align="center" width="120" label="订单状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 1" size="small" type="info">待支付</el-tag>
          <el-tag v-else-if="scope.row.status === 2" size="small" type="danger">已付款</el-tag>
          <el-tag v-else-if="scope.row.status === 3" size="small" type="danger">交易成功</el-tag>
          <el-tag v-else-if="scope.row.status === 4" size="small" type="danger">交易关闭</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" header-align="center" align="center" label="下单时间"></el-table-column>
      <el-table-column prop="updateTime" header-align="center" align="center" label="更新时间"></el-table-column>
      <el-table-column prop="paymentTime" header-align="center" align="center" label="付款时间"></el-table-column>
      <el-table-column prop="endTime" header-align="center" align="center" label="完成时间"></el-table-column>
      <el-table-column prop="closeTime" header-align="center" align="center" label="关闭时间"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" label="操作" width="100">
        <template slot-scope="scope">
        <el-button v-if="isAuth('xry:order:info')" type="primary" @click="viewOrderInfo(scope.row.orderId)">详情</el-button>
        </template>
      </el-table-column>
     </el-table>
     <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" 
      :page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper">
     </el-pagination>
     <!-- 弹窗，查看订单详情 -->
     <order-info v-show="infoVisible" ref="OrderInfo"></order-info>
    </div>
    </template>
    <script>
    import OrderInfo from './order-info.vue'
    export default {
    components:{OrderInfo},
    data(){
        return{
            dataList:[],
            infoVisible:false,
            pageIndex: 1,
            pageSize: 12,
            totalPage: 0,
            dataForm:{
                orderId:'',
                status:'', //支付状态：1、未付款，2、已付款，3、交易成功，4、交易关闭
                buyerPhone:'',  
                payment:'', //实付总金额
                totalFee:'', //课程总金额
               paymentType:0, //支付类型 0微信支付 1支付宝支付
                createTime:'', //订单创建时间
                updateTime:'',//订单更新时间
                paymentTime:'', //付款时间
                endTime:'', //交易完成时间
                closeTime:''//交易关闭时间
            },
            options: [{
            value: '1',
            label: '待支付'
            }, {
            value: '2',
            label: '已付款'
            },{
            value: '3',
            label: '交易成功'
            },{
            value: '4',
            label: '交易关闭'
            }]
        }
    },
     activated () {
      this.getDataList()
    },
    methods:{
        //获取数据
    getDataList () {
        this.$http({
               url:this.$http.adornUrl('/api/appOrder/list'),
               method:'get',
               params:this.$http.adornParams({
                'page': this.pageIndex,
                'limit': this.pageSize,
               })
            }).then(({data}) => {
                if(data && data.code === 0){
                  console.log(data)
                 this.dataList = data.page.list
                 this.totalPage = data.page.totalCount 
                }else {
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
      //查看订单详情
      viewOrderInfo(orderId){
       this.infoVisible = true
       this.$nextTick(() => {
       this.$refs.OrderInfo.getDataList(orderId)
       })
      }
    }
}
</script>
<style scoped>
.el-button{
float: right;
}
.el-table-column{
  font-size: 13px;
}
.el-form-item{
  margin-left: 10px;
}
</style>

