/* eslint-disable */
const path = require('path')
const fs = require('fs')
const axios = require('axios')

const areaDataUrl = 'https://gitee.com/vant-contrib/vant/raw/main/packages/vant-area-data/src/index.ts'
axios
  .get(
    areaDataUrl,
  )
  .then((res) => {
    const { data } = res
    const js_tree_path = path.join(__dirname, 'areaTree.js')
    const js_path = path.join(__dirname, 'area.js')
    let dataStr = JSON.stringify(data)
    let needData = dataStr.slice(0, dataStr.indexOf('type CascaderOption'))
    needData = `${needData.slice(0, needData.length - 4)}"`
    let tempData = JSON.parse(needData)
    // let tempData = JSON.parse(dataStr)
    tempData = tempData.replace('export const areaList: {\n' +
      '  province_list: Record<string, string>;\n' +
      '  city_list: Record<string, string>;\n' +
      '  county_list: Record<string, string>;\n' +
      '} ', 'export const areaList')
    let areaTempData = tempData.replace('export ', '') + '\n' + 'exports.areaList = areaList'
    writeFile(js_path, areaTempData, (obj) => {
      if (obj.result) {
        console.log('area.js 数据写入成功！')
        areaData()
      } else {
        console.log('area.js 数据写入失败！')
      }
    })
    writeFile(js_tree_path, tempData, (obj) => {
      if (obj.result) {
        console.log('areaTree.js 数据写入成功！')
      } else {
        console.log('areaTree.js 数据写入失败！')
      }
      areaTreeData(splitType(data))
    })
  })
  .catch((e) => {
    console.log('e', e)
  })

function writeFile(path, data, callback) {
  fs.writeFile(path, data, function(err) {
    if (err) {
      console.log(err)
      callback({ result: false })
    }
    callback({ result: true })
  })
}

function splitType(data) {
  const areaStr = data.replace('export const areaList: {\n' +
    '  province_list: Record<string, string>;\n' +
    '  city_list: Record<string, string>;\n' +
    '  county_list: Record<string, string>;\n' +
    '} = ', '')
  const splitArr = areaStr.split('\n')
  const splitArrLen = splitArr.length
  // console.log("splitArr", splitArr)
  // console.log("splitArrLen", splitArrLen)
  const province_idx = splitArr.findIndex((i) => i === '  province_list: {')
  const city_idx = splitArr.findIndex((i) => i === '  city_list: {')
  const county_idx = splitArr.findIndex((i) => i === '  county_list: {')
  const province_arr = splitArr.slice(province_idx + 1, city_idx - 1)
  const city_arr = splitArr.slice(city_idx + 1, county_idx - 1)
  const county_arr = splitArr.slice(county_idx + 1, splitArrLen - 1 - 1)
  // console.log("province_idx", province_idx)
  // console.log("city_idx", city_idx)
  // console.log("county_idx", county_idx)
  // console.log("province_arr", province_arr)
  // console.log("city_arr", city_arr)
  // console.log("county_arr", county_arr)
  const province_list = {}
  const city_list = {}
  const county_list = {}
  province_arr.map((i) => {
    const i_split = i.split(': ')
    if (i_split && i_split.length > 1) {
      province_list[i_split[0].replace(/ /g, '')] = i_split[1]
        .replace(/'/g, '')
        .replace(',', '')
    }
  })
  city_arr.map((i) => {
    const i_split = i.split(': ')
    if (i_split && i_split.length > 1) {
      city_list[i_split[0].replace(/ /g, '')] = i_split[1]
        .replace(/'/g, '')
        .replace(',', '')
    }
  })
  county_arr.map((i) => {
    const i_split = i.split(': ')
    if (i_split && i_split.length > 1) {
      county_list[i_split[0].replace(/ /g, '')] = i_split[1]
        .replace(/'/g, '')
        .replace(',', '')
    }
  })
  // console.log("province_list", province_list)
  // console.log("city_list", city_list)
  // console.log("county_list", county_list)
  return {
    province_list,
    city_list,
    county_list,
  }
}

function areaData() {
  const { areaList } = require('./area')
  const json_path = path.join(__dirname, 'area.json')
  const {
    province_list,
    city_list,
    county_list,
  } = areaList

  const provinceList = []
  for (const [key, value] of Object.entries(province_list)) {
    provinceList.push({
      label: value,
      value: key,
    })
  }
  const cityList = []
  let city = {}
  let tempCityKey = ''
  for (const [key, value] of Object.entries(city_list)) {
    const cityKey = (key + '').substr(0, 2)
    if (tempCityKey !== cityKey) {
      if (city?.parent) {
        cityList.push(city)
      }
      city = {}
      tempCityKey = cityKey
      city.parent = cityKey
      city.children = []
      city.children.push({
        label: value,
        value: key,
      })
    } else {
      city.children.push({
        label: value,
        value: key,
      })
    }
  }
  if (city?.parent) {
    cityList.push(city)
  }

  const countryList = []
  let country = {}
  let tempCountryKey = ''
  for (const [key, value] of Object.entries(county_list)) {
    const countyKey = (key + '').substr(0, 4)
    if (tempCountryKey !== countyKey) {
      if (country?.parent) {
        countryList.push(country)
      }
      country = {}
      tempCountryKey = countyKey
      country.parent = countyKey
      country.children = []
      country.children.push({
        label: value,
        value: key,
      })
    } else {
      country.children.push({
        label: value,
        value: key,
      })
    }
  }
  if (country?.parent) {
    countryList.push(country)
  }

  const address = {
    province: provinceList,
    city: cityList,
    country: countryList,
  }

  writeFile(json_path, JSON.stringify(address), (obj) => {
    if (obj.result) {
      console.log('area.json 数据写入成功！')
    } else {
      console.log('area.json 数据写入失败！')
    }
  })
}

function areaTreeData(areaList) {
  const areaTree = []
  const tree_path = path.join(__dirname, 'areaTree.json')
  const {
    province_list,
    city_list,
    county_list,
  } = areaList

  // console.log("province_list", province_list)
  // console.log("city_list", city_list)
  // console.log("county_list", county_list)

  const countryList = []
  // eslint-disable-next-line camelcase
  const country_obj = {}
  let country = {}
  let tempCountryKey = ''

  const cityList = []
  // eslint-disable-next-line camelcase
  const city_obj = {}
  let city = {}
  let tempCityKey = ''

  for (const [code, name] of Object.entries(county_list)) {
    const countryKey = (code + '').slice(0, 4)
    if (tempCountryKey !== countryKey) {
      if (country?.value) {
        countryList.push(country)
      }
      tempCountryKey = countryKey
      country = {}
      country.value = countryKey
      country.children = []
      country.children.push({
        text: name,
        value: code,
      })
    } else {
      country.children.push({
        text: name,
        value: code,
      })
    }
  }
  if (country?.value) {
    countryList.push(country)
  }
  countryList.forEach((country) => {
    country_obj[country.value] = country.children
  })
  // console.log('countryList:', countryList)
  // console.log('country_obj:', country_obj)

  for (const [code, name] of Object.entries(city_list)) {
    const cityKey = (code + '').slice(0, 2)
    const country = {
      text: name,
      value: code,
      children: country_obj[(code + '').slice(0, 4)],
    }
    if (tempCityKey !== cityKey) {
      if (city?.value) {
        cityList.push(city)
      }
      tempCityKey = cityKey
      city = {}
      city.value = cityKey
      city.children = []
      city.children.push(country)
    } else {
      city.children.push(country)
    }
  }
  if (city?.value) {
    cityList.push(city)
  }
  cityList.forEach((city) => {
    city_obj[city.value] = city.children
  })
  // console.log('cityList:', cityList)
  // console.log('city_obj:', city_obj)

  for (const [code, name] of Object.entries(province_list)) {
    areaTree.push({
      text: name,
      value: code,
      children: city_obj[(code + '').slice(0, 2)],
    })
  }

  writeFile(tree_path, JSON.stringify(areaTree), (obj) => {
    if (obj.result) {
      console.log('areaTree.json 数据写入成功！')
    } else {
      console.log('areaTree.json 数据写入失败！')
    }
  })
}
