export default class Facebook {
  loginProviderObj = {};

  constructor (clientId) {
    this.loginProviderObj.id = clientId
    this.loginProviderObj.name = 'facebook'
    this.loginProviderObj.url = 'https://connect.facebook.net/en_US/sdk.js'
  }

  static drawUser (response) {
    return {
      id: response.id,
      name: response.name,
      email: response.email,
      image: 'https://graph.facebook.com/' + response.id + '/picture?type=normal',
      token: response.token
    }
  }

  loadScript (obj, onload) {
    if (document.getElementById(obj.name)) { return }
    const signInJS = document.createElement('script')
    signInJS.async = true
    signInJS.src = obj.url
    signInJS.onload = onload
    document.head.appendChild(signInJS)
  }

  initialize () {
    return new Promise((resolve, reject) => {
      this.loadScript(this.loginProviderObj, () => {
        window.FB.init({
          appId: this.loginProviderObj.id,
          autoLogAppEvents: true,
          cookie: true,
          xfbml: true,
          version: 'v2.10'
        })
        window.FB.AppEvents.logPageView()

        window.FB.getLoginStatus(function (response) {
          if (response.status === 'connected') {
            const accessToken = window.FB.getAuthResponse().accessToken
            window.FB.api('/me?fields=name,email,picture', (res) => {
              resolve(Facebook.drawUser(Object.assign({}, { token: accessToken }, res)))
            })
          }
        })
      })
    })
  }

  signIn () {
    return new Promise((resolve, reject) => {
      window.FB.login((response) => {
        if (response.authResponse) {
          const accessToken = window.FB.getAuthResponse().accessToken
          window.FB.api('/me?fields=name,email,picture', (res) => {
            resolve(Facebook.drawUser(Object.assign({}, { token: accessToken }, res)))
          })
        }
      }, { scope: 'email,public_profile' })
    })
  }

  signOut () {
    return new Promise((resolve, reject) => {
      window.FB.logout((response) => {
        resolve(response)
      })
    })
  }
}
