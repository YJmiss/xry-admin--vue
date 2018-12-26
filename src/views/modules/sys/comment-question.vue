<template>
<div class="container">
<el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
<el-form-item label="问题标题">
 <el-input v-model="dataForm.title" placeholder="请输入问题标题"></el-input>   
</el-form-item>
<el-form-item label="状态">
 <el-select v-model="dataForm.status" clearable placeholder="请选择">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>
</el-form-item>
<el-form-item label="创建时间">
<el-date-picker
    v-model="dataForm.created"
    align="right"
    type="date"
    placeholder="选择日期"
    :picker-options="pickerOptions"
    format="yyyy-MM-dd"
    value-format="yyyy-MM-dd">
</el-date-picker>
</el-form-item>
<el-button  @click="getDataList()">查询</el-button>
<el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
</el-form>
<el-table :data="dataList" border style="width: 100%">
<el-table-column prop="id" header-align="center" label="ID" width="250"></el-table-column>
<el-table-column prop="title" header-align="center" label="问题标题" width="350"></el-table-column>
<el-table-column prop="answer" header-align="center" label="问题答案">
<template slot-scope="scope">
<el-popover ref="replyPopover" placement="top-start" trigger="hover">
<span>点击查看答案详情</span>
</el-popover>
<el-button show-overflow-tooltip size="small" type="text" v-popover:replyPopover @click="showAnswer(scope.row.answer)">{{scope.row.answer}}</el-button>
</template>   
</el-table-column>
<el-table-column  header-align="center"  label="状态" width="100">
<template slot-scope="scope" porp="status">
<el-tag type="success" v-if="scope.row.status ===1">正常</el-tag>
<el-tag type="info" v-if="scope.row.status ===2">移除</el-tag>
</template>  
</el-table-column>
<el-table-column prop="created" header-align="center" label="创建时间" width="200"></el-table-column>
<el-table-column fixed="right" header-align="center" align="left"  label="操作">
<template slot-scope="scope" porp="status">
<el-button  type="primary" size="small" icon="el-icon-edit"  @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
<el-button  type="danger" size="small" icon="el-icon-delete"  @click="deleteOrRestoreHandle(scope.row.id,scope.row.status)" v-show="scope.row.status ===1">移除</el-button>
<el-button  type="success" size="small" icon="el-icon-refresh"  @click="deleteOrRestoreHandle(scope.row.id,scope.row.status)" v-show="scope.row.status ===2">恢复</el-button>
</template>
</el-table-column>
</el-table>
<el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" 
          :page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper">
</el-pagination>
  <!-- 弹窗, 新增 / 修改 -->
<add-or-update v-show="addOrUpdateVisible" ref="addOrUpdate"></add-or-update>
</div>
</template>
<script>
import AddOrUpdate from './comment-question-addOrUpdate'
export default {
components: {AddOrUpdate},
data(){
return{
dataList:[],
addOrUpdateVisible: false,
pageIndex: 1,
pageSize: 10,
totalPage: 0,
 dataForm:{
  title:'',
  status:'',
  created:''
  },
  options: [{
        value: '1',
        label: '正常'
        }, {
            value: '2',
            label: '移除'
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
 activated(){
 this.getDataList()
 },
 methods:{
//显示答案详情
showAnswer(answer){
 this.$alert(answer,'答案详情',{
    confirmButtonText: '确定',
    callback: action => {}
    } 
    );
   },
   //获取数据表
   getDataList(){
   this.$http({
        url: this.$http.adornUrl(''),
        method: 'get',
        params: this.$http.adornParams({
        'page': this.pageIndex,
        'limit': this.pageSize,
        'title':this.dataForm.title,
        'status':this.dataForm.status,
        'created':this.dataForm.created,
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
   //新增或修改处理
   addOrUpdateHandle(id){
   this.addOrUpdateVisible = true
   this.$nextTick(() => {
   this.$refs.addOrUpdate.init(id)
   })
   },
   //移除或恢复按钮
   deleteOrRestoreHandle(id,status){

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
.el-form-item{
margin-right:30px;
}
</style>


