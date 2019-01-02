<template>
<el-dialog :visible.sync="visible" :close-on-click-modal="false">
    <el-form :model="dataForm">
        <p>反馈用户:&nbsp;<span style="color:red;">{{nickname}}{{phone}}</span></p>
        <h3>反馈信息:</h3>
        <div>{{feedbackInfo}}</div>
        <p>反馈时间:&nbsp;{{feedbackTime}}</p>
    </el-form>
</el-dialog>
</template>

<script>
import Editor from '@/components/quill-editor.vue'
export default {
    components: {Editor},
    data() {
        return {
            visible: false,
            nickname:'',
            phone:'',
            feedbackInfo: '',
            feedbackTime: '',
        }
    },
    methods: {
        //根据id获取数据
        init(id) {
            this.visible = true
            this.$http({
                url: this.$http.adornUrl(`/xry/feedback/detail`),
                method: "get",
                params: this.$http.adornParams({"id":id})
            }).then(({ data }) => {
                if (data && data.code === 0) {
                    this.feedbackInfo = data.userFeedback.feedback_info,
                    this.feedbackTime = data.userFeedback.create_time,
                    this.nickname = data.userFeedback.nickname,
                    this.phone = data.userFeedback.phone         
                }
            })
        }
    }
}
</script>

<style scoped>
.el-form-item {
    margin-right: 30px;
}

.editorStyle {
    min-height: 450px;
}

p {
    font: 16px 微软雅黑;
    color: #333;
}
</style>
