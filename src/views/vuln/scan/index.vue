<template>
  <div class="app-container">
    <el-form ref="elForm" :model="formData" :rules="rules" size="medium" :inline="true" label-width="100px">
      <el-form-item label="脚本选择" prop="scriptSelect">
        <el-select v-model="formData.scriptSelect" placeholder="可多选"  multiple filterable clearable>
          <el-option v-for="item in scriptSelectOptions" :key="item" :label="item"
                     :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="formData.checked">全选</el-checkbox>
      </el-form-item>
      <br>
      <el-form-item label="起始地址" prop="srcIP" >
        <el-input v-model="formData.srcIP" placeholder="" :disabled="srcIPFlag" style="width: 350px" clearable>
        </el-input>
      </el-form-item>
      <el-form-item label="结束地址" prop="desIP" >
        <el-input v-model="formData.desIP" placeholder="非必填项" :disabled="desIPFlag" style="width: 350px" clearable>
        </el-input>
      </el-form-item>
      <el-form-item size="medium">
        <el-button type="primary" @click="submitForm1">扫描</el-button>
      </el-form-item>

      <el-upload
        style="padding-left: 30px"
        ref="upload"
        :limit="1"
        name="file"
        accept=".txt"
        :action="upload.url"
        :headers="upload.headers"
        :file-list="upload.fileList"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :on-change="handleChange"
        :before-remove="handleRemove"
        :auto-upload="false">
        <el-button slot="trigger" size="small" type="primary">选取地址文件</el-button>
        <!--<el-button style="margin-left: 10px;" size="small" type="success" :loading="upload.isUploading" @click="submitUpload">上传到服务器</el-button>-->
        <div slot="tip" class="el-upload__tip" style="font-size: 14px;color: red">提示：此按钮可选择地址文件作为输入，只能上传txt文件，txt文件每行应只有一个IPv6地址。选择地址文件后，输入框中的“起始地址”和“结束地址”无效！</div>
      </el-upload>
    </el-form>
    <br>
    <div v-for="(cmd,index) in commandlist" :key="index">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>扫描结果</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="deleteRecord(cmd)">删除</el-button>
        </div>
        <div v-html="cmd.results" v-loading="cmd.loading">
        </div>
      </el-card>
      <br>
    </div>
  </div>
</template>
<script>
  import { initVulnScript, scanVuln} from "@/api/vuln/scan";
  import { getToken } from "@/utils/auth";
  export default {
    components: {},
    props: [],
    data() {
      return {
        formData: {
          uuid:"",
          scriptSelect: [],
          checked: true,
          srcIP: "2001:da8:9001:1013:1c79:6336:5c33:7a76",
          desIP: "",
          useFile: false,
          addrFileName: "",
        },
        // 上传参数
        upload: {
          // 是否禁用上传
          isUploading: false,
          // 设置上传的请求头部
          headers: { Authorization: "Bearer " + getToken() },
          // 上传的地址
          url: process.env.VUE_APP_BASE_API + "/vuln/scan/importAddr",
          // 上传的文件列表
          fileList: []
        },
        srcIPFlag: false,
        desIPFlag: false,
        scriptSelectRequiredFlag: true,
        rules: {
          scriptSelect: [{
            type: 'array',
            message: '请至少选择一个漏洞或者全选',
            trigger: 'change'
          }],
          srcIP: [{
            required: true,
            pattern: /^([0-9a-f]{0,4}:){7}[0-9a-f]{1,4}$/,
            message: '请输入正确的IPv6靶机地址',
            trigger: 'blur'
          }],
          desIP: [{
            required: false,
            message: '请输入正确的IPv6靶机地址',
            trigger: 'blur'
          }],
        },
        scriptSelectOptions: [],
        //loading: false,
        commandlist:[
         /* {
            uuid:,
            command:"",
            results:"",
            loading: false
          },*/
        ]

      }
    },
    computed: {},
    watch: {},
    created() {
      initVulnScript().then(response => {
        this.scriptSelectOptions = response.data;
      });
    },
    mounted() {},
    methods: {
      submitForm(cmd) {
        this.$refs['elForm'].validate(valid => {
          if (!valid) return
          // TODO 提交表单
          if(this.formData.useFile){
            this.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + "已选择种子文件作为输入"  + "</div>", "提示", { dangerouslyUseHTMLString: true });
          }
          var uuidx = this.uuid(8,10);
          this.commandlist.unshift({
            uuid: uuidx,
            command: "",
            results: "",
            loading: true
          })
          this.formData.uuid = uuidx;
          scanVuln(this.formData).then(response => {
            for(let item of this.commandlist){
              if(item.uuid == response.data.uuid){
                item.results = response.data.msg;
                item.loading = false;
              }
            }
          })
        })
      },
      resetForm() {
        this.$refs['elForm'].resetFields()
      },
      deleteRecord(cmd) {
        let i = 0;
        for(let item of this.commandlist){
          if(item.uuid == cmd.uuid){
            this.commandlist.splice(i,1);
            break;
          }
          i++;
        }

      },
      // 文件提交处理
      submitUpload() {
        return new Promise((resolve)=>{
          resolve(
            this.$refs.upload.submit()
          );
        })
      },
      submitForm1(){
        this.submitUpload().then(()=>{
          this.submitForm();
        })
      },
      // 文件上传中处理
      handleFileUploadProgress(event, file, fileList) {
        this.upload.isUploading = true;
      },
      // 文件上传成功处理
      handleFileSuccess(response, file, fileList) {
        this.upload.isUploading = false;
      },
      handleChange(file, fileList){
        this.srcIPFlag = true;
        this.desIPFlag = true;
        this.formData.useFile = true;
        this.formData.addrFileName = file.name;
        console.log(this.formData.addrFileName);
      },
      handleRemove(file, fileList){
        this.srcIPFlag = false;
        this.desIPFlag = false;
        this.formData.useFile = false;
      },

      uuid(len, radix){
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [], i;
        radix = radix || chars.length;

        if (len) {
          // Compact form
          for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
          // rfc4122, version 4 form
          var r;
          // rfc4122 requires these characters
          uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
          uuid[14] = '4';
          // Fill in random data.  At i==19 set the high bits of clock sequence as
          // per rfc4122, sec. 4.1.5
          for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
              r = 0 | Math.random() * 16;
              uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
          }
        }
        return uuid.join('');
    },
  }

  }

</script>
<style>
</style>
