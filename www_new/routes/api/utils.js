module.exports.blockedIPs = {};
module.exports.trackers = {};
module.exports.isIPBlocked = function(ip) {
    if (module.exports.blockedIPs.hasOwnProperty(ip)) {
        if (new Date() < module.exports.blockedIPs[ip].date)
            return true;
        else
            delete module.exports.blockedIPs[ip];
    }

    return false;
};

module.exports.trackAttempt = function(trackingType, ip, maxPerDay, maxPerMinute, blockDuration) {
    if (!module.exports.trackers[trackingType])
        module.exports.trackers[trackingType] = {};

    if (!module.exports.trackers[trackingType][ip])
        module.exports.trackers[trackingType][ip] = [new Date()];
    else
        module.exports.trackers[trackingType][ip].push(new Date());

    let attemptsPerMinute = 0;
    let attemptsPerDay = 0;
    let now = new Date();
    for (let i = 0; i < module.exports.trackers[trackingType][ip].length; ++i) {
        if ((now - module.exports.trackers[trackingType][ip][i]) < 1000*60*60*24) {
            attemptsPerDay++;
            if ((now - module.exports.trackers[trackingType][ip][i]) < 1000*60*5) {
                attemptsPerMinute++;
            }
        }
        else {
            module.exports.trackers[trackingType][ip].splice(i, 1);
            i--;
        }

        if (attemptsPerDay >= maxPerDay ||
            attemptsPerMinute >= maxPerMinute) {
            let date = new Date();
            date.setSeconds(date.getSeconds() + blockDuration);
            module.exports.blockedIPs[ip] = date;
            return;
        }
    }
}
