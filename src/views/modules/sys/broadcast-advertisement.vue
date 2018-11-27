<template>
  <div class="mod-course">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
       <el-form-item label="广告类别">
        <template>
          <el-select v-model="dataForm.type" placeholder="请选择">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </template>
      </el-form-item>
      <el-form-item label="广告标题">
        <el-input v-model="dataForm.title" placeholder="广告标题" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('xry:content:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('xry:content:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50">
      </el-table-column>
      <el-table-column prop="id" header-align="center" align="center" width="80" label="ID"></el-table-column>
      <el-table-column prop="category" header-align="center" align="center" label="广告类别">
         <template slot-scope="scope">
          <el-tag v-if="scope.row.category === 1" size="small" type="text">首页轮播</el-tag>
          <el-tag v-else-if="scope.row.category === 2" size="small" type="text">首页中部广告</el-tag>
          <el-tag v-else size="small" type="text">分类页广告</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="title" header-align="center" align="center" label="内容标题"></el-table-column>
      <el-table-column prop="url" header-align="center" align="center" label="跳转链接"></el-table-column>
      <el-table-column prop="created" header-align="center" align="center" width="180" label="创建时间"></el-table-column>
      <el-table-column prop="pic" header-align="center" align="center" label="图片"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('xry:content:update')" type="primary" size="small" icon="el-icon-edit" circle @click="addOrUpdateHandle(scope.row.id)"></el-button>
          <el-button v-if="isAuth('xry:content:delete')" type="danger" size="small" icon="el-icon-delete" circle @click="deleteHandle(scope.row.id)"></el-button>
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
  import AddOrUpdate from './broadcast-advertisement-add-or-update'
  export default {
    data () {
      return {
        dataForm: {
          title: '',
          category: 0,
          url: '',
          pic: '',
          type: ''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        options: [{
          value: '1', label: '首页轮播广告'
        }, {
          value: '2',label: '首页中部广告'
        }, {
          value: '3',label: '分类页广告'
        }],
        value: ''
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
            url: this.$http.adornUrl('/xry/content/list'),
            method: 'get',
            params: this.$http.adornParams({
              'page': this.pageIndex,
              'limit': this.pageSize,
              'category': this.dataForm.type,
              'title': this.dataForm.title
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
            url: this.$http.adornUrl('/xry/content/delete'),
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
      },
      // 广告类别下拉选中事件
      currentSel(selVal){
        this.type = selVal;
      }
    }
  }
</script>
