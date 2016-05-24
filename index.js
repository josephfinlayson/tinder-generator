var tinder = require('tinder');
var client = new tinder.TinderClient();

function run (genFn) {
    var gen = genFn();
    next();

    function next (er, value) {
        if (er) return gen.throw(er);
        var continuable = gen.next(value);

        if (continuable.done) return;
        var cbFn = continuable.value;
        cbFn(next)
    }
}

function thunkify (nodefn) { // [1]
    return function () { // [2]
        var args = Array.from(arguments)
        return function (cb) { // [3]
            args.push(cb)
            nodefn.apply(this, args)
        }
    }
}
const tinderAuth = thunkify(client.authorize);

const getRecs = thunkify(client.getRecommendations);
const like = thunkify(client.like);

function start () {
    run(function* () {

        try {
            const fbAuthToken = '';
            const fbUserId = ''

            yield tinderAuth(fbAuthToken, fbUserId);
            const data = yield getRecs(10)
            const ids = data.results.filter(person=> !person.common_friends.length).map((person)=> person._id);

            // getting liked data with a for loop
            for (var i = 0; i < ids.length; i++) {
                const likedData = yield like(ids[i]);
                if (likedData.match) {
                    client.sendMessage(ids[i], "testy mctesterson.")
                }
            }

            // However, I really want to do this using yield in a synchronous manner getting liked data with a map?
            // How would I do this synchronously using yield?

            //const likedData = ids.map(function *(id) {
            //    yield like(id)
            //})
            //
            //likedData.filter(like => like.match)
            //    .map(like => like._id)
            //    .forEach((id)=> {
            //        client.sendMessage(id, 'test')
            //    })

        } catch (e) {
            console.log(e);
        }
    })
}

const twentySeconds = 1000 * 20;
setInterval(start, twentySeconds);
