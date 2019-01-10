<template>
  <el-dialog title="视频内容播放" :close-on-click-modal="false" :visible.sync="visible" @close='dataFormSubmit'>
    <el-form :model="dataForm"  ref="dataForm" label-width="80px">
    <video id="video-active" :src="dataForm.videoUrl" controls='true' width="90%" height="70%"  style=" margin-left:5%;">
    </video>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()" >确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { treeDataTranslate } from '@/utils';
  export default {
    data () {
      return {
        visible: false,
        dataForm: {
          id:'',
          videoUrl: ''
        }
      }
    },
    methods: {
      init (id) {
         this.dataForm.id = id
          this.$http({
            url: this.$http.adornUrl(`/xry/video/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
             this.visible = true
             if (data && data.code === 0) {
             this.dataForm.id = data.video.id
             this.dataForm.videoUrl = data.video.videoUrl 
            }
          })
      },
      dataFormSubmit(){
      this.visible = false
      }
    }
  }
</script>