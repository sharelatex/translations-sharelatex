const i18n = require('i18next')
const path = require('path')

module.exports = {
  setup(options = {}) {
    const subdomainLang = options.subdomainLang || {}
    const availableLngs = Object.values(subdomainLang).map(c => c.lngCode)

    i18n.init({
      resGetPath: path.resolve(__dirname, '../../', 'locales/__lng__.json'),
      saveMissing: true,
      resSetPath: path.resolve(
        __dirname,
        '../../',
        'locales/missing-__lng__.json'
      ),
      sendMissingTo: 'fallback',
      fallbackLng: options.defaultLng || 'en',
      detectLngFromHeaders: true,
      useCookie: false,
      preload: availableLngs,
      supportedLngs: availableLngs
    })

    function setLangBasedOnDomainMiddleware(req, res, next) {
      // Determine language from subdomain
      const { host } = req.headers
      if (host == null) {
        return next()
      }
      const [subdomain] = host.split(/[.-]/)
      const lang = subdomainLang[subdomain]
        ? subdomainLang[subdomain].lngCode
        : null

      // Unless setLng query param is set, use subdomain lang
      if (!req.originalUrl.includes('setLng') && lang != null) {
        req.i18n.setLng(lang)
      }

      // If the set language (req.lng) is different from the language
      // automatically determined by the i18next middleware (req.language), then
      // set flag which will show a banner offering to switch to the appropriate
      // library
      if (req.language !== req.lng) {
        req.showUserOtherLng = req.language
      }

      next()
    }

    const expressMiddleware = i18n.handle
    return {
      expressMiddleware,
      setLangBasedOnDomainMiddleware,
      i18n,

      // Backwards compatibility with long-standing typo
      expressMiddlewear: expressMiddleware,
      setLangBasedOnDomainMiddlewear: setLangBasedOnDomainMiddleware
    }
  }
}
