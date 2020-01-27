/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);

        window.plux.onDeviceFound(deviceFound, function(err) { console.log("onDeviceFound err: " + err); });
        window.plux.onConnectionStateChanged(onConnectionStateChanged, function(err) { console.log("onConnectionStateChanged err: " + err); });
        window.plux.onDataAvailable(onDataAvailable, function(err) { console.log("onDataAvailable err: " + err); });
        window.plux.onDeviceReady(onDeviceReady, function(err) { console.log("onDataAvailable err: " + err); });

        //ask for permission to scan for BTH devices
        window.plux.askForPermission(function(result) { console.log("askForPermission: " + result); }, function(err) { console.log("askForPermission: " + err); navigator.app.exitApp();});
    }
};

app.initialize();

const device1Identifier = "88:6B:0F:4D:F7:C4";
const device2Identifier = "88:6B:0F:94:49:C0";

function enableScan(enable, timeInMs) {
    window.plux.enableScan(function(result) { console.log("enableScan: " + result);}, function(err) { console.log("enableScan: " + err)}, enable, timeInMs)
}

//callbacks
function deviceFound(result){
    console.log("deviceFound: " + JSON.stringify(result))

    var identifier = result.address

    //save device1 as the main device
    if(identifier != device1Identifier){
        return
    }

    var name = result.name
    var type = result.communication

    document.getElementById("name").innerHTML = name == null ? "unknown" : name
    document.getElementById("address").innerHTML = identifier
}

function onConnectionStateChanged(stateObject){
    var identifier = stateObject.address
    var state = stateObject.state

    var stateName = "DISCONNECTED";

    switch (state) {
        case 0: //NO_CONNECTION
            stateName = "NO_CONNECTION"
            break;
        case 1: //LISTEN
            stateName = "LISTEN"
            break;
        case 2: //CONNECTING
            stateName = "CONNECTING"
            break;
        case 3: //CONNECTED
            stateName = "CONNECTED"
            break;
        case 4: //ACQUISITION_TRYING
            stateName = "ACQUISITION_TRYING"
            break;
        case 5: //ACQUISITION_OK
            stateName = "ACQUISITION_OK"
            break;
        case 6: //ACQUISITION_STOPPING
            stateName = "ACQUISITION_STOPPING"
            break;
        case 7: //DISCONNECTED
            stateName = "DISCONNECTED"
            break;
        case 8: //ENDED
            stateName = "ENDED"
            break;
        default:
            stateName = "unknown state"
    }

    document.getElementById("state").innerHTML = stateName
}

function onDataAvailable(frame){
    var identifier = frame.address
    var seqNumber = frame.sequence
    var digitalChannels = frame.digitalChannels
    var analogChannels = frame.analogChannels

    if(seqNumber % 1000 != 0){
        return
    }

    document.getElementById("results").innerHTML = JSON.stringify(frame)

    console.log('On Data Available: ' + JSON.stringify(frame));
}

function onDeviceReady(deviceProperties){
    var identifier = deviceProperties.path

    document.getElementById("results").innerHTML = JSON.stringify(deviceProperties)

    console.log('On Device Ready: ' + JSON.stringify(deviceProperties));


    //we're ready to start an acquisition
    //biosignalsplux
    // var source1 = {"port": 1, "nBits": 16, "channelMask":  0x01, "freqDivisor": 1}
    // var sources = [source1]
    //
    // start(sources, 1000);

    // if(identifier == device1Identifier){
    //     //biosignalsplux
    //     var source1 = {"port": 11, "nBits": 16, "channelMask":  0x01, "freqDivisor": 1}
    //     var source2 = {"port": 12, "nBits": 16, "channelMask":  0x01, "freqDivisor": 1}
    //     var source3 = {"port": 13, "nBits": 16, "channelMask":  0x01, "freqDivisor": 1}
    //     var source4 = {"port": 14, "nBits": 16, "channelMask":  0x01, "freqDivisor": 1}
    //     //var source4 = {"port": 11, "nBits": 16, "channelMask":  0x07, "freqDivisor": 1}
    //
    //     var sources = [source1, source2, source3, source4]
    //
    //     start(identifier, 1000, sources);
    //
    //     connect(device2Identifier)
    // }
    // else if(identifier == device2Identifier){
    //     var source1 = {"port": 1, "nBits": 16, "channelMask":  0x01, "freqDivisor": 1}
    //     //var source2 = {"port": 12, "nBits": 16, "channelMask":  0x01, "freqDivisor": 1}
    //     //var source3 = {"port": 13, "nBits": 16, "channelMask":  0x01, "freqDivisor": 1}
    //     //var source4 = {"port": 14, "nBits": 16, "channelMask":  0x01, "freqDivisor": 1}
    //
    //     //var sources = [source1, source2, source3, source4]
    //     var sources = [source1]
    //
    //
    //     start(identifier, 1000, sources);
    // }
}


//UI methods
document.getElementById("scan").onclick = function(){
    enableScan(true, 15000)
}

document.getElementById("connectButton").onclick = function(){
    var address = document.getElementById("address").innerHTML

    connect(address)
}

document.getElementById("disconnectButton").onclick = function(){
    var address = document.getElementById("address").innerHTML

    disconnect(address)

    //disconnect second device
    //disconnect(device2Identifier)
}

document.getElementById("startButton").onclick = function(){
    var address = document.getElementById("address").innerHTML

    //biosignalsplux
    var source1 = {"port": 11, "nBits": 16, "channelMask":  0x01, "freqDivisor": 1}
    var source2 = {"port": 12, "nBits": 16, "channelMask":  0x01, "freqDivisor": 1}
    var source3 = {"port": 13, "nBits": 16, "channelMask":  0x01, "freqDivisor": 1}
    var source4 = {"port": 14, "nBits": 16, "channelMask":  0x01, "freqDivisor": 1}
    //var source4 = {"port": 11, "nBits": 16, "channelMask":  0x07, "freqDivisor": 1}

    var sources = [source1, source2, source3, source4]

    start(address, 1000, sources);

    //BITalino
    //start([1,2,3,4,5], 1000);
}

document.getElementById("stopButton").onclick = function(){
    var address = document.getElementById("address").innerHTML

    stop(address);

    //stop acquisition -> second device
    //stop(device2Identifier)
}

//PLUX methods
function connect(address) {
    window.plux.connect(function(result) { console.log("connect: " + result);}, function(err) { console.log("connect: " + err)}, address)
}

function disconnect(address) {
    window.plux.disconnect(function(result) { console.log("disconnect: " + result);}, function(err) { console.log("v: " + err)}, address)
}

function start(address, sampleRate, sources) {
    window.plux.start(function(result) { console.log("start: " + result);}, function(err) { console.log("start: " + err)}, address, sampleRate, sources)
}

function stop(address) {
    window.plux.stop(function(result) { console.log("stop: " + result);}, function(err) { console.log("stop: " + err)}, address)
}