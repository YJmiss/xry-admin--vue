<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" label-width="80px">
      <el-form-item label="文章分类" prop="parentName"> 
        <el-popover ref="courseCatListPopover" placement="bottom-start" trigger="click">
          <el-tree :data="courseCatList" :props="courseCatListTreeProps" node-key="id" ref="courseCatListTree" @current-change="courseCatListTreeCurrentChangeHandle" :default-expand-all="true"
            :highlight-current="true" :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.parentName" v-popover:courseCatListPopover :readonly="true" placeholder="点击选择文章分类" class="cat-list__input"></el-input>
      </el-form-item>
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="dataForm.title" type="text"placeholder="文章标题"></el-input>
      </el-form-item>
      <el-form-item label="文章来源" prop="source">
        <el-input v-model="dataForm.source" type="text" placeholder="文章来源" :disabled="true"></el-input>
      </el-form-item>
      <el-form-item label="文章图片" prop="coverImg">
        <el-upload :action="url" ref="upload" :before-upload="beforeUploadHandle" :on-success="successHandle" multiple :file-list="fileList">
          <el-button type="primary" round>选择图片</el-button>
          <div class="el-upload__tip" slot="tip">只支持jpg、png、gif/格式的图片！</div>
        </el-upload>
      </el-form-item>
      <el-form-item label="文章详情">
        <editor :uploadUrl="uploadUrl" v-model="dataForm.detail"></editor>
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
  import Editor from '@/components/quill-editor.vue'
  export default {
    components: {Editor},
    data () {
      return {
        dataForm: {
          id: 0,
          type:'',
          title: '',
          coverImg: '',
          source:'学而用',
          parentName: '',
          detail:''
        },
        url: '',
        num: 0,
        successNum: 0,
        fileList: [],
        dataListLoading: false,
        dataListSelections: [],
        visible: false,
        dataRule: {
          title: [{ required: true, message: '请填写文章标题', trigger: 'blur' }],
          parentName: [{ required: true, message: '文章分类不能为空', trigger: 'change' }],
          coverImg: [{required: true, message: '请上传文章封面图', trigger: 'blur'}]
        },
        courseCatList: [],
        courseCatListTreeProps: {
          label: 'name',
          children: 'children'
        },
        //测试上传图片的接口，返回结构为{url:''}
        uploadUrl: this.$http.adornUrl(`/sys/oss/uploadImg?token=${this.$cookie.get('token')}`)
      }
    },
    methods: {
      init (id) {
        this.url = this.$http.adornUrl(`/sys/oss/uploadImg?token=${this.$cookie.get('token')}`)
        this.dataForm.id = id || 0
        // 查询所有文章分类，构造成一棵树
        this.$http({
          url: this.$http.adornUrl('/xry/course/cat/treeCourseCat'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          this.courseCatList = treeDataTranslate(data.courseCatList, 'id')
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
              url: this.$http.adornUrl(`/xry/article/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({ data }) => {
              if (data && data.code === 0) {
                this.dataForm.id = data.article.id
                this.dataForm.type = data.article.type
                this.dataForm.title = data.article.title
                this.dataForm.coverImg = data.article.coverImg
                this.dataForm.detail = data.article.detail
                this.courseCatListTreeSetCurrentNode()
              }
            })
          } else {
            // 新增
          }
        })
      },
      // 文章分类树选中
      courseCatListTreeCurrentChangeHandle (data, node) {
        this.dataForm.type = data.id
        this.dataForm.parentName = data.name
      },
      // 文章分类树设置当前选中节点
      courseCatListTreeSetCurrentNode () {
        this.$refs.courseCatListTree.setCurrentKey(this.dataForm.type)
        this.dataForm.parentName = (this.$refs.courseCatListTree.getCurrentNode() || {})['name']
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/xry/article/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'type': this.dataForm.type,
                'title': this.dataForm.title,
                'coverImg': this.dataForm.coverImg,
                'detail': this.dataForm.detail,
                'source': this.dataForm.source
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
      // 文章封面图上传成功
      successHandle (response, file, fileList) {
        this.fileList = fileList
        this.successNum++
        this.dataForm.coverImg = response.url
        this.showUploadImg(this.dataForm.coverImg,response.url)
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
      },
    }
  }
</script>
<style scoped>
  .load{ text-align: center;margin-top: 20px;padding:10px;font-size: 16px;border: none;}
</style>

