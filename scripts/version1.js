function closeScripts(){
    var currentEngine = engines.myEngine()
    var runningScripts = engines.all()
    for(var i=0; i<runningScripts.length; i++){
        var script = runningScripts[i]
        if (script != currentEngine){
            script.forceStop()
        }
    }
}
threads.shutDownAll()
closeScripts()
home()
let heartbeatInterval
let addr = device.getMacAddress().split(":").join("")
let globalWebsocket
let ws
let imgUrl = "/sdcard/Pictures/img.png";
let server_url = '192.168.3.194:8000'
let ws_url = `ws://${server_url}/ws/${addr}`

const sendCapture = (base64Str) => {
    const url =`http://${server_url}/api/capture`;
    const data = {
        image: base64Str
    };
    http.postJson(url,data)
}
function init_websocket(){
    ws = web.newWebSocket(ws_url, {
        eventThread: 'this'
    });
    ws.on("open", (res, ws) => {
        globalWebsocket = ws
    }).on("failure", (err, res, ws) => {
        init_websocket()
    }).on("closing", (code, reason, ws) => {
        init_websocket()
    }).on("text", (text, ws) => {
        if(text){
            var message = JSON.parse($base64.decode(text))
            runScript(message.script)
        }
    }).on("closed", (code, reason, ws) => {
        log("WebSocket已关闭: code = %d, reason = %s", code, reason);
    });
}
const startHearBeat = (socket) => {
    heartbeatInterval = setInterval(() => {
        socket.send('ping')
    }, 1000)
}
const runScript = (script) => {
    threads.start(function(){
        engines.execScript("BookTicket", script);
    })
}
init_websocket()
threads.start(function(){
    setInterval(() => {
        if(globalWebsocket){
            globalWebsocket.send("ping")
        }
    }, 2000);
})
function monitoringOrder(){
    while(!files.exists(imgUrl)){
        toast("监控")
        sleep(5000)
    }
    toast("订阅成功")
    var img = images.read(imgUrl)
    var base64Str = images.toBase64(img, format = "png", quality = 100)
    sendCapture(base64Str)
    files.remove(imgUrl)
    monitoringOrder()
}
threads.start(function(){
    monitoringOrder()
})
