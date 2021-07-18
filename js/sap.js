const ProviderAppName = "SAPAndroidClient", CHANNELID = 104;
var SASocket = null;
var SAAgent = null;

var agentCallback = {
	onconnect : function(socket) {
		SASocket = socket;
		SASocket.setDataReceiveListener(onreceive);
		console.log("connected to the SAPAndroidClient");
		setConnectionStatusHTML(true);

		SASocket.setSocketStatusListener(function(reason) {
			console.log("Connection with SAPAndroidClient lost. Reason : [" + reason + "]");
			disconnect();
			setConnectionStatusHTML(false);
		});
	},
	onerror : function(error) {
		console.log('error : ' + error);
	}
};

var peerAgentFindCallback = {
	onpeeragentfound : function(peerAgent) {
		try {
			if (peerAgent.appName === ProviderAppName) {
				SAAgent.setServiceConnectionListener(agentCallback);
				SAAgent.requestServiceConnection(peerAgent);
			} else {
				alert("Different app : " + peerAgent.appName);
			}
		} catch (error) {
			console.log("Failed to request service connection [" + error.name + "] msg[" + error.message + "]");
		}
	},
	onerror : function(error) {
		console.log('error : ' + error);
	}
};

function connect() {
	if (SASocket) {
		alert('Already connected!');

		SASocket.setSocketStatusListener(function(reason) {
			console.log("Service connection lost. Reason : [" + reason + "]");
			disconnect();
		});

		return false;
	}
	try {
		webapis.sa.requestSAAgent(function(agents) {
			try {
				if (agents.length > 0) {
					SAAgent = agents[0];

					SAAgent.setPeerAgentFindListener(peerAgentFindCallback);
					SAAgent.findPeerAgents();
				} else {
					alert("SAPAndroidClient not found!");
				}
			} catch (error) {
				console.log("Failed to find peers [" + error.name + "] msg[" + error.message + "]");
			}
		}, function(error) {
			console.log("Failed to request SAAgent [" + error.name + "] msg[" + error.message + "]");
		});
	} catch (error) {
		console.log("Failed to request SAAgent [" + error.name + "] msg[" + error.message + "]");
	}
}

function disconnect() {
	try {
		if (SASocket !== null) {
			SASocket.close();
			SASocket = null;

			console.log("disconnected from SAPAndroidClient");
		}
	} catch (error) {
		console.log("Failed to disconnect [" + error.name + "] msg[" + error.message + "]");
	}
}

function sendMessage(data) {
	try {
		if (SASocket === null) {
			connect();
			return false;
		}
		SASocket.sendData(CHANNELID, data);
		return true;
	} catch (error) {
		console.log("Failed to send data [" + error.name + "] msg["
				+ error.message + "]");
		return false;
	}
}

function onreceive(channelId, data) {
	if (data.length === 1) {
		submitFilesToAndroidAgent();
	}
}