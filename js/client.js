
const socket=io('http://localhost:80')


const form=document.getElementById('send-container');
const messageinp=document.getElementById('messageinp');
const messagecontainer=document.querySelector('.container');
const useer=document.getElementById('user');
var audio=new Audio('ting.mp3');


const appendd = (message,position)=>{
    const messageelement=document.createElement('div');
    messageelement.innerHTML=message;
    messageelement.classList.add('message');
    messageelement.classList.add(position);
    messagecontainer.append(messageelement);
    if(position=='left'){
    audio.play();}
}
form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const message=messageinp.value;
    appendd(`You: ${message}`,'right')
    socket.emit('send',message);
    messageinp.value='';
})
const namee = prompt('Enter Your alias to join');
useer.append(`hey ${namee}`);
socket.emit('new-user-joined',namee)
socket.on('user-joined',namee=>{
    appendd(`${namee} joined the chat`,'right')
})
socket.on('recieve',data=>{
    appendd(`<b>${data.name}<b>:${data.message}`,'left')
})
socket.on('left',name=>{
    appendd(`${name} left the chat`,'left');
})
