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
        <el-input v-model="dataForm.parentName" v-popover:courseCatListPopover :readonly="true" placeholder="点击选择课程类目" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="所属讲师" prop="teacherName">
        <el-popover ref="teacherListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="teacherList" :props="teacherListTreeProps" node-key="id" ref="teacherListTree" @current-change="teacherListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.teacherName" v-popover:teacherListPopover :readonly="true" placeholder="点击选择所属讲师" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="是否收费" size="mini" prop="property">
        <el-radio-group v-model="dataForm.property">
          <el-radio :label="1">收费</el-radio>
          <el-radio :label="2">免费</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="课程价格" prop="price">
        <el-input class="course-price" v-model="dataForm.price" type="text" placeholder="课程价格"></el-input>
        <p class="price-tip">单位：（元）</p>
      </el-form-item>
      <el-form-item label="课程图片" prop="image">
        <el-upload :action="url" ref="upload" :before-upload="beforeUploadHandle" :on-success="successHandle" multiple :file-list="fileList">
          <el-button type="primary" round>选择图片</el-button>
          <div class="el-upload__tip" slot="tip">只支持jpg、png、gif/格式的图片！</div>
        </el-upload>
        <img :src="url" v-model="dataForm.image" v-show="imageVisible">
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { treeDataTranslate} from '@/utils'
  export default {
    data () {
      return {
        imageVisible:false,
        dataForm: {
          id: 0,
          title: '',
          image: '',
          cid: 1,
          parentName: '',
          teacherName:'',
          nickname:'',
          tid:'',
          property: 1,
          status: 1,
          price: '',
          file: ''
        },
        url: '',
        num: 0,
        successNum: 0,
        fileList: [],
        dataListLoading: false,
        dataListSelections: [],
        visible: false,
        dataRule: {
          title: [{ required: true, message: '请填写课程标题', trigger: 'blur' }],
          parentName: [{ required: true, message: '上级类目不能为空', trigger: 'change' }],
          tid: [{ required: true, message: '请选择所属讲师', trigger: 'blur' }],
          property: [{ required: true, message: '请设置课程属性', trigger: 'blur' }],
          status: [{ required: true, message: '请设置课程审核状态', trigger: 'blur' }],
          price: [ { required: true, message: '请填写课程价格', trigger: 'blur' }],
          image: [{required: true, message: '请上传课程封面图', trigger: 'blur'}]
        },
        courseCatList: [],
        courseCatListTreeProps: {
          label: 'name',
          children: 'children'
        },
        teacherList: [],
        teacherListTreeProps: {
          label: 'realName',
          children: 'children'
        }
      }
    },
    methods: {
      init (id) {
        this.url = this.$http.adornUrl(`/sys/oss/uploadImg?token=${this.$cookie.get('token')}`)
        this.dataForm.id = id || 0
        // 查询所有课程类目，构造成一棵树
        this.$http({
          url: this.$http.adornUrl('/xry/course/cat/treeCourseCat'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          this.courseCatList = treeDataTranslate(data.courseCatList, 'id')
        }).then(() => {
          // 查询讲师列表，构造成一棵树
          this.$http({
            url: this.$http.adornUrl('/xry/teacher/treeTeacher'),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            this.teacherList = treeDataTranslate(data.teacherList, 'id')
          }).then(() => { 
            this.visible = true
            this.$nextTick(() => {
              // 重置form表单（清空form表单的内容）
              this.$refs['dataForm'].resetFields()
              // 清除el-upload上次操作数据
              this.$refs.upload.clearFiles()
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
                  this.teacherListTreeSetCurrentNode()
                  this.imageVisible = true
                }
              })
            } else {
              // 新增
              
            }
          })
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
      // 讲师树选中
      teacherListTreeCurrentChangeHandle (data, node) {
        this.dataForm.tid = data.id
        this.dataForm.teacherName = data.realName
      },
      // 讲师树设置当前选中节点
      teacherListTreeSetCurrentNode () {
        this.$refs.teacherListTree.setCurrentKey(this.dataForm.tid)
        this.dataForm.teacherName = (this.$refs.teacherListTree.getCurrentNode() || {})['realName']
      },
      // 表单提交
      dataFormSubmit () {
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
      // 上传之前
      beforeUploadHandle (file) {
        if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif'&& file.type !== 'video/mp4') {
          this.$message.error('只支持jpg、png、gif格式的图片！')
          return false
        }
        this.num++
      },
      // 课程封面图上传成功
      successHandle (response, file, fileList) {
        this.fileList = fileList
        this.successNum++
        this.dataForm.image = response.url
        this.showUploadImg(this.dataForm.image,response.url)
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
<style scoped>
  .load{ text-align: center;margin-top: 20px;padding:10px;font-size: 16px;border: none;}
  .course-price{width:700px}
  .price-tip{display:inline;color:red;padding-left:20px;}
</style>

