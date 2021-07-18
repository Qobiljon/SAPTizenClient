var locationFilename = 'location.txt', locationDataSource = 36, locationSending = false, locationFileHandle = null;
var rrIntervalFilename = 'rrInterval.txt', rrIntervalDataSource = 41, rrIntervalSending = false, rrIntervalFileHandle = null;
var ppgFilename = 'ppgLightIntensity.txt', ppgDataSource = 43, ppgSending = false, ppgFileHandle = null;
var activityFilename = 'activity.txt', activityDataSource = 45, activitySending = false, activityFileHandle = null;
var ambientLightFilename = 'ambientLight.txt', ambientLightDataSource = 44, ambientLightSending = false, ambientLightFileHandle = null;
var heartRateFilename = 'heartRate.txt', heartRateDataSource = 46, heartRateSending = false, heartRateFileHandle = null;
var accelerometerFilename = 'accelerometer.txt', accelerometerDataSource = 42, accelerometerSending = false, accelerometerFileHandle = null;

// binding each filestream separately
function bindLocation() {
	// 1. location
	documentsDir.resolve(locationFilename, function(file) {
		// location file exists
		locationFileHandle = file;
	}, function(error) {
		// location file is missing
		var file = documentsDir.createFile(locationFilename);
		
		if (file === null) {
			console.log('failed to create a new file : ' + locationFilename);
		} else {
			locationFileHandle = file;
		}
	});
}
function bindRrInterval() {
	// 2. rrInterval
	documentsDir.resolve(rrIntervalFilename, function(file) {
		// rrInterval file exists
		rrIntervalFileHandle = file;
	}, function(error) {
		// rrInterval file is missing
		var file = documentsDir.createFile(rrIntervalFilename);
		if (file === null) {
			console.log('failed to create a new file : ' + rrIntervalFilename);
		} else {
			rrIntervalFileHandle = file;
		}
	});
}
function bindPpg() {
	// 3. ppg
	documentsDir.resolve(ppgFilename, function(file) {
		// ppg file exists
		ppgFileHandle = file;
	}, function(error) {
		// ppg file is missing
		var file = documentsDir.createFile(ppgFilename);
		if (file === null) {
			console.log('failed to create a new file : ' + ppgFilename);
		} else {
			ppgFileHandle = file;
		}
	});
}
function bindActivity() {
	// 4. activity
	documentsDir.resolve(activityFilename, function(file) {
		// activity file exists
		activityFileHandle = file;
	}, function(error) {
		// activity file is missing
		var file = documentsDir.createFile(activityFilename);
		if (file === null) {
			console.log('failed to create a new file : ' + activityFilename);
		} else {
			activityFileHandle = file;
		}
	});
}
function bindAmbientLight() {
	// 6. ambientLight
	documentsDir.resolve(ambientLightFilename, function(file) {
		// ambientLight file exists
		ambientFileHandle = file;
	}, function(error) {
		// ambientLight file is missing
		var file = documentsDir.createFile(ambientLightFilename);
		if (file === null) {
			console.log('failed to create a new file : ' + ambientLightFilename);
		} else {
			ambientLightFileHandle = file;
		}
	});
}
function bindHeartRate() {
	// 7. heartRate
	documentsDir.resolve(heartRateFilename, function(file) {
		// heartRate file exists
		heartRateFileHandle = file;
	}, function(error) {
		// heartRate file is missing
		var file = documentsDir.createFile(heartRateFilename);
		if (file === null) {
			console.log('failed to create a new file : ' + heartRateFilename);
		} else {
			heartRateFileHandle = file;
		}
	});
}
function bindAccelerometer() {
	// 8. accelerometer
	documentsDir.resolve(accelerometerFilename, function(file) {
		// accelerometer file exists
		accelerometerFileHandle = file;
	}, function(error) {
		// accelerometer file is missing
		var file = documentsDir.createFile(accelerometerFilename);
		if (file === null) {
			console.log('failed to create a new file : ' + accelerometerFilename);
		} else {
			accelerometerFileHandle = file;
		}
	});
}
// binding all filestreams
function bindFilestreams() {
	bindLocation();
	bindRrInterval();
	bindPpg();
	bindActivity();
	bindAmbientLight();
	bindHeartRate();
	bindAccelerometer();
}

// submitting each data source separately
function submitLocations() {
	// 1. location
	locationCanWrite = false;
	locationFileHandle.close();
	documentsDir.moveTo(locationFilename, 'old_' + locationFilename, true, function() {
		bindLocation();
		documentsDir.resolve('old_' + locationFilename, function(file) {
			file.readAsText(function(str) {
				locationSending = true;
				if (str.length === 0 || sendMessage(str)) {
					documentsDir.deleteFile('old_' + locationFilename, function() {
						console.log('old_' + locationFilename + ' deleted');
					}, function(e) {
						console.log('failed to delete ' + locationFilename + ', error : ' + e.message);
					});
				}
				locationSending = false;
			}, null, 'UTF-8');
		}, null);
	}, function(error) {
		console.log('failed to move the file ' + locationFilename);
		onError();
	});
}
function submitRrInterval() {
	// 2. rrInterval
	rrIntervalCanWrite = false;
	rrIntervalFileHandle.close();
	documentsDir.moveTo(rrIntervalFilename, 'old_' + rrIntervalFilename, true, function() {
		bindRrInterval();
		documentsDir.resolve('old_' + rrIntervalFilename, function(file) {
			file.readAsText(function(str) {
				rrIntervalSending = true;
				if (str.length === 0 || sendMessage(str)) {
					documentsDir.deleteFile('old_' + rrIntervalFilename, function() {
						console.log('old_' + rrIntervalFilename + ' deleted');
					}, function(e) {
						console.log('failed to delete ' + rrIntervalFilename + ', error : ' + e.message);
					});
				}
				rrIntervalSending = false;
			}, null, 'UTF-8');
		}, null);
	}, function(error) {
		console.log('failed to move the file ' + rrIntervalFilename);
		onError();
	});
}
function submitPPG() {
	// 3. ppg
	ppgCanWrite = false;
	ppgFileHandle.close();
	documentsDir.moveTo(ppgFilename, 'old_' + ppgFilename, true, function() {
		bindPpg();
		documentsDir.resolve('old_' + ppgFilename, function(file) {
			file.readAsText(function(str) {
				ppgSending = true;
				if (str.length === 0 || sendMessage(str)) {
					documentsDir.deleteFile('old_' + ppgFilename, function() {
						console.log('old_' + ppgFilename + ' deleted');
					}, function(e) {
						console.log('failed to delete ' + ppgFilename + ', error : ' + e.message);
					});
				}
				ppgSending = false;
			}, null, 'UTF-8');
		}, null);
	}, function(error) {
		console.log('failed to move the file ' + ppgFilename);
		onError();
	});
}
function submitActivity() {
	// 4. activity
	activityCanWrite = false;
	activityFileHandle.close();
	documentsDir.moveTo(activityFilename, 'old_' + activityFilename, true, function() {
		bindActivity();
		documentsDir.resolve('old_' + activityFilename, function(file) {
			file.readAsText(function(str) {
				activitySending = true;
				if (str.length === 0 || sendMessage(str)) {
					documentsDir.deleteFile('old_' + activityFilename, function() {
						console.log('old_' + activityFilename + ' deleted');
					}, function(e) {
						console.log('failed to delete ' + activityFilename + ', error : ' + e.message);
					});
				}
				activitySending = false;
			}, null, 'UTF-8');
		}, null);
	}, function(error) {
		console.log('failed to move the file ' + activityFilename);
		onError();
	});
}
function submitAmbientLight() {
	// 6. ambientLight
	ambientLightCanWrite = false;
	ambientLightFileHandle.close();
	documentsDir.moveTo(ambientLightFilename, 'old_' + ambientLightFilename, true, function() {
		bindAmbientLight();
		documentsDir.resolve('old_' + ambientLightFilename, function(file) {
			file.readAsText(function(str) {
				ambientLightSending = true;
				if (str.length === 0 || sendMessage(str)) {
					documentsDir.deleteFile('old_' + ambientLightFilename, function() {
						console.log('old_' + ambientLightFilename + ' deleted');
					}, function(e) {
						console.log('failed to delete ' + ambientLightFilename + ', error : ' + e.message);
					});
				}
				ambientLightSending = false;
			}, null, 'UTF-8');
		}, null);
	}, function(error) {
		console.log('failed to move the file ' + ambientLightFilename);
		onError();
	});
}
function submitHeartRate() {
	// 7. heartRate
	heartRateCanWrite = false;
	heartRateFileHandle.close();
	documentsDir.moveTo(heartRateFilename, 'old_' + heartRateFilename, true, function() {
		bindHeartRate();
		documentsDir.resolve('old_' + heartRateFilename, function(file) {
			file.readAsText(function(str) {
				heartRateSending = true;
				if (str.length === 0 || sendMessage(str)) {
					documentsDir.deleteFile('old_' + heartRateFilename, function() {
						console.log('old_' + heartRateFilename + ' deleted');
					}, function(e) {
						console.log('failed to delete ' + heartRateFilename + ', error : ' + e.message);
					});
				}
				heartRateSending = false;
			}, null, 'UTF-8');
		}, null);
	}, function(error) {
		console.log('failed to move the file ' + heartRateFilename);
		onError();
	});
}
function submitAccelerometer() {
	// 8. accelerometer
	var copyFp = accelerometerFileHandle;
	accelerometerFileHandle = null;
	copyFp.close();
	documentsDir.moveTo(accelerometerFilename, 'old_' + accelerometerFilename, true, function() {
		bindAccelerometer();
		documentsDir.resolve('old_' + accelerometerFilename, function(file) {
			file.readAsText(function(str) {
				accelerometerSending = true;
				if (str.length === 0 || sendMessage(str)) {
					documentsDir.deleteFile('old_' + accelerometerFilename, function() {
						console.log('old_' + accelerometerFilename + ' deleted');
					}, function(e) {
						console.log('failed to delete ' + accelerometerFilename + ', error : ' + e.message);
					});
				}
				accelerometerSending = false;
			}, null, 'UTF-8');
		}, null);
	}, function(error) {
		console.log('failed to move the file ' + accelerometerFilename);
		onError();
	});
}
// submitting all data sources
function submitFilesToAndroidAgent() {
	if (!locationSending) {
		submitLocations();
	}
	if (!rrIntervalSending) {
		submitRrInterval();
	}
	if (!ppgSending) {
		submitPPG();
	}
	if (!activitySending) {
		submitActivity();
	}
	if (!ambientLightSending) {
		submitAmbientLight();
	}
	if (!heartRateSending) {
		submitHeartRate();
	}
	if (!accelerometerSending) {
		submitAccelerometer();
	}
}

// saving a sampled data
function saveLocationSample(sample) {
	if (locationFileHandle != null) {
		locationFileHandle.write(locationDataSource + ',' + sample + '\n');
	}
}
function saveRRIntervalSample(sample) {
	if (rrIntervalFileHandle != null) {
		rrIntervalFileHandle.write(rrIntervalDataSource + ',' + sample + '\n');
	}
}
function savePPGSample(sample) {
	if (ppgFileHandle != null) {
		ppgFileHandle.write(ppgDataSource + ',' + sample + '\n');
	}
}
function saveActivitySample(sample) {
	if (activityFileHandle != null) {
		activityFileHandle.write(activityDataSource + ',' + sample + '\n');
	}
}
function saveAmbientLightSample(sample) {
	if (ambientLightFileHandle != null) {
		ambientLightFileHandle.write(ambientLightDataSource + ',' + sample + '\n');
	}
}
function saveHeartRateSample(sample) {
	if (heartRateFileHandle != null) {
		heartRateFileHandle.write(heartRateDataSource + ',' + sample + '\n');
	}
}
function saveAccelerometerSample(sample) {
	if (accelerometerFileHandle != null) {
		accelerometerFileHandle.write(accelerometerDataSource + ',' + sample + '\n');
	}
}
