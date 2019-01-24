<template>
 <el-dialog title="新增菜单" :close-on-click-modal="false" :visible.sync="visible">
 <el-form :model="dataForm" :rules="dataRule" ref="dataForm" >
   <el-form-item label="菜单层级">
    <el-radio-group v-model="dataForm.menuLevel">
    <el-radio :label="1">一级菜单</el-radio>
    <el-radio :label="2">二级菜单</el-radio>
    </el-radio-group>
   </el-form-item>
  <el-form-item label="菜单名称" prop="menuName">
  <el-input v-model="dataForm.menuName" placeholder="菜单名称"></el-input>
  </el-form-item>
  <el-form-item label="上级菜单" prop="parentId" v-show="dataForm.menuLevel == 2">
      <el-select v-model="dataForm.parentId" placeholder="请选择">
        <el-option v-for="item in parentMenuList" :value="item.menuId" :key="item.menuId" :label="item.menuName"></el-option>
      </el-select>
  </el-form-item>
  <el-form-item label="菜单类型" prop="menuType">
  <el-radio-group v-model="dataForm.menuType">
  <el-radio :label="1">文字消息</el-radio>
  <el-radio :label="2">图文消息</el-radio>
  <el-radio :label="3">跳转页面</el-radio>
  </el-radio-group>
  </el-form-item>
  <el-form-item label="事件类型" prop="eventType" v-show="dataForm.menuType">
  <el-select  v-model="dataForm.eventType" placeholder="请选择">
  <el-option
    v-for="item in options"
    :key="item.value"
    :label="item.label"
    :value="item.value">
  </el-option>
  </el-select>
  </el-form-item>
  <el-form-item label="选择素材" prop="material" v-show=" dataForm.eventType == 9 ||dataForm.eventType == 10">
  <el-select v-model="dataForm.material" placeholder="请选择">
  <el-option v-for="item in  materialList" :value="item.menuId" :key="item.menuId" :label="item.title"></el-option>
  </el-select>
  </el-form-item>
  <el-form-item label="链接地址" prop="url" v-show="dataForm.eventType == 2">
  <el-input v-model="dataForm.url" placeholder="输入链接地址"></el-input>
  </el-form-item>
  <el-form-item label="点击事件key" prop="eventKey" v-show="dataForm.eventType == 1 || dataForm.eventType == 3 ||dataForm.eventType == 4 || dataForm.eventType == 5 || dataForm.eventType == 6 ||dataForm.eventType == 7 || dataForm.eventType == 8">
  <el-input v-model="dataForm.eventKey" placeholder="输入key值"></el-input>
  </el-form-item>
  </el-form>
  <el-button type="primary" class="button" @click="beforeSubmit()">配置菜单</el-button> 
 </el-dialog>
</template>
<script>
import { treeDataTranslate } from '@/utils'
export default {
    data(){
    return{
     visible:false,
     dataForm:{
       id:'',
      menuLevel:1,
      parentId:'',
      menuName:'',
      menuType:'',
      eventType:'',
      eventKey:'',
      url:'',
      material:'',
     },
      parentMenuList:[],
      materialList:[],
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
    // 获取数据
    init(id,parentId){
    this.visible = true
    this.dataForm.id = id
    this.dataForm.parentId
    if(this.dataForm.id){
     this.$http({
          url: this.$http.adornUrl('/sys/weChatMeun'),
          method: 'get',
          params: this.$http.adornParams({
          'id':this.dataForm.id
          })
        }).then(({ data }) => {
          if (data && data.code === 0) {
            console.log(data)
           /*  this.dataForm.menuName = 
            this.dataForm.parentId = 
            this.dataForm.menuType = 
            this.dataForm.eventType = 
            this.dataForm.eventKey = 
            this.dataForm.url = 
            this.dataForm.material =  */
      }
    })
    }else{
    this.getParentList()
    }
    },
    //获取父级菜单
    getParentList(){
     this.$http({
        url: this.$http.adornUrl('/sys/weChatParentMeunList'),
        method: 'get',
        params: this.$http.adornParams()
      }).then(({ data }) => {
        if (data && data.code === 0) {
        // 获取父级菜单名称列表
        for (let i=0;i<data.parentMeun.length;i++) {
        if (0 == data.parentMeun[i].parentId) {
        this.parentMenuList.push(data.parentMeun[i])
        }
        }
        }
      }) 
    },
    //获取素材
    getMaterialList(){
    
     },
      //菜单提交前验证
      beforeSubmit(){
      //如果新增二级菜单，上级菜单不能为空
      if(this.dataForm.menuLevel == 2){
          if(!this.parentIdValidate() && this.dataForm.parentId){
            this.menuSubmit() 
          }else{
          this.dataForm.parentId = 0
          this.menuSubmit() 
          }
          }
          if(this.dataForm.eventType == 2){
            //验证"链接地址"是否为空
           if(!this.urlValidate() && this.dataForm.url){
             this.dataForm.material = ''
             this.dataForm.eventKey = ''
             this.menuSubmit() 
           }
          }else if(this.dataForm.eventType == 9 || this.dataForm.eventType == 10){
            //验证"素材"是否为空
            if(!this.materialValidate() && this.dataForm.material){
            this.dataForm.url = ''
            this.dataForm.eventKey = ''
            this.menuSubmit() 
           }
          }else{
           //验证"点击事件key"是否为空
            if(!this.keyValidate() && this.dataForm.eventKey){
             this.dataForm.material = ''
             this.dataForm.url = ''
             this.menuSubmit() 
           }
          }
        },
        //配置自定义菜单
        menuSubmit(){
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
                  'eventType':this.dataForm.eventType,
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
        },
      //单独验证"链接地址"
      urlValidate(){
        let url = false
      if(!this.dataForm.url){
          this.$confirm(`请填写链接地址！`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                return;
            }).catch(() => {}); 
        }else{url =true;}
      },
      //单独验证“素材”
      materialValidate(){
        let material = false
      if(!this.dataForm.material){
          this.$confirm(`请选择素材！`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                return;
            }).catch(() => {}); 
        }else{material = true;}
      },
      //单独验证“点击事件key”
      keyValidate(){
        let key = false
        if(!this.dataForm.eventKey){
          this.$confirm(`请输入点击事件key值！`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                return;
            }).catch(() => {}); 
        }else{ key = true;} 
      },
      //单独验证上级菜单
      parentIdValidate(){
      let parent = false
      if(!this.dataForm.parentId){
      this.$confirm(`请选择素材！`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
      }).then(() => {
          return;
      }).catch(() => {});  
      }else{parent = true}
      }
    }
  }
    </script>
   <style scoped>
   .el-form{
    padding: 0;
   }
    .el-form-item{
    display: flex;
    justify-content: center;
    align-content: center;
    }
    .el-button{
    width:150px;
    margin-left:46%;
    }
    .el-input,.el-select{
    width: 300px;
    }
    </style>

