function connectToServer() {

  let nick = document.getElementById("nick").value
  let color = randomColor()

  player = new Player(nick, socket.id, color.body, color.border)

  // Say that we're connected
  socket.emit("start", {
    x: player.pos.x,
    y: player.pos.y,
    r: player.radius,
    b: player.COLOR,
    bc: player.BORDER_COLOR,
    n: player.nick
  })

  document.getElementById("menu").style.display = "none"

}

socket.on("start", (data) => {

  // Create players
  for (let id in data.players) {
    let p = data.players[id]
    players[id] = new Player(p.n, p.id, p.b, p.bc, p.x, p.y)
    players[id].block = [data.players[id].block.row, data.players[id].block.col]
  }

  // Flush blobs
  blobs = []

  // Create blobs
  for (let i = 0; i < data.blobs.length; i++) {
    if (data.blobs[i]) blobs.push(new Blob(data.blobs[i].x, data.blobs[i].y, data.blobs[i].r, data.blobs[i].c))
  }

  gameStarted = true
  paused = false

  document.getElementById("playersStats").style.display = "block"

  console.log(players)

})

socket.on("update_blobs", (data) => {

  // Flush blobs
  blobs = []

  // Create blobs
  for (let i = 0; i < data.length; i++) {
    if (data[i]) blobs.push(new Blob(data[i].x, data[i].y, data[i].r, data[i].c))
  }

})

socket.on("heartbeat", (data) => {

  if (!gameStarted) return

  // Update positions and radiuses
  for (let id in data.players) {
    if (id !== socket.id && players[id]) {
      players[id].pos.x = data.players[id].x
      players[id].pos.y = data.players[id].y
      players[id].radius = data.players[id].r
    } else if (players[id]) {
      players[id].block = [data.players[id].block.row, data.players[id].block.col]
    }
  }

})

socket.on("newPlayer", (data) => {

  // Create new player
  players[data.id] = new Player(data.n, data.id, data.b, data.bc, data.x, data.y)

  // Update players stats
  document.getElementById("playersStats").innerHTML = "<h3>Players: " + Object.keys(players).length + "</h3>"

})

socket.on("removePlayer", (id) => {
  // Delete player
  delete players[id]

  // Update players stats
  document.getElementById("playersStats").innerHTML = "<h3>Players: " + Object.keys(players).length + "</h3>"
})

socket.on("removeBlob", (data) => {
  let blocks = []

  for (let j = 0; j < BLOCKS_COUNT; j++) {
    blocks.push([])
    for (let i = 0; i < BLOBS_COUNT; i++) {
      blocks[j].push(blobs[i + j * BLOBS_COUNT])
    }
  }

  // Delete blob
  if (data.id !== socket.id) blobs.splice(data.i, 1)
})

socket.on("newBlob", (data) => {
  // Add blob
  blobs.push(new Blob(data.x, data.y, data.r, data.c))
})