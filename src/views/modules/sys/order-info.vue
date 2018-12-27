<template>
    <el-dialog :visible.sync="visible" :close-on-click-modal="false">
     <p class="orderID">订单编号：&nbsp;{{dataForm.orderId}}</p>
     <el-table :data="dataList" border>
      <el-table-column prop="title" header-align="center" align="center" width="320"  label="课程标题"></el-table-column>
         <el-table-column prop="picPath" header-align="center" align="center"  label="课程图片">
         <template slot-scope="scope">
          <el-popover ref="imgPopover" placement="left" trigger="hover">
            <img class="big-img" :src="scope.row.picPath"/>
          </el-popover>
          <img class="broadcst-img" v-popover:imgPopover :src="scope.row.picPath" alt="课程图片缩略图">
        </template>
      </el-table-column>
      <el-table-column  header-align="center" align="center"  label="课程单价">
        <template slot-scope="scope" prop="price">
        <span>{{scope.row.price / 100}}元</span>
        </template>  
      </el-table-column>
     </el-table>
    </el-dialog>
    </template>
    <script>
    export default {
    data(){
        return{
            dataList:[],
            visible:false,
            dataForm:{
                id:'',
                courseId:0,
                orderId:'',
                title:'', //课程标题
                price:0, //课程单价
                picPath:'' //课程图片地址
            }
        }
    },
    methods:{
    //获取订单数据
    getDataList (orderId) {
          this.visible = true
          this.$http({
               url:this.$http.adornUrl('/api/appOrder/getOrderCourses'),
               method:'get',
               params:this.$http.adornParams({
                'orderId':orderId
               })
            }).then(({data}) => {
                console.log(data)
                if(data && data.code === 0){
                this.dataList = data.orderCourses
                for(let i = 0;i<data.orderCourses.length;i++){
                  this.dataForm.orderId = data.orderCourses[i].orderId
                 }
                }else {
                this.dataList = []
              }
        }) 
       }
    }
}
</script>
<style scoped>
.broadcst-img{width: 50px;height: 50px;}
.broadcst-img:hover{cursor:pointer}
.big-img{height:500px;width:500px;}
.el-table{
width:80%;
margin: auto auto 30px auto;
}
.el-table-column{
 width: auto;
}
.orderID{
margin-left: 10%;
font: 14px 微软雅黑 bolder;
color: #333;
}
</style>

