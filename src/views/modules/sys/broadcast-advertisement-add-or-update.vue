<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="广告类别">
        <template>
          <el-radio-group v-model="dataForm.category">
            <el-radio :label="1">首页轮播</el-radio>
            <el-radio :label="2">首页中部广告</el-radio>
            <el-radio :label="3">分类页广告</el-radio>
          </el-radio-group>
        </template>
      </el-form-item>
      <el-form-item label="内容标题" prop="title">
        <el-input v-model="dataForm.title" type="text"placeholder="内容标题"></el-input>
      </el-form-item>
      <el-form-item label="跳转链接" prop="url">
        <el-input v-model="dataForm.url" type="text" placeholder="跳转链接"></el-input>
      </el-form-item>
       <el-form-item label="内容描述" prop="titie_desc">
        <el-input type="textarea" :rows="6" placeholder="请输入内容描述" v-model="dataForm.titie_desc"></el-input>
      </el-form-item>
      <el-form-item label="广告图片" prop="pic">
       <el-upload class="load"
      drag
      :action="url"
      :before-upload="beforeUploadHandle"
      :on-success="successHandle"
      multiple
      :file-list="fileList"
      >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div class="el-upload__tip" slot="tip">只支持jpg、png、gif格式的图片！</div>
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
  import UE from "@/components/ue/ue.vue";
  import { treeDataTranslate} from '@/utils'
  export default {
    components: { UE },
    data () {
      return {
        visible: false,
        fileList: [],
        dataForm: {
          id: 0,
          title: '',
          category: 1,
          title_desc: '',
          url: '',
          pic: '',
        },
          visible: false,
        url: '',
        num: 0,
        successNum: 0,
        fileList: [],
        dataRule: {
          category: [
            { required: true, message: '请选择广告类别', trigger: 'blur' }
          ],
          title: [
            { required: true, message: '请填写广告标题', trigger: 'blur' }
          ],
          url: [
            { required: true, message: '请填写跳转链接', trigger: 'blur' }
          ]
        },
        defaultMsg: "",
        config: {
          initialFrameWidth: null,
          initialFrameHeight: 350
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.visible = true
         this.url = this.$http.adornUrl(`/sys/oss/upload?token=${this.$cookie.get('token')}`)
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/xry/content/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.id = data.content.id
              this.dataForm.category = data.content.category
              this.dataForm.title = data.content.title
              this.dataForm.title_desc = data.content.title_desc
              this.dataForm.url = data.content.url
              this.dataForm.pic = data.content.pic
              this.dataForm.pic2 = data.content.pic2
            }
          })
        } else {
          // 新增
        }
      },
       // 上传之前
      beforeUploadHandle (file) {
        if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
          this.$message.error('只支持jpg、png、gif格式的图片！')
          return false
        }
        this.num++
      },
       // 上传成功
      successHandle (response, file, fileList) {
        this.fileList = fileList
        this.successNum++
        if (response && response.code === 0) {
          if (this.num === this.successNum) {
            this.$confirm('操作成功, 是否继续操作?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).catch(() => {
              this.visible = false
            })
          }
        } else {
          this.$message.error(response.msg)
        }
      },
      // 表单提交
      dataFormSubmit () {
        console.log(this.dataForm.id);
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/xry/content/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'title': this.dataForm.title,
                'category': this.dataForm.category,
                'title_desc': this.dataForm.title_desc,
                'url': this.dataForm.url,
                'pic': this.dataForm.pic,
                'pic2': this.dataForm.pic2
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
      }
    }
  }
</script>
<style scoped>
.load{
text-align: center;
border: solid 1px #f0f0f0;
margin-top: 20px;
padding:10px;
font-size: 16px;
}
</style>