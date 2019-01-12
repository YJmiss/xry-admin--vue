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
          <el-select v-model="dataForm.social_source" placeholder="请选择第三方登录来源" @change="socialSourceCurrentSel">
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
      <el-table-column prop="email" header-align="center" align="center" label="用户邮箱"></el-table-column>
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
          <el-tag v-if="scope.row.role === 0" size="small" type="info">普通用户</el-tag>
          <el-tag v-else-if="scope.row.role === 1" size="small" type="success">讲师</el-tag>
          <el-tag v-else-if="scope.row.role === 2" size="small" type="success">机构</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="social_source" header-align="center" align="center" label="第三方登录来源">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.social_source === 0" size="small" type="warning">手机号</el-tag>
          <el-tag v-else-if="scope.row.social_source === 1" size="small" type="danger">微信</el-tag>
          <el-tag v-else-if="scope.row.social_source === 2" size="small" type="success">QQ</el-tag>
          <el-tag v-else-if="scope.row.social_source === 3" size="small" type="warning">支付宝</el-tag>
          <el-tag v-else size="small" type="warning">手机号</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="openuserId" header-align="center" align="center" label="第三方登录用户主键"></el-table-column>
      <el-table-column prop="created" header-align="center" align="center" width="180" label="注册时间"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="left" width="300" label="操作" prop="role">
        <template slot-scope="scope">
          <el-button v-if="isAuth('xry:user:delete')"  type="danger" size="small" round icon="el-icon-delete" :disabled="scope.row.status === 2"  @click="deleteHandle(scope.row.id,scope.row.role)">删除</el-button>
          <el-button v-if="isAuth('xry:user:updateUserRoleToTeacher')" v-show="scope.row.role === 0" type="primary" size="small" round  @click="changeRoleHandle(scope.row.id)">置为讲师</el-button>
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
        statusValue: '',
        statusValues: [
          { statusValue: '0', label: '正常' }, 
          { statusValue: '1', label: '异常' }, 
          { statusValue: '2', label: '删除' }
        ],
        socialSourceValue: '',
        socialSourceValues: [
          { socialSourceValue: '0', label: '手机号' }, 
          { socialSourceValue: '1', label: '微信' }, 
          { socialSourceValue: '2', label: 'QQ' },
          { socialSourceValue: '3', label: '支付宝' }
        ],
        roleValue: '',
        roleValues: [
          { roleValue: '0', label: '普通用户'}, 
          { roleValue: '1', label: '讲师' },
          { roleValue: '2', label: '机构' } 
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
          url: this.$http.adornUrl('/xry/user/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'phone': this.dataForm.phone,
            'role': this.dataForm.role,
            'status': this.dataForm.status,
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
      //置为讲师
      changeRoleHandle(id){
         var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
         this.$confirm(`确定对该用户进行[${id ? '置为讲师' : '批量置为讲师'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/user/updateUserRoleToTeacher'),
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
      // 删除前处理
      deleteHandle (id,role) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
       var roles = role? [ role]:this.dataListSelections.map(item => {
          return item.role
        })
       for(let r=0;r<roles.length;r++){
        if(1== roles[r] || role){
          this.$confirm(`“讲师”用户，在这里不能删除！`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                return;
            }).catch(() => {}); 
        }else{
         this.confirmDelete(id,ids) 
        }
       }
      },
      //确认删除
      confirmDelete(id,ids){
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
        this.social_source = selVal;
      }
    }
  }
</script>
