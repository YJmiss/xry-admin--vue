<template>
<div class="container">
<el-input type="text" v-model="dataForm.words" placeholder="输入要增加的关键词"></el-input>
<el-button v-if="isAuth('xry:hotSearchWords:add')" type="primary" @click="formSubmit()">+添加</el-button>
 <el-table :data="dataList" border>
      <el-table-column
        prop="id"
        label="序号"
        header-align="center"
        >
      </el-table-column>
      <el-table-column
        prop="words"
        label="关键词"
        header-align="center"
        >
       </el-table-column>
       <el-table-column
        prop="status"
        label="状态"
        header-align="center"
        >
        <template slot-scope="scope">
        <el-tag v-if="scope.row.status === 1">正常</el-tag>
        <el-tag v-if="scope.row.status === 2">已移除</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="created"
        label="创建时间"
        header-align="center"
        >
      </el-table-column>
       <el-table-column fixed="right" header-align="center" align="left" label="操作">
        <template slot-scope="scope" porp="status">
          <el-button v-if="isAuth('xry:hotSearchWords:delete')" type="danger" size="small"  @click="removeOrshowHandle(scope.row.id,scope.row.status)" :disabled="scope.row.status === 2">移除</el-button>
          <el-button v-if="isAuth('xry:hotSearchWords:delete')" type="primary" size="small"  @click="removeOrshowHandle(scope.row.id,scope.row.status)" :disabled="scope.row.status === 1">恢复显示</el-button>
        </template>
      </el-table-column>
    </el-table>
</div>
</template>
<script>
export default {
    data(){
        return{     
            dataList:[],
            dataForm:{
                id:0,
                words:'',
                created:'',
                status:0
            }
        }
    },
     activated () {
      //this.getDataList()
    },
    methods:{
        //获取数据
        getDataList(){
          this.$http({
          url: this.$http.adornUrl('/xry/hotSearch/list'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({ data }) => {
           this.dataList = data.wordList
        })
        },
       //提交数据
       formSubmit(){
        if(this.dataForm.words){
           this.$http({
              url: this.$http.adornUrl(`/xry/hotSearch/add`),
              method: 'post',
              data: this.$http.adornData({
                'words': this.dataForm.words
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
       },
       //移除或恢复显示
       removeOrshowHandle(id,status){
        this.$confirm(`确定对该项数据进行"移除"或“恢复显示”操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl("/sys/hotSearch/updateStatus"),
            method: "get",
            params: this.$http.adornParams({
              id: id,
              status:status
            })
          })
        }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message({
                message: "操作成功",
                type: "success",
                duration: 1500,
                onClose: () => {
                  this.getDataList();
                }
              });
            } else {
              this.$message.error(data.msg);
            }
          });
       }
    }
}
</script>
<style scoped>
.el-input{
width: 240px;
margin: 5px 20px 60px auto;
}
.el-table{
width:100%;
}
.el-table-column{
width: 25%;
}
</style>

