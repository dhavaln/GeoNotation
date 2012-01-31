var NotesApp = (function(){
	var App = {
		stores: {},
		views: {},
		collections: {}
	}

	// initialize local store
	App.stores.notes = new Store('notes');
	
	// Note Model
	var Note = Backbone.Model.extend({
		// Use localStorage datastore
		localStorage: App.stores.notes,
		
		initialize: function(){
			if(!this.get('title')){
				this.set({title: "Note @ " + Date() })
			};
			
			if(!this.get('body')){
				this.set({body: "No Content" })
			};
		},
	});
	
	// Collections
	var NoteList = Backbone.Collection.extend({
		model: Note,
		localStorage: App.stores.notes,
	
		initialize: function(){
			var collection = this;
			
			// listen for the update event to fetch new data
			this.localStorage.bind("update", function(){
				collection.fetch();
			});
		}
	});
	
	// Views
	//
	// Add New Note View
	var NewFormView = Backbone.View.extend({
		events: {
			"submit form": "createNote"
		},
		
		createNote: function(e){
			var attrs = this.getAttributes(),
				nt  = new Note();
			
			// set model values and save to localStorage
			nt.set(attrs);
			nt.save();
			
			// stop browser to submit the form
			e.preventDefault();
			
			// stop jquery mobile to do any other processing after submit
			e.stopPropagation();
			
			// close dialog
			$(".ui-dialog").dialog("close");
			this.reset();
		},
		
		getAttributes: function(){
			return {
				title: this.$("form [name=title]").val(),
				body: this.$("form [name=body]").val()
			}
		},
		
		reset: function(){
			this.$('input, textarea').val('');
		}
	});
	
	// Notes List
	var NoteListView = Backbone.View.extend({
		initialize: function(){
			console.log("initialize list view");
			// bind the current object with methods
			_.bindAll(this, 'addOne', 'addAll');
			
			this.collection.bind("add", this.addOne);
			this.collection.bind("reset", this.addAll);
			
			// load updated data
			this.collection.fetch();
		},
		
		addOne: function(note){
			console.log("add list item");
			var view = new NoteListItemView({model: note});
			
			$(this.el).append(view.render().el);
			
			if($.mobile){
				$(this.el).listview().listview("refresh");
			}
		}, 
		
		addAll: function(){
			console.log("add all list items");
			// empty the current view to avoid duplicates
			$(this.el).empty();
			
			// iterate the collection and create new node
			this.collection.each(this.addOne);
		},
	});
	
	// Note List View
	var NoteListItemView = Backbone.View.extend({
		tagName: "LI",
		template: _.template($("#note-list-item-template").html()),
		
		initialize: function(){
			// bind context with method
			_.bindAll(this, "render");
			
			this.model.bind("change", this.render);
		},
		
		render: function(){
			$(this.el).html(this.template({
				note: this.model 
			}));
			return this;
		}
	});
	
	// Note Detail List
	var NoteDetailList = Backbone.View.extend({
		el: $("body"),
		
		initialize: function(){
			// bind the current object with methods
			_.bindAll(this, 'addOne', 'addAll', "render");
			
			this.collection.bind("add", this.addOne);
			this.collection.bind("reset", this.addAll);
			
			// load updated data (loads collections again)
			this.collection.fetch();
		},
		
		addOne: function(note){
			var view = new NoteDetailView({model: note});
			$(this.el).append(view.render().el);
			
			if($.mobile){
				//$.mobile.initializePage();
			}
		},
		
		addAll: function(){
			// empty the current view to avoid duplicates
			$(this.el).find("[type=subpage]").remove();
			
			// iterate the collection and create new node
			this.collection.each(this.addOne);
		},
	});
	
	// Note Detail View
	var NoteDetailView = Backbone.View.extend({
		tagName: "DIV",
		
		template: _.template($("#note-detail-template").html()),
		
		initialize: function(){
			_.bindAll(this, "render");
			
			$(this.el).attr({
				'data-role': 'page',
				'id': "note_" + this.model.id,
				'type': 'subpage'
			});
			
			this.model.bind('change', this.render);
		},
		
		render: function(){
			$(this.el).html(this.template({note: this.model}));
			
			return this;
		}
	});
	
	window.Note = Note;
	
	App.collections.all_notes = new NoteList();
	
	window.all_notes = App.collections.all_notes;
	
	// Bind Views with Model and HTML Code
	App.views.new_form = new NewFormView({
		el: $("#new")
	});

	// Populate list
	App.views.list_alphabetical = new NoteListView({
		el: $("#all_notes"),
		collection: App.collections.all_notes
	});	
	
	// Generate Pages for each Note
	App.views.note_detail_list = new NoteDetailList({
		collection: App.collections.all_notes
	});
	
	return App;
})();

$(document).bind("mobileinit", function(){
  
});