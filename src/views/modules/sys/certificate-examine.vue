<template>
    <div id="dataReceive">
        <el-tabs type="card" class="card" @tab-click="handleClick" v-model="activeName">
            <el-tab-pane label="讲师资料认证审核" name="teacher_certificate"></el-tab-pane>
            <el-tab-pane label="机构资料认证审核" name="organ_certificate"></el-tab-pane>
        </el-tabs>
        <!-- 讲师认证资料审核组件 -->
        <teacher-certificate v-show="teacherVisible" ref="TeacherCertificate"></teacher-certificate>
        <!-- 机构认证资料审核组件 -->
        <organizaton-certificate v-show="organizatonVisible" ref="OrganizatonCertificate"></organizaton-certificate>
    </div>
</template>
<script>
import TeacherCertificate from './teacher-certificate-table'
import OrganizatonCertificate from './organization-certificate-table'
export default {
    components:{TeacherCertificate,OrganizatonCertificate},
    data(){
        return{
            teacherVisible:true,
            organizatonVisible:false,
            activeName:'teacher_certificate'
        }
    },
    methods:{
         handleClick(tab, event) {
            if('teacher_certificate' == tab.name){
                this.teacherVisible=true,
                this.organizatonVisible=false
            }else if('organ_certificate' == tab.name){
                this.teacherVisible=false,
                this.organizatonVisible=true
            }
         }
    }
}
</script>
<style scoped>
.card{
    margin-bottom: 40px;
    background: #fafafa;
    height:40px;
    border: none;
    font: 微软雅黑 bolder 16px;
}
</style>
