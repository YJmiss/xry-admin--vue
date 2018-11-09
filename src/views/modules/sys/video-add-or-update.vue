<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="视频标题" prop="title">
        <el-input v-model="dataForm.title" type="text"placeholder="视频标题"></el-input>
      </el-form-item>
      <el-form-item label="视频路径" prop="videoUrl">
        <el-input v-model="dataForm.videoUrl" type="text" placeholder="视频路径"></el-input>
      </el-form-item>
      <el-form-item label="所属课程" prop="courseId"> 
        <el-input v-model="dataForm.courseId" type="text" placeholder="所属课程"></el-input>
      </el-form-item>
      <el-form-item label="所属目录" prop="catalogId">
        <el-input v-model="dataForm.catalogId" placeholder="所属目录"></el-input>
      </el-form-item>
      <el-form-item label="是否收费" size="mini" prop="property">
        <el-radio-group v-model="dataForm.property">
          <el-radio :label="1">试学</el-radio>
          <el-radio :label="2">收费</el-radio>
          <el-radio :label="3">免费</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="审核状态" size="mini" prop="status">
        <el-radio-group v-model="dataForm.status">
          <el-radio :label="1">未审核</el-radio>
          <el-radio :label="2">审核中</el-radio>
          <el-radio :label="3">已审核</el-radio>
          <el-radio :label="4">未通过</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="参数数据" prop="paramData">
        <el-input v-model="dataForm.paramData" type="text"placeholder="参数数据"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { isEmail, isMobile } from '@/utils/validate'
  export default {
    data () {
      return {
        visible: false,
        roleList: [],
        dataForm: {
          id: 0,
          title: '',
          videoUrl: '',
          courseId: '',
          catalogId: '',
          property: 1,
          status: 1,
          paramData: ''
        },
        dataRule: {
          title: [
            { required: true, message: '请填写视频标题', trigger: 'blur' }
          ],
          courseId: [
            { required: true, message: '请选择视频所属课程', trigger: 'blur' }
          ],
          catalogId: [
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
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/xry/video/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({ data }) => {
              console.log(data);
              if (data && data.code === 0) {
                this.dataForm.title = data.video.title
                this.dataForm.videoUrl = data.video.videoUrl
                this.dataForm.courseId = data.video.courseId
                this.dataForm.catalogId = data.video.catalogId
                this.dataForm.property = data.video.property
                this.dataForm.status = data.video.status
                this.dataForm.paramData = data.video.paramData
              }
            })
          }
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
      }
    }
  }
</script>
