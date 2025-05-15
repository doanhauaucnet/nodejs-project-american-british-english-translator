'use strict';

const Translator = require('../components/translator.js');

module.exports = function (app) {

  const translator = new Translator();

  app.route('/api/translate')
    .post((req, res) => {
      const { text, locale } = req.body;

      // Handle missing fields
      if (text === undefined || locale === undefined) {
        return res.json({ error: 'Required field(s) missing' });
      }

      // Handle empty text
      if (text.trim() === '') {
        return res.json({ error: 'No text to translate' });
      }

      // Handle invalid locale
      if (
        locale !== 'american-to-british' &&
        locale !== 'british-to-american'
      ) {
        return res.json({ error: 'Invalid value for locale field' });
      }

      const result = translator.translate(text, locale);

      return res.json(result);
    });
};
