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
      <el-table-column prop="nickname" header-align="center" align="center" label="昵称" width="100">
      </el-table-column>
      <el-table-column prop="real_name" header-align="center" align="center" label="讲师姓名" width="100"></el-table-column>
      <el-table-column prop="userPhone" header-align="center" align="center" label="手机号" width="120"></el-table-column>
       <el-table-column  header-align="center" align="center" label="所属机构" width="200">
         <template slot-scope="scope" prop="orgName">
         <span v-if="scope.row.orgName">{{scope.row.orgName}}</span>
         <el-tag type="primary" v-else>暂无组织</el-tag>
         </template>
       </el-table-column>
      <el-table-column prop="id_card" header-align="center" align="center" label="身份证号" width="170"></el-table-column>
       <el-table-column  header-align="center" align="center" label="证件照正面" width="150">
         <template slot-scope="scope">
           <el-popover ref="imgPopover" placement="left" trigger="click">
            <img class="big-img" :src="scope.row.id_card_front"/>
          </el-popover>
          <img class="broadcst-img" v-popover:imgPopover :src="scope.row.id_card_front">
         </template>
       </el-table-column>
        <el-table-column  header-align="center" align="center" label="证件照反面" width="150">
          <template slot-scope="scope">
           <el-popover ref="imgPopover" placement="left" trigger="click">
            <img class="big-img" :src="scope.row.id_card_back"/>
          </el-popover>
          <img class="broadcst-img" v-popover:imgPopover :src="scope.row.id_card_back">
          </template>
       </el-table-column>
        <el-table-column prop="brief_intro" header-align="center" align="center" label="讲师简介" max-height='100'>
          <template slot-scope="scope">
          <el-popover ref="introPopover" placement="top-start" trigger="hover">
            <span>点击查看全部简介</span>
          </el-popover>
           <el-button show-overflow-tooltip size="small" type="text" v-popover:introPopover @click="showAllIntro(scope.row.brief_intro)">{{scope.row.brief_intro}}</el-button>
          </template>
       </el-table-column>
      <el-table-column prop="status" header-align="center" align="center" label="认证状态" width="100">
         <template slot-scope="scope">
         <el-tag v-if="scope.row.status === 3" size="small"  type="success" >认证通过</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created" header-align="center" align="center" width="180" label="认证时间"></el-table-column>
       <el-table-column fixed="right" header-align="center" align="center"  label="操作">
         <template slot-scope="scope">
          <el-button v-if="isAuth('xry:teacher:addTeacherInfo')" round icon="el-icon-edit-outline" type="primary" @click="addInfoHandle(scope.row.id)">补充资料</el-button>
         </template>
       </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" 
          :page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <!-- 弹窗，补充讲师资料 -->
    <add-teacher-info v-if="addTeacherInfoVisible" ref="addTeacherInfo" @refreshDataList="getDataList"></add-teacher-info>
  </div>
</template>

<script>
import { treeDataTranslate } from '@/utils'
import addTeacherInfo from './teacher-list-addInfo'
  export default {
    components:{addTeacherInfo},
    data () {
      return {
        addTeacherInfoVisible:false,
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
      value: ''
      }
    },
     activated () {
      this.getDataList()
    }, 
    methods: {
      // 获取数据列表
    getDataList () {
    this.dataListLoading = true
    this.visible = true
    let teacherListStatus = 3;
    this.$http({
      url: this.$http.adornUrl('/xry/teacher/list'),
      method: 'get',
      params: this.$http.adornParams({
        'page': this.pageIndex,
        'limit': this.pageSize,
        'realName':this.dataForm.real_name,
        'userPhone':this.dataForm.userPhone,
        'teacherListStatus':teacherListStatus
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
      //补充讲师资料
      addInfoHandle(id){
      this.addTeacherInfoVisible = true
      this.$nextTick(() => {
      this.$refs.addTeacherInfo.init(id)
      })
      },
      //置为普通用户
      changeRoleHandle(id){
         var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对该用户进行[${id ? '置为普通用户' : '批量置为普通用户'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/user/updateTeacherRoleToUser'),
            method: 'post',
            data: this.$http.adornData(ids, false)
          }).then(({ data }) => {
            if (data && data.code === 0){
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
      //显示全部简介
     showAllIntro(intro){
     this.$alert(intro, '讲师简介', {
          confirmButtonText: '确定',
          callback: action => {}
        });
     },
      // 用户状态下拉选中事件
      statusCurrentSel(selVal){
        this.status = selVal;
      }
    }
  }
</script>
<style scope>
.broadcst-img{width: 50px;height: 50px;}
.broadcst-img:hover{cursor:pointer}
.big-img{height:250px;width:500px;}
</style>
