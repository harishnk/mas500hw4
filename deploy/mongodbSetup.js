
load('dbConfig.js')

for(env in dbConfig) {

	if(typeof dbConfig[env] === 'function') continue;
	print("ENV: " + env);

	var config = dbConfig[env];

	db = db.getMongo().getDB(config.db);
	print("Connected to '" + db + "' db");

	if(db.system.users.find({ 'user': config.user }).length() < 1) {

		print("Creating user '" + config.user + "'");
		db.addUser(config.user, config.password);

		if(!!db.getLastError()){
			print("db.getLastError(): " + db.getLastError());
		}
		
	} else {
		print("Already setup.");
	}
}