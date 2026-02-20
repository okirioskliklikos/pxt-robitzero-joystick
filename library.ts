enum JoystickButton {
    //% block="red"
    Red = 1,
    //% block="green"
    Green,
    //% block="blue"
    Blue,
    //% block="yellow"
    Yellow,
    //% block="black"
    Black
}

/**
 * Functions to use a five button joystick with different colors for its buttons
 * 
 *      B
 *  G       Y    B
 *      R
 */
//% block="Joystick"
//% groups=['Input']
//% weight=7 color=#ff6f00 icon="\uf0a9"
namespace rb0joystick {

    const EVENT_ID = 0x8100
    const IDLE_MIN = 480
    const IDLE_MAX = 510

    let inputPin: DigitalPin = DigitalPin.P0
    let lastButton = 0
    let started = false

    // Default voltage ranges
    let ranges = [
        { btn: JoystickButton.Red, min: 230, max: 290 },
        { btn: JoystickButton.Green, min: 0, max: 60 },
        { btn: JoystickButton.Blue, min: 116, max: 166 },
        { btn: JoystickButton.Yellow, min: 330, max: 390 },
        { btn: JoystickButton.Black, min: 420, max: 470 }
    ]

    function start() {
        if (started) {
            return;
        }

        started = true

        control.inBackground(() => {
            while (true) {
                const current = readButton();
                if (current !== 0 && current !== lastButton) {
                    control.raiseEvent(EVENT_ID, current)
                }
                lastButton = current;
                basic.pause(20);
            }
        })
    }

    function readButton(): number {
        const value = pins.analogReadPin(inputPin)

        // Explicit idle state
        if (value >= IDLE_MIN && value <= IDLE_MAX) {
            return 0
        }

        for (const r of ranges) {
            if (value >= r.min && value <= r.max) {
                return r.btn;
            }
        }
        return 0;
    }

    /// Public API ///

    /**
    * Initialize Joystick
    * @param port Keyestudio port where the joystick is connected
    */
    //% blockId="rb0joystick_initSimple"
    //% block="joystick at port %port" 
    //% weight=90 color=100 blockGap=24
    //% port.defl=KeyestudioPort.P0
    export function initSimple(port: KeyestudioPort) {
        let pin1 = rb0base.getPinFromKeyestudioPort(port);
        rb0base.enablePin(pin1);
        inputPin = pin1;
    }

    /**
    * Initialize Joystick
    * @param pin1 pin where the joystick is connected
    */
    //% blockId="rb0keypa5d_initAdvanced"
    //% block="joystick at pin %pin2" 
    //% weight=90 color=100 blockGap=24 advanced=true
    //% pin1.defl=DigitalPin.P0
    export function initAdvanced(pin1: DigitalPin) {
        rb0base.enablePin(pin1);
        inputPin = pin1;
    }

    //% blockId="rb0joystick_onbuttonpressed"
    //% block="on joystick button %button pressed"
    //% group="Input"
    //% button.delf = JoystickButton.Red
    export function onButtonPressed(
        button: JoystickButton,
        handler: () => void
    ) {
        start()
        control.onEvent(EVENT_ID, button, handler)
    }
}