<template>
<el-dialog :visible.sync="visible" :close-on-click-modal="false" :rules="dataRule">
    <el-form :inline="true" :model="dataForm" ref="dataForm" @keyup.enter.native="dataFormSubmit()">
        <p v-if="dataForm.orgName">所属机构名称：{{dataForm.orgName}}</p>
        <div v-else>
            是否添加所属机构：
            <el-radio-group v-model="radio" @change="selectHandle(radio)">
                <el-radio :label="1">否</el-radio>
                <el-radio :label="2">是</el-radio>
            </el-radio-group>
        </div>
        <el-form-item label="所属机构名称：" v-show="radio == 2">
            <el-select v-model="dataForm.orgName" clearable placeholder="请选择所属机构" @change="currentChangeHandle">
                <el-option v-for="item in organizationList" :key="item.id" :label="item.org_name" :value="item.id">
                </el-option>
            </el-select>
        </el-form-item><br>
        <el-form-item label="身份证号：">
            <el-input v-model="dataForm.id_card" type="text"></el-input>
        </el-form-item><br>
        <el-form-item label="身份证正面照：">
            <el-upload :action="url" ref="upload" :before-upload="beforeUploadHandle" :on-success="successFrontHandle" :file-list="frontFileList">
                <el-button type="primary" round>身份证正面照</el-button>
                <div class="el-upload__tip" slot="tip">只支持jpg、png、gif/格式的图片！</div>
            </el-upload>
            <img v-show="dataForm.id_card_front" :src="dataForm.id_card_front">
        </el-form-item>
        <el-form-item label="身份证反面照：">
            <el-upload :action="url" ref="upload" :before-upload="beforeUploadHandle" :on-success="successBackHandle" :file-list="backFileList">
                <el-button type="primary" round>身份证反面照</el-button>
                <div class="el-upload__tip" slot="tip">只支持jpg、png、gif/格式的图片！</div>
            </el-upload>
            <img v-show="dataForm.id_card_back" :src="dataForm.id_card_back">
        </el-form-item>
        <p v-if="dataForm.teacherIntro">讲师简介：{{dataForm.teacherIntro}}</p>
        <el-form-item v-else label="讲师简介：">
            <el-input type="textarea" minlength="10" resize="vertical" rows="5"></el-input>
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    <el-button @click="visible = false">取消</el-button>
    <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
  </span>
</el-dialog>
</template>

<script>
import {
    treeDataTranslate
} from '@/utils'
export default {
    data() {
        return {
            visible: false,
            radio: 1,
            dataForm: {
                orgName: '',
                organizationId: '',
                teacherId: '',
                id_card: '',
                id_card_front: '',
                id_card_back: '',
                teacherIntro: ''
            },
            url: "",
            frontSuccessNum: 0,
            backSuccessNum: 0,
            frontFileList: [],
            backFileList: [],
            organizationList: [],
            dataRule: {
                orgName: [{
                    required: true,
                    message: '请选择所属机构',
                    trigger: 'blur'
                }],
                id_card: [{
                    required: true,
                    message: '请填写身份号',
                    trigger: 'blur'
                }]
            }
        }

    },
    methods: {
        //是否添加所属机构处理
        selectHandle(radio) {
            if (2 == radio) {
                this.getOrganizationList()
            }
        },
        //获取机构列表
        getOrganizationList() {
            this.$http({
                url: this.$http.adornUrl('/xry/organization/list'),
                method: 'get',
                params: this.$http.adornParams()
            }).then(({
                data
            }) => {
                if (data && data.code === 0) {
                    this.organizationList = data.page.list
                }
            })
        },
        // 获取可能已经存在的数据
        init(id) {
            this.visible = true
            this.url = this.$http.adornUrl(`/sys/oss/upload?token=${this.$cookie.get("token")}`);
            this.dataForm.teacherId = id
            this.$nextTick(() => {
                this.$refs['dataForm'].resetFields()
                this.$http({
                    url: this.$http.adornUrl('/xry/teacher/detail'),
                    method: 'get',
                    params: this.$http.adornParams({
                        'id': this.dataForm.teacherId
                    })
                }).then(({
                    data
                }) => {
                    if (data && data.code === 0) {
                        this.dataForm.organizationId = data.teacher.org_id,
                            this.dataForm.id_card = data.teacher.id_card,
                            this.dataForm.id_card_front = data.teacher.id_card_front,
                            this.dataForm.id_card_back = data.teacher.id_card_back,
                            this.dataForm.teacherIntro = data.teacher.brief_intro
                    }
                })
            });
        },
        //机构选中处理
        currentChangeHandle(selVal) {
            this.dataForm.organizationId = selVal;
        },
        //提交表单
        dataFormSubmit() {
            this.$refs['dataForm'].validate((valid) => {
                if (valid) {
                    this.$http({
                        url: this.$http.adornUrl(`/xry/teacher/${!this.dataForm.id ? 'addTeacherInfo' : 'addTeacherInfo'}`),
                        method: 'post',
                        data: this.$http.adornData({
                            'id': this.dataForm.teacherId || undefined,
                            'idCard': this.dataForm.id_card,
                            'idCardFront': this.dataForm.id_card_front,
                            'idCardBack': this.dataForm.id_card_back,
                            'orgId': this.dataForm.organizationId
                        })
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
                }
            })
        },
        // 上传之前
        beforeUploadHandle(file) {
            if (
                file.type !== "image/jpg" && file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/gif"
            ) {
                this.$message.error("只支持jpg、png、gif格式的图片！");
                return false;
            }
            this.num++;
        },
        successFrontHandle(response, file, frontFileList) {
            this.frontFileList = frontFileList;
            this.frontSuccessNum++;
            this.dataForm.id_card_front = response.url;
        },
        successBackHandle(response, file, backFileList) {
            this.backFileList = backFileList;
            this.backSuccessNum++;
            this.dataForm.id_card_back = response.url;
        }
    }
}
</script>

<style scoped>
    img{width:500px;height:250px;}
</style>
