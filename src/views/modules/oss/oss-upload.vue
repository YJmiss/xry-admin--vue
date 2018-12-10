<template>
  <el-dialog
    title="上传文件"
    :close-on-click-modal="false"
    @close="closeHandle"
    :visible.sync="visible">
    <el-form :model="dataForm">
    <el-form-item label="选择文件"  prop="image">
    <el-upload :action="url" ref="upload" :before-upload="beforeUploadHandle" :on-success="successHandle" multiple :file-list="fileList">
    <el-button type="primary">选择文件</el-button>
    <div class="el-upload__tip" slot="tip">只支持jpg、png、gif/格式的图片！</div>
    </el-upload>
    </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
 import { treeDataTranslate} from '@/utils'
  export default {
    data () {
      return {
        visible: false,
        url: '',
        num: 0,
        successNum: 0,
        fileList: [],
        dataForm:{
        image: ''
        }
      }
    },
    methods: {
      init (id) {
        this.url = this.$http.adornUrl(`/sys/oss/upload?token=${this.$cookie.get('token')}`)
        this.visible = true
      },
      // 上传之前
      beforeUploadHandle (file) {
        if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
          this.$message.error('只支持jpg、png、gif格式的图片！')
          return false
        }
        this.num++
      },
      // 上传成功
      successHandle (response, file, fileList) {
        this.fileList = fileList
        this.successNum++
        this.dataForm.image = response.url
        this.showUploadImg(this.dataForm.image,response.url)
      },
      // 弹窗关闭时
      closeHandle () {
        this.fileList = []
        this.$emit('refreshDataList')
      },
      // 上传后预览图片
      showUploadImg (img, url) {
        this.$nextTick(() => {
          let upload_list_li = document.getElementsByClassName('el-upload-list')[0].children;
          for (let i = 0; i < upload_list_li.length; i++) {
              let li_a = upload_list_li[i].children[0];
              let imgElement = document.createElement("img");
              imgElement.setAttribute('src', img);
              imgElement.setAttribute('style', "max-width:50%;padding-left:25%");
              if (li_a.lastElementChild.nodeName !== 'IMG') {
                  li_a.appendChild(imgElement);
              }
          }
        })
      }
    }
  }
</script>
