<template>
  <div class="mod-xryuser">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">

      <el-form-item label="手机号">
      <el-input v-model="dataForm.userPhone" placeholder="请填写手机号" clearable></el-input>
      </el-form-item>
       <el-form-item label="讲师姓名">
      <el-input v-model="dataForm.real_name" placeholder="请填写讲师姓名" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button v-if="isAuth('xry:teacher:list')" type="primary" @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('xry:teacher:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">删除&nbsp; /&nbsp;批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50">
      </el-table-column>
      <el-table-column prop="nickname" header-align="center" align="center" label="昵称" width="180">
      </el-table-column>
      <el-table-column prop="real_name" header-align="center" align="center" label="讲师姓名"></el-table-column>
      <el-table-column prop="userPhone" header-align="center" align="center" label="手机号"></el-table-column>
       <el-table-column prop="orgName" header-align="center" align="center" label="所属机构" width="200">
       </el-table-column>
      <el-table-column prop="id_card" header-align="center" align="center" label="身份证号"></el-table-column>
       <el-table-column prop="id_card_front" header-align="center" align="center" label="证件照正面">
           <img :src="dataForm.id_card_front">
       </el-table-column>
        <el-table-column prop="id_card_back" header-align="center" align="center" label="证件照反面">
        <img :src="dataForm.id_card_back">
       </el-table-column>
      <el-table-column prop="status" header-align="center" align="center" label="认证状态" width="100">
         <template slot-scope="scope">
         <el-tag v-if="scope.row.status === 3" size="small"  type="success" >认证通过</el-tag>
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
        dataForm:{
        nickname:'',
        userPhone:'',
        real_name:'',
        orgName:'',
        id_card:'',
        id_card_front:'',
        id_card_back:'',
        type:'',
        status:3,
        created: ''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        options: [ 
        { label:'正常', value:'1' },
        { label:'删除', value:'2' },
      ],
      value: '',
      teacherList: [],
        teacherListTreeProps: {
          label: 'nickname',
          children: 'children'
        }
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
    this.visible = true
    this.$http({
      url: this.$http.adornUrl('/xry/teacher/list'),
      method: 'get',
      params: this.$http.adornParams({
        'page': this.pageIndex,
        'limit': this.pageSize,
        'realName':this.dataForm.real_name,
        'userPhone':this.dataForm.userPhone,
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
     
      // 用户状态下拉选中事件
      statusCurrentSel(selVal){
        this.status = selVal;
      }
    }
  }
</script>
