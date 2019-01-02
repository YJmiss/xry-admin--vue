<template>
  <el-dialog :title="!dataForm.id ? '新增' : '课程详情'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="课程标题" prop="title">
        <span class="info">{{dataForm.title}}</span>
      </el-form-item>
      <el-form-item label="所属类目" prop="parentName"> 
       <el-popover placement="bottom-start" trigger="click">
          <el-tree :data="courseCatList" node-key="id" ref="courseCatListTree" :default-expand-all="true" :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <span class="info">{{dataForm.parentName}}</span>
      </el-form-item>
      <el-form-item label="所属讲师" prop="teacherName">
        <el-popover ref="teacherListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="teacherList" :props="teacherListTreeProps" node-key="id" ref="teacherListTree" @current-change="teacherListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <span class="info">{{dataForm.teacherName}}</span>
      </el-form-item>
      <el-form-item label="是否收费" size="mini" prop="property">
       <span class="info blue">{{dataForm.property}}</span>
      </el-form-item>
      <el-form-item label="课程价格" prop="price" v-show="dataForm.property === 1">
       <span class="info">{{dataForm.price}}元</span>
      </el-form-item>
      <el-form-item label="课程图片" class="Image">
        <img :src="dataForm.image" alt="课程封面图" width="auto" height="auto">
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>

  import $ from 'jquery'
  import { treeDataTranslate } from '@/utils'
  export default {
    data () {
      return {
        visible: false,
        fileList: [],
        dataForm: {
          id: 0,
          title: '',
          image: '',
          cid: 1,
          parentName: '',
          teacherName:'',
          tid: 1,
          property:'',
          status: 1,
          price: 0,
          file: ''
        },
        dataRule: {
          
        },
        courseList:[],
        courseCatList: [],
        courseCatListTreeProps: {
          label: 'name',
          children: 'children'
        },
        teacherList: [],
        teacherListTreeProps: {
          label: 'realName',
          children: 'children'
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        // 查询所有课程类目，构造成一棵树
        this.$http({
          url: this.$http.adornUrl('/xry/course/cat/treeCourseCat'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          this.courseCatList = treeDataTranslate(data.courseCatList, 'id')
        }).then(() => {
          // 查询讲师列表，构造成一棵树
          this.$http({
            url: this.$http.adornUrl('/xry/teacher/treeTeacher'),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            this.teacherList = treeDataTranslate(data.teacherList, 'id')
          }).then(() => { 
            this.visible = true
          }).then(() => {
            if (this.dataForm.id) {
              this.$http({
                url: this.$http.adornUrl(`/xry/course/info/${this.dataForm.id}`),
                method: 'get',
                params: this.$http.adornParams()
              }).then(({ data }) => {
                if (data && data.code === 0) {
                  this.courseList = data.course
                  this.dataForm.id = data.course.id
                  this.dataForm.title = data.course.title
                  this.dataForm.cid = data.course.cid
                  this.dataForm.tid = data.course.tid
                  this.dataForm.price = data.course.price
                  this.dataForm.status = data.course.status
                  this.dataForm.image = data.course.image
                  this.courseCatListTreeSetCurrentNode()
                  this.teacherListTreeSetCurrentNode()
                  if( data.course.property == 1){
                   this.dataForm.property = '收费'
                  }else{
                   this.dataForm.property = '免费'
                  }
                }
              })
            } else{
               this.dataForm.image = ''
            }
          })
        })
      },
      // 课程类目树选中
      courseCatListTreeCurrentChangeHandle (data, node) {
        this.dataForm.cid = data.id
        this.dataForm.parentName = data.name
      },
      // 课程类目树设置当前选中节点
      courseCatListTreeSetCurrentNode () {
        this.$refs.courseCatListTree.setCurrentKey(this.dataForm.cid)
        this.dataForm.parentName = (this.$refs.courseCatListTree.getCurrentNode() || {})['name']
      },
      // 讲师树选中
      teacherListTreeCurrentChangeHandle (data, node) {
        this.dataForm.tid = data.id
        this.dataForm.teacherName = data.realName
      },
      // 讲师树设置当前选中节点
      teacherListTreeSetCurrentNode () {
        this.$refs.teacherListTree.setCurrentKey(this.dataForm.tid)
        this.dataForm.teacherName = (this.$refs.teacherListTree.getCurrentNode() || {})['realName']
      },
      // 表单提交
      dataFormSubmit () {
        this.visible = false
      }
    }
  }
  
</script>
<style>
  .course-price{width:700px}
  .price-tip{display:inline;color:red;padding-left:20px;}
  .info{ font: 16px 微软雅黑  bolder;
    color: #333333;
    margin-left: 10px;
   }
   .blue{
     color: blue;
   }
</style>
