class Vgy_Image_Upload {

	static init(){
		this.PLUGIN_ID = "pd_vgyme_image_upload";
		this.route = pb.data("route");
		this.image = "";
		this.add_quick_reply_button = true;
		this.wysiwyg = null;
		this.has_quick_reply = pb.data("quick_reply");
		this.quick_reply = null;
		this.upload_url = "https://vgy.me/upload";
		this.file_upload_elem = null;

		this.setup();

		$(this.ready.bind(this));
	}

	static ready(){
		let posting_location_check = (

			this.route.name == "quote_posts" ||
			this.route.name == "new_post" ||
			this.route.name == "new_thread" ||
			this.route.name == "edit_post" ||
			this.route.name == "edit_thread"

		);

		if(posting_location_check){
			$(document).on("wysiwygcreate", evt => {

				this.wysiwyg = $(evt.target).data("wysiwyg");
				this.create_button();

			});
		} else if(this.add_quick_reply_button && this.has_quick_reply){
			this.create_button();
		}
	}

	static create_button(){
		let $elem = null;
		let $controls = null;
		let $ul = null;

		if(this.wysiwyg){
			$elem = $("<li></li>");

			$controls = $(".editor .ui-wysiwyg .controls");
			$ul = $controls.find(".bbcode-editor, .visual-editor").find(".group:last ul:last");
		} else {
			$elem = $("<a></a>)").append("Add Image").addClass("vgy-quick-reply-button");

			this.quick_reply = $controls = $ul = $(".form_post_quick_reply");
		}

		$elem.append("<img class='vgy-upload-image-button' src='" + this.image + "' />");
		$elem.attr("title", "Upload Image");
		$elem.addClass("vgy-upload-button button");

		$elem.on("click", this.display_file_browser.bind(this));

		if($controls && $ul){
			$ul.append($elem);
		}
	}

	static display_file_browser(){
		if(!this.file_upload_elem){
			this.file_upload_elem = $("<input type='file' id='vgy-file-upload' name='vgy-file-upload' />");

			this.file_upload_elem.on("change", this.upload_file.bind(this));

			$("body").append(this.file_upload_elem);
		}

		this.file_upload_elem.trigger("click");
	}

	static upload_file(){
		if(!this.file_upload_elem){
			return;
		}

		let file = $("#vgy-file-upload")[0].files[0];

		if(!file){
			return;
		}

		let data = new FormData();

		data.append("file", file);

		$(".vgy-upload-image-button").addClass("vgy-upload-uploading");

		fetch(this.upload_url, {

			method: "POST",
			body: data

		}).then(response => {

			return response.json();

		}).then(response => {

			this.insert_image(response.image);
			$(".vgy-upload-image-button").removeClass("vgy-upload-uploading");

		});
	}

	static insert_image(img){
		let content = null;
		let replacement = "[img]" + img + "[/img]";;

		if(this.has_quick_reply && this.quick_reply){
			content = this.quick_reply.find("textarea[name=\"message\"]");
		} else if(this.wysiwyg){
			if(this.wysiwyg.currentEditorName == "visual"){
				content = this.wysiwyg.editors["visual"];
				replacement = $("<img src='" + img + "' />", this.wysiwyg.editors["visual"].document)[0];
			} else {
				content = this.wysiwyg.editors["bbcode"];
			}
		}

		if(content){
			content.replaceSelection(replacement);
		}
	}

	static setup(){
		let plugin = pb.plugin.get(this.PLUGIN_ID);

		if(plugin && plugin.settings){
			this.image = plugin.images.upload;
		}
	}

}

Vgy_Image_Upload.init();