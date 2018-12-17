<template>
    <div class="orderList">
     <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="订单编号">
        <el-input v-model="dataForm.orderCode" placeholder="请输入订单编号" clearable></el-input>
      </el-form-item>
      <el-form-item label="订单状态">
       <el-select v-model="dataForm.status" placeholder="请选择">
       <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
      </el-option>
      </el-select>
      </el-form-item>
       <el-form-item label="用户手机号">
        <el-input v-model="dataForm.phone" placeholder="输入用户手机号" clearable></el-input>
      </el-form-item>
      <el-form-item label="下单时间">
       <el-date-picker v-model="dataForm.created" type="datetime" placeholder="选择日期时间"></el-date-picker>
      </el-form-item>
      <el-form-item label="所属课程">
       <el-popover ref="courseListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseList" :props="courseListTreeProps" node-key="courseId" ref="courseListTree"
            @current-change="courseListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.courseName" v-popover:courseListPopover :readonly="true" placeholder="点击选择所属课程" class="cat-list__input"></el-input>
      </el-form-item>
      <el-button type="primary" @click="getDataList()">查询</el-button>
      </el-form>
      <el-table :data="dataList" border style="width: 100%;" >
      <el-table-column prop="id" header-align="center" align="center" width="80" label="ID"></el-table-column>
      <el-table-column prop="phone" header-align="center" align="center" width="200" label="用户手机号"></el-table-column>
      <el-table-column prop="orderCode" header-align="center" align="center" width="300" label="订单编号"></el-table-column>
      <el-table-column prop="courseName" header-align="center" align="center" width="200" label="所属课程"></el-table-column>
      <el-table-column prop="number" header-align="center" align="center" width="120" label="数量"></el-table-column>
      <el-table-column prop="money" header-align="center" align="center" width="120" label="订单金额"></el-table-column>
      <el-table-column prop="status" header-align="center" align="center" width="200" label="订单状态">
        <template slot-scope="scope" v-model="dataForm.status">
          <el-tag v-if="scope.row.status === 1" size="small" type="info">待支付</el-tag>
          <el-tag v-else-if="scope.row.status === 2" size="small" type="danger">交易成功</el-tag>
          <el-tag v-else-if="scope.row.status === 3" size="small" type="danger">交易关闭</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created" header-align="center" align="center" label="创建时间"></el-table-column>
    </el-table>
     <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" 
          :page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    </div>
</template>
<script>
import { treeDataTranslate } from '@/utils'
export default {
    data(){
        return{
            dataList:[],
            courseList:[],
            courseListTreeProps: {
            label: 'title',
            children: 'children'
            },
            pageIndex: 1,
            pageSize: 10,
            totalPage: 0,
            dataForm:{
                id:'',
                parentOrdId:'',//父级订单编号
                status:'',
                number:0,
                orderCode:'',
                courseName:'',
                created:'',
                phone:'',
                courseId:'',
                money:0
            },
            options: [{
            value: '1',
            label: '待支付'
            }, {
            value: '2',
            label: '交易成功'
            }, {
            value: '3',
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
            //查询课程树
            this.$http({
              url: this.$http.adornUrl('/xry/course/treeCourse'),
              method: 'get',
              params: this.$http.adornParams()
          }).then(({ data }) => {
             this.courseList = treeDataTranslate(data.courseList, 'id')
            })/* .then(() =>{
            this.$http({
               url:this.$http.adornUrl('/xry/order/list'),
               method:'get',
               params:this.$http.adornParams({
                'page': this.pageIndex,
                'limit': this.pageSize,
                'orderCode':this.dataForm.orderCode,
                'status':this.dataForm.status,
                'phone' :this.dataForm.phone,
                'created':this.dataForm.created,
                'courseId':this.dataForm.courseId,
               })
            }).then(({data}) => {
                if(data && data.code === 0){
                 this.dataList = data.page.list
                 this.totalPage = data.page.totalCount
                }else {
                this.dataList = []
                this.totalPage = 0
              }
            })
        }) */
       },
      // 课程树选中
      courseListTreeCurrentChangeHandle (data, node) {
        this.dataForm.courseId = data.id
        this.dataForm.courseName = data.title
      },
      // 课程树设置当前选中节点
      courseListTreeSetCurrentNode () {
        this.$refs.courseListTree.setCurrentKey(this.dataForm.courseId)
        this.dataForm.courseName = (this.$refs.courseListTree.getCurrentNode() || {})['title']
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
.el-button{
float: right;
}
</style>

