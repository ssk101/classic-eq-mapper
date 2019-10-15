const express = require('express')
const { Tail } = require('tail')
const path = require('path')
const app = express()
const port = 3000
const server = app.listen(port, () => console.log(`app listening on port ${port}!`))
const io = require('socket.io')(server)

function exit() {
  server.close(() => process.exit(0))
}

var config
try {
  config = require('./config.json')
} catch (e) {
  console.error('Please create a config.json file in the root directory (check README.md).')
  exit()
}

if(typeof config !== 'undefined' && (!config.logDir || !config.logFile)) {
  console.error('Please add logDir and logFile to your config.json (check README.md).')
  exit()
}

app.set('views', __dirname + '/views')
app.set('view engine', 'pug')
app.use('/assets', express.static(path.join(__dirname, 'public')))
app.use('/build', express.static(path.join(__dirname, 'build')))
app.get('/', (req, res) => res.render('index', { title: 'Home' }))

io.on('connection', (socket) => {
  const logDir = config.logDir
  const logFile = config.logFile
  const tail = new Tail(path.join(logDir, logFile), { useWatchFile: true})
  tail.on('line', (line) => {
    console.log(line)
    if(line.includes('Your Location is')) {
      var raw = line.split('is').pop().trim()
      var loc = raw.split(' ').map(i => Number(i.replace(/,/, '')))
      socket.emit('message', { message: loc })
    }
  })
})




