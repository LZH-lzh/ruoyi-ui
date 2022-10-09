import request from '@/utils/request'

//初始化脚本
export function initVulnScript() {
  return request({
    url: '/vuln/scan/initscript',
    methos: 'get'
  })
}
// 漏洞扫描
export function scanVuln(data) {
  return request({
    url: '/vuln/scan/scanvuln' ,
    method: 'post',
    data: data
  })
}


