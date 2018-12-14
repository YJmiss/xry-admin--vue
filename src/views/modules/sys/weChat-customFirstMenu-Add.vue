<template>
<el-dialog :title="!dataForm.id ? '新增一级菜单' : '修改一级菜单'" :close-on-click-modal="false" :visible.sync="visible">
   <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="菜单名称" prop="menuName" style="margin-left:40px;position:relative">
      <el-input v-model="dataForm.menuName" placeholder="菜单名称"></el-input>
      </el-form-item>
      <el-form-item label="菜单类型" prop="menuType" label-width="120px">
        <template>
        <el-radio-group v-model="radio" @change="menuTypesHandle(radio)">
        <el-radio :label="1">文字消息</el-radio>
        <el-radio :label="2">图文消息</el-radio>
        <el-radio :label="3">跳转页面</el-radio>
        </el-radio-group>
        </template>
      </el-form-item>
      <el-form-item label="事件类型" prop="eventType" label-width="120px">
      <el-select v-model="value" placeholder="请选择" @change="eventTypeHandle(value)">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value">
      </el-option>
      </el-select>
      </el-form-item>
      <el-form-item label="消息内容" prop="text" v-show="textVisibale" label-width="120px">
      <el-input type="textarea"  placeholder="请输入文字消息内容" v-model="dataForm.text" style="width:250px;" rows="3">
      </el-input>
      </el-form-item>
      <el-form-item label="选择素材" prop="material" v-show="materialVisible" label-width="120px">
      <el-select v-model="dataForm.material" placeholder="请选择" @change="getMaterialList()">
      <el-option v-for="item in  materialList" :value="item.menuId" :key="item.menuId" :label="item.materialId"></el-option>
      </el-select>
      </el-form-item>
      <el-form-item label="链接地址" prop="url" v-show="urlVisible" label-width="120px">
      <el-input v-model="dataForm.url" placeholder="输入链接地址"></el-input>
      </el-form-item>
      <el-form-item label="点击事件key" prop="eventKey" label-width="120px" v-show="eventKeyVisible">
      <el-input v-model="dataForm.eventKey" placeholder="输入key值" style="position:relative;left:2px;"></el-input>
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
    data(){
    return{ 
     radio:1,
     visible:false,
     urlVisible:false,
     materialVisible:false,
     textVisibale:true,
     eventKeyVisible:false,
     dataForm:{
       id:'',
      parentId:'0',
      menuName:'',
      menuType:'',
      text:'',
      eventType:'',
      eventKey:'',
      url:'',
      material:'',
     },
      options: [{
          value: '1',
          label: '点击推事件'
        }, {
          value: '2',
          label: '跳转URL'
        }, {
          value: '3',
          label: '扫码事件'
        }, {
          value: '4',
          label: '扫码推事件（弹出“消息接受中”）'
        },{
          value:'5',
          label:'弹出系统拍照发图'
        },{
          value:'6',
          label:'弹出拍照或者相册发图'
        },{
          value:'7',
          label:'弹出微信相册发图器'
        },{
          value:'8',
          label:'弹出地理位置选择器'
        },{
          value:'9',
          label:'下发消息（除文本信息）'
        },{
          value:'10',
          label:'跳转图文消息URL'
        }],
        value: '',
     materialList:[],
      dataRule: {
          menuName:[
            { required: true, message: '请输入菜单名称', trigger: 'blur' },
             ],
          menuType:[
            {required:true, message: '请选择菜单类型', trigger: 'blur' },
              ],  
            eventType:[
                {required:true, message: '请选择事件类型', trigger: 'blur' },
                ]}
               }
             },
      methods:{
      //菜单类型选择处理
      menuTypesHandle(radio){
       if(1 == radio){
        this.eventKeyVisible = false,
        this.urlVisible = false,
        this.materialVisible = false,
        this.textVisibale = true,
        this.dataForm.menuType = this.radio
       }else if(2 == radio){
        this.eventKeyVisible = false,
        this.urlVisible = false,
        this.materialVisible = true,
        this.textVisibale = false,
        this.dataForm.menuType = this.radio
       }else{
        this.eventKeyVisible = false,
        this.urlVisible = true,
        this.materialVisible = false,
        this.textVisibale = false,
        this.dataForm.menuType = this.radio
       }
      },
      //事件类型选择处理
     eventTypeHandle(value){
     if(2==value){
     this.eventKeyVisible =false,
     this.urlVisible = true,
     this.materialVisible = false,
     this.textVisibale = false,
     this.dataForm.eventType = this.value
      }else if(9==value || 10==value){
     this.eventKeyVisible = false,
     this.urlVisible = false,
     this.materialVisible = true,
     this.textVisibale = false,
     this.dataForm.eventType = this.value
      } else{
     this.eventKeyVisible = true,
     this.urlVisible = false,
     this.materialVisible = false,
     this.textVisibale = false,
     this.dataForm.eventType = this.value
      }
      },
      //初始化表单
      init () {
          this.visible=true
        },
        //获取素材库
        getMaterialList(){
        
        },
        //表单提交
        dataFormSubmit(){
          this.$refs['dataForm'].validate((valid) => {
            if (valid) {
              this.$http({
                url: this.$http.adornUrl(`/sys/weChatMeun`),
                method: 'post',
                data: this.$http.adornData({
                  'menuId': this.dataForm.id,
                  'parentId':this.dataForm.parentId,
                  'menuName': this.dataForm.menuName,
                  'menuType': this.dataForm.menuType,
                  'menuKey': this.dataForm.eventKey,
                  'menuLink' :this.dataForm.url,
                  'materialId':this.dataForm.material,
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
html, body{
  margin: 0px;
  padding: 0px;
}
.el-form{
  width: 80%;
  margin:auto;
  height:auto;
}
.el-form-item{
height: auto;
position:relative;
left:20%;
}
.el-form-item__label {
    text-align:left;
    float:left;
    line-height:24px;
    padding-left:0px;
    }
 .el-input,.el-select{
  width:40%;
  padding:0;
  position:relative;
  display: flex;
  justify-content:left;
  align-items: left;
}
</style>
