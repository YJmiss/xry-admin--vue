<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible" @close='closeDialog'>
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="视频标题" prop="title">
        <el-input v-model="dataForm.title" type="text" placeholder="视频标题"></el-input>
      </el-form-item>
      <el-form-item label="所属课程" prop="courseName"> 
        <el-popover ref="courseListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseList" :props="courseListTreeProps" node-key="id" ref="courseListTree"
            @current-change="courseListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.courseName" v-popover:courseListPopover :readonly="true" placeholder="点击选择所属课程" class="cat-list__input"></el-input>
         <span class="red" v-show="dataForm.fee === 1">付费课程</span>
         <span class="red" v-show="dataForm.fee === 2">免费课程</span>
      </el-form-item>
      <el-form-item label="所属目录" prop="catalogName"> 
        <el-popover ref="courseCatalogListPopover" placement="bottom-start" trigger="click">
          <el-tree v-show="contentVisible" :data="courseCatalogList" :props="courseCatalogListTreeProps" node-key="id" ref="courseCatalogListTree"
            @current-change="courseCatalogListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
         <span class="red" v-show="msgShow">请先选择课程！</span>
        </el-popover>
        <el-input v-model="dataForm.catalogName" v-popover:courseCatalogListPopover  placeholder="点击选择所属目录" class="cat-list__input" @focus="catalogueFocus()"></el-input>
      </el-form-item>
      <el-form-item label="是否收费" size="mini" prop="property">
        <el-radio-group v-model="dataForm.property">
          <el-radio :label="1" :disabled="dataForm.fee === 2">试学</el-radio>
          <el-radio :label="2" :disabled="dataForm.fee === 2">收费</el-radio>
          <el-radio :label="3" :disabled="dataForm.fee === 1">免费</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="视频路径" prop="url">
        <el-input v-model="dataForm.videoUrl" type="text" placeholder="视频路径" readonly="readonly"></el-input>
      </el-form-item>
       <el-form-item label="视频时长">
        <el-input v-model="dataForm.videoTime" type="text" placeholder="视频时长" readonly="readonly"></el-input>
      </el-form-item>
    <el-form-item label="上传视频" class="uploadVideo">
      <el-upload :action="url" ref="upload" :before-upload="beforeUploadHandle" :limit='1' :on-exceed='uploadOverrun' :on-success="successHandle" :file-list="fileList">
          <el-button type="primary" round>选择视频</el-button>
          <div class="el-upload__tip" slot="tip">只支持mp4格式的视频！</div>
      </el-upload>
    </el-form-item>
     </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submitConform()">确定</el-button>
    </span>
  </el-dialog>
</template>
<script>
  import $ from 'jquery'
  import { treeDataTranslate } from '@/utils'
  export default {
    components: {UE},
    data () {
      return {
        contentVisible:true,
        msgShow:false,
        roleList: [],
        fileList:[],
        index:0,
        url: '',
        visible:false,
        uplodProgress:0,
        dataForm: {
          id: 0,
          title: '',
          videoUrl: '',
          videoTime:'',
          courseId: '',
          catalogId: '',
          property: 0,
          status: '',
          paramData: '',
          courseName: '',
          catalogName: '',
          fee:''
        },
        dataRule: {
          title: [
          { required: true, message: '请填写视频标题', trigger: 'blur' }
          ],
          courseName: [
            { required: true, message: '请选择视频所属课程', trigger: 'blur' }
          ],
          catalogName: [
            { required: true, message: '请选择视频所属目录', trigger: 'blur' }
          ],
          property: [
            { required: true, message: '请设置课程属性', trigger: 'blur' }
          ]
        },
        courseList: [],
        courseCatalogList: [],
        courseListTreeProps: {
          label: 'title',
          children: 'children'
        },
        courseCatalogListTreeProps: {
          label: 'title',
          children: 'children'
        }
      }
    },
    methods: {
      init (id) {
        this.url = this.$http.adornUrl(`/sys/oss/uploadVideo?token=${this.$cookie.get('token')}`)
        this.dataForm.id = id || 0
        // 查询课程树
        this.$http({
          url: this.$http.adornUrl('/xry/course/treeCourse'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
        this.courseList = treeDataTranslate(data.courseList, 'this.dataForm.courseId')
        }).then(() => {
          this.visible = true;
              this.$nextTick(() => {
                // 重置form表单（清空form表单的内容）
                this.$refs["dataForm"].resetFields();
              });
        }).then(() => {
          if(this.dataForm.id){
           this.$http({
              url: this.$http.adornUrl(`/xry/video/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({ data }) => {
              this.visible = true
              if (data && data.code === 0){
                this.dataForm.id = data.video.id
                this.dataForm.title = data.video.title
                this.dataForm.videoUrl = data.video.videoUrl
                this.dataForm.courseId = data.video.courseId
                this.dataForm.catalogId = data.video.catalogId
                this.dataForm.property = data.video.property
                this.dataForm.status = data.video.status
                this.dataForm.videoTime = data.video.paramData
                this.courseListTreeSetCurrentNode()
                this.courseCatalogListTreeSetCurrentNode()
                this.showUploadVideo2(this.dataForm.videoUrl)
              }
            }).then(() => {
                //查询目录树
                this.$http({
                url: this.$http.adornUrl('/xry/course/catalog/treeCourseCatalog'),
                method:'get',
                params: this.$http.adornParams({
                'courseId':this.dataForm.courseId,
                })
                }).then(({data}) =>{
                this.courseCatalogList = treeDataTranslate(data.courseCatalogList, 'id') 
                for(let i=0;i<data.courseCatalogList.length;i++){
                    if(this.dataForm.catalogId == data.courseCatalogList[i].id){
                     this.dataForm.catalogName = data.courseCatalogList[i].title
                    }
                   }
                })
                })
              }else{
                 this.dataForm.videoUrl = ''
                 this.dataForm.videoTime =''
                 
              }
        })
      },
      // 课程树选中
      courseListTreeCurrentChangeHandle (data, node) {
        this.dataForm.courseId = data.id
        this.dataForm.courseName = data.title
        this.dataForm.fee = data.property
        // 查询目录树，需要根据选中课程的id查询出目录树
        this.$http({
          url: this.$http.adornUrl('/xry/course/catalog/treeCourseCatalog'),
          method: 'get',
          params: this.$http.adornParams({
            'courseId':this.dataForm.courseId,
          })
        }).then(({ data }) => {
          this.courseCatalogList = treeDataTranslate(data.courseCatalogList, 'id')
        })
      },
      // 课程树设置当前选中节点
      courseListTreeSetCurrentNode () {
        this.$refs.courseListTree.setCurrentKey(this.dataForm.courseId)
        this.dataForm.courseName = (this.$refs.courseListTree.getCurrentNode() || {})['title']
      },
      // 课程目录树选中
      courseCatalogListTreeCurrentChangeHandle (data, node) {
        this.dataForm.catalogId = data.id
        this.dataForm.catalogName = data.title
      },
      // 课程目录树设置当前选中节点
      courseCatalogListTreeSetCurrentNode () {
        this.$refs.courseCatalogListTree.setCurrentKey(this.dataForm.catalogId)
        this.dataForm.catalogName = (this.$refs.courseCatalogListTree.getCurrentNode() || {})['title']
      },
      //目录输入框获取焦点
      catalogueFocus(){
       if(this.dataForm.courseName){
         this.contentVisible = true
         this.msgShow =false
       }else{
         this.contentVisible = false
         this.msgShow = true
       }
      },
        // 上传之前
    beforeUploadHandle(file) {
     if (file.type != "video/mp4" || file.size > 1048576000) {
        this.$message.error("请检查视频格式（只支持mp4格式的视频！大小超过1000M)");
        return false;
      } 
      this.num++;
    },
    // 视频上传成功
    successHandle(response, file, fileList) {
      this.fileList = fileList;
      this.successNum++;
      this.dataForm.videoUrl = response.url;
      this.dataForm.videoTime = response.paramData;
      this.showUploadVideo(this.dataForm.videoUrl);
    },
    // 视频上传预览
    showUploadVideo(videoUrl) {
      this.$nextTick(() => {
        let videoControl = document.getElementsByClassName("el-upload-list")[0].children;
          for (let i = 0; i < videoControl.length; i++) {
          let li_a = videoControl[i].children[0];
          let videoUrlElement = document.createElement("video");
          videoUrlElement.setAttribute("src",videoUrl);
          videoUrlElement.setAttribute('controls',true);
          videoUrlElement.setAttribute("style", "max-width:60%;padding-left:25%");
         if (li_a.lastElementChild.nodeName !== "MP4"){
            li_a.appendChild(videoUrlElement);
          } 
        }
      });
    },
    //修改视频显示
     showUploadVideo2(videoUrl) {
        let videoload = document.getElementsByClassName('uploadVideo');
        let ul_tag = document.createElement("ul");
        ul_tag.setAttribute("class", "el-upload-list__item is-success");
        let videoUrlElement = document.createElement("video");
        videoUrlElement.setAttribute("src",videoUrl);
        videoUrlElement.setAttribute('controls',true);
        videoUrlElement.setAttribute("style", "max-width:60%;padding-left:25%");
        ul_tag.appendChild(videoUrlElement)
        let del_icon = document.createElement("i");
        del_icon.setAttribute("class", "el-icon-close");
        del_icon.setAttribute("style", "position:absolute;top:4px;right:4px;");
        ul_tag.appendChild(del_icon);
        videoload[0].appendChild(ul_tag);
        del_icon.addEventListener("click",function(){
        ul_tag.setAttribute('style',"display:none")
      })
    },
    uploadOverrun() {
      this.$message({
        type: "error",
        message: "上传文件个数超出限制!只能上传1个视频!"
      });
    },
    closeDialog() {
    let upload_list = document.getElementsByClassName("el-upload-list__item");
    upload_list[0].remove();
    },
      // 表单提交
      dataFormSubmit () {
         if (!this.dataForm.videoUrl){
          this.$confirm(`请上传视频再次提交`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            return; 
          })
          }
           this.$refs['dataForm'].validate((valid) => {
            if (valid) {
              this.$http({
                url: this.$http.adornUrl(`/xry/video/${!this.dataForm.id ? 'save' : 'update'}`),
                method: 'post',
                data: this.$http.adornData({
                  'id': this.dataForm.id || undefined,
                  'title': this.dataForm.title,
                  'videoUrl': this.dataForm.videoUrl,
                  'courseId': this.dataForm.courseId,
                  'catalogId': this.dataForm.catalogId,
                  'property': this.dataForm.property,
                  'status': this.dataForm.status,
                  'paramData': this.dataForm.videoTime
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
      },
      //表单提交确认
      submitConform(){
      if (this.dataForm.id) {
      this.$confirm(`如果进行修改操作，系统将重新提交平台审核，您确定要继续修改操作吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
      this.dataFormSubmit()
      })
     }else{
     this.dataFormSubmit()  
      }
      }
    }
  }
</script>
<style scoped>
.red{
  color: red; 
 }
</style>
