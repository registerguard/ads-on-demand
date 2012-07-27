/*
 * HTML Parser By Noah Sloan (http://noahsloan.com)
 * Supports parsing HTML in incomplete fragments.
 *
 * Modified from:
 * HTML Parser By John Resig (http://ejohn.org/files/htmlparser.js)
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 *
 * // Use like so:
 * var parser = HTMLParser({
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 * parser.parseMore(html);
 * parser.parseMore(html);
 * parser.end();
 *
 * You can write directly to an element with WriteToElement:
 * var writer = elementWrite.toElement(element);
 * writer.write(html);
 * writer.writeln(html);
 * writer.close(); // important
 *
 * toElement takes an optional 2nd argument: listeners.
 *
 * listeners is just like the handlers object passed to HTMLParser, but
 * with a few additions:
 * 1. If the handler function returns false, then no action is taken (the handler
 *	 is assumed to have handled the event).
 * 2. The last argument is a state object. The stack property is the current
 * element stack. last() is the current parent element. push() and pop() will
 * push and pop the current parent element, which affects where content is created.
 * 3. There is a close() listener that will be called when the writer is closed.
 *
 * See the listeners qunit test for an example.
 */

(function(define){

	// Regular Expressions for parsing tags and attributes
	var startTag = /^<([\-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
		endTag = /^<\/([\-A-Za-z0-9_]+)[^>]*>/,
		attr = /([\-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

	// Empty Elements - HTML 4.01
	var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

	// Block Elements - HTML 4.01
	var block = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");

	// Inline Elements - HTML 4.01
	var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

	// Elements that you can, intentionally, leave open
	// (and which close themselves)
	var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

	// Attributes that have their values filled in disabled="disabled"
	var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

	// Special Elements (can contain anything)
	var special = makeMap("script,style");

	function HTMLParser( handler ) {
		var index, chars, match, stack = [], last = '',
			waitingForSpecialBody;
		stack.last = function(){
			return this[ this.length - 1 ];
		};

		function processSpecial(all, text){
			text = text.replace(/<!--([\s\S]*?)-->/g, "$1")
				.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");

			if ( handler.chars )
				handler.chars( text );

			return "";
		}

		function parseMore(html) {
			html = last + html;
			last = html;

			if(module.debug.parse) console.log('PARSE parseMore',html);
			while ( html ) {

				chars = true;

				// Make sure we're not in a script or style element
				if ( waitingForSpecialBody || (stack.last() && special[ stack.last() ]) ) {

					waitingForSpecialBody = false;
					var specialBody = new RegExp("([\\s\\S]*?)<\/" + stack.last() + "[^>]*>");
					if(!html.match(specialBody)) {
						waitingForSpecialBody = true;
						return self;
					}
					html = html.replace(specialBody, processSpecial);

					parseEndTag( "", stack.last() );
				} else {

					// Comment
					if ( html.indexOf("<!--") === 0 ) {
						index = html.indexOf("-->");

						if ( index >= 0 ) {
							if(module.debug.parse) console.log('PARSE comment',match);
							if ( handler.comment )
								handler.comment( html.substring( 4, index ) );
							html = html.substring( index + 3 );
							chars = false;
						}

					// end tag
					} else if ( html.indexOf("</") === 0 ) {
						match = html.match( endTag );

						if ( match ) {
							if(module.debug.parse) console.log('PARSE end tag',match);
							html = html.substring( match[0].length );
							match[0].replace( endTag, parseEndTag );
							chars = false;
						}

					// start tag
					} else if ( html.indexOf("<") === 0 ) {
						match = html.match( startTag );

						if ( match ) {
							if(module.debug.parse) console.log('PARSE start tag',match);
							html = html.substring( match[0].length );
							match[0].replace( startTag, parseStartTag );
							chars = false;
						}
					}

					if ( chars ) {
						index = html.indexOf("<");

						var text = index < 0 ? html : html.substring( 0, index );
						html = index < 0 ? "" : html.substring( index );
						if(module.debug.parse) console.log('PARSE chars',text);

						if ( handler.chars )
							handler.chars( text );
					}
				}

				var done = html == last;
				last = html;
				if (done) break;
			}
			if(module.debug.parse) console.log('PARSE end parse');
			return self;
		}

		function parseStartTag( tag, tagName, rest, unary ) {
			tagName = tagName.toLowerCase();

			if ( block[ tagName ] ) {
				while ( stack.last() && inline[ stack.last() ] ) {
					parseEndTag( "", stack.last() );
				}
			}

			if ( closeSelf[ tagName ] && stack.last() == tagName ) {
				parseEndTag( "", tagName );
			}

			unary = empty[ tagName ] || !!unary;

			if ( !unary )
				stack.push( tagName );

			if ( handler.start ) {
				var attrs = [];

				rest.replace(attr, function(match, name) {
					var value = arguments[2] ? arguments[2] :
						arguments[3] ? arguments[3] :
						arguments[4] ? arguments[4] :
						fillAttrs[name] ? name : "";

					attrs.push({
						name: name,
						value: value,
						escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
					});
				});

				if ( handler.start )
					handler.start( tagName, attrs, unary );
			}
		}

		function parseEndTag( tag, tagName ) {
			if(module.debug.parse) console.log('PARSE parseEndTag',tag,tagName);
			var pos;
			// If no tag name is provided, clean shop
			if ( !tagName )
				pos = 0;

			// Find the closest opened tag of the same type
			else
				for ( pos = stack.length - 1; pos >= 0; pos-- )
					if ( stack[ pos ] == tagName )
						break;

			if ( pos >= 0 ) {
				// Close all the open elements, up the stack
				for ( var i = stack.length - 1; i >= pos; i-- )
					if ( handler.end )
						handler.end( stack[ i ] );

				if(module.debug.parse) console.log('PARSE parseEndTag pop',stack.slice(pos));
				// Remove the open elements from the stack
				stack.length = pos;
			}
		}

		function end(html) {
			if(html) {
				parseMore(html);
			}
			// Clean up any remaining tags
			parseEndTag();
		}

		var self = {
			parseMore: parseMore,
			end: end
		};

		return self;
	}

	function toElement( element, listeners ) {
		listeners = listeners || {};
		var curParentNode = element;

		var elems = [curParentNode],
			doc = element.ownerDocument ||
				element.getOwnerDocument && element.getOwnerDocument();

		elems.last = function() {
			return this[ this.length - 1 ];
		};

		elems.pop = function() {
			var el = Array.prototype.pop.call(this);
			curParentNode = this.last();
			return el;
		};

		elems.push = function(el) {
			Array.prototype.push.call(this,el);
			curParentNode = el;
		};

		function listen(event) {
			if(listeners[event]) {
				return listeners[event].apply(listeners,slice(arguments,1).concat([state()]));
			}
		}

		function state() {
			return {
				stack: elems
			};
		}

		var handlers, parser = HTMLParser(handlers = {
			start: function( tagName, attrs, unary ) {
				if(listen('start',tagName,attrs,unary) === false) return;

				if(module.debug.write) console.log('WRITE start',tagName,attrs,unary);
				var elem = doc.createElement( tagName );

				for ( var attr in attrs )
					elem.setAttribute( attrs[ attr ].name, attrs[ attr ].value );

				if ( curParentNode && curParentNode.appendChild ) {
					curParentNode.appendChild( elem );
					if(module.debug.write) console.log('WRITE start append',elem,'to',curParentNode);
				}

				if ( !unary ) {
					if(module.debug.write) console.log('WRITE push',elem,elems.slice(0));
					elems.push( elem );
				}
				if(module.debug.write) console.log('WRITE start done - parent:',curParentNode);
			},
			end: function( tag ) {
				if(listen('end',tag) === false) return;
				elems.pop();
				if(module.debug.write) console.log('WRITE end',tag,'new parent:',curParentNode,'elems',elems);
			},
			chars: function( text ) {
				if(listen('chars',text) === false) return;
				if(module.debug.write) console.log('WRITE chars',text,'el:',element);
				curParentNode.appendChild( doc.createTextNode( text ) );
			},
			comment: function( text ) {
				if(listen('comment',text) === false) return;
				// create comment node
			},
			close: function() {
				if(listen('close') === false) return;
				if(module.debug.write) console.log('WRITE close el:',element);
			},
			_handle: function(event) {
				listen.apply(this,arguments);
			}
		});

		return listeners.writer = {
			/**
			 * Hook for calling custom listener methods.
			 *
			 * e.g., defining pause & resume methods.
			 */
			handle: function(event,args) {
				if(handlers[event]) {
					handlers[event].apply(handlers,args || []);
				} else {
					handlers._handle.apply(handlers,arguments);
				}
			},
			write: function(html) {
				parser.parseMore(html);
				return this;
			},
			writeln: function(html) {
				this.write(html+'\n');
				return this;
			},
			close: function(html) {
				parser.end(html);
				handlers.close();
				return this;
			}
		};
	}

	function makeMap(str){
		var obj = {}, items = str.split(",");
		for ( var i = 0; i < items.length; i++ )
			obj[ items[i] ] = true;
		return obj;
	}

	function slice(args,index) {
		return Array.prototype.slice.call(args,index);
	}

	var module = {
		toElement: toElement,
		HTMLParser: HTMLParser,
		debug: {
			parse: false,
			write: false
		}
	};

	define(module);
})(typeof define == 'function' ? define : function(ew) {
	if (typeof exports === 'object') {
		module.exports = ew;
	} else {
		this.elementWrite = ew;
	}
});

/**
 * Totaly rewritten writeCapture, based on element.write.
 *
 * Usage:
 *
 * 	writeCapture(targetElement).
 * 		write(someHtml).
 * 		close(); // must be sure to close()
 *
 * Script tags in anything written will automatically be captured, such
 * that document.write is redirected into the element.
 */
(function(define){

	var console = this.console || {log:function(){}};

	// feature test for how we create script tags
	var scriptEval = (function() {
		var script = document.createElement("script");
		var id = "script" + (new Date).getTime();
		var root = document.documentElement;

		script.type = "text/javascript";
		try {
			script.appendChild( document.createTextNode( "window." + id + "=1;" ) );
		} catch(e){}

		root.insertBefore( script, root.firstChild );

		// Make sure that the execution of code works by injecting a script
		// tag with appendChild/createTextNode
		// (IE doesn't support this, fails, and uses .text instead)
		if ( window[ id ] ) {
			delete window[ id ];
			return true;
		}
		return false;
	})();

	// will be set by define()
	var elementWrite;

	/**
	 * This is the public one. Creates a writer for element.
	 * onDone is called when all writing finishes.
	 *
	 * Depends on elementWrite, which gets set by the define call
	 * at the end.
	 */
	function writerFor(element,onDone) {
		var writer, capturing, script;

		onDone = onDone || function() {};

		// add a set of listeners that will handle script tags and
		// capture document.write
		writer = elementWrite.toElement(element,pausable({
			start: function(tag,attrs,unary,state) {
				if(tag.toLowerCase() === 'script') {
					console.log('WC element:',element,
						'start script. attrs:',attrs,this.id);
					script = '';
					capturing = attrs || {};
					return false;
				}
			},
			chars: function(text,state) {
				if(capturing) {
					console.log('WC element:',element,'chars:',text,this.id);
					script += text;
					return false;
				}
			},
			end: function(tag,state) {
				if(capturing) {
					var attrs = capturing;
					capturing = false;
					captureScript(script,attrs,state.stack.last(),writer);
					return false;
				}
			},
			comment: function(text,state) {
				return false;
			},
			// special pausable handler - fires when queue is exhausted
			done: onDone
		}));

		return writer;
	}

	/**
	 * Creates a script tag from script (the code) & attrs and appends
	 * it to parent. The writer is paused while the script loads and
	 * runs, then resumed after it has finished.
	 */
	function captureScript(script,attrs,parent,writer) {
		// Create a new writer for the script to use so we
		// can pause the current writer.
		var newWriter = writerFor(parent,doResume), restore;

		console.log('WC captureScript attrs:',attrs,'body:',script,
			'in parent:',parent);

		// if the script is in fact an inline script, it should
		// finish before any other writer actions queue, so it will
		// be like we never paused
		writer.handle('pause');

		// We have to let any current script finish (and queue up writes)
		// before we can redirect and run the next script.
		// This could be a problem for scripts that expect the new script
		// tag to block script execution (impossible for us)
		setTimeout(function() {
			restore = redirect(getDoc(parent),newWriter);
			// when the script has loaded, queue up the close/done
			// (script may have paused its writer)
			exec(script,attrs,parent,function() {
				newWriter.close();
			});
		},25);

		// when the writter is closed and fully written out,
		// restore doc.write and resume writing from this
		// writer's queue
		function doResume() {
			restore();
			writer.handle('resume');
		}
	}

	/**
	 * Executes scripts by creating a script tag and inserting it into
	 * parent.
	 * @param script the script body (code).
	 * @param attrs the script attributes. May include src.
	 * @param parent the element to append the script to.
	 * @param cb optional callback to call when script is loaded.
	 */
	function exec(script,attrs,parent,cb) {
		var doc = getDoc(parent),
			el = doc.createElement('script'),
			name, value;
		for ( var attr in attrs ) {
			name = attrs[attr].name;
			value = attrs[attr].value;

			if(writerFor.fixUrls && name === 'src') {
				value = writerFor.fixUrls(value);
			}
			el.setAttribute( name, value );
		}

		if(script) {
			if ( scriptEval ) {
				el.appendChild( doc.createTextNode( script ) );
			} else {
				el.text = script;
			}
		}

		if(cb && el.src) {
			el.onload = el.onreadystatechange = function( _, isAbort ) {

				if ( isAbort || !el.readyState || /loaded|complete/.test( el.readyState ) ) {

					// Handle memory leak in IE
					el.onload = el.onreadystatechange = null;

					// Dereference the script
					el = undefined;

					// Callback if not abort
					if ( !isAbort ) {
						cb();
					}
				}
			};
		}

		parent.appendChild(el);
		// if it was an inline script, it's done now
		if(cb && !el.src) {
			cb();
		}
	}

	/**
	 * Redirects the document's document.write/writeln
	 * to writer.
	 *
	 * @return a function to restore the original functions.
	 */
	function redirect(document,writer) {
		var original = {
			write: document.write,
			writeln: document.writeln
		};
		document.write = function(s) {
			// if the writer is paused, this queues the write
			writer.handle('write',[s]);
		};
		document.writeln = function(s) {
			document.write(s+'\n');
		};

		return function() {
			document.write = original.write;
			document.writeln = original.writeln;
		};
	}

	var ids = 0;
	// adds pause and resume methods to listeners and returns a new set of
	// listeners that will queue their events when paused
	function pausable(listeners) {
		var queue = [], paused, id = ids++;
		return {
			pause: function() {
				console.log('WC PAUSE',id);
				paused = true;
			},
			resume: function() {
				console.log('WC RESUME',id,queue.slice(0));
				paused = false;
				while(!paused && queue.length) {
					var next = queue.shift();
					this.writer.handle(next[0],next[1]);
				}
			},
			start: function(tag,attrs,unary,state) {
				console.log('WC start',paused,'args',tag,attrs,unary,state,id);
				if(paused) {
					queue.push(['start',[tag,attrs,unary]]);
					return false;
				} else {
					return listeners.start(tag,attrs,unary,state);
				}
			},
			chars: function(text,state) {
				console.log('WC chars',paused,'args',text,state,id);
				if(paused) {
					queue.push(['chars',[text]]);
					return false;
				} else {
					return listeners.chars(text,state);
				}
			},
			end: function(tag,state) {
				console.log('WC end',paused,'args',tag,state,id);
				if(paused) {
					queue.push(['end',[tag]]);
					return false;
				} else {
					return listeners.end(tag,state);
				}
			},
			comment: function(text,state) {
				if(paused) {
					queue.push(['comment',[text]]);
					return false;
				} else {
					return listeners.comment(text,state);
				}
			},
			write: function(s) {
				console.log('WC queue.write',paused,id);
				if(paused) {
					queue.push(['write',[s]]);
					return false;
				} else {
					this.writer.write(s);
					return false;
				}
			},
			close: function() {
				console.log('WC close',paused,id);
				if(paused) {
					queue.push(['close',[]]);
					return false;
				} else if(listeners.done) {
					return listeners.done();
				}
			}
		};
	}

	function getDoc(element) {
		return element.ownerDocument ||
			element.getOwnerDocument && element.getOwnerDocument();
	}

	function object(obj) {
		function F() {}
		F.prototype = obj;
		return new F;
	}


	// export writerFor
	define(['element.write'],function(elWrite) {
		elementWrite = writerFor.elementWrite = elWrite;
		writerFor.fixUrls = function(src) {
		    return src.replace(/&amp;/g,'&');
		};
		return writerFor;
	});
})(typeof define == 'function' ? define : function(deps,factory) {
	if (typeof exports === 'object') {
		module.exports = factory(require(deps[0]));
	} else {
		this.writeCapture = factory(this.elementWrite);
	}
});

/**
 * onMediaQuery
 *
 * @docs      https://github.com/JoshBarr/js-media-queries
 * @copyright Copyright (c) 2012 Springload.
 * @license   Released under the MIT license.
 *            http://www.opensource.org/licenses/mit-license.php
 * @version   0.1.0
 * @date      Sun 26 July, 2012
 */

var MQ = (function(mq) {
	
	mq = mq || {}; // Assign mq to mq or an empty object.
	
	//--------------------------------------------------------------------------
	//
	// Public methods:
	//
	//--------------------------------------------------------------------------
	
	/**
	 * Initialises the MQ object and sets the initial media query callbacks.
	 *
	 * @param query { object } The query object.
	 */
	
	mq.init = function(query) {
		
		this.callbacks   = []; // Container for all callbacks registered with the plugin.
		this.context     = ''; // Current active query.
		this.new_context = ''; // Current active query to be read inside callbacks, as this.context won't be set when they're called!
		
		if (typeof query !== 'undefined') {
			
			for (var i = 0, l = query.length; i < l; i++) this.addQuery(query[i]);
			
		}
		
		_addEvent(window, 'resize', _listenForChange, mq); // Add a listener to the window.resize event, pass mq/self as the scope.
		
		_listenForChange.call(this); // Figure out which query is active on load.
		
	};
	
	//--------------------------------------------------------------------

	/**
	 * Attach a new query to test.
	 *
	 * @param query {
	 *     context: ['some_media_query', 'some_other_media_query'],
	 *     call_for_each_context: true,
	 *     callback: function() {
	 *         // Something awesome here...
	 *     }
	 * }
	 *
	 * @return { object } A reference to the query that was added.
	 */
	
	mq.addQuery = function(query) {
		
		if (query) {
			
			this.callbacks.push(query);
			
			// If the context is passed as a string then turn it into an array (for unified approach elsewhere in the code):
			if (typeof query.context === 'string') query.context = [query.context];
			
			// See if "call_for_each_context" is set; if not then set a default (IBID):
			if (typeof query.call_for_each_context !== 'boolean') query.call_for_each_context = true; // Default
			
			// Fire the added callback if it matches the current context:
			if ((this.context) && _inArray(this.context, query.context)) query.callback();
			
			return this.callbacks[this.callbacks.length - 1];
			
		}
		
	};
	
	//--------------------------------------------------------------------

	/**
	 * Remove a query by reference.
	 *
	 * @param query { object }
	 */
	
	mq.removeQuery = function(query) {
		
		if (query) {
			
			var match = -1;
			
			while ((match = this.callbacks.indexOf(query)) > -1) this.callbacks.splice(match, 1);
			
		}
		
	};
	
	//--------------------------------------------------------------------------
	//
	// Private methods:
	//
	//--------------------------------------------------------------------------
	
	/**
	 * Binds to the window.onResize and checks for media query changes.
	 *
	 * @this { object } Current instance.
	 */
	
	function _listenForChange() {
		
		// Get the value of :after or font-family from the chosen element style:
		var context = _contentAfter(document.body) || _fontFamily(document.documentElement); // Returns the first value that is "truth-like", or the last value, if no values are "truth-like".
		
		// Do we have a context? Note that Opera doesn't jive with font-family on the <html> element...
		if (context) {
			
			context = context.replace(/['",]/g, ''); // Android browsers place a "," after an item in the font family list; most browsers either single or double quote the string.
			
			if (context !== this.context) {
				
				this.new_context = context;
				
				_triggerCallbacks.call(this, this.new_context);
				
			}
			
			this.context = this.new_context;
			
		}
		
	};
	
	//--------------------------------------------------------------------

	/**
	 * Loop through the stored callbacks and execute the ones that are bound to the current context.
	 *
	 * @this { object } Current instance.
	 * @param context { string }
	 */
	
	function _triggerCallbacks(context) {
		
		if (context) {
			
			var callback_function;
			
			for (var i = 0, l = this.callbacks.length; i < l; i++) {
				
				// Don't call for each context?
				if ((this.callbacks[i].call_for_each_context === false) && _inArray(this.context, this.callbacks[i].context)) continue; // Was previously called, and we don't want to call it for each context.
				
				callback_function = this.callbacks[i].callback;
				
				if (_inArray(context, this.callbacks[i].context) && (callback_function !== undefined)) callback_function(); // Callback!
				
			}
			
		}
		
	};
	
	//--------------------------------------------------------------------
	
	/**
	 * Swiss Army Knife event binding, in lieu of jQuery.
	 *
	 * @param elem { object } Target object element.
	 * @param type { string } Event type.
	 * @param eventHandle { method }
	 * @param eventContext { object }
	 */
	
	function _addEvent(elem, type, eventHandle, eventContext) {
		
		if (elem) {
			
			if (elem.addEventListener) {
				
				// If the browser supports event listeners, use them:
				elem.addEventListener(type, function() { eventHandle.call(eventContext); }, false);
				
			} else if (elem.attachEvent) {
				
				// IE & Opera:
				elem.attachEvent('on' + type, function() { eventHandle.call(eventContext); });
				
			} else {
				
				// Otherwise, replace the current thing bound to on[whatever]!
				elem['on' + type] = function() { eventHandle.call(eventContext); }; // @TODO: Consider refactoring.
				
			}
			
		}
		
	};
	
	//--------------------------------------------------------------------
	
	/**
	 * Checks if "needle" occurs in "haystack".
	 *
	 * @param needle { mixed } Look for in haystack array.
	 * @param haystack { array } Haystack array to search in.
	 * @return { boolan } True if the needle occurs, false otherwise.
	 */
	
	function _inArray(needle, haystack) {
		
		for (var i = 0, l = haystack.length; i < l; i++) {
			
			if (haystack[i] == needle) return true;
			
		}
		
		return false;
		
	};
	
	//--------------------------------------------------------------------
	
	/**
	 * Get the font-family style value of the passed element's style.
	 *
	 * @return { string } Value or empty string.
	 */
	
	function _fontFamily(el) {
		
		if (el) {
			
			// return (IE browser?) ? (Return IE fontFamily) : ((W3C browser?) ? (Return W3C font-family) : Return empty string);
			return (el.currentStyle) ? el.currentStyle['fontFamily'] : ((window.getComputedStyle) ? window.getComputedStyle(el).getPropertyValue('font-family') : '');
			
		}
		
	};
	
	//--------------------------------------------------------------------
	
	/**
	 * Get the :after content value of from the passed element's style.
	 *
	 * @return { string } Value or empty string.
	 */
	
	function _contentAfter(el) {
		
		if (el) {
			
			return (window.getComputedStyle) ? window.getComputedStyle(el, ':after').getPropertyValue('content') : ''; // getPropertyValue() Returns an empty string in Firefox and Opera and null in Google Chrome and Safari.
			
		}
		
	};
	
	//--------------------------------------------------------------------
	
	return mq; // Expose the API.

}(MQ));

