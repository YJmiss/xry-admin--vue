<template>
<div class="container">
<el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
<el-form-item label="反馈用户">
 <el-input v-model="dataForm.userName" placeholder="请输入反馈用户"></el-input>   
</el-form-item>
<el-form-item label="回复状态">
 <el-select v-model="dataForm.replyStatus" clearable placeholder="请选择">
    <el-option
      v-for="item in replyStatusValue"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>
</el-form-item>
<el-form-item label="反馈时间">
<el-date-picker
    v-model="dataForm.feedbackTime"
    align="right"
    type="date"
    placeholder="选择日期"
    :picker-options="pickerOptions"
    format="yyyy-MM-dd"
    value-format="yyyy-MM-dd">
</el-date-picker>
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
<el-button  @click="getDataList()">查询</el-button>
</el-form>    
<el-table :data="dataList" border style="width: 100%">
<el-table-column prop="id" label="ID" width="250" header-align="center"></el-table-column>
<el-table-column prop="userName" label="反馈用户" width="180" header-align="center"></el-table-column>
<el-table-column prop="feedbackDetail" label="反馈详情" header-align="center" max-width="250"></el-table-column>
<el-table-column prop="feedbackTime" label="反馈时间" header-align="center" width="150"></el-table-column>
<el-table-column prop="replyDetail" label="回复详情" header-align="center"></el-table-column>
<el-table-column label="回复状态" header-align="center" width="120">
<template slot-scope="scope" prop="replyStatus">
<el-tag type="danger" v-if="scope.row.replyStatus == 1">未回复</el-tag>
<el-tag type="success" v-if="scope.row.replyStatus == 2">已回复</el-tag>
</template>   
</el-table-column>
<el-table-column label="状态" header-align="center" width="120">
<template slot-scope="scope" prop="status">
<span type="success" v-if="scope.row.status == 1">正常</span>
<span type="info" v-if="scope.row.status == 2">已移除</span>
</template>   
</el-table-column>
<el-table-column fixed="right"  label="操作" header-align="center">
<template slot-scope="scope" prop="status">
<el-button  type="primary" size="small" icon="el-icon-edit"  @click="replyHandle(scope.row.id)">回复</el-button>
<el-button  type="danger" size="small" icon="el-icon-delete"  @click="deleteOrRestoreHandle(scope.row.id,scope.row.status)" v-show="scope.row.status == 1">移除</el-button>
<el-button  type="success" size="small" icon="el-icon-refresh"  @click="deleteOrRestoreHandle(scope.row.id,scope.row.status)" v-show="scope.row.status == 2">恢复</el-button>
</template>   
</el-table-column>
</el-table>
<el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" 
          :page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper">
</el-pagination>
<!-- 弹窗, 填写回复内容 -->
<el-dialog :title="回复反馈" :visible="visible">
<el-form :inline="true" :model="dataForm" :rules="dataRule">
<el-form-item label="回复内容">
<editor v-model="dataForm.replyContent" max-height="450px"></editor> 
</el-form-item>
</el-form>
<span slot="footer" class="dialog-footer">
<el-button @click="visible = false">取消</el-button>
<el-button type="primary" @click="replySubmit()">确定</el-button>
</span>
</el-dialog>
</div>
</template>
<script>
import Editor from '@/components/quill-editor.vue'
export default {
components: {Editor},
    data(){
    return{
    visible:false,
    dataList:[],
    pageIndex: 1,
    pageSize: 10,
    totalPage: 0,
    dataForm:{
    userName:'',
    userId:'',
    status:'',
    feedbackTime:'',
    replyStatus:'',
    replyContent:'',
    currentUserId:''
    },
     dataRule: {
        replyContent: [{ required: true, message: "请填写回复内容", trigger: "blur" }]
      },
    options: [{
        value: '1',
        label: '正常'
        }, {
            value: '2',
            label: '移除'
        }],
   replyStatusValue: [{
        value: '1',
        label: '未回复'
        }, {
            value: '2',
            label: '已回复'
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
    //获取数据表
    getDataList(){
     this.$http({
        url: this.$http.adornUrl(''),
        method: 'get',
        params: this.$http.adornParams({
        'page': this.pageIndex,
        'limit': this.pageSize,
        'userId':this.dataForm.userId,
        'status':this.dataForm.status,
        'replyStatus':this.dataForm.replyStatus,
        'feedbackTime':this.dataForm.feedbackTime
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
    //回复反馈
    replyHandle(id) {
    this.visible = true
    this.dataForm.currentUserId = id
    this.replySubmit()
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
    },
    //提交表单
    replySubmit(){
    this.$http({
        url:this.$http.adornUrl(''),
        method:'post',
        data: this.$http.adornData({
        'userId': this.dataForm.currentUserId || undefined,
        'content':this.dataForm.replyContent
        }).then(({ data }) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                    this.$emit('refreshDataList')
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
        })
    })
} 
}
}
</script>
<style scoped>
.el-form-item{
margin-right:30px;
}
</style>

