<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/logo.png" alt />
        <span>模拟后台管理系统</span>
      </div>
      <el-button @click="logout" type="info">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="this.isCollapse ? '64px' : '200px' ">
        <!-- 侧边栏菜单 -->
        <el-menu
          router
          :default-active="activePath"
          :collapse="isCollapse"
          :collapse-transition="false"
          unique-opened
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
        >
        <!-- 一级菜单 -->
          <el-menu-item class="toggle-button-container">
            <div class="toggle-button" @click="toggleCollapse">|||</div>
          </el-menu-item>
          <el-submenu v-for="item of menuList" :key="item.id" :index="item.id + ''">
            <!-- 一级菜单模板 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item v-for="subItem of item.children" :key="subItem.id" @click="saveNavItem('/' + subItem.path)" :index="'/'+subItem.path + ''">
               <template slot="title">
              <!-- 图标 -->
              <i class="el-icon-menu"></i>
              <!-- 文本 -->
              <span>{{ subItem.authName }}</span>
            </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  data () {
    return {
      menuList: [],
      // 一级菜单图标
      iconsObj: {
        '125': 'el-icon-user',
        '103': 'el-icon-lock',
        '101': 'el-icon-shopping-bag-1',
        '102': 'el-icon-money',
        '145': 'el-icon-postcard'
      },
      // 是否折叠
      isCollapse: false,
      // 被点击高亮的链接
      activePath: ''
    }
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$message.success('退出成功，请重新登录')
      this.$router.push('/login')
    },
    // 请求菜单的方法
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.menuList = res.data
      }
    },
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态
    saveNavItem (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  display: flex;
  padding-left: 0;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 20px;
  background-color: #373d41;
  div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
  img {
    padding-left: 15px;
    height: 50px;
    width: 50px;
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: 0;
  }
}
.el-main {
  background-color: #eaedf1;
}
.toggle-button-container{
  background-color: #333744;
  height: 30px;
  .toggle-button {
    font-size: 10px;
    line-height: 30px;
    text-align: center;
    color: #fff;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
}
</style>
