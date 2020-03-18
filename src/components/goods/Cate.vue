<template>
  <div>
     <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
            <el-input clearable @clear="getCateList" placeholder="请输入搜索的商品" v-model="queryInfo.query" class="input-with-select">
              <el-button slot="append" @click="getCateList" icon="el-icon-search"></el-button>
            </el-input>
        </el-col>
        <el-button type="primary" class="add-goods-button" @click="goAddPage">添加商品</el-button>
      </el-row>
      <el-table border stripe :data="cateList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格（元）" prop="goods_price"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
        <el-table-column label="创建时间">
          <template slot-scope="scope">
            {{ new Date(scope.row.add_time).toLocaleDateString() + ' ' + new Date(scope.row.add_time).toLocaleTimeString()}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="confirmDeleteGood(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 商品列表
      cateList: [],
      // 请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      } else {
        this.cateList = res.data.goods
        this.total = res.data.total
      }
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    async confirmDeleteGood (good) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除商品')
      } else {
        const { data: res } = await this.$http.delete(`goods/${good.goods_id}`)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        } else {
          this.$message.success('删除成功')
        }
      }
    },
    // 负责跳转到添加商品的路由
    goAddPage () {
      this.$router.push('goods/add')
    }
  }
}
</script>
<style lang="less">
.input-with-select{
  width: 90%!important;
}
  .add-goods-button{
    margin-left: 10px!important;
  }
</style>
