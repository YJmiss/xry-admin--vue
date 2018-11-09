<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="权限名字" prop="name">
        <el-input v-model="dataForm.name" type="text" placeholder="权限名字"></el-input>
      </el-form-item>
      <el-form-item label="访问地址" prop="url">
        <el-input v-model="dataForm.url" type="text" placeholder="访问地址"></el-input>
      </el-form-item>
      <el-form-item label="是否可用" size="mini" prop="available">
        <el-radio-group v-model="dataForm.available">
          <el-radio :label="0">不可用</el-radio>
          <el-radio :label="1">可用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        roleList: [],
        dataForm: {
          id: 0,
          name: '',
          url: '',
          available: 0
        },
        dataRule: {
          name: [
            { required: true, message: '权限名字不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/xry/permission/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({ data }) => {
              if (data && data.code === 0) {
                this.dataForm.name = data.permission.name
                this.dataForm.url = data.permission.url
                this.dataForm.available = data.permission.available
              }
            })
          }
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/xry/permission/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'name': this.dataForm.name,
                'url': this.dataForm.url,
                'available': this.dataForm.available
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
