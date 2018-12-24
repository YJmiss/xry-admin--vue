<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="消息类型" size="mini" prop="msgType">
        <el-radio-group v-model="dataForm.msgType">
          <el-radio :label="1">课程消息</el-radio>
          <el-radio :label="2">我关注的</el-radio>
          <el-radio :label="3">平台通知</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="课程消息" size="mini" prop="courseType" v-show="dataForm.msgType ==1">
        <el-radio-group v-model="dataForm.courseType">
          <el-radio :label="1">开课通知</el-radio>
          <el-radio :label="2">课程章节更新</el-radio>
          <el-radio :label="3">其它</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="选择课程" prop="parentName" v-show="dataForm.msgType ==1"> 
        <el-popover ref="courseListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseList" :props="courseListTreeProps" node-key="id" ref="courseListTree"
            @current-change="courseListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.parentName" v-popover:courseListPopover :readonly="true" placeholder="点击选择所属课程" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="选择讲师" prop="teacherName" v-show="dataForm.msgType ==2">
        <el-popover ref="teacherListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="teacherList" :props="teacherListTreeProps" node-key="id" ref="teacherListTree" @current-change="teacherListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.teacherName" v-popover:teacherListPopover :readonly="true" placeholder="点击选择所属讲师" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="具体消息" prop="info">
        <el-input v-model="dataForm.info" type="textarea" :rows="6"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { treeDataTranslate} from '@/utils'
  export default {
    data () {
      return {
        dataForm: {
          id: 0,
          msgType:1,
          courseType:1,
          parentName: '',
          teacherName:'',
          realName:'',
          status:0,
          info:''
        },
        num: 0,
        successNum: 0,
        fileList: [],
        dataListLoading: false,
        dataListSelections: [],
        visible: false,
        dataRule: {
          info: [{ required: true, message: "请填写具体消息", trigger: "blur" }]
        },
        courseList: [],
        courseListTreeProps: {
          label: 'title',
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
          url: this.$http.adornUrl('/xry/course/treeCourse'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          this.courseList = treeDataTranslate(data.courseList, 'id')
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
            this.$nextTick(() => {
              // 重置form表单（清空form表单的内容）
              this.$refs['dataForm'].resetFields()
            })
          }).then(() => {
            if (this.dataForm.id) {
              this.$http({
                url: this.$http.adornUrl(`/xry/message/info/${this.dataForm.id}`),
                method: 'get',
                params: this.$http.adornParams()
              }).then(({ data }) => {
                if (data && data.code === 0) {
                  this.dataForm.id = data.message.id
                  this.dataForm.msgType = data.message.msgType
                  this.dataForm.courseType = data.message.courseType
                  this.dataForm.objId = data.message.objId
                  this.dataForm.userId = data.message.userId
                  this.dataForm.publishDate = data.message.publishDate
                  this.dataForm.info = data.message.info
                  this.courseListTreeSetCurrentNode()
                  this.teacherListTreeSetCurrentNode()
                }
              })
            } else {
              // 新增
              
            }
          })
        })
      },
      // 课程类目树选中
      courseListTreeCurrentChangeHandle (data, node) {
        this.dataForm.objId = data.id
        this.dataForm.parentName = data.title
      },
      // 课程类目树设置当前选中节点
      courseListTreeSetCurrentNode () {
        this.$refs.courseListTree.setCurrentKey(this.dataForm.objId)
        this.dataForm.parentName = (this.$refs.courseListTree.getCurrentNode() || {})['title']
      },
      // 讲师树选中
      teacherListTreeCurrentChangeHandle (data, node) {
        this.dataForm.userId = data.id
        this.dataForm.teacherName = data.realName
      },
      // 讲师树设置当前选中节点
      teacherListTreeSetCurrentNode () {
        this.$refs.teacherListTree.setCurrentKey(this.dataForm.userId)
        this.dataForm.teacherName = (this.$refs.teacherListTree.getCurrentNode() || {})['realName']
      },
      // 表单提交
      dataFormSubmit () {
        if (this.dataForm.msgType == 1) {
          // 课程校验
          if (!this.validateCourse()&&this.dataForm.parentName) {
            this.dataForm.teacherName = ""
            this.dataForm.userId = ""
            this.dataSubmit() 
          } else {
            this.dataForm.teacherName = ""
            this.dataForm.userId = ""
          }
        } else if (this.dataForm.msgType == 2) {
          // 讲师校验
          if (!this.validateTeacher()&&this.dataForm.teacherName) {
            this.dataForm.parentName = ""
            this.dataForm.objId = ""
            this.dataForm.courseType = ""
            this.dataSubmit() 
          } else {
            this.dataForm.parentName = ""
            this.dataForm.objId = ""
            this.dataForm.courseType = ""
          }
        } else {
          this.dataForm.parentName = ""
          this.dataForm.objId = ""
          this.dataForm.courseType = ""
          this.dataForm.teacherName = ""
          this.dataForm.userId = ""
          this.dataSubmit() 
        }
      },
      dataSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/xry/message/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'msgType': this.dataForm.msgType,
                'courseType': this.dataForm.courseType,
                'objId': this.dataForm.objId,
                'status':this.dataForm.status,
                'userId': this.dataForm.userId,
                'publishDate': this.dataForm.publishDate,
                'info': this.dataForm.info
              })
            }).then(({ data }) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                    this.$emit('refreshDataList')
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      },
      // 校验form表单
      validateCourse () {
        let isPass = false;
        if (!this.dataForm.parentName) {
          this.$confirm(`请选择课程`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            return;
          }).catch(() => {
          });
        } else {
          isPass = true
        }
      },
      // 校验form表单
      validateTeacher () {
        let isPass = false;
        if (!this.dataForm.teacherName) {
          this.$confirm(`请选择讲师`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            return;
          }).catch(() => {
          }); 
        } else {
          isPass = true
        }
      }
    }
  }
</script>

