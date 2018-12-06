<template>
<el-dialog
    :title="!dataForm.id ? '修改二级菜单' : '添加二级菜单'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="菜单名称" prop="menuName">
      <el-input v-model="dataForm.menuName" placeholder="菜单名称"></el-input>
      </el-form-item>
      <el-form-item label="菜单类型" prop="menuType">
      <el-select v-model="value" placeholder="请选择">
      <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
     </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="点击事件key" prop="key_value" label-width="120px">
      <el-input v-model="dataForm.key_value" placeholder="输入key值" style="margin-left:-120px;padding:0;"></el-input>
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
    data(){
    return{
     visible:false,
     radio:1,
     menuTypeVisible:false,
     dataForm:{
       id:0,
      menuName:'',
      menuType:'',
      key_value:''
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
          key_value:[
            { required:true, message: '请输入点击事件key值', trigger: 'blur' },
          ]
          }
    }
    },
    methods:{
     //初始化表单
     init (id) {
        this.dataForm.id =id || 0
        this.visible=true
      },
      //表单提交
      dataFormSubmit(){
        
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
  border: 1px solid #ebebeb;
  padding: 30px 0 20px 0;
}
.el-form-item{
display: flex;
justify-content:center;
align-items: center;
padding-bottom: 10px;
}
.el-form-item__label {
    text-align:right;
    float:left;
    line-height:0px;
    padding:0;
    }
 .el-select,.el-input{
  width: 250px;
  padding:0;
  position: relative;
  margin-left:-70px;
}
</style>

