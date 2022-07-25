const users = []

const addUsers = ({id , username , room})=>{
    
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room){
        return {
            error : "Username & room is required"
        }
    }

    //Check for existing user
    const existingUser = users.find((user)=>{
        return user.username === username && user.room === room
    })

    //Validate username
    if(existingUser){
        return{
            error : "username is already taken"
        }
    }

    //Store User
    const user = {id , username , room}
    users.push(user)
    return ({user})

}

const removeUser = (id)=>{
    const index = users.find((user) => user.id === id)
    if(index !== -1){
        return users.splice(index , 1)[0]
    }
}

const getUser = (id)=>{
    return users.find((user)=> user.id === id)
}

const getUserInRoom = (room)=>{
    room = room.trim().toLowerCase()
    return users.filter((user)=> user.room === room)
}

module.exports = {
    addUsers,
    removeUser,
    getUser,
    getUserInRoom
}