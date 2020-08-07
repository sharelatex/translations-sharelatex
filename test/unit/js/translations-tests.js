const { expect } = require('chai')

const translations = require('../../../app/js/translations')

describe('translations', function() {
  beforeEach(function() {
    this.translations = translations.setup({
      subdomainLang: {
        www: { lngCode: 'en', url: 'www.sharelatex.com' },
        fr: { lngCode: 'fr', url: 'fr.sharelatex.com' },
        da: { lngCode: 'da', url: 'da.sharelatex.com' }
      }
    })

    this.req = {
      originalUrl: "doesn'tmatter.sharelatex.com/login",
      headers: {
        'accept-language': ''
      }
    }
    this.res = {
      getHeader: () => {},
      setHeader: () => {}
    }
  })

  describe('query string detection', function() {
    it('sets the language to french if the setLng query string is fr', function(done) {
      this.req.originalUrl = 'www.sharelatex.com/login?setLng=fr'
      this.req.url = 'www.sharelatex.com/login'
      this.req.query = { setLng: 'fr' }
      this.req.headers.host = 'www.sharelatex.com'
      this.translations.expressMiddleware(this.req, this.res, () => {
        this.translations.setLangBasedOnDomainMiddleware(
          this.req,
          this.res,
          () => {
            expect(this.req.lng).to.equal('fr')
            done()
          }
        )
      })
    })
  })

  describe('setLangBasedOnDomainMiddleware', function() {
    it('should set the lang to french if the domain is fr', function(done) {
      this.req.url = 'fr.sharelatex.com/login'
      this.req.headers.host = 'fr.sharelatex.com'
      this.translations.expressMiddleware(this.req, this.res, () => {
        this.translations.setLangBasedOnDomainMiddleware(
          this.req,
          this.res,
          () => {
            expect(this.req.lng).to.equal('fr')
            done()
          }
        )
      })
    })

    it('ignores domain if setLng query param is set', function(done) {
      this.req.originalUrl = 'fr.sharelatex.com/login?setLng=en'
      this.req.url = 'fr.sharelatex.com/login'
      this.req.query = { setLng: 'en' }
      this.req.headers.host = 'fr.sharelatex.com'
      this.translations.expressMiddleware(this.req, this.res, () => {
        this.translations.setLangBasedOnDomainMiddleware(
          this.req,
          this.res,
          () => {
            expect(this.req.lng).to.equal('en')
            done()
          }
        )
      })
    })

    describe('showUserOtherLng', function() {
      it('should set it to true if the language based on headers is different to lng', function(done) {
        this.req.headers['accept-language'] = 'da, en-gb;q=0.8, en;q=0.7'
        this.req.url = 'fr.sharelatex.com/login'
        this.req.headers.host = 'fr.sharelatex.com'
        this.translations.expressMiddleware(this.req, this.res, () => {
          this.translations.setLangBasedOnDomainMiddleware(
            this.req,
            this.res,
            () => {
              expect(this.req.showUserOtherLng).to.equal('da')
              done()
            }
          )
        })
      })

      it('should not set prop', function(done) {
        this.req.headers['accept-language'] = 'da, en-gb;q=0.8, en;q=0.7'
        this.req.url = 'da.sharelatex.com/login'
        this.req.headers.host = 'da.sharelatex.com'
        this.translations.expressMiddleware(this.req, this.res, () => {
          this.translations.setLangBasedOnDomainMiddleware(
            this.req,
            this.res,
            () => {
              expect(this.req.showUserOtherLng).to.not.exist
              done()
            }
          )
        })
      })
    })
  })
})
