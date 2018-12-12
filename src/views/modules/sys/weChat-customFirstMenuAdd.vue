<template>
<el-dialog :title="!dataForm.id ? '新增一级菜单' : ''" :close-on-click-modal="false" :visible.sync="visible">
   <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="菜单名称" prop="menuName" style="margin-left:40px;position:relative">
      <el-input v-model="dataForm.menuName" placeholder="菜单名称"></el-input>
      </el-form-item>
      <el-form-item label="是否有二级菜单" label-width="120px">
      <el-radio-group v-model="radio" @change="menuTypeHandle(radio)">
      <el-radio :label="1" name="yes">是</el-radio>
      <el-radio :label="2" name="no" >否</el-radio>
      </el-radio-group>
      </el-form-item>
      <el-form-item label="选择菜单类型" prop="menuType" v-show="menuTypeVisible" label-width="120px">
      <el-select v-model="value" placeholder="请选择" @change="menuEventsHandle(value)">
      <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
     </el-option>
     </el-select>
    </el-form-item>
    <el-form-item label="点击事件key" prop="eventKey" v-show="eventKeyVisible" label-width="120px">
    <el-input v-model="dataForm.eventKey" placeholder="点击事件key值"></el-input>
    </el-form-item>
    <el-form-item label="链接地址" prop="url" v-show="urlVisible" label-width="120px">
    <el-input v-model="dataForm.url" placeholder="输入链接地址"></el-input>
    </el-form-item>
     <el-form-item label="选择素材" prop="material" v-show="materialVisible" label-width="120px">
     <el-select v-model="value2" placeholder="请选择">
     <el-option
      v-for="item in options2"
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
import { treeDataTranslate } from '@/utils'
export default {
    data(){
    return{ 
    visible:false,
     radio:1,
     menuTypeVisible:false,
     eventKeyVisible:false,
     urlVisible:false,
     materialVisible:false,
     dataForm:{
       id:0,
      menuName:'',
      menuType:'',
      eventKey:'',
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
        options2: [{
          value: '1',
          label: '素材1'
        }, {
          value: '2',
          label: '素材2'
        }, {
          value: '3',
          label: '素材3'
        }],
        value2: '',
      dataRule: {
          menuName:[
            { required: true, message: '请输入菜单名称', trigger: 'blur' },
           ],
         menuType:[
            {required:true, message: '请选择菜单类型', trigger: 'blur' },
          ],
         eventKey:[
            { required:true, message: '该项为必填项', trigger: 'blur' },
          ],
          url:[
             { required:true, message: '链接地址为必填项', trigger: 'blur' },
          ],
          material:[
          { required:true, message: '选择素材', trigger: 'blur' },
           ]
          }
    }
    },
    methods:{
  //是否显示“菜单类型”选项处理函数
   menuTypeHandle(radio){
    if(radio == 2 ){
    this.menuTypeVisible=true
     }else{
    this.menuTypeVisible=false
     }
    },
    //菜单事件处理函数
    menuEventsHandle(value){
      if(1==value || 3==value || 4==value || 5==value || 6==value || 7==value || 8==value){
     this.eventKeyVisible=true,
     this.urlVisible=false,
     this.materialVisible=false
      }else if(2==value){
     this.eventKeyVisible=false,
     this.urlVisible=true,
     this.materialVisible=false
      }else{
     this.eventKeyVisible=false,
     this.urlVisible=false,
     this.materialVisible=true
      }
    },
    //初始化表单
     init () {
        this.visible=true
        this.dataForm.id = id
        this.$http.adornUrl(`/sys/weChat/firstCustomMenu/${this.dataForm.id}`)
      },
      //表单提交
      dataFormSubmit(){
         this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/sys/weChat/firstCustomMenu/${!this.dataForm.id ? 'save' : ''}`),
              method: 'post',
              data: this.$http.adornData({
                'menuId': this.dataForm.id,
                'menuName': this.dataForm.menuName,
                'menuType': this.dataForm.menuType,
                'eventKey': this.dataForm.eventKey || '',
                'url' :this.dataForm.url || '',
                'material':this.dataForm.material || '',
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
