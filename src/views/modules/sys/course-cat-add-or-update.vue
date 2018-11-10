<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item v-if="dataForm.name" label="类目名称" prop="name">
        <el-input v-model="dataForm.name" placeholder="类目名称"></el-input>
      </el-form-item>
      <el-form-item label="父类目" size="mini" prop="status">
        <el-radio-group v-model="dataForm.status">
          <el-radio :label="0">否</el-radio>
          <el-radio :label="1">是</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="dataForm.parentId === 0" label="类目选择" prop="parentId">
        <el-input v-model="dataForm.parentId" placeholder="类目选择"></el-input>
      </el-form-item>
      <el-form-item v-if="dataForm.sortOrder" label="排列序号" prop="sortOrder">
        <el-input-number v-model="dataForm.sortOrder" controls-position="right" :min="0" placeholder="排列序号"></el-input-number>
      </el-form-item>
      <el-form-item label="状态" size="mini" prop="status">
        <el-radio-group v-model="dataForm.status">
          <el-radio :label="1">正常</el-radio>
          <el-radio :label="2">删除</el-radio>
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
  import Icon from '@/icons'
  export default {
    data () {
      return {
        visible: false,
        dataForm: {
          id: 0,
          parentId: 0,
          name: '667',
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
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/xry/course/cat/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({ data }) => {
              if (data && data.code === 0) {
                console.log(data);
                this.dataForm.parentId = courseCat.menu.parent_id
                this.dataForm.name = data.courseCat.name
                this.dataForm.status = data.courseCat.status
                this.dataForm.sortOrder = data.courseCat.sort_order
                this.dataForm.isParent = data.courseCat.is_parent
              }
            })
          }
        })
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
