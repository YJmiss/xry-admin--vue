<template>
   <el-dialog :visible.sync="visible" :close-on-click-modal="false">
        <el-form :inline="true" :model="dataForm" :rules="dataRule">
        <el-form-item label="在这里填写回复内容:"  style="padding-top:20px;font:16px bold;">
        <editor :uploadUrl="uploadUrl" v-model="dataForm.replyContent" class="editorStyle"></editor>
        </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="visible = false">取消</el-button>
            <el-button type="primary" @click="replySubmit()">确定</el-button>
        </span>
    </el-dialog>
</template>

<script>
import Editor from '@/components/quill-editor.vue'
export default {
    components:{Editor},
    data() {
        return {
            visible: false,
            dataForm: {
                check_status:'',
                userId: '',
                questionId:'',
                replyContent:''
            },
        uploadUrl: this.$http.adornUrl(`/sys/oss/uploadImg?token=${this.$cookie.get('token')}`),
        }
    },
    methods: {
        //根据id获取数据
       init(id,userId,questionId,check_status) {
            this.visible = true
            this.dataForm.userId = userId
            this.dataForm.questionId = questionId
            this.dataForm.check_status = check_status
            if(1 === this.dataForm.check_status){
             this.$http({
                url: this.$http.adornUrl(''),
                method: 'get',
                params: this.$http.adornParams({
                    'id':id
                })
            }).then(({ data }) => {
                 this.visible = true
                if (data && data.code === 0) {
                 this.dataForm.replyContent = data.reply_info
                } else {
                alert('数据获取失败！')
                }
            }) 
            }else{
                //新增
            } 
        },
        //提交表单
        replySubmit() {
            this.$http({
                url: this.$http.adornUrl(''),
                method: 'post',
                data: this.$http.adornData({
                    'userId': this.dataForm.userId || undefined,
                    'reply_info': this.dataForm.replyContent,
                    'question_id':this.dataForm.questionId
                }).then(({
                    data
                }) => {
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
            })
        }
    }
}
</script>
<style scoped>
.el-form-item {
margin-right: 30px;
}
.editorStyle{
min-height: 450px;
}
p{
font: 16px 微软雅黑;
color: #333;
}
p span{
color: beige;
}
.editorStyle{
min-height: 450px;
}
</style>
