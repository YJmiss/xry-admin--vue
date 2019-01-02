<template>
<el-dialog title="上传文件" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm">
        <el-form-item label="选择文件" prop="image">
            <el-upload :action="url" ref="upload" :before-upload="beforeUploadHandle" :on-success="successHandle" multiple :file-list="fileList">
                <el-button type="primary">选择文件</el-button>
                <div class="el-upload__tip" slot="tip">只支持jpg、png、gif/格式的图片！</div>
            </el-upload>
            <img v-if="dataForm.image" :src="dataForm.image">
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="closeHandle ()">确定</el-button>
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
            url: '',
            num: 0,
            successNum: 0,
            fileList: [],
            dataForm: {
              image: ''
            }
        }
    },
    methods: {
        init(id) {
            this.url = this.$http.adornUrl(`/sys/oss/upload?token=${this.$cookie.get('token')}`)
            this.visible = true
        },
        // 上传之前
        beforeUploadHandle(file) {
            if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
                this.$message.error('只支持jpg、png、gif格式的图片！')
                return false
            }
            this.num++
        },
        // 上传成功
        successHandle(response, file, fileList) {
            this.fileList = fileList
            this.successNum++
            this.dataForm.image = response.url
        }
    }
}
</script>
