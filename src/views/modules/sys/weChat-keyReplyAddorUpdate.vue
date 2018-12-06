<template>
    <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="关键词" prop="keywords">
      <el-input v-model="dataForm.keywords" placeholder="关键词"></el-input>
      </el-form-item>
      <el-form-item label="匹配模式" prop="matchMode">
      <el-radio-group v-model="radio">
      <el-radio :label="1">精确匹配</el-radio>
      <el-radio :label="2">模糊匹配</el-radio>
      <el-radio :label="3">任意匹配</el-radio>
      </el-radio-group>
      </el-form-item>
    <el-form-item size="mini" label="回复类型" prop="replyType">
    <el-select v-model="value" placeholder="请选择">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
      </el-option>
     </el-select>
      </el-form-item>
     <el-form-item label="回复内容" prop="replyContent">
      <el-input type="textarea" rows="6" v-model="textarea" placeholder="回复内容"></el-input>
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
    data(){
    return{
  visible: false,
  radio:1,
  textarea:'',
  dataForm:{
  id:0,
  keywords:'',
  matchMode:'',
  replyType:'',
  replyContent:''
       },
    options: [{
        value: '1',
        label: '文字消息'
    }, {
        value: '2',
        label: '图文消息'
    }],
    value: '',
    dataRule: {
          keywords: [
          { required: true, message: '关键词不能为空！', trigger: 'blur' }
          ],
         matchMode: [
            { required: true, message: '请选择匹配模式', trigger: 'blur' }
          ],
          replyType: [
            { required: true, message: '请选择回复类型', trigger: 'blur' }
          ],
          replyContent:[
          { required: true, message: '回复内容不能为空！', trigger: 'blur' } 
          ]
        }
  }
    },
    methods:{
      init (id) {
        this.dataForm.id =id || 0
        if(this.dataForm.id==0){
        this.visible=true
        }else{
          this.$http({
              url: this.$http.adornUrl(`/sys/weChat/keyReply/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({ data }) => {
              if (data && data.code === 0) {
                this.dataForm.keywords = data.role.keywords
                this.dataForm.matchMode.radio.label = data.radio.label
                this.dataForm.replyType = data.replyType
                this.replyContent = data.replyContent
                this.visible = true
              }else{
                alert('数据获取失败！')
              }
            })
        }
      },
    //表单提交
    dataFormSubmit(){
     this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/sys/weChat/keyReply/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'replyId': this.dataForm.id || undefined,
                'keywords': this.dataForm.keywords,
                'matchMode': this.dataForm.matchMode,
                'replyType': this.dataForm.replyType,
                'replyContent': this.dataForm.replyContent,
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

