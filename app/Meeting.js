const { json } = require('express');
const Datastore = require('nedb');

const db = {
    meetings: new Datastore('meetings.db')
};

db.meetings.loadDatabase();

class Meeting {
    add(req, res) {
        let data = req.body;
        data.likes = 0;

        db.meetings.insert(data);
        res.json({success: true});
    }

    get(req, res) {
        db.meetings.find({}, (err, data)=> {
            res.json(data);
        })
    }

    updateLikes(req, res) {
        db.meetings.find({_id: req.body.id}, (err, data)=> {
            const likes = data[0].likes + 1;
            db.meetings.update({_id: req.body.id}, { $set: { likes: likes} }, {}, (err, numReplaced)=> {
            });
        }); 

        

        res.end();
    }

    checkStatus() {
        db.meetings.find({}, (err, data)=> {
            for (let i = 0; i < data.length; i++) {
                const meeting = data[i];
                const d = new Date(Date.now());
                const day = d.getDate();
                const year = d.getFullYear();
                const month = d.getMonth() + 1;
                const hours = d.getHours();
                const minutes = d.getMinutes();


                const time = `${hours}:${minutes}`;
                const date = `${year}-${month}-${day}`;

                if(date >= meeting.date && time >= meeting.time ) {
                    db.meetings.remove({date: date});
                }
            }
        });
    }
}

module.exports = Meeting;