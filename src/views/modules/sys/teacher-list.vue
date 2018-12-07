<template>
  <div class="mod-xryuser">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="手机号">
        <el-input v-model="dataForm.phone" placeholder="请填写手机号" clearable></el-input>
      </el-form-item>
       <el-form-item label="讲师姓名">
      <el-input v-model="dataForm.teacherName" placeholder="请填写讲师姓名" clearable></el-input>
      </el-form-item>
      <el-form-item label="用户状态">
          <el-select v-model="dataForm.status" placeholder="请选择用户状态" @change="statusCurrentSel">
            <el-option v-for="item in statusValues" :key="item.statusValue" :label="item.label" :value="item.statusValue"></el-option>
          </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('xry:teacher:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataForm" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50">
      </el-table-column>
      <el-table-column prop="nickname" header-align="center" align="center" label="用户昵称"></el-table-column>
      <el-table-column prop="name" header-align="center" align="center" label="讲师姓名"></el-table-column>
      <el-table-column prop="phone" header-align="center" align="center" label="手机号"></el-table-column>
       <el-table-column prop="organization" header-align="center" align="center" label="所属机构">
       </el-table-column>
      <el-table-column prop="IDnumber" header-align="center" align="center" label="身份证号"></el-table-column>
       <el-table-column prop="certificateImage" header-align="center" align="center" label="资质图片">
       </el-table-column>
      <el-table-column prop="status" header-align="center" align="center" label="用户状态" width="100">
      </el-table-column>
      <el-table-column prop="created" header-align="center" align="center" width="180" label="认证时间"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="300" label="操作" prop="role">
        <template slot-scope="scope">
          <el-button v-if="isAuth('xry:teacher:delete')" type="danger" size="small" icon="el-icon-delete"  @click="deleteHandle(scope.row.id)">删除</el-button>
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
        dataForm:[{
          nickname:'菲菲',
          phone: '18487194104',
          name:'孔子',
          organization:'昆明源力教育',
          IDnumber:'532627199408153529',
          certificateImage:'这里显示讲师身份证照片',
          status: '正常',
          created: '2018-12-07'
        },{
          nickname:'嘿嘿',
          phone: '18587156704',
          name:'孟子',
          organization:'暂无组织机构',
          IDnumber:'532427188408153523',
          certificateImage:'这里显示讲师身份证照片',
          status: '删除',
          created: '2018-11-17'
        }],
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
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
