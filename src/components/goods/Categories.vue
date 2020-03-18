<template>
  <div>
     <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      </el-row>
      <!-- 表格区域 -->
        <tree-table class="tree-table" :show-index="true" :show-row-hover="false" border index-text="#" :selection-type="false" :expand-type="false" :data="cateList" :columns="columns">
          <!-- 是否有效 -->
          <template slot="isok" slot-scope="scope">
            <i class="el-icon-success" style="color: lightgreen" v-if="scope.row.cat_deleted === false"></i>
            <i class="el-icon-error" style="color: red" v-else></i>
          </template>
          <!-- 排序 -->
          <template slot="order" slot-scope="scope">
            <el-tag type="primary" size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag type="warning" size="mini" v-else>三级</el-tag>
          </template>
          <!-- 操作 -->
          <template slot="opt" slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditCateDialog(scope.row)">编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteCate(scope.row)">删除</el-button>
          </template>
        </tree-table>
        <!-- 分页区域 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[3, 5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog @close="addCateDialogClosed" title="添加分类" :visible.sync="addCateDialogVisible" width="50%">
      <el-form :model="addCateForm" :rules="addCateRules" ref="addCateRef" label-width="150px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <el-cascader
            clearable
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"></el-cascader>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button type="primary" @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类的对话框 -->
    <el-dialog @close="editCateDialogClosed" title="编辑分类" :visible.sync="editCateDialogVisible" width="50%">
      <el-form :model="editCateForm" :rules="editCateRules" ref="editCateRef" label-width="150px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button type="primary" @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 查询参数 分页数据
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表
      cateList: [],
      // 总数据条数
      total: 0,
      addCateDialogVisible: false,
      // 父级分类列表
      parentCateList: [],
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        }, {
          label: '是否有效',
          // 作用域插槽模板列
          type: 'template',
          template: 'isok'
        }, {
          label: '排序',
          type: 'template',
          template: 'order'
        }, {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 添加分类的数据对象
      addCateForm: {
        // 分类名称 默认为空
        cat_name: '',
        // 默认parentID
        cat_pid: 0,
        // 默认添加一级分类
        cat_level: 0
      },
      addCateRules: {
        cate_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
      // 指定级联选择的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true,
        expandTrigger: 'hover'
      },
      // 选中的parent分类的id数组
      selectedKeys: [],
      // 编辑分类的对话框
      editCateDialogVisible: false,
      // 被编辑分类的数据对象
      editCateForm: {},
      // 编辑分类的表单验证规则
      editCateRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getCatesList()
  },
  methods: {
    async getCatesList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      } else {
        // 数据列表赋值res.data.total
        this.cateList = res.data.result
        this.total = res.data.total
      }
    },
    // 监听pagesize改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCatesList()
    },
    // 监听pagenum变化
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCatesList()
    },
    // 监听添加分类对话框开启
    showAddCateDialog () {
      // 打开对话框前获取父级数据分类列表
      this.getParentList()
      this.addCateDialogVisible = true
    },
    // 获取parent分类的数据列表
    async getParentList () {
      const { data: res } = await this.$http.get('categories', { params: {
        type: 2
      } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据失败')
      } else {
        this.parentCateList = res.data
      }
    },
    // 级联选择变化时触发
    parentCateChange () {
      // 判断selectedKeys数组的长度
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    addCate () {
      this.$refs.addCateRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('categories', this.addCateForm)
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg)
          } else {
            this.$message.success('添加分类成功')
            this.getCatesList()
            this.addCateDialogVisible = false
          }
        }
      })
    },
    // 监听对话框关闭
    addCateDialogClosed () {
      this.$refs.addCateRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 展示编辑分类的对话框
    showEditCateDialog (editCateForm) {
      this.editCateDialogVisible = true
      this.editCateForm = editCateForm
    },
    // 确认编辑分类
    async editCate () {
      // console.log(this.editCateForm)
      const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, {
        cat_name: this.editCateForm.cat_name
      })
      if (res.meta.status !== 200) {
        // console.log(res)
        return this.$message.error(res.meta.msg)
      } else {
        this.$message.success('修改分类成功')
        this.getCatesList()
      }
    },
    // 关闭编辑分类的对话框
    editCateDialogClosed () {
      this.$refs.editCateRef.resetFields()
    },
    async deleteCate (cate) {
      console.log(cate)
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete(`categories/${cate.cat_id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败')
        } else {
          this.$message.success('删除分类成功')
          this.getCatesList()
        }
      }
    }
  }
}
</script>
<style lang="less">
.tree-table{
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
</style>
