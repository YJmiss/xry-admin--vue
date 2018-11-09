<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item v-if="dataForm.parentId === 0" label="父类目" prop="parentId">
        <el-input v-model="dataForm.parentId" placeholder="父类目"></el-input>
      </el-form-item>
      <el-form-item v-if="dataForm.name" label="类目名称" prop="name">
        <el-input v-model="dataForm.name" placeholder="类目名称"></el-input>
      </el-form-item>
      <el-form-item v-if="dataForm.status !== 1" label="状态" prop="status">
        <el-input-number v-model="dataForm.status" controls-position="right" placeholder="状态"></el-input-number>
      </el-form-item>
      <el-form-item v-if="dataForm.sortOrder !== 0" label="排列序号" prop="sortOrder">
        <el-input-number v-model="dataForm.sortOrder" controls-position="right" placeholder="排列序号"></el-input-number>
      </el-form-item>
      <el-form-item v-if="dataForm.isParent !== 1" label="是否是父类目" prop="isParent">
        <el-input-number v-model="dataForm.isParent" controls-position="right" placeholder="是否是父类目"></el-input-number>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import Icon from '@/icons'
  export default {
    data () {
      var validateUrl = (rule, value, callback) => {
        if (this.dataForm.type === 1 && !/\S/.test(value)) {
          callback(new Error('菜单URL不能为空'))
        } else {
          callback()
        }
      }
      return {
        visible: false,
        dataForm: {
          id: 0,
          parentId: 0,
          name: '',
          status: 1,
          sortOrder: 0,
          isParent: 1,
        },
        dataRule: {
          name: [
            { required: true, message: '类目名称不能为空', trigger: 'blur' }
          ],
          parentId: [
            { required: true, message: '上级类目不能为空', trigger: 'change' }
          ]
        },
        menuList: []
      }
    },
    created () {
      this.iconList = Icon.getNameList()
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        if (!this.dataForm.id) {
            // 新增
          } else {
            // 修改
            this.$http({
              url: this.$http.adornUrl(`/xry/course/cat/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({ data }) => {
              this.dataForm.id = data.course.id
              this.dataForm.parentId = course.menu.parentId
              this.dataForm.name = data.course.name
              this.dataForm.status = data.course.status
              this.dataForm.sortOrder = data.course.sortOrder
              this.dataForm.isParent = data.course.isParent
            })
          }
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/xry/course/cat/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'parentId': this.dataForm.parentId,
                'name': this.dataForm.name,
                'status': this.dataForm.status,
                'sortOrder': this.dataForm.sortOrder,
                'isParent': this.dataForm.isParent
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

<style lang="scss">
  .mod-course-cat {
    .menu-list__input,
    .icon-list__input {
       > .el-input__inner {
        cursor: pointer;
      }
    }
    &__icon-popover {
      /*max-width: 370px;*/
    }
    &__icon-list {
      /*max-height: 180px;*/
      padding: 0;
      margin: -8px 0 0 -8px;
      > .el-button {
        padding: 8px;
        margin: 8px 0 0 8px;
        > span {
          display: inline-block;
          vertical-align: middle;
          width: 18px;
          height: 18px;
          font-size: 18px;
        }
      }
    }
    .icon-list__tips {
      font-size: 18px;
      text-align: center;
      color: #e6a23c;
      cursor: pointer;
    }
  }
</style>
