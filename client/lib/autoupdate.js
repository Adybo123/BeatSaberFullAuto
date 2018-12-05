const request = require('request')
const log = require('./log')
const fs = require('fs')
const config = require('./config')
const path = require('path')
const http = require('http')
const childProcess = require('child_process')
// The version number for this build of bpm:
const bakedVersion = '2'
const updateURL = `https://raw.githubusercontent.com/Adybo123/bpm/master/update.txt`

exports.checkForUpdates = (callb) => {
  log.say('INFO', 'Checking for updates to bpm...')
  request(updateURL, (error, response, body) => {
    if (error) {
      log.say('ERROR', 'Failed to check for bpm updates')
      log.err(error)
      return
    }
    var updateData = body.split('|')
    if (updateData[0] !== bakedVersion) {
      log.say('INFO', `Update ${updateData[0]} is available for bpm. Your version is ${bakedVersion}`)
      log.say('INFO', 'Downloading...')

      const updateExePath = path.join(config.getInstallDir(), 'bpmUpdate.exe')
      var exeFile = fs.createWriteStream(updateExePath)
      http.get(updateData[1], (res) => {
        res.pipe(exeFile)
        res.on('end', () => {
          exeFile.close()
          childProcess.exec(`"${updateExePath}" --update`)
          callb(true)
        })
      })
    } else {
      log.say('INFO', `Your bpm ${bakedVersion} installation is up to date`)
      // Weird callback name to fool standard linter.
      // Sshhhh
      callb(false)
    }
  })
}
