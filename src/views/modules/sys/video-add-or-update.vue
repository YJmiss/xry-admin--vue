<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="视频标题" prop="title">
        <el-input v-model="dataForm.title" type="text" placeholder="视频标题"></el-input>
      </el-form-item>
      <el-form-item label="所属课程" prop="courseName"> 
        <el-popover ref="courseListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseList" :props="courseListTreeProps" node-key="courseId" ref="courseListTree"
            @current-change="courseListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.courseName" v-popover:courseListPopover :readonly="true" placeholder="点击选择所属课程" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="所属目录" prop="catalogName"> 
        <el-popover ref="courseCatalogListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseCatalogList" :props="courseCatalogListTreeProps" node-key="catalogId" ref="courseCatalogListTree"
            @current-change="courseCatalogListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.catalogName" v-popover:courseCatalogListPopover :readonly="true" placeholder="点击选择所属目录" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="是否收费" size="mini" prop="property">
        <el-radio-group v-model="dataForm.property">
          <el-radio :label="1">试学</el-radio>
          <el-radio :label="2">收费</el-radio>
          <el-radio :label="3">免费</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="视频路径" prop="url">
        <el-input v-model="dataForm.videoUrl" type="text" placeholder="视频路径" readonly="readonly"></el-input>
      </el-form-item>
      <el-form-item label="上传视频" >
      <el-upload class="load"
      drag
      :action="url"
      :before-upload="beforeUploadHandle"
      :on-success="successHandle"
      :on-progress="progressHandle"
      multiple
      :file-list="fileList"
      >
      <div class="icon">
      <i class="el-icon-caret-right"></i>
      </div>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div class="el-upload__tip" slot="tip">只支持mp4格式的视频,且一个文件不超过500kb！</div>
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
  import { treeDataTranslate } from '@/utils'
  export default {
    data () {
      return {
        visible: false,
        roleList: [],
        fileList:[],
        uplodProgress:0,
        url: '',
        dataForm: {
          id: 0,
          title: '',
          videoUrl: '',
          courseId: 0,
          catalogId: 0,
          property: 1,
          status: 1,
          paramData: '',
          courseName: '',
          catalogName: ''
        },
        video:'',
        dataRule: {
          title: [
            { required: true, message: '请填写视频标题', trigger: 'blur' }
          ],
          courseName: [
            { required: true, message: '请选择视频所属课程', trigger: 'blur' }
          ],
          catalogName: [
            { required: true, message: '请选择视频所属目录', trigger: 'blur' }
          ],
          property: [
            { required: true, message: '请设置课程属性', trigger: 'blur' }
          ],
          status: [
            { required: true, message: '请设置课程审核状态', trigger: 'blur' }
          ],
          paramData: [
            { required: true, message: '请填写视频格式', trigger: 'blur' }
          ]
        },
        courseList: [],
        courseCatalogList: [],
        courseListTreeProps: {
          label: 'title',
          children: 'children'
        },
        courseCatalogListTreeProps: {
          label: 'title',
          children: 'children'
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        // 查询课程树
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
          // 查询目录树，需要根据选中课程的id查询出目录树
          this.$http({
            url: this.$http.adornUrl('/xry/course/catalog/treeCourseCatalog'),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            this.courseCatalogList = treeDataTranslate(data.courseCatalogList, 'id')
          }).then(() => {
            this.visible = true
            this.$nextTick(() => {
              this.$refs['dataForm'].resetFields()
            })
          }).then(() => {
            if (!this.dataForm.id) {
              // 新增
              this.courseListTreeSetCurrentNode()
              this.courseCatalogListTreeSetCurrentNode()
            } else {
              this.$http({
                url: this.$http.adornUrl(`/xry/video/info/${this.dataForm.id}`),
                method: 'get',
                params: this.$http.adornParams()
              }).then(({ data }) => {
                this.visible = true
                if (data && data.code === 0) {
                  this.dataForm.id = data.video.id
                  this.dataForm.title = data.video.title
                  this.dataForm.videoUrl = data.video.videoUrl
                  this.dataForm.courseId = data.video.courseId
                  this.dataForm.catalogId = data.video.catalogId
                  this.dataForm.property = data.video.property
                  this.dataForm.status = data.video.status
                  this.dataForm.paramData = data.video.paramData
                  this.courseListTreeSetCurrentNode()
                  this.courseCatalogListTreeSetCurrentNode()
                }
              })
            } 
          }) 
        })
      },
      // 课程树选中
      courseListTreeCurrentChangeHandle (data, node) {
        this.dataForm.courseId = data.id
        this.dataForm.courseName = data.title
      },
      // 课程树设置当前选中节点
      courseListTreeSetCurrentNode () {
        this.$refs.courseListTree.setCurrentKey(this.dataForm.courseId)
        this.dataForm.courseName = (this.$refs.courseListTree.getCurrentNode() || {})['title']
      },
      // 课程目录树选中
      courseCatalogListTreeCurrentChangeHandle (data, node) {
        this.dataForm.catalogId = data.id
        this.dataForm.catalogName = data.title
      },
      // 课程目录树设置当前选中节点
      courseCatalogListTreeSetCurrentNode () {
        this.$refs.courseCatalogListTree.setCurrentKey(this.dataForm.catalogId)
        this.dataForm.catalogName = (this.$refs.courseCatalogListTree.getCurrentNode() || {})['title']
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/xry/video/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'title': this.dataForm.title,
                'videoUrl': this.dataForm.videoUrl,
                'courseId': this.dataForm.courseId,
                'catalogId': this.dataForm.catalogId,
                'property': this.dataForm.property,
                'status': this.dataForm.status,
                'paramData': this.dataForm.paramData
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
        if (file.type !== 'video/mp4') {
          this.$message.error('只支持mp4格式的视频！')
          return false
        }
      },
      // 上传进度
progressHandle(file){
  uplodProgress=file.fileList/file.size*100
},
 // 上传成功
successHandle(file){
  if(uplodProgress=file.size){
   this.$confirm('操作成功, 是否继续操作?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).catch(() => {
              this.visible = false
            })
  }
}
    }
  }
</script>
<style scoped>
.icon{
  border:solid 1px #f8f8f8;
  width:50px;
  height:50px;
  margin-left:43%;
  margin-top:50px;
  margin-bottom:10px;
  padding-top:10px;
  background: #ebebeb;
  border-radius: 4px;
}
</style>
