var statusText;
var connectButton;
var appStatus = false;
var appVibrate = false;
var documentsDir;

var ppgSensor, linearAccelerationSensor, lightSensor;
var listenerIdWalking, listenerIdRunning, listenerIdStationary;

function startHeartRateCollection() {
	appStatus = true;
	tizen.ppm.requestPermission("http://tizen.org/privilege/healthinfo", function() {
		tizen.humanactivitymonitor.start('HRM', function(hrmInfo) {
			var timestamp = new Date().getTime();
			if (hrmInfo.heartRate > 0 && hrmInfo.rRInterval > 0) {
				appVibrate = false;
				saveDataSample(rrIntervalDataSource, timestamp + ',' + hrmInfo.rRInterval);
				saveDataSample(heartRateDataSource, timestamp + ',' + hrmInfo.heartRate);
			} else if (hrmInfo.heartRate <= 0) {
				tizen.application.launch("WGvCVP8H7a.SAPTizenClient");
				if (!appVibrate) {
					appVibrate = true;
					navigator.vibrate(700);
				}
			}
		});
		console.log('HRM started');
	}, function(error) {
		console.log('failed to start HRM, permission error : ' + error.message);
	});
}

function startSleepMonitoring() {
	appStatus = true;
	tizen.ppm.requestPermission("http://tizen.org/privilege/healthinfo", function() {
		var timestamp = new Date().getTime();
		tizen.humanactivitymonitor.start('SLEEP_MONITOR', function(sleepInfo) {
			saveDataSample(sleepDataSource, timestamp + "," + sleepInfo.status);
			console.log("sleep status: " + sleepInfo.status)
		});
		console.log('sleep monitoring started');
	}, function(error) {
		console.log('failed to start sleep monitoring, permission error : ' + error.message);
	});
}

function startGPS() {
	appStatus = true;
	tizen.ppm.requestPermission("http://tizen.org/privilege/location", function() {
		var timestamp = new Date().getTime();
		tizen.humanactivitymonitor.start('GPS', function(info) {
			var gpsInfo = info.gpsInfo;
			for (var index = 0; index < gpsInfo.length; index++) {
				saveDataSample(locationDataSource, timestamp + "," + gpsInfo[index].latitude + "," + gpsInfo[index].longitude);
			}
		}, function(error) {
			console.log('Error occurred. Name:' + error.name + ', message: ' + error.message);
		}, {
			callbackInterval : 150000,
			sampleInterval : 1000
		});
		console.log('gps started');
	}, function(error) {
		console.log('failed to start GPS monitoring, permission error : ' + error.message);
	});
}

function startHRMRawCollection() {
	appStatus = true;
	ppgSensor = tizen.sensorservice.getDefaultSensor("HRM_RAW");
	ppgSensor.start(function() {
		ppgSensor.getHRMRawSensorData(function(ppgData) {
			var timestamp = new Date().getTime();
			saveDataSample(accelerometerDataSource, timestamp + "," + ppgData.lightIntensity);
		}, function(error) {
			console.log("error occurred:" + error);
		});
		ppgSensor.setChangeListener(function(ppgData) {
			var timestamp = new Date().getTime();
			saveDataSample(accelerometerDataSource, timestamp + "," + ppgData.lightIntensity);
		}, 10);
	});
	console.log('HRM Raw collection started');
}

function startLinearAccelerationCollection() {
	appStatus = true;
	linearAccelerationSensor = tizen.sensorservice.getDefaultSensor("LINEAR_ACCELERATION");
	linearAccelerationSensor.start(function() {
		linearAccelerationSensor.getLinearAccelerationSensorData(function(AccData) {
			var timestamp = new Date().getTime();
			saveDataSample(accelerometerDataSource, timestamp + "," + AccData.x + "," + AccData.y + "," + AccData.z);
		}, function(error) {
			console.log("error occurred:" + error);
		});
		linearAccelerationSensor.setChangeListener(function(AccData) {
			var timestamp = new Date().getTime();
			saveDataSample(accelerometerDataSource, timestamp + "," + AccData.x + "," + AccData.y + "," + AccData.z);
		}, 10);
	});
	console.log('Linear acc collection started');
}

function startAmbientLightCollection() {
	appStatus = true;
	lightSensor = tizen.sensorservice.getDefaultSensor("LIGHT");
	lightSensor.start(function() {
		lightSensor.getLightSensorData(function(LightData) {
			var timestamp = new Date().getTime();
			saveDataSample(ambientLightDataSource, timestamp + "," + LightData.lightLevel);
			console.log("Ambient light level : " + LightData.lightLevel);
		}, function(error) {
			console.log("error occurred:" + error);
		});
		lightSensor.setChangeListener(function(LightData) {
			var timestamp = new Date().getTime();
			saveDataSample(ambientLightDataSource, timestamp + "," + LightData.lightLevel);
			// console.log("Ambient light level : "+ LightData.lightLevel );
		}, 10);
	});
	console.log('Ambient light sensor start');
}

function startActivityDetection() {
	listenerIdWalking = tizen.humanactivitymonitor.addActivityRecognitionListener('WALKING', function(activityInfo) {
		var timestamp = new Date().getTime();
		saveDataSample(activityDataSource, timestamp + "," + activityInfo.type);
		console.log("activity type: " + activityInfo.type);
	}, function(error) {
		console.log(error.name + ': ' + error.message);
	});
	listenerIdRunning = tizen.humanactivitymonitor.addActivityRecognitionListener('RUNNING', function(activityInfo) {
		var timestamp = new Date().getTime();
		saveDataSample(activityDataSource, timestamp + "," + activityInfo.type);
		console.log("activity type: " + activityInfo.type);
	}, function(error) {
		console.log(error.name + ': ' + error.message);
	});
	listenerIdStationary = tizen.humanactivitymonitor.addActivityRecognitionListener('STATIONARY', function(activityInfo) {
		var timestamp = new Date().getTime();
		saveDataSample(activityDataSource, timestamp + "," + activityInfo.type);
		console.log("activity type: " + activityInfo.type);
	}, function(error) {
		console.log(error.name + ': ' + error.message);
		console.log("activity type: " + activityInfo.type);
	});
}

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
	connectButton = document.getElementById("connect_button");
	setConnectionStatusHTML(false);

	// connect to the android agent
	connect();

	// hold the CPU lock
	tizen.power.request("CPU", "CPU_AWAKE");
	tizen.power.request("SCREEN", "SCREEN_NORMAL");

	// acquire permissions and start data collection
	tizen.ppm.requestPermission("http://tizen.org/privilege/mediastorage", function() {
		tizen.filesystem.resolve("documents", function(dir) {
			documentsDir = dir;
			dir.listFiles(function(files) {
				console.log(files.length + ' files in "documents" dir');
			}, null);
			cacheFiles(function() {
				startHeartRateCollection();
				// startGPS();
				// startSleepMonitoring();
				// startHRMRawCollection();
				// startLinearAccelerationCollection();
				// startAmbientLightCollection();
				// startActivityDetection();
			}, function() {
				alert('Failed to create a file for storing data!');
			});
		}, function(error) {
			console.log('resolve error : ' + error.message);
		}, "rw");
	}, function(error) {
		console.log('resolve permission error : ' + error.message);
	});

	tizen.power.setScreenStateChangeListener(function(oldState, newState) {
		if (newState !== "SCREEN_BRIGHT" || !tizen.power.isScreenOn()) {
			tizen.power.turnScreenOn();
			// tizen.power.setScreenBrightness(1);
		}
	});
};

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