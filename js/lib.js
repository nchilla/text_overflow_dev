//textThread

/*!
 * Constructor Pattern Boilerplate
 * (c) 2019 Chris Ferdinandi, MIT License, https://gomakethings.com
 */
var TextThread = (function () {
	'use strict';

	let observers=[];

	var Constructor = function (selector) {
    //this checks if you specify order, and builds a nodelist accordingly
    var nodelist=[];
    if(Array.isArray(selector)){
      selector.forEach((item, i) => {
        if(typeof item=='string'){
          nodelist=nodelist.concat(toAr(item));
        }
      });
    }else if((typeof selector)=='string'){
      nodelist=toAr(selector)
    }
    if(nodelist==undefined||nodelist.length<1){
      console.log(nodelist)
      nodelist=null;
    }
    this.nodes=nodelist;
		this.observers=[];
		this.started=false;
		this.nodes.forEach((item, i) => {
			var intOptions={
				root: item,
				rootMargin: '0px',
				threshold: 1.0
			}
			//creates and assigns observer for each container
			var newOb=new IntersectionObserver(changeDetected,intOptions);
			observers.push(newOb);
		});
	};

  Constructor.prototype.build = function (rule,text) {
		if(rule==undefined){
			rule='body';
		}
    if(text==undefined){
      var contents=this.nodes[0].childNodes;
      var contents=splitter(rule,contents)
			this.nodes.forEach((item, i) => {
				item.innerHTML='';
			});
			contents.forEach((item, i) => {
				this.nodes[0].appendChild(item);
				// this.observers[0].observe(item)
				observers[0].observe(item);
			});
      console.log(contents);
    }
	};
	//callback function for intersection observers
	function changeDetected(entries){
		var root=entries[0].target.parentNode;
		console.log(observers)
		observers.forEach((item, i) => {
			console.log(item.takeRecords())
		});
	}

	//takes the contents of a text container
	//returns an array of span nodes, according to a split rule (regex or preset)
	//respects all text in the container that is already wrapped
  function splitter(rule,contents){
		if (rule instanceof RegExp) {
			return inclusiveSplit(rule);
		}else if(typeof rule=='string'){
			switch(rule){
				case 'body':
				return inclusiveSplit(/(\S+\s)/g);
				break;
			}
		}else{
			return null;
		}

    function inclusiveSplit(regex){
			var inventory=[];
      contents.forEach((item, i) => {
				if(item.nodeType==3){
					var str=item.textContent;
					var collection=str.split(regex);
					collection=collection.filter(x=>x.length>0);
					collection=collection.map(x=>nodeBuilder(x));
					inventory=inventory.concat(collection);
				}else{
					inventory.push(item.cloneNode(true));
				}
      });
      return inventory;
    }
  }

	//creates a span node and adds text
	function nodeBuilder(inside){
		var newnode=document.createElement("span");
		var textnode=document.createTextNode(inside);
		newnode.appendChild(textnode);
		return newnode;
	}
	//turns a nodelist into an array
  function toAr(selector){
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

	return Constructor;

})();
