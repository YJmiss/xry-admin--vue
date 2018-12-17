<template>
  <div class="mod-course">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="选择课程" prop="parentName"> 
        <el-popover ref="courseListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseList" :props="courseListTreeProps" node-key="id" ref="courseListTree"
            @current-change="courseListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.parentName" v-popover:courseListPopover :readonly="true" placeholder="点击选择课程" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="所属讲师" prop="teacherName">
        <el-popover ref="teacherListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="teacherList" :props="teacherListTreeProps" node-key="id" ref="teacherListTree" @current-change="teacherListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.teacherName" v-popover:teacherListPopover :readonly="true" placeholder="点击选择讲师" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="消息类型">
        <el-select v-model="dataForm.msg_type" placeholder="请选择消息类型" @change="currentSel">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('xry:message:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('xry:message:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
      <!-- <el-table-column prop="id" header-align="center" align="center" width="80" label="ID"></el-table-column> -->
      <el-table-column prop="type" header-align="center" align="center" width="150" label="消息类型">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.msg_type === 1" size="small" type="success">课程消息</el-tag>
          <el-tag v-else-if="scope.row.msg_type === 2" size="small" type="danger">我关注的</el-tag>
          <el-tag v-else size="small" type="warning">平台通知</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="course_type" header-align="center" align="center" width="150" label="课程消息类型">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.course_type === 1" size="small" type="info">开课通知</el-tag>
          <el-tag v-else size="small" type="success">课程章节更新</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="courseTitle" header-align="center" align="left" width="300" label="消息->课程"></el-table-column>
      <el-table-column prop="realName" header-align="center" align="center" width="130" label="消息->讲师"></el-table-column>
      <el-table-column prop="status" header-align="center" align="center" width="150" label="发布状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0" size="small" type="info">未发布</el-tag>
          <el-tag v-else size="small" type="success">已发布</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="publish_date" header-align="center" align="center" width="200" label="发布日期"></el-table-column>
      <el-table-column prop="info" header-align="center" align="left" label="具体信息" width="350">
        <template slot-scope="scope">
          <el-popover ref="detailPopover" placement="top-start" trigger="hover">
            <span>点击查看详情</span>
          </el-popover>
          <el-button show-overflow-tooltip size="small" type="text" v-popover:detailPopover @click="showDetail(scope.row.info)">{{scope.row.info}}</el-button>
        </template>
      </el-table-column>
      <el-table-column fixed="right" header-align="center" align="left" width="230" label="操作">
        <template slot-scope="scope" porp="status">
          <el-button v-if="isAuth('xry:message:update')" type="primary" size="small" icon="el-icon-edit" circle @click="addOrUpdateHandle(scope.row.id)"></el-button>
          <el-button v-if="isAuth('xry:message:delete')" type="danger" size="small" icon="el-icon-delete" circle @click="deleteHandle(scope.row.id)"></el-button>
          <el-button v-if="isAuth('xry:message:publishMessage')" type="primary" round size="small" @click="publishMessage(scope.row.id)" v-show="scope.row.status ===0">立即发布</el-button>
          <el-button v-if="isAuth('xry:message:cancelPublish')" type="warning" round size="small" @click="cancelPublish(scope.row.id)" v-show="scope.row.status ===1 ">取消发布</el-button>
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
  import SockJS from  'sockjs-client';
  import  Stomp from 'stompjs';
  import { treeDataTranslate } from '@/utils'
  import AddOrUpdate from './message-add-or-update'
  export default {
    data () {
      return {
        dataForm: {
          msg_type: '',
          course_type: '',
          status: 0,
          publish_date:'',
          info:'',
          courseTitle:'',
          realName:'',
          parentName:'',
          teacherName:''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        courseList: [],
        courseListTreeProps: {
          label: 'title',
          children: 'children'
        },
        teacherList: [],
        teacherListTreeProps: {
          label: 'realName',
          children: 'children'
        },
        options: [
          { value: '1', label: '课程消息' }, 
          { value: '2', label: '我关注的' },
          { value: '3', label: '平台通知' }
        ],
        value: '',
        // sockjs的变量
        websocket:''
      }
    },
    components: {
      AddOrUpdate
    },
    activated () {
      this.getDataList()
      this.initWebSocket()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        // 查询所有课程类目，构造成一棵树
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
              url: this.$http.adornUrl('/xry/message/list'),
              method: 'get',
              params: this.$http.adornParams({
                'page': this.pageIndex,
                'limit': this.pageSize,
                'objId': this.dataForm.objId,
                'userId':this.dataForm.userId,
                'type':this.dataForm.msg_type
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
        this.dataForm.objId = data.id
        this.dataForm.parentName = data.title
      },
      // 课程树设置当前选中节点
      courseListTreeSetCurrentNode () {
        this.$refs.courseListTree.setCurrentKey(this.dataForm.objId)
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
      // 发布消息
      publishMessage (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '发布' : '批量发布'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/message/publishMessage'),
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
      // 取消发布消息
      cancelPublish (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '取消发布' : '批量取消发布'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/message/cancelPublish'),
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
      // 消息类型下拉选中事件
      currentSel(selVal){
        this.dataForm.msg_type = selVal;
      },
      // 点击->详情弹出框
      showDetail (detail) {
        this.$alert(detail, '审核详情', {
          confirmButtonText: '确定',
          callback: action => {}
        });
      },
      // WebSocket连接初始化
      initWebSocket() {
        // 测试使用的用户id
        let userId = '1';
        const wsuri = "ws://localhost:9001/xry/messageWebSocket?userId=" + userId;
        this.websock = new WebSocket(wsuri);
        this.websock.onopen = this.websocketOnOpen;
        this.websock.onmessage = this.websocketOnMessage;
        this.websock.onclose = this.websocketClose;
        this.websock.over = this.websocketOver;
      },
      // 
      websocketOnOpen() {
        console.log("-------------连接初始化----------------")    
      },
      //数据发送
      websocketSend(agentData) { 
        this.websock.send(agentData, function(data) { 
          console.log("客户端发送数据:" + data) 
        });
      },
      //数据接收
      websocketOnMessage: function(e) {
        console.log("客户端接收数据：" + e.data); 
        //const redata = JSON.parse(e.data);
        //console.log("客户端接收数据：" + redata);
      },
      // 关闭连接 
      websocketClose() {
        //this.websocket.close();
        console.log("-------------断开连接----------------")
      },
      // 结束连接
      websocketOver(){
        //this.websocket.close();
        console.log("-------------结束连接----------------")
      }
    }
  }
</script>
