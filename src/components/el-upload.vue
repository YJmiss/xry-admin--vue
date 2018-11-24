<template>
<uploader id="UPLOAD" :options="options" :file-status-text="statusText" class="uploader-example" ref="uploader" @file-complete="fileComplete" @complete="complete"></uploader>
</template>
<script>
export default {
  name: 'UPLOAD',
   options: {
          target: '//localhost:3000/upload', // '//jsonplaceholder.typicode.com/posts/',
          testChunks: false
        },
        attrs: {
          accept: 'image/*'
        },
        statusText: {
          success: '成功了',
          error: '出错了',
          uploading: '上传中',
          paused: '暂停中',
          waiting: '等待中'
        },
      methods: {
      complete () {
        console.log('complete', arguments)
      },
      fileComplete () {
        console.log('file complete', arguments)
      }
    },
   mounted () {
      this.$nextTick(() => {
        window.uploader = this.$refs.uploader.uploader
      })
    }    
}
</script>
<style>
  .uploader-example {
    width: 800px;
    padding: 15px;
    margin: 40px auto 0;
    font-size: 14px;
    height: 250px;
  }
  .uploader-example .uploader-btn {
    margin-right: 20%px;
  }
  .uploader-example .uploader-list {
    max-height: 440px;
    overflow: auto;
    overflow-x: hidden;
    overflow-y: auto;
  }
</style>