import { screen } from 'electron'

// Get screen information
export function getScreenInfo(win, mediaWin) {
  let displays = []
  const winMidpoints = {}
  const winCoordinates = {}
  try {
    winCoordinates.main = win.getPosition().concat(win.getSize())
    winMidpoints.main = {
      x: winCoordinates.main[0] + winCoordinates.main[2] / 2,
      y: winCoordinates.main[1] + winCoordinates.main[3] / 2,
    }
    if (mediaWin) {
      winCoordinates.media = mediaWin.getPosition().concat(win.getSize())
      winMidpoints.media = {
        x: winCoordinates.media[0] + winCoordinates.media[2] / 2,
        y: winCoordinates.media[1] + winCoordinates.media[3] / 2,
      }
    }
    displays = screen.getAllDisplays().map((display, i) => {
      display.humanFriendlyNumber = i + 1
      return display
    })
  } catch (err) {
    console.error(err)
  }
  return {
    displays,
    winMidpoints,
    otherScreens: displays.filter(
      (display) =>
        display.id !== screen.getDisplayNearestPoint(winMidpoints.main).id
    ),
  }
}

// Show/hide media window
export function fadeWindow(win, browserWindow) {
  if (!browserWindow.isVisible()) {
    browserWindow.show()
    win.webContents.send('mediaWindowVisibilityChanged', 'shown')
  } else {
    browserWindow.hide()
    win.webContents.send('mediaWindowVisibilityChanged', 'hidden')
  }
}

// Set position of the media window
export function setMediaWindowPosition(win, mediaWin, mediaWinOptions) {
  try {
    if (mediaWin) {
      const screenInfo = getScreenInfo(win, mediaWin)
      const STARTING_POSITION = 50
      mediaWin.setBounds({
        x:
          screenInfo.displays.find(
            (display) => display.id === mediaWinOptions.destination
          ).bounds.x + STARTING_POSITION,
        y:
          screenInfo.displays.find(
            (display) => display.id === mediaWinOptions.destination
          ).bounds.y + STARTING_POSITION,
        ...(mediaWinOptions.type === 'window' && { width: 1280 }),
        ...(mediaWinOptions.type === 'window' && { height: 720 }),
      })

      win.webContents.send('log', mediaWin.isFullScreen())
      win.webContents.send('log', JSON.stringify(mediaWinOptions))
      win.webContents.send('log', JSON.stringify(screenInfo))

      // Removed isFullScreen() check because of https://github.com/electron/electron/issues/35360
      if (
        mediaWinOptions.type === 'fullscreen' &&
        screenInfo.otherScreens.length > 0
      ) {
        mediaWin.setFullScreen(true)
      } else if (mediaWinOptions.type === 'window') {
        mediaWin.setFullScreen(false)
      }
    }
  } catch (err) {
    console.error(err)
  }
}
