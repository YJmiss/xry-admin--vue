<template>
  <el-dialog title="视频内容播放" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm"  ref="dataForm" label-width="80px">
     <!--  <video width="100%" id="video-play" controls="controls" :src="dataForm.videoUrl" type="video/mp4" ></video> -->
    <ali-player  :source="dataForm.videoUrl" :vid="dataForm.id" ref="player" @play="getDuration"></ali-player>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { treeDataTranslate } from '@/utils';
  import aliPlayer from "@/components/VueAliplayer.vue";
  import GitHubBadge from "vue-github-badge";
  export default {
    components:{aliPlayer,GitHubBadge},
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
     computed: {
      // 高度自适应
      height () {
        let width = document.documentElement.clientWidth
        return `${width / 1.7777778}px`
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
     
      },
      //获取总时长
      getDuration(){
      const player = this.$refs.player.instance;
      player && player.getDuration();
      console.log(player)
      }
    }
  }
</script>