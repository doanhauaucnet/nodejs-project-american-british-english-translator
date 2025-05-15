const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

class Translator {
    translate(text, locale) {
      if (!text || locale === undefined) {
        return { error: 'Required field(s) missing' };
      }
  
      if (text.trim() === '') {
        return { error: 'No text to translate' };
      }
  
      if (locale !== 'american-to-british' && locale !== 'british-to-american') {
        return { error: 'Invalid value for locale field' };
      }
  
      let translation = text;
      let changed = false;
  
      if (locale === 'american-to-british') {
        ({ translation, changed } = this.translateAmericanToBritish(text));
      } else {
        ({ translation, changed } = this.translateBritishToAmerican(text));
      }
  
      return {
        text,
        translation: changed ? translation : "Everything looks good to me!"
      };
    }
  
    translateAmericanToBritish(text) {
      return this.translateWithDictionaries(
        text,
        americanOnly,
        americanToBritishSpelling,
        americanToBritishTitles,
        'american'
      );
    }
  
    translateBritishToAmerican(text) {
      const britishToAmericanTitles = Object.fromEntries(
        Object.entries(americanToBritishTitles).map(([k, v]) => [v, k])
      );
      return this.translateWithDictionaries(
        text,
        britishOnly,
        Object.fromEntries(Object.entries(americanToBritishSpelling).map(([k, v]) => [v, k])),
        britishToAmericanTitles,
        'british'
      );
    }
  
    translateWithDictionaries(text, onlyTerms, spelling, titles, variant) {
      let translation = text;
      let changed = false;
  
      const highlight = (term) => `<span class="highlight">${term}</span>`;
  
      // Handle titles
      for (const [title, replacement] of Object.entries(titles)) {
        const regex = new RegExp(`\\b${title}`, 'gi');
        if (regex.test(translation)) {
          translation = translation.replace(regex, (match) => {
            changed = true;
            const formatted = replacement[0].toUpperCase() + replacement.slice(1);
            return highlight(formatted);
          });
        }
      }
  
      // Handle spelling
      for (const [word, replacement] of Object.entries(spelling)) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        if (regex.test(translation)) {
          translation = translation.replace(regex, (match) => {
            changed = true;
            return highlight(replacement);
          });
        }
      }
  
      // Handle exclusive terms
      for (const [term, replacement] of Object.entries(onlyTerms)) {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        if (regex.test(translation)) {
          translation = translation.replace(regex, (match) => {
            changed = true;
            return highlight(replacement);
          });
        }
      }
  
      // Handle time
      const timeRegex = variant === 'american'
        ? /(\d{1,2}):(\d{2})/g
        : /(\d{1,2})\.(\d{2})/g;
      const timeReplacement = variant === 'american' ? '$1.$2' : '$1:$2';
      translation = translation.replace(timeRegex, (match) => {
        changed = true;
        return highlight(match.replace(/[:.]/, variant === 'american' ? '.' : ':'));
      });
  
      return { translation, changed };
    }
  }
  
  module.exports = Translator;
  