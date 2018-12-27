<template>
  <div>
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="真实名字">
        <el-input v-model="dataForm.realName" placeholder="请填写真实名字" clearable></el-input>
      </el-form-item>
      <el-form-item label="推荐状态">
          <el-select v-model="dataForm.recommend" placeholder="请选择状态" @change="socialSourceCurrentSel">
            <el-option v-for="item in recommendValues" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
      <el-table-column header-align="center" align="center" label="认证账号" width="200">
        <template slot-scope="scope">
          <span size="small" type="warning">{{scope.row.nickname}}</span>&nbsp;/&nbsp;
          <span size="small" type="success">{{scope.row.userPhone}}</span>
        </template>  
      </el-table-column>
      <el-table-column prop="real_name" header-align="center" align="center" label="真实名字" width="150"></el-table-column>
      <el-table-column prop="id_card" header-align="center" align="center" label="身份证号" width="200"></el-table-column>
      <el-table-column prop="status" header-align="center" align="center" label="状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 1" size="small" type="warning">认证中</el-tag>
          <el-tag v-else-if="scope.row.status === 2" size="small" type="danger">未通过</el-tag>
          <el-tag v-else size="small" type="success">已通过</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="type" header-align="center" align="center" label="类型" width="120">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.type === 1" size="small" type="primary">讲师认证</el-tag>
          <el-tag v-else size="small" type="success">机构认证</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orgName" header-align="center" align="center" label="所属机构名称" width="200">
        <template slot-scope="scope">
         <p v-if="scope.row.orgName">{{scope.row.orgName}}</p>
         <el-tag v-else type="warning">暂无组织</el-tag> 
        </template>
      </el-table-column>
      <el-table-column prop="recommend" header-align="center" align="center" label="是否推荐" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.recommend === 0" size="small" type="info">未推荐</el-tag>
          <el-tag v-else-if="scope.row.recommend === 1" size="small" type="success">已推荐</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created" header-align="center" align="center" label="创建时间" width="200"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="300" label="操作" prop="role">
        <template slot-scope="scope">
          <el-button v-if="isAuth('xry:teacher:recommendTeacher')" type="primary" round size="small" @click="recommendTeacher(scope.row.id)" :disabled="scope.row.recommend === 1">推荐讲师</el-button>
          <el-button v-if="isAuth('xry:teacher:cancelRecommend')" type="success" round size="small" @click="cancelRecommend(scope.row.id)" :disabled="scope.row.recommend === 0">取消推荐</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" 
          :page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        dataForm: {
          real_name: '',
          nickname:'',
          userPhone:'',
          id_card:'',
          orgName: '',
          orgCode: '',
          status: 0,
          created: '',
          recommend:''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        value: '',
        recommendValues: [
          { value: '0', label: '未推荐' }, 
          { value: '1', label: '已推荐' },
        ]
      }
    },
    components: {},
    activated () {
      this.getDataList()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        let status = 3;
        this.$http({
          url: this.$http.adornUrl('/xry/teacher/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'realName': this.dataForm.realName,
            'recommend': this.dataForm.recommend,
            'status':status
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
            url: this.$http.adornUrl('/xry/teacher/delete'),
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
      // 讲师推荐
      recommendTeacher (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定要[${id ? '推荐讲师' : '批量推荐讲师'}]吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/teacher/recommendTeacher'),
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
      // 取消推荐
      cancelRecommend (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定要[${id ? '取消推荐' : '批量取消推荐'}]吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/teacher/cancelRecommend'),
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
      socialSourceCurrentSel(selVal){
        this.recommend = selVal;
      }
    }
  }
</script>
