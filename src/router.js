import Vue from 'vue'
import Router from 'vue-router'
// import Login from './components/Login.vue'
// import Home from './components/Home.vue'
// import Welcome from './components/Welcome.vue'
// import Users from './components/user/Users.vue'
// import Rights from './components/power/Rights.vue'
// import Roles from './components/power/Roles.vue'
// import Cate from './components/goods/Cate.vue'
// import Params from './components/goods/Params.vue'
// import Orders from './components/orders/Orders.vue'
// import Categories from './components/goods/Categories.vue'
// import Add from './components/goods/Add.vue'
// import Reports from './components/reports/Reports.vue'
const Login = () => import(/* webpackChunkName: 'login_home_welcome' */ './components/Login.vue')
const Welcome = () => import(/* webpackChunkName: 'login_home_welcome' */ './components/Welcome.vue')
const Home = () => import(/* webpackChunkName: 'login_home_welcome' */ './components/Home.vue')
const Users = () => import(/* webpackChunkName: 'login_home_user' */ './components/user/Users.vue')
const Rights = () => import(/* webpackChunkName: 'login_home_user' */ './components/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: 'login_home_user' */ './components/power/Roles.vue')
const Cate = () => import(/* webpackChunkName: 'login_home_cate' */ './components/goods/Cate.vue')
const Params = () => import(/* webpackChunkName: 'login_home_cate' */ './components/goods/Params.vue')
const Categories = () => import(/* webpackChunkName: 'login_home_cate' */ './components/goods/Categories.vue')
const Orders = () => import(/* webpackChunkName: 'login_home_goods' */ './components/orders/Orders.vue')
const Add = () => import(/* webpackChunkName: 'login_home_goods' */ './components/goods/Add.vue')
const Reports = () => import(/* webpackChunkName: 'login_home_report' */ './components/reports/Reports.vue')

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        {
          path: '/welcome',
          component: Welcome
        },
        {
          path: '/users',
          component: Users
        },
        {
          path: '/rights',
          component: Rights
        },
        {
          path: '/roles',
          component: Roles
        },
        {
          path: '/goods',
          component: Cate
        }, {
          path: '/params',
          component: Params
        }, {
          path: '/orders',
          component: Orders
        }, {
          path: '/categories',
          component: Categories
        }, {
          path: '/goods/add',
          component: Add
        }, {
          path: '/reports',
          component: Reports
        }
      ]
    }
  ]
})
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    return next()
  }
  if (to.path !== '/login') {
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) {
      return next('/login')
    } else {
      return next()
    }
  }
})

export default router
