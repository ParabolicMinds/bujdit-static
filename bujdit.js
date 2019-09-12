// ================================================================================================================================
// CONSTANTS
// ================================================================================================================================

const port = 20304

// ================================================================================================================================
// SETUP
// ================================================================================================================================

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

// ----------------
// DATABASE INTERFACE
// ----------------

async function db_query(sql, binds) {
	let con = await db.connect()
	try {
		return await con.query(sql, binds)
	} finally {
		con.release()
	}
}

async function db_transaction(cb) {
	let con = await db.connect()
	try {
		await con.query('BEGIN')
		try {
			await cb(con)
			con.query('COMMIT')
		} catch (e) {
			con.query('ROLLBACK')
			throw e
		}
	}	finally {
		con.release()
	}
}

let init_calls = []
function db_init_func(sql) {
	init_calls.push(sql.trim())
}

async function start_db_init() {
	await db_transaction(async (con) => {
		for (let i = 0; i < init_calls.length; i++) {
			try {
				await con.query(init_calls[i], [])
			} catch (e) {
				console.log('================================\nSQL ERROR: ' + e + '\n\n' + init_calls[i] + '\n================================')
				throw e
			}
		}
	})
}

// ----------------
// GENERAL
// ----------------

db_init_func(`
	CREATE TABLE IF NOT EXISTS users (
		id BIGSERIAL PRIMARY KEY,
		name VARCHAR(32) UNIQUE NOT NULL,
		salt INTEGER NOT NULL,
		passhash CHAR(128) NOT NULL,
		metadata JSON
	)`)
	
db_init_func(`
	CREATE TABLE IF NOT EXISTS session (
		user_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
		token CHAR(64) UNIQUE NOT NULL,
		activity timestamp NOT NULL DEFAULT NOW()
	)`)
	
// ----------------
// BUJDIT
// ----------------
	
db_init_func(`
	CREATE TABLE IF NOT EXISTS bujdit (
		id BIGSERIAL PRIMARY KEY,
		name VARCHAR(128) NOT NULL,
		meta JSON
	)`)
	
db_init_func(`
	CREATE TABLE IF NOT EXISTS bujdit_user (
		user_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
		bujdit_id BIGINT REFERENCES bujdit(id) ON DELETE CASCADE NOT NULL,
		UNIQUE(user_id, bujdit_id),
		permission SMALLINT NOT NULL DEFAULT 0,
		meta JSON
	)`)
	
// ----------------
// PAYROL
// ----------------

/*db_init_func(`
	CREATE TABLE IF NOT EXISTS payrol (
		id BIGSERIAL PRIMARY KEY,
		user_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
		employer VARCHAR(128) NOT NULL,
		meta JSON
	)`)*/
	
// ----------------
// SHNOPPING LIST
// ----------------
	
db_init_func(`
	CREATE TABLE IF NOT EXISTS shnopping (
		id BIGSERIAL PRIMARY KEY,
		name VARCHAR(128) NOT NULL,
		meta JSON
	)`)
	
db_init_func(`
	CREATE TABLE IF NOT EXISTS shnopping_user (
		user_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
		shnopping_id BIGINT REFERENCES shnopping(id) ON DELETE CASCADE NOT NULL,
		UNIQUE(user_id, shnopping_id),
		permission SMALLINT NOT NULL DEFAULT 0,
		meta JSON
	)`)

db_init_func(`
	CREATE TABLE IF NOT EXISTS shnopping_store (
		id BIGSERIAL PRIMARY KEY,
		shnopping_id BIGINT REFERENCES shnopping(id) ON DELETE CASCADE NOT NULL,
		name VARCHAR(128) NOT NULL
	)`)
	
db_init_func(`
	CREATE TABLE IF NOT EXISTS shnopping_item (
		id BIGSERIAL PRIMARY KEY,
		shnopping_id BIGINT REFERENCES shnopping(id) ON DELETE CASCADE NOT NULL,
		name VARCHAR(64) NOT NULL,
		variety VARCHAR(32),
		description TEXT
	)`)
	
db_init_func(`
	CREATE TABLE IF NOT EXISTS shnopping_option (
		id BIGSERIAL PRIMARY KEY,
		item_id BIGINT REFERENCES shnopping_item(id) ON DELETE CASCADE NOT NULL,
		store_id BIGINT REFERENCES shnopping_store(id) ON DELETE CASCADE NOT NULL,
		unit VARCHAR(16) NOT NULL DEFAULT 'count',
		quantity INTEGER NOT NULL DEFAULT 1
	)`)
	
db_init_func(`
	CREATE TABLE IF NOT EXISTS shnopping_entry (
		id BIGSERIAL PRIMARY KEY,
		shnopping_id BIGINT REFERENCES shnopping(id) ON DELETE CASCADE NOT NULL,
		option_id BIGINT REFERENCES shnopping_option(id) ON DELETE CASCADE NOT NULL,
		quantity INTEGER NOT NULL DEFAULT 1,
		status SMALLINT NOT NULL DEFAULT 0
	)`)
	
start_db_init()

// ================================================================================================================================
// COMMANDS
// ================================================================================================================================

let error_codes = {
	// GENERIC
	0: 'success',
	1: 'unknown',
	2: 'unrecognized command',
	3: 'invalid session token',
	4: 'authorization required',
	
	// ACCOUNT
	100: 'username and password required',
	101: 'invalid username',
	102: 'invalid password',
	
	// BUJDIT
	200: 'required field missing',
	201: 'bujdit not found or insufficient access',
	202: 'name required',
}

let commands = {
	
	// ================================================================
	// GENERAL COMMANDS
	// ================================================================
	
	// ----------------
	// PING
	// ----------------
	ping: async (cmdi, data, pers) => {
		cmdi.res.data = "pong"
		cmdi.success()
	},
	
	// ================================================================
	// ACCOUNT COMMANDS
	// ================================================================
	
	// ----------------
	// LOGIN
	// ----------------
	user_login: async (cmdi, data, pers) => {
		
		let username = cmdi.get_field('username')
		let password = cmdi.get_field('password')
		
		if (!username || !password) {
			cmdi.error(10)
			return
		}
		
		db.query('SELECT id, salt, passhash FROM users WHERE LOWER(name) = LOWER($1)', [username], (err, q) => {
			
			if (q.rows.length != 1) {
				cmdi.error(101)
				return
			}
			
			let id = q.rows[0].id
			
			let hash = crypto.createHash('sha512')
			hash.update(password + q.rows[0].salt)
			let passhash = hash.digest('hex')
			
			if (passhash != q.rows[0].passhash) {
				cmdi.error(102)
				return
			}
			
			let token = crypto.randomBytes(32).toString('hex')
			
			db.query('INSERT INTO session (user_id, token) VALUES ($1, $2)', [id, token], (err, q) => {
				data.token = token
				cmdi.success()
				return
			})
		})
	},
	
	// ================================================================
	// BUJDIT COMMANDS
	// ================================================================
	
	// ----------------
	// CREATE BUJDIT
	// ----------------
	bujdit_create: async (cmdi, data, pers) => {
		if (!pers.logged_in) cmdi.error(4)
		
		let name = cmdi.get_field('name')
		let meta = cmdi.get_field('meta')
		
		if (!name) {
			cmdi.error(202)
			return
		}
		
		let bujdit_sql = null
		let params = null
		if (meta === undefined) {
			bujdit_sql = 'INSERT INTO bujdit (name) VALUES ($1) RETURNING id'
			params = [name]
		} else {
			bujdit_sql = 'INSERT INTO bujdit (name, meta) VALUES ($1, $2) RETURNING id'
			params = [name, meta]
		}
		
		db_transaction(async (con) => {
			let q = await con.query(bujdit_sql, params)
			await con.query('INSERT INTO bujdit_user (user_id, bujdit_id, permission) VALUES ($1, $2, 4)', [pers.user_id, q.rows[0].id])
			cmdi.success()
		})
	},
	
	// ----------------
	// LIST BUJDITS
	// ----------------
	bujdit_list: async (cmdi, data, pers) => {
		if (!pers.logged_in) cmdi.error(4)
		
		let include_meta = cmdi.get_field('include_meta')
		
		db.query(`
		SELECT id, name, permission` + (include_meta ? ', bujdit.meta AS meta, bujdit_user.meta AS user_meta' : '') + `
		FROM bujdit 
		INNER JOIN bujdit_user ON bujdit.id = bujdit_id 
		WHERE user_id = $1 AND permission >= 1
		ORDER BY id ASC`, [pers.user_id], (err, q) => {
			data.bujdits = []
			for (let i = 0; i < q.rows.length; i++) {
				let row = q.rows[i]
				let buj = {}
				buj.id = parseInt(row.id)
				buj.name = row.name
				buj.permission = row.permission
				if (include_meta) {
					buj.meta = row.meta
					buj.user_meta = row.user_meta
				}
				data.bujdits.push(buj)
			}
			cmdi.success()
		})
	},
	
	// ----------------
	// DELETE BUJDIT
	// ----------------
	bujdit_delete: async (cmdi, data, pers) => {
		if (!pers.logged_in) cmdi.error(4)
		
		let id = cmdi.get_field('id')
		
		if (id === undefined) {
			cmdi.error(200)
			return
		}
		
		db.query(`
		SELECT id 
		FROM bujdit 
		INNER JOIN bujdit_user ON bujdit.id = bujdit_id 
		WHERE bujdit_id = $1 AND permission >= 4`, [id], (err, q) => {
			if (!q.rows.length) {
				cmdi.error(201)
				return
			}
			db.query('DELETE FROM bujdit WHERE id = $1', [id], (err, q) => {
				cmdi.success()
			})
		})
	},
	
	// ----------------
	// GET BUJDIT META
	// ----------------
	bujdit_meta_get: async (cmdi, data, pers) => {
		if (!pers.logged_in) cmdi.error(4)
		
		let id = cmdi.get_field('id')
		if (id === undefined) {
			cmdi.error(200)
			return
		}
		
		let field = cmdi.get_field('field')
		
		db.query(`
		SELECT id, bujdit.meta AS meta
		FROM bujdit 
		INNER JOIN bujdit_user ON bujdit.id = bujdit_id 
		WHERE user_id = $1 AND bujdit_id = $2 AND permission >= 1`, [pers.user_id, id], (err, q) => {
			if (!q.rows.length) {
				cmdi.error(201)
				return
			}
			data.meta = (field === undefined) ? q.rows[0].meta : q.rows[0].meta[field]
			cmdi.success()
		})
	},
	
	// ----------------
	// SET BUJDIT META
	// ----------------
	bujdit_meta_set: async (cmdi, data, pers) => {
		if (!pers.logged_in) cmdi.error(4)
		
		let id = cmdi.get_field('id')
		if (id === undefined) {
			cmdi.error(200)
			return
		}
		
		let field = cmdi.get_field('field')
		
		let meta = cmdi.get_field('meta')
		if (meta === undefined) {
			cmdi.error(200)
			return
		}
		
		db.query(`
		SELECT id, bujdit.meta AS meta
		FROM bujdit 
		INNER JOIN bujdit_user ON bujdit.id = bujdit_id 
		WHERE bujdit_id = $1 AND permission >= 2`, [id], (err, q) => {
			if (!q.rows.length) {
				cmdi.error(201)
				return
			}
			
			let jdat = undefined
			if (field !== undefined) {
				jdat = q.rows[0].meta || {}
				jdat[field] = (meta == null) ? undefined : meta
			} else {
				jdat = meta
			}
			
			db.query(`
			UPDATE bujdit
			SET meta = $2
			WHERE id = $1`, [id, jdat], (err, q) => {
				cmdi.success()
			})
		})
	},
	
	// ================================================================
	// BUJDIT-USER COMMANDS
	// ================================================================
	
	// ----------------
	// GET BUJDI-USER META
	// ----------------
	bujdit_user_meta_get: async (cmdi, data, pers) => {
		if (!pers.logged_in) cmdi.error(4)
		
		let id = cmdi.get_field('id')
		if (id === undefined) {
			cmdi.error(200)
			return
		}
		
		let field = cmdi.get_field('field')
		
		db.query(`
		SELECT bujdit_user.meta AS meta
		FROM bujdit_user 
		WHERE user_id = $1 AND bujdit_id = $2`, [pers.user_id, id], (err, q) => {
			if (!q.rows.length) {
				cmdi.error(201)
				return
			}
			data.meta = (field === undefined) ? q.rows[0].meta : q.rows[0].meta[field]
			cmdi.success()
		})
	},
	
	// ----------------
	// SET BUJDIT-USER META
	// ----------------
	bujdit_user_meta_set: async (cmdi, data, pers) => {
		if (!pers.logged_in) cmdi.error(4)
		
		let id = cmdi.get_field('id')
		if (id === undefined) {
			cmdi.error(200)
			return
		}
		
		let meta = cmdi.get_field('meta')
		if (meta === undefined) {
			cmdi.error(200)
			return
		}
		
		let field = cmdi.get_field('field')
		
		if (field === undefined) {
			db.query(`
			UPDATE bujdit_user
			SET meta = $3
			WHERE user_id = $1 AND bujdit_id = $2`, [pers.user_id, id, meta], (err, q) => {
				cmdi.success()
			})
		} else {
			db.query(`
			SELECT bujdit_user.meta AS meta
			FROM bujdit_user 
			WHERE user_id = $1 AND bujdit_id = $2`, [pers.user_id, id], (err, q) => {
				if (!q.rows.length) {
					cmdi.error(201)
					return
				}
				let jdat = q.rows[0].meta || {}
				jdat[field] = (meta == null) ? undefined : meta
				db.query(`
				UPDATE bujdit_user
				SET meta = $3
				WHERE user_id = $1 AND bujdit_id = $2`, [pers.user_id, id, jdat], (err, q) => {
					cmdi.success()
				})
			})
		}
	},
	
	// ================================================================
	// PAYROL COMMANDS
	// ================================================================
	
	
	
	// ================================================================
}

// ================================================================================================================================
// COMMAND PROCESSING
// ================================================================================================================================

function set_error(data, code, debug = false) {
	data.success = code === 0
	data.code = code
	if (debug) {
		if (code in error_codes) data.msg = error_codes[code]
		else data.message = 'unknown error code'
	}
}

async function process_commands(res, pers, req_data, res_data) {
	
	res_data.res = []
	
	if (!('cmds' in reqd) || !Array.isArray(reqd.cmds)) {
		set_error(res_data, 0, pers.debug)
		res.json(res_data)
		return
	}
	
	promises = []
	
	if (pers.logged_in) {
		res_data.user_info = {
			logged_in: true,
			username: pers.username,
			user_id: pers.user_id
		}
	} else {
		res_data.user_info = {
			logged_in: false
		}
	}
	
	for (let i = 0; i < req_data.cmds.length; i++) {
		let dat = {}
		res_data.res.push(dat)
		if (req_data.cmds[i].cmd in commands) {
			promises.push(new Promise((done, error) => {
				commands[req_data.cmds[i].cmd]({
					error: (code) => {
						set_error(res_data.res[i], code, pers.debug)
						done()
					},
					success: () => {
						set_error(res_data.res[i], 0, pers.debug)
						done()
					},
					get_field: (field) => {
						if (field in req_data.cmds[i]) return req_data.cmds[i][field]
						else return undefined
					},
					req: req_data.cmds[i],
				}, res_data.res[i], pers)
			}))
		} else {
			set_error(dat, 2, pers.debug)
		}
	}
	
	Promise.all(promises).then(() => {
		set_error(res_data, 0, pers.debug)
		res.json(res_data)
		return
	})
}

// ================================================================================================================================
// MAINTENANCE
// ================================================================================================================================

// Check and purge sessions every 30 seconds
let session_max_age = 1800
setInterval(() => {
	db.query('DELETE FROM session WHERE activity < NOW() - $1::INTERVAL', [session_max_age + " SECONDS"]);
}, 30000)

// ================================================================================================================================
// MAIN EXECUTION
// ================================================================================================================================

async function handle_post(req, res) {
	let data = { version: version }
	try {
		reqd = req.body
		
		if (!('debug' in reqd))
			reqd.debug = false
		
		let pers = { logged_in: false, debug: reqd.debug }
		
		if ('session' in reqd) {
			let q = await db_query('SELECT user_id, users.name, activity FROM session INNER JOIN users ON user_id = users.id WHERE token = $1', [reqd.session])
				
			if (q.rows.length != 1) {
				set_error(data, 3, pers.debug)
				res.json(data)
				return
			}
			
			pers.user_id = parseInt(q.rows[0].user_id)
			pers.username = q.rows[0].name
			pers.logged_in = true
			
			await db_query('UPDATE session SET activity = NOW() WHERE token = $1', [reqd.session])
			await process_commands(res, pers, reqd, data)
		} else 
			await process_commands(res, {}, reqd, data)
	} catch (e) {
		console.log(e)
		set_error(data, 1, false)
		res.json(data)
	}
}

app.post('/api', (req, res) => {
	handle_post(req, res)
})

let server = app.listen(port, () => {})

// ================================================================================================================================
