<template>
<el-dialog :visible.sync="visible" :close-on-click-modal="false">
    <el-form>
        <span class="title">反馈用户:</span>&nbsp;&nbsp;
        <span class="content" v-if="nickname">{{nickname}}&nbsp;/&nbsp;{{phone}}</span>
        <span class="content" v-else>{{phone}}</span>
        <h3>反馈详情:</h3>
        <div class="feedbackDetail">
        <p>{{feedbackInfo}}</p>
        <template v-for="(item,index) in feedbackImg" v-show="feedbackImg">
        <img :src="item" key="index"> 
        </template>
        </div>
        <span class="title">反馈时间:</span>&nbsp;&nbsp;&nbsp;<span class="content">{{feedbackTime}}</span>
    </el-form>
</el-dialog>
</template>

<script>
export default {
    data() {
        return {
            visible: false,
            nickname:'',
            phone:'',
            feedbackInfo: '',
            feedbackImg:[],
            feedbackTime: '',
            dataForm:{}
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
                    this.phone = data.userFeedback.phone,
                    this.feedbackImg = data.userFeedback.feedbackImgArray  
                    console.log(data.userFeedback) 
                }
            })
        }
    }
}
</script>

<style scoped>
.el-form-item {
margin-right: 30px;
font: 14px 微软雅黑;
color: #333;
}
.feedbackDetail{
border: 1px #dddddd solid;
padding:4px;
margin-bottom: 20px;
}
.feedbackDetail img{
max-width:70%;
height: auto;
}
.title{
font-size:16px;
font-weight: bold;
}
.content{
font-size: 16px;
color: #999;
}
</style>
