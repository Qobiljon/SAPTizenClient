var locationName = 'LOC', locationDataSource = 31, locationFileStream = {
	value : null
};
var rrIntervalName = 'RR_', rrIntervalDataSource = 35, rrIntervalFileStream = {
	value : null
};
var ppgName = 'PPG', ppgDataSource = 32, ppgFileStream = {
	value : null
};
var activityName = 'ACT', activityDataSource = 33, activityFileStream = {
	value : null
};
var sleepName = 'SLP', sleepDataSource = 36, sleepFileStream = {
	value : null
};
var ambientLightName = 'ALT', ambientLightDataSource = 38, ambientLightFileStream = {
	value : null
};
var heartRateName = 'HR_', heartRateDataSource = 34, heartRateFileStream = {
	value : null
};
var accelerometerName = 'ACC', accelerometerDataSource = 37, accelerometerFileStream = {
	value : null
};
var fileNames = [ locationName, rrIntervalName, ppgName, activityName, sleepName, ambientLightName, heartRateName, accelerometerName ];
var canWrite = false;

var newFile;
function createNewFile(fileName, fileStream, onSuccess, onError) {
	newFile = documentsDir.createFile(fileName + '.txt');
	if (newFile !== null) {
		newFile.openStream("w", function(fs) {
			fileStream.value = fs;
			onSuccess();
		}, function(error) {
			console.log("openStream error : " + error.message + ', filename=new.txt');
			onError();
		}, "UTF-8");
	} else {
		console.log("createFile error, file : " + fileName + ".txt");
		onError();
	}
}

var timestamp;
var moveFromName;
var moveToName;
function cacheFile(fileName, fileStream, onSuccess, onError) {
	moveFromName = fileName;
	moveToName = timestamp + fileName;
	documentsDir.moveTo('documents/' + moveFromName + '.txt', 'documents/' + moveToName + '.txt', true, function() {
		createNewFile(fileName, fileStream, onSuccess, onError);
	}, function(error) {
		onError();
		console.log('failed to move the file ' + moveFromName + '.txt to ' + moveToName + '.txt');
	});
}

function cacheFiles(onSuccess, onError) {
	timestamp = +new Date();
	tizen.filesystem.resolve('documents/' + locationName + '.txt', function(file) {
		cacheFile(locationName, locationFileStream, function() {
			cacheFile(rrIntervalName, rrIntervalFileStream, function() {
				cacheFile(ppgName, ppgFileStream, function() {
					cacheFile(activityName, activityFileStream, function() {
						cacheFile(sleepName, sleepFileStream, function() {
							cacheFile(ambientLightName, ambientLightFileStream, function() {
								cacheFile(heartRateName, heartRateFileStream, function() {
									cacheFile(accelerometerName, accelerometerFileStream, onSuccess, onError);
								}, onError);
							}, onError);
						}, onError);
					}, onError);
				}, onError);
			}, onError);
		}, onError);
	}, function(error) {
		createNewFile(locationName, locationFileStream, function() {
			createNewFile(rrIntervalName, rrIntervalFileStream, function() {
				createNewFile(ppgName, ppgFileStream, function() {
					createNewFile(activityName, activityFileStream, function() {
						createNewFile(sleepName, sleepFileStream, function() {
							createNewFile(ambientLightName, ambientLightFileStream, function() {
								createNewFile(heartRateName, heartRateFileStream, function() {
									createNewFile(accelerometerName, accelerometerFileStream, onSuccess, onError);
								}, onError);
							}, onSuccess);
						}, onError);
					}, onError);
				}, onError);
			}, onError);
		}, onError);
	}, 'rw');
}

function saveDataSample(dataSource, sample) {
	if (canWrite) {
		switch (dataSource) {
		case locationDataSource:
			locationFileStream.value.write(locationDataSource + ',' + sample + '\n');
			break;
		case rrIntervalDataSource:
			rrIntervalFileStream.value.write(rrIntervalDataSource + ',' + sample + '\n');
			break;
		case ppgDataSource:
			ppgFileStream.value.write(ppgDataSource + ',' + sample + '\n');
			break;
		case activityDataSource:
			activityFileStream.value.write(activityDataSource + ',' + sample + '\n');
			break;
		case sleepDataSource:
			sleepFileStream.value.write(sleepDataSource + ',' + sample + '\n');
			break;
		case ambientLightDataSource:
			ambientLightFileStream.value.write(ambientLightDataSource + ',' + sample + '\n');
			break;
		case heartRateDataSource:
			heartRateFileStream.value.write(heartRateDataSource + ',' + sample + '\n');
			break;
		case accelerometerDataSource:
			accelerometerFileStream.value.write(accelerometerDataSource + ',' + sample + '\n');
			break;
		default:
			break;
		}
	}
}

var allFiles, currentFileIndex, currentFile, currentFileName, currentFileSize;
function sendFilesRecursively() {
	if (currentFileIndex == allFiles.length)
		return;
	currentFile = allFiles[currentFileIndex++];
	if (!fileNames.includes(currentFile.name)) {
		currentFile.openStream('r', function(fs) {
			currentFileName = currentFile.name;
			currentFileSize = currentFile.fileSize;
			if (fileSize <= 0 || sendMessage(fs.read(currentFile.fileSize))) {
				documentsDir.deleteFile(currentFile.fullPath, function() {
					console.log('file (' + currentFileName + '.txt, ' + currentFileSize + ' bytes) sent and deleted');
					sendFilesRecursively();
				}, function(error) {
					console.log('deleteFile error : ' + error.message + ' (file : ' + currentFile.name + ', size : ' + currentFile.fileSize + ')');
					sendFilesRecursively();
				});
			} else {
				sendFilesRecursively();
			}
		}, function(error) {
			console.log('openStream error : ' + error.message);
			sendFilesRecursively();
		});
	}
}

function submitFilesToAndroidAgent() {
	canWrite = false;
	cacheFiles(function() {
		canWrite = true;
		documentsDir.listFiles(function(files) {
			allFiles = files;
			currentFileIndex = 0;
			sendFilesRecursively();
		}, function(error) {
			console.log('listFiles error : ' + error.message);
		});
	}, function() {
		canWrite = true;
		alert('You have an issue with data collection.\nPlease inform the campaigner!');
	});
}
