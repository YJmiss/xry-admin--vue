<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="课程标题" prop="title">
        <el-input v-model="dataForm.title" type="text"placeholder="课程标题"></el-input>
      </el-form-item>
      <el-form-item label="所属类目" prop="parentName"> 
        <el-popover ref="courseCatListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseCatList" :props="courseCatListTreeProps" node-key="id" ref="courseCatListTree"
            @current-change="courseCatListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.parentName" v-popover:courseCatListPopover :readonly="true" placeholder="点击选择上级课程类目" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="所属讲师" prop="tid">
        <el-input v-model="dataForm.tid" placeholder="所属讲师"></el-input>
      </el-form-item>
      <el-form-item label="是否收费" size="mini" prop="property">
        <el-radio-group v-model="dataForm.property">
          <el-radio :label="1">收费</el-radio>
          <el-radio :label="2">免费</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="课程价格" prop="price">
        <el-input v-model="dataForm.price" type="text" placeholder="课程价格"></el-input>
      </el-form-item>
      <el-form-item label="课程图片" prop="image">
        <el-upload class="upload-demo" action="http://localhost:80" :limit='5' :auto-upload="false" :on-exceed='uploadOverrun' ref="upload" :on-change='changeUpload'
           :on-error="handlerError" :on-success="handlerSuccess">
          <el-button size="small" type="primary">选择图片</el-button>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>
<script>
  import $ from 'jquery'
  import { treeDataTranslate} from '@/utils'
  export default {
    data () {
      return {
        visible: false,
        fileList: [],
        dataForm: {
          id: 0,
          title: '',
          image: '',
          cid: 1,
          parentName: '',
          tid: 1,
          property: 1,
          status: 1,
          price: 0,
          file: ''
        },
        dataRule: {
          title: [
            { required: true, message: '请填写课程标题', trigger: 'blur' }
          ],
          parentName: [
            { required: true, message: '上级类目不能为空', trigger: 'change' }
          ],
          tid: [
            { required: true, message: '请选择所属讲师', trigger: 'blur' }
          ],
          property: [
            { required: true, message: '请设置课程属性', trigger: 'blur' }
          ],
          status: [
            { required: true, message: '请设置课程审核状态', trigger: 'blur' }
          ],
          price: [
            { required: true, message: '请填写课程价格', trigger: 'blur' }
          ]
        },
        courseCatList: [],
        courseCatListTreeProps: {
          label: 'name',
          children: 'children'
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        // 查询所有课程类目，构造成一棵树
        this.$http({
          url: this.$http.adornUrl('/xry/course/cat/treeCourseCat'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          this.courseCatList = treeDataTranslate(data.courseCatList, 'id')
        }).then(() => {
          this.visible = true
          this.$nextTick(() => {
            this.$refs['dataForm'].resetFields()
          })
        }).then(() => {
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/xry/course/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({ data }) => {
              if (data && data.code === 0) {
                this.dataForm.id = data.course.id
                this.dataForm.title = data.course.title
                this.dataForm.cid = data.course.cid
                this.dataForm.tid = data.course.tid
                this.dataForm.property = data.course.property
                this.dataForm.price = data.course.price
                this.dataForm.status = data.course.status
                this.dataForm.image = data.course.image
                this.courseCatListTreeSetCurrentNode()
              }
            })
          } else {
            // 新增
            this.courseCatListTreeSetCurrentNode()
          }
        })
      },
      // 课程类目树选中
      courseCatListTreeCurrentChangeHandle (data, node) {
        this.dataForm.cid = data.id
        this.dataForm.parentName = data.name
      },
      // 课程类目树设置当前选中节点
      courseCatListTreeSetCurrentNode () {
        this.$refs.courseCatListTree.setCurrentKey(this.dataForm.cid)
        this.dataForm.parentName = (this.$refs.courseCatListTree.getCurrentNode() || {})['name']
      },
      // 表单提交
      dataFormSubmit () {
        console.log(this.dataForm.id);
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/xry/course/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'title': this.dataForm.title,
                'image': this.dataForm.image,
                'cid': this.dataForm.cid,
                'tid': this.dataForm.tid,
                'property': this.dataForm.property,
                'price': this.dataForm.price,
                'status': this.dataForm.status
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
      // 上传图片后预览图片
      changeUpload: function(file, fileList) {
        this.fileList = fileList;
        this.$nextTick(() => {
          let upload_list_li = document.getElementsByClassName('el-upload-list')[0].children;
          for (let i = 0; i < upload_list_li.length; i++) {
            let li_a = upload_list_li[i].children[0];
            let imgElement = document.createElement("img");
            imgElement.setAttribute('src', fileList[i].url);
            imgElement.setAttribute('style', "max-width:50%;padding-left:25%");
            if (li_a.lastElementChild.nodeName !== 'IMG') {
                li_a.appendChild(imgElement);
            }
          }
        })
        this.uploadImg(this.fileList)
      },
      // 提交、上传图片到服务器
      uploadImg (event) {
        //阻止元素发生默认的行为
        //event.preventDefault();
        let formData = new FormData();
        formData.append("file", this.file);
        let config = {'Content-Type': 'multipart/form-data'}
        formData.append("config", this.config);
        console.log(formData)
        this.$http({
          url: this.$http.adornUrl(`/xry/course/upload/img`),
          method: 'post',
          data: this.$http.adornData(formData)
        }).then(({ data }) => {
          console.log(data)
				})
      },
      // 上传图片超出限制
      uploadOverrun: function() {
        this.$message({
            type: 'error',
            message: '上传文件个数超出限制!最多上传5张图片!'
        });
      },
      // 上传出错信息
      handlerError(err,file,fileList) {
        console.log(err);
      },
      // 上传成功信息
      handlerSuccess(response,file,fileList) {
        console.log(err);
      }
    }
  }
  
</script>
