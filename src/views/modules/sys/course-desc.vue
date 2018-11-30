<template>
  <div class="mod-course-desc">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="所属课程" prop="parentName"> 
        <el-popover ref="courseListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseList" :props="courseListTreeProps" node-key="course_id" ref="courseListTree" @current-change="courseListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.parentName" v-popover:courseListPopover :readonly="true" placeholder="点击选择上级课程类目" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('xry:course:desc:save')" type="primary" @click="addHandle()">新增</el-button>
        <el-button v-if="isAuth('xry:course:desc:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50">
      </el-table-column>
      <el-table-column prop="course_id" header-align="center" align="center" width="80" label="ID"></el-table-column>
      <el-table-column prop="title" header-align="center" align="center" label="所属课程"></el-table-column>
      <el-table-column prop="" header-align="center" align="center" label="描述详情">
        
      </el-table-column>
      <el-table-column prop="created" header-align="center" align="center" width="280" label="创建时间"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="300" label="操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('xry:course:desc:update')" type="primary" size="small" icon="el-icon-edit" circle @click="updateHandle(scope.row.id)"></el-button>
          <el-button v-if="isAuth('xry:course:desc:delete')" type="danger" size="small" icon="el-icon-delete" circle @click="deleteHandle(scope.row.id)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" 
          :page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <!-- 弹窗, 新增 -->
    <add-page v-if="addVisible" ref="addPage" @refreshDataList="getDataList"></add-page>
    <!-- 弹窗, 修改 -->
    <update-page v-if="updateVisible" ref="updatePage" @refreshDataList="getDataList"></update-page>
  </div>
</template>

<script>
  import { treeDataTranslate } from '@/utils'
  import AddPage from './course-desc-add'
  import UpdatePage from './course-desc-update'
  export default {
    data () {
      return {
        dataForm: {
          parentName: '',
          course_id: '',
          title: '',
          course_desc:''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addVisible: false,
        updateVisible: false,
        courseList: [],
        courseListTreeProps: {
          label: 'title',
          children: 'children'
        }
      }
    },
    components: {
      AddPage,UpdatePage
    },
    activated () {
      this.getDataList()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/xry/course/treeCourse'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          this.courseList = treeDataTranslate(data.courseList, 'courseId')
        }).then(() => {
          this.visible = true
          this.$http({
            url: this.$http.adornUrl('/xry/course/desc/list'),
            method: 'get',
            params: this.$http.adornParams({
              'page': this.pageIndex,
              'limit': this.pageSize,
              'courseId': this.dataForm.course_id
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
      },
      // 课程树选中
      courseListTreeCurrentChangeHandle (data, node) {
        this.dataForm.course_id = data.id
        this.dataForm.parentName = data.title
      },
      // 课程树设置当前选中节点
      courseListTreeSetCurrentNode () {
        this.$refs.courseListTree.setCurrentKey(this.dataForm.id)
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
      // 新增
      addHandle (id) {
        this.addVisible = true
        this.$nextTick(() => {
          this.$refs.addPage.init(id)
        })
      },
      // 修改
      updateHandle (id) {
        this.updateVisible = true
        this.$nextTick(() => {
          this.$refs.updatePage.init(id)
        })
      },
      // 删除
      deleteHandle (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/course/desc/delete'),
            method: 'post',
            data: this.$http.adornData(ids, false)
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
        }).catch(() => {})
      }
    }
  }
</script>
