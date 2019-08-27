let express = require('express')
let app = express()
let crypto = require('crypto')

app.use(express.json())

let version = require('./package.json').version

let db = new require('pg').Pool({
	user: 'postgres',
	host: 'localhost',
	database: 'bujdit'
})

app.get('/api', (req, res) => {
	res.type('text/html')
	res.end('<h1>Cannot GET from API! Use POST you dingus.</h1>')
})

function check_and_get(data, field) {
	if (field in data) return data[field]
	else return null
}

function route_error(res, msg) {
	res.success = false
	res.message = msg
}

let routes = {
	
	// ================================================================
	// GENERAL COMMANDS
	// ================================================================
	
	// ----------------
	// PING
	// ----------------
	ping: (cmdi, req, res) => {
		res.success = true
		res.data = "pong"
		cmdi.done()
	},
	
	// ================================================================
	// ACCOUNT COMMANDS
	// ================================================================
	
	// ----------------
	// LOGIN
	// ----------------
	user_login: (cmdi, req, res) => {
		
		let username = check_and_get(req, 'username')
		let password = check_and_get(req, 'password')
		
		if (!username || !password) {
			route_error(res, 'username and password required')
			cmdi.done()
			return
		}
		
		db.query('SELECT id, salt, passhash FROM users WHERE LOWER(name) = LOWER($1)', [username], (err, q) => {
			
			if (q.rows.length != 1) {
				res.success = false
				res.message = 'invalid username'
				cmdi.done()
				return
			}
			
			let id = q.rows[0].id
			
			let hash = crypto.createHash('sha512')
			hash.update(password + q.rows[0].salt)
			let passhash = hash.digest('hex')
			
			if (passhash != q.rows[0].passhash) {
				res.success = false
				res.message = 'invalid password'
				cmdi.done()
				return
			}
			
			let token = crypto.randomBytes(32).toString('hex')
			
			db.query('INSERT INTO session (user_id, token) VALUES ($1, $2)', [id, token], (err, q) => {
				res.success = true
				res.token = token
				cmdi.done()
				return
			})
		})
	}
	
	// ================================================================
}

function process_commands(res, pers, req_data, res_data) {
	promises = []
	res_data.res = []
	
	for (let i = 0; i < req_data.cmds.length; i++) {
		res_data.res.push({})
		promises.push(new Promise((done, error) => {
			routes[req_data.cmds[i].cmd]({done: done, pers: pers}, req_data.cmds[i], res_data.res[i])
		}))
	}
	
	Promise.all(promises).then(() => {
		res_data.success = true
		res.json(res_data)
	})
}

app.post('/api', (req, res) => {
	
	let data = { version: version }
	reqd = req.body
	
	if (!('cmds' in reqd) || !Array.isArray(reqd.cmds)) {
		res.status(415)
		res.end()
	}
	
	if ('session' in reqd) {
		db.query('SELECT user_id, activity FROM session WHERE token = $1', [reqd.session], (err, q) => {
			if (q.rows.length != 1) { data.success = false; data.message = 'invalid session token'; res.json(data) }
			pers = {}
			pers.user_id = q.rows[0].user_id
			db.query('UPDATE session SET activity = NOW() WHERE token = $1', [reqd.session], (err, q) => {
				process_commands(res, pers, reqd, data)
			})
		})
	} else 
		process_commands(res, {}, reqd, data)
})

// Check and purge sessions every 30 seconds
/*
let session_max_age = 1800
setInterval(() => {
	db.query('DELETE FROM session WHERE activity < NOW() - $1::INTERVAL', [session_max_age + " SECONDS"]);
}, 30000)
*/

let server = app.listen(20304, () => {})
