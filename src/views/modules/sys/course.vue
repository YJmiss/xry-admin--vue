<template>
  <div class="mod-course">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="所属类目" prop="parentName"> 
        <el-popover ref="courseCatListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseCatList" :props="courseCatListTreeProps" node-key="id" ref="courseCatListTree"
            @current-change="courseCatListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input clearable v-model="dataForm.parentName" v-popover:courseCatListPopover  placeholder="点击选择课程类目" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="所属讲师" prop="teacherName">
        <el-popover ref="teacherListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="teacherList" :props="teacherListTreeProps" node-key="id" ref="teacherListTree" @current-change="teacherListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input clearable v-model="dataForm.teacherName" v-popover:teacherListPopover  placeholder="点击选择所属讲师" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="课程标题">
        <el-input v-model="dataForm.title" placeholder="课程标题" clearable></el-input>
      </el-form-item>
      <el-form-item label="审核状态">
       <el-select v-model="dataForm.status" clearable placeholder="请选择">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      </el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button  class="button" v-if="isAuth('xry:course:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button  class="button" v-if="isAuth('xry:course:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
        <el-button  class="button" v-if="isAuth('xry:course:addToCourse')" type="primary" @click="addToCourse()" :disabled="dataListSelections.length <= 0">批量上架</el-button>
        <el-button class="button" v-if="isAuth('xry:course:delFromCourse')" type="warning" @click="delFromCourse()" :disabled="dataListSelections.length <= 0">批量下架</el-button>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
      <!-- <el-table-column prop="id" header-align="center" align="center" width="80" label="ID"></el-table-column> -->
      <el-table-column prop="title" header-align="center" align="center" width="320" label="课程标题"></el-table-column>
      <el-table-column prop="catName" header-align="center" align="center" width="300" label="所属类目"></el-table-column>
      <el-table-column prop="realName" header-align="center" align="center" width="150" label="所属讲师"></el-table-column>
      <el-table-column header-align="center" align="center" label="课程价格（元）">
        <template slot-scope="scope" prop="price">
        <span v-if="scope.row.price >= 0">{{scope.row.price / 100}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" header-align="center" align="center" width="150" label="审核状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 1" size="small" type="info">未审核</el-tag>
          <el-tooltip v-else-if="scope.row.status === 2" class="item" effect="dark" content="点击查看原因" placement="top">
          <el-button v-if="isAuth('xry:record:detail')"  @click="getExamineData(scope.row.id)" round style="padding:0;width:auto;height:auto;border:none;">
            <el-tag size="small" type="danger">未通过</el-tag>
            </el-button>
          </el-tooltip>
          <el-tag v-else-if="scope.row.status === 3" size="small" type="warning">通过审核未上架</el-tag>
          <el-tag v-else-if="scope.row.status === 4" size="small" type="success">通过审核已上架</el-tag>
          <el-tag v-else size="small" type="info">已下架</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created" header-align="center" align="center" width="220" label="创建时间"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="left" width="250" label="操作">
        <template slot-scope="scope" porp="status">
          <el-button  v-if="isAuth('xry:course:update')" type="primary" size="small" icon="el-icon-edit" circle @click="addOrUpdateHandle(scope.row.id)" :disabled="scope.row.status ===4 || scope.row.status === 3"></el-button>
          <el-button  v-if="isAuth('xry:course:delete')" type="danger" size="small" icon="el-icon-delete" circle @click="deleteHandle(scope.row.id,scope.row.status)" :disabled="scope.row.status ===4 || scope.row.status === 3"></el-button>
          <el-button  v-if="isAuth('xry:course:addToCourse')" type="primary" round size="small" @click="addToCourse(scope.row.id)" v-show="scope.row.status ===3 || scope.row.status ===5">上架</el-button>
          <el-button  v-if="isAuth('xry:course:delFromCourse')" type="warning" round size="small" @click="delFromCourse(scope.row.id)" v-show="scope.row.status ===4 ">下架</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" 
          :page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
     <!-- 显示审核详情 -->
    <el-dialog title="审核结果："  :close-on-click-modal="false" :visible.sync="examineDetailvisible">
      <p>{{dataForm.examineDetail}}</p>
    </el-dialog>
  </div>
  </template>

<script>
  import { treeDataTranslate } from '@/utils'
  import AddOrUpdate from './course-add-or-update'
  export default {
    components: {
      AddOrUpdate
    },
    data () {
      return {
        examineDetailvisible:false,
        dataForm: {
          parentName: '',
          title: '',
          name: '',
          teacherName:'',
          catName:'',
          realName:'',
          examineDetail:'',
          recordList:[]
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
        },
        teacherList: [],
        teacherListTreeProps: {
          label: 'realName',
          children: 'children'
        },
         options: [{
          value: '1',
          label: '未审核'
        }, {
          value: '2',
          label: '未通过'
        }, {
          value: '3',
          label: '通过审核未上架'
        }, {
          value: '4',
          label: '通过审核已上架'
        }]
      }
    },
    activated () {
      this.getDataList()
    },
    methods: {
      //获取审核结果
      getExamineData(id){
        this.examineDetailvisible = true
        this.$http({
          url: this.$http.adornUrl('/xry/record/detail'),
          method: 'get',
          params:this.$http.adornParams({
          'recordId' : id
          })
          }).then(({ data }) => {
          if (data && data.code === 0) {
          this.dataForm.examineDetail = data.detailBatch
          } 
        })
      },
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        // 查询所有课程类目，构造成一棵树
        this.$http({
          url: this.$http.adornUrl('/xry/course/cat/treeCourseCat'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          this.courseCatList = treeDataTranslate(data.courseCatList, 'id')
        }).then(() => {
          // 查询讲师列表，构造成一棵树
          this.$http({
            url: this.$http.adornUrl('/xry/teacher/treeTeacher'),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            this.teacherList = treeDataTranslate(data.teacherList, 'id')
          }).then(() => {
            this.$http({
              url: this.$http.adornUrl('/xry/course/list'),
              method: 'get',
              params: this.$http.adornParams({
                'page': this.pageIndex,
                'limit': this.pageSize,
                'title': this.dataForm.title,
                'cid': this.dataForm.parentId,
                'tid': this.dataForm.teacherId,
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
          })
        })
      },
      // 课程类目树选中
      courseCatListTreeCurrentChangeHandle (data, node) {
        this.dataForm.parentId = data.id
        this.dataForm.parentName = data.name
      },
      // 课程类目树设置当前选中节点
      courseCatListTreeSetCurrentNode () {
        this.$refs.courseCatListTree.setCurrentKey(this.dataForm.parentId)
        this.dataForm.parentName = (this.$refs.courseCatListTree.getCurrentNode() || {})['name']
      },
      // 讲师树选中
      teacherListTreeCurrentChangeHandle (data, node) {
        this.dataForm.teacherId = data.id
        this.dataForm.teacherName = data.realName
      },
      // 讲师树设置当前选中节点
      teacherListTreeSetCurrentNode () {
        this.$refs.teacherListTree.setCurrentKey(this.dataForm.teacherId)
        this.dataForm.teacherName = (this.$refs.teacherListTree.getCurrentNode() || {})['realName']
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
      deleteHandle (id,status) {
        if(status === 3 || status === 4){
        this.$message.error({
        showClose: true,
         message: '该课程正处于“审核通过”或“上架”状态不能删除，如果一定要删除，请先下架！ '
        });
        }
        else{
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/course/delete'),
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
      },
      // 课程上架操作
      addToCourse(id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '上架' : '批量上架'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/course/addToCourse'),
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
      // 课程下架操作
      delFromCourse(id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '下架' : '批量下架'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/course/delFromCourse'),
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
<style scoped>
p{
font:14px 微软雅黑;
color:#ff0000;
letter-spacing:2px;
}
.button{
padding-left:16px;
padding-right:16px;
}
</style>
