const BACKUP_CHECK_DELAY = 5 * 60000;

var timestamp = new Date().getTime();
var rrFile, rrIntervalFilename = 'rrInterval.sosw', rrIntervalDataSource = 41, rrIntervalLastSyncTimestamp = timestamp;
var ppgFile, ppgFilename = 'ppgLightIntensity.sosw', ppgDataSource = 43, ppgLastSyncTimestamp = timestamp;
var hrFile, heartRateFilename = 'heartRate.sosw', heartRateDataSource = 46, heartRateLastSyncTimestamp = timestamp;
var accFile, accelerometerFilename = 'accelerometer.sosw', accelerometerDataSource = 42, accelerometerLastSyncTimestamp = timestamp;
var gyrFile, rotationFilename = 'rotation.sosw', rotationDataSource = 48, rotationLastSyncTimestamp = timestamp;
var batFile, batterylevelFilename = 'batterylevel.sosw', batterylevelDataSource = 47, batterylevelLastSyncTimestamp = timestamp;

// binding each filestream separately
function bindRrInterval() {
	rrFile = tizen.filesystem.openFile("documents/" + rrIntervalFilename, "a");
	if (rrFile == null) {
		documentsDir.createFile(rrIntervalFilename);
		rrFile = tizen.filesystem.openFile("documents/" + rrIntervalFilename, "a");
	}
}
function bindHeartRate() {
	hrFile = tizen.filesystem.openFile("documents/" + heartRateFilename, "a");
	if (hrFile == null) {
		documentsDir.createFile(heartRateFilename);
		hrFile = tizen.filesystem.openFile("documents/" + heartRateFilename, "a");
	}
}
function bindPpg() {
	ppgFile = tizen.filesystem.openFile("documents/" + ppgFilename, "a");
	if (ppgFile == null) {
		documentsDir.createFile(ppgFilename);
		ppgFile = tizen.filesystem.openFile("documents/" + ppgFilename, "a");
	}
}
function bindAccelerometer() {
	accFile = tizen.filesystem.openFile("documents/" + accelerometerFilename, "a");
	if (accFile == null) {
		documentsDir.createFile(accelerometerFilename);
		accFile = tizen.filesystem.openFile("documents/" + accelerometerFilename, "a");
	}
}
function bindRotation(){
	gyrFile = tizen.filesystem.openFile("documents/" + rotationFilename, "a");
	if (gyrFile == null) {
		documentsDir.createFile(rotationFilename);
		gyrFile = tizen.filesystem.openFile("documents/" + rotationFilename, "a");
	}
}
function bindBatterylevel(){
	batFile = tizen.filesystem.openFile("documents/" + batterylevelFilename, "a");
	if (batFile == null) {
		documentsDir.createFile(batterylevelFilename);
		batFile = tizen.filesystem.openFile("documents/" + batterylevelFilename, "a");
	}
}

// binding all filestreams
function bindFilestreams() {
	bindRrInterval();
	bindHeartRate();
	bindPpg();
	bindAccelerometer();
	bindRotation();
	bindBatterylevel();
}


// submitting each data source separately
function backupRRInterval(timestamp) {
	rrFile.close();
	tizen.filesystem.copyFile("documents/" + rrIntervalFilename, "documents/" + timestamp.toString() + rrIntervalFilename);
	documentsDir.deleteFile("documents/" + rrIntervalFilename);
	bindRrInterval();
}
function backupPPG(timestamp) {
	ppgFile.close();
	tizen.filesystem.copyFile("documents/" + ppgFilename, "documents/" + timestamp.toString() + ppgFilename);
	documentsDir.deleteFile("documents/" + ppgFilename);
	bindPpg();
}
function backupHeartRate(timestamp) {
	hrFile.close();
	tizen.filesystem.copyFile("documents/" + heartRateFilename, "documents/" + timestamp.toString() + heartRateFilename);
	documentsDir.deleteFile("documents/" + heartRateFilename);
	bindHeartRate();
}
function backupAccelerometer(timestamp) {
	accFile.close();
	tizen.filesystem.copyFile("documents/" + accelerometerFilename, "documents/" + timestamp.toString() + accelerometerFilename);
	documentsDir.deleteFile("documents/" + accelerometerFilename);
	bindAccelerometer();
}
function backupRotation(timestamp) {
	gyrFile.close();
	tizen.filesystem.copyFile("documents/" + rotationFilename, "documents/" + timestamp.toString() + rotationFilename);
	documentsDir.deleteFile("documents/" + rotationFilename);
	bindRotation();
}
function backupBatterylevel(timestamp) {
	batFile.close();
	tizen.filesystem.copyFile("documents/" + batterylevelFilename, "documents/" + timestamp.toString() + batterylevelFilename);
	documentsDir.deleteFile("documents/" + batterylevelFilename);
	bindBatterylevel();
}

// saving a sampled data
function saveRRIntervalSample(sample) {
	if (rrFile != null)
		rrFile.writeStringNonBlocking(rrIntervalDataSource + ',' + sample + '\n', function() { rrFile.flush(); });

	var timestamp = new Date().getTime();
	if (timestamp - rrIntervalLastSyncTimestamp > BACKUP_CHECK_DELAY) {
		backupRRInterval(timestamp);
		rrIntervalLastSyncTimestamp = timestamp;
	}
}
function savePPGSample(sample) {
	if (ppgFile != null)
		ppgFile.writeStringNonBlocking(ppgDataSource + ',' + sample + '\n', function() { ppgFile.flush(); });

	var timestamp = new Date().getTime();
	if (timestamp - ppgLastSyncTimestamp > BACKUP_CHECK_DELAY) {
		backupPPG(timestamp);
		ppgLastSyncTimestamp = timestamp;
	}
}
function saveHeartRateSample(sample) {
	if (hrFile != null)
		hrFile.writeStringNonBlocking(heartRateDataSource + ',' + sample + '\n', function() { hrFile.flush(); });

	var timestamp = new Date().getTime();
	if (timestamp - heartRateLastSyncTimestamp > BACKUP_CHECK_DELAY) {
		backupHeartRate(timestamp);
		heartRateLastSyncTimestamp = timestamp;
	}
}
function saveAccelerometerSample(sample) {
	if (accFile != null)
		accFile.writeStringNonBlocking(accelerometerDataSource + ',' + sample + '\n', function() { accFile.flush(); });

	var timestamp = new Date().getTime();
	if (timestamp - accelerometerLastSyncTimestamp > BACKUP_CHECK_DELAY) {
		backupAccelerometer(timestamp);
		accelerometerLastSyncTimestamp = timestamp;
	}
}
function saveRotationSample(sample) {
	if (gyrFile != null)
		gyrFile.writeStringNonBlocking(rotationDataSource + ',' + sample + '\n', function() { gyrFile.flush(); });

	var timestamp = new Date().getTime();
	if (timestamp - rotationLastSyncTimestamp > BACKUP_CHECK_DELAY) {
		backupRotation(timestamp);
		rotationLastSyncTimestamp = timestamp;
	}
	
}
function saveBatteryLevel(sample) {
	if (batFile != null)
		batFile.writeStringNonBlocking(batterylevelDataSource + ',' + sample + '\n', function() { batFile.flush(); });

	var timestamp = new Date().getTime();
	if (timestamp - batterylevelLastSyncTimestamp > BACKUP_CHECK_DELAY) {
		backupBatterylevel(timestamp);
		batterylevelLastSyncTimestamp = timestamp;
	}
}