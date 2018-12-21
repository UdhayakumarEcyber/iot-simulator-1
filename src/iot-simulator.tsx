import * as ejs from 'electron-json-storage';
import { List } from 'immutable';
import * as React from 'react';
import { BottomBar } from './bottombar';
import { IDevice } from './device';
import { DeviceCardState, IDeviceCardProps } from './device-card';
import { IIotSimulatorSettings } from './iot-simulator-settings';
import { saveSettings } from './sensor-manager';
import { Settings } from './settings';
import { SideBar } from './sidebar';
import { Staging } from './staging';
import { TopBar } from './topbar';
import { ipcRenderer } from 'electron';

interface IIoTSimulatorProps {
    settingsActived: boolean;   
    onActiveSettings:any;  
    onDataToggleSettings:any;  
}

interface IIoTSimulatorState {
    settingsActive: boolean;
    devices:List<IDevice>;
    collapse: boolean;
    expandedDevice:IDevice;
    settings:IIotSimulatorSettings;
    mqttServerState:string;
    publishData:boolean;
}

type DeviceCreator = (props:IDeviceCardProps) => JSX.Element;
const DeviceCardMap:{[name:string]:[DeviceCreator,string]} = {};
export function registerDeviceCard(name:string,title:string,f:DeviceCreator) {
    DeviceCardMap[name] = [f,title];
}
export function getAllDevices():Array<[string,string]> {
    let r:Array<[string,string]> = [];
    for(let k in DeviceCardMap) {
        r.push([k,DeviceCardMap[k][1]]);
    }
    return r;
}
export function createDeviceCard(name:string,props:IDeviceCardProps):JSX.Element {
    return DeviceCardMap[name][0](props);
}
export class IoTSimulator extends React.Component<{},IIoTSimulatorState> {
     constructor(props:any) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.onCallSettings = this.onCallSettings.bind(this);

        this.onDataToggle = this.onDataToggle.bind(this);

        this.state = {
            devices:List(),
            collapse: false,
            expandedDevice:null,
            settingsActive:false,
            mqttServerState:'offline',
            publishData:true,
            settings:{
                host:'',
                user:'',
                password:'',
                topicPrefix:'/iot-simulator',
                pollingInterval:'2',
                publishData: true,
            }
          };

          ejs.get('settings',(err:any,data:any) => {
              console.log('got settings',data);
            if (!!err) {
                console.log('Error loading settings:',err);
                return;
            }
            if (!data.settings) data.settings = {};
            let newSettings = {
                host: data.settings.host || '',
                user: data.settings.user || '',
                password: data.settings.password || '',
                topicPrefix: data.settings.topicPrefix || '/iot-simulator',
                pollingInterval: data.pollingInterval || '2',
                publishData:  data. publishData || true,
            };
            let loadedDevices = List<IDevice>();
            let savedDevices = data.devices|| [];
            for(var i=0;i<savedDevices.length;i++) {
                let d = savedDevices[i];
                let m:IDevice = {id:d.id,type:d.type};
                loadedDevices = loadedDevices.push(m);
            }
            this.setState({settings:newSettings,devices:loadedDevices},()=>{
                saveSettings(this.state.settings);
            });
          });
      
       ipcRenderer.on('mqttstatus', this.mqttStatusChanged.bind(this));   
    }
    
    mqttStatusChanged(event: any, msg: any) {
        if(!msg.connected) {
            this.setState({mqttServerState: 'offline'})
        }
        else {
            this.setState({mqttServerState: 'online'})
        }
    }

  

    saveSettings() {
        let obj = {settings:this.state.settings,devices:this.state.devices.toJS()};
        console.log('Saving',obj);
        ejs.set('settings',obj,(err:any)=>{if (!!err)console.log('Error saving settings: ',err);});
    }
    toggle(collapsed:boolean) {
        this.setState({ collapse:collapsed });       
    }
    onCallSettings(settingsActived:boolean){
        this.setState({ settingsActive : settingsActived });          
    }

    closeSettings() {
        this.setState({settingsActive:false});
    }
    onSave(settings:IIotSimulatorSettings) {
        this.setState({
            settings: {
                host: settings.host,
                user: settings.user,
                password: settings.password,
                topicPrefix: settings.topicPrefix,
                pollingInterval:settings.pollingInterval,
                publishData: settings.publishData
            },
            settingsActive: false
        }, () => {
            this.saveSettings();
            saveSettings(this.state.settings);
        });
    }

    onDataToggle() {
        var publishData = !this.state.settings.publishData;

        var settings = {
            host: this.state.settings.host,
            user: this.state.settings.user,
            password: this.state.settings.password,
            topicPrefix: this.state.settings.topicPrefix,
            pollingInterval:this.state.settings.pollingInterval,
            publishData: publishData
        };

        settings.publishData = publishData;

        this.onSave(settings);
    }

    removeDevice(device:IDevice) {
        this.setState({devices:List(this.state.devices.filter(x => x !==device))},()=>{
            this.saveSettings();
        });

    }
    addDevice(device:IDevice) {
        console.log('Server Connected'); 
        this.setState({devices:this.state.devices.push(device)},()=>{
            this.saveSettings();
        });
    }
    deviceStateChange(device:IDevice,newState:DeviceCardState) {
        if (newState === DeviceCardState.expanded) {
            this.setState({expandedDevice:device});
        } else {
            this.setState({expandedDevice:null});
        }
    }
    
    render() {      

        return <div className='container'>
            <TopBar publishData={this.state.publishData} onDataToggleSettings={this.onDataToggle.bind(this)}/>
            <SideBar onSideBarCollapse={this.toggle.bind(this)} collapsed={this.state.collapse} onAddDevice={this.addDevice.bind(this)} />
            <Staging onDeviceDeleted={this.removeDevice.bind(this)} expandedDevice={this.state.expandedDevice} collapsed={this.state.collapse} devices={this.state.devices} onDeviceStateChange={this.deviceStateChange.bind(this)} />
            <BottomBar onSideBarCollapse={this.toggle.bind(this)} collapsed={this.state.collapse} onActiveSettings={this.onCallSettings.bind(this)} settingsActived={this.state.settingsActive} mqttServerState={this.state.mqttServerState}/>
            <Settings onSave={this.onSave.bind(this)}  settings={this.state.settings}  settingsActived={this.state.settingsActive} onClose={this.closeSettings.bind(this)}/>

            {/* <div visible={this.state.settings}>
                <Settings steps={Settings} onClose={this.closesettings.bind(this)} />
            </div> */}
        </div>
    }
}