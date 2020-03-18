<template>
<div>
  <!-- 面包屑导航区 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>参数列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片视图区域 -->
  <el-card>
    <el-input clearable @clear="getOrderList" placeholder="请输入搜索的订单" v-model="queryInfo.query" class="input-with-select">
    <el-button slot="append" @click="getOrderList" icon="el-icon-search"></el-button>
    </el-input>
    <el-table border stripe :data="orderList">
      <el-table-column type="index"></el-table-column>
      <el-table-column label="订单编号" prop="order_number"></el-table-column>
      <el-table-column label="订单价格" prop="order_price"></el-table-column>
      <el-table-column label="是否付款">
        <template slot-scope="scope">
          <el-tag type="primary" v-if="scope.row.pay_status === '0'">已付款</el-tag>
          <el-tag type="danger" v-else>未付款</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否发货" prop="is_send"></el-table-column>
      <el-table-column label="下单时间">
        <template slot-scope="scope">
          {{ new Date(scope.row.create_time).toLocaleDateString() + ' ' + new Date(scope.row.create_time).toLocaleTimeString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" >
        <template>
          <div>
            <el-button class="btn" icon="el-icon-edit" size="mini" type="primary" @click="showEditDialogVisible">编辑地址</el-button>
            <el-button class="btn" icon="el-icon-location" size="mini" type="danger" @click="showProgress">物流信息</el-button>
          </div>
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
      <el-dialog title="修改地址" :visible.sync="orderDialogVisible" width="50">
        <el-form :data="editForm">
          <el-form-item label="省/市区县">
            <el-cascader
                :options="cityOptions"
                :value="cityOptions.value"
                :props="{ expandTrigger: 'click' }"
              >
              </el-cascader>
          </el-form-item>
          <el-form-item label="详细地址">
            <el-input v-model="editForm.address"></el-input>
          </el-form-item>
        </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="orderDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editOrder">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 查看物流进度的对话框 -->
     <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50">
       <el-timeline>
        <el-timeline-item
          v-for="(item, index) in progressInfo"
          :key="index"
          :timestamp="item.time">
          {{ item.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </el-card>
</div>
</template>
<script>

import cityOptions from '../../city_data2017_element.js'
export default {
  data () {
    return {
      // 请求订单数据参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 订单数据列表
      orderList: [],
      total: 0,
      orderDialogVisible: false,
      editForm: {
        address: ''
      },
      cityOptions: cityOptions,
      progressInfo: {},
      progressDialogVisible: false
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单数据失败')
      } else {
        this.orderList = res.data.goods
        this.total = res.data.total
      }
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    showEditDialogVisible () {
      this.orderDialogVisible = true
    },
    editOrder () {
      this.orderDialogVisible = false
    },
    async showProgress () {
      const { data: res } = await this.$http.get('kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      } else {
        this.progressInfo = res.data
        this.progressDialogVisible = true
      }
    }
  }
}
</script>
<style lang="less">
.input-with-select{
  width: 500px!important;
}
.btn{
  margin:5px 0!important;
}
</style>
