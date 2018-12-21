import * as React from 'react';
export interface ITopBarProps {
    publishData:boolean;
    onDataToggleSettings:( publishData:boolean) => void;
}
export interface ITopBarState {
    isToggleOn:boolean;
}
export class TopBar extends React.Component<ITopBarProps,ITopBarState> {
    constructor(props:ITopBarProps) {
        super(props);
        this.state = {isToggleOn: true};
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
		this.setState(function(prevState) {
			return {isToggleOn: !prevState.isToggleOn};
		});
    }


    onDataToggle() {
        this.props.onDataToggleSettings(!this.props.publishData);
    }
       
    render() { 
       
         return (
             <div className="topbar">
               <div className="iot_header">               
                  <div className="logo"></div>
                  <div className="topbar-rht">
                  <div className={this.state.isToggleOn ? 'offBtn' : 'sendBtn'} onClick={this.onDataToggle.bind(this)}>
                    <span className="serveData">DATA</span>  
                        <button onClick={this.handleClick}>
                            {this.state.isToggleOn ? 'OFF' : 'Send'}                           
                        </button>
                        <span className="btn-dot"></span>
                    </div>
                    <div className="header_m-logo"></div>
                  </div>
               </div>             
             </div>
           );
     }
}