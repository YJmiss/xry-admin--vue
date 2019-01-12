<template>
 <div class="customMenu">
<!-- <div class='explain'>
 1. 您的公众平台帐号类型必须升级为 <span class="red">服务号</span>  <br>
 2. 升级为服务号后，必须在微信公众平台申请接口使用的<span class="red">AppId</span> 和 <span class="red">AppSecret</span>，然后在【<a class="light" href="#">微信授权配置</a>】中设置。<br>
 3.最多创建<span class="red">3</span>个一级菜单，每个一级菜单下最多可以创建<span class="red">5</span>个二级菜单，菜单最多支持两层。<br>
 4. 拖动树形菜单可以对菜单重排序，但最终只有“<span class="red">发布菜单</span>”后才会生效，公众平台限制了每天的发布次数，请勿频繁操作。<br>
 5. 微信公众平台规定，<span class="red">菜单发布24小时后生效</span>。您也可先取消关注，再重新关注即可马上看到菜单。<br>
 6. 点击“<span class="red">删除菜单</span>”操作只删除微信公众平台上的菜单，并不是删除本系统已经设置好的菜单。
</div> -->
<div class="first-menu-list">
<h2>一级菜单配置</h2>
 <el-form :model="dataForm" :rules="dataRule" ref="dataForm" >
  <el-form-item label="菜单名称" prop="menuName">
  <el-input v-model="dataForm.menuName" placeholder="菜单名称"></el-input>
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
  <el-form-item label="链接地址" prop="url" v-show="dataForm.eventType == 2" label-width="80px">
  <el-input v-model="dataForm.url" placeholder="输入链接地址"></el-input>
  </el-form-item>
  <el-form-item label="点击事件key" prop="eventKey" v-show="dataForm.eventType == 1 || dataForm.eventType == 3 ||dataForm.eventType == 4 || dataForm.eventType == 5 || dataForm.eventType == 6 ||dataForm.eventType == 7 || dataForm.eventType == 8">
  <el-input v-model="dataForm.eventKey" placeholder="输入key值"></el-input>
  </el-form-item>
  </el-form>
  <el-button type="primary" class="button" @click="beforeSubmit1()">配置一级菜单</el-button> 
  </div>

  <div class="second-menu-list">
  <h2>二级菜单配置</h2>
  <el-form :model="dataForm2" :rules="dataRule2" ref="dataForm2" >
  <el-form-item label="菜单名称" prop="menuName">
  <el-input v-model="dataForm2.menuName" placeholder="菜单名称"></el-input>
  </el-form-item>
   <el-form-item label="上级菜单" prop="parentId">
      <el-select v-model="dataForm2.parentId" placeholder="请选择">
        <el-option v-for="item in parentMenuList" :value="item.menuId" :key="item.menuId" :label="item.menuName"></el-option>
      </el-select>
      </el-form-item>
  <el-form-item label="菜单类型" prop="menuType">
  <el-radio-group v-model="dataForm2.menuType">
  <el-radio :label="1">文字消息</el-radio>
  <el-radio :label="2">图文消息</el-radio>
  <el-radio :label="3">跳转页面</el-radio>
  </el-radio-group>
  </el-form-item>
  <el-form-item label="事件类型" prop="eventType" v-show="dataForm2.menuType">
  <el-select v-model="dataForm2.eventType" placeholder="请选择">
  <el-option
    v-for="item in options"
    :key="item.value"
    :label="item.label"
    :value="item.value">
  </el-option>
  </el-select>
  </el-form-item>
  <el-form-item label="选择素材" prop="material" v-show=" dataForm2.eventType == 9 ||dataForm2.eventType == 10">
  <el-select v-model="dataForm2.material" placeholder="请选择">
  <el-option v-for="item in materialList" :value="item.menuId" :key="item.menuId" :label="item.content"></el-option>
  </el-select>
  </el-form-item>
  <el-form-item label="链接地址" prop="url" v-show="dataForm2.eventType == 2" label-width="80px">
  <el-input v-model="dataForm2.url" placeholder="输入链接地址"></el-input>
  </el-form-item>
  <el-form-item label="点击事件key" prop="eventKey" v-show="dataForm2.eventType == 1 || dataForm2.eventType == 3 ||dataForm2.eventType == 4 || dataForm2.eventType == 5 || dataForm2.eventType == 6 ||dataForm2.eventType == 7 || dataForm2.eventType == 8">
  <el-input v-model="dataForm2.eventKey" placeholder="输入key值"></el-input>
  </el-form-item>
  </el-form>
  <el-button type="primary" class="button" @click="beforeSubmit2()">配置二级菜单</el-button> 
  </div>

</div>
</template>
<script>
import { treeDataTranslate } from '@/utils'
export default {
    data(){
    return{
     dataForm:{
       id:'',
      parentId:'0',
      menuName:'',
      menuType:'',
      eventType:'',
      eventKey:'',
      url:'',
      material:'',
     },
      dataForm2:{
      id:'',
      parentId:'',
      menuName:'',
      menuType:'',
      eventType:'',
      eventKey:'',
      url:'',
      material:''
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
          ]} ,
           dataRule2: {
           menuName:[
            { required: true, message: '请输入菜单名称', trigger: 'blur' },
           ],
          menuType:[
            {required:true, message: '请选择菜单类型', trigger: 'blur' },
          ],
          parentId:[
            {required:true, message: '请选择父级菜单', trigger: 'blur' },
          ],  
          eventType:[
          {required:true, message: '请选择事件类型', trigger: 'blur' },
          ]}       
          }
        },
    activated () {
    this.getDataList()
    },
    methods:{
      // 获取数据
    getDataList () {
        this.$http({
          url: this.$http.adornUrl('/sys/weChatParentMeunList'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          if (data && data.code === 0) {
             this.dataForm.menuName = data.parentMeun.menuName
             this.dataForm.menuType = data.parentMeun.menuType
             this.dataForm.eventType = data.parentMeun.eventType
             this.dataForm.url = data.parentMeun.menuLink
             this.dataForm.material = data.parentMeun.materialId
             this.dataForm.eventKey = data.parentMeun.menuKey
             // 获取父级菜单名称列表
             for (let i=0;i<data.parentMeun.length;i++) {
              if (0 == data.parentMeun[i].parentId) {
              this.parentMenuList.push(data.parentMeun[i])
              }
            }
          }
        }).then(() =>{
          this.$http({
          url: this.$http.adornUrl('/sys/weChatSonMeunList'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
          if (data && data.code === 0) {
             this.dataForm2.menuName = data.sonMeun.menuName
             this.dataForm2.parentId = data.sonMeun.parentId
             this.dataForm2.menuType = data.sonMeun.menuType
             this.dataForm2.eventType = data.sonMeun.eventType
             this.dataForm2.url = data.sonMeun.menuLink
             this.dataForm2.material = data.sonMeun.materialId
             this.dataForm2.eventKey = data.sonMeun.menuKey
           }
        })
        })
      },
        //获取素材
        getMaterialList(){
        
        },
        //一级菜单提交前验证
        beforeSubmit1(){
          if(this.dataForm.eventType == 2){
            //验证"链接地址"是否为空
           if(!this.urlValidate() && this.dataForm.url){
             this.dataForm.material = ''
             this.dataForm.eventKey = ''
             this.FirstMenuSubmit() 
           }
          }else if(this.dataForm.eventType == 9 || this.dataForm.eventType == 10){
            //验证"素材"是否为空
            if(!this.materialValidate() && this.dataForm.material){
            this.dataForm.url = ''
            this.dataForm.eventKey = ''
            this.FirstMenuSubmit() 
           }
          }else{
           //验证"点击事件key"是否为空
            if(!this.keyValidate() && this.dataForm.eventKey){
             this.dataForm.material = ''
             this.dataForm.url = ''
             this.FirstMenuSubmit() 
           }
          }
        },
        //配置一级菜单
        FirstMenuSubmit(){
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
         //二级菜单提交前验证
        beforeSubmit2(){
          if(this.dataForm2.eventType == 2){
            //验证"链接地址"是否为空
           if(!this.urlValidate() && this.dataForm2.url){
            this.dataForm2.material = ''
            this.dataForm2.eventKey = ''
            this.secondMenuSubmit() 
           }
          }else if(this.dataForm2.eventType == 9 || this.dataForm2.eventType == 10){
            //验证"素材"是否为空
            if(!this.materialValidate() && this.dataForm2.material){
             this.dataForm2.eventKey = ''
             this.dataForm2.url = ''
             this.secondMenuSubmit()
           }
          }else{
           //验证"点击事件key"是否为空
            if(!this.keyValidate() && this.dataForm2.eventKey){
             this.dataForm2.url = ''
             this.dataForm2.material = ''
             this.secondMenuSubmit()
           }
          }
        },
        //配置二级菜单
        secondMenuSubmit(){
        this.$refs['dataForm2'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/sys/weChatMeun`),
              method: 'post',
              data: this.$http.adornData({
                'menuId': this.dataForm2.id,
                'menuName': this.dataForm2.menuName,
                'parentId':this.dataForm2.parentId,
                'menuType': this.dataForm2.menuType,
                'eventType':this.dataForm2.eventType,
                'menuKey': this.dataForm2.eventKey,
                'menuLink' :this.dataForm2.url ,
                'materialId':this.dataForm2.material
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
      if(!this.dataForm.url || !this.dataForm2.material){
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
      if(!this.dataForm.material || !this.dataForm2.material){
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
        if(!this.dataForm.eventKey || !this.dataForm2.eventKey){
          this.$confirm(`请输入点击事件key值！`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                return;
            }).catch(() => {}); 
        }else{ key = true;} 
      }
    }
  }
    </script>
   <style scoped>
    .el-form{
    margin-top: 20px;
    margin-bottom: 30px;
    }
    .el-button{
    width:150px;
    margin-left: 20%;
    }
    .explain{
    height:auto;
    width: 100%;
    margin:20px 0 16px -20px;
    font-size:14px;
    font-family: 微软雅黑;
    color: #333333;
    padding: 10px;
    background: #ebebeb;
    line-height:30px;
    clear: both;
    position:fixed;
    bottom: 0;
    }
    .red{
    color:#ff0000;
    }
    .light{
    color:#17B3A3;
    }
    .first-menu-list{
    clear:both;
    width:45%;
    height:auto;
    float: left;
    }
    .second-menu-list{
    float: right;
    width: 50%;
    height: auto;
    margin: auto;
    }
    h2{
    margin-bottom:20px;
    padding-bottom: 10px;
    border-bottom: solid 1px #f0f0f0;
    width: 80%;
    }
    .el-input,.el-select{
    width: 300px;
    }
    </style>

