<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="脚本名称" prop="scriptName">
        <el-input
          v-model="queryParams.scriptName"
          placeholder="请输入脚本名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="脚本描述" prop="scriptDescription">
        <el-input
          v-model="queryParams.scriptDescription"
          placeholder="请输入脚本描述"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['vuln:repository:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['vuln:repository:export']"
        >导出</el-button>
      </el-col>
      <el-button
        type="success"
        plain
        icon="el-icon-edit"
        size="mini"
        @click="handleUpdateScript"
        v-hasPermi="['vuln:repository:edit']"
      >更新</el-button>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="repositoryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="50" >
        <template slot-scope="scope">
          {{ (scope.$index+1)+(updateCurrentPage()-1)*queryParams.pageSize }}
        </template>
      </el-table-column>
      <el-table-column label="脚本名称" align="center" prop="scriptName" />
      <el-table-column label="脚本描述" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="showDescription(scope.row)"

          >查看</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['vuln:repository:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      ref="page"
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 查看描述弹框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>脚本描述</span>
        </div>
        <div v-html="des" style="white-space:pre-wrap">
        </div>
      </el-card>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { updateScript, listRepository, getRepository, delRepository, addRepository, updateRepository } from "@/api/vuln/repository";

export default {
  name: "Repository",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 漏洞库表格数据
      repositoryList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        scriptName: null,
        scriptDescription: null
      },
      // 表单参数
      form: {},
      //描述
      des: "",
      // 表单校验
      rules: {
        scriptName: [
          { required: true, message: "脚本名称不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    updateCurrentPage() {
      return this.$refs["page"].currentPage;
    },
    /** 查询漏洞库列表 */
    getList() {
      this.loading = true;
      listRepository(this.queryParams).then(response => {
        this.repositoryList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        scriptId: null,
        scriptName: null,
        scriptDescription: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.scriptId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加漏洞库";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const scriptId = row.scriptId || this.ids
      getRepository(scriptId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改漏洞库";
      });
    },



    /* 更新脚本 */
    handleUpdateScript(){
      updateScript();
    },
    /* 展示描述 */
    showDescription(row){
      console.log(row.scriptDescription);
      this.des = row.scriptDescription;
      this.open = true;
      this.title = row.scriptName;
    },



    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.scriptId != null) {
            updateRepository(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addRepository(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const scriptIds = row.scriptId || this.ids;
      this.$modal.confirm('是否确认删除漏洞库编号为"' + scriptIds + '"的数据项？').then(function() {
        return delRepository(scriptIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('vuln/repository/export', {
        ...this.queryParams
      }, `repository_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
