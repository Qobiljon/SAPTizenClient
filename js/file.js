const
DataSource = {
	TIZEN_LOCATION : 31,
	TIZEN_RR_INTERVAL : 35,
	TIZEN_LIGHT_INTENSITY : 32,
	TIZEN_HAD_ACTIVITY : 33,
	TIZEN_HAD_SLEEP_PATTERN : 36,
	TIZEN_AMBIENT_LIGHT : 38,
	TIZEN_HR : 34,
	TIZEN_ACCELEROMETER : 37
}, fileHeader = "DATA_SOURCE_ID,TIMESTAMP,VALUES,...";
var newFileStream = null, oldFile = null;
var canWrite = false;

function createNewFile(fileCreationCb, fileCreationErrorCb) {
	canWrite = false;
	if (newFileStream === null) {
		tizen.filesystem.resolve("documents/new.txt", function(file) {
			documentsDir.moveTo(file.fullPath, 'documents/old.txt', true, function() {
				var newFile = documentsDir.createFile('new.txt');
				if (newFile !== null) {
					console.log("new.txt copied to old.txt");
					newFile.openStream("w", function(fs) {
						newFileStream = fs;
						fs.write(fileHeader + "\r\n");
						canWrite = true;
						if (fileCreationCb !== null) {
							fileCreationCb();
						}
					}, function(error) {
						console.log("openStream error : " + error.message + ', filename=new.txt');
						canWrite = false;
						if (fileCreationCb !== null) {
							fileCreationErrorCb();
						}
					}, "UTF-8");
				} else {
					console.log("failed to create new.txt");
					canWrite = false;
					if (fileCreationCb !== null) {
						fileCreationErrorCb();
					}
				}
			});
		}, function(error) {
			var newFile = documentsDir.createFile('new.txt');
			if (newFile !== null) {
				console.log("new.txt file created : " + newFile.fullPath);
				newFile.openStream("w", function(fs) {
					newFileStream = fs;
					fs.write(fileHeader + "\r\n");
					canWrite = true;
					if (fileCreationCb !== null) {
						fileCreationCb();
					}
				}, function(error) {
					console.log("openStream error : " + error.message + ', filename=new.txt');
					canWrite = false;
					if (fileCreationCb !== null) {
						fileCreationErrorCb();
					}
				}, "UTF-8");
			} else {
				console.log("failed to create new.txt");
				canWrite = false;
				if (fileCreationCb !== null) {
					fileCreationErrorCb();
				}
			}
		}, 'rw');
	} else {
		newFileStream.close();
		documentsDir.moveTo('documents/new.txt', 'documents/old.txt', true, function() {
			var newFile = documentsDir.createFile('new.txt');
			if (newFile !== null) {
				console.log("new.txt stored as old.txt");
				newFile.openStream("w", function(fs) {
					newFileStream = fs;
					fs.write(fileHeader + "\r\n");
					canWrite = true;
					if (fileCreationCb !== null) {
						fileCreationCb();
					}
				}, function(error) {
					console.log("openStream error : " + error.message + ', filename=new.txt');
					canWrite = false;
					if (fileCreationCb !== null) {
						fileCreationErrorCb();
					}
				}, "UTF-8");
			} else {
				console.log("failed to create new.txt");
				canWrite = false;
				if (fileCreationCb !== null) {
					fileCreationErrorCb();
				}
			}
		});
	}
}

var count = 0;

function appendLine(line) {
	count++;
	if (canWrite) {
		newFileStream.write(line + "\r\n");
	}
}

function submitFilesToAndroidAgent() {
	createNewFile(function() {
		tizen.filesystem.resolve("documents/old.txt", function(file) {
			oldFile = file;
			file.openStream("r", function(fs) {
				var data = fs.read(oldFile.fileSize);
				fs.close();
				if (sendMessage(data)) {
					console.log('file sent to android agent');
					console.log('samples : ' + count);
					count = 0;
					documentsDir.deleteFile(oldFile.fullPath, function() {
						console.log('file deleted');
					}, function() {
						console.log('failed to delete the file : ' + files[n].fullPath);
					});
				} else {
					console.log('failed to send the file to android agent');
				}
			}, function(error) {
				console.log('openStream error : ' + error.message);
			});
		}, function(error) {
			console.log('resolve error : ' + error.message + ', filename=old.txt');
		});
	}, null);
}

/*
 * function submitFilesToAndroidAgent() { createNewFile();
 * 
 * tizen.filesystem.resolve('documents', function(dir) {
 * dir.listFiles(function(files) { for (var n = 0; n < files.length; n++) { if
 * (files[n] !== currentFile) { files[n].openStream('r', function(fileStream) {
 * var data = fileStream.readFile(files[n], 'utf-8'); if (sendMessage(data)) {
 * dir.deleteFile(files[n].fullPath, onFileDeteleSuccess, onFileDeleteError); }
 * alert('success'); }, function(error) { console.log('Failed to read a file : ' +
 * error.message); alert('failure 1'); }); } } }, function(error) {
 * console.log("The error " + error.message + " occurred when listing the files
 * in the selected folder"); alert('failure 2'); }); }, function(error) {
 * console.log('Failed to load files : ' + error.message); alert('failure 0'); },
 * 'rw'); }
 */
