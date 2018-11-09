<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="账号" prop="usercode">
        <el-input v-model="dataForm.usercode" type="text"placeholder="账号"></el-input>
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="dataForm.nickname" type="text" placeholder="昵称"></el-input>
      </el-form-item>
      <el-form-item label="password" prop="password"> 
        <el-input v-model="dataForm.password" type="cid" placeholder="所属课程"></el-input>
      </el-form-item>
      <el-form-item label="个人简介" prop="intro">
        <el-input v-model="dataForm.intro" placeholder="个人简介"></el-input>
      </el-form-item>
      <el-form-item label="头像图片" prop="avatar">
        <el-input v-model="dataForm.avatar" placeholder="头像图片"></el-input>
      </el-form-item>
      <el-form-item label="注册手机号" prop="phone">
        <el-input v-model="dataForm.phone" type="text"placeholder="注册手机号"></el-input>
      </el-form-item>
      <el-form-item label="注册邮箱" prop="email">
        <el-input v-model="dataForm.email" type="text"placeholder="注册邮箱"></el-input>
      </el-form-item>
      <el-form-item label="第三方登录" prop="socialSource">
        <el-input v-model="dataForm.socialSource" type="text"placeholder="第三方登录"></el-input>
      </el-form-item>
      <el-form-item label="盐" prop="salt">
        <el-input v-model="dataForm.salt" type="text"placeholder="盐"></el-input>
      </el-form-item>
      <el-form-item label="登录令牌" prop="loginToken">
        <el-input v-model="dataForm.loginToken" type="text"placeholder="登录令牌"></el-input>
      </el-form-item>
      <el-form-item label="第三方登录用户主键" prop="openuserId">
        <el-input v-model="dataForm.openuserId" type="text"placeholder="第三方登录用户主键"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { isEmail, isMobile } from '@/utils/validate'
  export default {
    data () {
      return {
        visible: false,
        roleList: [],
        dataForm: {
          id: 0,
          usercode: '',
          nickname: '',
          password: '',
          intro: '',
          avatar: '',
          phone: '',
          email: '',
          socialSource: '',
          loginToken: '',
          openuserId: ''
        },
        dataRule: {
          
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/xry/user/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({ data }) => {
              if (data && data.code === 0) {
                this.dataForm.usercode = data.user.usercode
                this.dataForm.nickname = data.user.usercode
                this.dataForm.password = data.user.password
                this.dataForm.intro = data.user.intro
                this.dataForm.avatar = data.user.avatar
                this.dataForm.phone = data.user.phone
                this.dataForm.email = data.user.email
                this.dataForm.socialSource = data.user.socialSource
                this.dataForm.loginToken = data.user.loginToken
                this.dataForm.openuserId = data.user.openuserId
              }
            })
          }
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/xry/user/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'courseId': this.dataForm.id || undefined,
                'usercode': this.dataForm.usercode,
                'usercode': this.dataForm.usercode,
                'password': this.dataForm.password,
                'intro': this.dataForm.intro,
                'avatar': this.dataForm.avatar,
                'phone': this.dataForm.phone,
                'email': this.dataForm.email,
                'socialSource': this.dataForm.socialSource,
                'loginToken': this.dataForm.loginToken,
                'openuserId': this.dataForm.openuserId
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
