const socket = io()

const messageForm = document.querySelector("form")
const messageFormInput = messageForm.querySelector("input")
const messageFormButton = messageForm.querySelector("button")
const locationButton = document.querySelector("#send-location")
const message = document.querySelector("#message")

//template
const messagetemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//Options
const {username ,room} = Qs.parse(location.search , {ignoreQueryPrefix : true})

const autoScroll = ()=>{
    //new message element
    const newMessage = message.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin =parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = message.offsetHeight

    //Height of message container
    const containerHeight = message.scrollHeight

    //how far have I scrolled?
    const scrollOffset = message.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        message.scrollTop = message.scrollHeight
    }

}

socket.on("message" , (greet)=>{
    console.log(greet)

    const html = Mustache.render(messagetemplate , {
        username: greet.username,
        message: greet.text,
        createdAt: moment(greet.createdAt).format('h:mm a')
    })
    message.insertAdjacentHTML("beforeend" , html)
    autoScroll()
})

socket.on("locationMessage" , (url)=>{
    console.log(url)
    const location = Mustache.render(locationTemplate ,{
        username: url.username,
        url: url.location,
        createdAt:moment(url.createdAt).format("h:mm a")
    })
    message.insertAdjacentHTML("beforeend" , location)
    autoScroll()
})

socket.on("roomData" , ({room , users})=>{

    const html = Mustache.render(sidebarTemplate , {
        room,
        users
    })
    
    document.querySelector("#sidebar").innerHTML = html
})

messageForm.addEventListener("submit" , (e)=>{
    e.preventDefault()

    messageFormButton.setAttribute('disabled' , 'disabled')

    const message = e.target.elements.message.value
    socket.emit("sendMessage" , message , (msg)=>{
        messageFormInput.value = ""
        messageFormInput.focus()
        if(msg){
            return console.log(msg)
        }
        console.log("delivered")
    })
    messageFormButton.removeAttribute("disabled")
})

locationButton.addEventListener("click" , ()=>{

    if(!navigator.geolocation){
        return alert("Geo-location is not supported by your location")
    }
    locationButton.setAttribute('disabled' , 'disabled')
    
    navigator.geolocation.getCurrentPosition((position)=>{
        const chord = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit("send-location" , chord ,()=>{
            console.log("Location Shared!")
            locationButton.removeAttribute("disabled")
        })
        
    })
    
})

socket.emit("join" , {username , room} , (error)=>{
    if(error){
    alert(error)
    location.href = "/"
    }
    
})
