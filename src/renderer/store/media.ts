import { MutationTree, ActionTree, GetterTree } from 'vuex'
import dayjs, { Dayjs } from 'dayjs'
import { MediaStore, MeetingFile } from '~/types'

const defaultState: MediaStore = {
  songPub: 'sjjm', // The song publication (sjj for sign language)
  ffMpeg: false, // Whether FFmpeg has been initialized
  musicFadeOut: '', // The fade out time for shuffle music
  meetings: new Map(), // A map of meetings and their media
}

export const state = () => Object.assign({}, defaultState)

export const mutations: MutationTree<MediaStore> = {
  setSongPub(state, pub: string) {
    state.songPub = pub
  },
  setFFmpeg(state, ffMpeg: boolean) {
    state.ffMpeg = ffMpeg
  },
  setMusicFadeOut(state, musicFadeOut: Dayjs | string) {
    state.musicFadeOut = musicFadeOut
  },
  setHidden(
    state,
    {
      date,
      par,
      mediaName,
      hidden,
    }: { date: string; par: number; mediaName: string; hidden: boolean }
  ) {
    const media = state.meetings.get(date)?.get(par)
    if (media) {
      const newMedia = [...media]
      const index = newMedia.findIndex(({ safeName }) => safeName === mediaName)
      if (index !== -1) {
        newMedia[index].hidden = hidden
        state.meetings.get(date)?.set(par, newMedia)
        state.meetings = new Map(state.meetings)
      }
    }
  },
  set(
    state,
    {
      date,
      par,
      media,
    }: {
      date: string
      par: number
      media: MeetingFile
    }
  ) {
    let dateMap = state.meetings.get(date)
    if (!dateMap) {
      state.meetings.set(date, new Map())
      dateMap = state.meetings.get(date) as Map<number, MeetingFile[]>
    }
    let mediaList = dateMap.get(par)
    if (!mediaList) dateMap.set(par, [])
    mediaList = dateMap.get(par) as MeetingFile[]
    mediaList.push(media)
    const parMap = new Map(dateMap.set(par, mediaList))
    state.meetings = new Map(state.meetings.set(date, parMap))
  },
  setMultiple(
    state,
    {
      date,
      par,
      media,
      overwrite,
    }: {
      date: string
      par: number
      media: MeetingFile[]
      overwrite?: boolean
    }
  ) {
    let dateMap = state.meetings.get(date)
    if (!dateMap) {
      state.meetings.set(date, new Map())
      dateMap = state.meetings.get(date) as Map<number, MeetingFile[]>
    }
    let mediaList = dateMap.get(par)
    if (!mediaList) dateMap.set(par, [])
    mediaList = dateMap.get(par) as MeetingFile[]
    if (overwrite) {
      mediaList = [...media]
    } else {
      mediaList = mediaList.concat(media)
    }
    const parMap = new Map(dateMap.set(par, mediaList))
    state.meetings = new Map(state.meetings.set(date, parMap))
  },
  addDate(
    state,
    { date, map }: { date: string; map: Map<number, MeetingFile[]> }
  ) {
    state.meetings.set(date, map)
  },
  deleteDate(state, date: string) {
    state.meetings.delete(date)
  },
  clear(state) {
    state.meetings = new Map()
  },
}

export const actions: ActionTree<MediaStore, MediaStore> = {
  get({ state }, { date, par }: { date: string; par: number }) {
    const dateMap = state.meetings.get(date)
    const media = dateMap?.get(par)
    if (media) return media
    return []
  },
  updateDateFormat(
    { state, commit },
    {
      locale,
      oldFormat,
      newFormat,
    }: { locale: string; oldFormat: string; newFormat: string }
  ) {
    const dates = state.meetings.keys()
    for (const date of dates) {
      const day = dayjs(date, oldFormat, locale)
      if (day.isValid()) {
        const newDate = day.locale(locale).format(newFormat)
        if (newDate !== date) {
          commit('addDate', {
            date: newDate,
            map: state.meetings.get(date),
          })
          commit('deleteDate', date)
        }
      }
    }
  },
}

export const getters: GetterTree<MediaStore, MediaStore> = {
  songPub: (state) => state.songPub,
  meetings: (state) => state.meetings,
}
