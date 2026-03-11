let navObj = null

function setGlobalRef(ref) {
  navObj = ref
}

function navigate(path, props = {}) {
  navObj.navigate(path, props)
}

function goBack() {
  navObj.goBack()
}

// Export the navigation ref for direct access
export const navigationRef = {
  navigate: (path, props = {}) => {
    if (navObj) {
      navObj.navigate(path, props)
    }
  },
  goBack: () => {
    if (navObj) {
      navObj.goBack()
    }
  },
  isReady: () => {
    return navObj !== null
  }
}

export default {
  setGlobalRef,
  navigate,
  goBack,
  navigationRef
}
