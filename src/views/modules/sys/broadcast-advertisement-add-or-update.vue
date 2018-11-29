<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="广告类别">
        <template>
          <el-radio-group v-model="dataForm.category">
            <el-radio :label="1">首页轮播</el-radio>
            <el-radio :label="2">首页中部广告</el-radio>
            <el-radio :label="3">分类页广告</el-radio>
          </el-radio-group>
        </template>
      </el-form-item>
      <el-form-item label="内容标题" prop="title">
        <el-input v-model="dataForm.title" type="text"placeholder="内容标题"></el-input>
      </el-form-item>
      <el-form-item label="跳转链接" prop="url" v-show="dataForm.category === 2">
        <el-input v-model="dataForm.url" type="text" placeholder="请填写跳转链接"></el-input>
      </el-form-item>
      <el-form-item label="所属课程" prop="parentName" v-show="dataForm.category === 1 || dataForm.category === 3"> 
        <el-popover ref="courseListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseList" :props="courseListTreeProps" node-key="id" ref="courseListTree"
            @current-change="courseListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.parentName" v-popover:courseListPopover :readonly="true" placeholder="点击选择所属课程" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="内容描述" prop="titie_desc">
        <el-input type="textarea" :rows="6" placeholder="请输入内容描述" v-model="dataForm.titie_desc"></el-input>
      </el-form-item>
      <el-form-item label="广告图片" prop="pic">
        <el-upload class="load" drag :action="url" ref="upload" :before-upload="beforeUploadHandle" :on-success="successHandle" multiple :file-list="fileList">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只支持jpg、png、gif格式的图片！</div>
        </el-upload>
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
  import UE from "@/components/ue/ue.vue";
  import { treeDataTranslate} from '@/utils'
  export default {
    components: { UE },
    data () {
      return {
        visible: false,
        fileList: [],
        dataForm: {
          id: 0,
          title: '',
          category: 1,
          title_desc: '',
          url: '',
          pic: '',
          parentName:'',
          status: 1
        },
        visible: false,
        url: '',
        num: 0,
        successNum: 0,
        fileList: [],
        dataRule: {
          category: [
            { required: true, message: '请选择广告类别', trigger: 'blur' }
          ],
          title: [
            { required: true, message: '请填写广告标题', trigger: 'blur' }
          ],
          pic: [
            { required: true, message: '请上传广告封面图片', trigger: 'blur' }
          ]
        },
        defaultMsg: "",
        config: {
          initialFrameWidth: null,
          initialFrameHeight: 350
        },
        courseList: [],
        courseListTreeProps: {
          label: 'title',
          children: 'children'
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        // 查询目录所属课程
        this.$http({
          url: this.$http.adornUrl('/xry/course/treeCourse'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          this.courseList = treeDataTranslate(data.courseList, 'id')
        }).then(() => {
          this.visible = true
            this.$nextTick(() => {
            // 重置form表单（清空form表单的内容）
            this.$refs['dataForm'].resetFields()
            // 清除el-upload上次操作数据
            this.$refs.upload.clearFiles()
          })
        }).then(() => {
          this.url = this.$http.adornUrl(`/sys/oss/upload?token=${this.$cookie.get('token')}`)
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/xry/content/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({ data }) => {
              if (data && data.code === 0) {
                this.dataForm.id = data.content.id
                this.dataForm.category = data.content.category
                this.dataForm.title = data.content.title
                this.dataForm.title_desc = data.content.title_desc
                this.dataForm.url = data.content.url
                this.dataForm.pic = data.content.pic
                this.dataForm.course_id = data.content.course_id
                this.dataForm.status = data.content.status
                this.courseListTreeSetCurrentNode()
              }
            })
          } else {
            // 新增
          }
        })
      },
      // 课程类目树选中
      courseListTreeCurrentChangeHandle (data, node) {
        this.dataForm.courseid = data.id
        this.dataForm.parentName = data.title
      },
      // 课程类目树设置当前选中节点
      courseListTreeSetCurrentNode () {
        this.$refs.courseListTree.setCurrentKey(this.dataForm.courseid)
        this.dataForm.parentName = (this.$refs.courseListTree.getCurrentNode() || {})['title']
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
        this.fileList = fileList
        this.successNum++
        this.dataForm.pic = response.url
      },
      // 表单提交
      dataFormSubmit () {
        // 单独校验"所属课程"、"跳转链接"
        if (1 == this.dataForm.category || 3 == this.dataForm.category) {
            // 校验"所属课程"
            if (!this.dataForm.parentName) {
              this.$confirm(`请选择所属课程`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                return;
              })
            }
        } else {
          // 校验"跳转链接"
          if (!this.dataForm.parentName) {
            this.$confirm(`请选择跳转链接`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              return;
            })
          }
        }
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/xry/content/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'title': this.dataForm.title,
                'category': this.dataForm.category,
                'title_desc': this.dataForm.title_desc,
                'url': this.dataForm.url,
                'pic': this.dataForm.pic,
                'course_id': this.dataForm.course_id
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
<style scoped>
  .load{text-align: center;border: solid 1px #f0f0f0;margin-top: 20px;padding:10px;font-size: 16px;}
</style>