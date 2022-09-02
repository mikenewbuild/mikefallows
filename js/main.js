import Alpine from 'alpinejs'

window.darkMode = {
  init() {
    this.toggle(this.status)
  },
  get os() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  },
  get saved() {
    return localStorage.darkModePreference
  },
  get status() {
    return this.saved === 'dark' || (this.saved !== 'light' && this.os === 'dark')
  },
  toggle(prefersDark) {
    document.documentElement.classList.toggle('dark', prefersDark)
  },
  save(prefersDark) {
    localStorage.darkModePreference = prefersDark ? 'dark' : 'light'

    this.toggle(prefersDark)
  }
}

window.darkMode.init();

window.Alpine = Alpine

Alpine.start()
