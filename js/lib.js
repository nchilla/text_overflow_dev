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
          nodelist=nodelist.concat(selectorToAr(item));
        }
      });
    }else if((typeof selector)=='string'){
      nodelist=selectorToAr(selector)
    }
    if(nodelist==undefined||nodelist.length<1){
      console.log(nodelist)
      nodelist=null;
    }
    this.nodes=nodelist;
		this.observers=[];
		this.started=false;
		var intOptions={
			root: 0,
			rootMargin: '0px',
			threshold: 1.0
		}
		this.nodes.forEach((item, i) => {
			//inserts order data into dom element
			item.textthread=i;
			//creates and assigns observer for each container
			intOptions.root=item;
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
			firstInsert(this.nodes,contents);
      // console.log(contents);
    }
	};
	//callback function for intersection observers
	function changeDetected(entries){
		var root=entries[0].target.parentNode;
		var exited=entries.filter(x=>x.intersectionRatio<0.95&&x.target.textthread!=='dummy')
		var dummiesEntered=entries.filter(x=>x.intersectionRatio>0.95&&x.target.textthread=='dummy')
		if(root!==null){
			var nextNode=findNext(root);
			if(exited.length>0){
				for(var i=exited.length-1;i>-1;i--){
					var theChild=exited[i].target
					// theChild.remove();
					move(theChild,'forw');
					// nextNode.insertBefore(theChild,nextNode.childNodes[0]);
				}
				dummy(root)
				dummy(nextNode)
			}else if(dummiesEntered.length>0){
				console.log('dummyyyyy')
				move(toAr(nextNode.childNodes)[0],'back');
			}
		}
		function move(child,dir){
			switch(dir){
				case 'forw':
				nextNode.insertBefore(child,nextNode.childNodes[0]);
				break;
				case 'back':
				var children=toAr(root.childNodes);
				var dummies=children.filter(x=>x.textthread=='dummy');
				dummies.forEach((item, i) => {
					item.remove();
				});
				root.append(child);
				dummy(root)
				dummy(nextNode)
				break;
			}
		}

		// console.log(exited,dummiesEntered);
		// console.log(entries.filter(x=>x.intersectionRatio>0.9));
		// for(var i=root.textthread+1;i<observers.length;i++){
		// 	console.log(observers[i].takeRecords());
		// }
	}



	function firstInsert(containers,contents){
		containers.forEach((item, i) => {
			item.innerHTML='';
		});
		contents.forEach((item, i) => {
			containers[0].appendChild(item);
			// this.observers[0].observe(item)
			observers[0].observe(item);
		});
		dummy(containers[0])
	}
	var once=false;
	function dummy(node){
		var children=toAr(node.childNodes)
		node.querySelector("[textthread='dummy']")
		var dummies=children.find(x=>x.textthread=='dummy');
		if(dummies==undefined){
			replaceDummy();
		}else if(children.indexOf(dummies)<children.length-1){
			dummies.remove();
			replaceDummy();
		}
		function replaceDummy(){
			var nextNode=findNext(node);
			if(nextNode!==undefined){
				var firstChild=toAr(nextNode.childNodes)[0];
				if(firstChild!==undefined){
					var clone=firstChild.cloneNode(true);
					clone.style.opacity=0;
					clone.textthread='dummy';
					node.appendChild(clone);
					observers[node.textthread].observe(clone);
					once=true;
				}
			}
		}
	}
	//finds the next container in the order from the one fed in
	function findNext(node){
		var nextInd=node.textthread+1;
		var nextNode=toAr(document.documentElement.querySelector('body').childNodes).find(x=>x.textthread==nextInd);
		return nextNode;
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

	//turns a selector into a nodelist and converts to array
  function selectorToAr(selector){
		return toAr(document.querySelectorAll(selector));
    // return Array.prototype.slice.call();
  }
	//converts a nodelist into an array
	function toAr(nodelist){
		return Array.prototype.slice.call(nodelist)
	}

	return Constructor;

})();
