<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialogVisible">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom','vcenter',idx1 === 0? 'bdtop' : '']" v-for="(item1,idx1) in scope.row.children" :key="item1.id">
              <!-- 一级权限渲染 -->
              <el-col :span="5">
                <el-tag clear="true" closable @close="removeRightById(scope.row,item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二 三级权限渲染 -->
              <el-col :span="19">
                <el-row  v-for="(item2,idx2) in item1.children" :key="item2.id" :class="[idx2 === 0? '': 'bdtop','vcenter']">
                  <el-col :span="6" >
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-row v-for="(item3, idx3) in item2.children" :key="item3.id" :class="[idx3 === 0 ? '': 'bdtop']">
                      <el-tag type="warning" closable @close="removeRightById(scope.row,item3.id)">
                        {{ item3.authName }}
                      </el-tag>
                    </el-row>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
           <el-button type="primary" @click="showEditDialogVisible(scope.row)" icon="el-icon-edit" size="mini">编辑</el-button>
           <el-button type="danger" @click="showDeleteRolesConfirm(scope.row.id)" icon="el-icon-delete" size="mini">删除</el-button>
           <el-button type="warning" @click="showSetRightDialog(scope.row)" icon="el-icon-setting" size="mini">分配权限</el-button>
          </template>
      </el-table-column>
      </el-table>
    </el-card>
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="30" @close="editDialogClosed">
       <el-form :model="editRoles" ref="editRolesRef" label-width="70px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="editRoles.roleName" disabled>
          </el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoles.roleDesc" >
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogClosed">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="30" @close="addDialogClosed">
      <el-form :model="addRoles" :rules="addRolesRules" ref="addRolesRef" label-width="70px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addRoles.roleName" >
          </el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoles.roleDesc" >
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addDialogClosed">取 消</el-button>
        <el-button type="primary" @click="addRolesInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" @close="setRightDialogClosed" :visible.sync="setRightDialogVisible" width="50">
      <el-tree ref="treeRef" default-expand-all :default-checked-keys="defKeys" node-key="id" show-checkbox :data="rightsList" :props="treeProps"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 所有就角色列表数据
      roleList: [],
      rightsList: [],
      addRoles: {},
      roleId: '',
      editRoles: {},
      editDialogVisible: false,
      addDialogVisible: false,
      setRightDialogVisible: false,
      // 分配权限列表树中默认选中的id
      defKeys: [],
      // tree控件的绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      addRolesRules: {
        roleName: [
          { required: true,
            message: '请输入修改的角色名称',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表数据失败')
      }
      this.roleList = res.data
    },
    async showDeleteRolesConfirm (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (confirmResult === 'confirm') {
        const { data: res } = this.$http.delete(`roles/${id}`)
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message('删除角色失败')
        } else {
          this.$message.success('删除角色成功')
          this.getRolesList()
        }
      }
    },
    showEditDialogVisible (role) {
      this.editRoles = role
      this.editDialogVisible = true
    },
    showAddDialogVisible () {
      this.addDialogVisible = true
    },
    editDialogClosed () {
      this.editDialogVisible = false
      this.getRolesList()
    },
    async editRolesInfo () {
      this.$refs.editRolesRef.validate(async valid => {
        if (valid) {
          // 发起修改用户信息的请求
          const { data: res } = await this.$http.put(`roles/${this.editRoles.id}`, {
            roleName: this.editRoles.roleName,
            roleDesc: this.editRoles.roleDesc
          })
          if (res.meta.status !== 200) {
            this.$message.error('更新角色数据失败')
          } else {
            this.editDialogVisible = false
            this.getRolesList()
            this.$message.success('更新角色数据成功')
          }
        }
      })
    },
    addDialogClosed () {
      this.addDialogVisible = false
      this.getRolesList()
    },
    addRolesInfo () {
      this.$refs.addRolesRef.validate(async valid => {
        if (valid) {
          // 发起修改用户信息的请求
          const { data: res } = await this.$http.post(`roles`, {
            roleName: this.addRoles.roleName,
            roleDesc: this.addRoles.roleDesc
          })
          if (res.meta.status !== 201) {
            this.$message.error('更新角色数据失败')
          } else {
            this.addDialogVisible = false
            this.getRolesList()
            this.$message.success('添加角色成功')
          }
        }
      })
    },
    async removeRightById (role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除该权限')
      } else {
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        this.$message.success('成功删除该权限')
        if (res.meta.status !== 200) {
          return this.$messgae.error('删除权限失败')
        } else {
          role.children = res.data
          this.$message.success('成功删除该权限')
        }
      }
    },
    async showSetRightDialog (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get(`rights/tree`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表数据失败')
      } else {
        this.rightsList = res.data
        this.getLeafKeys(role, this.defKeys)
        this.setRightDialogVisible = true
      }
    },
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      } else {
        node.children.forEach(item => {
          this.getLeafKeys(item, arr)
        })
      }
    },
    setRightDialogClosed () {
      this.defKeys = []
    },
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      } else {
        this.$message.success('分配权限成功')
        this.getRolesList()
        this.setRightDialogVisible = false
      }
    }
  }
}
</script>
<style lang="less">
 .el-tag{
   margin: 7px;
 }
 .bdtop{
   border-top: 1px solid
 }
 .bdbottom{
   border-bottom:1px solid
 }
 .vcenter{
   display: flex;
   align-items: center;
 }
</style>
