<template>
    <el-dialog :visible.sync="visible" :close-on-click-modal="false">
     <el-table :data="dataList" border>
      <el-table-column prop="id" header-align="center" align="center" label="ID"></el-table-column>
      <el-table-column prop="courseId" header-align="center" align="center" width="80" label="课程ID"></el-table-column>
      <el-table-column prop="orderId" header-align="center" align="center"  label="订单ID"></el-table-column>
      <el-table-column prop="title" header-align="center" align="center" width="120" label="课程标题"></el-table-column>
      <el-table-column prop="price" header-align="center" align="center" width="100" label="课程单价"></el-table-column>
      <el-table-column prop="picPath" header-align="center" align="center" width="120"  label="课程图片">
         <template slot-scope="scope">
          <el-popover ref="imgPopover" placement="left" trigger="hover">
            <img class="big-img" :src="scope.row.picPath"/>
          </el-popover>
          <img class="broadcst-img" v-popover:imgPopover :src="scope.row.picPath" alt="课程图片缩略图">
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
                if(data && data.code === 0){
                console.log(data)
                this.dataList = data.orderCourses
                this.dataForm.picPath = data.orderCourses.picPath
                }else {
                this.dataList = []
                alert('数据获取失败！')
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
</style>

