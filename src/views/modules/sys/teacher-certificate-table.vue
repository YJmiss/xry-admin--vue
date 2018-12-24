<template>
    <div id="teacherData">
      <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
        <el-form-item label="讲师姓名">
          <el-input v-model="dataForm.real_name" placeholder="讲师姓名" clearable></el-input>
        </el-form-item>
        <el-form-item label="申请日期">
        <el-date-picker v-model="dataForm.created" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item>
        <el-button v-if="isAuth('xry:teacher:list')" type="primary" @click="getDataList()">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="dataList" v-loading="dataListLoading" @selection-change="selectionChangeHandle" border style="width: 100%">
        <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
        <el-table-column prop="nickname" header-align="center" align="center" label="账号/昵称" width="200">
          <template slot-scope="scope">
           <span>{{scope.row.nickname}}</span>&nbsp;/&nbsp;<span>{{scope.row.userPhone}}</span>
          </template>    
        </el-table-column>
        <el-table-column prop="real_name" header-align="center" align="center" label="讲师姓名" width="150"></el-table-column>
        <el-table-column prop="orgName" header-align="center" align="center" label="所属机构" width="200"></el-table-column>
        <el-table-column prop="id_card" header-align="center" align="center" label="身份证号" width="250"></el-table-column>
        <el-table-column prop="introduction" header-align="center" align="center" label="讲师简介" width="200"></el-table-column>
        <el-table-column prop="type" header-align="center" align="center" label="类型" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.type === 1" size="small" type="success">讲师认证</el-tag>
            <el-tag v-else size="small"  type="danger">机构认证</el-tag>
          </template>  
        </el-table-column>
        <el-table-column prop="status" header-align="center" align="center" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 1" size="small" type="info">认证中</el-tag>
            <el-tag v-else-if="scope.row.status === 2" size="small" type="warning">未通过</el-tag>
            <el-tag v-else size="small" type="success">已通过</el-tag>
          </template>  
        </el-table-column>
        <el-table-column prop="created" header-align="center" align="center" width="150" label="申请时间"></el-table-column>
        <el-table-column fixed="right" header-align="center" align="center"  label="操作">
          <template slot-scope="scope">
            <el-button v-if="isAuth('xry:teacher:info')" type="default" size="small"  @click="viewDataHandle(scope.row.id)">详情</el-button>
            <el-button v-if="isAuth('xry:record:examine')" type="primary" size="small" @click="examine(scope.row.id)" :disabled="scope.row.status === 3">认证</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" 
              :page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper">
      </el-pagination>
      <!-- 弹窗, 讲师认证资料审核并记录 -->
      <examine-record-add v-show="examineRecordAddVisible" ref="examineRecordAdd"></examine-record-add> 
      <!-- 弹窗，讲师认证资料详情查看 -->
      <teacher-certificate-info v-show="infoVisible" ref="TeacherCertificateInfo"></teacher-certificate-info>
    </div>
  </template>
  <script>
  import { treeDataTranslate } from '@/utils'
  import examineRecordAdd from './examine-record-add'
  import TeacherCertificateInfo from './teacher-certificate-info'
  export default {
  components:{examineRecordAdd,TeacherCertificateInfo},
  data(){
    return{
      examineRecordAddVisible:false,
      infoVisible:false,
      examineType:3, // 用于区别审核类型
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      dataForm:{
        nickname:'',
        userPhone:'',
        real_name:'',
        orgName:'',
        id_card:'',
        id_card_front:'',
        id_card_back:'',
        type:'',
        status: '1',
        created: '',
        introduction:''
      }
    }
  },
  activated () {
    this.getDataList()
  }, 
  methods:{
    //查看申请资料详情
    viewDataHandle(id){
      this.infoVisible=true
      this.$nextTick(() => {
      this.$refs.TeacherCertificateInfo.init(id)
      })
    },
    // 审核/记录审核
    examine(id) {
      this.examineRecordAddVisible = true
      this.$nextTick(() => {
      this.$refs.examineRecordAdd.init(id,this.examineType)
      })
    },
    //获取数据
  getDataList(){
    this.dataListLoading = true
    this.visible = true
    this.$http({
      url: this.$http.adornUrl('/xry/teacher/list'),
      method: 'get',
      params: this.$http.adornParams({
        'page': this.pageIndex,
        'limit': this.pageSize,
        'realName':this.dataForm.real_name,
        'created':this.dataForm.created
      })
    }).then(({ data }) => {
      if (data && data.code === 0) {
        this.dataList = data.page.list
        this.totalPage = data.page.totalCount
      } else {
        this.dataList = []
        this.totalPage = 0
      }
      this.dataListLoading = false
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
  // 多选
  selectionChangeHandle (val) {
    this.dataListSelections = val
  },
  }
}
</script>
<style scoped>
  .el-form-item{margin-right:30px;}
</style>

