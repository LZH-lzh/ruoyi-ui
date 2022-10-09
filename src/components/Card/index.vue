<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>扫描结果</span>
      <el-button style="float: right; padding: 3px 0" type="text">清空</el-button>
    </div>
    <div v-html="results" v-loading="loading">
    </div>
  </el-card>
</template>

<script>
export default {
  name: "ImagePreview",
  props: {
    src: {
      type: String,
      default: ""
    },
    width: {
      type: [Number, String],
      default: ""
    },
    height: {
      type: [Number, String],
      default: ""
    }
  },
  computed: {
    realSrc() {
      if (!this.src) {
        return;
      }
      let real_src = this.src.split(",")[0];
      if (isExternal(real_src)) {
        return real_src;
      }
      return process.env.VUE_APP_BASE_API + real_src;
    },
    realSrcList() {
      if (!this.src) {
        return;
      }
      let real_src_list = this.src.split(",");
      let srcList = [];
      real_src_list.forEach(item => {
        if (isExternal(item)) {
          return srcList.push(item);
        }
        return srcList.push(process.env.VUE_APP_BASE_API + item);
      });
      return srcList;
    },
    realWidth() {
      return typeof this.width == "string" ? this.width : `${this.width}px`;
    },
    realHeight() {
      return typeof this.height == "string" ? this.height : `${this.height}px`;
    }
  },
};
</script>

<style>
</style>
