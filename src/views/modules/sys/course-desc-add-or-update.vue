<template>
  <el-dialog :title="!dataForm.courseId ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="所属课程" prop="parentName"> 
        <el-popover ref="courseListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseList" :props="courseListTreeProps" node-key="courseId" ref="courseListTree"
            @current-change="courseListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.parentName" v-popover:courseListPopover :readonly="true" placeholder="点击选择上级课程类目" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="课程描述">
        <editor ref="myTextEditor" :uploadUrl="uploadUrl" :on-success="successHandle"></editor>  
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { quillEditor } from 'vue-quill-editor'
  import editor from '@/components/upload/Quilleditor.vue'
  import { treeDataTranslate } from '@/utils'
  export default {
    components: {quillEditor,editor},
    data () {
      return {
        visible: false,
        dataForm: {
          courseId: 0,
          parentName: '',
          courseDesc: ''
        },
        uploadShow: false,
        dataRule: {
          courseId: [
            { required: true, message: '所属课程不能为空', trigger: 'blur' }
          ],
          courseDesc: [
            { required: true, message: '课程描述不能为空', trigger: 'blur' }
          ]
        },
        courseList: [],
        courseListTreeProps: {
          label: 'title',
          children: 'children'
        },
        defaultMsg: '',
        config: {
          initialFrameWidth: null,
          initialFrameHeight: 350
        },
        url: '',
        fileList: [],
        /*测试上传图片的接口，返回结构为{url:''}*/
        uploadUrl:this.$http.adornUrl(`/sys/oss/uploadImg?token=${this.$cookie.get('token')}`)
      }
    },
    methods: {
      init (id) {
        this.url = this.$http.adornUrl(`/sys/oss/upload?token=${this.$cookie.get('token')}`)
        this.dataForm.courseId = id || 0
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
                this.dataForm.courseId = data.courseDesc.courseId
                this.dataForm.courseDesc = data.courseDesc.courseDesc
                this.courseListTreeSetCurrentNode()
              }
            })
          } else {
            // 新增
            this.courseListTreeSetCurrentNode()
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
              url: this.$http.adornUrl(`/xry/course/desc/${!this.dataForm.courseId ? 'save' : 'save'}`),
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
      },
      // 上传之前
      beforeUploadHandle (file) {
        if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
          this.$message.error('只支持jpg、png、gif格式的图片！')
          return false
        }
        this.num++
      },
      // 上传成功
      successHandle (response, file, fileList) {
        console.log(fileList)
        this.fileList = fileList
        this.successNum++
        if (response && response.code === 0) {
          if (this.num === this.successNum) {
            this.$confirm('操作成功, 是否继续操作?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).catch(() => {
              this.visible = false
            })
          }
        } else {
          this.$message.error(response.msg)
        }
      },
      //富文本编辑器失去焦点事件
      onEditorBlur(editor){    
 	    },
       //富文本编辑器获得焦点事件
      onEditorFocus(editor){
      },
      //富文本编辑器文本发生变化
      onEditorChange({editor,html,text}){
          //this.content可以实时获取到当前编辑器内的文本内容
          console.log(this.content);
      }
    }
  }
</script>

<style lang="scss">
  .mod-course-cat {
    .menu-list__input,
    .icon-list__input {
       > .el-input__inner {
        cursor: pointer;
      }
    }
    &__icon-popover {
      /*max-width: 370px;*/
    }
    &__icon-list {
      /*max-height: 180px;*/
      padding: 0;
      margin: -8px 0 0 -8px;
      > .el-button {
        padding: 8px;
        margin: 8px 0 0 8px;
        > span {
          display: inline-block;
          vertical-align: middle;
          width: 18px;
          height: 18px;
          font-size: 18px;
        }
      }
    }
    .icon-list__tips {
      font-size: 18px;
      text-align: center;
      color: #e6a23c;
      cursor: pointer;
    }
  }
</style>
