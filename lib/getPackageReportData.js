var semver = require('semver')
var util = require('util')
var _ = require('lodash')
var getPackageJson = require('./getPackageJson.js')
var extractLink = require('./extractLink.js')
var extractLicense = require('./extractLicense.js')

module.exports = getPackageReportData

/*
	collect the data for a single package
*/
function getPackageReportData(packageEntry, callback) {

	if (typeof callback !== 'function') {
		throw new Error('missing callback argument')
	}
	
	var localVersion = semver.validRange(packageEntry.version)

	if (!localVersion) {
		var message = util.format('skipping %s (invalid semversion)', toPackageString(packageEntry))
		
		//**
		return callback(null, { name: packageEntry.fullName, comment: message })
	}

	var fullPackageName = packageEntry.fullName

	getPackageJson(fullPackageName, function(err, json) {
		if (err) return callback(err)

		// dont think it is possible but just to make sure.
		if (!json.versions) {
			return callback(new Error('no versions in registry for package ' + fullPackageName))
		}

		// find the right version for this package
		var versions = _.keys(json.versions)

		var version = semver.maxSatisfying(versions, localVersion)

		if (!version) {
			return callback(new Error('cannot find a version that satisfies range ' + localVersion + ' in the registry'))
		}

		var versionData = json.versions[version]

		callback(null, { 
			name: fullPackageName,
			licenseType: extractLicense(versionData),
			link: extractLink(versionData),
			comment: version.toString()
		})
	})
}

function toPackageString(entry) {
	return entry.fullName + '@' + entry.version
}