<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="课程标题" prop="title">
        <el-input v-model="dataForm.title" type="text"placeholder="课程标题"></el-input>
      </el-form-item>
      <el-form-item label="课程图片" prop="image">
        <el-input v-model="dataForm.image" type="text" placeholder="课程图片"></el-input>
      </el-form-item>
      <el-form-item label="所属课程" prop="cid"> 
        <el-input v-model="dataForm.cid" type="cid" placeholder="所属课程"></el-input>
      </el-form-item>
      <el-form-item label="所属讲师" prop="tid">
        <el-input v-model="dataForm.tid" placeholder="所属讲师"></el-input>
      </el-form-item>
      <el-form-item label="课程属性" prop="property">
        <el-input v-model="dataForm.property" placeholder="课程属性"></el-input>
      </el-form-item>
      <el-form-item label="课程价格" prop="price">
        <el-input v-model="dataForm.price" type="text"placeholder="课程价格"></el-input>
      </el-form-item>
      <el-form-item label="审核状态" size="mini" prop="status">
        <el-radio-group v-model="dataForm.status">
          <el-radio :label="1">未审核</el-radio>
          <el-radio :label="2">审核中</el-radio>
          <el-radio :label="3">已审核</el-radio>
          <el-radio :label="4">未通过</el-radio>
        </el-radio-group>
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
      var validatePassword = (rule, value, callback) => {
        if (!this.dataForm.id && !/\S/.test(value)) {
          callback(new Error('标题不能为空'))
        } else {
          callback()
        }
      }
      return {
        visible: false,
        roleList: [],
        dataForm: {
          id: 0,
          title: '',
          image: '',
          cid: '',
          tid: '',
          property: '',
          status: 1,
          price: ''
        },
        dataRule: {
          title: [
            { required: true, message: '请填写课程标题', trigger: 'blur' }
          ],
          cid: [
            { required: true, message: '请选择所属课程', trigger: 'blur' }
          ],
          tid: [
            { required: true, message: '请选择所属讲师', trigger: 'blur' }
          ],
          property: [
            { required: true, message: '请设置课程属性', trigger: 'blur' }
          ],
          status: [
            { required: true, message: '请设置课程审核审核审核状态', trigger: 'blur' }
          ],
          price: [
            { required: true, message: '请填写课程价格', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/xry/course/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({ data }) => {
              console.log(data);
              if (data && data.code === 0) {
                this.dataForm.title = data.course.title
                this.dataForm.image = data.course.image
                this.dataForm.cid = data.course.cid
                this.dataForm.tid = data.course.tid
                this.dataForm.property = data.course.property
                this.dataForm.price = data.course.price
                this.dataForm.status = data.course.status
              }
            })
          }
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/xry/course/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'courseId': this.dataForm.id || undefined,
                'title': this.dataForm.title,
                'image': this.dataForm.image,
                'cid': this.dataForm.cid,
                'tid': this.dataForm.tid,
                'property': this.dataForm.property,
                'price': this.dataForm.price,
                'status': this.dataForm.status
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
