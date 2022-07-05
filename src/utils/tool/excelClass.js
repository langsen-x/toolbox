import { isEmpty } from '@utils'

class Field {
  constructor(oldF, newF) {
    this.oldF = oldF
    this.newF = newF
  }

  setOldF(fields) {
    this.oldF = fields
  }

  setNewF(fields) {
    this.newF = fields
  }
}

export class Json extends Field {
  constructor(oldF, newF, rows) {
    super(oldF, newF)
    this.rows = rows
    this.originJsonData = []
    this.handleJsonData = []
  }

  getRows() {
    return this.rows
  }

  setRows(data) {
    this.rows = data
  }

  getOriginJsonData() {
    return this.originJsonData
  }

  getHandleJsonData() {
    return this.handleJsonData
  }

  setOriginJsonData(data) {
    this.originJsonData = data
  }

  setHandleJsonData(data) {
    this.handleJsonData = data
  }

  /**
   * @author: langsen-x
   * @description: 返回初始化的处理的json
   * @param: null
   * @return: Array
   * @date: 2021/12/6 10:10
   */
  genOriginJsonData(rows) {
    let class1Text = ''
    let class2Text = ''
    rows.forEach((row) => {
      if (!isEmpty(row[0])) {
        class1Text = row[0]
      }
      if (!isEmpty(row[1])) {
        class2Text = row[1]
      }
      row[0] = class1Text
      row[1] = class2Text
      const json = {}
      for (let i = 0; i < row.length; i++) {
        json[this.oldF[i]] = (row[i] || '').toString()
      }
      this.originJsonData.push(json)
    })
    this.setRows(rows)
    this.setHandleJsonData(this.originJsonData)
  }

  /**
   * @author: langsen-x
   * @description: 返回处理后的json
   * @param: Array
   * @return: Array
   * @date: 2021/12/6 10:12
   */
  genHandleJsonData() {
    console.log('load parent method genHandleJsonData!')
  }
}

export class Gen extends Json {
  constructor(oldF, newF, rows, fItem, groupConfig) {
    super(oldF, newF, rows)
    this.fItem = fItem
    this.groupConfig = groupConfig
    this.finalJson = []
  }

  setFItem(finalF) {
    this.fItem = finalF
  }

  setGroupConfig(groupJson) {
    this.groupConfig = groupJson
  }

  setHandleJsonData(data) {
    super.setHandleJsonData(data)
  }

  async genJson() {
    try {
      return await this.genFinalJson(this.fItem, this.groupConfig)
    } catch (e) {
      console.log(`genFinalJson err:${e}, `)
    }
  }

  genFinalJson(finalF = this.fItem, groupJson = this.groupConfig) {
    return new Promise((resolve, reject) => {
      if (isEmpty(finalF)) {
        throw Error('finalF is empty')
      } else {
        if (!finalF.group || Object.keys(finalF).length === 1) {
          throw Error('finalF contains key group and finalF need other key')
        }
      }
      if (isEmpty(groupJson)) {
        throw Error('groupJson is empty')
      }
      const obj = {
        fullObj: function(args) {
          const item = {}
          Object.keys(finalF).forEach((key, idx) => {
            if (key !== 'group') {
              item[finalF[key]] = args[idx]
            }
          })
          return item
        },
      }

      const groupObj = {}
      const promises = []
      const handleJsonData = super.getHandleJsonData()
      groupJson.forEach(group => {
        let p
        // eslint-disable-next-line no-useless-call
        const pF = obj.fullObj.call(obj, group.objKey)
        // eslint-disable-next-line camelcase
        const pF_ext = group.ext
        if (group.type === 'group') {
          p = getGroup(handleJsonData, group.groupF, pF, pF_ext)
        } else if (group.type === 'unique') {
          p = unique(handleJsonData, pF)
        }
        promises.push(p)
      })

      Promise.all(promises).then(results => {
        results.forEach((res, idx) => {
          if (idx === 0) {
            groupObj[idx] = Object.assign({}, res)
          } else if (idx !== 0 && idx !== results.length - 1) {
            const tempGroup = []
            for (const [key, value] of Object.entries(Object.assign({}, res))) {
              if (Array.isArray(value)) {
                value.map((v) => {
                  if (idx === 1) {
                    v.children = groupObj[idx - 1][v[finalF.group]]
                  } else {
                    v.children = Object.fromEntries(groupObj[idx - 1])[v[finalF.group]]
                  }
                })
                tempGroup.push([key, value])
              }
            }
            groupObj[idx] = tempGroup
          } else {
            const final = [].concat(res)
            final.map((f) => {
              f.children = Object.fromEntries(groupObj[idx - 1])[f[finalF.group]]
            })
            resolve(final)
          }
        })
      }).catch(err => {
        reject(err)
      })

      function getGroup(list, groupF, handleFields, extFields) {
        let group = []
        return new Promise((resolve) => {
          group = groupBy(list, (attr) => {
            return attr[groupF]
          }, handleFields, extFields)
          resolve(group)
        }).catch(e => {
          console.log('getGroup err:', e)
        })
      }

      function groupBy(list, fn, handleFields = {}, extFields = []) {
        const groups = {}
        list.forEach((item) => {
          const group = fn(item)
          groups[group] = groups[group] || []
          groups[group].push(item)
        })

        const newArr = []
        for (let [key, value] of Object.entries(groups)) {
          value = unique(value, handleFields, extFields)
          newArr.push([key, value])
        }
        return Object.fromEntries(newArr)
      }

      // 数组对象去重
      function unique(list, obj, extFields = []) {
        const map = new Map()
        list.forEach((item) => {
          const newItem = {} // 处理原字段
          Object.keys(finalF).forEach((key) => {
            if (key !== 'group') {
              newItem[finalF[key]] = item[obj[finalF[key]]]
            }
          })
          if (extFields.length !== 0) {
            extFields.forEach(key => {
              newItem[key] = item[key]
            })
          }
          if (!map.has(newItem[finalF.group])) {
            map.set(newItem[finalF.group], newItem)
          }
        })
        return [...map.values()]
      }
    })
  }
}
