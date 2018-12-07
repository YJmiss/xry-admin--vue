<template>
  <div class="mod-xryuser">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="手机号">
        <el-input v-model="dataForm.phone" placeholder="请填写手机号" clearable></el-input>
      </el-form-item>
      <el-form-item label="第三方登录来源">
          <el-select v-model="dataForm.social_source" placeholder="请选择第三方登录来源" @change="socialSourceCurrentSel">
            <el-option v-for="item in socialSourceValues" :key="item.socialSourceValue" :label="item.label" :value="item.socialSourceValue"></el-option>
          </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50">
      </el-table-column>
      <el-table-column prop="phone" header-align="center" align="center" label="注册手机号"></el-table-column>
      <el-table-column prop="email" header-align="center" align="center" label="邮箱"></el-table-column>
      <el-table-column prop="social_source" header-align="center" align="center" label="第三方登录来源">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.social_source === 0" size="small" type="warning">手机号</el-tag>
          <el-tag v-else-if="scope.row.social_source === 1" size="small" type="danger">微信</el-tag>
          <el-tag v-else-if="scope.row.social_source === 2" size="small" type="success">QQ</el-tag>
          <el-tag v-else-if="scope.row.social_source === 3" size="small" type="warning">支付宝</el-tag>
          <el-tag v-else size="small" type="warning">手机号</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="recommend" header-align="center" align="center" label="是否推荐">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.recommend === 0" size="small" type="warning">未推荐</el-tag>
          <el-tag v-else size="small" type="danger">已推荐</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="300" label="操作" prop="role">
        <template slot-scope="scope">
          <el-button v-if="isAuth('xry:user:recommendUser')" type="primary" round size="small" @click="recommendUser(scope.row.id)" v-show="scope.row.recommend == 0">推荐讲师</el-button>
          <el-button v-if="isAuth('xry:user:cancelRecommend')" type="success" round size="small" @click="cancelRecommend(scope.row.id)" v-show="scope.row.recommend == 1">取消推荐</el-button>
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
          phone: '',
          email: '',
          role: '',
          social_source: '',
          openuserId: '',
          created: ''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        socialSourceValue: '',
        socialSourceValues: [
          { socialSourceValue: '0', label: '手机号' }, 
          { socialSourceValue: '1', label: '微信' }, 
          { socialSourceValue: '2', label: 'QQ' },
          { socialSourceValue: '3', label: '支付宝' }
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
        // 标识符
        let flag = 1;
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/xry/user/list'),
          method: 'get',
          params: this.$http.adornParams({
            'flag':flag,
            'page': this.pageIndex,
            'limit': this.pageSize,
            'phone': this.dataForm.phone,
            'recommend': this.dataForm.recommend,
            'socialSource': this.dataForm.social_source
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
            url: this.$http.adornUrl('/xry/user/delete'),
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
      recommendUser (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定要[${id ? '推荐讲师' : '批量推荐讲师'}]吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/user/recommendUser'),
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
            url: this.$http.adornUrl('/xry/user/cancelRecommend'),
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
