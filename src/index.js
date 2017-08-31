import Vue from 'vue';
import fetch from 'isomorphic-fetch';
import _ from 'underscore';

// ContentsのObjectの配列
let aryContObj = [];

// Requestデータ
const REQUEST = {
	GET: {
		URL: "http://localhost:8080",
		OPTION: { method: "GET" }
	},
	POST: {
		URL: "http://localhost:8080",
		OPTION:{
			method: "POST",
			mode: "cors",
			headers: {
				"Content-Type": "application/json"
			},
			body: ""
		}
	}
};

let textbox = new Vue({
	el: "#textbox",
	data: {
		items: [],
		copies: []
	},
	// 改行コード(\n)をHTMLの改行コード(<br>)に置換
	methods: {
		replace: function(index_) {
			return this.copies[index_].replace(/\r?\n/g, "<br>")
		}
	}
});

let send = new Vue({
	el: "#send",
	methods: {
		post: () => {
			changeJson(aryContObj, textbox);
			reqContServ(REQUEST["POST"], JSON.stringify(aryContObj, undefined, 2))
				.then(data_ => {
					pushJson(data_);
				})
				.catch(err_ => {
					console.error(err_);
				});
		}
	}
});

function pushJson(data_){
	// jsonを代入
	aryContObj = data_;
	_.each(data_, json_ => {
		if (isDefined(json_.title)) {
			textbox.items.push(json_.title);
			textbox.items.push(json_.sub);
			// itemsと変更を同期させないために直接代入しない
			textbox.copies.push(json_.title);
			textbox.copies.push(json_.sub);
		}
		_.each(json_.contents, ary_ => {
			textbox.items.push(ary_);
			textbox.copies.push(ary_);
		});
	});
}

function isDefined(val_) {
	return val_ != undefined;
}

function changeJson(data_, cont_) {
	// JSONに形を整形する
	// 全要素のカウント．
	let _num = 0;
	data_ = _.each(data_, obj_ => {
		if (isDefined(obj_.title)) {
			obj_.title = cont_.items[_num++];
			obj_.sub = cont_.items[_num++];
		}
		obj_.contents = _.map(obj_.contents, () => {
			return cont_.items[_num++];
		});
	});
}

/*
	タイトル: GET_API
	日付: 2017/08/24
	制作者: まつけん
	@param void(内容)
	@return void(内容)
	更新日: 
	更新者: 
*/
function reqContServ(REQ_, BODY_ = "") {
	return new Promise((resolve_, rej_) => {
		if (REQ_.OPTION.method == "POST"){
			REQ_.OPTION.body = BODY_;
		}
		fetch(REQ_.URL, REQ_.OPTION)
			.then(res_ => {
				if (res_.status >= 400) {
					rej_("Bad response from server");
				}
				// Refresh items.
				textbox.items = [];
				textbox.copies = [];

				res_.json()
					.then(data_ => {
						resolve_(data_);
				});
			});
	});
}

// Initialize
reqContServ(REQUEST["GET"], "")
	.then(data_ => {
		pushJson(data_);
	})
	.catch(err_ => {
		console.error(err_);
	});
