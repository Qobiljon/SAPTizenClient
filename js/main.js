// variables
var ppgSensor, linearAccelerationSensor, lightSensor;
var listenerIdWalking, listenerIdRunning, listenerIdStationary;
var statusText;
var localDataSizeText;
var connectButton;
var appStatus = false;
var appVibrate = false;
var uploading = false;
var documentsDir;

function startHeartRateCollection() {
	appStatus = true;
	tizen.humanactivitymonitor.start('HRM', function(hrmInfo) {
		var timestamp = new Date().getTime();
		saveRRIntervalSample(timestamp + ',' + hrmInfo.rRInterval);
		saveHeartRateSample(timestamp + ',' + hrmInfo.heartRate);
		tizen.systeminfo.getPropertyValue("BATTERY", function (batteryInfo) {
			var timestamp = new Date().getTime();
			var isCharging = batteryInfo.isCharging;
		    var batteryLevel = (batteryInfo.level * 100);
		    saveBatteryLevel(timestamp + "," + isCharging + "," + batteryLevel);
		});
		if(hrmInfo.heartRate <= 0) {
			tizen.application.launch("WGvCVP8H7a.SAPTizenClient");
		}
	}, function(error) {
		// console.log('error : ' + error);
	});
	// console.log('HRM started');
}
function startHRMRawCollection() {
	ppgSensor = tizen.sensorservice.getDefaultSensor("HRM_RAW");
	ppgSensor.start(function() {
		var listener = function(ppgData) {
			var timestamp = new Date().getTime();
			savePPGSample(timestamp + "," + ppgData.lightIntensity);
		};
		var onerror = function() {
			// console.log("error occurred:" + error);
		};

		ppgSensor.getHRMRawSensorData(listener, onerror);
		ppgSensor.setChangeListener(listener, 10);
	}, function(error) {
		// console.log('error : ' + error.message);
	});
	// console.log('HRM Raw collection started');
}
function startLinearAccelerationCollection() {
	linearAccelerationSensor = tizen.sensorservice.getDefaultSensor("LINEAR_ACCELERATION");
	linearAccelerationSensor.start(function() {
		var listener = function(accData) {
			var timestamp = new Date().getTime();
			saveAccelerometerSample(timestamp + "," + accData.x + "," + accData.y + "," + accData.z);
		};
		var onerror = function(error) {
			// console.log('error : ' + error);
		};
		linearAccelerationSensor.getLinearAccelerationSensorData(listener, onerror);
		linearAccelerationSensor.setChangeListener(listener, 10);
	});
	// console.log('Linear acc collection started');
}
function startGeneralLoggingCollection() {
//	var rate = 1000;
//	var interval = window.setInterval(function(){
//		tizen.systeminfo.getPropertyValue("BATTERY", function (batteryInfo) {
//			var timestamp = new Date().getTime();
//			var isCharging = batteryInfo.isCharging;
//		    var batteryLevel = (batteryInfo.level * 100);
//		    saveBatteryLevel(timestamp + "," + isCharging + "," + batteryLevel);
//		});
//	}, rate);
}
function startRotationCollection() {
	rotationSensor = tizen.sensorservice.getDefaultSensor("GYROSCOPE_ROTATION_VECTOR");
	rotationSensor.start(function() {
		var listener = function(rotationData) {
			var timestamp = new Date().getTime();
			saveRotationSample(timestamp + "," + rotationData.x + "," + rotationData.y + "," + rotationData.z, + "," + rotationData.w);
		};
		var onerror = function(error) {
			// console.log('error : ' + error);
		};
		rotationSensor.setChangeListener(listener, 10);
	});
}
function startEnvironmentalSoundCollection() {
	
}

// sensing overall
function startSensing() {
	startHeartRateCollection();
	startHRMRawCollection();
	startLinearAccelerationCollection();
	startRotationCollection();
	startGeneralLoggingCollection();
	startEnvironmentalSoundCollection();
	
	// startAmbientLightCollection();
	// startActivityDetection();
}

// onstart
window.onload = function() {
	
	window.addEventListener('tizenhwkey', function(ev) {
		if (ev.keyName === "back") {
			var page = document.getElementsByClassName('ui-page-active')[0], pageid = page ? page.id : "";
			if (pageid === "main") {
				try {
					if (appStatus) {
						// window.webapis.motion.stop("HRM");
						tizen.application.getCurrentApplication().hide();
					} else {
						tizen.power.release("CPU");
						tizen.power.release("SCREEN");

						tizen.application.getCurrentApplication().exit();
					}
				} catch (ignore) {
				}
			} else {
				window.history.back();
			}
		}
	});

	// bind views
	statusText = document.getElementById("status_text");
	localDataSizeText = document.getElementById("local_data_size_text");
	connectButton = document.getElementById("connect_button");
	setConnectionStatusHTML(false);

	// connect to the android agent
	connect();

	// hold the CPU lock
	tizen.power.request("CPU", "CPU_AWAKE");
	tizen.power.request("SCREEN", "SCREEN_NORMAL");

	// acquire permissions and start data collection
	tizen.ppm.requestPermission("http://tizen.org/privilege/mediastorage",
			function() {
				tizen.ppm.requestPermission(
						"http://tizen.org/privilege/healthinfo", function() {
							tizen.filesystem.resolve("documents",
									function(dir) {
										documentsDir = dir;
										bindFilestreams();
										startSensing();
										// console.log('sensing started');
									}, function(error) {
										// console.log('resolve error : ' + error.message);
									}, "rw");
						}, function(error) {
							// console.log('resolve permission error : ' + error.message);
						});
			}, function(error) {
				// console.log('resolve permission error : ' + error.message);
			});

	tizen.power.setScreenStateChangeListener(function(oldState, newState) {
		if (newState !== "SCREEN_BRIGHT" || !tizen.power.isScreenOn()) {
			tizen.power.turnScreenOn();
			tizen.power.setScreenBrightness(1);
		}
	});
};

// GUI
function aboutClick() {
	alert("It collects health and behavioral data for a stress sensing study. Have a nice day =)");
}
function setConnectionStatusHTML(status) {
	if (status) {
		statusText.style.color = '#2ecc71';
		statusText.innerHTML = 'BT : CONNECTED';
		connectButton.style.display = "none";
	} else {
		statusText.style.color = 'red';
		statusText.innerHTML = 'BT : DISCONNECTED';
		connectButton.style.display = "block";
	}
}
function exitApp() {
	tizen.application.getCurrentApplication().exit();
}
function checkDataSize() {
	documentsDir.listFiles(function(files) {
		var count = 0;
		for (var i = 0; i < files.length; i++) {
			if (/^\d+.+\.sosw$/.test(files[i].name))
				count += 1;
		}
		alert(count + ' files need to be transfered!');
	}, function(error) {
		// console.log('error : ' + error);
	});
}
function uploadData() {
	if (!uploading) {
		uploading = true;
		documentsDir.listFiles(function(files) {
			for (var i = 0; i < files.length; i++) {
				if (/^\d+.+\.sosw$/.test(files[i].name)) {
					// console.log("sending " + files[i].name);
					var file = tizen.filesystem.openFile("documents/" + files[i].name, "rw");
					var data = file.readString();
					file.close();
					if (sendSAPMessage(files[i].name + '\n' + data)) {
						// console.log('sent');
						tizen.filesystem.deleteFile("documents/" + files[i].name);
					} else {
						// console.log('failed to send');
					}
				} else {
					// console.log("not matches " + files[i].name);
				}
			}
			uploading = false;
		}, function(error) {
			// console.log('error : ' + error);
			uploading = false;
		});
	}
}
