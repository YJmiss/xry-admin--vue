<template>
<el-dialog
    :title="!dataForm.id ? '新增二级菜单' : '修改二级菜单'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="菜单名称" prop="menuName">
      <el-input v-model="dataForm.menuName" placeholder="菜单名称"></el-input>
      </el-form-item>
      <el-form-item label="上级菜单" prop="parentID">
      <el-select v-model="dataForm.parentID" placeholder="请选择">
        <el-option v-for="item in parentMenuList" :value="item.menuId" :key="item.menuId" :label="item.menuName"></el-option>
      </el-select>
      </el-form-item>
      <el-form-item label="菜单类型" prop="menuType">
        <template>
        <el-radio-group v-model="radio" @change="menuTypesHandle(radio)">
        <el-radio :label="1">文字消息</el-radio>
        <el-radio :label="2">图文消息</el-radio>
        <el-radio :label="3">跳转页面</el-radio>
        </el-radio-group>
        </template>
      </el-form-item>
      <el-form-item label="事件类型" prop="eventType" label-width="80px" style="">
      <el-select v-model="value" placeholder="请选择" @change="eventTypeHandle(value)">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value">
      </el-option>
      </el-select>
      </el-form-item>
      <el-form-item label="消息内容" prop="text" v-show="textVisibale" label-width="80px">
      <el-input type="textarea"  placeholder="请输入文字消息内容" v-model="dataForm.text" rows="3" style="width:270px;margin-left:2px;">
      </el-input>
      </el-form-item>
      <el-form-item label="点击事件key" prop="eventKey" label-width="120px" v-show="eventKeyVisible" style="margin-left:-40px;">
      <el-input v-model="dataForm.eventKey" placeholder="输入key值" style="position:relative;left:2px;"></el-input>
      </el-form-item>
      <el-form-item label="链接地址" prop="url" v-show="urlVisible" label-width="80px" >
      <el-input v-model="dataForm.url" placeholder="输入链接地址" style="position:relative;left:2px;"></el-input>
      </el-form-item>
      <el-form-item label="选择素材" prop="material" v-show="materialVisible" label-width="80px">
      <el-select v-model="dataForm.material" placeholder="请选择" style="position:relative;left:2px;">
      <el-option
        v-for="item in materialList"
        :key="item.value"
        :label="item.label"
        :value="item.value">
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
import $ from 'jquery'
import { treeDataTranslate } from '@/utils'
export default {
    data(){
    return{
     visible:false,
     eventKeyVisible:false,
     urlVisible:false,
     materialVisible:false,
     textVisibale:true,
     parentMenuList:[],
     materialList:[],
     radio:1,
     dataForm:{
       id:'',
      menuName:'',
      parentID:'',
      menuType:'点击事件',
      eventKey:'',
      eventKey:'',
      text:'',
      url:'',
      material:''
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
        }
        ],
        value: '',
      dataRule: {
           menuName:[
            { required: true, message: '请输入菜单名称', trigger: 'blur' },
           ],
          menuType:[
            {required:true, message: '请选择菜单类型', trigger: 'blur' },
          ],
          parentID:[
              {required:true, message: '请选择父级菜单', trigger: 'blur' },
          ]}
        }
      },
     activated () {
    this.getParentMenuList()
    this.getMaterialList()
    },
    methods:{
     //初始化表单
     init () {
        this.visible=true
      },
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
   // 获取父级菜单列表
    getParentMenuList () {
        this.$http({
          url: this.$http.adornUrl('/sys/weChatParentMeunList'),
          method: 'get',
          params: this.$http.adornParams()
          }).then(({ data }) => {
          if (data && data.code === 0) {
            for (let i=0;i<data.parentMeun.length;i++) {
              if (0 == data.parentMeun[i].parentId) {
              this.parentMenuList.push(data.parentMeun[i])
              this.dataForm.parentID = data.parentMeun[i].menuId
              }
            }
           }
          })
          },
      //获取素材库列表
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
                'menuName': this.dataForm.menuName,
                'parentId':this.dataForm.parentID,
                'menuType': this.dataForm.menuType,
                'menuKey': this.dataForm.eventKey,
                'menuLink' :this.dataForm.url ,
                'materialId':this.dataForm.material
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
};
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
        padding-left:0;
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

