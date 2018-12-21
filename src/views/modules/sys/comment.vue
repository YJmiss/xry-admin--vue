<template>
  <div>
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
     <el-form-item label="课程" prop="parentName"> 
        <el-popover ref="courseListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseList" :props="courseListTreeProps" node-key="id" ref="courseListTree"
            @current-change="courseListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.parentName" v-popover:courseListPopover :readonly="true" placeholder="点击选择课程" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="讲师" prop="teacherName">
        <el-popover ref="teacherListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="teacherList" :props="teacherListTreeProps" node-key="id" ref="teacherListTree" @current-change="teacherListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.teacherName" v-popover:teacherListPopover :readonly="true" placeholder="点击选择讲师" class="cat-list__input"></el-input>
      </el-form-item>
       <el-form-item label="类型">
         <el-select v-model="dataForm.type" placeholder="请选择类型" @change="typeCurrentSel">
            <el-option v-for="item in typeValues" :key="item.typeValue" :label="item.label" :value="item.typeValue"></el-option>
          </el-select>
      </el-form-item>
      <el-form-item label="评论状态">
          <el-select v-model="dataForm.status" placeholder="请选择评论状态" @change="statusCurrentSel">
            <el-option v-for="item in statusValues" :key="item.statusValue" :label="item.label" :value="item.statusValue"></el-option>
          </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('xry:comment:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
      <el-table-column header-align="center" align="left" label="被评论对象" width="260">
        <template slot-scope="scope">                   
          <p v-if="scope.row.type===0">{{scope.row.courseTitle}}</p>
          <p v-else="scope.row.type===1">{{scope.row.realName}}</p>                    
        </template>
      </el-table-column>
      <el-table-column prop="nickname" header-align="center" align="center" label="评价用户" width="150"></el-table-column>
      <el-table-column prop="star_level" header-align="center" align="center" label="星级评分" width="100"></el-table-column>
      <el-table-column prop="status" header-align="center" align="center" label="评论状态" width="120">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 1" size="small" type="success">正常显示</el-tag>
          <el-tag v-else size="small" type="warning">已被删除</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="type" header-align="center" align="center" label="类型" width="150">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.type === 0" size="small" type="success">课程评价</el-tag>
          <el-tag v-else size="small" type="info">讲师评价</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="detail" header-align="center" align="left" label="评论详情" width="360">
        <template slot-scope="scope">
          <el-popover ref="detailPopover" placement="top-start" trigger="hover">
            <span>点击查看评论详情</span>
          </el-popover>
          <el-button show-overflow-tooltip size="small" type="text" v-popover:detailPopover @click="showDetail(scope.row.detail)">{{scope.row.detail}}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="created" header-align="center" align="center" width="180" label="评论时间"></el-table-column>
      <el-table-column prop="reply" header-align="center" align="left" label="回复内容" width="360">
        <template slot-scope="scope">
          <el-popover ref="replyPopover" placement="top-start" trigger="hover">
            <span>点击查看回复内容</span>
          </el-popover>
          <el-button show-overflow-tooltip size="small" type="text" v-popover:replyPopover @click="showReply(scope.row.reply)">{{scope.row.reply}}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="reply_time" header-align="center" align="center" width="180" label="回复时间"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="left" width="260" label="操作" prop="status">
        <template slot-scope="scope">
          <el-button v-if="isAuth('xry:comment:delete')" type="danger" size="small" icon="el-icon-delete" circle @click="deleteHandle(scope.row.id)"></el-button>
          <el-button v-if="isAuth('xry:comment:hideComment')" type="warning" round size="small" @click="hideComment(scope.row.id)" v-show="scope.row.status == 1">删除评论</el-button>
          <el-button v-if="isAuth('xry:comment:recoverComment')" type="primary" round size="small" @click="recoverComment(scope.row.id)" v-show="scope.row.status == 0">恢复显示</el-button>
          <el-button v-if="isAuth('xry:comment:reply')" type="info" round size="small" @click="reply(scope.row.id)" v-show="scope.row.reply === ''">回复</el-button>
          <el-button v-if="isAuth('xry:comment:reply')" type="success" round size="small" @click="reply(scope.row.id)" v-show="scope.row.reply !== ''">已回复</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" 
          :page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <!-- 评论回复 -->
    <comment-reply v-if="commentReplyVisible" ref="commentReply" @refreshDataList="getDataList"></comment-reply>
  </div>
</template>

<script>
  import { treeDataTranslate } from '@/utils'
  import commentReply from './comment-reply'
  export default {
    data () {
      return {
        dataForm: {
          objId: '',
          userId: '',
          star_level: '',
          courseTitle:'',
          status: '',
          teacherName:'',
          realName:'',
          nickname:'',
          parentName:'',
          type: '',
          detail:'',
          reply:'',
          reply_time:''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        commentReplyVisible: false,
        statusValue: '',
        statusValues: [
          { statusValue: '1', label: '正常显示' }, 
          { statusValue: '0', label: '已被删除' }
        ],
        typeValue: '',
        typeValues: [
          { typeValue: '0', label: '课程评价' }, 
          { typeValue: '1', label: '讲师评价' } 
        ],
        courseList: [],
        courseListTreeProps: {
          label: 'title',
          children: 'children'
        },
        teacherList: [],
        teacherListTreeProps: {
          label: 'realName',
          children: 'children'
        }
      }
    },
    components: {commentReply},
    activated () {
      this.getDataList()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        // 查询所有课程，构造成一棵树
        this.$http({
          url: this.$http.adornUrl('/xry/course/treeCourse'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          this.courseList = treeDataTranslate(data.courseList, 'id')
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
              url: this.$http.adornUrl('/xry/comment/list'),
              method: 'get',
              params: this.$http.adornParams({
                'page': this.pageIndex,
                'limit': this.pageSize,
                'courseId':this.dataForm.courseId,
                'userId':this.dataForm.userId,
                'type':this.dataForm.type,
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
      // 弹出评论回复框
      reply (id) {
        this.commentReplyVisible = true
        this.$nextTick(() => {
          this.$refs.commentReply.init(id)
        })
      },
      // 课程类目树选中
      courseListTreeCurrentChangeHandle (data, node) {
        this.dataForm.courseId = data.id
        this.dataForm.parentName = data.title
      },
      // 课程类目树设置当前选中节点
      courseListTreeSetCurrentNode () {
        this.$refs.courseListTree.setCurrentKey(this.dataForm.courseId)
        this.dataForm.parentName = (this.$refs.courseListTree.getCurrentNode() || {})['title']
      },
      // 讲师树选中
      teacherListTreeCurrentChangeHandle (data, node) {
        this.dataForm.userId = data.id
        this.dataForm.teacherName = data.realName
      },
      // 讲师树设置当前选中节点
      teacherListTreeSetCurrentNode () {
        this.$refs.teacherListTree.setCurrentKey(this.dataForm.userId)
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
      // 删除
      deleteHandle (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对该用户进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/message/delete'),
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
      // 不显示评论
      hideComment (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定要进行[${id ? '删除' : '批量删除'}]评论操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/comment/hideComment'),
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
      // 恢复评论显示
      recoverComment (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定要进行[${id ? '恢复显示' : '批量恢复显示'}]评论操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/comment/recoverComment'),
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
      // 用户状态下拉选中事件
      statusCurrentSel(selVal){
        this.status = selVal;
      },
      // 用户角色下拉选中事件
      typeCurrentSel(selVal){
        this.type = selVal;
      },
      // 点击->评论详情弹出框
      showDetail (detail) {
        this.$alert(detail, '评论详情', {
          confirmButtonText: '确定',
          callback: action => {}
        });
      },
      // 点击->回复内容弹出框
      showReply (reply) {
        this.$alert(reply, '回复内容', {
          confirmButtonText: '确定',
          callback: action => {}
        });
      }
    }
  }
</script>
