<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="消息类型" size="mini" prop="type">
        <el-radio-group v-model="dataForm.type">
          <el-radio :label="1">课程消息</el-radio>
          <el-radio :label="2">我关注的</el-radio>
          <el-radio :label="3">平台通知</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="课程消息" size="mini" prop="courseType">
        <el-radio-group v-model="dataForm.courseType">
          <el-radio :label="1">开课通知</el-radio>
          <el-radio :label="2">课程章节更新</el-radio>
          <el-radio :label="3">其它</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="选择课程" prop="parentName"> 
        <el-popover ref="courseListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseList" :props="courseListTreeProps" node-key="id" ref="courseListTree"
            @current-change="courseListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.parentName" v-popover:courseListPopover :readonly="true" placeholder="点击选择课程类目" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="选择讲师" prop="teacherName">
        <el-popover ref="teacherListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="teacherList" :props="teacherListTreeProps" node-key="id" ref="teacherListTree" @current-change="teacherListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.teacherName" v-popover:teacherListPopover :readonly="true" placeholder="点击选择所属讲师" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="具体消息" prop="info">
        <el-input v-model="dataForm.info" type="textarea"></el-input>
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
          type:1,
          courseType:1,
          parentName: '',
          teacherName:'',
          nickname:'',
        },
        num: 0,
        successNum: 0,
        fileList: [],
        dataListLoading: false,
        dataListSelections: [],
        visible: false,
        dataRule: {
          title: [{ required: true, message: '请填写课程标题', trigger: 'blur' }],
          parentName: [{ required: true, message: '上级类目不能为空', trigger: 'change' }],
          tid: [{ required: true, message: '请选择所属讲师', trigger: 'blur' }],
          property: [{ required: true, message: '请设置课程属性', trigger: 'blur' }],
          status: [{ required: true, message: '请设置课程审核状态', trigger: 'blur' }],
          price: [ { required: true, message: '请填写课程价格', trigger: 'blur' }],
          image: [{required: true, message: '请上传课程封面图', trigger: 'blur'}]
        },
        courseList: [],
        courseListTreeProps: {
          label: 'name',
          children: 'children'
        },
        teacherList: [],
        teacherListTreeProps: {
          label: 'nickname',
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
            url: this.$http.adornUrl('/xry/user/treeUser'),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            this.teacherList = treeDataTranslate(data.userList, 'id')
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
                  this.dataForm.id = data.course.id
                  this.dataForm.type = data.course.type
                  this.dataForm.courseType = data.course.courseType
                  this.dataForm.courseId = data.course.courseId
                  this.dataForm.userId = data.course.userId
                  this.dataForm.publishDate = data.course.publishDate
                  this.dataForm.info = data.course.info
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
        this.dataForm.cid = data.id
        this.dataForm.parentName = data.name
      },
      // 课程类目树设置当前选中节点
      courseListTreeSetCurrentNode () {
        this.$refs.courseListTree.setCurrentKey(this.dataForm.cid)
        this.dataForm.parentName = (this.$refs.courseListTree.getCurrentNode() || {})['name']
      },
      // 讲师树选中
      teacherListTreeCurrentChangeHandle (data, node) {
        this.dataForm.tid = data.id
        this.dataForm.teacherName = data.nickname
      },
      // 讲师树设置当前选中节点
      teacherListTreeSetCurrentNode () {
        this.$refs.teacherListTree.setCurrentKey(this.dataForm.tid)
        this.dataForm.teacherName = (this.$refs.teacherListTree.getCurrentNode() || {})['nickname']
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/xry/message/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'type': this.dataForm.type,
                'courseType': this.dataForm.courseType,
                'courseId': this.dataForm.courseId,
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
      }
    }
  }
</script>

