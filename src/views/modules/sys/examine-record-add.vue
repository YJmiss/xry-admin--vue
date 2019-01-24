<template>
  <el-dialog :title="!dataForm.id ? '' : '审核/记录'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" label-width="80px">
      <el-radio-group v-model="dataForm.actionNumber">
        <el-radio  :label="3">申请通过</el-radio>
        <el-radio  :label="2">申请驳回</el-radio>
      </el-radio-group>
      <el-form-item label="记录详情" prop="detail">
        <textarea rows="15" cols="110"  v-model="dataForm.detail" placeholder="请填写审核记录心情！"></textarea>
      </el-form-item>
      <el-form-item v-model="dataForm.type" :visible="false"></el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="examineHandle()">确定</el-button>
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
          id:'',
          objectId:[],
          actionNumber:3,
          detail:'',
          type: 0
        },
        dataRule: {
        record:[
          { required: true, message: '请填写审核记录详情！', trigger: 'blur' }
          ] 
        }
      }
    },
   
    methods: {
      init (id,examineType) {
        this.visible = true
        this.dataForm.type = examineType
        //除了讲师认证审核，其他审核支持批量，所以被审核对象id作为一个对象提交后台
        if(1 == examineType || 2 == examineType || 4 == examineType){
        this.dataForm.objectId = id
        }else{
        //如若审核对象为讲师，不支持批量，所以被审核对象id作为一个参数提交后台
        this.dataForm.id = id
        }
       /*  let urlType = '';
        if (1 == examineType) {urlType = 'course'} 
        else if(2 == examineType){urlType = 'video'} 
        else if(3 == examineType){urlType = 'teacher'}
        else{urlType = 'organization'}
       this.$http({
          url: this.$http.adornUrl(`/xry/${urlType}/info/${this.dataForm.id}`),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          if (data && data.code === 0) {
            if (data.course) {
              this.dataForm.id = data.course.id
            } else if (data.video) {
              this.dataForm.id = data.video.id
            } else if (data.teacher) {
              this.dataForm.id = data.teacher.id
            } else {
              this.dataForm.id = data.org.id
            }
          }
        }) */
      },
      //审核提交前处理
      examineHandle(){
      if(3 == this.dataForm.examineType){
        this.dataFormSubmit()
      }else{
      this.examineRecordSubmit()
      }
      },
      // 审核记录提交
      dataFormSubmit () {
        this.visible = false
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/xry/record/examine`),
              method: 'post',
              data: this.$http.adornData({
                'recordId': this.dataForm.id,
                'actionNumber': this.dataForm.actionNumber,
                'type':this.dataForm.type,
                'detail': this.dataForm.detail
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
                    this.dataForm.detail = ''
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      },
    //支持批量操作
    examineRecordSubmit(){
      this.visible = false
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/xry/record/examines`),
              method: 'post',
              data:this.$http.adornData({
              'recordId':this.dataForm.objectId,
              'actionNumber': this.dataForm.actionNumber,
              'type':this.dataForm.type,
              'detail': this.dataForm.detail
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
                    this.dataForm.detail = ''
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
