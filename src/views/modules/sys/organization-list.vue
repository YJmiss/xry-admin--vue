<template>
  <div class="mod-xryuser">
    <el-form :inline="true" @keyup.enter.native="getDataList()">
       <el-form-item label="机构名称">
       <el-input v-model="dataForm.organizationName" placeholder="请填写机构名称" clearable></el-input>
      </el-form-item>
      <el-form-item label="法人代表">
      <el-input v-model="dataForm.corporateName" placeholder="请填写机构法人姓名" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button v-if="isAuth('xry:organization:list')" type="primary" @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('xry:organization:delete')" type="danger" @click="checkSelection()">删除机构</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50">
      </el-table-column>
       <el-table-column prop="nickname" header-align="center" align="center" label="账号/昵称" width="180">
        <template slot-scope="scope">
        <span>{{scope.row.nickname}}</span> &nbsp;/&nbsp; <span>{{scope.row.phone}}</span>
        </template> 
       </el-table-column>
       <el-table-column prop="org_name" header-align="center" align="center" label="机构名称" width="200">
       </el-table-column>
      <el-table-column prop="contact" header-align="center" align="center" label="联系方式" width="120"></el-table-column>
      <el-table-column prop="org_code" header-align="center" align="center" label="机构代码" width="200px"></el-table-column>
       <el-table-column prop="business_license" header-align="center" align="center" label="营业执照">
       </el-table-column>
      <el-table-column prop="corporator" header-align="center" align="center" label="法人姓名">
       </el-table-column>
        <el-table-column prop="id_card" header-align="center" align="center" label="法人证件号" width="180px">
       </el-table-column>
      <el-table-column prop="status" header-align="center" align="center" label="认证状态" width="100px">
       <template slot-scope="scope">
       <el-tag v-if="scope.row.status === 3" size="small" type="success">已认证通过</el-tag>
       </template>
      </el-table-column>
      <el-table-column prop="created" header-align="center" align="center" width="180" label="认证时间"></el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" 
          :page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
  </div>
</template>

<script>
import { treeDataTranslate } from '@/utils'
  export default {
    data () {
      return {
        dataForm:[{
        nickname:'',
          phone:'',
          org_code: '',
          org_name:'',
          corporator:'',
          id_card:'',
          contact:'',
          business_license:'',
          status:3,
          created: ''
        }],
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: []
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
          url: this.$http.adornUrl('/xry/organization/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'corporateName':this.dataForm.corporateName,
            'organizationName':this.dataForm.organizationName
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
        this.$confirm(`确定对该用户进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/organization/delete'),
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
      }
    }
  }
</script>
