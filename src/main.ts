// const {app, BrowserWindow,dialog} = require('electron');
import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import * as mqtt from 'mqtt';
import { IIotSimulatorSettings } from './iot-simulator-settings';


var VERSION = '0.1'

var devMode = false;
var template = [{
  label: "IoT Simulator",
  submenu: [
      { label: "About",  click: function() {about();}},
      { label: "Reload", accelerator: "CmdOrCtrl+R", click: function() {reload();}},
      { label: "Inspector", accelerator: "CmdOrCtrl+Shift+I", click: function() {showDevTools();}},
      { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
  ]},
  {
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
  ]},
];
var args = process.argv;
if (args.length > 2 ) {
  for(var i=0;i<args.length;i++) {
    var a = args[i];
    if (a == '--dev')
      devMode = true;
  }
}

function notifyMqttSubscribers() {
  console.log('Notifying subscribers: ', {'connected': !!client ? client.connected : false});
  CurrentWindow.webContents.send('mqttstatus', {'connected': !!client ? client.connected : false});
}



let CurrentWindow:BrowserWindow = null;
function  showDevTools() {
  if (!!CurrentWindow) CurrentWindow.webContents.openDevTools();
}
function reload() {
  if (!!CurrentWindow) CurrentWindow.reload();
}
function about() {
  dialog.showMessageBox(CurrentWindow,{
    type:'info',
    title:'About IoT Simulator',
    message:'IoT Simulator',
    detail:VERSION,
    buttons:['OK']
  });
}

let win:BrowserWindow;
function createWindow () {
  win = new BrowserWindow({width: 700, height: 500,titleBarStyle:'default',title:'IoT Simulator'});
  console.log('DIR',__dirname);
	win.loadURL(`file://${__dirname}/../index.html`)
  if (devMode) {
   win.webContents.openDevTools()
  }

	win.on('closed', () => {
		win = null
    CurrentWindow = null;
  });
  CurrentWindow = win;
  Menu.setApplicationMenu((Menu.buildFromTemplate as any)(template));
 
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
  return;
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
  	app.quit()
  }
});

let client:mqtt.MqttClient = null;
let settings:IIotSimulatorSettings = null;

function checkConnection() {
  console.log('Checking connnection');
  if (settings == null) {
    scheduleConnectionCheck();
    return;    
  }
  if (!settings.host) {
    scheduleConnectionCheck();
    return;
  }

  if (client == null)  {

    let port = 1883;
    let host = settings.host;

    if (host.indexOf(':')>0) {
      let parts = host.split(':');
      host = parts[0];
      port = Number(parts[1]);
    }
    console.log('Connecting to',host,port);
    client = mqtt.connect({host,port});
  } else {
    if (!client.connected) {
      console.log('Status',client.connected);
    }
  }
  scheduleConnectionCheck();
}

export function scheduleConnectionCheck() {
   setTimeout(() => {
    checkConnection();
    notifyMqttSubscribers();
  },3000);
}

scheduleConnectionCheck();

ipcMain.on('settings',(eveent:any,arg:IIotSimulatorSettings) => {
  console.log('Got settings. Force a refresh');
  settings = arg;
  client = null;
});
ipcMain.on('cov',(event:any,arg:{topic:string,message:any})=>{
  if (!client || !client.connected) {
    return;
  }
  try {
    client.publish(arg.topic,JSON.stringify(arg.message));
  } catch (error) {
    console.log('Publishing error',error);    
  }
});


app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
  	createWindow()
  }
})
