// eslint-disable-next-line import/named
import { readFileSync, removeSync } from 'fs-extra'
import { Plugin } from '@nuxt/types'
import { ipcRenderer } from 'electron'
import Store, { Schema } from 'electron-store'
import { basename, dirname, join, normalizeSafe } from 'upath'
import { sync } from 'fast-glob'
import {
  AppPrefs,
  MeetingPrefs,
  MediaPrefs,
  CongPrefs,
  ObsPrefs,
  ElectronStore,
} from '~/types'

const { PREFS, ENUMS } = require('~/constants/prefs') as {
  PREFS: ElectronStore
  ENUMS: { key: string; values: string[] }[]
}

// Define your schema per the ajv/JSON spec
// But you also need to create a mirror of that spec in TS
// And use the type here
const schema: Schema<ElectronStore> = {
  app: {
    type: 'object',
    properties: {
      theme: {
        type: 'string',
        enum: ['dark', 'light', 'system'],
        default: PREFS.app.theme,
      },
      disableAutoUpdate: {
        type: 'boolean',
        default: PREFS.app.disableAutoUpdate,
      },
      disableHardwareAcceleration: {
        type: 'boolean',
        default: PREFS.app.disableHardwareAcceleration,
      },
      localAppLang: {
        type: ['string', 'null'],
        default: PREFS.app.localAppLang,
      },
      localOutputPath: {
        type: ['string', 'null'],
        default: PREFS.app.localOutputPath,
      },
      congregationName: {
        type: ['string', 'null'],
        default: PREFS.app.congregationName,
      },
      offline: {
        type: 'boolean',
        default: PREFS.app.offline,
      },
      outputFolderDateFormat: {
        type: 'string',
        enum: [
          'YYYY-MM-DD',
          'YYYY-MM-DD - dddd',
          'DD-MM-YYYY',
          'DD-MM-YYYY - dddd',
        ],
        default: PREFS.app.outputFolderDateFormat,
      },
      autoStartSync: {
        type: 'boolean',
        default: PREFS.app.autoStartSync,
      },
      autoRunAtBoot: {
        type: 'boolean',
        default: PREFS.app.autoRunAtBoot,
      },
      autoQuitWhenDone: {
        type: 'boolean',
        default: PREFS.app.autoQuitWhenDone,
      },
      autoOpenFolderWhenDone: {
        type: 'boolean',
        default: PREFS.app.autoOpenFolderWhenDone,
      },
      obs: {
        type: 'object',
        properties: {
          enable: {
            type: 'boolean',
            default: PREFS.app.obs.enable,
          },
          port: {
            type: ['string', 'null'],
            default: PREFS.app.obs.port,
          },
          password: {
            type: ['string', 'null'],
            default: PREFS.app.obs.password,
          },
          mediaScene: {
            type: ['string', 'null'],
            default: PREFS.app.obs.mediaScene,
          },
          cameraScene: {
            type: ['string', 'null'],
            default: PREFS.app.obs.cameraScene,
          },
          useV4: {
            type: 'boolean',
            default: PREFS.app.obs.useV4,
          },
        },
      },
    },
  },
  cong: {
    type: 'object',
    properties: {
      server: {
        type: ['string', 'null'],
        default: PREFS.cong.server,
      },
      user: {
        type: ['string', 'null'],
        default: PREFS.cong.user,
      },
      password: {
        type: ['string', 'null'],
        default: PREFS.cong.password,
      },
      port: {
        type: ['string', 'null'],
        default: PREFS.cong.port,
      },
      dir: {
        type: ['string', 'null'],
        default: PREFS.cong.dir,
      },
    },
  },
  media: {
    type: 'object',
    properties: {
      lang: {
        type: ['string', 'null'],
        default: PREFS.media.lang,
      },
      langUpdatedLast: {
        type: ['string', 'null'],
        default: PREFS.media.langUpdatedLast,
      },
      maxRes: {
        type: 'string',
        enum: ['240p', '360p', '480p', '720p'],
        default: PREFS.media.maxRes,
      },
      enablePp: {
        type: 'boolean',
        default: PREFS.media.enablePp,
      },
      enableMp4Conversion: {
        type: 'boolean',
        default: PREFS.media.enableMp4Conversion,
      },
      keepOriginalsAfterConversion: {
        type: 'boolean',
        default: PREFS.media.keepOriginalsAfterConversion,
      },
      enableVlcPlaylistCreation: {
        type: 'boolean',
        default: PREFS.media.enableVlcPlaylistCreation,
      },
      enableMediaDisplayButton: {
        type: 'boolean',
        default: PREFS.media.enableMediaDisplayButton,
      },
      hideMediaLogo: {
        type: 'boolean',
        default: PREFS.media.hideMediaLogo,
      },
      hideWinAfterMedia: {
        type: 'boolean',
        default: PREFS.media.hideWinAfterMedia,
      },
      excludeTh: {
        type: 'boolean',
        default: PREFS.media.excludeTh,
      },
      excludeLffi: {
        type: 'boolean',
        default: PREFS.media.excludeLffi,
      },
      excludeLffiImages: {
        type: 'boolean',
        default: PREFS.media.excludeLffiImages,
      },
      ppBackward: {
        type: ['string', 'null'],
        default: PREFS.media.ppBackward,
      },
      ppForward: {
        type: ['string', 'null'],
        default: PREFS.media.ppForward,
      },
      preferredOutput: {
        oneOf: [{ type: 'string' }, { type: 'number' }],
        default: PREFS.media.preferredOutput,
      },
      mediaWinShortcut: {
        type: 'string',
        default: PREFS.media.mediaWinShortcut,
      },
      presentShortcut: {
        type: 'string',
        default: PREFS.media.presentShortcut,
      },
    },
  },
  meeting: {
    type: 'object',
    properties: {
      enableMusicButton: {
        type: 'boolean',
        default: PREFS.meeting.enableMusicButton,
      },
      shuffleShortcut: {
        type: 'string',
        default: PREFS.meeting.shuffleShortcut,
      },
      enableMusicFadeOut: {
        type: 'boolean',
        default: PREFS.meeting.enableMusicFadeOut,
      },
      mwDay: {
        type: ['number', 'null'],
        minimum: 0,
        maximum: 6,
        default: PREFS.meeting.mwDay,
      },
      specialCong: {
        type: 'boolean',
        default: PREFS.meeting.specialCong,
      },
      weDay: {
        type: ['number', 'null'],
        minimum: 0,
        maximum: 6,
        default: PREFS.meeting.weDay,
      },
      musicFadeOutType: {
        type: 'string',
        enum: ['smart', 'timer'],
        default: PREFS.meeting.musicFadeOutType,
      },
      musicFadeOutTime: {
        type: 'number',
        minimum: 5,
        maximum: 60,
        multipleOf: 5,
        default: PREFS.meeting.musicFadeOutTime,
      },
      musicVolume: {
        type: 'number',
        minimum: 1,
        maximum: 100,
        default: PREFS.meeting.musicVolume,
      },
      mwStartTime: {
        type: ['string', 'null'],
        default: PREFS.meeting.mwStartTime,
      },
      weStartTime: {
        type: ['string', 'null'],
        default: PREFS.meeting.weStartTime,
      },
    },
  },
}

// We define the keys we'll be using to access the store
// This is basically the top-level properties in the object
// But electron-store supports dot notation, so feel free to set deeper keys

// We set the type like this so when we use `store.get()`
// It'll use the actual keys from store and infer the data type
export const STORE_KEYS: { [key: string]: keyof ElectronStore } = {
  APP: 'app',
  CONG: 'cong',
  MEDIA: 'media',
  MEETING: 'meeting',
}

let store: Store<ElectronStore>

function storeOptions(name = 'prefs') {
  return {
    name,
    schema,
    defaults: PREFS,
    beforeEachMigration: (_store, context) => {
      console.debug(
        `[main-config] migrate from ${context.fromVersion} → ${context.toVersion}`
      )
      console.debug(`[main-config] final version: ${context.finalVersion}`)
      console.debug(`[main-config] versions: ${context.versions}`)
    },
    migrations: {
      '0.0.1': (store) => {
        for (const key of Object.keys(store.store)) {
          // Skip root keys
          if (
            key === 'app' ||
            key === 'cong' ||
            key === 'media' ||
            key === 'meeting' ||
            key === '__internal__'
          ) {
            continue
          }

          console.debug(
            `Processing ${key}=${store.get(key)} (${typeof store.get(key)})...`
          )

          try {
            const newProp = migrate2290(key, store.get(key))

            // Set new key and value and delete old one
            store.set(newProp.key, newProp.val)
            store.delete(key as keyof ElectronStore)

            // @ts-ignore: 'cong.port' is not defined as a key of ElectronStore
            store.reset('cong.port')
          } catch (e: unknown) {
            console.error(e)
          }
        }
      },
      '22.10.1': (store) => {
        if (store.get('app.ppEnable') !== undefined) {
          store.set(
            'media.enablePp',
            store.get('app.ppEnable') || store.get('media.enablePp')
          )
          // @ts-ignore: 'app.ppEnable' is not defined as a key of ElectronStore
          store.delete('app.ppEnable')
        }
      },
    },
  } as Store.Options<ElectronStore>
}

function migrate2290(key: string, newVal: any) {
  let isObsPref = false
  let isMeetingPref = false
  let isMediaPref = false
  let isCongPref = false

  let root: keyof ElectronStore = 'app'
  let newKey:
    | keyof AppPrefs
    | keyof MeetingPrefs
    | keyof MediaPrefs
    | keyof CongPrefs
    | keyof ObsPrefs = key as any

  // Get correct values for root, newKey and newVal
  if (key === 'enableObs') {
    isObsPref = true
    newKey = 'enable'
  } else if (key === 'ppEnable') {
    newKey = 'enablePp'
    root = 'media'
    isMediaPref = true
  } else if (key.startsWith('obs')) {
    isObsPref = true
    newKey = key.replace('obs', '') as keyof ObsPrefs
    newKey = (newKey.charAt(0).toLowerCase() +
      newKey.slice(1)) as keyof ObsPrefs
  } else if (key.startsWith('congServer')) {
    root = 'cong'
    isCongPref = true
    newKey = key
      .replace('congServer', 'server')
      .replace('serverDir', 'dir')
      .replace('serverPass', 'password')
      .replace('serverPort', 'port')
      .replace('serverUser', 'user') as keyof CongPrefs
  } else if (PREFS.media[key as keyof MediaPrefs] !== undefined) {
    root = 'media'
    isMediaPref = true
  } else if (PREFS.meeting[key as keyof MeetingPrefs] !== undefined) {
    root = 'meeting'
    isMeetingPref = true
  }

  function setDefaultValue() {
    if (isObsPref) {
      newVal = PREFS.app.obs[newKey as keyof ObsPrefs]
    } else if (isMeetingPref) {
      newVal = PREFS.meeting[newKey as keyof MeetingPrefs]
    } else if (isMediaPref) {
      newVal = PREFS.media[newKey as keyof MediaPrefs]
    } else if (isCongPref) {
      newVal = PREFS.cong[newKey as keyof CongPrefs]
    } else {
      newVal = PREFS.app[newKey as keyof AppPrefs]
    }
  }

  // Convert null values to (new) default values
  if (newVal === null || newVal === undefined) {
    setDefaultValue()
  }

  // Validate preferredOutput
  if (key === 'preferredOutput') {
    if (typeof newVal === 'string' && newVal !== 'window') {
      setDefaultValue()
    }
  }

  // Validate enums
  const match = ENUMS.find((e) => e.key === key)
  if (match) {
    if (!match.values.includes(newVal)) {
      setDefaultValue()
    }
  }

  // Values that were converted from number to string
  if (key === 'congServerPort') {
    try {
      newVal = newVal.toString()
    } catch (e: unknown) {
      setDefaultValue()
    }
  }

  // Values that were converted from string to number
  if (
    key === 'musicFadeOutTime' ||
    key === 'musicVolume' ||
    key === 'mwDay' ||
    key === 'weDay'
  ) {
    if (typeof newVal === 'string') {
      try {
        newVal = parseInt(newVal)
        if (isNaN(newVal)) {
          setDefaultValue()
        }
      } catch (e: unknown) {
        setDefaultValue()
      }
    }
  }

  // Final check against the schema
  const schemaType = isObsPref
    ? // @ts-ignore: newkey is not defined as a key of properties
      schema?.app?.properties?.obs?.properties[newKey]?.type
    : // @ts-ignore: newkey is not defined as a key of properties
      schema[root]?.properties[newKey]?.type
  if (schemaType) {
    if (typeof schemaType === 'string') {
      // eslint-disable-next-line valid-typeof
      if (typeof newVal !== schemaType) {
        setDefaultValue()
      }
    } else if (
      !schemaType
        .map((t: string) => t.replace('null', 'object'))
        .includes(typeof newVal)
    ) {
      setDefaultValue()
    }
  }

  if (isObsPref) {
    return { key: `${root}.obs.${newKey}`, val: newVal }
  } else {
    return { key: `${root}.${newKey}`, val: newVal }
  }
}

const plugin: Plugin = ({ $sentry }, inject) => {
  inject('prefsInitialized', () => !!store)
  inject('getCongPrefs', async () => {
    return sync(join(await ipcRenderer.invoke('userData'), 'prefs-*.json'))
      .map((file) => {
        const prefs = JSON.parse(readFileSync(file, 'utf8')) as ElectronStore
        return {
          name:
            // @ts-ignore: prefs.congregationName does not exist on type ElectronStore
            prefs?.app?.congregationName ?? (prefs?.congregationName as string),
          path: file,
        }
      })
      .filter((cong) => !!cong.name)
      .sort((a, b) => b.name.localeCompare(a.name))
  })
  function initStore(name: string) {
    store = new Store<ElectronStore>(storeOptions(name))
  }
  inject('initStore', initStore)
  inject('storePath', (): string | undefined =>
    store?.path ? normalizeSafe(store.path) : undefined
  )
  inject('appPath', (): string => {
    return dirname(normalizeSafe(store?.path ?? ''))
  })
  inject('appVersion', async (): Promise<string> => {
    return (await ipcRenderer.invoke('appVersion')) as string
  })
  inject('switchCong', (path: string) => {
    initStore(basename(path, '.json'))
  })
  inject('removeCong', (path: string) => {
    removeSync(path)
  })
  inject('getPrefs', (key: string): unknown => {
    return store?.get(key)
  })
  inject(
    'getAllPrefs',
    (): ElectronStore =>
      JSON.parse(readFileSync(store.path, 'utf8')) as ElectronStore
  )

  inject('setPrefs', (key: string, value: unknown) => {
    store.set(key, value)
    const prefs = JSON.parse(readFileSync(store.path, 'utf8')) as ElectronStore
    $sentry.setContext('prefs', {
      ...prefs,
      obs: prefs.app.obs,
    })
  })

  inject('setAllPrefs', (settings: ElectronStore) => {
    return store.set(settings)
  })

  inject('unsetPrefs', (key: keyof ElectronStore) => {
    return store.delete(key)
  })

  inject('resetPrefs', () => {
    return store.clear()
  })
  inject('migrate2290', migrate2290)
}

export default plugin
