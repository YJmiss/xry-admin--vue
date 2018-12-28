<template>
  <el-dialog :visible.sync="visible" :close-on-click-modal="false" :rules="dataRule">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="dataFormSubmit()" >
      <p v-if="dataForm.orgName">所属机构名称：{{dataForm.orgName}}</p>
      <div v-else style="margin-left:300px;">
       是否添加所属机构：
      <el-radio-group v-model="radio" @change="selectHandle(radio)">
      <el-radio :label="1">否</el-radio>
      <el-radio :label="2">是</el-radio>
      </el-radio-group>
      </div>
      <el-form-item label="所属机构名称：" v-show="radio == 2">
      <el-select v-model="dataForm.orgName" clearable placeholder="请选择所属机构" v-show="radio == 2" @change="currentChangeHandle()">
      <el-option
        v-for="item in orgNameList"
        :key="item.id"
        :label="item.org_name"
        :value="item.id">
      </el-option>
     </el-select>
     </el-form-item><br>
     <p v-if="dataForm.id_card">身份证号：{{dataForm.id_card}}</p>
     <el-form-item label="身份证号：" v-else>
      <el-input v-model="dataForm.id_card" type="text"></el-input>
     </el-form-item><br>
     <img v-if="dataForm.id_card_front" src="dataForm.id_card_front">
     <el-form-item label="身份证正面照：" v-else>
      <el-button  type="primary">上传图片</el-button>
     </el-form-item>
      <img v-if="dataForm.id_card_back" src="dataForm.id_card_back">
      <el-form-item label="身份证反面照：" v-else>
      <el-button  type="primary">上传图片</el-button>
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
        visible:false,
        radio:1,
        dataForm:{
        orgName:'',
        organizationId:'',
        teacherId:'',
        id_card:'',
        id_card_front:'',
        id_card_back:''
        },
       orgNameList:[],
       organizationList:[],
        dataRule: {
          orgName:[
          { required: true, message: '请选择所属机构', trigger: 'blur' }
          ],
         id_card: [
          { required: true, message: '请填写身份号', trigger: 'blur' }
          ]
        }
      }
      
    },
    methods: {
    //是否添加所属机构处理
    selectHandle(radio){
    if(2 ==radio){
    this.getOrganizationList()
    }
    },
    //获取机构列表
    getOrganizationList(){
     this.$http({
          url: this.$http.adornUrl('/xry/organization/list'),
          method: 'get',
          params: this.$http.adornParams()
          }).then(({ data }) => {
          if (data && data.code === 0) {
            this.organizationList = data.page.list
            for(let i=0; i<organizationList.length;i++){
            this.orgNameList.push(organizationList[i].org_name)
            }
          }
        })
    },
    // 获取可能已经存在的数据
    init(id) {
    this.visible = true
    this.dataForm.teacherId = id
    this.$http({
      url: this.$http.adornUrl(''),
      method: 'get',
      params: this.$http.adornParams({
        'id': id
      })
    }).then(({ data }) => {
      if (data && data.code === 0) {
        this.dataForm.orgName = '',
        this.dataForm.id_card = '',
        this.dataForm.id_card_front = '',
        this.dataForm.id_card_back = '' 
      } 
    })
    },
    //机构选中处理
    currentChangeHandle(){
    for(let j=0;j<this.organizationList.length;j++){
      if(this.dataForm.orgName === this.organizationList[j].org_name){
      this.dataForm.organizationId = this.organizationList[j].id
      }
    }
    },
    //提交表单
    dataFormSubmit(){
      this.$refs['dataForm'].validate((valid) => {
            if (valid) {
              this.$http({
                url: this.$http.adornUrl(`/xry/video/${!this.dataForm.id ? 'save' : 'update'}`),
                method: 'post',
                data: this.$http.adornData({
                  'id': this.dataForm.teacherId || undefined,
                  'id_card':  this.dataForm.id_card,
                  'id_card_front':this.dataForm.id_card_front,
                  'id_card_back': this.dataForm.courseId,
                  'org_id':this.dataForm.organizationId
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
.el-form-item{
margin: 10px 300px;
}
</style>
