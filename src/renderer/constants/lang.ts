const LOCAL_LANGS = [
  'de',
  'en',
  'es',
  'et',
  'fi',
  'fr',
  'hu',
  'it',
  'nl',
  'pt',
  'ru',
  'sv',
]

// Languages that have no active translator
const STALE_LANGS = ['it']

const LOCALES = [
  {
    code: 'de',
    iso: 'de-DE',
    file: 'de.json',
    jw: 'X',
    name: 'Deutsch (German)',
  },
  {
    code: 'en',
    iso: 'en-US',
    file: 'en.json',
    jw: 'E',
    name: 'English (English)',
  },
  {
    code: 'es',
    iso: 'es-ES',
    file: 'es.json',
    jw: 'S',
    name: 'español (Spanish)',
  },
  {
    code: 'et',
    iso: 'et-EE',
    file: 'et.json',
    jw: 'ST',
    name: 'eesti (Estonian)',
  },
  {
    code: 'fi',
    iso: 'fi-FI',
    file: 'fi.json',
    jw: 'FI',
    name: 'suomi (Finnish)',
  },
  {
    code: 'fr',
    iso: 'fr-FR',
    file: 'fr.json',
    jw: 'F',
    name: 'Français (French)',
  },
  {
    code: 'hu',
    iso: 'hu-HU',
    file: 'hu.json',
    jw: 'H',
    name: 'magyar (Hungarian)',
  },
  {
    code: 'it',
    iso: 'it-IT',
    file: 'it.json',
    jw: 'I',
    name: 'Italiano (Italian)',
  },
  {
    code: 'nl',
    iso: 'nl-NL',
    file: 'nl.json',
    jw: 'O',
    name: 'Nederlands (Dutch)',
  },
  {
    code: 'pt-pt',
    iso: 'pt-PT',
    file: 'pt-pt.json',
    jw: 'TPO',
    name: 'Português - Portugal (Portuguese - Portugal)',
  },
  {
    code: 'pt',
    iso: 'pt-BR',
    file: 'pt.json',
    jw: 'T',
    name: 'Português - Brasil (Portuguese - Brazil)',
  },
  {
    code: 'ru',
    iso: 'ru-RU',
    file: 'ru.json',
    jw: 'U',
    name: 'русский (Russian)',
  },
  {
    code: 'sv',
    iso: 'sv-SE',
    file: 'sv.json',
    jw: 'Z',
    name: 'Svenska (Swedish)',
  },
]

module.exports = {
  LOCALES,
  STALE_LANGS,
  LOCAL_LANGS,
}
