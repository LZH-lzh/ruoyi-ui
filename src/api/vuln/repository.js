import request from '@/utils/request'

// 查询漏洞库列表
export function listRepository(query) {
  return request({
    url: '/vuln/repository/list',
    method: 'get',
    params: query
  })
}

// 查询漏洞库详细
export function getRepository(scriptId) {
  return request({
    url: '/vuln/repository/' + scriptId,
    method: 'get'
  })
}

// 新增漏洞库
export function addRepository(data) {
  return request({
    url: '/vuln/repository',
    method: 'post',
    data: data
  })
}

// 修改漏洞库
export function updateRepository(data) {
  return request({
    url: '/vuln/repository',
    method: 'put',
    data: data
  })
}

// 删除漏洞库
export function delRepository(scriptId) {
  return request({
    url: '/vuln/repository/' + scriptId,
    method: 'delete'
  })
}
// 更新漏洞库
export function updateScript() {
  return request({
    url: '/vuln/repository/update',
    method: 'get'
  })
}
