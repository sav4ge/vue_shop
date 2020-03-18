<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert
        :closable="false"
        show-icon
        center
        title="添加商品信息 商品名称必须唯一"
        type="info">
      </el-alert>
      <!-- 进度条 -->
      <el-steps align-center :space="200" :active="activeIndex - 0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-position="top">
        <el-tabs @tab-click="tabClicked" :tab-position="'left'" :before-leave="beforeTabLeave" v-model="activeIndex">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                :options="cateList"
                :props="cateProps"
                v-model="addForm.goods_cat"
                @change="handleChange"
              >
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :key="i" v-for="(cb ,i) in item.attr_vals" :label="cb"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableData" :label="item.attr_name" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-form-item>
              <!-- action表示上传的后台api地址 -->
              <el-upload
                :action="uploadURL"
                :on-preview="handlePreview"
                :on-success="handleSuccess"
                :headers="uploadHeader"
                :on-remove="handleRemove"
                list-type="picture">
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button class="btn-add" type="primary" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览的渲染对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" class="preview-pic-dialog">
      <img :src="this.previewPath" alt="图片预览" class="previewImg">
      <span class="dialog-footer" slot="footer">
        <el-button type="primary" @click="previewVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data () {
    return {
      // 上传api地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      activeIndex: '0',
      // 添加商品表单的数据对象和
      addForm: {
        goods_name: '',
        goods_price: null,
        goods_weight: null,
        goods_number: null,
        // 商品分类的数组
        goods_cat: [],
        pics: [],
        // 商品描述
        goods_introduce: '',
        attrs: []
      },
      // 添加商品表单的验证规则
      addFormRules: {
        goods_name: [
          {
            required: true,
            message: '请输入商品名称',
            trigger: 'blur'
          }
        ],
        goods_price: [
          {
            required: true,
            message: '请输入商品价格',
            trigger: 'blur'
          }
        ],
        goods_weight: [
          {
            required: true,
            message: '请输入商品重量',
            trigger: 'blur'
          }
        ],
        goods_number: [
          {
            required: true,
            message: '请输入商品数量',
            trigger: 'blur'
          }
        ],
        goods_cat: [
          {
            required: true,
            message: '请选择商品分类',
            trigger: 'blur'
          }
        ]
      },
      // 商品分类数据
      cateList: [],
      // 级联选择配置
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 动态参数列表
      manyTableData: [],
      onlyTableData: [],
      // el-upload需要携带的请求头配置
      uploadHeader: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片的路径
      previewPath: '',
      // 控制预览图片的对话框展示
      previewVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      } else {
        return null
      }
    }
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      } else {
        this.cateList = res.data
      }
    },
    // 监听级联选择变化
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0') {
        if (this.addForm.goods_cat.length !== 3) {
          this.$message.error('请先选择商品分类')
          return false
        }
      }
    },
    async tabClicked () {
      // 访问索引为1的面板（商品参数）
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'many'
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败')
        } else {
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
          })
          this.manyTableData = res.data
        }
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'only'
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品属性失败')
        } else {
          this.onlyTableData = res.data
        }
      }
    },
    // 处理图片预览效果
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 监听图片移除
    handleRemove (file) {
      const filePath = file.response.data.tmp_path
      const index = this.addForm.pics.findIndex(item => {
        item.pic = filePath
      })
      this.addForm.pics.splice(index, 1)
    },
    // 监听图片上传成功
    handleSuccess (response) {
      const picInfo = {
        pic: response.data.tmp_path
      }
      this.addForm.pics.push(picInfo)
    },
    // 添加商品
    addGood () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项目')
        } else {
          // 深拷贝对象
          const addFormClone = _.cloneDeep(this.addForm)
          // 后端要求goods_cat为字符串
          addFormClone.goods_cat = addFormClone.goods_cat.join(',')
          // 处理动态参数和静态属性
          this.manyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            }
            this.addForm.attrs.push(newInfo)
          })
          this.onlyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addForm.attrs.push(newInfo)
          })
          addFormClone.attrs = this.addForm.attrs
          // 数据类型转换
          addFormClone.goods_price = Number(addFormClone.goods_price)
          addFormClone.goods_number = Number(addFormClone.goods_number)
          addFormClone.goods_weight = Number(addFormClone.goods_weight)
          console.log(addFormClone)
          const { data: res } = await this.$http.post('goods', addFormClone)
          if (res.meta.status !== 201) {
            return this.$message.error(`添加商品信息失败 ${res.meta.msg}`)
          } else {
            this.$router.push('/goods')
            this.$message.success('添加商品信息成功')
          }
        }
      })
    }
  }
}
</script>
<style lang="less">
.el-checkbox{
  margin: 0 10px 0 0!important;
}
.preview-pic-dialog{
  text-align: center;
  .previewImg{
    width: 80%;
    height: 60%;
  }
}
.btn-add{
  margin-top: 15px!important;
}
</style>
