<template>
  <el-dialog :title="!dataForm.id ? '' : '审核/记录'" :close-on-click-modal="false" :visible.sync="visible">
  <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
  <el-radio-group v-model="radio">
   <el-radio  :label="1">申请通过</el-radio>
   <el-radio  :label="2">申请驳回</el-radio>
   </el-radio-group>
   <el-form-item label="记录详情" prop="record">
    <textarea rows="15" cols="110"></textarea>
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
        dataForm: {
          id: 0,
          videoUrl: '',
        },
         radio:1,
         record:'',
        dataRule: {
        record:[
          { required: true, message: '请填写审核记录详情！', trigger: 'blur' }
          ] 
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        if (!this.dataForm.id) {
          // 新增
        } else {
          this.$http({
            url: this.$http.adornUrl(`/xry/video/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            this.visible = true
            if (data && data.code === 0) {
              this.dataForm.id = data.video.id
              this.dataForm.videoUrl = data.video.videoUrl
           
            }
          })
        } 
      },
      // 审核记录弹框
      dataFormSubmit () {
        this.visible = false
      },
      dataFormSubmit(){
    this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/xry/record/${!this.dataForm.id ? 'save' : ''}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'record': this.record,
                'videoUrl': this.dataForm.videoUrl,
                'radio':this.radio
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
textarea{
  border-color: #dddddd;
  margin-left: 10px;
  margin-top: 20px;
}
.el-radio-group {
    display: inline-block;
    line-height: 2;
    vertical-align: middle;
    font-size: 20px;
    margin-left: 90px;
}
</style>
