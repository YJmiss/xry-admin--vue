<template>
    <div class="keyReply">
     <el-button type="primary" class="addKeyWords" @click="addOrUpdateHandle()">添加关键词</el-button>
     <el-table :data="dataForm" border>
    <el-table-column prop="id" label="序号" width="250">
    </el-table-column>
    <el-table-column prop="keyword" label="触发关键字" width="250">
    </el-table-column>
    <el-table-column prop="replyType" label="回复类型" width="250">
    </el-table-column>
    <el-table-column prop="matchMode" label="匹配模式" width="250">
    </el-table-column>
    <el-table-column prop="replyContent" label="回复内容" width="250">
    </el-table-column>
     <el-table-column  fixed="right" header-align="center" align="left" label="操作" >
        <template slot-scope="scope" porp="status" >
          <el-button  type="primary" size="small" icon="el-icon-edit" circle @click="addOrUpdateHandle(scope.row.id)"></el-button>
          <el-button  type="danger" size="small" icon="el-icon-delete" circle @click="deleteHandle(scope.row.id)"></el-button>
        </template>
      </el-table-column>
   </el-table>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate"></add-or-update>
    </div>
</template>
<script>
import { treeDataTranslate } from '@/utils'
import AddOrUpdate from './weChat-keyReplyAddorUpdate'
export default {
  components:{AddOrUpdate},
  data() {
    return {
    addOrUpdateVisible:false,
     dataForm:[{
        id:1,
        keyword:'母婴',
        replyType:'纯文本消息',
        matchMode:'模糊匹配',
        replyContent:'这是一条回复测试记录'
    }]
  }
  },
  methods: {
     // 新增 / 修改
      addOrUpdateHandle (id) {
        this.addOrUpdateVisible = true
        this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id)
        })
      },
       // 删除
      deleteHandle (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/xry/weChat/keyReply/delete'),
            method: 'post',
            data: this.$http.adornData(ids, false)
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.getDataList()
                }
              })
            } else {
              this.$message.error(data.msg)
            }
          })
        }).catch(() => {})
      } 
  }
};
</script>
<style  scoped>
html,
body {
  margin: 0px;
  padding: 0px;
}
.el-table{
    background: oldlace;
    width: 98%;
    margin:auto;
  }

.keyReply {
  clear: both;
}
.addKeyWords {
  float: left;
  width: 200px;
  height: 40px;
  margin:0 auto 30px 18px;
}

</style>
