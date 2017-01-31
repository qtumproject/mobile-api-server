let logger = require('log4js').getLogger('Cron Controller'),
	moment = require('moment'),
	exec = require('exec'),
	config = require(ConfigPath),
	cron = require('node-cron');

class CronController {
	constructor() {
		cron.schedule('*/64 * * * * *', () => this.runABE());
	}
	
	runABE() {
		exec(`cd ${config.abePath}; python -m Abe.abe --config abe-my.conf --no-serve`, (err, out, code) => {
			if(err) return GlobalError('09:58', err);
			logger.info(out);
		});
	}
}
new CronController();