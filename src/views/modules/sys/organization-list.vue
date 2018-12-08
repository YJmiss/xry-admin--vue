<template>
  <div class="mod-xryuser">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="机构代码">
        <el-input v-model="dataForm.Organ_number" placeholder="请填写机构代码" clearable></el-input>
      </el-form-item>
       <el-form-item label="机构名称">
      <el-input v-model="dataForm.organizationName" placeholder="请填写机构名称" clearable></el-input>
      </el-form-item>
      <el-form-item label="法人代表">
      <el-input v-model="dataForm.corporateName" placeholder="请填写机构法人姓名" clearable></el-input>
      </el-form-item>
      <el-form-item label="用户状态">
          <el-select v-model="value" placeholder="请选择用户状态" @change="statusCurrentSel">
          <el-option v-for="item in statusValues" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
      </el-form-item>
      <el-form-item>
        <el-button v-if="isAuth('xry:organization:list')" type="primary" @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('xry:organization:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataForm" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50">
      </el-table-column>
       <el-table-column prop="nickname" header-align="center" align="center" label="账号/昵称">
       </el-table-column>
       <el-table-column prop="organizationName" header-align="center" align="center" label="机构名称">
       </el-table-column>
      <el-table-column prop="contactInfo" header-align="center" align="center" label="联系方式"></el-table-column>
      <el-table-column prop="Organ_number" header-align="center" align="center" label="机构代码" width="200px"></el-table-column>
       <el-table-column prop="certificateImage" header-align="center" align="center" label="资质图片">
       </el-table-column>
      <el-table-column prop="corporateName" header-align="center" align="center" label="法人姓名">
       </el-table-column>
        <el-table-column prop="corporateIDnumber" header-align="center" align="center" label="法人证件号" width="180px">
       </el-table-column>
      <el-table-column prop="status" header-align="center" align="center" label="用户状态" width="80px">
      </el-table-column>
      <el-table-column prop="created" header-align="center" align="center" width="180" label="认证时间"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="300" label="操作" >
        <template slot-scope="scope">
          <el-button v-if="isAuth('xry:organization:delete')" type="danger" size="small" icon="el-icon-delete"  @click="deleteHandle(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
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
          nickname:'神奇的摄影',
         contactInfo: '18487194104',
          organizationName:'非凡摄影',
         Organ_number:'64536940094903ggfg324',
          certificateImage:'这里显示营业执照图片',
          corporateName:'王五',
          corporateIDnumber:'2345534580324243',
          status: '正常',
          created: '2018-12-07'
        },{
          nickname:'叨叨',
          contactInfo: '1836659907@qq.com',
          organizationName:'柠檬心理',
          Organ_number:'64536940094903ggfg324',
          certificateImage:'这里显示营业执照图片',
          corporateName:'岳晓东',
          corporateIDnumber:'78534234324243',
          status: '删除',
          created: '2018-12-07'
        }],
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        statusValues:[
         { label:'正常',
          value:'1'
          },
          {
        label:'删除',
          value:'2'
          }],
          value:''
      }
    },
    components: {},
    /* activated () {
      this.getDataList()
    }, */
    methods: {
      // 获取数据列表
    getDataList () {
       
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
     
      // 用户状态下拉选中事件
      statusCurrentSel(selVal){
        this.status = selVal;
      }
    }
  }
</script>
