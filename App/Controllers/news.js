let async = require('async'),
	moment = require('moment'),
	request = require('request'),
	logger = require('log4js').getLogger('News Controller');

let Controllers = getControllers();

class NewsController {
	constructor() {
		this.categories = {
			1: 'en',
			19: 'cn'
		};
		this.langs = Object.keys(this.categories).map(id => this.categories[id]);
		this.news = {};
		this.newsGetted = false;
		this.getNewsFromServer();
		this.getNews = this.getNews.bind(this);
	}
	
	getNewsFromServer() {
		async.eachOf(this.categories, (lang, catID, next) => {
			request(`https://qtum.org/wp-json/wp/v2/posts?categories[]=${catID}`, (error, response, body) => {
				if(error) {
					return logger.error('Error from blog server', error);
				}
				let news = JSON.parse(body);
				// logger.info(JSON.stringify(news, null, 2));
				async.map(news, (row, next) => {
					
					async.waterfall([
						cb => {
							if(!row['_links'] || !row['_links']['wp:featuredmedia'] || !row['_links']['wp:featuredmedia'].length) {
								return cb(null, null);
							}
							request(row['_links']['wp:featuredmedia'][0]['href'], (err, result, body) => {
								body = JSON.parse(body);
								if(body && body['source_url'])
									return cb(null, body['source_url']);
								return cb(null, null);
							});
						}
					], (err, image) => {
						next(null, {
							id: row.id,
							date: row.date,
							link: row.link,
							title: row.title.rendered,
							body: row.content.rendered,
							short: row.excerpt.rendered,
							image: image
						});
					});
				}, (err, result) => {
					this.news[lang] = result;
					next();
				});
			});
		}, () => {
			this.newsGetted = true;
			setTimeout(() => {
				this.getNewsFromServer();
			}, 5 * 60 * 1000);
		});
	}
	
	getNews(cb, data) {
		let lang = data._get.lang;
		if(this.langs.indexOf(lang) < 0)
			return cb(`Invalid language. Supported only ${this.langs.join(', ')} languages`);
		if(!this.newsGetted) {
			return setTimeout(() => this.getNews(cb, data), 100);
		}
		return cb(null, this.news[lang]);
	}
}

Controllers.news = new NewsController();