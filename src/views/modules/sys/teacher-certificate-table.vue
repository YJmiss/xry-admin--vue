<template>
    <div id="teacherData">
    <el-table :data="dataForm" border style="width: 100%">
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
      <el-table-column fixed="right" header-align="center" align="center" width="300" label="操作" prop="role">
        <template slot-scope="scope">
          <el-button v-if="isAuth('xry:certificateData:info')" type="default" size="small"  @click="viewDataHandle(scope.row.id)">详情</el-button>
          <el-button v-if="isAuth('xry:certificateData:examine')" type="primary" size="small"  @click="examine(scope.row.id)">审核</el-button>
        </template>
      </el-table-column>
     </el-table>
      <!-- 弹窗, 讲师资料审核记录 -->
    <examine-record-add v-if="examineRecordAddVisible" ref="examineRecordAdd"></examine-record-add>
    </div>
</template>
<script>
 import { treeDataTranslate } from '@/utils'
 import examineRecordAdd from './examine-record-add'
export default {
    components:{examineRecordAdd},
    data(){
   return{
       examineRecordAddVisible:false,
       examineType:3, // 用于区别视频审核和课程审核
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
        }]
        }
    },
    methods:{
    //查看申请资料详情
    viewDataHandle(id){
    },
     // 审核/记录审核
      examine(id) {
       this.examineRecordAddVisible = true
        this.$nextTick(() => {
          this.$refs.examineRecordAdd.init(id,this.examineType)
        })
      }
    }
}
</script>

