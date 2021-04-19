// 获取主题颜色集合
function getThemeCluster(theme) {
  const tintColor = (color, tint) => {
    let red = parseInt(color.slice(0, 2), 16)
    let green = parseInt(color.slice(2, 4), 16)
    let blue = parseInt(color.slice(4, 6), 16)

    if (tint === 0) {
      // when primary color is in its rgb space
      return [red, green, blue].join(',')
    } else {
      red += Math.round(tint * (255 - red))
      green += Math.round(tint * (255 - green))
      blue += Math.round(tint * (255 - blue))

      red = red.toString(16)
      green = green.toString(16)
      blue = blue.toString(16)

      return `#${red}${green}${blue}`
    }
  }

  const shadeColor = (color, shade) => {
    let red = parseInt(color.slice(0, 2), 16)
    let green = parseInt(color.slice(2, 4), 16)
    let blue = parseInt(color.slice(4, 6), 16)

    red = Math.round((1 - shade) * red)
    green = Math.round((1 - shade) * green)
    blue = Math.round((1 - shade) * blue)

    red = red.toString(16)
    green = green.toString(16)
    blue = blue.toString(16)

    return `#${red}${green}${blue}`
  }

  const clusters = [theme]
  for (let i = 0; i <= 9; i++) {
    clusters.push(tintColor(theme, Number((i / 10).toFixed(2))))
  }
  clusters.push(shadeColor(theme, 0.1))
  return clusters
}

// 更新style
function replaceStyle(style, oldValue, newValue) {
  let newStyle = style
  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    oldValue.forEach((color, index) => {
      newStyle = newStyle.replace(new RegExp(color, 'ig'), newValue[index])
    })
  } else {
    newStyle = newStyle.replace(new RegExp(oldValue, 'ig'), newValue)
  }
  return newStyle
}

// 更新主题颜色
function updateStyle(newVal, oldVal, vm, type = 'color') {
  Object.defineProperty(vm, 'chalk', { value: '' })
  let newValue = null
  let oldValue = null
  let stylesFilterReg = null
  if (type === 'color') {
    newValue = getThemeCluster(newVal.replace('#', ''))
    oldValue = getThemeCluster(oldVal.replace('#', ''))
    stylesFilterReg = oldVal
  } else if (type === 'fontSize') {
    newValue = `font-size: ${newVal}px`
    oldValue = new RegExp(`font-size:\\s*${oldVal}px`)
    stylesFilterReg = 'font-size'
  } else {
    return
  }

  const getHandler = (variable, id) => {
    return () => {
      const newStyle = replaceStyle(vm[variable], oldValue, newValue)
      let styleTag = document.getElementById(id)
      if (!styleTag) {
        styleTag = document.createElement('style')
        styleTag.setAttribute('id', id)
        document.head.appendChild(styleTag)
      }
      styleTag.innerText = newStyle
    }
  }

  const chalkHandler = getHandler('chalk', 'chalk-style')
  if (vm.chalk) {
    chalkHandler()
  }

  const styles = [].slice
    .call(document.querySelectorAll('style'))
    .filter(style => {
      const text = style.innerText
      return (
        new RegExp(stylesFilterReg, 'i').test(text) && !/Chalk Variables/.test(text)
      )
    })
  styles.forEach(style => {
    const { innerText } = style
    if (typeof innerText !== 'string') return
    style.innerText = replaceStyle(innerText, oldValue, newValue)
  })
}

function updateThemeColor(newColor, oldColor, vm) {
  document.body.style.setProperty('--theme-color', newColor)
  if (this.themeImage) {
    document.body.style.setProperty(
      '--side-active-color',
      'rgba(255,255,255,0.3)'
    )
  } else {
    document.body.style.setProperty('--side-active-color', newColor)
  }
  return updateStyle(newColor, oldColor, vm)
}

function updateFontSize(newSize) {
  document.body.style.setProperty('--font-size', newSize + 'px')
  // return updateStyle(newSize, oldSize, vm, 'fontSize')
}

const getLocalSettingData = () => {
  let localSetting = {}
  try {
    const localSettingStr = localStorage.getItem('setting')
    localSetting = JSON.parse(localSettingStr)
  } catch (error) {
    console.error(error)
  }
  return localSetting
}

const saveLocalSettingData = (data) => {
  try {
    if (typeof data !== 'string') {
      data = JSON.stringify(data)
    }
    localStorage.setItem('setting', data)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

module.exports = {
  updateThemeColor,
  updateFontSize,
  getLocalSettingData,
  saveLocalSettingData
}
