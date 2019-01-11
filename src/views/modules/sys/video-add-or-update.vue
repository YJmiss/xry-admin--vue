<template>
<el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
        <el-form-item label="上传视频" class="uploadVideo">
            <el-upload :action="url" ref="upload" :before-upload="beforeUploadHandle" :on-success="successHandle" :file-list="fileList">
                <el-button type="primary" round>选择视频</el-button>
                <div class="el-upload__tip" slot="tip">只支持mp4格式的视频！</div>
            </el-upload>
            <video @canplaythrough="getDuration()" id="video-active" v-show="dataForm.videoUrl" :src="dataForm.videoUrl" controls="true"/>
            <span style="padding-left:20px;color:#1f48cf;" v-show="dataForm.videoUrl">视频总时长：{{dataForm.videoTime}}</span>
        </el-form-item>
         <el-form-item label="所属课程">
        <el-select v-model="dataForm.courseId"  placeholder="请选择所属课程" popper-class="optionStyle" @change=" courseListTreeCurrentChangeHandle">
        <el-option
            v-for="item in courseList"
            :key="item.id"
            :label="item.title"
            :value="item.id"
            >
        </el-option>
        </el-select>
        <span class="red" v-if="dataForm.fee === 1" v-show="dataForm.courseId">付费课程</span>
        <span class="red" v-else-if="dataForm.fee === 2" v-show="dataForm.courseId">免费课程</span>
        </el-form-item>
          <el-form-item label="是否收费" size="mini" prop="property" v-show="dataForm.courseId">
            <el-radio-group v-model="dataForm.property">
                <el-radio :label="1" :disabled="dataForm.fee === 2">试学</el-radio>
                <el-radio :label="2" :disabled="dataForm.fee === 2">收费</el-radio>
                <el-radio :label="3" :disabled="dataForm.fee === 1">免费</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="所属目录">
        <span class="red" v-if="!dataForm.courseId">请先选择所属课程！</span>
        <el-select v-model="dataForm.catalogId"  placeholder="请选择所属目录" popper-class="optionStyle"  v-else>
        <el-option
            v-for="item in courseCatalogList"
            :key="item.id"
            :label="item.title"
            :value="item.id"
            >
        </el-option>
        </el-select>
        </el-form-item>
        <el-form-item label="视频标题" prop="title">
            <el-input v-model="dataForm.title" type="text" placeholder="视频标题"></el-input>
        </el-form-item>
         <el-form-item label="视频路径" prop="url">
            <el-input v-model="dataForm.videoUrl" type="text" placeholder="服务器返回的视频路径，用户不用输入" readonly="readonly"></el-input>
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
import {
    treeDataTranslate
} from '@/utils'
export default {
    data() {
        return {
            roleList: [],
            fileList: [],
            index: 0,
            url: '',
            visible: false,
            uplodProgress: 0,
            dataForm: {
                id: 0,
                title: '',
                videoUrl: '',
                videoTime: '',
                courseId: '',
                catalogId: '',
                property: 0,
                status: '',
                fee: ''
            },
            dataRule: {
                title: [{
                    required: true,
                    message: '请填写视频标题',
                    trigger: 'blur'
                }],
                courseId: [{
                    required: true,
                    message: '请选择视频所属课程',
                    trigger: 'blur'
                }],
                catalogId: [{
                    required: true,
                    message: '请选择视频所属目录',
                    trigger: 'blur'
                }],
                property: [{
                    required: true,
                    message: '请设置课程属性',
                    trigger: 'blur'
                }]
            },
            courseList: [],
            courseCatalogList: []
        }
    },
    methods: {
        init(id) {
            this.url = this.$http.adornUrl(`/sys/oss/uploadVideo?token=${this.$cookie.get('token')}`)
            this.dataForm.id = id || 0
            // 查询课程树
            this.$http({
                url: this.$http.adornUrl('/xry/course/treeCourse'),
                method: 'get',
                params: this.$http.adornParams()
            }).then(({
                data
            }) => {
                this.courseList = treeDataTranslate(data.courseList, 'id')
            }).then(() => {
           this.visible = true
            this.$nextTick(() => {
              // 重置form表单（清空form表单的内容）
              this.$refs['dataForm'].resetFields()
            })
            }).then(() => {
                if (this.dataForm.id) {
                   //可进行修改操作
                    this.$http({
                        url: this.$http.adornUrl(`/xry/video/info/${this.dataForm.id}`),
                        method: 'get',
                        params: this.$http.adornParams()
                    }).then(({
                        data
                    }) => {
                        this.visible = true
                        if (data && data.code === 0) {
                            this.dataForm.id = data.video.id
                            this.dataForm.title = data.video.title
                            this.dataForm.videoUrl = data.video.videoUrl
                            this.dataForm.courseId = data.video.courseId
                            this.dataForm.catalogId = data.video.catalogId
                            this.dataForm.property = data.video.property
                            this.dataForm.status = data.video.status
                            this.dataForm.videoTime = data.video.paramData
                        }
                    }) .then(() => {
                            // 查询目录树，需要根据选中课程的id查询出目录树
                            this.$http({
                                url: this.$http.adornUrl('/xry/course/catalog/treeCourseCatalog'),
                                method: 'get',
                                params: this.$http.adornParams({
                                    'courseId': this.dataForm.courseId,
                                })
                            }).then(({
                                data
                            }) => {
                                this.courseCatalogList = treeDataTranslate(data.courseCatalogList,'id') 
                            })
                            }) 
                } else {
                    //新增操作
                    this.dataForm.videoUrl = ''
                    this.dataForm.title = ''
                }
            })
        },
        // 课程树选中
        courseListTreeCurrentChangeHandle() {
            //判断课程是否付费
            for(let i=0;i<this.courseList.length;i++){
                if(this.dataForm.courseId == this.courseList[i].id){
                 this.dataForm.fee = this.courseList[i].property
                }
            }
            // 根据选中课程id查询出目录
            this.dataForm.catalogId =''
            this.$http({
                url: this.$http.adornUrl('/xry/course/catalog/treeCourseCatalog'),
                method: 'get',
                params: this.$http.adornParams({
                'courseId': this.dataForm.courseId,
                })
            }).then(({
                data
            }) => {
               this.courseCatalogList = treeDataTranslate(data.courseCatalogList,'id') 
            })
        },
        // 上传之前
        beforeUploadHandle(file) {
            if (file.type != "video/mp4" && file.type != "video/flv" || file.size > 1048576000) {
                this.$message.error("请检查视频格式（只支持mp4、flv格式的视频！大小超过1000M)");
                return false;
            }
            this.num++;
        },
        // 视频上传成功
        successHandle(response, file, fileList) {
            this.fileList = fileList;
            this.successNum++;
            this.dataForm.videoUrl = response.url;
        },
      //获取视频总时长
        getDuration(){
        setTimeout(() =>{
        this.dataForm.videoTime = document.getElementById('video-active').duration
            },100);
        },
        // 表单提交
        dataFormSubmit() {
            if (!this.dataForm.videoUrl && !this.dataForm.videoTime) {
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
                            'paramData':Math.ceil(this.dataForm.videoTime),
                        })
                    }).then(({
                        data
                    }) => {
                        if (data && data.code === 0) {
                          // 重置form表单（清空form表单的内容）
                           this.$refs["dataForm"].resetFields();
                            this.$message({
                                message: '操作成功',
                                type: 'success',
                                duration: 1500,
                                onClose: () => {
                                    this.visible = false
                                    this.$emit('refreshDataList')
                                    this.$refs["dataForm"].resetFields();
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
        submitConform() {
            if (this.dataForm.id) {
                this.$confirm(`如果进行修改操作，系统将重新提交平台审核，您确定要继续修改操作吗？`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.dataFormSubmit()
                })
            } else {
                this.dataFormSubmit()
            }
        }
    }
}
</script>

<style scoped>
video {
width: 830px;
}
.red {
    color: red;
}
#video-active{
max-height: 200px;
max-width:400px;
}
</style>
