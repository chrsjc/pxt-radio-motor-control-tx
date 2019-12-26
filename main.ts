let motorOnL = 0;
let motorOnR = 0;
let lastLedX = 100
let lastLedY = 100
const motorMax = 100
const accelMax = 500    // full range is 1023
const screenMax = 2

input.onGesture(Gesture.Shake, () => {
    runTests()
})

control.onEvent(EventBusSource.MICROBIT_ID_BUTTON_A, EventBusValue.MICROBIT_BUTTON_EVT_DOWN, () => {
    motorOnL = 1
})

control.onEvent(EventBusSource.MICROBIT_ID_BUTTON_A, EventBusValue.MICROBIT_BUTTON_EVT_UP, () => {
    motorOnL = 0
})

control.onEvent(EventBusSource.MICROBIT_ID_BUTTON_B, EventBusValue.MICROBIT_BUTTON_EVT_DOWN, () => {
    motorOnR = 1
})

control.onEvent(EventBusSource.MICROBIT_ID_BUTTON_B, EventBusValue.MICROBIT_BUTTON_EVT_UP, () => {
    motorOnR = 0
})

control.onEvent(EventBusSource.MICROBIT_ID_ACCELEROMETER, EventBusValue.MICROBIT_ACCELEROMETER_EVT_DATA_UPDATE, () => {
    updateMotor(input.acceleration(Dimension.X), input.acceleration(Dimension.Y))
})

control.inBackground(() => {
    while (true) {
        updateScreen(input.acceleration(Dimension.X), input.acceleration(Dimension.Y))
        basic.pause(100)
    }
})

function accelToSpeedL(accelX: number, accelY: number) {

    // x' = x cos theta - y sin theta
    // cos(-pI()/4) = 0.707
    // sin(-pI()/4) = -0.707
    // x' = K x + K y
    //    = K (x + y)

    let speedL = ((accelX + accelY) * motorMax) / accelMax
    speedL = Math.clamp(-motorMax, motorMax, speedL)

    return speedL
}

function accelToSpeedR(accelX: number, accelY: number) {

    // y' = x sin theta + y cos theta
    // cos(-pI()/4) = 0.707
    // sin(-pI()/4) = -0.707
    // y' = K y - K x
    //    = K (y - x)

    let speedR = ((accelY - accelX) * motorMax) / accelMax
    speedR = Math.clamp(-motorMax, motorMax, speedR)

    return speedR
}

function updateMotor(accelX: number, accelY: number) {

    // invert y axis so tilt forward = motor forward
    accelY *= -1

    let speedL = accelToSpeedL(accelX, accelY)
    //serial.writeValue("speedL", speedL)
    speedL *= motorOnL
    radio.sendValue("speedL", speedL)

    let speedR = accelToSpeedR(accelX, accelY)
    //serial.writeValue("speedR", speedR)
    speedR *= motorOnR
    radio.sendValue("speedR", speedR)
}

function accelToScreen(accel: number) {

    accel = Math.clamp(-accelMax, accelMax, accel)
    let screen = pins.map(accel, -accelMax, accelMax, 0, 4)

    return screen
}

function updateScreen(accelX: number, accelY: number) {

    let ledX = accelToScreen(accelX)
    let ledY = accelToScreen(accelY)
    if (ledX != lastLedX || ledY != lastLedY) {
        led.plot(ledX, ledY)
        led.unplot(lastLedX, lastLedY)
        lastLedX = ledX
        lastLedY = ledY
    }
}

function runTests() {

    serial.writeValue("centre (0, 0) L expect 0", accelToSpeedL(0, 0))
    serial.writeValue("centre (0, 0) R expect 0", accelToSpeedR(0, 0))

    serial.writeValue("full forward (0, accelMax) L expect 100", accelToSpeedL(0, accelMax))
    serial.writeValue("full forward (0, accelMax) R expect 100", accelToSpeedR(0, accelMax))

    serial.writeValue("full right (accelMax, 0) L expect 100", accelToSpeedL(accelMax, 0))
    serial.writeValue("full right (accelMax, 0) R expect -100", accelToSpeedR(accelMax, 0))

    serial.writeValue("full reverse (0, -accelMax) L expect -100", accelToSpeedL(0, -accelMax))
    serial.writeValue("full reverse (0, -accelMax) R expect -100", accelToSpeedR(0, -accelMax))

    serial.writeValue("full left (-accelMax, 0) L expect -100", accelToSpeedL(-accelMax, 0))
    serial.writeValue("full left (-accelMax, 0) R expect 100", accelToSpeedR(-accelMax, 0))

    serial.writeValue("half forward (0, accelMax/2) L expect 50", accelToSpeedL(0, accelMax / 2))
    serial.writeValue("half forward (0, accelMax/2) R expect 50", accelToSpeedR(0, accelMax / 2))

    serial.writeValue("half right (accelMax/2, 0) L expect 50", accelToSpeedL(accelMax / 2, 0))
    serial.writeValue("half right (accelMax/2, 0) R expect -50", accelToSpeedR(accelMax / 2, 0))

    serial.writeValue("half reverse (0, -accelMax/2) L expect -50", accelToSpeedL(0, -accelMax / 2))
    serial.writeValue("half reverse (0, -accelMax/2) R expect -50", accelToSpeedR(0, -accelMax / 2))

    serial.writeValue("half left (-accelMax/2, 0) L expect -50", accelToSpeedL(-accelMax / 2, 0))
    serial.writeValue("half left (-accelMax/2, 0) R expect 50", accelToSpeedR(-accelMax / 2, 0))

    serial.writeValue("pivot right forward (accelMax/2, accelMax/2) L expect 100", accelToSpeedL(accelMax / 2, accelMax / 2))
    serial.writeValue("pivot right forward (accelMax/2, accelMax/2) R expect 0", accelToSpeedR(accelMax / 2, accelMax / 2))

    serial.writeValue("pivot right reverse (accelMax/2, -accelMax/2) L expect 0", accelToSpeedL(accelMax / 2, -accelMax / 2))
    serial.writeValue("pivot right reverse (accelMax/2, -accelMax/2) R expect -100", accelToSpeedR(accelMax / 2, -accelMax / 2))

    serial.writeValue("pivot left reverse (-accelMax/2, -accelMax/2) L expect -100", accelToSpeedL(-accelMax / 2, -accelMax / 2))
    serial.writeValue("pivot left reverse (-accelMax/2, -accelMax/2) R expect 0", accelToSpeedR(-accelMax / 2, -accelMax / 2))

    serial.writeValue("pivot left forward (-accelMax/2, accelMax/2) L expect 0", accelToSpeedL(-accelMax / 2, accelMax / 2))
    serial.writeValue("pivot left forward (-accelMax/2, accelMax/2) R expect 100", accelToSpeedR(-accelMax / 2, accelMax / 2))

    serial.writeValue("out of range right forward (accelMax, accelMax) L expect 100", accelToSpeedL(accelMax, accelMax))
    serial.writeValue("out of range right forward (accelMax, accelMax) R expect 0", accelToSpeedR(accelMax, accelMax))
}

radio.setGroup(1)
