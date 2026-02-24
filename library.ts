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
//% weight=10 color=#ff6f00 icon="\uf0a9"
namespace rb0joystick {

    const EVENT_ID = 0x8100
    let IDLE_MIN = 480
    let IDLE_MAX = 510

    let inputPin: DigitalPin = DigitalPin.P0
    let lastButton = 0
    let started = false

    //Default values for P0
    let ranges = [
        { btn: JoystickButton.Red, min: 230, max: 290 },
        { btn: JoystickButton.Green, min: 0, max: 60 },
        { btn: JoystickButton.Blue, min: 116, max: 166 },
        { btn: JoystickButton.Yellow, min: 330, max: 390 },
        { btn: JoystickButton.Black, min: 420, max: 470 }
    ]

    //Values for other ports except P0
    let rangesP1P10 = [
        { btn: JoystickButton.Red, min: 290, max: 330 },
        { btn: JoystickButton.Green, min: 0, max: 60 },
        { btn: JoystickButton.Blue, min: 120, max: 180 },
        { btn: JoystickButton.Yellow, min: 465, max: 510 },
        { btn: JoystickButton.Black, min: 755, max: 810 }
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

    function adjustToPin(pin1: DigitalPin) {
        if (pin1 !== DigitalPin.P0) {
            ranges = rangesP1P10;
        }

        IDLE_MIN = 1000;
        IDLE_MAX = 1023;
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
    export function initSimple(port: KeyestudioAnalogPort) {
        let pin1 = rb0base.getPinFromKeyestudioAnalogPort(port);
        adjustToPin(pin1);

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
    export function initAdvanced(pin1: AnalogPin) {
        let p = pin1 as number;
        adjustToPin(p);
        rb0base.enablePin(p);
        inputPin = p;
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