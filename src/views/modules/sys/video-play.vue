<template>
  <el-dialog :title="!dataForm.id ? '新增' : '视频内容审核'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-vedio id="vedio1" controls=" controls"  src="http://www.ynyuanli.com/img/oceans.mp4" type="video/mp4" > 
    </el-vedio>
    </el-form>
     <element id="el-vedio"/>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { treeDataTranslate } from '@/utils'
  export default {
    data () {
      return {
        visible: false,
        dataForm: {
          id: 0,
          videoUrl: '',
        },
        dataRule: { 
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        if (!this.dataForm.id) {
          // 新增
        } else {
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
        } 
      },
      // 隐藏视频播放弹框
      dataFormSubmit () {
        this.visible = false
      }
    }
  }
</script>
<style scoped>
#vedio{
  width: 400px;
  height: 300px;
  margin:auto;
}
</style>
