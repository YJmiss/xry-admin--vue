<template>
    <el-dialog :title="订单详情" :visible.sync="visible" :close-on-click-modal="false">
      <el-table :data="dataList" border style="width: 100%;" height="300">
      <el-table-column prop="courseId" header-align="center" align="center" width="250" label="课程ID"></el-table-column>
      <el-table-column prop="orderId" header-align="center" align="center" width="250" label="订单ID"></el-table-column>
      <el-table-column prop="title" header-align="center" align="center" width="120" label="课程标题"></el-table-column>
      <el-table-column prop="price" header-align="center" align="center" width="100" label="课程单价"></el-table-column>
      <el-table-column prop="picPath" header-align="center" align="center"  label="课程图片"></el-table-column>
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
                courseId:'',
                orderId:'',
                title:'', //课程标题
                price:0, //课程单价
                picPath:'' //课程图片地址
            }
        }
    },
    methods:{
    //获取订单数据
    getDataList (id) {
          this.visible = true
          this.$http({
               url:this.$http.adornUrl('/xry/order/info'),
               method:'get',
               params:this.$http.adornParams({
                'orderId': id
               })
            }).then(({data}) => {
                if(data && data.code === 0){
                 this.dataList = data
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


</style>

