<template>
<el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">

        <el-form-item label="课程" >
            <el-select class="course_input" v-model="dataForm.xcId"  placeholder="请选择线下支付课程" popper-class="optionStyle" @change="courseListTreeCurrentChangeHandle">
                <el-option v-for="item in courseList" :key="item.id" :label="item.title" :value="item.id"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="用户">
            <el-select class="user_input" v-model="dataForm.xuId"  placeholder="请选择线下支付用户" popper-class="optionStyle" @change="userListTreeCurrentChangeHandle">
                <el-option v-for="item in userList" :key="item.id" :label="item.phone" :value="item.id"></el-option>
            </el-select>
        </el-form-item>

        <el-form-item label="支付金额" prop="realPay" class="pay_input">
            <el-input v-model="dataForm.realPay" placeholder="请填写实际支付金额（单位：元）"></el-input>
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
import { isEmail, isMobile } from '@/utils/validate'
export default {
    data() {
        return {
            visible: false,
            userList: [],
            courseList: [],
            dataForm: {
                id: 0,
                realPay:'',
                xuId:'',
                xcId:'',
                suId:'',
                createTime:''
            },
            dataRule: {
                realPay: [{ required: true, message: '请填写实际金额', trigger: 'blur' }]
            }
        }
    },
    methods: {
        init(id) {
            this.dataForm.id = id || 0
            // 查询讲师列表，构造成一棵树
            this.$http({
                url: this.$http.adornUrl("/xry/user/treeUser"),
                method: "get",
                params: this.$http.adornParams()
            }).then(({ data }) => {
                this.userList = treeDataTranslate(data.userList, "id");
            }).then(() => {
                this.$http({
                    url: this.$http.adornUrl('/xry/course/treeCourse'),
                    method: 'get',
                    params: this.$http.adornParams()
                }).then(({ data }) => {
                    this.courseList = treeDataTranslate(data.courseList, 'id')
                })
            }).then(() => {
                this.visible = true
                this.$nextTick(() => {
                    this.$refs['dataForm'].resetFields()
                })
            }).then(() => {
                if (this.dataForm.id) {
                    this.$http({
                        url: this.$http.adornUrl(`/xry/payOffline/info/${this.dataForm.id}`),
                        method: 'get',
                        params: this.$http.adornParams()
                    }).then(({ data }) => {
                        if (data && data.code === 0) {
                            this.dataForm.id = data.xryPayOffline.id
                            this.dataForm.xuId = data.xryPayOffline.xuId
                            this.dataForm.xcId = data.xryPayOffline.xcId
                            this.dataForm.suId = data.xryPayOffline.suId
                            this.dataForm.realPay = data.xryPayOffline.realPay
                            this.dataForm.createTime = data.xryPayOffline.createTime
                        }
                    })
                }
            })
        },
        // 课程树选中
        courseListTreeCurrentChangeHandle(data, node) {
            this.dataForm.xcId = data;
        },
        // 用户树选中
        userListTreeCurrentChangeHandle(data, node) {
            this.dataForm.xuId = data;
        },
        // 表单提交
        dataFormSubmit() {
            this.$refs['dataForm'].validate((valid) => {
                if (valid) {
                    this.$http({
                        url: this.$http.adornUrl(`/xry/payOffline/${!this.dataForm.id ? 'save' : 'update'}`),
                        method: 'post',
                        data: this.$http.adornData({
                            'id': this.dataForm.id || undefined,
                            'xuId': this.dataForm.xuId,
                            'xcId': this.dataForm.xcId,
                            'suId': this.dataForm.suId,
                            'realPay': this.dataForm.realPay,
                            'createTime': this.dataForm.createTime
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

<style>
    .course_input{
        width: 800px;
    }
    .user_input{
        width: 240px;
    }
    .pay_input{
        width: 320px;
    }
</style>
