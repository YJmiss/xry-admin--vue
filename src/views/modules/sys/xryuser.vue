<template>
  <div class="mod-xryuser">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="手机号">
        <el-input v-model="dataForm.phone" placeholder="请填写手机号" clearable></el-input>
      </el-form-item>
       <el-form-item label="用户角色">
         <el-select v-model="dataForm.role" placeholder="请选择用户角色" @change="roleCurrentSel">
            <el-option v-for="item in roleValues" :key="item.roleValue" :label="item.label" :value="item.roleValue"></el-option>
          </el-select>
      </el-form-item>
      <el-form-item label="用户状态">
          <el-select v-model="dataForm.status" placeholder="请选择用户状态" @change="statusCurrentSel">
            <el-option v-for="item in statusValues" :key="item.statusValue" :label="item.label" :value="item.statusValue"></el-option>
          </el-select>
      </el-form-item>
      <el-form-item label="第三方登录来源">
          <el-select v-model="dataForm.socialSource" placeholder="请选择第三方登录来源" @change="socialSourceCurrentSel">
            <el-option v-for="item in socialSourceValues" :key="item.socialSourceValue" :label="item.label" :value="item.socialSourceValue"></el-option>
          </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('xry:user:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50">
      </el-table-column>
      <el-table-column prop="phone" header-align="center" align="center" label="注册手机号"></el-table-column>
      <el-table-column prop="email" header-align="center" align="center" label="注册邮箱"></el-table-column>
      <el-table-column prop="status" header-align="center" align="center" label="用户状态" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0" size="small" type="success">正常</el-tag>
          <el-tag v-else-if="scope.row.status === 1" size="small" type="danger">异常</el-tag>
          <el-tag v-else-if="scope.row.status === 2" size="small" type="warning">删除</el-tag>
          <el-tag v-else size="small" type="success">正常</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="role" header-align="center" align="center" label="角色">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.role === 0" size="small" type="success">普通用户</el-tag>
          <el-tag v-else-if="scope.row.role === 1" size="small" type="info">讲师</el-tag>
          <el-tag v-else size="small" type="success">普通用户</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="socialSource" header-align="center" align="center" label="第三方登录来源">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.socialSource === 0" size="small" type="warning">手机号</el-tag>
          <el-tag v-else-if="scope.row.socialSource === 1" size="small" type="danger">微信</el-tag>
          <el-tag v-else-if="scope.row.socialSource === 2" size="small" type="success">QQ</el-tag>
          <el-tag v-else-if="scope.row.socialSource === 3" size="small" type="warning">支付宝</el-tag>
          <el-tag v-else size="small" type="warning">手机号</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="openuserId" header-align="center" align="center" label="第三方登录用户主键"></el-table-column>
      <el-table-column prop="created" header-align="center" align="center" width="180" label="注册时间"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="300" label="操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('xry:user:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
          <el-button v-if="isAuth('xry:user:delete')" type="text" v-show="dataForm.role == 0" size="small" @click="deleteHandle(scope.row.id)">讲师</el-button>
          <el-button v-if="isAuth('xry:user:delete')" type="text" v-show="dataForm.role == 1" size="small" @click="deleteHandle(scope.row.id)">普通用户</el-button>
          <el-button v-if="isAuth('xry:user:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">重置登录密码</el-button>
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
          status: '',
          role: '',
          socialSource: '',
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
        statusValue: '',
        statusValues: [
          { value: '0', label: '正常' }, 
          { value: '1', label: '异常' }, 
          { value: '2', label: '删除' }
        ],
        socialSourceValue: '',
        socialSourceValues: [
          { value: '0', label: '手机号' }, 
          { value: '1', label: '微信' }, 
          { value: '2', label: 'QQ' },
          { value: '2', label: '支付宝' }
        ],
        roleValue: '',
        roleValues: [
          { value: '0', label: '普通用户' }, 
          { value: '1', label: '讲师' } 
        ]
      }
    },
    components: {
      
    },
    activated () {
      this.getDataList()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/xry/user/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'phone': this.phone,
            'status': this.status,
            'role': this.role,
            'socialSource': this.socialSource
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
        this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
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
      // 用户状态下拉选中事件
      statusCurrentSel(selVal){
        this.status = selVal;
      },
      // 用户角色下拉选中事件
      roleCurrentSel(selVal){
        this.role = selVal;
      },
      // 第三方登录来源下拉选中事件
      socialSourceCurrentSel(selVal){
        this.socialSource = selVal;
      }
    }
  }
</script>
