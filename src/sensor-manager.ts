
import { IIotSimulatorSettings } from "./iot-simulator-settings";
import { Sensor } from "./sensor";
const {ipcRenderer} = (window as any).require('electron');

export type SensorCallback = (s:Sensor) => void;
const sensors:Array<[Sensor,SensorCallback]> = [];
export function registerSensor(sensor:Sensor,cb:SensorCallback) {
    sensors.push([sensor,cb]);
}
export function unregisterSensor(sensor:Sensor) {
    for(let i=0;i<sensors.length;i++) {
        if (sensor === sensors[i][0]) {
            sensors.splice(i,1);
            break;
        }
    }
}
let sensorPollingInterval = 2000;
let publishData = true;

export function saveSettings(settings:IIotSimulatorSettings) {
    ipcRenderer.send('settings',settings);
    let newInterval = Number(settings.pollingInterval);
    if (isNaN(newInterval)) {
        newInterval = 2;
    }
    sensorPollingInterval = newInterval*1000;

    publishData = settings.publishData;

    if(publishData) {
        tick();
    }
}
function publish(sensors:Sensor[]) {
    sensors.forEach(s => {
        let topic = `/iot-simulator/devices/${s.device}`;
        let value = '' + s.value;
        ipcRenderer.send('cov',{topic,message:{value,device:s.device}});
    });
}
function tick() {
    if(!publishData) {
        return;
    }
    let toPublish:Sensor[] = [];
    for (let i = 0; i < sensors.length; i++) {
        const sensor = sensors[i][0];
        if (!sensor.active) {
            continue;
        }
        sensor.update();
        sensors[i][1](sensor);
        toPublish.push(sensor);
    }
    publish(toPublish);
    console.log("Messagess sent");
    setTimeout(tick,sensorPollingInterval);
}
//tick();