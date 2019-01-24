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
      <el-form-item label="状态">
        <el-select v-model="dataForm.status" placeholder="请选择状态" @change="statusSel">
          <el-option v-for="item in contentStatus" :key="item.contentStatusValue" :label="item.label" :value="item.contentStatusValue"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('xry:content:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('xry:content:delete')" type="danger" @click="checkSelection()">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50">
      </el-table-column>
      <el-table-column prop="id" header-align="center" align="center" width="80" label="ID"></el-table-column>
      <el-table-column prop="category" header-align="center" align="center" width="150" label="广告类别">
         <template slot-scope="scope">
          <el-tag v-if="scope.row.category === 1" size="small" type="text">首页轮播</el-tag>
          <el-tag v-else-if="scope.row.category === 2" size="small" type="info">首页中部广告</el-tag>
          <el-tag v-else size="small" type="success">分类页广告</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="title" header-align="center" align="center" label="广告标题"></el-table-column>
      <el-table-column prop="url" header-align="center" align="center" label="跳转链接" width="300">
      </el-table-column>
      <el-table-column prop="courseTitle" header-align="center" align="center" label="所属课程" width="300"></el-table-column>
      <el-table-column prop="pic" header-align="center" align="center" label="广告缩略图" width="100">
        <template slot-scope="scope">
          <el-popover ref="imgPopover" placement="left" trigger="hover">
            <img class="big-img" :src="scope.row.pic"/>
          </el-popover>
          <img class="broadcst-img" v-popover:imgPopover :src="scope.row.pic" alt="广告缩略图">
        </template>
      </el-table-column>
      <el-table-column prop="status" header-align="center" align="center" width="120" label="状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0" size="small" type="warning">已禁用</el-tag>
          <el-tag v-else-if="scope.row.status === 1" size="small" type="success">已启用</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="250" label="操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('xry:content:update')" type="primary" size="small" icon="el-icon-edit" circle @click="addOrUpdateHandle(scope.row.id)"></el-button>
          <el-button v-if="isAuth('xry:content:delete')" type="danger" size="small" icon="el-icon-delete" circle @click="deleteHandle(scope.row.id)"></el-button>
          <el-button v-if="isAuth('xry:content:toDisable')" type="primary" round size="small" @click="contentToDisable(scope.row.id)" v-show="scope.row.status ===1">禁用</el-button>
          <el-button v-if="isAuth('xry:content:toUse')" type="warning" round size="small" @click="contentToUse(scope.row.id)" v-show="scope.row.status ===0 ">启用</el-button>
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
          type: '',
          courseTitle: ''
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
        value: '',
        contentStatus: [
          { contentStatusValue: '1', label: '启用' }, 
          { contentStatusValue: '0', label: '禁用' }
        ],
        contentStatusValue: ''
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
              'title': this.dataForm.title,
              'category': this.dataForm.type,
              'courseId': this.dataForm.courseId,
              'status': this.dataForm.status
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
      //批量操作前判断
      checkSelection(){
       if(this.dataListSelections.length <= 0){
         this.$message.error({
          showClose: true,
          message: '请先选择操作对象！'
         }) 
        }else{
        this.deleteHandle()
        }
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
      // 广告禁用：1->0
      contentToDisable (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '禁用' : '批量禁用'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/content/toDisable'),
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
      // 广告启用：0->1
      contentToUse (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '禁用' : '批量禁用'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/content/toUse'),
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
      },
      // 状态下拉选中事件
      statusSel(selVal){
        this.dataForm.status = selVal;
      }
    }
  }
</script>
<style>
  .broadcst-img{width: 50px;height: 50px;}
  .broadcst-img:hover{cursor:pointer}
  .big-img{height:500px;width:500px;}
</style>