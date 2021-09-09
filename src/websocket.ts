import { io } from './http'

interface RoomUser {
  socket_id: string
  username: string
  room: string
}

interface Message {
  room: string
  text: string
  created_at: Date
  username: string
}

const users: RoomUser[] = []
const messages: Message[] = []

io.on('connection', socket => {
  // console.log(socket.id)

  socket.on("select_room", (data, callback) => {
    // console.log(data)

    socket.join(data.room)

    const userInRoom = users.find(user => (
      user.username === data.username && user.room === data.room
    ))

    if (userInRoom) {
      userInRoom.socket_id = socket.id
    } else {
      users.push({
        room: data.room,
        username: data.username,
        socket_id: socket.id
      })
    }

    // console.log(users)
    const messagesRoom = getMessagesRoom(data.room)
    callback(messagesRoom)
  })

  socket.on('message', data => {
    // Salvar as mensagens
    const message: Message = {
      room: data.room,
      username: data.username,
      text: data.message,
      created_at: new Date()
    }

    messages.push(message)

    // Enviar para usuários da sala
    io.to(data.room).emit('message', message)
  })
})

function getMessagesRoom (room: string) {
  const messagesRoom = messages.filter(message => message.room === room)
  return messagesRoom
}
