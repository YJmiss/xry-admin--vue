<template>
  <div class="mod-course">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="被审核对象类型">
        <el-select v-model="dataForm.examineType" placeholder="请选择被审核对象类型" @change="currentSel">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="被审核对象标题">
        <el-input v-model="dataForm.examineTitle" placeholder="请填写被审核对象标题" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('xry:course:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50">
      </el-table-column>
      <el-table-column prop="id" header-align="center" align="center" width="80" label="ID"></el-table-column>
      <el-table-column prop="type" header-align="center" align="center" label="被审核对象类型" width="160">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.type === 1" size="small" type="success">课程审核</el-tag>
          <el-tag v-else size="small" type="warning">视频审核</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="type" header-align="center" align="center" label="被审核对象标题" width="300">
        <template slot-scope="scope">                   
          <p v-if="scope.row.type===1">{{scope.row.courseTitle}}</p>
          <p v-else="scope.row.type===2">{{scope.row.videoTitle}}</p>                    
        </template>
      </el-table-column>
      <el-table-column prop="username" header-align="center" align="center" label="审核人" width="160"></el-table-column>
      <el-table-column prop="detail" header-align="center" align="center" label="审核详情" width="300">
        <template slot-scope="scope">
          <el-popover ref="detailPopover" placement="top-start" trigger="hover">
            <span>点击查看详情</span>
          </el-popover>
          <el-button class="examin-detail" show-overflow-tooltip size="small" type="text" v-popover:detailPopover @click="showDetail(scope.row.detail)">{{scope.row.detail}}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="action_number" header-align="center" align="center" label="执行动作" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.action_number === 3" size="small" type="success">通过</el-tag>
          <el-tag v-else size="small" type="warning">驳回</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created" header-align="center" align="center" width="180" label="创建时间"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center"  label="操作">
        <template slot-scope="scope">
          <el-button type="primary" v-if="isAuth('xry:course:detail')" circle size="small" icon="el-icon-info" v-show="scope.row.type === 1" @click="viewDetail(scope.row.courseId)"></el-button>
          <el-button type="primary" v-if="isAuth('xry:vedio:play')" circle icon="el-icon-caret-right"  size="small" v-show="scope.row.type === 2" @click="videoPlay(scope.row.videoId)"></el-button>
          <el-button type="danger" v-if="isAuth('xry:course:delete')" circle  size="small" icon="el-icon-delete" @click="deleteHandle(scope.row.id)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" 
          :page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <!-- 弹窗, 播放视频内容 -->
    <video-play v-if="videoPlayVisible" ref="videoPlay" @refreshDataList="getDataList"></video-play>
     <!-- 弹窗, 查看详情（审核内容） -->
    <course-detail v-if="courseDetailVisible" ref="courseDetail" @refreshDataList="getDataList"></course-detail>
  </div>
</template>

<script>
  import { treeDataTranslate } from '@/utils'
  import courseDetail from './course-examine-detail'
  import videoPlay from './video-play'
  export default {
  components: {videoPlay,courseDetail},
    data () {
      return {
        dataForm: {
          parentName: '',
          recordId: '',
          userId: '',
          type: 0,
          actionNumber: 3,
          created:'',
          examineType:'',
          examineTitle:'',
          courseTitle: '',
          username: '',
          videoTitle:'',
          courseId:'',
          videoId:'',
          detail:''
        },
        videoPlayVisible: false,
        courseDetailVisible: false,
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        options: [
          { value: '1', label: '课程审核' }, 
          { value: '2', label: '视频审核' }
        ],
        value: ''
      }
    },
    activated () {
      this.getDataList()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/xry/record/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'examineTitle': this.dataForm.examineTitle,
            'examineType':this.examineType
          })
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.dataList = data.page.list
            this.totalPage = data.page.totalCount
            console.log(data.page.list)
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
        // 播放视频
      videoPlay (id) {
        this.videoPlayVisible = true
        this.$nextTick(() => {
          this.$refs.videoPlay.init(id)
        })
      },
       // 查看课程详情 
      viewDetail (id) {
        this.courseDetailVisible = true
        this.$nextTick(() => {
          this.$refs.courseDetail.init(id)
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
            url: this.$http.adornUrl('/xry/record/delete'),
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
      // 点击->审核详情弹出框
      showDetail (detail) {
        this.$alert(detail, '审核详情', {
          confirmButtonText: '确定',
          callback: action => {}
        });
      },
      // 审核类型下拉选中事件
      currentSel(selVal){
        this.examineType = selVal;
      }
    }
  }
</script>
<style>
  .examin-detail:hover{cursor:pointer }
  .examin-detail{float:left}
</style>