<template>
    <div id="teacherData">
    <el-form :inline="true" v-model="dataForm" @keyup.enter.native="getDataList()">
     <el-form-item label="讲师姓名" prop="name">
      <el-input v-model="dataForm.name" placeholder="讲师姓名" clearable></el-input>
    </el-form-item>
     <el-form-item label="所属机构" prop="organization">
     <el-popover ref="organizationListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="organizationList" :props="organizationListTreeProps" node-key="organizationId" ref="organizationListTree"
            @current-change="organizationListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.organization" v-popover:organizationListPopover :readonly="true" placeholder="点击选择所属机构" class="cat-list__input"></el-input>
    </el-form-item>
    <el-form-item label="审核状态" prop="organization">
     <el-select v-model="value" placeholder="请选择">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
    </el-select>
    </el-form-item>
    <el-form-item>
        <el-button v-if="isAuth('xry:certificateDataExamine:list')" type="primary" @click="getDataList()">查询</el-button>
        </el-form-item>
    </el-form>
    <el-table :data="dataForm" v-loading="dataListLoading" @selection-change="selectionChangeHandle" border style="width: 100%">
     <el-table-column type="selection" header-align="center" align="center" width="50">
      </el-table-column>
      <el-table-column prop="nickname" header-align="center" align="center" label="账号/昵称"></el-table-column>
      <el-table-column prop="name" header-align="center" align="center" label="讲师姓名"></el-table-column>
       <el-table-column prop="organization" header-align="center" align="center" label="所属机构">
       </el-table-column>
      <el-table-column prop="IDnumber" header-align="center" align="center" label="身份证号"></el-table-column>
       <el-table-column prop="certificateImage" header-align="center" align="center" label="资质图片">
       </el-table-column>
      <el-table-column prop="status" header-align="center" align="center" label="审核状态" width="100">
      </el-table-column>
      <el-table-column prop="created" header-align="center" align="center" width="180" label="申请时间"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="300" label="操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('xry:certificateData:info')" type="default" size="small"  @click="viewDataHandle(scope.row.id)">详情</el-button>
          <el-button v-if="isAuth('xry:certificateData:examine')" type="primary" size="small"  @click="examine(scope.row.id)">审核</el-button>
        </template>
      </el-table-column>
     </el-table>
      <!-- 弹窗, 讲师认证资料审核并记录 -->
    <examine-record-add v-show="examineRecordAddVisible" ref="examineRecordAdd"></examine-record-add>
    <!-- 弹窗，讲师认证资料详情查看 -->
    <teacher-certificate-info v-show="infoVisible" ref="TeacherCertificateInfo"></teacher-certificate-info>
    </div>
</template>
<script>
 import { treeDataTranslate } from '@/utils'
 import examineRecordAdd from './examine-record-add'
 import TeacherCertificateInfo from './teacher-certificate-info'
export default {
    components:{examineRecordAdd,TeacherCertificateInfo},
    data(){
   return{
       examineRecordAddVisible:false,
        infoVisible:false,
        examineType:3, // 用于区别审核类型
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        dataForm:[{
          nickname:'菲菲',
          name:'孔子',
          organization:'昆明源力教育',
          IDnumber:'532627199408153529',
          certificateImage:'这里显示讲师身份证照片',
          status: '未审核',
          created: '2018-12-07'
        },{
          nickname:'嘿嘿',
          name:'孟子',
          organization:'暂无组织机构',
          IDnumber:'532427188408153523',
          certificateImage:'这里显示讲师身份证照片',
          status: '审核通过',
          created: '2018-11-17'
        },{
          nickname:'呵呵',
          name:'庄子',
          organization:'暂无组织机构',
          IDnumber:'532427188408153454',
          certificateImage:'这里显示讲师身份证照片',
          status: '审核驳回',
          created: '2018-11-17'
        }],
         organizationList: [],
         organizationListTreeProps: {
          label: 'organization',
          children: 'children'
        },
        options: [{
          value: '1',
          label: '未审核'
        },{
          value: '2',
          label: '审核中'
        }, {
          value: '3',
          label: '审核通过'
        }, {
          value: '4',
          label: '申请驳回'
        }],
        value: ''
        }
    },
    /* activated () {
      this.getDataList()
    }, */
    methods:{
    //查看申请资料详情
    viewDataHandle(id){
    this.infoVisible=true
    this.$nextTick(() => {
    this.$refs.TeacherCertificateInfo.init(id)
    })
    },
     // 审核/记录审核
      examine(id) {
       this.examineRecordAddVisible = true
        this.$nextTick(() => {
        this.$refs.examineRecordAdd.init(id,this.examineType)
        })
      },
    //获取数据
  getDataList(){
   this.dataListLoading = true
    // 查找是否有所属机构
        this.$http({
          url: this.$http.adornUrl('/xry/organization/list'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          this.organizationList = treeDataTranslate(data.organizationList, 'id')
        }).then(() => {
            this.visible = true
            this.$http({
              url: this.$http.adornUrl('/xry/teacher/list'),
              method: 'get',
              params: this.$http.adornParams({
                'page': this.pageIndex,
                'limit': this.pageSize,
                'organizationId':this.dataForm.organizationId,
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
          })
  },
   // 选中
      organizationListTreeCurrentChangeHandle (data, node) {
        this.dataForm.organizationId = data.id
        this.dataForm.organization = data.organization
      },
      // 设置当前选中节点
      organizationListTreeSetCurrentNode () {
        this.$refs.organizationListTree.setCurrentKey(this.dataForm.organizationId)
        this.dataForm.organization = (this.$refs.organizationListTree.getCurrentNode() || {})['organization']
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
    }
}
</script>
<style scoped>
.el-form-item{
margin-right:30px;
}
</style>

