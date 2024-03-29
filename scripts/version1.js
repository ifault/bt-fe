home()
threads.shutDownAll()
let addr = device.getMacAddress().split(":").join("")
let globalWebsocket
let ws
let server_url = '192.168.3.194:8000'
let ws_url = `ws://${server_url}/ws/${addr}`
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