<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input clearable @clear="getUserList" placeholder="请输入搜索的用户名" v-model="queryInfo.query" class="input-with-select">
          <el-button slot="append" @click="getUserList" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button @click="addDialogVisible = true" type="primary">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table border stripe :data="userList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="权限角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)" active-color="#13ce66" >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="scope">
            <el-tooltip effect="dark" content="编辑用户" :enterable="false" placement="top">
              <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除用户"  :enterable="false" placement="top">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="配置角色"  :enterable="false" placement="top">
              <el-button @click="setRole(scope.row)" type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
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
    <!-- 对话框 用于添加用户 -->
    <el-dialog
      @close="addDialogClosed"
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="40%">
      <!-- 内容主体 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="30" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled>
          </el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" >
          </el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile" >
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%">
      <div>
        <p>当前用户：{{ userInfo.username }}</p>
        <p>当前角色：{{ userInfo.role_name }}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择角色">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    var checkEmail = (rules, value, callback) => {
      const regEmail = /^[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*\.[a-z]{2,}$/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的邮箱地址'))
    }
    var checkMobile = (rules, value, callback) => {
      const regMobile = /^1[3456789]\d{9}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入正确的手机号码'))
    }
    return {
      // 用户列表参数对象
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 每页显示条目
        pagesize: 3
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      // 添加用户的数据对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单数据的规则对象
      addFormRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          }, {
            min: 3,
            max: 10,
            message: '用户名的长度在3-10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          }, {
            min: 6,
            max: 15,
            message: '密码的长度在6-15字符之间 '
          }
        ],
        email: [
          {
            required: true,
            message: '请输入邮箱地址',
            trigger: 'blur'
          }, {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号码',
            trigger: 'blur'
          }, {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      // 修改用户的对话框的是否展示
      editDialogVisible: false,
      editForm: {
      },
      editFormRules: {
        email: [
          { required: true,
            message: '请输入用户邮箱',
            trigger: 'blur'
          }, {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true,
            message: '请输入用户手机号码',
            trigger: 'blur'
          }, {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      // 控制分配角色对框框的显示
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息对象
      userInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 已经选中的roleID值
      selectedRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听开关状态变化
    async userStateChanged (userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新状态数据失败')
      } else {
        this.$message.success('更新状态数据成功')
      }
    },
    // 监听对话框是否关闭
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加新用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            return this.$message.error('添加用户请求失败')
          } else {
            this.$message.success('添加新用户成功')
            // 隐藏添加用户的对话框
            this.addDialogVisible = false
            // 重新获取用户列表数据
            this.getUserList()
          }
        }
      })
    },
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      } else {
        this.editDialogVisible = true
        this.editForm = res.data
      }
    },
    // 监听修改用户对话框的关闭
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          // 发起修改用户信息的请求
          const { data: res } = await this.$http.put(`users/${this.editForm.id}`, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          if (res.meta.status !== 200) {
            this.$message.error('更新用户数据失败')
          } else {
            this.editDialogVisible = false
            this.getUserList()
            this.$message.success('更新用户数据成功')
          }
        }
      })
    },
    // 根据id删除用户
    async removeUserById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      // console.log(typeof confirmResult)
      if (confirmResult !== 'confirm') {
        this.$message.info('取消删除用户')
      } else {
        const { data: deleteResult } = await this.$http.delete(`users/${id}`)
        if (deleteResult.meta.status !== 200) {
          return this.$message.error('删除用户数据失败')
        } else {
          this.$message.success('成功删除该用户')
          this.getUserList()
        }
      }
    },
    // 展示分配角色的对话框
    async setRole (userInfo) {
      this.userInfo = userInfo
      // 在展示对话框前获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      } else {
        this.rolesList = res.data
      }
      this.setRoleDialogVisible = true
    },
    // 分配新角色
    async saveRoleInfo () {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择需要分配的角色')
      } else {
        const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
          rid: this.selectedRoleId
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        } else {
          this.$message.success(res.meta.msg)
          this.getUserList()
          this.setRoleDialogVisible = false
        }
      }
    }
  }
}
</script>
<style lang="less">
</style>
