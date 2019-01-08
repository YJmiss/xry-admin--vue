<template>
  <el-dialog :title="!dataForm.id ? '' : '评论回复'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" label-width="80px">
      <el-form-item label="评论内容">
        <div>{{dataForm.detail}}</div>
      </el-form-item>
      <el-form-item label="回复内容" prop="reply">
      <el-tooltip v-if="dataForm.reply"  content="已经回复过一次了，不能修改回复内容！" placement="top" effect="light">
        <textarea rows="15" cols="110" v-model="dataForm.reply" readonly='readonly'></textarea>
      </el-tooltip>
       <el-tooltip v-else content="请认真填写回复内容，回复之后不能更改内容！" placement="top"  effect="light">
      <textarea rows="15" cols="110" v-model="dataForm.replyAdd" ></textarea>
      </el-tooltip>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        dataForm: {
          id: 0,
          detail:'',
          reply:'',
          replyAdd:''
        },
        dataRule: {
          record:[{ required: true, message: '请填写回复信息！', trigger: 'blur' }] 
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.$http({
          url: this.$http.adornUrl(`/xry/comment/info/${this.dataForm.id}`),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          this.visible = true
          if (data && data.code === 0) {
            if (data.comment) {
              this.dataForm.id = data.comment.id
              this.dataForm.detail = data.comment.detail
              this.dataForm.reply = data.comment.reply
            }
          }
        })
      },
      // 评论回复提交
      dataFormSubmit () {
        this.visible = false
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/xry/comment/reply`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'reply': this.dataForm.replyAdd
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
