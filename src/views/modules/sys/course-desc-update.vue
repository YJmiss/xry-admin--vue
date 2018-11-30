<template>
  <el-dialog :title="!dataForm.courseId ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" label-width="80px">
      <el-form-item label="所属课程" prop="parentName" v-show="false"> 
        <el-popover ref="courseListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseList" :props="courseListTreeProps" node-key="courseId" ref="courseListTree" @current-change="courseListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.parentName" placeholder="点击选择上级课程类目" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="课程描述">
        <editor :uploadUrl="uploadUrl" v-model="dataForm.courseDesc"></editor>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { treeDataTranslate } from '@/utils'
  import Editor from '@/components/Quilleditor.vue'
  export default {
    components: {Editor},
    data () {
      return {
        visible: false,
        dataForm: {
          courseId: 0,
          courseDescId: 0,
          parentName: '',
          courseDesc: '',
        },
        dataRule: {
          courseDesc: [
            { required: true, message: '课程描述不能为空', trigger: 'blur' }
          ]
        },
        courseList: [],
        courseListTreeProps: {
          label: 'title',
          children: 'children'
        },
        //测试上传图片的接口，返回结构为{url:''}
        uploadUrl: this.$http.adornUrl(`/sys/oss/uploadImg?token=${this.$cookie.get('token')}`)
      }
    },
    methods: {
      init (courseId) {
        this.dataForm.courseId = courseId || 0
        this.$http({
          url: this.$http.adornUrl('/xry/course/treeCourse'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          this.courseList = treeDataTranslate(data.courseList, 'id')
        }).then(() => {
          this.visible = true
          this.$nextTick(() => {
            this.$refs['dataForm'].resetFields()
          })
        }).then(() => {
          if (this.dataForm.courseId) {
            this.$http({
              url: this.$http.adornUrl(`/xry/course/desc/info/${this.dataForm.courseId}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({ data }) => {
              if (data && data.code === 0) {
                this.dataForm.courseDescId = data.courseDesc.courseId
                this.dataForm.courseId = data.courseDesc.courseId
                this.dataForm.courseDesc = data.courseDesc.courseDesc
                this.courseListTreeSetCurrentNode()
              }
            })
          } else {
            // 新增
          }
        })
      },
      // 课程树选中
      courseListTreeCurrentChangeHandle (data, node) {
        this.dataForm.courseId = data.id
        this.dataForm.parentName = data.title
      },
      // 课程树设置当前选中节点
      courseListTreeSetCurrentNode () {
        this.$refs.courseListTree.setCurrentKey(this.dataForm.courseId)
        this.dataForm.parentName = (this.$refs.courseListTree.getCurrentNode() || {})['title']
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/xry/course/desc/${!this.dataForm.courseId ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'courseId': this.dataForm.courseId || undefined,
                'courseDesc': this.dataForm.courseDesc
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

<style lang="scss">
  .quill-editor{height:1000px;}
  .el-dialog__footer{padding-top:50px;}
</style>
