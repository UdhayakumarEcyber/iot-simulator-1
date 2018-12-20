import * as classNames from 'classnames';
import * as React from 'react';
import { Settings } from './settings';

export interface IBottomBarProps {    
    onSideBarCollapse:(collapsed:boolean) => void;
    collapsed: boolean;
    onActiveSettings:(settingsActived:boolean)=> void;
    settingsActived:boolean ;     
    mqttServerState:string;    
}
export interface IBottomBarState {
       
}

export class BottomBar extends React.Component<IBottomBarProps,IBottomBarState> {
    constructor(props:IBottomBarProps) {
        super(props);
        this.state = {           
            collapse: false,          
            settingsActive:false,
            
          };                 
    }

    toggle() {
        this.props.onSideBarCollapse(!this.props.collapsed);
        // this.props.onScreenChanges(e);
    }
    onCallSettings(){
        this.props.onActiveSettings(!this.props.settingsActived);
    }
 
    render() {                 
            let className = 'serve_connection';       
            if(this.props.mqttServerState == 'online'){
                className += ' online';  
            }           
            else {
                className += ' offline';
            }
       
        return  <div className={classNames('bottombar',{'sidebar-collapsed':this.props.collapsed})} >       
            <div className='sensors-nav'/>           
            <div onClick={this.onCallSettings.bind(this)} className="settings-icon"/>
            <div className={className}></div>

        </div>;
     }
}

