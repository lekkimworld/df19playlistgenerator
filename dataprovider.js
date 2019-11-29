const path = require('path')
const csv=require('csvtojson')
const moment = require('moment')

const DataProvider = function() {
    this._datapromise = new Promise((resolve, reject) => {
        const data = {}
        let activeDay
        csv({noheader:true, delimiter: ";"})
            .fromFile(path.join(__dirname, 'data', 'dreamforce2019.csv'))
        .on('csv', (csvRow) => {
            if (csvRow[0] && csvRow[0].substring(0, 3) === 'DAY') {
                activeDay = []
                data[csvRow[0]] = activeDay
                return
            }
            activeDay.push({
                'id': csvRow[5].substr(-11),
                'day': csvRow[0],
                'datetime': moment(`${csvRow[1]} ${csvRow[2].substring(0, csvRow[2].indexOf(" - "))}`, 'MM/DD/YYYY hh:mm aa').toDate(),
                'time': csvRow[2],
                'title': csvRow[3],
                'title_lowercase': csvRow[3].toLowerCase(),
                'url': {
                    'live': csvRow[4],
                    'youtube': csvRow[5]
                }
            })
        })
        .on('done',()=>{
            resolve(data)
        })
    })
}
DataProvider.prototype.getDay = function(no) {
    return this._datapromise.then(data => {
        let d = data['DAY' + no]
        if (d) return Promise.resolve(d)
        return Promise.reject(new Error('No such day'))
    })
}
DataProvider.prototype.getDays = function() {
    return this._datapromise.then(data => {
        return Promise.resolve(data)
    })
}
module.exports = DataProvider
