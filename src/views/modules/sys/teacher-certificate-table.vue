<template>
    <div id="teacherData">
      <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
        <el-form-item label="讲师姓名">
          <el-input v-model="dataForm.real_name" placeholder="讲师姓名" clearable></el-input>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="dataForm.status" placeholder="请选择">
            <el-option  v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
            <el-button v-if="isAuth('xry:teacher:list')" type="primary" @click="getDataList()">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="dataList" v-loading="dataListLoading" @selection-change="selectionChangeHandle" border style="width: 100%">
        <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
        <el-table-column prop="nickname" header-align="center" align="center" label="账号/昵称" width="300">
          <template slot-scope="scope">
            <el-tag size="small" type="info">{{scope.row.nickname}}</el-tag>
            <el-tag size="small" type="info">{{scope.row.userPhone}}</el-tag>
          </template>    
        </el-table-column>
        <el-table-column prop="real_name" header-align="center" align="center" label="讲师姓名" width="150"></el-table-column>
        <el-table-column prop="orgName" header-align="center" align="left" label="所属机构" width="350"></el-table-column>
        <el-table-column prop="id_card" header-align="center" align="center" label="身份证号" width="250"></el-table-column>
        <el-table-column prop="type" header-align="center" align="center" label="类型" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.type === 1" size="small" type="success">个人认证</el-tag>
            <el-tag v-else size="small"  type="danger">机构认证</el-tag>
          </template>  
        </el-table-column>
        <el-table-column prop="status" header-align="center" align="center" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 1" size="small" type="info">认证中</el-tag>
            <el-tag v-else-if="scope.row.status === 2" size="small" type="success">未通过</el-tag>
            <el-tag v-else size="small" type="warning">已通过</el-tag>
          </template>  
        </el-table-column>
        <el-table-column prop="created" header-align="center" align="center" width="180" label="申请时间"></el-table-column>
        <el-table-column fixed="right" header-align="center" align="center" width="300" label="操作">
          <template slot-scope="scope">
            <el-button v-if="isAuth('xry:teacher:info')" type="default" size="small"  @click="viewDataHandle(scope.row.id)">详情</el-button>
            <el-button v-if="isAuth('xry:record:examine')" type="primary" size="small" @click="examine(scope.row.id)" :disabled="scope.row.status === 3">认证</el-button>
          </template>
        </el-table-column>
      </el-table>
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
        status: '',
        created: ''
      },
      options: [ 
        { label:'认证中', value:'1' },
        { label:'未通过', value:'2' },
        { label:'已通过', value:'3' } 
      ],
      value: ''
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
    // 查找是否有所属机构
    this.visible = true
    this.$http({
      url: this.$http.adornUrl('/xry/teacher/list'),
      method: 'get',
      params: this.$http.adornParams({
        'page': this.pageIndex,
        'limit': this.pageSize,
        'realName':this.dataForm.real_name,
        'status':this.dataForm.status
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

