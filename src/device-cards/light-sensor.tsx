import * as classNames from 'classnames';
import * as React from 'react';
import * as ReactSlider from 'react-slider';
import { IDevice } from '../device';
import { DeviceCardState } from '../device-card';
import { DeviceField, TopBootomArrow } from '../field';
import { string } from 'prop-types';

interface ILightSensorProps  {
    state:DeviceCardState;
    value:number;
    onIncrement:(by:number) => void;
    lightChange:(by:string) => void;
    sensorType: string;
    sensorName: string;
    sensorPict: string;
    device:IDevice;
    active: boolean;
    onActiveChanged:() => void;
    tags?:string;
    toggleState:() => void;
    units: string;
    onDelete:() => void;
    transformValue?:(val:number) => string;
}

interface ILightSensorState {
   
}

export class LightSensorDevice extends React.Component<ILightSensorProps,{}> {  
    
    
   toggleActive() {
       this.props.onActiveChanged();
   }
    renderDelete() {
        return  <div className="delete" onClick={this.props.onDelete.bind(this)}></div>;

    }
    renderExpanded() {
        let url = `url(images/sensors/${this.props.sensorType}.svg`;
       
        let className = 'sensor-light-box';         
      
        if(this.props.value == 50) {
            className += ' midmode';  
        }
        else if(this.props.value == 100) {
            className += ' fullmode';
        }
        else {
            className += ' lightoff';
        }

       // console.log(className);
        
        return <div className='light-sensor'>

             <div className={className}>
                <div className='sensor-light'>
                    <span className="sensor-light-title">{this.props.sensorName}</span>
                </div>
            </div> 

            {
                [this.renderDelete(),this.renderExpandCollapse()]
            }

            <div className='primary-value-box'>
                <DeviceField title={'Value'}>
                    {
                        this.props.transformValue?this.props.transformValue(this.props.value):
                        Number(this.props.value).toFixed(2) + this.props.units
                    }
                </DeviceField>
               
                <ReactSlider min={0} max={100} step={50} defaultValue={this.props.value} value={this.props.value} onChange={this.props.lightChange.bind(this)} />  
                
            </div>

            <div className='fields'>
                <div className='sensor-top'>
                    <DeviceField title='Sensor ID'>
                        {
                            this.props.device.id
                        }
                    </DeviceField>                   
                                                    
                </div>
                
                <div className='sensor-bot'>
                    <DeviceField title='Sensor Status'>
                        <div onClick={this.toggleActive.bind(this)} className={classNames('device-card-status', { 'online': this.props.active })}>
                            {
                                this.props.active ? 'Online' : 'Offline'
                            }
                        </div>
                    </DeviceField> 
             
                </div>
            </div>

             <div className='device-topic'>
                 <div className='publishing-topic'><label>Publishing Topic : </label>/iot-simulator/out/{this.props.device.id}/value</div>
                 <div className='receiving-topic'><label>Receiving Topic : </label>/iot-simulator/in/{this.props.device.id}/value</div>
            </div>

        </div>;
    }
   
    renderExpandCollapse()
    {
        return  <div className="expand-collapse" onClick={this.props.toggleState.bind(this)}></div>;
    }
    render() {
        
      //  console.log(this.props.value);

        if (this.props.state === DeviceCardState.expanded) {
            return this.renderExpanded();
        }
        
        let url = `url(images/sensors/${this.props.sensorType}.svg`;
       
        let className = 'sensor-light-box';       
        if(this.props.value == 50) {
            className += ' midmode';  
        }
        else if(this.props.value == 100) {
            className += ' fullmode';
        }
        else {
            className += ' lightoff';
        }

      //  console.log(className);
        
        return <div className='light-sensor'>

            <div className={className}>
                <div className='sensor-light'>
                    <span className="sensor-light-title">{this.props.sensorName}</span>
                </div>
            </div>  

            <div className='primary-value-box'>
                <DeviceField title={'Value'}>
                    {
                        this.props.transformValue?this.props.transformValue(this.props.value):
                        Number(this.props.value).toFixed(2) + this.props.units
                    }
                </DeviceField>
               
                <ReactSlider min={0} max={100} step={50} defaultValue={this.props.value} value={this.props.value} onChange={this.props.lightChange.bind(this)} />  
                
            </div>

            <div className='fields'>
                <div className='sensor-top'>
                    <DeviceField title='Sensor ID'>
                        {
                            this.props.device.id
                        }
                    </DeviceField>                   
                                                    
                </div>
                
                <div className='sensor-bot'>
                    <DeviceField title='Sensor Status'>
                        <div onClick={this.toggleActive.bind(this)} className={classNames('device-card-status', { 'online': this.props.active })}>
                            {
                                this.props.active ? 'Online' : 'Offline'
                            }
                        </div>
                    </DeviceField> 
             
                </div>
            </div>



            <div className="expand-collapsearrow">
                   {
                       this.renderExpandCollapse()
                   }
                    <TopBootomArrow onChange={this.props.onIncrement.bind(this)} />            
            </div>
        </div>;
    }
   
}

