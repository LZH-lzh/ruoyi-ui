import request from '@/utils/request'

// 查询漏洞扫描历史记录列表
export function listHistory(query) {
  return request({
    url: '/vuln/history/list',
    method: 'get',
    params: query
  })
}

// 查询漏洞扫描历史记录详细
export function getHistory(recordsId) {
  return request({
    url: '/vuln/history/' + recordsId,
    method: 'get'
  })
}

// 新增漏洞扫描历史记录
export function addHistory(data) {
  return request({
    url: '/vuln/history',
    method: 'post',
    data: data
  })
}

// 修改漏洞扫描历史记录
export function updateHistory(data) {
  return request({
    url: '/vuln/history',
    method: 'put',
    data: data
  })
}

// 删除漏洞扫描历史记录
export function delHistory(recordsId) {
  return request({
    url: '/vuln/history/' + recordsId,
    method: 'delete'
  })
}

// 删除漏洞扫描历史记录
export function scanVuln() {
  return request({
    url: '/vuln/history/scanvuln' ,
    method: 'get'
  })
}

