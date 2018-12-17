<template>
  <div>
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="真实名字">
        <el-input v-model="dataForm.realName" placeholder="请填写真实名字" clearable></el-input>
      </el-form-item>
      <el-form-item label="状态">
          <el-select v-model="dataForm.status" placeholder="请选择状态" @change="socialSourceCurrentSel">
            <el-option v-for="item in statusValues" :key="item.statusValue" :label="item.label" :value="item.statusValue"></el-option>
          </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
      <el-table-column header-align="center" align="center" label="认证账号" width="300">
        <template slot-scope="scope">
          <el-tag size="small" type="warning">{{scope.row.nickname}}</el-tag>
          <el-tag size="small" type="success">{{scope.row.userPhone}}</el-tag>
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
      <el-table-column prop="type" header-align="center" align="center" label="类型" width="160">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.type === 1" size="small" type="warning">个人认证</el-tag>
          <el-tag v-else size="small" type="success">机构认证</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orgName" header-align="center" align="left" label="所属机构（机构名字）" width="300"></el-table-column>
      <el-table-column prop="orgCode" header-align="center" align="center" label="所属机构（结构代码）" width="300"></el-table-column>
      <el-table-column prop="recommend" header-align="center" align="center" label="是否推荐" width="150">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.recommend === 0" size="small" type="warning">未推荐</el-tag>
          <el-tag v-else size="small" type="success">已推荐</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created" header-align="center" align="center" label="创建时间" width="200"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="300" label="操作" prop="role">
        <template slot-scope="scope">
          <el-button v-if="isAuth('xry:teacher:recommendTeacher')" type="primary" round size="small" @click="recommendTeacher(scope.row.id)" v-show="scope.row.recommend == 0">推荐讲师</el-button>
          <el-button v-if="isAuth('xry:teacher:cancelRecommend')" type="success" round size="small" @click="cancelRecommend(scope.row.id)" v-show="scope.row.recommend == 1">取消推荐</el-button>
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
          status: '',
          created: ''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        statusValue: '',
        statusValues: [
          { statusValue: '1', label: '认证中' }, 
          { statusValue: '2', label: '未通过' },
          { statusValue: '3', label: '已通过' }
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
        this.$http({
          url: this.$http.adornUrl('/xry/teacher/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'realName': this.dataForm.real_name,
            'status': this.dataForm.status
          })
        }).then(({ data }) => {
          if (data && data.code === 0) {
            console.log(data)
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
      // 第三方登录来源下拉选中事件
      socialSourceCurrentSel(selVal){
        this.social_source = selVal;
      }
    }
  }
</script>
