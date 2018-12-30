<template>
  <div class="mod-video">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.title" placeholder="视频标题" clearable></el-input>
      </el-form-item>
      <el-form-item label="所属课程" prop="courseName"> 
        <el-popover ref="courseListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseList" :props="courseListTreeProps" node-key="courseId" ref="courseListTree"
            @current-change="courseListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.courseName" v-popover:courseListPopover :readonly="true" placeholder="点击选择所属课程" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="所属目录" prop="catalogName"> 
        <el-popover ref="courseCatalogListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseCatalogList" :props="courseCatalogListTreeProps" node-key="catalogId" ref="courseCatalogListTree"
            @current-change="courseCatalogListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.catalogName" v-popover:courseCatalogListPopover :readonly="true" placeholder="点击选择所属目录" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <!-- <el-button v-if="isAuth('xry:video:examine:pass')" type="success" @click="examine()" :disabled="dataListSelections.length <= 0">批量审核</el-button> -->
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50">
      </el-table-column>
      <el-table-column prop="id" header-align="center" align="center" width="80" label="ID"></el-table-column>
      <el-table-column prop="title" header-align="center" align="center" label="视频标题"></el-table-column>
      <el-table-column prop="courseTitle" header-align="center" align="center" label="所属课程"></el-table-column>
      <el-table-column prop="catalogTitle" header-align="center" align="center" label="所属目录"></el-table-column>
      <el-table-column prop="property" header-align="center" align="center" label="是否收费" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.property === 1" size="small" type="warning">试学</el-tag>
          <el-tag v-else-if="scope.row.property === 2" size="small" type="danger">收费</el-tag>
          <el-tag v-else-if="scope.row.property === 3" size="small" type="success">免费</el-tag>
          <el-tag v-else size="small" type="warning">试学</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" header-align="center" align="center" label="审核状态" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 1" size="small" type="info">未审核</el-tag>
          <el-tag v-else-if="scope.row.status === 2" size="small" type="warning">审核中</el-tag>
          <el-tag v-else-if="scope.row.status === 3" size="small" type="success">已通过</el-tag>
          <el-tag v-else-if="scope.row.status === 4" size="small" type="danger">未通过</el-tag>
          <el-tag v-else size="small" type="info">未审核</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created" header-align="center" align="center" width="180" label="创建时间"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="180" label="操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('xry:vedio:play')" round size="small" @click="videoPlay(scope.row.id)">详情</el-button>
        <el-button v-if="isAuth('xry:record:examine')" round :disabled="scope.row.status == 2 || scope.row.status == 3 || scope.row.status == 5 || scope.row.status == 6" type="primary" size="small" @click="examine(scope.row.id)" >审核</el-button>  
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" 
          :page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <!-- 弹窗, 播放视频内容 -->
    <video-play v-if="videoPlayVisible" ref="videoPlay" @refreshDataList="getDataList"></video-play>
    <!-- 弹窗, 视频审核记录 -->
    <examine-record-add v-if="examineRecordAddVisible" ref="examineRecordAdd" @refreshDataList="getDataList"></examine-record-add>
  </div>
 </template>

<script>
  import { treeDataTranslate } from '@/utils'
  import videoPlay from './video-play'
  import examineRecordAdd from './examine-record-add'
  export default {
    data () {
      return {
        dataForm: {
          title: '',
          courseName: '',
          catalogName: '',
          courseTitle: '',
          catalogTitle: ''
        },
        examineType: 2, // 用于区别视频审核和课程审核
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        videoPlayVisible: false,
        examineRecordAddVisible:false,
        courseList: [],
        courseCatalogList: [],
        courseListTreeProps: {
          label: 'title',
          children: 'children'
        },
        courseCatalogListTreeProps: {
          label: 'title',
          children: 'children'
        }
      }
    },
    components: { videoPlay,examineRecordAdd },
    activated () {
      this.getDataList()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        let status = 1;
        // 查询课程树
        this.$http({
          url: this.$http.adornUrl('/xry/course/treeCourse'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          this.courseList = treeDataTranslate(data.courseList, 'id')
        }).then(() => {
          this.visible = true
          // 查询目录树，需要根据选中课程的id查询出目录树
          this.$http({
            url: this.$http.adornUrl('/xry/course/catalog/treeCourseCatalog'),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            this.courseCatalogList = treeDataTranslate(data.courseCatalogList, 'id')
          }).then(() => {
            this.visible = true
            this.$http({
              url: this.$http.adornUrl('/xry/video/list'),
              method: 'get',
              params: this.$http.adornParams({
                'page': this.pageIndex,
                'limit': this.pageSize,
                'title': this.dataForm.title,
                'courseId': this.dataForm.courseId,
                'catalogId': this.dataForm.catalogId,
                'status':status
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
          })
        })
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
      // 课程目录树选中
      courseCatalogListTreeCurrentChangeHandle (data, node) {
        this.dataForm.catalogId = data.id
        this.dataForm.catalogName = data.title
      },
      // 课程目录树设置当前选中节点
      courseCatalogListTreeSetCurrentNode () {
        this.$refs.courseCatalogListTree.setCurrentKey(this.dataForm.catalogId)
        this.dataForm.catalogName = (this.$refs.courseCatalogListTree.getCurrentNode() || {})['title']
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
      // 查看视频详情 
      videoPlay (id) {
        this.videoPlayVisible = true
        this.$nextTick(() => {
          this.$refs.videoPlay.init(id)
        })
      },
      // 审核/记录审核
      examine(id) {
       this.examineRecordAddVisible = true
        this.$nextTick(() => {
          this.$refs.examineRecordAdd.init(id,this.examineType)
        })
      }
    }
  }
</script>
