import * as classNames from 'classnames';
import * as React from 'react';
import { DeviceCard, IDeviceCardState } from '../device-card';
import { DeviceField, IncrementDecrement } from '../field';
import { registerDeviceCard } from '../iot-simulator';
import { Sensor } from '../sensor';
import { registerSensor } from '../sensor-manager';
import { PressureSensor } from '../sensors/pressure';

interface IPressureState extends IDeviceCardState {
    value:number | string;
    active:boolean;
}
export class PressureDevice extends DeviceCard<IPressureState> {
    sensor:Sensor = null;

    toggleStatus() {
        this.setState({active:!this.state.active},()=>{
            this.sensor.active = this.state.active;
        });
    }
    constructor(props:any) {
        super(props);
        this.state = {value:25,active:true};
        this.sensor = new PressureSensor(this.props.device.id+':pressure',this.state.value);
        this.sensor.active = this.state.active;
        registerSensor(this.sensor,()=>{
            this.setState({value:this.sensor.computeValue()});
        });
        
    }
    onIncrement(val:number) {
        let newVal = Number(this.sensor.value) + val;
        this.sensor.forceValue(newVal);

        /* temporarily set next value until next sensor update */
        this.setState({value:newVal});
    }
    
    
    render() {
        let url = `url(images/sensors/pressure.svg`;
        return <div className='pressure'>
            <div className='title' style={{ backgroundImage: url }}>Pressure Sensor</div>
            <div className='primary-value-box'>
                <DeviceField title='Pressure'>
                    {
                        Number(this.state.value).toFixed(2) + 'C'
                    }
                </DeviceField>
                <IncrementDecrement onChange={this.onIncrement.bind(this)} />
            </div>

            <div className='fields'>
                <DeviceField title='ID'>
                    {
                        this.props.device.id
                    }
                </DeviceField>
                <DeviceField title='Status'>
                    <div onClick={this.toggleStatus.bind(this)} className={classNames('device-card-status', { 'online': this.state.active })}>
                        {
                            this.state.active ? 'Online' : 'Offline'
                        }
                    </div>
                </DeviceField>
            </div>
        </div>;
    }
   
}

registerDeviceCard('pressure',(props) => <PressureDevice {...props} />);