threads.shutDownAll()    
app.launchApp("迪士尼度假区")
while (!click("我的"));
while (!text("收件箱").exists());
sleep(500)
click(450, 480)
sleep(500)
threads.start(function(){
    while(!text("短信验证码登录").exists());
    text("账户密码登录").findOne().click()
    sleep(1000)
    input(0, "13052739901")
    sleep(1000)
    input(1, "abcd@1234")
    var terms = textContains("我已阅读").findOne().bounds()
    click(terms.left - 20, terms.top)
    sleep(800)
    click("登录")
    sleep(500)
    if(text("以后再说").findOne()){
        text("以后再说").findOne().click()
    }
    threads.shutDownAll()
})

threads.start(function(){
    while(!text("编辑个人信息").exists());
        if (text("退出").exists()) {
        text("退出").findOne().click()
    }
})

threads.start(function(){
    while(!click("确认"));
    sleep(2000)
    click(450, 480)
})


