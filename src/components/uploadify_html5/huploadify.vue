<template>
  <el-button id="upload" type="primary" @click="uploadImg" round>选择图片</el-button>
</template>
<script>
  import $ from 'jquery'
  export default {
    name: 'Huploadify',
    data () {
      return {
        
      }
    },
    methods: {
      // 文件上传时间绑定
      uploadImg () {
        $(function(){
          $('#upload').Huploadify({
            auto:false,
            fileTypeExts:'*.jpg;*.jpeg;*.png;*.gif',
            multi:true,
            formData:{pid:'portal',token:'portal',filedesc:''},
            fileSizeLimit:9999,
            showUploadedPercent:true,//是否实时显示上传的百分比，如20%
            showUploadedSize:true,
            removeTimeout:9999999,
            uploader : 'http://103.47.82.246:9000/edusoho-vedio-server/UploadImageFileServlet',
            deleFileUrl:'http://103.47.82.246:9000/edusoho-vedio-server/DeleteImageFileServlet',
            onUploadStart:function(){
              //alert('开始上传');
            },
            onInit:function(){
              //alert('初始化');
            },
            onUploadComplete:function(){
              //alert('上传完成');
            },
            onUploadSuccess: function(file, data, response) {
              //上传成功data返回的数据格式为[{"fileWebPath":"/2018/11/16/20181116224750959-69T2GQI8MQ9W.mp4"}]
              alert(data);
            },
            onCancel:function(file){
              //此处请勿填写内容
              //删除成功返回{"msg":"delete successed.","success":"true"}
              console.log('删除的文件：'+file);
              console.log(file);
            }
          });
        })
      }
    }
  }
</script>