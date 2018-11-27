<template>
  <div class="mod-course">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="所属类目" prop="courseCatName"> 
        <el-popover ref="courseCatListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseCatList" :props="courseCatListTreeProps" node-key="id" ref="courseCatListTree"
            @current-change="courseCatListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.courseCatName" v-popover:courseCatListPopover :readonly="true" placeholder="点击选择课程类目" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="课程标题" prop="parentName"> 
        <el-popover ref="courseListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseList" :props="courseListTreeProps" node-key="id" ref="courseListTree"
            @current-change="courseListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.parentName" v-popover:courseListPopover :readonly="true" placeholder="点击选择课程标题" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="审核状态">
        <el-select v-model="dataForm.status" placeholder="请选择审核状态" @change="currentSel">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select> 
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <!-- <el-button v-if="isAuth('xry:course:examine:pass')" type="success" @click="examinePass()" :disabled="dataListSelections.length <= 0">批量审核</el-button> -->
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50" :disabled="dataForm.status ==3 || dataForm.status ==2"></el-table-column>
      <el-table-column prop="id" header-align="center" align="center" width="80" label="ID"></el-table-column>
      <el-table-column prop="title" header-align="center" align="center" label="课程标题"></el-table-column>
      <el-table-column prop="nickname" header-align="center" align="center" label="所属讲师"></el-table-column>
      <el-table-column prop="price" header-align="center" align="center" label="课程价格"></el-table-column>
      <el-table-column prop="status" header-align="center" align="center" label="审核状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 1" size="small" type="info">未审核</el-tag>
          <el-tag v-else-if="scope.row.status === 2" size="small" type="warning">审核中</el-tag>
          <el-tag v-else-if="scope.row.status === 3" size="small" type="success">已通过</el-tag>
          <el-tag v-else-if="scope.row.status === 4" size="small" type="danger">未通过</el-tag>
          <el-tag v-else-if="scope.row.status === 5" size="small" type="warning">通过审核未上架</el-tag>
          <el-tag v-else-if="scope.row.status === 6" size="small" type="success">通过审核已上架</el-tag>
          <el-tag v-else size="small" type="info">未审核</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created" header-align="center" align="center" width="180" label="创建时间"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="300" label="操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('xry:course:detail')" round size="small" @click="viewDetail(scope.row.id)">详情</el-button>
          <el-button v-if="isAuth('xry:record:examine')" round :disabled="scope.row.status == 2 || scope.row.status == 3 || scope.row.status == 5 || scope.row.status == 6" type="primary" size="small" @click="examine(scope.row.id)" >审核</el-button> 
          <!-- <el-button v-if="isAuth('xry:course:examine:reject')" type="danger" size="small" @click="examineReject(scope.row.id)">审核驳回</el-button> -->
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" 
          :page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <!-- 弹窗, 查看详情（审核内容） -->
    <course-detail v-if="courseDetailVisible" ref="courseDetail" @refreshDataList="getDataList"></course-detail>
    <!-- 弹窗, 视频审核记录 -->
    <examine-record-add v-if="examineRecordAddVisible" ref="examineRecordAdd" @refreshDataList="getDataList"></examine-record-add>
  </div>
</template>

<script>
  import { treeDataTranslate } from '@/utils'
  import courseDetail from './course-examine-detail'
  import examineRecordAdd from './examine-record-add'
  export default {
    data () {
      return {
        dataForm: {
          id: 0,
          title: '',
          parentName: '',
          courseCatName: '',
          nickname: '',
          examinePassBtnStatus: false,
          examineRejectBtnStatus: false
        },
        examineType: 1, // 用于区别视频审核和课程审核
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        courseDetailVisible: false,
        examineRecordAddVisible:false,
        courseList: [],
        courseListTreeProps: {
          label: 'title',
          children: 'children'
        },
        courseCatList: [],
        courseCatListTreeProps: {
          label: 'name',
          children: 'children'
        },
        options: [{
          value: '1', label: '未审核'
        }, {
          value: '2', label: '审核中'
        }, {
          value: '3', label: '已通过'
        }, {
          value: '4', label: '未通过'
        }],
        value: ''
      }
    },
    components: { courseDetail,examineRecordAdd },
    activated () {
      this.getDataList()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/xry/course/cat/treeCourseCat'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          this.courseCatList = treeDataTranslate(data.courseCatList, 'id')
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/course/treeCourse'),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            this.courseList = treeDataTranslate(data.courseList, 'id')
          }).then(() => {
            this.$http({
                url: this.$http.adornUrl('/xry/course/examineList'),
                method: 'get',
                params: this.$http.adornParams({
                'page': this.pageIndex,
                'limit': this.pageSize,
                'catalogId': this.dataForm.courseCatId,
                'courseId': this.dataForm.courseId,
                'examineStatus': this.dataForm.status
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
      // 课程类目树选中
      courseCatListTreeCurrentChangeHandle (data, node) {
        this.dataForm.courseCatId = data.id
        this.dataForm.courseCatName = data.name
      },
      // 课程类目树设置当前选中节点
      courseCatListTreeSetCurrentNode () {
        this.$refs.courseCatListTree.setCurrentKey(this.dataForm.courseCatId)
        this.dataForm.courseCatName = (this.$refs.courseCatListTree.getCurrentNode() || {})['name']
      },
      // 课程树选中
      courseListTreeCurrentChangeHandle (data, node) {
        this.dataForm.courseId = data.id
        this.dataForm.parentName = data.title
      },
      // 课程树设置当前选中节点
      courseListTreeSetCurrentNode () {
        this.$refs.courseListTree.setCurrentKey(this.dataForm.courseId)
        this.dataForm.parentName = (this.$refs.courseListTree.getCurrentNode() || {})['title']
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
      // 查看课程详情 
      viewDetail (id) {
        this.courseDetailVisible = true
        this.$nextTick(() => {
          this.$refs.courseDetail.init(id)
        })
      },
      // 审核状态选择改变
      currentSel(selVal){
        this.dataForm.status = selVal;
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