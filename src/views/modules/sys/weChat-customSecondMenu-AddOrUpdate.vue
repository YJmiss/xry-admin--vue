<template>
<el-dialog
    :title="!dataForm.id ? '修改二级菜单' : '添加二级菜单'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="菜单名称" prop="menuName">
      <el-input v-model="dataForm.menuName" placeholder="菜单名称"></el-input>
      </el-form-item>
      <el-form-item label="菜单类型" prop="menuType" >
      <el-select v-model="value" placeholder="请选择"  @change="menuEventsHandle(value)">
      <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
     </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="点击事件key" prop="eventKey" label-width="120px" v-show="eventKeyVisible">
    <el-input v-model="dataForm.eventKey" placeholder="输入key值" style="margin-left:-120px;padding:0;"></el-input>
    </el-form-item>
    <el-form-item label="链接地址" prop="url" v-show="urlVisible" label-width="120px" >
    <el-input v-model="dataForm.url" placeholder="输入链接地址" style="position:relative;left:-40px;"></el-input>
    </el-form-item>
    <el-form-item label="选择素材" prop="material" v-show="materialVisible" label-width="120px">
     <el-select v-model="value2" placeholder="请选择" style="position:relative;left:-40px;">
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
export default {
    data(){
    return{
     visible:false,
     radio:1,
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
     //初始化表单
     init (id) {
        this.dataForm.id =id || 0
        this.visible=true
        this.$http.adornUrl(`/sys/weChat/secondCustomMenu/${this.dataForm.id}`)
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
      //表单提交
      dataFormSubmit(){
       this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/sys/weChat/secondCustomMenu/${!this.dataForm.id ? 'save' : ''}`),
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

