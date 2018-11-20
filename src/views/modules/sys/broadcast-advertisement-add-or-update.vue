<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="广告类别">
        <template>
          <el-radio-group v-model="dataForm.category" @change="currentSel">
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
      <el-form-item label="广告图片" prop="pic">
        <!-- <huploadify ref="huploadify"></huploadify> -->
        <el-button id="" type="primary" round>广告图片</el-button>
        <div id="upload"></div>
      </el-form-item>
      <el-form-item label="内容描述" prop="titie_desc">
        <el-input type="textarea" :rows="6" placeholder="请输入内容描述" v-model="dataForm.titie_desc"></el-input>
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
