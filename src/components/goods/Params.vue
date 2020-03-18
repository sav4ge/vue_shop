<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区域 -->
    <el-card>
      <el-alert
        :closable="false"
        show-icon
        title="注意：只允许为第三级分类设置相关参数"
        type="warning">
      </el-alert>
      <el-row class="cat-opt">
        <el-col :span="3">
          <span>选择商品分类:</span>
        </el-col>
        <el-col :span="8">
          <!-- 级联选择框 选择商品分类 -->
          <!-- option用于绑定数据 -->
          <el-cascader
            clearable
            v-model="selectedKeys"
            :options="cateList"
            :props="cascaderProps"
            @change="parentCateChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button @click="addDialogVisible = true" :disabled="isBtnDisabled" type="primary" size="mini">添加参数</el-button>
          <!-- 动态参数表格区域 -->
          <el-table :data="manyTableData" stripe border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag closable v-for="(item, idx) in scope.row.attr_vals" :key="idx" @close="handleClose(idx,scope.row)">
                  {{ item }}
                </el-tag>
                <!-- 添加新tag的输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                  size="small"
                >
                </el-input>
                <!-- 添加新tag的按钮 -->
                <el-button v-else class="btn-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button @click="addDialogVisible = true" :disabled="isBtnDisabled" type="primary" size="mini">添加属性</el-button>
          <!-- 静态属性表格区域 -->
          <el-table :data="onlyTableData" stripe border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag closable v-for="(item, idx) in scope.row.attr_vals" :key="idx" @close="handleClose(idx,scope.row)">
                  {{ item }}
                </el-tag>
                <!-- 添加新tag的输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                  size="small"
                >
                </el-input>
                <!-- 添加新tag的按钮 -->
                <el-button v-else class="btn-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog @close="addDialogClosed" :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button type="primary" size=" mini" @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" size=" mini" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数的对话框 -->
    <el-dialog @close="editDialogClosed" :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button type="primary" size=" mini" @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" size=" mini" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      cateList: [],
      // 选中项的数组
      selectedKeys: [],
      // 默认激活的tab many代表动态参数
      activeName: 'many',
      // 添加参数/属性的对话框是否隐藏
      addDialogVisible: false,
      // 级联选择框的配置
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: false,
        expandTrigger: 'hover'
      },
      // 动态参数表格数据
      manyTableData: [],
      // 静态属性表格数据
      onlyTableData: [],
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          {
            required: 'true',
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      editDialogVisible: false,
      // 修改的数据对象
      editForm: {},
      // 修改数据的验证规则
      editFormRules: {}
    }
  },
  computed: {
    isBtnDisabled () {
      if (this.selectedKeys.length === 3) {
        return false
      } else {
        return true
      }
    },
    // 选中的三级分类的id
    cateId () {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      } else {
        return null
      }
    },
    // 计算对话框标题文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message('获取商品分类数据失败')
      } else {
        this.cateList = res.data
      }
    },
    // 获取参数的列表数据
    async getParamsData () {
      // 验证是否为三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
      } else {
        // 如果为三级分类则继续
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: this.activeName
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败')
        } else {
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals === '' ? [] : item.attr_vals.split(' ')
            // 控制input是否显示
            item.inputVisible = false
            // 文本框输入的内容
            item.inputValue = ''
          })
          if (this.activeName === 'many') {
            this.manyTableData = res.data
          } else {
            this.onlyTableData = res.data
          }
        }
      }
    },
    // 监听级联选择框节点选择变化
    parentCateChange () {
      this.getParamsData()
    },
    handleTabClick () {
      this.getParamsData()
    },
    // 监听添加参数/属性对话框的关闭
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 确定添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) {
            return this.$message.error('添加参数失败')
          } else {
            this.$message.success('添加参数成功')
            this.addDialogVisible = false
            this.getParamsData()
          }
        }
      })
    },
    // 展示修改的对话框
    async showEditDialog (attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      } else {
        this.editForm = res.data
        this.editDialogVisible = true
      }
    },
    // 监听修改对话框额关闭
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 确定修改参数信息
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 200) {
            return this.$message.error(res.data.msg)
          } else {
            this.$message.success('修改参数数据成功')
            this.getParamsData()
            this.editDialogVisible = false
          }
        }
      })
      this.editDialogVisible = false
    },
    async deleteParams (attrId) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (confirmResult !== 'confirm') {
        this.$message.info('已取消删除')
      } else {
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除参数失败')
        } else {
          this.$message.success('删除参数成功')
          this.getParamsData()
        }
      }
    },
    // 添加新tag的文本框失去焦点或者enter
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
      } else {
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        this.saveAttrValues(row)
      }
    },
    // 点击按钮切换为文本输入框
    showInput (row) {
      row.inputVisible = true
      // $nextTick 即元素被重新渲染时执行回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleClose (idx, row) {
      row.attr_vals.splice(idx, 1)
      this.saveAttrValues(row)
    },
    async saveAttrValues (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_vals: row.attr_vals.join(' '),
        attr_sel: row.attr_sel
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      } else {
        this.$message.success('修改参数成功')
      }
    }
  }
}
</script>
<style lang="less">
  .cat-opt{
    margin: 15px 0px;
  }
  .el-tag{
    margin: 10px;
  }
  .input-new-tag{
    width: 120px!important;
  }
</style>
