<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="目录名称" prop="title">
        <el-input v-model="dataForm.title" placeholder="目录名称"></el-input>
      </el-form-item>
      <el-form-item label="所属课程"> 
         <el-select v-model="dataForm.courseid" clearable placeholder="请选择所属课程">
          <el-option
            v-for="item in courseList"
            :key="item.id"
            :label="item.title"
            :value="item.id"
            >
          </el-option>
         </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { treeDataTranslate } from '@/utils'
  export default {
    data () {
      return {
        visible: false,
        dataForm: {
          id: 0,
          title: '',
          courseid: 0
        },
        dataRule: {
          name: [
            { required: true, message: '目录名称不能为空', trigger: 'blur' }
          ],
         courseid: [
            { required: true, message: '所属课程不能为空', trigger: 'change' }
          ]
        },
        courseList: [],
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        // 查询目录所属课程
        this.$http({
          url: this.$http.adornUrl('/xry/course/treeCourse'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          this.courseList = treeDataTranslate(data.courseList, 'id')
        }).then(() => {
          this.visible = true
          this.$nextTick(() => {
            this.$refs['dataForm'].resetFields()
          })
        }).then(() => {
          if (this.dataForm.id) {
               // 修改
            this.$http({
              url: this.$http.adornUrl(`/xry/course/catalog/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({ data }) => {
              this.visible = true
              this.dataForm.id = data.courseCatalog.id
              this.dataForm.title = data.courseCatalog.title
              this.dataForm.courseid = data.courseCatalog.courseid
            })  
          } else {
          // 新增
           this.dataForm.courseid = ''
          }

        })
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/xry/course/catalog/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'title': this.dataForm.title,
                'courseid': this.dataForm.courseid,
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
    .el-select{
    min-width:300px;
    }
  }
</style>
