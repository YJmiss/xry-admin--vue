<template>
  <el-dialog title="视频内容播放" :close-on-click-modal="false" :visible.sync="visible" @close='dataFormSubmit'>
    <el-form :model="dataForm"  ref="dataForm" label-width="80px">
    <ali-player  :source="dataForm.videoUrl" :vid="dataForm.id + ''" ref="player" :autoplay="true" ></ali-player>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()" v-if="isAuth('xry:record:getDuration')">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { treeDataTranslate } from '@/utils';
  import aliPlayer from "@/components/VueAliplayer.vue";
  export default {
    components:{aliPlayer},
    data () {
      return {
        visible: false,
        playAuth: '',
        player: null,
        source:'',
        dataForm: {
          id:'',
          videoUrl: '',
          videoTime:''
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id.toString() 
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
      // 获取视频时长并提交后台
      dataFormSubmit () {
        this.getDuration()
        if(this.dataForm.videoTime){
         this.$http({
          url: this.$http.adornUrl('/xry/record/getDuration'),
          method: 'get',
          params: this.$http.adornParams({
            'videoId': this.dataForm.id,
            'videoTime':Math.ceil(this.dataForm.videoTime),
          })
         }).then(({ data }) => {
            if (data && data.code === 0) {
              this.visible = false
            } else {
            this.$message.error(data.msg)
            }
           })
         }
        else{
        this.$message.warning('离开前请先看视频，以审核视频内容是否合格！')  
       }
      },
      //获取总时长
      getDuration(){
      const player = this.$refs.player.instance;
      this.dataForm.videoTime = player.getDuration();
      }
    }
  }
</script>