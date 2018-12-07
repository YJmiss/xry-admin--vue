<template>
  <div class="mod-course">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="文章分类" prop="parentName"> 
        <el-popover ref="courseCatListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseCatList" :props="courseCatListTreeProps" node-key="id" ref="courseCatListTree" @current-change="courseCatListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.parentName" v-popover:courseCatListPopover :readonly="true" placeholder="点击选择文章分类" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="文章标题">
        <el-input v-model="dataForm.title" placeholder="文章标题" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('xry:article:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('xry:article:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
      <!-- <el-table-column prop="id" header-align="center" align="center" width="80" label="ID"></el-table-column> -->
      <el-table-column prop="catName" header-align="center" align="left" width="250" label="文章分类"></el-table-column>
      <el-table-column prop="title" header-align="center" align="left" width="320" label="课程标题"></el-table-column>
      <el-table-column prop="share_count" header-align="center" align="left" width="100" label="分享次数"></el-table-column>
      <el-table-column prop="thumbs_count" header-align="center" align="center" width="100" label="点赞次数"></el-table-column>
      <el-table-column prop="collect_count" header-align="center" align="center" width="100" label="收藏人数"></el-table-column>
      <el-table-column prop="browse_count" header-align="center" align="center" width="100" label="浏览次数"></el-table-column>
      <el-table-column prop="recommend" header-align="center" align="center" width="140" label="是否推荐">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.recommend === 1" size="small" type="success">已推荐</el-tag>
          <el-tag v-else size="small" type="info">未推荐</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" header-align="center" align="center" width="140" label="是否发布">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 1" size="small" type="success">已发布</el-tag>
          <el-tag v-else size="small" type="info">未发布</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="publish_time" header-align="center" align="center" width="220" label="发布时间"></el-table-column>
      <el-table-column prop="username" header-align="center" align="center" width="220" label="创建人"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="left" width="250" label="操作">
        <template slot-scope="scope" porp="status">
          <el-button v-if="isAuth('xry:article:update')" type="primary" size="small" icon="el-icon-edit" circle @click="addOrUpdateHandle(scope.row.id)" :disabled="scope.row.status ===1"></el-button>
          <el-button v-if="isAuth('xry:article:delete')" type="danger" size="small" icon="el-icon-delete" circle @click="deleteHandle(scope.row.id)" :disabled="scope.row.status ===1"></el-button>
          <el-button v-if="isAuth('xry:article:publishArticle')" type="primary" round size="small" @click="publishArticle(scope.row.id)" v-show="scope.row.status ===0">发布文章</el-button>
          <el-button v-if="isAuth('xry:article:cancelPublish')" type="warning" round size="small" @click="cancelPublish(scope.row.id)" v-show="scope.row.status ===1">取消发布</el-button>
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
  import AddOrUpdate from './article-add-or-update'
  export default {
    data () {
      return {
        dataForm: {
          parentName: '',
          title: '',
          share_count: '',
          thumbs_count: '',
          collect_count: '',
          browse_count: '',
          status:'',
          recommend: '',
          publish_time: '',
          catName:'',
          username:''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        courseCatList: [],
        courseCatListTreeProps: {
          label: 'name',
          children: 'children'
        }
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
        // 查询所有文章分类，构造成一棵树
        this.$http({
          url: this.$http.adornUrl('/xry/course/cat/treeCourseCat'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          this.courseCatList = treeDataTranslate(data.courseCatList, 'id')
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/article/list'),
            method: 'get',
            params: this.$http.adornParams({
              'page': this.pageIndex,
              'limit': this.pageSize,
              'type':this.dataForm.type,
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
        })
      },
      // 文章分类树选中
      courseCatListTreeCurrentChangeHandle (data, node) {
        this.dataForm.type = data.id
        this.dataForm.parentName = data.name
      },
      // 文章分类树设置当前选中节点
      courseCatListTreeSetCurrentNode () {
        this.$refs.courseCatListTree.setCurrentKey(this.dataForm.type)
        this.dataForm.parentName = (this.$refs.courseCatListTree.getCurrentNode() || {})['name']
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
            url: this.$http.adornUrl('/xry/article/delete'),
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
      // 发布文章
      publishArticle (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定要[id=${ids.join(',')}]进行[${id ? '发布' : '批量发布'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/article/publishArticle'),
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
      // 发布文章
      cancelPublish (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定要[id=${ids.join(',')}]进行[${id ? '取消发布' : '批量取消发布'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/article/cancelPublish'),
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
