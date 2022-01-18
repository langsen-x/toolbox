const fs = require('fs')
const name = 'area.json'
const path = `./src/config/${name}`
const { areaList } = require('./area')
const {
  // eslint-disable-next-line camelcase
  province_list,
  // eslint-disable-next-line camelcase
  city_list,
  // eslint-disable-next-line camelcase
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

function writeFile(path, data, callback) {
  fs.writeFile(path, data, function(err) {
    if (err) {
      console.log(err)
      // eslint-disable-next-line node/no-callback-literal
      callback({ result: false })
    }
    // eslint-disable-next-line node/no-callback-literal
    callback({ result: true })
  })
}

writeFile(path, JSON.stringify(address), (obj) => {
  if (obj.result) {
    console.log('数据写入成功！')
  } else {
    console.log('数据写入失败！')
  }
})
