<template>
  <div class="mod-course-catalog">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="目录名称">
        <el-input v-model="dataForm.title" placeholder="目录名称" clearable></el-input>
      </el-form-item>
      <el-form-item label="所属课程"> 
      <el-select v-model="dataForm.courseid" clearable placeholder="请选择所属课程" popper-class="optionStyle">
      <el-option
        v-for="item in courseList"
        :key="item.id"
        :label="item.title"
        :value="item.id"
        >
      </el-option>
      </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('xry:course:catalog:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('xry:course:catalog:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50">
      </el-table-column>
      <el-table-column prop="id" header-align="center" align="center" width="80" label="ID"></el-table-column>
      <el-table-column prop="courseTitle" header-align="center" align="center" label="所属课程"></el-table-column>
      <el-table-column prop="title" header-align="center" align="center" label="目录名称"></el-table-column>
      <el-table-column prop="created" header-align="center" align="center" width="180" label="创建时间"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('xry:course:catalog:update')" type="primary" size="small" icon="el-icon-edit" circle @click="addOrUpdateHandle(scope.row.id)"></el-button>
          <el-button v-if="isAuth('xry:course:catalog:delete')" type="danger" size="small" icon="el-icon-delete" circle @click="deleteHandle(scope.row.id)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" 
          :page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
  import { treeDataTranslate } from '@/utils'
  import AddOrUpdate from './course-catalog-add-or-update'
  export default {
    data () {
      return {
        dataForm: {
          title: '',
          courseTitle:''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        courseList: []
      }
    },
    components: {
      AddOrUpdate
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
          this.courseList = treeDataTranslate(data.courseList, 'id')
        }).then(() => {
          this.visible = true
          this.$http({
            url: this.$http.adornUrl('/xry/course/catalog/list'),
            method: 'get',
            params: this.$http.adornParams({
              'page': this.pageIndex,
              'limit': this.pageSize,
              'courseid': this.dataForm.courseid,
              'title': this.dataForm.title
            })
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataList = data.page.list
              this.totalPage = data.page.totalCount
              console.log(this.dataList)
            } else {
              this.dataList = []
              this.totalPage = 0
            }
            this.dataListLoading = false
          })
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
      // 新增 / 修改
      addOrUpdateHandle (id) {
        this.addOrUpdateVisible = true
        this.$nextTick(() => {
          this.$refs.addOrUpdate.init(id)
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
            url: this.$http.adornUrl('/xry/course/catalog/delete'),
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
<style>
.optionStyle{
  height:auto;
}
</style>
