<template>
    <el-dialog :visible.sync="visible" :close-on-click-modal="false">
     <p>反馈用户:<span>{{dataForm.feedbackUser}}</span></p>
     <h3>反馈信息:</h3><div>{{dataForm.feedbackInfo}}</div>
     <p>反馈时间:{{dataForm.feedbackTime}}</p>
    </el-dialog>
</template>

<script>
export default {
    data() {
        return {
            visible: false,
            dataForm: {
                id:'',
                feedbackUser:'',
                feedbackInfo:'',
                feedbackTime: '',
            }
        }
    },
    methods: {
        //根据id获取数据
       init(id) {
           this.visible = true
           this.$http({
                url: this.$http.adornUrl(''),
                method: 'get',
                params: this.$http.adornParams({
                    'id':id
                })
            }).then(({ data }) => {
                 this.visible = true
                if (data && data.code === 0) {
                  this.dataForm.feedbackUser = '',
                  this.dataForm.feedbackInfo = '',
                  this.dataForm.feedbackTime = ''
                } else {
                alert('数据获取失败！')
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
</style>
