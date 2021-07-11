var workflow = (function (exports) {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __awaiter$1(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    var toad = {exports: {}};

    (function (module, exports) {
    !function(t,e){e(exports);}(commonjsGlobal,(function(t){class e{constructor(t){void 0===t?(this.m11=1,this.m12=0,this.m21=0,this.m22=1,this.tX=0,this.tY=0):(this.m11=t.m11,this.m12=t.m12,this.m21=t.m21,this.m22=t.m22,this.tX=t.tX,this.tY=t.tY);}identity(){this.m11=1,this.m12=0,this.m21=0,this.m22=1,this.tX=0,this.tY=0;}append(t){let e=this.m11*t.m11+this.m12*t.m21,i=this.m11*t.m12+this.m12*t.m22,o=this.m21*t.m11+this.m22*t.m21,s=this.m21*t.m12+this.m22*t.m22,n=this.tX*t.m11+this.tY*t.m21+t.tX,l=this.tX*t.m12+this.tY*t.m22+t.tY;this.m11=e,this.m12=i,this.m21=o,this.m22=s,this.tX=n,this.tY=l;}prepend(t){let e=t.m11*this.m11+t.m12*this.m21,i=t.m11*this.m12+t.m12*this.m22,o=t.m21*this.m11+t.m22*this.m21,s=t.m21*this.m12+t.m22*this.m22,n=t.tX*this.m11+t.tY*this.m21+this.tX,l=t.tX*this.m12+t.tY*this.m22+this.tY;this.m11=e,this.m12=i,this.m21=o,this.m22=s,this.tX=n,this.tY=l;}invert(){let t=1/(this.m11*this.m22-this.m21*this.m12),e=t*this.m22,i=t*-this.m12,o=t*-this.m21,s=t*this.m11,n=t*(this.m21*this.tY-this.m22*this.tX),l=t*(this.m12*this.tX-this.m11*this.tY);this.m11=e,this.m12=i,this.m21=o,this.m22=s,this.tX=n,this.tY=l;}translate(t){let i=new e({m11:1,m12:0,m21:0,m22:1,tX:t.x,tY:t.y});this.append(i);}rotate(t){let i=new e({m11:Math.cos(t),m12:Math.sin(t),m21:-Math.sin(t),m22:Math.cos(t),tX:0,tY:0});this.append(i);}scale(t,i){let o=new e({m11:t,m12:0,m21:0,m22:i,tX:0,tY:0});this.append(o);}transformPoint(t){return {x:t.x*this.m11+t.y*this.m21+this.tX,y:t.x*this.m12+t.y*this.m22+this.tY}}transformArrayPoint(t){return [t[0]*this.m11+t[1]*this.m21+this.tX,t[0]*this.m12+t[1]*this.m22+this.tY]}}class i{constructor(t,e){this.callback=t,this.id=e;}}class o{add(t,e){this.callbacks||(this.callbacks=new Array),this.callbacks.push(new i(t,e));}remove(t){if(this.callbacks)for(let e=this.callbacks.length-1;e>=0;--e)this.callbacks[e].id===t&&this.callbacks.splice(e,1);}count(){return this.callbacks?this.callbacks.length:0}lock(){this.locked=!0;}unlock(){if(this.locked=void 0,this.triggered){let t=this.triggered.data;this.triggered=void 0,this.trigger(t);}}trigger(t){if(this.locked)this.triggered={data:t};else if(this.callbacks)for(let e=0;e<this.callbacks.length;++e)this.callbacks[e].callback(t);}}class s{constructor(){this.modified=new o;}}class n extends s{constructor(t){super(),this._value=t;}set value(t){this._value!=t&&(this._value=t,this.modified.trigger());}get value(){return this._value}}class l extends n{constructor(t){super(t);}}class r extends n{constructor(t,e){super(t),e&&(this.min=e.min,this.max=e.max,this.step=e.step);}}class d extends s{constructor(t){super(),this._value=t;}set promise(t){this._value=t,this.modified.trigger();}get promise(){return "string"==typeof this._value?()=>this._value:this._value}set value(t){this._value!==t&&("string"==typeof t?(this._value=t,this.modified.trigger()):console.trace(`TextModel.set value(value: string): ${typeof t} is not type string`));}get value(){switch(typeof this._value){case"number":case"string":this._value=`${this._value}`;break;case"function":this._value=this._value();}return this._value}}class h extends d{constructor(t){super(t);}}class a extends s{constructor(t,e){super(),this.signal=new o,this.title=e,this._enabled=!0;}set value(t){throw Error("Action.value can not be assigned a value")}get value(){throw Error("Action.value can not return a value")}set enabled(t){this._enabled!=t&&(this._enabled=t,this.modified.trigger());}get enabled(){return this._enabled}trigger(t){this._enabled&&this.signal.trigger(t);}}class c{constructor(){this.modelId2Models=new Map,this.modelId2Views=new Map,this.view2ModelIds=new Map,this.sigChanged=new o;}registerAction(t,e){let i=new a(void 0,t);return i.signal.add(e),this._registerModel("A:"+t,i),i}registerModel(t,e){this._registerModel("M:"+t,e);}_registerModel(t,e){let i=this.modelId2Models.get(t);i||(i=new Set,this.modelId2Models.set(t,i)),i.add(e);let o=this.modelId2Views.get(t);if(o)for(let t of o)t.setModel(e);}registerView(t,e){if(e.controller&&e.controller!==this)return void console.log("error: attempt to register view more than once at different controllers");e.controller=this;let i=this.view2ModelIds.get(e);i||(i=new Set,this.view2ModelIds.set(e,i)),i.add(t);let o=this.modelId2Views.get(t);o||(o=new Set,this.modelId2Views.set(t,o)),o.add(e);let s=this.modelId2Models.get(t);if(s)for(let t of s)e.setModel(t);}unregisterView(t){if(!t.controller)return;if(t.controller!==this)throw Error("attempt to unregister view from wrong controller");let e=this.view2ModelIds.get(t);if(e)for(let i of e){let e=this.modelId2Views.get(i);e&&(e.delete(t),0===e.size&&this.modelId2Views.delete(i),t.setModel(void 0));}}clear(){for(let t of this.view2ModelIds)t[0].setModel(void 0);this.modelId2Models.clear(),this.modelId2Views.clear(),this.view2ModelIds.clear();}bind(t,e){this.registerModel(t,e);}action(t,e){return this.registerAction(t,e)}text(t,e){let i=new d(e);return this.bind(t,i),i}html(t,e){let i=new h(e);return this.bind(t,i),i}boolean(t,e){let i=new l(e);return this.bind(t,i),i}number(t,e,i){let o=new r(e,i);return this.bind(t,o),o}}function u(t){return function(t){let e=document.querySelector('template[id="'+t+'"]');if(!e)throw new Error("failed to find template '"+t+"'");let i=e.content;return document.importNode(i,!0)}(t)}function p(t,e){let i=t.getAttribute(e);if(null===i)throw console.log("missing attribute '"+e+"' in ",t),Error("missing attribute '"+e+"' in "+t.nodeName);return i}function m(t,e){let i=t.getAttribute(e);return null===i?void 0:i}function w(t,e){return function(t){if(""===t)return 0;if("px"!==t.substr(t.length-2))throw Error(`TableView.pixelToNumber('${t}') expected 'px' suffix`);return Number.parseFloat(t.substr(0,t.length-2))}(window.getComputedStyle(t,void 0).getPropertyValue(e))}function g(t){return w(t,"padding-left")+w(t,"padding-right")}function b(t){return w(t,"padding-top")+w(t,"padding-bottom")}
    /*! *****************************************************************************
        Copyright (c) Microsoft Corporation.

        Permission to use, copy, modify, and/or distribute this software for any
        purpose with or without fee is hereby granted.

        THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
        REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
        AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
        INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
        LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
        OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
        PERFORMANCE OF THIS SOFTWARE.
        ***************************************************************************** */
    function f(t,e,i,o){var s,n=arguments.length,l=n<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(t,e,i,o);else for(var r=t.length-1;r>=0;r--)(s=t[r])&&(l=(n<3?s(l):n>3?s(e,i,l):s(e,i))||l);return n>3&&l&&Object.defineProperty(e,i,l),l}class v{constructor(t,e){this.object=t,this.attribute=e.toString();}get(){return this.object[this.attribute]}set(t){Object.defineProperty(this.object,this.attribute,{value:t});}toString(){return `${this.object[this.attribute]}`}fromString(t){const e=typeof this.object[this.attribute];let i;switch(e){case"string":i=t;break;case"number":i=Number.parseFloat(t);break;default:throw Error(`Reference.fromString() isn't yet supported for type ${e}`)}Object.defineProperty(this.object,this.attribute,{value:i});}}function y(t,e){return new v(t,e)}class x extends Array{constructor(t){super(...null==t?void 0:t.children);for(let t=0;t<this.length;++t){const e=this[t];"string"==typeof e&&(this[t]=document.createTextNode(e));}}replaceIn(t){for(;t.childNodes.length>0;)t.removeChild(t.childNodes[t.childNodes.length-1]);this.appendTo(t);}appendTo(t){for(let e of this)t.appendChild(e);}}function C(t,e,i){return void 0!==e&&void 0!==e.children&&(e.children=[e.children]),k(t,e)}function k(t,e,i){let o;if("string"!=typeof t)return new t(e);const s=t;switch(s){case"svg":case"line":case"rect":case"circle":case"path":case"text":o="http://www.w3.org/2000/svg";break;default:o="http://www.w3.org/1999/xhtml";}const n=document.createElementNS(o,s);return E(n,e,o),n}function E(t,e,i){if(null!=e){for(let[o,s]of Object.entries(e))switch(o){case"children":break;case"action":if(s instanceof Function){const e=new a(void 0,"");e.signal.add(s),t.setModel(e);}else t.setModel(s);break;case"model":t.setModel(s);break;case"class":t.classList.add(s);break;case"style":for(let[e,i]of Object.entries(s)){const o=/[A-Z]/g;e=e.replace(o,(t=>"-"+t.toLowerCase())),t.style.setProperty(e,i);}break;case"set":Object.defineProperty(e.set.object,e.set.attribute,{value:t});break;default:if("on"===o.substring(0,2))t.addEventListener(o.substr(2),s);else if("object"!=typeof s){if("http://www.w3.org/2000/svg"===i){const t=/[A-Z]/g;o=o.replace(t,(t=>"-"+t.toLowerCase()));}t.setAttributeNS(null,o,`${s}`);}}if(void 0!==e.children)for(let i of e.children)"string"==typeof i?t.appendChild(document.createTextNode(i)):t.appendChild(i);}}var T,A={};function R(t,e,i){if(!i||typeof i.value!==T.typeOfFunction)throw new TypeError("Only methods can be decorated with @bind. <"+e+"> is not a method!");return {configurable:T.boolTrue,get:function(){var t=i.value.bind(this);return Object.defineProperty(this,e,{value:t,configurable:T.boolTrue,writable:T.boolTrue}),t}}}Object.defineProperty(A,"__esModule",{value:!0}),function(t){t.typeOfFunction="function",t.boolTrue=!0;}(T||(T={}));var M=A.bind=R;A.default=R;class O extends c{constructor(){super();}open(t){if(this.shadow=C("div",{style:{position:"absolute",left:"0",top:"0",right:"0",bottom:"0",backgroundColor:"#aaa",opacity:"0.5"}}),this.frame=C("div",{style:{position:"absolute",left:"5%",top:"5%",right:"5%",bottom:"5%",padding:"10px",overflow:"auto",backgroundColor:"#fff",border:"solid 2px #000"}}),"object"==typeof t)return t instanceof x?t.appendTo(this.frame):this.frame.appendChild(t),document.body.appendChild(this.shadow),void document.body.appendChild(this.frame);document.body.appendChild(this.shadow);let e,i=document.head.querySelectorAll("link[rel=import]");for(let o of i)if(o.href===t){e=o;break}if(e)e.dispatchEvent(new Event("load"));else {let e=document.createElement("link");e.rel="import",e.href=t,e.onload=i=>{let o=e.import.querySelector("template");if(!o)throw Error("toad.openDialog: failed to find template in '"+t+"'");let s=document.importNode(o.content,!0);this.registerViews(s),this.frame.appendChild(s),document.body.appendChild(this.frame);},document.head.appendChild(e);}}close(){this.frame&&document.body.removeChild(this.frame),this.shadow&&document.body.removeChild(this.shadow),this.frame=void 0,this.shadow=void 0;}registerViews(t){let e=t.querySelectorAll("[model]");for(let t of e){let e=t;if(e)try{this.registerView(e.getModelId(),e);}catch(t){}}e=t.querySelectorAll("[action]");for(let t of e){let e=t;if(e)try{this.registerView(e.getActionId(),e);}catch(t){}}}}f([M],O.prototype,"close",null);let N=new c;class D{constructor(){this._stop=!1;}start(){this.prepare(),!0!==this._stop&&this.requestAnimationFrame(this._firstFrame);}stop(){var t;this._stop=!0,(null===(t=this.animator)||void 0===t?void 0:t.current)===this&&(this.animator.current=void 0);}replace(t){this.next=t,this.animationFrame(1),this.lastFrame(),t.prepare();}prepare(){}firstFrame(){}animationFrame(t){}lastFrame(){}requestAnimationFrame(t){window.requestAnimationFrame(t);}_firstFrame(t){this.startTime=t,this.firstFrame(),this._stop||(this.animationFrame(0),this.requestAnimationFrame(this._animationFrame));}_animationFrame(t){var e;if(this.next)return void this.next._firstFrame(t);let i=D.animationFrameCount>0?(t-this.startTime)/D.animationFrameCount:1;i=i>1?1:i;const o=this.ease(i);this.animationFrame(o),this._stop||(o<1?this.requestAnimationFrame(this._animationFrame.bind(this)):(this.lastFrame(),(null===(e=this.animator)||void 0===e?void 0:e.current)===this&&(this.animator.current=void 0)));}ease(t){return .5*(1-Math.cos(Math.PI*t))}}D.animationFrameCount=468,f([M],D.prototype,"_firstFrame",null),f([M],D.prototype,"_animationFrame",null);class _{run(t){const e=this.current;this.current=t,t.animator=this,e?(e.animator=void 0,e.replace(t)):t.start();}}class L extends s{constructor(){super(),this._stringValue="";}set stringValue(t){this._stringValue!==t&&(this._stringValue=t,this.modified.trigger());}get stringValue(){return this._stringValue}isValidStringValue(t){return !1}}class H extends HTMLElement{constructor(t){super(),E(this,t);}static define(t,e,i){const o=window.customElements.get(t);void 0===o?window.customElements.define(t,e,i):o!==e&&console.trace(`View::define(${t}, ...): attempt to redefine view with different constructor`);}setModel(t){console.trace("Please note that View.setModel(model) has no implementation.");}getModelId(){if(!this.hasAttribute("model"))throw Error("no 'model' attribute");let t=this.getAttribute("model");if(!t)throw Error("no model id");return "M:"+t}getActionId(){if(!this.hasAttribute("action"))throw Error("no 'action' attribute");let t=this.getAttribute("action");if(!t)throw Error("no action id");return "A:"+t}connectedCallback(){if(this.controller)return;let t="";try{t=this.getModelId();}catch(t){}""!=t&&N.registerView(t,this);}disconnectedCallback(){this.controller&&this.controller.unregisterView(this);}}class S extends H{constructor(t){super(t);}updateModel(){}updateView(t){}setModel(t){if(t===this.model)return;const e=this;this.model&&this.model.modified.remove(e),t&&t.modified.add((t=>e.updateView(t)),e),this.model=t,this.isConnected&&this.updateView(void 0);}connectedCallback(){super.connectedCallback(),this.model&&this.updateView(void 0);}}class V extends H{static focusIn(t){const e=new Map;for(let i=t.parentElement,o=0;null!==i;i=i.parentElement,++o)e.set(i,o);let i,o,s=Number.MAX_SAFE_INTEGER,n=new Array;for(const o of this.allTools.values())if(o.canHandle(t))for(let t=o.parentElement,l=0;null!==t;t=t.parentElement,++l){const l=e.get(t);void 0!==l&&(s<l||(s>l&&(n.length=0),s=l,i=t,n.push(o)));}if(!i)return;const l=V.getIndex(t,i);let r=Number.MIN_SAFE_INTEGER;for(let t of n){const e=V.getIndex(t,i);e<l&&e>r&&(r=e,o=t);}this.setActive(o,t);}static getIndex(t,e){void 0===e&&console.trace(`GenericTool.getIndex(${t}, ${e})`);let i=t;for(;i.parentElement!==e;)i=i.parentElement;return Array.from(e.childNodes).indexOf(i)}static setActive(t,e){this.activeTool&&this.activeTool.deactivate(),this.activeTool=t,this.activeView=e,t&&t.activate();}static focusOut(t){this.activeView===t&&this.setActive(void 0,void 0);}connectedCallback(){super.connectedCallback(),V.allTools.add(this);}disconnectedCallback(){V.activeTool===this&&V.setActive(void 0,void 0),V.allTools.delete(this),super.disconnectedCallback();}}V.allTools=new Set,window.addEventListener("focusin",(t=>{t.target instanceof V||(t.relatedTarget instanceof H&&V.focusOut(t.relatedTarget),t.target instanceof H&&V.focusIn(t.target));}));class I extends S{constructor(t){super(t);}connectedCallback(){if(this.controller)this.updateView();else {try{N.registerView(this.getActionId(),this);}catch(t){}try{N.registerView(this.getModelId(),this);}catch(t){}this.updateView();}}disconnectedCallback(){super.disconnectedCallback(),this.controller&&this.controller.unregisterView(this);}setModel(t){if(!t)return this.model&&this.model.modified.remove(this),this.action&&this.action.modified.remove(this),this.model=void 0,this.action=void 0,void this.updateView();if(t instanceof a)this.action=t,this.action.modified.add((()=>{this.updateView();}),this);else {if(!(t instanceof d))throw Error("unexpected model of type "+t.constructor.name);this.model=t,this.model.modified.add((()=>{this.updateView();}),this);}this.updateView();}isEnabled(){return void 0!==this.action&&this.action.enabled}}class B extends S{constructor(){super();}updateView(){if(!this.model)return;let t=void 0===this.model.value?"":this.model.value;this.model instanceof h?this.innerHTML=t:this.innerText=t;}}let j=document.createElement("style");j.textContent="\n  button {\n    border: none;\n    background-color: var(--toad-primary-color, #0052cc);\n    color: #ffffff;\n    border-radius: 3px;\n    font-size: 14px;\n    font-weight: bold;\n    height: 32px;\n    line-height: 32px;\n    min-width: 24px;\n    text-shadow: none;\n    padding: 0 10px;\n    margin-right: 4px;\n  }\n  \n  button:hover {\n    background-color: #0065ff;\n  }\n  \n  button:hover:active {\n    background-color: #0049b0;\n  }\n  \n  button:disabled, button:disabled:active {\n    background-color: #888;\n  }\n";class F extends I{constructor(t){super(t),this.button=document.createElement("button"),this.button.onclick=()=>{this.action&&this.action.trigger();},this.button.disabled=!0,this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(j,!0)),this.shadowRoot.appendChild(this.button);}connectedCallback(){super.connectedCallback(),0===this.children.length&&(this._observer=new MutationObserver(((t,e)=>{void 0!==this._timer&&clearTimeout(this._timer),this._timer=window.setTimeout((()=>{this._timer=void 0,this.updateView();}),100);})),this._observer.observe(this,{childList:!0,subtree:!0,characterData:!0}));}updateView(){this.isConnected&&(this.model&&this.model.value?this.model instanceof h?this.button.innerHTML=this.model.value:this.button.innerText=this.model.value:this.button.innerHTML=this.innerHTML,this.button.disabled=!this.isEnabled());}}let W=document.createElement("style");W.textContent="\ndiv {\n    border: 1px solid #e3dbdb;\n    border-radius: 5px;\n    background: #e3dbdb;\n    width: 32px;\n    height: 32px;\n    padding: 3px;\n}\n\n:host([selected]) div {\n    background: #ac9393;\n}\n\n:host([disabled]) div {\n    opacity: 0.5;\n}\n\n:host([disabled]) div img {\n    opacity: 0.5;\n}\n\n:host([checked][disabled]) div {\n}\n";class $ extends S{constructor(t){super(),t?(this.setAttribute("value",t.value),this.setAttribute("img",t.img),!0===t.disabled&&this.setAttribute("disabled","disabled")):t={value:this.getAttribute("value"),img:this.getAttribute("img"),disabled:this.hasAttribute("disabled")},t.model&&this.setModel(t.model);let e=document.createElement("div");e.onmousedown=t=>{this.hasAttribute("disabled")||(e.focus(),t.preventDefault(),void 0!==this.model&&(this.model.stringValue=this.getValue()));};let i=document.createElement("img");i.src=t.img,e.appendChild(i),this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(W,!0)),this.shadowRoot.appendChild(e);}getValue(){let t=this.getAttribute("value");if(null===t)throw Error("no value");return t}connectedCallback(){super.connectedCallback(),void 0===this.model&&this.setAttribute("disabled","");}updateView(){if(void 0===this.model)return this.setAttribute("disabled",""),void this.removeAttribute("selected");let t=this.getValue();this.model.isValidStringValue(t)?this.removeAttribute("disabled"):this.setAttribute("disabled",""),this.model.stringValue===t?this.setAttribute("selected",""):this.removeAttribute("selected");}}let U=document.createElement("style");U.textContent="\nsvg {\n  width: 12px;\n  height: 12px;\n  vertical-align: middle;\n  margin: 3px;              /* space for the outline */\n  background: none;\n}\nsvg:focus {\n  outline-offset: -2px;     /* bring outline in touch with the svg */\n  background: #9eccfb;      /* the rectangle is rounded, fill the corners */\n  outline-color: 9eccfb;    /* outline shall be the same color used to fill the corners */\n}\n@media(pointer: coarse) { /* works on Chrome but iOS is never coarse :( */\n  svg {\n    width: 18px;\n    height: 18px;\n  }\n}\nsvg rect {\n  stroke: var(--border-color, var(--toad-neutral-color, #aaa));\n  fill: var(--background-color, #fff);\n  stroke-width: 1px;\n}\nsvg path {\n  stroke: var(--marker-color, none);\n  fill: none;\n  stroke-width: 2px;\n}\n:host([checked]) svg rect {\n  stroke: var(--checked-border-color, var(--toad-primary-color, #0052cc));\n  fill: var(--checked-background-color, var(--toad-primary-color, #0052cc));\n}\n:host([checked]) svg path {\n  stroke: var(--checked-marker-color, var(--toad-light-color, #fff));\n}\n:host([disabled]) svg rect {\n  stroke: var(--checked-border-color, var(--toad-primary-color, #bdbdbd));\n  fill: var(--checked-background-color, var(--toad-primary-color, #fff));\n}\n:host([disabled]) svg path {\n  stroke: var(--checked-marker-color, var(--toad-light-color, none));\n}\n:host([checked][disabled]) svg path {\n  stroke: var(--checked-marker-color, var(--toad-light-color, #bdbdbd));\n}";class z extends S{constructor(){super();let t=document.createElementNS("http://www.w3.org/2000/svg","svg");t.setAttributeNS("","viewBox","0 0 18 18");let e=document.createElementNS("http://www.w3.org/2000/svg","rect");e.setAttributeNS("","x","1"),e.setAttributeNS("","y","1"),e.setAttributeNS("","width","16"),e.setAttributeNS("","height","16"),e.setAttributeNS("","rx","3"),e.setAttributeNS("","ry","3");let i=document.createElementNS("http://www.w3.org/2000/svg","path");i.setAttributeNS("","d","M4 9.5 L 7.5 13 L 14.5 4"),t.onclick=()=>{this.toggle();},t.setAttributeNS("","tabindex","0"),t.addEventListener("keydown",(t=>{" "===t.key&&this.toggle();})),t.onmousedown=e=>{t.focus(),e.preventDefault();},t.appendChild(e),t.appendChild(i),this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(U,!0)),this.shadowRoot.appendChild(t);}setModel(t){if(void 0!==t&&!(t instanceof l))throw Error("CheckBoxView.setModel(): model is not of type BooleanModel");super.setModel(t);}static get observedAttributes(){return ["checked"]}attributeChangedCallback(t,e,i){switch(t){case"checked":this.updateModel();}}toggle(){this.hasAttribute("disabled")||(this.hasAttribute("checked")?this.removeAttribute("checked"):this.setAttribute("checked",""),this.updateModel());}updateModel(){this.model&&(this.model.value=this.hasAttribute("checked"));}updateView(){if(!this.model)return this.setAttribute("disabled",""),void this.removeAttribute("checked");this.removeAttribute("disabled"),this.model.value?this.setAttribute("checked",""):this.removeAttribute("checked");}}class P extends S{constructor(){super(),this.input=document.createElement("input"),this.input.type="range";let t=this;this.input.oninput=()=>{t.updateModel();},this.attachShadow({mode:"open"}).appendChild(this.input);}updateModel(){this.model&&(this.model.value=Number.parseFloat(this.input.value));}updateView(){this.model&&(void 0===this.model.step&&void 0!==this.model.min&&void 0!==this.model.max?this.input.step=""+(this.model.max-this.model.min)/100:this.input.step=String(this.model.step),this.input.min=String(this.model.min),this.input.max=String(this.model.max),this.input.value=String(this.model.value));}}let Y=document.createElement("style");Y.textContent="\ninput {\n  font-family: var(--toad-font-family, sans-serif);\n  font-size: var(--toad-font-size, 12px);\n  border: 1px #ccc solid;\n  border-radius: 3px;\n  margin: 2px;\n  padding: 4px 5px;\n}\n\n:host(.embedded) input {\n  border: none 0;\n  border-radius: 0;\n  padding: 0;\n  margin: 2px;\n  width: 100%;\n  background: #fff;\n}\n";class q extends S{constructor(t){super(t),this.input=document.createElement("input"),this.input.oninput=()=>{this.updateModel();},this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(Y,!0)),this.shadowRoot.appendChild(this.input);}focus(){this.input.focus();}blur(){this.input.blur();}static get observedAttributes(){return ["value"]}attributeChangedCallback(t,e,i){switch(t){case"value":this.model&&void 0!==i&&(this.model.value=i);}}updateModel(){this.model&&(this.model.value=this.input.value),this.setAttribute("value",this.input.value);}updateView(){if(!this.model)return;const t=`${this.model.value}`;this.input.value!==t&&(this.input.value=t,this.setAttribute("value",this.input.value));}get value(){return this.input.value}set value(t){this.input.value=t,this.updateModel();}}let X=document.createElement("style");X.textContent="\n\n/* try to follow material ui: when active render button labels in black, otherwise in gray */\nsvg .fill {\n  fill: #ccc;\n  stroke: #ccc;\n}\nsvg .stroke {\n  fill: none;\n  stroke: #ccc;\n}\nsvg .strokeFill {\n  fill: #fff;\n  stroke: #ccc;\n}\n\n.toolbar.active svg .fill {\n  fill: #000;\n  stroke: #000;\n}\n.toolbar.active svg .stroke {\n  fill: none;\n  stroke: #000;\n}\n.toolbar.active svg .strokeFill {\n  fill: #fff;\n  stroke: #000;\n}\n\n.toolbar button {\n    background: #fff;\n    color: #000;\n    border: 1px #ccc;\n    border-style: solid solid solid none;\n    padding: 5;\n    margin: 0;\n    vertical-align: middle;\n    height: 22px;\n}\n\n.toolbar button:active:hover {\n  background: linear-gradient(to bottom, #7abcff 0%,#0052cc 100%,#4096ee 100%);\n}\n\n.toolbar button.left {\n    border-style: solid;\n    border-radius: 3px 0 0 3px;\n}\n\n.toolbar button.right {\n    border: 1px #ccc;\n    border-style: solid solid solid none;\n    border-radius: 0 3px 3px 0;\n}\n\n.toolbar button.active {\n    background: linear-gradient(to bottom, #7abcff 0%,#0052cc 100%,#4096ee 100%);\n    border: 1px #0052cc solid;\n    color: #fff;\n}\n\ndiv.textarea {\n  font-family: var(--toad-font-family, sans-serif);\n  font-size: var(--toad-font-size, 12px);\n  border: 1px #ccc solid;\n  border-radius: 3px;\n  margin: 2px;\n  padding: 4px 5px;\n  outline-offset: -2px;\n}\n\ndiv.textarea h1 {\n  font-size: 22px;\n  margin: 0;\n  padding: 4px 0 4px 0;\n}\n\ndiv.textarea h2 {\n  font-size: 18px;\n  margin: 0;\n  padding: 4px 0 4px 0;\n}\n\ndiv.textarea h3 {\n  font-size: 16px;\n  margin: 0;\n  padding: 4px 0 4px 0;\n}\n\ndiv.textarea h4 {\n  font-size: 14px;\n  margin: 0;\n  padding: 4px 0 4px 0;\n}\n\ndiv.textarea div {\n  padding: 2px 0 2px 0;\n}\n";class G extends S{constructor(){super(),G.texttool=this;let t=C("div",{class:"toolbar"});this.buttonH1=C("button",Object.assign({class:"left"},{children:"H1"})),this.buttonH1.onclick=()=>{document.execCommand("formatBlock",!1,"<h1>"),this.update();},t.appendChild(this.buttonH1),this.buttonH2=C("button",{children:"H2"}),this.buttonH2.onclick=()=>{document.execCommand("formatBlock",!1,"<h2>"),this.update();},t.appendChild(this.buttonH2),this.buttonH3=C("button",{children:"H3"}),this.buttonH3.onclick=()=>{document.execCommand("formatBlock",!1,"<h3>"),this.update();},t.appendChild(this.buttonH3),this.buttonH4=C("button",Object.assign({class:"right"},{children:"H4"})),this.buttonH4.onclick=()=>{document.execCommand("formatBlock",!1,"<h4>"),this.update();},t.appendChild(this.buttonH4),t.appendChild(document.createTextNode(" ")),this.buttonBold=C("button",Object.assign({class:"left"},{children:C("b",{children:"B"})})),this.buttonBold.onclick=()=>{document.execCommand("bold",!1),this.update();},t.appendChild(this.buttonBold),this.buttonItalic=C("button",{children:C("i",{children:"I"})}),this.buttonItalic.onclick=()=>{document.execCommand("italic",!1),this.update();},t.appendChild(this.buttonItalic),this.buttonUnderline=C("button",{children:C("u",{children:"U"})}),this.buttonUnderline.onclick=()=>{document.execCommand("underline",!1),this.update();},t.appendChild(this.buttonUnderline),this.buttonStrikeThrough=C("button",{children:C("strike",{children:"S"})}),this.buttonStrikeThrough.onclick=()=>{document.execCommand("strikeThrough",!1),this.update();},t.appendChild(this.buttonStrikeThrough),this.buttonSubscript=C("button",{children:"x₂"}),this.buttonSubscript.onclick=()=>{document.execCommand("subscript",!1),this.update();},t.appendChild(this.buttonSubscript),this.buttonSuperscript=C("button",Object.assign({class:"right"},{children:"x²"})),this.buttonSuperscript.onclick=()=>{document.execCommand("superscript",!1),this.update();},t.appendChild(this.buttonSuperscript),t.appendChild(document.createTextNode(" ")),this.buttonJustifyLeft=C("button",Object.assign({class:"left"},{children:k("svg",Object.assign({viewBox:"0 0 10 9",width:"10",height:"9"},{children:[C("line",{x1:"0",y1:"0.5",x2:"10",y2:"0.5",stroke:"#000"}),C("line",{x1:"0",y1:"2.5",x2:"6",y2:"2.5",stroke:"#000"}),C("line",{x1:"0",y1:"4.5",x2:"10",y2:"4.5",stroke:"#000"}),C("line",{x1:"0",y1:"6.5",x2:"6",y2:"6.5",stroke:"#000"}),C("line",{x1:"0",y1:"8.5",x2:"10",y2:"8.5",stroke:"#000"})]}))})),this.buttonJustifyLeft.onclick=()=>{document.execCommand("justifyLeft",!1),this.update();},t.appendChild(this.buttonJustifyLeft),this.buttonJustifyCenter=C("button",{children:k("svg",Object.assign({viewBox:"0 0 10 9",width:"10",height:"9"},{children:[C("line",{x1:"0",y1:"0.5",x2:"10",y2:"0.5",stroke:"#000"}),C("line",{x1:"2",y1:"2.5",x2:"8",y2:"2.5",stroke:"#000"}),C("line",{x1:"0",y1:"4.5",x2:"10",y2:"4.5",stroke:"#000"}),C("line",{x1:"2",y1:"6.5",x2:"8",y2:"6.5",stroke:"#000"}),C("line",{x1:"0",y1:"8.5",x2:"10",y2:"8.5",stroke:"#000"})]}))}),this.buttonJustifyCenter.onclick=()=>{document.execCommand("justifyCenter",!1),this.update();},t.appendChild(this.buttonJustifyCenter),this.buttonJustifyRight=C("button",Object.assign({class:"right"},{children:k("svg",Object.assign({viewBox:"0 0 10 9",width:"10",height:"9"},{children:[C("line",{x1:"0",y1:"0.5",x2:"10",y2:"0.5",stroke:"#000"}),C("line",{x1:"4",y1:"2.5",x2:"10",y2:"2.5",stroke:"#000"}),C("line",{x1:"0",y1:"4.5",x2:"10",y2:"4.5",stroke:"#000"}),C("line",{x1:"4",y1:"6.5",x2:"10",y2:"6.5",stroke:"#000"}),C("line",{x1:"0",y1:"8.5",x2:"10",y2:"8.5",stroke:"#000"})]}))})),this.buttonJustifyRight.onclick=()=>{document.execCommand("justifyRight",!1),this.update();},t.appendChild(this.buttonJustifyRight),this.buttonUnorderedList=C("button",Object.assign({class:"left"},{children:k("svg",Object.assign({style:{display:"block"},viewBox:"0 0 17 11.5",width:"17",height:"11.5"},{children:[C("circle",{cx:"4.5",cy:"1.5",r:"0.8",stroke:"#000",fill:"#000"}),C("line",{x1:"7",y1:"1.5",x2:"17",y2:"1.5",stroke:"#000"}),C("circle",{cx:"4.5",cy:"5.5",r:"0.8",stroke:"#000",fill:"#000"}),C("line",{x1:"7",y1:"5.5",x2:"17",y2:"5.5",stroke:"#000"}),C("circle",{cx:"4.5",cy:"9.5",r:"0.8",stroke:"#000",fill:"#000"}),C("line",{x1:"7",y1:"9.5",x2:"17",y2:"9.5",stroke:"#000"})]}))})),this.buttonUnorderedList.onclick=t=>{document.execCommand("insertUnorderedList",!1),this.update();},t.appendChild(this.buttonUnorderedList),this.buttonOrderedList=C("button",Object.assign({class:"right"},{children:k("svg",Object.assign({style:{display:"block"},viewBox:"0 0 17 11.5",width:"17",height:"11.5"},{children:[C("line",{x1:"4.5",y1:"0",x2:"4.5",y2:"3",stroke:"#000"}),C("line",{x1:"7",y1:"1.5",x2:"17",y2:"1.5",stroke:"#000"}),C("line",{x1:"2.5",y1:"4",x2:"2.5",y2:"7",stroke:"#000"}),C("line",{x1:"4.5",y1:"4",x2:"4.5",y2:"7",stroke:"#000"}),C("line",{x1:"7",y1:"5.5",x2:"17",y2:"5.5",stroke:"#000"}),C("line",{x1:"0.5",y1:"8",x2:"0.5",y2:"11",stroke:"#000"}),C("line",{x1:"2.5",y1:"8",x2:"2.5",y2:"11",stroke:"#000"}),C("line",{x1:"4.5",y1:"8",x2:"4.5",y2:"11",stroke:"#000"}),C("line",{x1:"7",y1:"9.5",x2:"17",y2:"9.5",stroke:"#000"})]}))})),this.buttonOrderedList.onclick=()=>{document.execCommand("insertOrderedList",!1),this.update();},t.appendChild(this.buttonOrderedList),this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(X,!0)),this.shadowRoot.appendChild(t);}update(){this.buttonH1.classList.toggle("active","h1"===document.queryCommandValue("formatBlock")),this.buttonH2.classList.toggle("active","h2"===document.queryCommandValue("formatBlock")),this.buttonH3.classList.toggle("active","h3"===document.queryCommandValue("formatBlock")),this.buttonH4.classList.toggle("active","h4"===document.queryCommandValue("formatBlock")),this.buttonBold.classList.toggle("active",document.queryCommandState("bold")),this.buttonItalic.classList.toggle("active",document.queryCommandState("italic")),this.buttonUnderline.classList.toggle("active",document.queryCommandState("underline")),this.buttonStrikeThrough.classList.toggle("active",document.queryCommandState("strikeThrough")),this.buttonSubscript.classList.toggle("active",document.queryCommandState("subscript")),this.buttonSuperscript.classList.toggle("active",document.queryCommandState("superscript")),this.buttonJustifyLeft.classList.toggle("active",document.queryCommandState("justifyLeft")),this.buttonJustifyCenter.classList.toggle("active",document.queryCommandState("justifyCenter")),this.buttonJustifyRight.classList.toggle("active",document.queryCommandState("justifyRight"));}}class J extends S{constructor(){super();let t=document.createElement("div");this.content=t,t.classList.add("textarea"),t.contentEditable="true",t.oninput=e=>{let i=e.target.firstChild;i&&3===i.nodeType?document.execCommand("formatBlock",!1,"<div>"):"<br>"===t.innerHTML&&(t.innerHTML=""),this.updateModel();},t.onkeydown=t=>{!0===t.metaKey&&"b"===t.key?(t.preventDefault(),document.execCommand("bold",!1),this.updateTextTool()):!0===t.metaKey&&"i"===t.key?(t.preventDefault(),document.execCommand("italic",!1),this.updateTextTool()):!0===t.metaKey&&"u"===t.key?(t.preventDefault(),document.execCommand("underline",!1),this.updateTextTool()):"Tab"===t.key?t.preventDefault():"Enter"===t.key&&!0!==t.shiftKey&&"blockquote"===document.queryCommandValue("formatBlock")&&document.execCommand("formatBlock",!1,"<p>");},t.onkeyup=()=>{this.updateTextTool();},t.onmouseup=()=>{this.updateTextTool();},this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(X,!0)),this.shadowRoot.appendChild(t);}updateTextTool(){void 0!==G.texttool&&G.texttool.update();}updateModel(){this.model&&(this.model.promise=()=>this.content.innerHTML);}updateView(){this.model&&(this.model instanceof h?this.content.innerHTML!==this.model.value&&(this.content.innerHTML=this.model.value):this.content.innerText!==this.model.value&&(this.content.innerText=this.model.value));}}class Z extends S{updateView(){this.model&&(this.style.display=this.model.value?"":"none");}}const K=document.createElement("style");var Q;K.textContent="\n  :host(.menu-button) {\n    font-family: var(--toad-font-family, sans-serif);\n    font-size: 14px;\n    font-weight: bold;\n    padding: 7px;\n    vertical-align: center;\n  \n    background: #fff;\n    color: #000;\n    cursor: default;\n  }\n  :host(.menu-button.active) {\n    background: #000;\n    color: #fff;\n  }\n  :host(.menu-button.disabled) {\n    color: #888;\n  }\n  :host(.menu-button.active.disabled) {\n    color: #888;\n  }\n  :host(.menu-button.menu-down) {\n    padding-right: 20px;\n    background-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='14'><path d='M 0 4 l 10 0 l -5 5 Z' fill='#000' stroke='none'/></svg>\");\n    background-repeat: no-repeat;\n    background-position: right center;\n  }\n  :host(.menu-button.active.menu-down) {\n    background-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='14'><path d='M 0 4 l 10 0 l -5 5 Z' fill='#fff' stroke='none'/></svg>\");\n    background-repeat: no-repeat;\n    background-position: right center;\n  }\n  :host(.menu-button.menu-side) {\n    padding-right: 20px;\n    background-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='14'><path d='M 0 2 l 0 10 l 5 -5 Z' fill='#000' stroke='none'/></svg>\");\n    background-repeat: no-repeat;\n    background-position: right center;\n  }\n  :host(.menu-button.active.menu-side) {\n    background-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='14'><path d='M 0 2 l 0 10 l 5 -5 Z' fill='#fff' stroke='none'/></svg>\");\n    background-repeat: no-repeat;\n    background-position: right center;\n  }\n  .menu-bar {\n    display: flex;\n    flex-direction: row;\n    justify-content: flex-start;\n    align-items: center;\n  }\n  .menu-popup {\n    position: fixed;\n    display: flex;\n    flex-direction: column;\n    box-shadow: 2px 2px 5px #888;\n  }\n",function(t){t[t.WAIT=0]="WAIT",t[t.DOWN=1]="DOWN",t[t.UP_N_HOLD=2]="UP_N_HOLD",t[t.DOWN_N_HOLD=3]="DOWN_N_HOLD",t[t.DOWN_N_OUTSIDE=4]="DOWN_N_OUTSIDE",t[t.DOWN_N_INSIDE_AGAIN=5]="DOWN_N_INSIDE_AGAIN";}(Q||(Q={}));class tt extends H{constructor(t){super(t),this.vertical=!0,this.closeOnClose=!1,this.state=Q.WAIT;}}class et extends tt{constructor(t,e){super(),this.vertical=!0,this.root=t,this.parentButton=e,this.popup=document.createElement("div"),this.popup.classList.add("menu-popup");let i=t.down;for(;i;)i.isAvailable()?i.createWindowAt(this,this.popup):i.deleteWindow(),i=i.next;this.appendChild(this.popup),this.show();}show(){this.parentButton.master.vertical?function(t,e){let i=t.getBoundingClientRect();e.style.opacity="0",e.style.left=i.left+i.width+"px",e.style.top=i.top+"px",setTimeout((function(){let t=e.getBoundingClientRect();i.top+t.height>window.innerHeight&&(e.style.top=i.top+i.height-t.height+"px"),i.left+i.width+t.width>window.innerWidth&&(e.style.left=i.left-t.width+"px"),e.style.opacity="1";}),0);}(this.parentButton,this.popup):function(t,e){let i=t.getBoundingClientRect();e.style.opacity="0",e.style.left=i.left+"px",e.style.top=i.top+i.height+"px",setTimeout((function(){let t=e.getBoundingClientRect();i.top+i.height+t.height>window.innerHeight&&(e.style.top=i.top-t.height+"px"),i.left+t.width>window.innerWidth&&(e.style.left=i.left+i.width-t.width+"px"),e.style.opacity="1";}),0);}(this.parentButton,this.popup),this.style.display="";}hide(){this.style.display="none";}}H.define("toad-popupmenu",et);class it extends S{constructor(t,e){super(),this.master=t,this.node=e;let i=this;if(this.classList.add("menu-button"),e.down&&(t.vertical?this.classList.add("menu-side"):this.classList.add("menu-down")),this.updateView(),this.onmousedown=t=>{t.stopPropagation();let e=function(t){document.removeEventListener("mouseup",e,{capture:!0}),t.preventDefault(),setTimeout((()=>{it.buttonDown&&i.dispatchEvent(new MouseEvent("mouseup",t));}),0);};if(document.addEventListener("mouseup",e,{capture:!0}),it.buttonDown=!0,!this.master)throw Error("yikes");switch(this.master.state){case Q.WAIT:this.master.state=Q.DOWN,this.activate();break;case Q.UP_N_HOLD:this.master.active!==this?(this.master.state=Q.DOWN,this.activate()):this.master.state=Q.DOWN_N_HOLD;break;default:throw Error("unexpected state "+this.master.state)}return !1},this.onmouseup=t=>{if(t.stopPropagation(),it.buttonDown){if(it.buttonDown=!1,!this.master)throw Error("yikes");if(!this.node)throw Error("yikes");switch(this.master.state){case Q.DOWN:this.node.isEnabled()&&!this.node.down?(this.trigger(),this.master.state=Q.WAIT):(this.master.state=Q.UP_N_HOLD,it.documentMouseDown&&document.removeEventListener("mousedown",it.documentMouseDown,{capture:!1}),it.documentMouseDown=function(t){it.documentMouseDown&&document.removeEventListener("mousedown",it.documentMouseDown,{capture:!1}),it.documentMouseDown=void 0,"TOAD-MENUBUTTON"!==t.target.tagName&&i.collapse();},document.addEventListener("mousedown",it.documentMouseDown,{capture:!1}));break;case Q.DOWN_N_HOLD:case Q.DOWN_N_OUTSIDE:this.master.state=Q.WAIT,this.deactivate(),this.collapse(),this.master.closeOnClose;break;case Q.DOWN_N_INSIDE_AGAIN:this.trigger();break;default:throw Error("unexpected state "+this.master.state)}return !1}},this.onmouseout=t=>{if(t.stopPropagation(),!this.master)throw Error("yikes");switch(it.inside=void 0,this.master.state){case Q.WAIT:case Q.DOWN_N_OUTSIDE:case Q.UP_N_HOLD:case Q.DOWN_N_HOLD:break;case Q.DOWN:case Q.DOWN_N_INSIDE_AGAIN:this.master.state=Q.DOWN_N_OUTSIDE,this.updateView();break;default:throw Error("unexpected state")}return !1},this.onmouseover=t=>{if(t.stopPropagation(),!i.master)throw Error("yikes");switch(it.inside=i,i.master.state){case Q.WAIT:case Q.UP_N_HOLD:case Q.DOWN_N_OUTSIDE:case Q.DOWN_N_HOLD:case Q.DOWN:case Q.DOWN_N_INSIDE_AGAIN:if(!it.buttonDown)break;if(!this.master)throw Error("yikes");this.master.active&&this.master.active.deactivate(),this.master.state=Q.DOWN_N_INSIDE_AGAIN,this.activate();break;default:throw Error("unexpected state "+i.master.state)}return !1},this.attachShadow({mode:"open"}),!this.shadowRoot)throw Error("yikes");this.shadowRoot.appendChild(document.importNode(K,!0)),this.node.modelId||this.shadowRoot.appendChild(document.createTextNode(e.label));}connectedCallback(){if(!this.controller){if(void 0===this.node.down){let t=this.node.title;for(let e=this.node.parent;e&&e.title.length;e=e.parent)t=e.title+"|"+t;t="A:"+t,N.registerView(t,this);}if(void 0!==this.node.modelId)if("string"==typeof this.node.modelId){let t="M:"+this.node.modelId;N.registerView(t,this);}else this.setModel(this.node.modelId);}}disconnectedCallback(){this.controller&&this.controller.unregisterView(this);}setModel(t){if(!t)return this.action&&this.action.modified.remove(this),this.model=void 0,this.action=void 0,void this.updateView();if(t instanceof a)this.action=t,this.action.modified.add((()=>{this.updateView();}),this);else {if(!(t instanceof d))throw Error("unexpected model of type "+t.constructor.name);this.model=t;}this.updateView();}updateView(){if(this.model&&this.model.value){if(!this.shadowRoot)throw Error("yikes");let t=document.createElement("span");this.model instanceof h?t.innerHTML=this.model.value:t.innerText=this.model.value,this.shadowRoot.children.length>1&&this.shadowRoot.removeChild(this.shadowRoot.children[1]),this.shadowRoot.children.length>1?this.shadowRoot.insertBefore(t,this.shadowRoot.children[1]):this.shadowRoot.appendChild(t);}if(!this.master)throw Error("yikes");let t=!1;if(this.master.active==this)switch(this.master.state){case Q.DOWN:case Q.UP_N_HOLD:case Q.DOWN_N_HOLD:case Q.DOWN_N_INSIDE_AGAIN:t=!0;break;case Q.DOWN_N_OUTSIDE:if(!this.node)throw Error("yikes");t=void 0!==this.node.down&&this.node.isEnabled();}this.classList.toggle("active",t),this.classList.toggle("disabled",!this.isEnabled());}isEnabled(){return void 0!==this.node.down||void 0!==this.action&&this.action.enabled}trigger(){this.collapse(),this.action&&this.action.trigger();}collapse(){if(!this.master)throw Error("yikes");this.master.parentButton?this.master.parentButton.collapse():this.deactivate();}openPopup(){if(this.node&&this.node.down){if(!this.shadowRoot)throw Error("yikes");this.popup?this.popup.show():(this.popup=new et(this.node,this),this.shadowRoot.appendChild(this.popup));}}closePopup(){this.popup&&(this.popup.active&&this.popup.active.deactivate(),this.popup.hide());}activate(){if(!this.master)throw Error("yikes");if(!this.node)throw Error("yikes");let t=this.master.active;this.master.active=this,t&&t!==this&&(t.closePopup(),t.updateView()),this.updateView(),this.openPopup();}deactivate(){if(!this.master)throw Error("yikes");this.master.active===this&&(this.master.active.closePopup(),this.master.active=void 0,this.master.state=Q.WAIT,this.updateView());}}class ot{constructor(t,e,i,o,s){this.title=t,this.label=e,this.shortcut=i,this.type=o||"entry",this.modelId=s;}isEnabled(){return !0}isAvailable(){return !0}createWindowAt(t,e){if("spacer"==this.type){let t=document.createElement("span");return t.style.flexGrow="1",void e.appendChild(t)}this.view=new it(t,this),e.appendChild(this.view);}deleteWindow(){}}class st extends tt{constructor(t){super(t),this.config=null==t?void 0:t.config,this.vertical=!1,this.root=new ot("","",void 0,void 0);}connectedCallback(){if(super.connectedCallback(),this.tabIndex=0,this.config)return this.config2nodes(this.config,this.root),this.referenceActions(),void this.createShadowDOM();0===this.children.length?(this._observer=new MutationObserver(((t,e)=>{void 0!==this._timer&&clearTimeout(this._timer),this._timer=window.setTimeout((()=>{this._timer=void 0,this.layout2nodes(this.children,this.root),this.referenceActions(),this.createShadowDOM();}),100);})),this._observer.observe(this,{childList:!0,subtree:!0})):(this.layout2nodes(this.children,this.root),this.referenceActions(),this.createShadowDOM());}layout2nodes(t,e){let i=e.down;for(let o of t){let t;switch(o.nodeName){case"TOAD-MENUSPACER":t=new ot("","","","spacer");break;case"TOAD-MENUENTRY":t=new ot(p(o,"name"),p(o,"label"),m(o,"shortcut"),m(o,"type"),m(o,"model"));}if(t&&(t.parent=e,i?i.next=t:e.down=t,i=t),!i)throw Error("yikes");this.layout2nodes(o.children,i);}}config2nodes(t,e){let i=e.down;for(let o of t){let t;if(t=!0===o.space?new ot("","","","spacer"):new ot(o.name,o.label,o.shortcut,o.type,o.model),t&&(t.parent=e,i?i.next=t:e.down=t,i=t),!i)throw Error("yikes");o.sub&&this.config2nodes(o.sub,i);}}referenceActions(){}findNode(t,e){let i=t.indexOf("|"),o=-1==i?t:t.substr(0,i),s=-1==i?"":t.substr(i+1);e||(e=this.root);for(let t=e.down;t;t=t.next)if(t.title==o)return t.down?this.findNode(s,t):t}createShadowDOM(){this.view=document.createElement("div"),this.view.classList.add("menu-bar");let t=this.root.down;for(;t;)t.isAvailable()?t.createWindowAt(this,this.view):t.deleteWindow(),t=t.next;this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(K,!0)),this.shadowRoot.appendChild(this.view);}}class nt extends HTMLElement{}function lt(t){if(void 0===t)return;const e=mt(t);if(void 0===e)return;const i=e.getBoundingClientRect(),o=t.getBoundingClientRect();if(e!==document.body){const{x:t,y:s}=function(t,e,i){const o=16,s=i.left+t.scrollLeft-e.left-o,n=i.right+t.scrollLeft-e.left+o,l=i.top+t.scrollTop-e.top-o,r=i.bottom+t.scrollTop-e.top+o,d=t.clientWidth,h=t.clientHeight;var a=t.scrollLeft,c=t.scrollTop;n-s-2*o>d?a=s:n>t.scrollLeft+d?a=n-d:s<t.scrollLeft&&(a=s);r-l-2*o>h?c=l:r>t.scrollTop+h?c=r-h:l<t.scrollTop&&(c=l);return a=Math.max(0,a),c=Math.max(0,c),{x:a,y:c}}(e,i,o);!function(t,e,i){let o,s,n=rt.get(t);void 0===n?(n={x:e,y:i},rt.set(t,n)):(n.x=e,n.y=i);t===document.body?(o=window.scrollX||window.pageXOffset,s=window.scrollY||window.pageYOffset):(o=t.scrollLeft,s=t.scrollTop);const l=e-o,r=i-s;if(0===l&&0===r)return void rt.delete(t);d=d=>{if(n.x!==e||n.y!==i)return !1;const h=o+d*l,a=s+d*r;return t===document.body?window.scrollTo(h,a):(t.scrollLeft=h,t.scrollTop=a),1===d&&rt.delete(t),!0},setTimeout((()=>{window.requestAnimationFrame(ht.bind(window,d,void 0,void 0));}),0);var d;}(e,t,s),"fixed"!==window.getComputedStyle(e).position&&window.scrollBy({left:i.left,top:i.top,behavior:"smooth"});}else window.scrollBy({left:o.left,top:o.top,behavior:"smooth"});}const rt=new Map;let dt=0;function ht(t,e,i){void 0===e&&(e=Date.now(),i=++dt);let o=(Date.now()-e)/468;o=o>1?1:o;const s=(n=o,.5*(1-Math.cos(Math.PI*n)));var n;!1!==t(s)&&s<1&&window.requestAnimationFrame(ht.bind(window,t,e,i));}var at,ct,ut,pt=(at=window.navigator.userAgent,new RegExp(["MSIE ","Trident/","Edge/"].join("|")).test(at)?1:0);function mt(t){for(;t!==document.body&&!1===wt(t);){if(null===t.parentElement)return;t=t.parentElement;}return t}function wt(t){const e=gt(t,"Y")&&bt(t,"Y"),i=gt(t,"X")&&bt(t,"X");return e||i}function gt(t,e){return "X"===e?t.clientWidth+pt<t.scrollWidth:t.clientHeight+pt<t.scrollHeight}function bt(t,e){const i=window.getComputedStyle(t,null)["overflow"+e];return "auto"===i||"scroll"===i}class ft extends s{isEmpty(){return 0===this.colCount&&0===this.rowCount}}t.TableEditMode=void 0,(ct=t.TableEditMode||(t.TableEditMode={}))[ct.EDIT_CELL=0]="EDIT_CELL",ct[ct.SELECT_CELL=1]="SELECT_CELL",ct[ct.SELECT_ROW=2]="SELECT_ROW";class vt{constructor(t,e){this.col=t,this.row=e;}}class yt extends s{constructor(e=t.TableEditMode.EDIT_CELL){super(),this.mode=e,this._value=new vt(0,0);}set col(t){this._value.col!==t&&(this._value.col=t,this.modified.trigger());}get col(){return this._value.col}set row(t){this._value.row!==t&&(this._value.row=t,this.modified.trigger());}get row(){return this._value.row}set value(t){this._value.col===t.col&&this._value.row===t.row||(this._value=t,this.modified.trigger());}get value(){return this._value}}class xt extends ft{constructor(t,e){super(),this.nodeClass=t;}}class Ct{get colCount(){return void 0===this.model?0:this.model.colCount}get rowCount(){return void 0===this.model?0:this.model.rowCount}setModel(t){this.model=t;}getColumnHead(t){}getRowHead(t){}getDisplayCell(t,e){}getEditorCell(t,e){}isViewCompact(){return !1}static register(t,e,i){let o=Ct.modelToAdapter.get(e);if(void 0===o&&(o=new Map,Ct.modelToAdapter.set(e,o)),void 0!==o.get(i))throw Error("attempt to redefine existing table adapter");o.set(i,t);}static unbind(){Ct.modelToAdapter.clear();}static lookup(t){var e,i;let o;o=t instanceof xt?t.nodeClass:void 0;let s=null===(e=Ct.modelToAdapter.get(Object.getPrototypeOf(t).constructor))||void 0===e?void 0:e.get(o);if(void 0===s)for(let e of Ct.modelToAdapter.keys())if(t instanceof e){s=null===(i=Ct.modelToAdapter.get(e))||void 0===i?void 0:i.get(o);break}if(void 0===s){let e=`TableAdapter.lookup(): Did not find an adapter for model of type ${t.constructor.name}`;e+=`\n    Requested adapter: model=${t.constructor.name}, type=${o.name}\n    Available adapters:`;for(const[t,i]of Ct.modelToAdapter)for(const[o,s]of i)e+=`\n        model=${t.name}, type=${o}`;throw Error(e)}return s}}Ct.modelToAdapter=new Map,t.TableEventType=void 0,(ut=t.TableEventType||(t.TableEventType={}))[ut.INSERT_ROW=0]="INSERT_ROW",ut[ut.REMOVE_ROW=1]="REMOVE_ROW",ut[ut.INSERT_COL=2]="INSERT_COL",ut[ut.REMOVE_COL=3]="REMOVE_COL",ut[ut.CELL_CHANGED=4]="CELL_CHANGED",ut[ut.RESIZE_ROW=5]="RESIZE_ROW",ut[ut.RESIZE_COL=6]="RESIZE_COL",ut[ut.CHANGED=7]="CHANGED";let kt=document.createElement("style");kt.textContent="\n:host {\n  position: relative;\n  display: inline-block;\n  border: 1px #ccc solid;\n  border-radius: 3px;\n  outline-offset: -2px;\n  font-family: var(--toad-font-family, sans-serif);\n  font-size: var(--toad-font-size, 12px);\n  background: #fff;\n}\n:host:focus .cells tr.selected,\n:host:focus .cells td.selected {\n  background: #0069d4;\n  color: #fff;\n}\n\n.colhead {\n  position: absolute;\n  top: 0;\n  overflow: hidden;\n}\n.rowhead {\n  position: absolute;\n  left: 0;\n  overflow: hidden;\n}\n.cells {\n  position: absolute;\n\n  bottom: 0;\n  right: 0;\n\n  overflow: auto;\n  /* resize: both; */\n  cursor: default;\n}\n\n:host > div > table, :host > table {\n  border-collapse: collapse;\n  border-spacing: 0;\n  border: none 0px;\n}\n.colhead > table, .rowhead > table {\n  background: #e0e0e0;\n}\n\n.colhead th,\n.rowhead th,\n.cells td,\n.hiddenSizeCheck td {\n  letter-spacing: 0;  \n  overflow: hidden;   \n  padding: 2px;\n  margin: 0px;\n\n  /* this might not be always desirable; */\n  white-space: nowrap; \n\n  border: solid 1px #ccc;\n}\n\n.colhead th, .rowhead th {\n  z-index: 1;\n}\n\n.bodyrow td {\n  padding-top: 0px;\n  padding-bottom: 0px;\n  border-top: none 0px;\n  border-bottom: none 0px;\n}\n\n.cells tr:nth-child(even) {\n  background: var(--toad-table-even-row, #f5f5f5);\n}\n.cells tr:nth-child(odd) {\n  background: var(--toad-table-odd-row, #ffffff);\n}\n\n.cells td:nth-child(1) {\n  border-left: none;\n}\n.cells tr:nth-child(2) td {\n  border-top: none;\n}\n\n.cells tr.selected,\n.cells tr td.selected {\n  background: #808080;\n  color: #fff;\n}\n\n.compact.colhead th,\n.compact.rowhead th,\n.compact.hiddenSizeCheck * th {\n  border-color: none;\n  border-style: none;\n  border-width: 0;\n  padding: 0px;\n}\n.compact.cells * td,\n.compact.hiddenSizeCheck * td {\n  border-color: none;\n  border-style: none;\n  border-width: 0;\n  padding: 0px;\n}\n\n.zeroSize {\n  width: 0;\n  height: 0;\n  margin: 0;\n  padding: 0;\n  border: none;\n}\n\n.inputDiv { \n  position: relative;\n  background: #fff;\n  border: none;\n  opacity: 0;\n}\n\n.hiddenSizeCheck {\n  position: absolute;\n  opacity: 0;\n}\n";class Et extends HTMLDivElement{static init(t){t.addEventListener("focusin",(e=>{if(t.style.opacity="1",e.target&&e.relatedTarget)try{!function(t,e){let i,o=t;i=t;let s=new Map;for(;o=i,i=i.parentNode,i;)s.set(i,o);let n=e;for(i=e;i;){if(n=i,i=i.parentNode,!i)throw Error("isNodeBeforeNode(first, second): nodes have no common parent");let t=s.get(i);if(t){o=t;break}}for(let t of i.childNodes){if(t===o)return !0;if(t===n)return !1}throw Error("isNodeBeforeNode(first, second): couldn't determine order of nodes")}(e.relatedTarget,t)?t.focusInFromRight&&t.focusInFromRight():t.focusInFromLeft&&t.focusInFromLeft();}catch(t){}})),t.addEventListener("focusout",(e=>{t.style.opacity="0";})),t.style.display="none",t.setViewRect=Et.prototype.setViewRect,t.unsetViewRect=Et.prototype.unsetViewRect,t.setEditView=Et.prototype.setEditView,t.adjustToCell=Et.prototype.adjustToCell;}setEditView(t){const e=mt(this);let i=0,o=0;void 0!==e&&([i,o]=[e.scrollLeft,e.scrollTop]),this.hasChildNodes()?(function(t){if(!document.hasFocus())return !1;let e=document.activeElement;for(;null!==e;){if(e===t)return !0;if(null===e.shadowRoot)break;e=e.shadowRoot.activeElement;}return !1}(this.children[0])&&this.children[0].dispatchEvent(new FocusEvent("blur")),t?this.replaceChild(t,this.childNodes[0]):this.removeChild(this.childNodes[0])):t&&this.appendChild(t),this.style.display=t?"":"none",void 0!==e&&(e.scrollLeft=i,e.scrollTop=o);}adjustToCell(t){if(!this.hasChildNodes())return void this.unsetViewRect();if(void 0===t)return;let e=t.getBoundingClientRect(),i=t.parentElement;if(null===i)return;let o,s,n=i.parentElement;if(null===n)return;navigator.userAgent.indexOf("Chrome")>-1?(s=t.offsetLeft+2,o=t.offsetTop-n.clientHeight):(s=t.offsetLeft+.5,o=t.offsetTop-n.clientHeight);const l=t.clientWidth-g(t),r=e.height;this.setViewRect(o,s,l,r);}setViewRect(t,e,i,o){this.style.display="",this.style.opacity="1",this.style.top=`${t}px`,this.style.left=`${e}px`,this.style.width=`${i}px`,this.style.height=`${o}px`;}unsetViewRect(){this.style.opacity="0",this.style.display="none",this.style.top="",this.style.left="",this.style.width="",this.style.height="";}}var Tt,At;!function(t){t[t.BEFORE_REMOVED_AREA=0]="BEFORE_REMOVED_AREA",t[t.INSIDE_REMOVED_AREA=1]="INSIDE_REMOVED_AREA",t[t.INSIDE_REMOVED_AREA_AND_NO_FURTHER_ROWS=2]="INSIDE_REMOVED_AREA_AND_NO_FURTHER_ROWS",t[t.BEHIND_REMOVED_AREA=3]="BEHIND_REMOVED_AREA";}(Tt||(Tt={}));class Rt extends D{constructor(t,e){super(),this.rowAnimationHeight=0,this.hadFocus=!1,this.table=t,this.event=e;}prepare(){this.hadFocus=this.table.hasFocus();let t=0;if(this.table.editView&&void 0!==this.table.selectionModel)if(this.table.selectionModel.row<this.event.index)this.selectionIs=Tt.BEFORE_REMOVED_AREA;else if(this.table.selectionModel.row<=this.event.index+this.event.size){const e=this.table.bodyBody.children.length-1;if(this.event.index+this.event.size>=e){this.selectionIs=Tt.INSIDE_REMOVED_AREA_AND_NO_FURTHER_ROWS;for(let e=this.event.index;e<=this.table.selectionModel.row;++e){t-=this.table.bodyBody.children[e+1].clientHeight;}0===this.event.index?this.table.selectionModel.row=0:this.table.selectionModel.row=this.event.index-1;}else {this.selectionIs=Tt.INSIDE_REMOVED_AREA;for(let e=this.event.index+1;e<=this.table.selectionModel.row;++e){t-=this.table.bodyBody.children[e+1].clientHeight;}this.table.selectionModel.row=this.event.index,this.table.prepareInputOverlayForPosition({col:this.table.selectionModel.value.col,row:this.table.selectionModel.value.row});}}else this.table.selectionModel.row-=this.event.size,this.selectionIs=Tt.BEHIND_REMOVED_AREA;this.rowAnimationHeight=0;for(let t=0;t<this.event.size;++t){const e=this.table.bodyBody.children[this.event.index+t+1];this.rowAnimationHeight+=e.clientHeight;}this.table.rowAnimationHeight=this.rowAnimationHeight;for(let t=1;t<this.event.size;++t)this.table.rowHeadHead.deleteRow(this.event.index+1),this.table.bodyBody.deleteRow(this.event.index+2);this.trAnimationHead=this.table.rowHeadHead.children[this.event.index],this.trAnimationBody=this.table.bodyBody.children[this.event.index+1],this.trAnimationHead.style.minHeight=this.trAnimationHead.style.maxHeight="",this.trAnimationBody.style.minHeight=this.trAnimationBody.style.maxHeight="",this.trAnimationHead.style.height=`${this.rowAnimationHeight}px`,this.trAnimationBody.style.height=`${this.rowAnimationHeight}px`;const e="url(\"data:image/svg+xml;utf8,<svg width='3' height='3' xmlns='http://www.w3.org/2000/svg'><line shape-rendering='crispEdges' x1='-1' y1='-1' x2='5' y2='5' stroke='%23888' /></svg>\")";for(;this.trAnimationHead.childNodes.length>0;)this.trAnimationHead.removeChild(this.trAnimationHead.childNodes[0]);for(;this.trAnimationBody.childNodes.length>0;)this.trAnimationBody.removeChild(this.trAnimationBody.childNodes[0]);this.trAnimationHead.appendChild(C("th",{style:{padding:"0"}})),this.trAnimationHead.style.background=e;for(let t=0;t<this.table.adapter.colCount;++t)this.trAnimationBody.appendChild(C("td",{style:{padding:"0"}})),this.trAnimationBody.style.background=e;const i=this.table.inputOverlay.style.top;i.length>2&&(this.overlayTop=Number.parseFloat(i.substr(0,i.length-2))+t);}animationFrame(t){const e=1-t;if(this.trAnimationBody.style.height=this.trAnimationHead.style.height=e*this.rowAnimationHeight+"px",this.overlayTop)switch(this.selectionIs){case Tt.BEFORE_REMOVED_AREA:this.table.inputOverlay.style.top=`${this.overlayTop+t*this.rowAnimationHeight}px`;break;case Tt.INSIDE_REMOVED_AREA:this.table.inputOverlay.style.top=`${this.overlayTop+this.rowAnimationHeight}px`;break;case Tt.INSIDE_REMOVED_AREA_AND_NO_FURTHER_ROWS:this.table.inputOverlay.style.top=`${this.overlayTop+t*this.rowAnimationHeight}px`;break;case Tt.BEHIND_REMOVED_AREA:this.table.inputOverlay.style.top=`${this.overlayTop}px`;}}lastFrame(){this.table.rowHeadHead.deleteRow(this.event.index),this.table.bodyBody.deleteRow(this.event.index+1);}}class Mt extends D{constructor(t,e){super(),this.rowAnimationHeight=0,this.trHead=[],this.trBody=[],this.table=t,this.event=e;}prepare(){for(let t=0;t<this.event.size;++t){const e=this.table.createDOMRowHeaderRow(this.event.index);this.table.hiddenSizeCheckRowHead.appendChild(e),this.trHead.push(e);const i=this.table.createDOMBodyRow(this.event.index+t);this.table.hiddenSizeCheckBody.appendChild(i),this.trBody.push(i);}const t="url(\"data:image/svg+xml;utf8,<svg width='3' height='3' xmlns='http://www.w3.org/2000/svg'><line shape-rendering='crispEdges' x1='-1' y1='-1' x2='5' y2='5' stroke='%23888' /></svg>\")";this.trAnimationHead=C("tr",Object.assign({style:{height:"0px",background:t}},{children:C("th",{style:{padding:"0"}})})),this.table.rowHeadHead.insertBefore(this.trAnimationHead,this.table.rowHeadHead.children[this.event.index]),this.trAnimationBody=C("tr",{style:{height:"0px",background:t}});for(let e=0;e<this.table.adapter.colCount;++e)this.trAnimationBody.appendChild(C("td",{style:{padding:"0"}})),this.trAnimationBody.style.background=t;this.table.bodyBody.insertBefore(this.trAnimationBody,this.table.bodyBody.children[this.event.index+1]);}firstFrame(){this.table.rowAnimationHeight=this.rowAnimationHeight=Math.max(this.table.hiddenSizeCheckBody.clientHeight,this.table.hiddenSizeCheckRowHead.clientHeight);}animationFrame(t){const e=`${Math.round(t*this.rowAnimationHeight)}px`;if(this.trAnimationHead.style.height=this.trAnimationBody.style.height=e,void 0!==this.table.selectionModel&&this.table.selectionModel.row<this.event.index){const t=this.table.getCellAt(this.table.selectionModel.value.col,this.table.selectionModel.value.row);this.table.inputOverlay.adjustToCell(t);}}lastFrame(){for(let t=0;t<this.event.size;++t){const e=`${Math.max(this.trHead[t].clientHeight,this.trBody[t].clientHeight)}px`,i=this.trHead[t].style;i.height=i.minHeight=i.maxHeight=e;const o=this.trHead[t].style;o.height=o.minHeight=o.maxHeight=e;}this.table.rowHeadHead.replaceChild(this.trHead[0],this.trAnimationHead),this.table.bodyBody.replaceChild(this.trBody[0],this.trAnimationBody);for(let t=1;t<this.event.size;++t)this.table.rowHeadHead.insertBefore(this.trHead[t],this.trHead[t-1].nextSibling),this.table.bodyBody.insertBefore(this.trBody[t],this.trBody[t-1].nextSibling);if(void 0!==this.table.selectionModel&&this.table.selectionModel.row>=this.event.index&&(this.table.selectionModel.row+=this.event.size),this.table.editView&&void 0!==this.table.selectionModel&&this.table.selectionModel.row<this.event.index){const t=this.table.getCellAt(this.table.selectionModel.value.col,this.table.selectionModel.value.row);this.table.inputOverlay.adjustToCell(t);}this.table.adjustLayout(void 0);}}!function(t){t[t.LAYOUT=0]="LAYOUT",t[t.SELECTION=1]="SELECTION",t[t.USER=2]="USER";}(At||(At={}));class Ot extends H{constructor(){super(),this.animator=new _,this.rowAnimationHeight=0,this.insideGoTo=!1,this.rootDiv=k(x,{children:[C("div",Object.assign({set:y(this,"rowHeadDiv"),class:"rowhead"},{children:C("table",Object.assign({set:y(this,"rowHeadTable")},{children:C("thead",{set:y(this,"rowHeadHead")})}))})),C("div",Object.assign({set:y(this,"colHeadDiv"),class:"colhead"},{children:C("table",Object.assign({set:y(this,"colHeadTable")},{children:C("thead",{children:C("tr",{set:y(this,"colHeadRow")})})}))})),k("div",Object.assign({set:y(this,"scrollDiv"),class:"cells"},{children:[C("table",Object.assign({set:y(this,"bodyTable")},{children:C("tbody",Object.assign({set:y(this,"bodyBody")},{children:C("tr",{set:y(this,"bodyRow"),class:"bodyrow"})}))})),C("div",Object.assign({class:"zeroSize"},{children:C("div",{set:y(this,"inputOverlay"),class:"inputDiv"})}))]})),k("table",Object.assign({class:"hiddenSizeCheck"},{children:[C("thead",{set:y(this,"hiddenSizeCheckRowHead")}),C("tbody",{set:y(this,"hiddenSizeCheckBody")})]}))]}),this.onkeydown=this.onRootDivKeyDown,this.scrollDiv.onscroll=()=>{this.rowHeadDiv.scrollTop=this.scrollDiv.scrollTop,this.colHeadDiv.scrollLeft=this.scrollDiv.scrollLeft;},this.bodyTable.onmousedown=t=>{t.target?"TD"===t.target.tagName?(t.preventDefault(),this.log(At.USER,"bodyTable.onmousedown() -> goToCell(event.target)"),this.goToCell(t.target)):console.log(`bodyTable.onmousedown() -> target is not TD but ${t.target.tagName}`):console.log("bodyTable.onmousedown() -> no target");},Et.init(this.inputOverlay),this.inputOverlay.focusInFromLeft=()=>{this.insideGoTo||this.goToFirstCell();},this.inputOverlay.focusInFromRight=()=>{this.insideGoTo||this.goToLastCell();},this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(kt,!0)),this.rootDiv.appendTo(this.shadowRoot);}log(t,e){}updateModel(){}setModel(t){if(!t)return this.selectionModel&&this.selectionModel.modified.remove(this),this.model=void 0,this.selectionModel=new yt,this.selectionModel.modified.add((()=>{this.createSelection();}),this),void this.updateView();if(t instanceof yt)return this.selectionModel&&this.selectionModel.modified.remove(this),this.selectionModel=t,this.createSelection(),void this.selectionModel.modified.add((()=>{this.createSelection();}),this);if(t instanceof ft){this.model=t,this.model.modified.add((t=>{this.modelChanged(t);}),this);const e=Ct.lookup(t);try{this.adapter=new e;}catch(t){throw console.log(`TableView.setModel(): failed to instantiate table adapter: ${t}`),console.log("setting TypeScript's target to 'es6' might help"),t}return this.adapter.setModel(t),this.updateCompact(),void this.updateView()}throw Error("TableView.setModel(): unexpected model of type "+t.constructor.name)}updateCompact(){var t;(null===(t=this.adapter)||void 0===t?void 0:t.isViewCompact())?this.rootDiv.forEach((t=>t.classList.add("compact"))):this.rootDiv.forEach((t=>t.classList.remove("compact")));}modelChanged(e){switch(e.type){case t.TableEventType.INSERT_ROW:this.animator.run(new Mt(this,e));break;case t.TableEventType.REMOVE_ROW:this.animator.run(new Rt(this,e));break;case t.TableEventType.CELL_CHANGED:this.onFieldViewBlur(new vt(e.col,e.row));}}updateView(){try{if(!this.model)return;this.createColumnHeader(),this.createRowHeader(),this.createBody(),this.createSelection(),setTimeout((()=>{this.model&&this.adjustLayoutAfterRender();}),0);}catch(t){throw console.log("caught exception in updateView"),console.log(t.stack),t}}createColumnHeader(){this.updateHeader(!0);}createRowHeader(){this.updateHeader(!1);}updateHeader(t){if(!this.model)throw Error("TableView.updateHeader(): no model");if(!this.adapter)throw Error("TableView.updateHeader(): no adapter");let e,i,o;!0===t?(e=this.colHeadTable,i=this.colHeadRow,o=this.adapter.colCount):(e=this.rowHeadTable,i=this.rowHeadHead,o=this.adapter.rowCount);let s,n=!1;for(;i.children.length>o+1;)i.removeChild(i.children[i.children.length-1]);for(let e=0;e<o;++e){let o;if(e>=i.children.length)if(o=C("th",{}),t)i.appendChild(o);else {const t=C("tr",{});t.appendChild(o),i.appendChild(t);}else o=t?i.children[e]:i.children[e].children[0],o.style.minWidth="",o.style.border="";const s=t?this.adapter.getColumnHead(e):this.adapter.getRowHead(e);void 0!==s?o.appendChild(s):n=!0;}if(i.children.length<o+1)if(s=C("th",{}),t)i.appendChild(s);else {const t=C("tr",{});t.appendChild(s),i.appendChild(t);}else s=t?i.children[i.children.length-1]:i.children[i.children.length-1].children[0];t?(s.innerText="",s.style.minWidth="777px"):s.parentElement.style.height="777px",s.style.border="0px none",e.style.display=n?"none":"";}createBody(){if(!this.model)throw Error("TableView.updateBody(): no model");if(!this.adapter)throw Error("TableView.updateBody(): no adapter");for(;this.bodyRow.children.length>this.adapter.colCount;)this.bodyRow.removeChild(this.bodyRow.children[this.bodyRow.children.length-1]);for(;this.bodyRow.children.length<this.adapter.colCount;)this.bodyRow.appendChild(C("td",{}));for(;this.bodyBody.children.length-1>this.adapter.rowCount;)this.bodyBody.removeChild(this.bodyBody.children[this.bodyBody.children.length-1]);for(let t=0;t<this.adapter.rowCount;++t){let e;for(t+1>=this.bodyBody.children.length?(e=C("tr",{}),this.bodyBody.appendChild(e)):e=this.bodyBody.children[t+1];e.children.length>this.adapter.colCount;)e.removeChild(e.children[e.children.length-1]);for(let i=0;i<this.adapter.colCount;++i){let o;i>=e.children.length?(o=C("td",{}),e.appendChild(o)):o=e.children[i],o.style.width="";const s=this.adapter.getDisplayCell(i,t);s&&(Array.isArray(s)?s.forEach((t=>o.appendChild(t))):o.appendChild(s));}if("100%"===this.style.width){e.children[e.children.length-1].style.width="100%";}}}createDOMRowHeaderRow(t){if(!this.model||!this.adapter)throw Error();const e=this.adapter.getRowHead(t);return C("tr",void 0===e?{}:{children:C("th",{children:e})})}createDOMBodyRow(t){if(!this.model||!this.adapter)throw Error();const e=C("tr",{});for(let i=0;i<this.adapter.colCount;++i){let o;i>=e.children.length?(o=C("td",{}),e.appendChild(o)):o=e.children[i],o.style.width="";const s=this.adapter.getDisplayCell(i,t);s&&(Array.isArray(s)?s.forEach((t=>o.appendChild(t))):o.appendChild(s));}if("100%"===this.style.width){e.children[e.children.length-1].style.width="100%";}return e}createSelection(){if(void 0!==this.selectionModel)switch(this.selectionModel.mode){case t.TableEditMode.EDIT_CELL:this.log(At.SELECTION,`TableView.createSelection(): mode=EDIT_CELL, selection=${this.selectionModel.col}, ${this.selectionModel.row}`),this.prepareInputOverlayForPosition(new vt(this.selectionModel.col,this.selectionModel.row)),delete this.rootDiv.tabIndex;break;case t.TableEditMode.SELECT_CELL:{this.log(At.SELECTION,`TableView.createSelection(): mode=SELECT_CELL, selection=${this.selectionModel.col}, ${this.selectionModel.row}`);let t=this.bodyBody.querySelectorAll("tbody > tr > td.selected");for(let e of t)e.classList.remove("selected");this.toggleCellSelection(this.selectionModel.value,!0),this.tabIndex=0;break}case t.TableEditMode.SELECT_ROW:{this.log(At.SELECTION,`TableView.createSelection(): mode=SELECT_ROW, selection=${this.selectionModel.col}, ${this.selectionModel.row}`);let t=this.bodyBody.querySelectorAll("tbody > tr.selected");for(let e of t)e.classList.remove("selected");this.toggleRowSelection(this.selectionModel.value.row,!0),this.tabIndex=0;break}}}adjustLayout(t){this.unadjustLayoutBeforeRender(t),setTimeout((()=>{this.adjustLayoutAfterRender();}),0);}unadjustLayoutBeforeRender(t){if(void 0===t)for(let t=0;t<this.adapter.colCount;++t)this.unadjustLayoutColumnBeforeRender(t);else this.unadjustLayoutColumnBeforeRender(t.col);}unadjustLayoutColumnBeforeRender(t){const e=this.colHeadRow.children[t],i=this.bodyRow.children[t];e.style.width=e.style.minWidth=e.style.maxWidth=i.style.width=i.style.minWidth=i.style.maxWidth="";}adjustLayoutAfterRender(){if(!this.model)throw Error("TableView.adjustLayoutAfterRender(): no model");if(!this.adapter)throw Error("TableView.adjustLayoutAfterRender(): no adapter");this.log(At.LAYOUT,"TableView.adjustLayoutAfterRender()");const t=this.colHeadRow.children,e=this.rowHeadHead.children,i=this.bodyRow.children;for(let e=0;e<this.adapter.colCount;++e){const o=t[e],s=i[e];if(""===o.style.width){const t=o.getBoundingClientRect().width-g(o),e=s.getBoundingClientRect().width-g(s),i=Math.max(t,e);o.style.width=o.style.minWidth=o.style.maxWidth=`${i}px`,s.style.width=s.style.minWidth=s.style.maxWidth=`${i}px`;}}this.adapter.rowCount!=this.bodyBody.children.length-1&&this.log(At.LAYOUT,`adjustLayoutAfterRender(): bodyBody has ${this.bodyBody.children.length-1} rows while model has ${this.adapter.rowCount} rows`);for(let t=0;t<this.bodyBody.children.length-1;++t){const i=e[t],o=this.bodyBody.children[t+1];let s=i.clientHeight-b(i),n=o.clientHeight-b(o),l=Math.max(s,n);i.style.height=i.style.minHeight=i.style.maxHeight=o.style.height=o.style.minHeight=o.style.maxHeight=`${l}px`;}const o=this.colHeadDiv.getBoundingClientRect(),s=this.rowHeadDiv.getBoundingClientRect();let n=this.scrollDiv.getBoundingClientRect(),l=this.bodyTable.getBoundingClientRect();const r=window.getComputedStyle(this),d=r.width,h=r.height;this.style.overflowX="",this.style.overflowY="";let a=!1,c=!1;if("0px"===d){this.log(At.LAYOUT,"  TableView has no width specified");const t=this.parentElement;if(t){const e=s.width+l.width;e<t.clientWidth?(this.log(At.LAYOUT,`    parent is wide enough for content, set TableView width to ${e}px`),this.style.width=e+"px",this.scrollDiv.style.overflowX="hidden",a=!0):(this.log(At.LAYOUT,`    parent isn't wide enough for content, set TableView width to parent's width of ${t.clientWidth-2}px`),this.style.width=t.clientWidth-2+"px");}}if("0px"===h){this.log(At.LAYOUT,"  TableView has no height specified");if(this.parentElement){let t=o.height+l.height;a||(t+=15);const e=window.innerHeight;t<e?(this.log(At.LAYOUT,`    parent IS high enough for content, set TableView height to ${t}px`),this.style.height=t+"px",this.scrollDiv.style.overflowY="hidden",c=!0):(this.log(At.LAYOUT,`    parent is NOT high enough for content, default TableView height to ${e}px`),this.style.height=e+"px");}}let u=this.getBoundingClientRect();this.clientLeft,u.x,this.clientTop,u.y;const p=this.clientWidth,m=this.clientHeight;this.log(At.LAYOUT,"  adjust the bodyDiv to setup the scrollbars"),a?(this.log(At.LAYOUT,"    table IS wide enough for content, do not set scrollDiv's width"),this.scrollDiv.style.width=""):(this.log(At.LAYOUT,`    table is NOT wide enough for content, set scroll width to ${p-s.width}px`),this.scrollDiv.style.width=p-s.width+"px"),c?(this.log(At.LAYOUT,"    table IS heigh enough for content, do not set scrollDiv's height"),this.scrollDiv.style.height=""):(this.log(At.LAYOUT,`    table is NOT high enough for content, set scroll height to ${m-o.height}px`),this.scrollDiv.style.height=m-o.height+"px"),this.log(At.LAYOUT,"  figure out how much space the scrollbars take"),n=this.scrollDiv.getBoundingClientRect();let w=c?0:n.width-this.scrollDiv.clientWidth,f=a?0:n.height-this.scrollDiv.clientHeight;this.log(At.LAYOUT,`    width ${w}, height ${f}`),this.scrollDiv.style.top=o.height+"px",this.scrollDiv.style.left=s.width+"px",this.colHeadDiv.style.top="0",this.colHeadDiv.style.left=s.width-1+"px",this.log(At.LAYOUT,`  set colHeadDiv = ${p} (host width) - ${s.width} (rowHeadDiv width) - ${w} (vertical scrollbar width) = ${p-s.width-w+1}`),this.colHeadDiv.style.width=p-s.width-w+1+"px",this.rowHeadDiv.style.top=o.height+"px",this.rowHeadDiv.style.left="0",this.rowHeadDiv.style.height=m-o.height-f+"px";}prepareInputOverlayForCell(t){void 0!==t&&"TD"===t.tagName&&this.prepareInputOverlayForPosition(this.getCellPosition(t));}prepareInputOverlayForPosition(t){if(!this.adapter)return;let e=this.hasFocus();this.log(At.USER,`TableView.prepareInputOverlayForPosition(${t.col}, ${t.row})`),this.setSelectionTo(t);let i=this.adapter.getEditorCell(t.col,t.row);if(this.log(At.SELECTION,`prepareInputOverlayForPosition() got editView=${i}`),!i)return void this.inputOverlay.setEditView(void 0);this.editView=i,i.classList.add("embedded"),i.onkeydown=e=>{this.onFieldViewKeyDown(e,t);},this.inputOverlay.setEditView(i);const o=this.getCellAt(t.col,t.row);setTimeout((()=>{this.inputOverlay.adjustToCell(o),e&&this.focus();}),0);}setSelectionTo(e){if(this.selectionModel)switch(this.selectionModel.mode){case t.TableEditMode.EDIT_CELL:this.selectionModel.value=e;break;case t.TableEditMode.SELECT_CELL:return this.toggleCellSelection(this.selectionModel.value,!1),this.selectionModel.value=e,void this.toggleCellSelection(this.selectionModel.value,!0);case t.TableEditMode.SELECT_ROW:return this.toggleRowSelection(this.selectionModel.value.row,!1),this.selectionModel.value.row=e.row,void this.toggleRowSelection(this.selectionModel.value.row,!0)}}focus(){const{x:t,y:e}={x:this.scrollDiv.scrollLeft,y:this.scrollDiv.scrollTop};this.editView?this.editView.focus({preventScroll:!0}):super.focus({preventScroll:!0}),this.scrollDiv.scrollLeft=t,this.scrollDiv.scrollTop=e;}hasFocus(){return null!==document.activeElement&&document.activeElement===this}toggleCellSelection(t,e){if(t.col>=this.adapter.colCount||t.row>=this.adapter.rowCount)return;let i=this.bodyBody.children[t.row+1].children[t.col];i.classList.toggle("selected",e),e&&lt(i);}toggleRowSelection(t,e){if(t>=this.adapter.rowCount)return;let i=this.bodyBody.children[1+this.selectionModel.value.row];i.classList.toggle("selected",e),e&&lt(i);}goTo(t,e){this.insideGoTo=!0,this.prepareInputOverlayForPosition(new vt(t,e)),this.focus(),lt(this.getCellAt(t,e)),this.insideGoTo=!1;}goToCell(t){t&&(this.insideGoTo=!0,this.prepareInputOverlayForCell(t),this.focus(),lt(t),this.insideGoTo=!1);}goToFirstCell(){this.goTo(0,0);}goToLastCell(){this.adapter&&this.goTo(this.adapter.colCount-1,this.adapter.rowCount-1);}getCellAt(t,e){return this.bodyBody.children[e+1].children[t]}getCellPosition(t){let e,i;for(e=0;e<this.adapter.colCount&&t.parentElement.children[e]!==t;++e);for(i=1;i<this.adapter.rowCount+1&&t.parentElement.parentElement.children[i]!==t.parentElement;++i);return --i,new vt(e,i)}onRootDivKeyDown(e){if(this.selectionModel)switch(this.selectionModel.mode){case t.TableEditMode.SELECT_ROW:{let t=this.selectionModel.value.row;switch(e.key){case"ArrowDown":t+1<this.adapter.rowCount&&++t;break;case"ArrowUp":t>0&&--t;}t!=this.selectionModel.value.row&&(this.toggleRowSelection(this.selectionModel.value.row,!1),this.selectionModel.row=t,this.toggleRowSelection(this.selectionModel.value.row,!0));}break;case t.TableEditMode.SELECT_CELL:{let t={col:this.selectionModel.col,row:this.selectionModel.row};switch(e.key){case"ArrowRight":t.col+1<this.adapter.colCount&&++t.col;break;case"ArrowLeft":t.col>0&&--t.col;break;case"ArrowDown":t.row+1<this.adapter.rowCount&&++t.row;break;case"ArrowUp":t.row>0&&--t.row;}t.col==this.selectionModel.col&&t.row==this.selectionModel.row||(this.toggleCellSelection(this.selectionModel.value,!1),this.selectionModel.value=t,this.toggleCellSelection(this.selectionModel.value,!0));}}}onFieldViewKeyDown(t,e){switch(t.key){case"ArrowDown":if(e.row+1>=this.adapter.rowCount)break;t.preventDefault(),this.goTo(e.col,e.row+1);break;case"ArrowUp":if(0===e.row)break;t.preventDefault(),this.goTo(e.col,e.row-1);break;case"Tab":t.shiftKey?e.col>0?(t.preventDefault(),this.goTo(e.col-1,e.row)):e.row>0&&(t.preventDefault(),this.goTo(this.adapter.colCount-1,e.row-1)):e.col+1<this.adapter.colCount?(t.preventDefault(),this.goTo(e.col+1,e.row)):e.row+1<this.adapter.rowCount&&(t.preventDefault(),this.goTo(0,e.row+1));}}onFieldViewBlur(t){const e=this.getCellAt(t.col,t.row);if(void 0===e)return;const i=this.adapter.getDisplayCell(t.col,t.row),o=document.createElement("div");if(Array.isArray(i)?i.forEach((t=>o.appendChild(t))):o.appendChild(i),this.log(At.USER,`TableView.onFieldViewBlur(${t.col}, ${t.row}): change "${e.innerHTML}" to "${o.innerHTML}"`),o.innerHTML!=e.innerHTML){for(this.log(At.USER,`TableView.onFieldViewBlur(${t.col}, ${t.row})"): cell is now "${e.innerHTML}"`);e.childNodes.length>0;)e.removeChild(e.childNodes[e.childNodes.length-1]);this.log(At.USER,`TableView.onFieldViewBlur(${t.col}, ${t.row})"): cleared cell, it's now "${e.innerHTML}"`),Array.isArray(i)?i.forEach((t=>e.appendChild(t))):e.appendChild(i),this.log(At.USER,`TableView.onFieldViewBlur(${t.col}, ${t.row})"): cell is now "${e.innerHTML}"`),this.unadjustLayoutBeforeRender(t),setTimeout((()=>{this.adjustLayoutAfterRender();}),0);}}connectedCallback(){super.connectedCallback(),this.resizeEventListener=()=>{try{this.adjustLayoutAfterRender();}catch(t){throw console.log("resizeEventListener caught exception in adjustLayoutAfterRender()"),t}},window.addEventListener("resize",this.resizeEventListener),void 0===this.selectionModel&&(this.selectionModel=new yt,this.selectionModel.modified.add((()=>{this.createSelection();}),this));}disconnectedCallback(){window.removeEventListener("resize",this.resizeEventListener);}}class Nt{constructor(t,e,i){this.type=t,this.index=e,this.size=i;}get col(){return this.index}get row(){return this.size}}class Dt extends xt{constructor(t,e){super(e),this.data=t;}get rowCount(){return this.data?this.data.length:0}createRow(){return new this.nodeClass}insert(e,i){if(e>this.rowCount)throw Error(`ArrayTableModel.insert(${e}) is out of range, model size is ${this.colCount}, ${this.rowCount}`);let o;return void 0===i&&(i=this.createRow()),o=i instanceof Array?i:[i],this.data.splice(e,0,...o),this.modified.trigger(new Nt(t.TableEventType.INSERT_ROW,e,o.length)),e}remove(e,i=1){if(e>=this.rowCount||e+i>this.rowCount)throw Error(`ArrayTableModel.remove(${e}, ${i}) is out of range, model size is ${this.colCount}, ${this.rowCount}`);return this.data.splice(e,i),this.modified.trigger(new Nt(t.TableEventType.REMOVE_ROW,e,i)),e}}class _t extends V{constructor(){super(),this.toolbar=C("div",{class:"toolbar"}),this.buttonAddRowAbove=C("button",Object.assign({class:"left",title:"add row above"},{children:k("svg",Object.assign({style:{display:"block"},viewBox:"0 0 13 13",width:"13",height:"13"},{children:[C("rect",{x:"0.5",y:"0.5",width:"12",height:"12",class:"strokeFill"}),C("line",{x1:"0.5",y1:"8.5",x2:"12.5",y2:"8.5",class:"stroke"}),C("line",{x1:"4.5",y1:"8.5",x2:"4.5",y2:"13.5",class:"stroke"}),C("line",{x1:"8.5",y1:"8.5",x2:"8.5",y2:"13.5",class:"stroke"}),C("line",{x1:"6.5",y1:"2",x2:"6.5",y2:"7",class:"stroke"}),C("line",{x1:"4",y1:"4.5",x2:"9",y2:"4.5",class:"stroke"})]}))})),this.buttonAddRowAbove.onclick=()=>{var t,e,i;null===(t=this.lastActiveTable)||void 0===t||t.focus();const o=null===(e=this.lastActiveTable)||void 0===e?void 0:e.model,s=null===(i=this.lastActiveTable)||void 0===i?void 0:i.selectionModel;s&&o&&o instanceof Dt&&o.insert(s.row);},this.toolbar.appendChild(this.buttonAddRowAbove),this.buttonAddRowBelow=C("button",Object.assign({title:"add row below"},{children:k("svg",Object.assign({viewBox:"0 0 13 13",width:"13",height:"13"},{children:[C("rect",{x:"0.5",y:"0.5",width:"12",height:"12",class:"strokeFill"}),C("line",{x1:"0.5",y1:"4.5",x2:"12.5",y2:"4.5",class:"stroke"}),C("line",{x1:"4.5",y1:"0.5",x2:"4.5",y2:"4.5",class:"stroke"}),C("line",{x1:"8.5",y1:"0.5",x2:"8.5",y2:"4.5",class:"stroke"}),C("line",{x1:"6.5",y1:"6",x2:"6.5",y2:"11",class:"stroke"}),C("line",{x1:"4",y1:"8.5",x2:"9",y2:"8.5",class:"stroke"})]}))})),this.buttonAddRowBelow.onclick=()=>{var t,e,i;null===(t=this.lastActiveTable)||void 0===t||t.focus();const o=null===(e=this.lastActiveTable)||void 0===e?void 0:e.model,s=null===(i=this.lastActiveTable)||void 0===i?void 0:i.selectionModel;s&&o&&o instanceof Dt&&o.insert(s.row+1);},this.toolbar.appendChild(this.buttonAddRowBelow),this.buttonDeleteRow=C("button",Object.assign({class:"right",title:"delete row"},{children:k("svg",Object.assign({viewBox:"0 0 13 13",width:"13",height:"13"},{children:[C("rect",{x:"0.5",y:"0.5",width:"12",height:"12",class:"strokeFill"}),C("line",{x1:"0.5",y1:"4.5",x2:"12.5",y2:"4.5",class:"stroke"}),C("line",{x1:"0.5",y1:"8.5",x2:"12.5",y2:"8.5",class:"stroke"}),C("line",{x1:"5.5",y1:"3.5",x2:"11.5",y2:"9.5",class:"stroke","stroke-width":"1.5"}),C("line",{x1:"11.5",y1:"3.5",x2:"5.5",y2:"9.5",class:"stroke","stroke-width":"1.5"})]}))})),this.buttonDeleteRow.onclick=()=>{var t,e,i;null===(t=this.lastActiveTable)||void 0===t||t.focus();const o=null===(e=this.lastActiveTable)||void 0===e?void 0:e.model,s=null===(i=this.lastActiveTable)||void 0===i?void 0:i.selectionModel;s&&o&&o instanceof Dt&&o.remove(s.row);},this.toolbar.appendChild(this.buttonDeleteRow),this.toolbar.appendChild(document.createTextNode(" ")),this.buttonAddColumnLeft=C("button",Object.assign({class:"left",title:"add column left"},{children:k("svg",Object.assign({viewBox:"0 0 13 13",width:"13",height:"13"},{children:[C("rect",{x:"0.5",y:"0.5",width:"12",height:"12",class:"strokeFill"}),C("line",{x1:"8.5",y1:"0.5",x2:"8.5",y2:"12.5",class:"stroke"}),C("line",{x1:"8.5",y1:"4.5",x2:"12.5",y2:"4.5",class:"stroke"}),C("line",{x1:"8.5",y1:"8.5",x2:"12.5",y2:"8.5",class:"stroke"}),C("line",{x1:"2",y1:"6.5",x2:"7",y2:"6.5",class:"stroke"}),C("line",{x1:"4.5",y1:"4",x2:"4.5",y2:"9",class:"stroke"})]}))})),this.toolbar.appendChild(this.buttonAddColumnLeft),this.buttonAddColumnRight=C("button",Object.assign({title:"add column right"},{children:k("svg",Object.assign({viewBox:"0 0 13 13",width:"13",height:"13"},{children:[C("rect",{x:"0.5",y:"0.5",width:"12",height:"12",class:"strokeFill"}),C("line",{x1:"4.5",y1:"0.5",x2:"4.5",y2:"12.5",class:"stroke"}),C("line",{x1:"0.5",y1:"4.5",x2:"4.5",y2:"4.5",class:"stroke"}),C("line",{x1:"0.5",y1:"8.5",x2:"4.5",y2:"8.5",class:"stroke"}),C("line",{x1:"6",y1:"6.5",x2:"11",y2:"6.5",class:"stroke"}),C("line",{x1:"8.5",y1:"4",x2:"8.5",y2:"9",class:"stroke"})]}))})),this.toolbar.appendChild(this.buttonAddColumnRight),this.buttonDeleteColumn=C("button",Object.assign({class:"right",title:"delete column"},{children:k("svg",Object.assign({viewBox:"0 0 13 13",width:"13",height:"13"},{children:[C("rect",{x:"0.5",y:"0.5",width:"12",height:"12",class:"strokeFill"}),C("line",{x1:"4.5",y1:"0.5",x2:"4.5",y2:"12.5",class:"stroke"}),C("line",{x1:"8.5",y1:"0.5",x2:"8.5",y2:"12.5",class:"stroke"}),C("line",{x1:"3.5",y1:"5.5",x2:"9.5",y2:"11.5",class:"stroke","stroke-width":"1.5"}),C("line",{x1:"3.5",y1:"11.5",x2:"9.5",y2:"5.5",class:"stroke","stroke-width":"1.5"})]}))})),this.toolbar.appendChild(this.buttonDeleteColumn),this.toolbar.appendChild(document.createTextNode(" ")),this.buttonAddNodeAbove=C("button",Object.assign({class:"left",title:"add node above"},{children:k("svg",Object.assign({style:{display:"block",border:"none"},viewBox:"0 0 8 17",width:"8",height:"17"},{children:[C("rect",{x:"0.5",y:"1.5",width:"6",height:"6",class:"strokeFill"}),C("rect",{x:"0.5",y:"9.5",width:"6",height:"6",class:"fill"}),C("line",{x1:"3.5",y1:"3",x2:"3.5",y2:"6",class:"stroke"}),C("line",{x1:"2",y1:"4.5",x2:"5",y2:"4.5",class:"stroke"}),C("line",{x1:"3.5",y1:"0",x2:"3.5",y2:"1",class:"stroke"}),C("line",{x1:"3.5",y1:"8",x2:"3.5",y2:"17",class:"stroke"})]}))})),this.toolbar.appendChild(this.buttonAddNodeAbove),this.buttonAddNodeBelow=C("button",Object.assign({title:"add node below"},{children:k("svg",Object.assign({style:{display:"block",border:"none"},viewBox:"0 0 8 17",width:"8",height:"17"},{children:[C("rect",{x:"0.5",y:"1.5",width:"6",height:"6",class:"fill"}),C("rect",{x:"0.5",y:"9.5",width:"6",height:"6",class:"strokeFill"}),C("line",{x1:"3.5",y1:"11",x2:"3.5",y2:"14",class:"stroke"}),C("line",{x1:"2",y1:"12.5",x2:"5",y2:"12.5",class:"stroke"}),C("line",{x1:"3.5",y1:"0",x2:"3.5",y2:"9",class:"stroke"}),C("line",{x1:"3.5",y1:"16",x2:"3.5",y2:"17",class:"stroke"})]}))})),this.toolbar.appendChild(this.buttonAddNodeBelow),this.buttonAddNodeParent=C("button",Object.assign({title:"add node parent"},{children:k("svg",Object.assign({viewBox:"0 0 13 17",width:"13",height:"17"},{children:[C("rect",{x:"0.5",y:"1.5",width:"6",height:"6",class:"strokeFill"}),C("rect",{x:"6.5",y:"9.5",width:"6",height:"6",class:"fill"}),C("line",{x1:"7",y1:"4.5",x2:"10",y2:"4.5",class:"stroke"}),C("line",{x1:"9.5",y1:"4",x2:"9.5",y2:"9",class:"stroke"}),C("line",{x1:"3.5",y1:"3",x2:"3.5",y2:"6",class:"stroke"}),C("line",{x1:"2",y1:"4.5",x2:"5",y2:"4.5",class:"stroke"}),C("line",{x1:"3.5",y1:"0",x2:"3.5",y2:"1",class:"stroke"}),C("line",{x1:"3.5",y1:"8",x2:"3.5",y2:"17",class:"stroke"})]}))})),this.buttonAddNodeParent.onclick=()=>{},this.toolbar.appendChild(this.buttonAddNodeParent),this.buttonAddNodeChild=C("button",Object.assign({title:"add node child"},{children:k("svg",Object.assign({viewBox:"0 0 13 17",width:"13",height:"17"},{children:[C("rect",{x:"0.5",y:"1.5",width:"6",height:"6",class:"fill"}),C("rect",{x:"6.5",y:"9.5",width:"6",height:"6",class:"strokeFill"}),C("line",{x1:"7",y1:"4.5",x2:"10",y2:"4.5",class:"stroke"}),C("line",{x1:"9.5",y1:"4",x2:"9.5",y2:"9",class:"stroke"}),C("line",{x1:"9.5",y1:"11",x2:"9.5",y2:"14",class:"stroke"}),C("line",{x1:"8",y1:"12.5",x2:"11",y2:"12.5",class:"stroke"}),C("line",{x1:"3.5",y1:"0",x2:"3.5",y2:"17",class:"stroke"})]}))})),this.toolbar.appendChild(this.buttonAddNodeChild),this.buttonDeleteNode=C("button",Object.assign({class:"right",title:"delete node"},{children:k("svg",Object.assign({viewBox:"0 0 10 17",width:"10",height:"17"},{children:[C("rect",{x:"1.5",y:"5.5",width:"6",height:"6",class:"strokeFill"}),C("line",{x1:"4.5",y1:"2",x2:"4.5",y2:"5",class:"stroke"}),C("line",{x1:"4.5",y1:"12",x2:"4.5",y2:"15",class:"stroke"}),C("line",{x1:"0.5",y1:"4.5",x2:"8.5",y2:"12.5",class:"stroke","stroke-width":"1.5"}),C("line",{x1:"8.5",y1:"4.5",x2:"0.5",y2:"12.5",class:"stroke","stroke-width":"1.5"})]}))})),this.toolbar.appendChild(this.buttonDeleteNode),this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(document.importNode(X,!0)),this.shadowRoot.appendChild(this.toolbar);}canHandle(t){return t instanceof Ot}activate(){this.lastActiveTable=V.activeView,this.toolbar.classList.add("active");}deactivate(){this.lastActiveTable=void 0,this.toolbar.classList.remove("active");}}class Lt extends Ct{}class Ht extends Lt{}class St{constructor(t,e,i=!0){this.node=t,this.depth=e,this.open=i;}}class Vt extends xt{constructor(t,e){super(t),this.rows=new Array,void 0!==e&&this.createRowInfoHelper(this.rows,e,0);}get colCount(){return 1}get rowCount(){return this.rows.length}getRow(t){for(let e=0;e<this.rows.length;++e)if(this.rows[e].node===t)return e}addSiblingBefore(e){const i=this.createNode();return 0===this.rows.length?(e=0,this.setRoot(i),this.rows.push(new St(i,0))):0===e?(this.setNext(i,this.getRoot()),this.setRoot(i),this.rows.unshift(new St(i,0))):(this.setNext(i,this.rows[e].node),this.getNext(this.rows[e-1].node)===this.rows[e].node?this.setNext(this.rows[e-1].node,i):this.setDown(this.rows[e-1].node,i),this.rows.splice(e,0,new St(i,this.rows[e].depth))),this.modified.trigger(new Nt(t.TableEventType.INSERT_ROW,e,1)),e}addSiblingAfter(e){const i=this.createNode();if(0===this.rows.length)e=0,this.setRoot(i),this.rows.push(new St(i,0));else {this.setNext(i,this.getNext(this.rows[e].node)),this.setNext(this.rows[e].node,i);const t=this.nodeCount(this.getDown(this.rows[e].node)),o=this.rows[e].depth;e+=t+1,this.rows.splice(e,0,new St(i,o));}return this.modified.trigger(new Nt(t.TableEventType.INSERT_ROW,e,1)),e}addChildAfter(e){const i=this.createNode();if(0===this.rows.length)this.setRoot(i),this.rows.push(new St(i,0)),this.modified.trigger(new Nt(t.TableEventType.INSERT_ROW,0,1));else {const o=this.getDown(this.rows[e].node),s=this.nodeCount(o);for(let t=0;t<s;++t)++this.rows[e+1+t].depth;this.setDown(i,o),this.setDown(this.rows[e].node,i),this.rows.splice(e+1,0,new St(i,this.rows[e].depth+1)),this.modified.trigger(new Nt(t.TableEventType.INSERT_ROW,e+1,1));}return e}addParentBefore(e){const i=this.createNode();if(0===e){for(let t=0;t<this.rows.length;++t)++this.rows[e+t].depth;this.setDown(i,this.getRoot()),this.setRoot(i),this.rows.unshift(new St(i,0));}else {const t=this.rows[e].depth,o=this.nodeCount(this.getDown(this.rows[e].node))+1;for(let t=0;t<o;++t)++this.rows[e+t].depth;this.setDown(i,this.rows[e].node),this.setNext(i,this.getNext(this.rows[e].node)),this.setNext(this.rows[e].node,void 0),this.getNext(this.rows[e-1].node)===this.rows[e].node?this.setNext(this.rows[e-1].node,i):this.setDown(this.rows[e-1].node,i),this.rows.splice(e,0,new St(i,t));}return this.modified.trigger(new Nt(t.TableEventType.INSERT_ROW,e,1)),e}deleteAt(e){let i=this.getDown(this.rows[e].node);if(void 0!==i){const t=this.nodeCount(i)+1;for(let i=0;i<t;++i)--this.rows[e+i].depth;this.append(i,this.getNext(this.rows[e].node)),this.setNext(this.rows[e].node,void 0),0===e?this.setRoot(i):this.setNext(this.rows[e-1].node,i);}else if(0===e){const t=this.getNext(this.rows[e].node);this.setNext(this.rows[e].node,void 0),this.setRoot(t);}else {const t=this.getNext(this.rows[e].node);this.setNext(this.rows[e].node,void 0),this.getNext(this.rows[e-1].node)===this.rows[e].node?this.setNext(this.rows[e-1].node,t):this.setDown(this.rows[e-1].node,t);}return this.rows.splice(e,1),this.modified.trigger(new Nt(t.TableEventType.REMOVE_ROW,e,1)),e}init(){}toggleAt(t){this.rows[t].open?this.closeAt(t):this.openAt(t);}isOpen(t){return this.rows[t].open}openAt(e){let i=this.rows[e];if(i.open||void 0===this.getDown(i.node))return;i.open=!0;const o=this.createRowInfo(e);this.rows.splice(e+1,0,...o),this.modified.trigger(new Nt(t.TableEventType.INSERT_ROW,e+1,o.length));}closeAt(e){let i=this.rows[e];if(!i.open||void 0===this.getDown(i.node))return;const o=this.getVisibleChildCount(e);i.open=!1,this.rows.splice(e+1,o),this.modified.trigger(new Nt(t.TableEventType.REMOVE_ROW,e+1,o));}createRowInfo(t){const e=new Array;let i=this.rows[t];return i.open&&this.getDown(i.node)&&this.createRowInfoHelper(e,this.getDown(i.node),i.depth+1),e}createRowInfoHelper(t,e,i){const o=new St(e,i,!1);t.push(o),o.open&&this.getDown(e)&&this.createRowInfoHelper(t,this.getDown(e),o.depth+1),this.getNext(e)&&this.createRowInfoHelper(t,this.getNext(e),o.depth);}getVisibleChildCount(t){let e=this.rows[t],i=1;if(e.open&&this.getDown(e.node)){const e=this.getVisibleChildCountHelper(t+1);t+=e,i+=e;}return i-1}getVisibleChildCountHelper(t){let e=this.rows[t],i=1;if(e.open&&this.getDown(e.node)){const e=this.getVisibleChildCountHelper(t+1);t+=e,i+=e;}if(this.getNext(e.node)){const e=this.getVisibleChildCountHelper(t+1);t+=e,i+=e;}return i}append(t,e){if(void 0===e)return;let i,o=t;for(;i=this.getNext(o),void 0!==i;)o=i;this.setNext(o,e);}nodeCount(t){return void 0===t?0:1+this.nodeCount(this.getDown(t))+this.nodeCount(this.getNext(t))}}class It extends H{constructor(t,e,i){super(),this.model=t,this.rowinfo=e,this.label=i,this.attachShadow({mode:"open"});}connectedCallback(){super.connectedCallback(),this.paint();}disconnectedCallback(){super.disconnectedCallback();}paint(){if(!this.shadowRoot)return;if(!this.parentElement)return;const t=this.model.getRow(this.rowinfo.node);if(void 0===t)return;const e=12,i=3.5,o=Math.round(2)-.5,s=this.rowinfo.depth*e+e+i,n=k(x,{children:[C("svg",{width:s,height:e,style:{verticalAlign:"middle",background:"none"}}),C("span",Object.assign({style:{verticalAlign:"middle",padding:"2px"}},{children:this.label}))]}),l=n[0];{const s=this.rowinfo,n=s.depth;if(this.model.getDown(s.node)){const t=n*e+i,r=C("rect",{x:t,y:o,width:8,height:8,stroke:"#000",fill:"#fff",cursor:"pointer"});l.appendChild(r),l.appendChild(C("line",{x1:t+2,y1:o+4,x2:t+8-2,y2:o+4,stroke:"#000",cursor:"pointer"}));const d=C("line",{x1:t+4,y1:o+2,x2:t+4,y2:o+8-2,stroke:"#000",cursor:"pointer"});d.style.display=s.open?"none":"",l.appendChild(d),l.appendChild(C("line",{x1:t+8,y1:o+4,x2:t+8+3,y2:o+4,stroke:"#000"})),l.onmousedown=e=>{var i;e.preventDefault(),e.stopPropagation();const n=this.model.getRow(s.node);if(void 0===n)return void console.log("  ==> couldn't find row number for node");const r=l.getBoundingClientRect(),h=e.clientX-r.left,a=e.clientY-r.top;t<=h&&h<=t+8&&o<=a&&a<=o+8&&(null===(i=this.model)||void 0===i||i.toggleAt(n),d.style.display=this.model.isOpen(n)?"none":"");};}else l.appendChild(C("line",{x1:n*e+i+4,y1:"0",x2:n*e+i+4,y2:o+4,stroke:"#000"})),l.appendChild(C("line",{x1:n*e+i+4,y1:o+4,x2:n*e+i+8+3,y2:o+4,stroke:"#000"}));let r="";for(let o=0;o<=n;++o){const l=o*e+i+4;for(let e=t+1;e<this.model.rowCount&&!(this.model.rows[e].depth<o);++e)if(o===this.model.rows[e].depth){(o!==n||void 0!==this.model.getNext(s.node))&&(r+=`<line x1='${l}' y1='0' x2='${l}' y2='100%' stroke='%23000' />`);break}}if(void 0===this.model.getDown(s.node)||void 0===this.model.getNext(s.node)){const t=n*e+i+4;r+=`<line x1='${t}' y1='0' x2='${t}' y2='50%' stroke='%23000' />`;}this.parentElement.style.background=`url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'>${r}</svg>")`,this.parentElement.style.backgroundRepeat="repeat-y";}n.replaceIn(this.shadowRoot);}}class Bt extends HTMLElement{}let jt=!1;function Ft(){jt=!0,H.define("toad-button",F),H.define("toad-checkbox",z),H.define("toad-slider",P),H.define("toad-slot",B),H.define("toad-textarea",J),H.define("toad-texttool",G),H.define("toad-text",q),H.define("toad-if",Z),H.define("toad-toolbutton",$),H.define("toad-menu",st),H.define("toad-menubutton",it),H.define("toad-menuentry",Bt),H.define("toad-menuspacer",nt),H.define("toad-table",Ot),H.define("toad-tabletool",_t),H.define("toad-treenodecell",It);}Ft(),t.Action=a,t.ActionView=I,t.AnimationBase=D,t.Animator=_,t.ArrayAdapter=class extends Ht{getColumnHead(t){const e=this.getColumnHeads();return document.createTextNode(e[t])}get colCount(){var t;return this.getRow(null===(t=this.model)||void 0===t?void 0:t.data[0]).length}getRowHead(t){}getDisplayCell(t,e){const i=this.getField(t,e);if(void 0!==i)return document.createTextNode(i)}getEditorCell(t,e){const i=this.getField(t,e);if(void 0===i)return;const o=new d(i);o.modified.add((()=>{this.setField(t,e,o.value);}));const s=new q;return s.setModel(o),s}getField(t,e){if(this.model)return this.getRow(this.model.data[e])[t].toString()}setField(e,i,o){this.model&&(this.getRow(this.model.data[i])[e].fromString(o),this.model.modified.trigger(new Nt(t.TableEventType.CELL_CHANGED,e,i)));}},t.ArrayModel=class extends Dt{constructor(t,e){super(t,e);}get colCount(){return 10}},t.ArrayTableModel=Dt,t.BooleanModel=l,t.Button=F,t.CheckboxView=z,t.Controller=c,t.Dialog=O,t.Fragment=x,t.GenericModel=n,t.GenericTool=V,t.HtmlModel=h,t.Matrix=e,t.Menu=st,t.MenuButton=it,t.MenuSpacer=nt,t.Model=s,t.ModelView=S,t.NumberModel=r,t.OptionModel=class extends L{constructor(){super(),this._map=new Map;}add(t,e){this._map.set(t,e);}isValidStringValue(t){return this._map.has(t)}get value(){return this._map.get(this.stringValue)}},t.OptionModelBase=L,t.PopupMenu=et,t.Reference=v,t.SelectionModel=yt,t.Signal=o,t.SliderView=P,t.SlotView=B,t.TableAdapter=Ct,t.TableEvent=Nt,t.TableModel=ft,t.TablePos=vt,t.TableTool=_t,t.TableView=Ot,t.Template=class extends c{constructor(t){super(),this.root=u(t),this.registerViews();}registerViews(){let t=this.root.querySelectorAll("[model]");for(let e of t){let t=e;if(t)try{this.registerView(t.getModelId(),t);}catch(t){}}t=this.root.querySelectorAll("[action]");for(let e of t){let t=e;if(t)try{this.registerView(t.getActionId(),t);}catch(t){}}}openHref(t){}},t.TextArea=J,t.TextModel=d,t.TextTool=G,t.TextView=q,t.ToadIf=Z,t.ToolButton=$,t.TreeAdapter=class extends Ht{isViewCompact(){return !0}treeCell(t,e){if(this.model)return new It(this.model,this.model.rows[t],e)}},t.TreeModel=Vt,t.TreeNodeModel=class extends Vt{constructor(t,e){super(t,e),this.root=e;}createNode(){return new this.nodeClass}deleteNode(t){}getRoot(){return this.root}setRoot(t){this.root=t;}getDown(t){return t.down}setDown(t,e){t.down=e;}getNext(t){return t.next}setNext(t,e){t.next=e;}},t.TypedTableAdapter=Ht,t.TypedTableModel=xt,t.View=H,t.action=function(t,e){return N.registerAction(t,e)},t.bind=function(t,e){N.bind(t,e);},t.boolean=function(t,e){return N.boolean(t,e)},t.createElement=function(t,e,...i){return null!==e?("key"in e&&delete e.key,void 0!==i&&(e.children=i)):void 0!==i&&(e={children:i}),k(t,e)},t.globalController=N,t.initialize=Ft,t.isInitialized=function(){return jt},t.jsx=C,t.jsxs=k,t.ref=y,t.refs=function(t,...e){return e.map((e=>new v(t,e)))},t.setInitialProperties=E,t.unbind=function(){N.clear();},Object.defineProperty(t,"__esModule",{value:!0});}));

    }(toad, toad.exports));

    var orb = {};

    /*
     *  corba.js Object Request Broker (ORB) and Interface Definition Language (IDL) compiler
     *  Copyright (C) 2018 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU General Public License for more details.
     *
     *  You should have received a copy of the GNU General Public License
     *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
     */
    var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    Object.defineProperty(orb, "__esModule", { value: true });
    var Stub_1 = orb.Stub = Skeleton_1 = orb.Skeleton = orb.CORBAObject = ORB_1 = orb.ORB = void 0;
    class ORB {
        constructor(orb) {
            if (orb === undefined) {
                this.debug = 0;
                this.servants = new Array();
                this.servants.push(undefined); // reserve id 0
                this.unusedServantIds = new Array();
                this.stubsByName = new Map();
                this.initialReferences = new Map();
                this.name = "";
            }
            else {
                this.debug = orb.debug;
                this.servants = orb.servants;
                this.unusedServantIds = orb.unusedServantIds;
                this.stubsByName = orb.stubsByName;
                this.initialReferences = orb.initialReferences;
                this.name = "spawned from '" + orb.name + "'";
            }
            this.stubsById = new Map();
            this.accesibleServants = new Set();
            this.reqid = 0;
            this.listeners = new Map();
        }
        // EventTarget methods
        addEventListener(type, listener, options) {
            if (type !== "close")
                throw Error("ORB.addEventListener: type must be 'close'");
            if (listener === null)
                return;
            let set = this.listeners.get(type);
            if (set === undefined) {
                set = new Set();
                this.listeners.set(type, set);
            }
            set.add(listener);
        }
        removeEventListener(type, listener, options) {
            if (type !== "close")
                throw Error("ORB.removeEventListener: type must be 'close'");
            if (listener === null || listener === undefined)
                return;
            let set = this.listeners.get(type);
            if (set === undefined)
                return;
            set.delete(listener);
        }
        dispatchEvent(event) {
            let set = this.listeners.get(event.type);
            if (set === undefined)
                return true;
            for (let handler of set) {
                if (typeof handler === "function")
                    handler(event);
                else
                    handler.handleEvent(event);
            }
            return true;
        }
        set onclose(listener) {
            this.listeners.delete("close");
            this.addEventListener("close", listener);
        }
        // called by the Skeleton
        registerServant(servant) {
            let id = this.unusedServantIds.pop();
            if (id !== undefined) {
                this.servants[id] = servant;
            }
            else {
                id = this.servants.length;
                this.servants.push(servant);
            }
            return id;
        }
        unregisterServant(servant) {
            this.servants[servant.id] = undefined;
            this.unusedServantIds.push(servant.id);
            servant.id = -1;
        }
        registerStubClass(aStubClass) {
            this.stubsByName.set(aStubClass._idlClassName(), aStubClass);
        }
        releaseStub(stub) {
            if (!this.stubsById.has(stub.id))
                throw Error("ORB.releaseStub(): the stub with id " + stub.id + " is unknown to this ORB");
            this.stubsById.delete(stub.id);
        }
        static registerValueType(name, valuetypeConstructor) {
            let information = ORB.valueTypeByName.get(name);
            if (information === undefined) {
                throw Error(`ORB.registerValueType: valuetype '${name}' not defined in IDL`);
            }
            if (information.construct !== undefined) {
                throw Error(`ORB.registerValueType: valuetype '${name}' is already registered`);
            }
            information.name = name;
            information.construct = valuetypeConstructor;
            ORB.valueTypeByPrototype.set(valuetypeConstructor.prototype, information);
        }
        static lookupValueType(name) {
            let information = ORB.valueTypeByName.get(name);
            if (information === undefined) {
                throw Error(`ORB.lookupValueType: valuetype '${name}' not defined in IDL`);
            }
            if (information.construct === undefined) {
                throw Error(`ORB.lookupValueType: valuetype '${name}' not registered via ORB.registerValueType()`);
            }
            return information.construct;
        }
        //
        // initial references
        //
        bind(id, obj) {
            if (this.initialReferences.get(id) !== undefined)
                throw Error("ORB.bind(): the id '" + id + "' is already bound to an object");
            this.initialReferences.set(id, obj);
        }
        list() {
            return __awaiter(this, void 0, void 0, function* () {
                let result = new Array();
                for (let [id, obj] of this.initialReferences) {
                    result.push(id);
                }
                if (this.socket === undefined)
                    return result;
                let data = {
                    "corba": "1.0",
                    "list": null
                };
                let remoteInitialReferences = yield this.send(data);
                for (let id of remoteInitialReferences.result) {
                    result.push(id);
                }
                return result;
            });
        }
        resolve(id) {
            return __awaiter(this, void 0, void 0, function* () {
                let data = {
                    "corba": "1.0",
                    "resolve": id
                };
                let remoteInitialReference = yield this.send(data);
                if (remoteInitialReference.result === undefined) {
                    throw Error("ORB.resolve('" + id + "'): protocol error, no result value");
                }
                let object = this.deserialize(remoteInitialReference.result);
                if (object === null) {
                    throw Error("ORB.resolve('" + id + "'): failed to resolve reference");
                }
                return object;
            });
        }
        //
        // valuetype
        //
        serialize(object) {
            if (object === null || typeof object !== "object") {
                return JSON.stringify(object);
            }
            if (object instanceof Stub) {
                throw Error("ORB.serialize(): Stub");
            }
            if (object instanceof Skeleton) {
                return `{"#R":"${object.constructor._idlClassName()}","#V":${object.id}}`;
            }
            if (object instanceof Array) {
                let data = "";
                for (let x of object) {
                    if (data.length !== 0)
                        data += ",";
                    data += this.serialize(x);
                }
                return "[" + data + "]";
            }
            let data = "";
            let prototype = Object.getPrototypeOf(object);
            let valueTypeInformation;
            while (prototype !== null) {
                valueTypeInformation = ORB.valueTypeByPrototype.get(prototype);
                if (valueTypeInformation !== undefined)
                    break;
                prototype = Object.getPrototypeOf(prototype);
            }
            if (valueTypeInformation === undefined) {
                console.log(object);
                throw Error("ORB: can not serialize object of unregistered valuetype");
            }
            for (let attribute of valueTypeInformation.attributes) {
                if (object[attribute] !== undefined) {
                    if (data.length !== 0)
                        data += ",";
                    data += '"' + attribute + '":' + this.serialize(object[attribute]);
                }
            }
            return `{"#T":"${valueTypeInformation.name}","#V":{${data}}}`;
        }
        deserialize(text) {
            if (text === undefined || text === null)
                return null;
            try {
                return this._deserialize(JSON.parse(text));
            }
            catch (error) {
                console.log(text);
                throw error;
            }
        }
        _deserialize(data) {
            if (data === null)
                return null;
            if (typeof data !== "object")
                return data;
            if (data instanceof Array) {
                for (let i in data) {
                    data[i] = this._deserialize(data[i]);
                }
                return data;
            }
            let type = data["#T"];
            let reference = data["#R"];
            let value = data["#V"];
            if (reference !== undefined && value !== undefined) {
                let object = this.stubsById.get(value);
                if (object !== undefined)
                    return object;
                let aStubClass = this.stubsByName.get(reference);
                if (aStubClass === undefined) {
                    throw Error(`ORB: can not deserialize object of unregistered stub '${reference}'`);
                }
                object = new aStubClass(this, value);
                this.stubsById.set(value, object);
                return object;
            }
            if (type === undefined || value === undefined) {
                throw Error("ORB: no type/value information in serialized data");
            }
            let valueTypeInformation = ORB.valueTypeByName.get(type);
            if (valueTypeInformation === undefined)
                throw Error(`ORB: can not deserialize object of unregistered valuetype '${type}'`);
            let object = new valueTypeInformation.construct();
            for (let [innerAttribute, innerValue] of Object.entries(value)) {
                object[innerAttribute] = this._deserialize(innerValue);
            }
            return object;
        }
        //
        // Client
        //
        connect(url) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.debug > 0)
                    console.log("ORB.connect('" + url + ")");
                let orb = this;
                return new Promise((resolve, reject) => {
                    orb.socket = new WebSocket(url);
                    orb.socket.onopen = function () {
                        resolve();
                    };
                    orb.socket.onerror = function (err) {
                        reject(err);
                    };
                    orb.socket.onclose = (event) => {
                        this.dispatchEvent(event);
                        this.release();
                    };
                });
            });
        }
        send(data, oneway = false) {
            let reqid = ++this.reqid;
            data.reqid = reqid;
            if (this.debug > 0) {
                console.log("ORB.send(" + JSON.stringify(data) + ")");
            }
            return new Promise((resolve, reject) => {
                if (this.socket === undefined)
                    throw Error("ORB.send(): no socket");
                this.socket.onmessage = (message) => {
                    if (this.debug > 0) {
                        console.log("ORB.send(...) received " + message.data);
                    }
                    let msg = JSON.parse(String(message.data));
                    if (msg.corba !== "1.0")
                        reject(Error("expected corba version 1.0 but got " + msg.corba));
                    if (msg.method !== undefined) {
                        try {
                            this.handleMethod(msg);
                        }
                        catch (error) {
                            if (error instanceof Error)
                                console.log(error.message);
                            else
                                console.log(error);
                            throw error;
                        }
                    }
                    else if (msg.list !== undefined) {
                        this.handleListInitialReferences(msg);
                    }
                    else if (msg.resolve !== undefined) {
                        this.handleResolveInitialReferences(msg);
                    }
                    else if (reqid == msg.reqid) {
                        resolve(msg);
                    }
                };
                this.socket.onerror = function (err) {
                    reject(err);
                };
                this.socket.send(JSON.stringify(data));
                if (oneway) {
                    resolve(undefined);
                }
            });
        }
        call(stub, oneway, method, params) {
            return __awaiter(this, void 0, void 0, function* () {
                // throw Error("FAILURE")
                if (this.debug > 0) {
                    console.log("ORB.call(...) method " + method);
                }
                for (let i in params) {
                    if (params[i] instanceof Skeleton) {
                        this.aclAdd(params[i]);
                    }
                    if (params[i] instanceof Stub) {
                        throw Error("ORB.call(): not implemented: method '" + method + "' received stub as argument");
                    }
                    try {
                        params[i] = this.serialize(params[i]);
                    }
                    catch (error) {
                        console.log(error);
                        throw error;
                    }
                }
                let msg = yield this.send({
                    "corba": "1.0",
                    "method": method,
                    "params": params,
                    "id": stub.id
                }, oneway);
                if (!oneway)
                    return this.deserialize(msg.result);
            });
        }
        release() {
            this.aclDeleteAll();
        }
        aclAdd(servant) {
            servant.acl.add(this);
            this.accesibleServants.add(servant);
        }
        aclDeleteAll() {
            for (let servant of this.accesibleServants)
                servant.acl.delete(this);
            this.accesibleServants.clear();
        }
        handleMethod(msg) {
            if (this.debug > 0)
                console.log("ORB.handleMethod(", msg, ")");
            if (msg.id >= this.servants.length) {
                throw Error("ORB.handleMethod(): client required method '" + msg.method + "' on server for unknown servant id " + msg.id);
            }
            let servant = this.servants[msg.id];
            if (servant === undefined) {
                throw Error("ORB.handleMethod(): client required method '" + msg.method + "' on server for unknown servant id " + msg.id);
            }
            if (!servant.acl.has(this)) {
                throw Error("ORB.handleMethod(): client required method '" + msg.method + "' on server but has no rights to access servant with id " + msg.id);
            }
            if (servant[msg.method] === undefined) {
                throw Error("ORB.handleMethod(): client required unknown method '" + msg.method + "' on server for servant with id " + msg.id);
            }
            for (let i in msg.params) {
                msg.params[i] = this.deserialize(msg.params[i]);
            }
            servant.orb = this; // set orb to client connection orb
            let result = servant[msg.method].apply(servant, msg.params);
            if (this.debug > 0)
                console.log("ORB.handleMethod(): got result ", result);
            result
                .then((result) => {
                if (result === undefined)
                    return;
                if (result instanceof Skeleton) {
                    this.aclAdd(result);
                    result.orb = this; // replace listener orb with client connection orb
                }
                if (result instanceof Stub) {
                    throw Error("ORB.handleMethod(): method '" + msg.method + "' returned stub");
                }
                let answer = {
                    "corba": "1.0",
                    "result": this.serialize(result),
                    "reqid": msg.reqid
                };
                let text = JSON.stringify(answer);
                if (this.debug > 0) {
                    console.log("ORB.handleMethod(): sending call reply " + text);
                }
                this.socket.send(text);
            })
                .catch((error) => {
                // FIXME: also print the class name
                console.log("ORB.handleMethod(): the method '" + msg.method + "' threw an error: ", error);
            });
        }
        handleListInitialReferences(msg) {
            let result = new Array();
            for (let [id, obj] of this.initialReferences) {
                result.push(id);
            }
            let answer = {
                "corba": "1.0",
                "result": result,
                "reqid": msg.reqid
            };
            let text = JSON.stringify(answer);
            if (this.debug > 0) {
                console.log("ORB.handleListInitialReferences(): sending call reply " + text);
            }
            this.socket.send(text);
        }
        handleResolveInitialReferences(msg) {
            let object = this.initialReferences.get(msg.resolve);
            if (object === undefined) {
                console.log("ORB.handleResolveInitialReferences(): failed to resolve '" + msg.resolve + "'");
                object = null;
            }
            else {
                this.aclAdd(object);
            }
            let answer = {
                "corba": "1.0",
                "result": this.serialize(object),
                "reqid": msg.reqid
            };
            let text = JSON.stringify(answer);
            if (this.debug > 0) {
                console.log("ORB.handleResolveInitialReferences(): sending call reply " + text);
            }
            this.socket.send(text);
        }
        listen(host, port) {
            return __awaiter(this, void 0, void 0, function* () {
                throw Error("pure virtual function ORB.listen() being called in browser ORB");
            });
        }
        accept() {
            throw Error("pure virtual function ORB.accept() being called in browser ORB");
        }
    }
    var ORB_1 = orb.ORB = ORB;
    ORB.valueTypeByName = new Map();
    ORB.valueTypeByPrototype = new Map();
    class CORBAObject {
        constructor(orb, id) {
            this.orb = orb;
            this.id = id;
        }
    }
    orb.CORBAObject = CORBAObject;
    class Skeleton extends CORBAObject {
        constructor(orb) {
            super(orb, 0);
            this.id = orb.registerServant(this);
            this.acl = new Set();
        }
        release() {
        }
    }
    var Skeleton_1 = orb.Skeleton = Skeleton;
    class Stub extends CORBAObject {
        constructor(orb, remoteID) {
            super(orb, remoteID);
        }
        release() {
            this.orb.releaseStub(this);
        }
    }
    Stub_1 = orb.Stub = Stub;

    // This file is generated by the corba.js IDL compiler from 'src/shared/workflow.idl'.
    class Board extends Stub_1 {
        static _idlClassName() {
            return "Board";
        }
        static narrow(object) {
            if (object instanceof Board)
                return object;
            throw Error("Board.narrow() failed");
        }
        getModel() {
            return __awaiter$1(this, void 0, void 0, function* () {
                return yield this.orb.call(this, false, "getModel", []);
            });
        }
        addListener(listener) {
            return __awaiter$1(this, void 0, void 0, function* () {
                yield this.orb.call(this, true, "addListener", [listener]);
            });
        }
        removeListener(listener) {
            return __awaiter$1(this, void 0, void 0, function* () {
                yield this.orb.call(this, true, "removeListener", [listener]);
            });
        }
        add(layerID, figure) {
            return __awaiter$1(this, void 0, void 0, function* () {
                yield this.orb.call(this, true, "add", [layerID, figure]);
            });
        }
        transform(layerID, figureIDs, matrix) {
            return __awaiter$1(this, void 0, void 0, function* () {
                yield this.orb.call(this, true, "transform", [layerID, figureIDs, matrix]);
            });
        }
    }
    class Project extends Stub_1 {
        static _idlClassName() {
            return "Project";
        }
        static narrow(object) {
            if (object instanceof Project)
                return object;
            throw Error("Project.narrow() failed");
        }
        getBoard(boardID) {
            return __awaiter$1(this, void 0, void 0, function* () {
                return yield this.orb.call(this, false, "getBoard", [boardID]);
            });
        }
    }
    class Server extends Stub_1 {
        static _idlClassName() {
            return "Server";
        }
        static narrow(object) {
            if (object instanceof Server)
                return object;
            throw Error("Server.narrow() failed");
        }
        setClient(client) {
            return __awaiter$1(this, void 0, void 0, function* () {
                yield this.orb.call(this, true, "setClient", [client]);
            });
        }
        initializeWebSession(session) {
            return __awaiter$1(this, void 0, void 0, function* () {
                yield this.orb.call(this, true, "initializeWebSession", [session]);
            });
        }
        logon(user, password, remember) {
            return __awaiter$1(this, void 0, void 0, function* () {
                yield this.orb.call(this, true, "logon", [user, password, remember]);
            });
        }
        getProject(projectID) {
            return __awaiter$1(this, void 0, void 0, function* () {
                return yield this.orb.call(this, false, "getProject", [projectID]);
            });
        }
    }
    class WorkflowServer extends Stub_1 {
        static _idlClassName() {
            return "WorkflowServer";
        }
        static narrow(object) {
            if (object instanceof WorkflowServer)
                return object;
            throw Error("WorkflowServer.narrow() failed");
        }
        getServer() {
            return __awaiter$1(this, void 0, void 0, function* () {
                return yield this.orb.call(this, false, "getServer", []);
            });
        }
    }

    // This file is generated by the corba.js IDL compiler from 'src/shared/workflow.idl'.
    function initPoint(object, init) {
        object.x = (init === undefined || init.x === undefined) ? 0 : init.x;
        object.y = (init === undefined || init.y === undefined) ? 0 : init.y;
    }
    function initSize(object, init) {
        object.width = (init === undefined || init.width === undefined) ? 0 : init.width;
        object.height = (init === undefined || init.height === undefined) ? 0 : init.height;
    }
    function initMatrix(object, init) {
        object.a = (init === undefined || init.a === undefined) ? 0 : init.a;
        object.b = (init === undefined || init.b === undefined) ? 0 : init.b;
        object.c = (init === undefined || init.c === undefined) ? 0 : init.c;
        object.d = (init === undefined || init.d === undefined) ? 0 : init.d;
        object.e = (init === undefined || init.e === undefined) ? 0 : init.e;
        object.f = (init === undefined || init.f === undefined) ? 0 : init.f;
    }
    function initRectangle(object, init) {
        object.origin = new (ORB_1.lookupValueType("Point"))(init === undefined ? undefined : init.origin);
        object.size = new (ORB_1.lookupValueType("Size"))(init === undefined ? undefined : init.size);
    }
    function initFigure(object, init) {
        object.id = (init === undefined || init.id === undefined) ? 0 : init.id;
        if (init !== undefined && init.matrix !== undefined)
            object.matrix = new (ORB_1.lookupValueType("Matrix | undefined"))(init.matrix);
    }
    var figure;
    (function (figure) {
        function initAttributedFigure(object, init) {
            object.stroke = (init === undefined || init.stroke === undefined) ? "" : init.stroke;
            object.strokeWidth = (init === undefined || init.strokeWidth === undefined) ? 0 : init.strokeWidth;
            object.fill = (init === undefined || init.fill === undefined) ? "" : init.fill;
        }
        figure.initAttributedFigure = initAttributedFigure;
        function initShape(object, init) {
            object.origin = new (ORB_1.lookupValueType("Point"))(init === undefined ? undefined : init.origin);
            object.size = new (ORB_1.lookupValueType("Size"))(init === undefined ? undefined : init.size);
        }
        figure.initShape = initShape;
        function initRectangle(object, init) {
        }
        figure.initRectangle = initRectangle;
        function initCircle(object, init) {
        }
        figure.initCircle = initCircle;
        function initText(object, init) {
            object.text = (init === undefined || init.text === undefined) ? "" : init.text;
        }
        figure.initText = initText;
        function initGroup(object, init) {
            object.childFigures = (init === undefined || init.childFigures === undefined) ? new Array() : init.childFigures;
        }
        figure.initGroup = initGroup;
        function initTransform(object, init) {
        }
        figure.initTransform = initTransform;
    })(figure || (figure = {})); // namespace figure
    function initFigureModel(object, init) {
        object.data = (init === undefined || init.data === undefined) ? new Array() : init.data;
    }
    function initLayer(object, init) {
        object.id = (init === undefined || init.id === undefined) ? 0 : init.id;
        object.name = (init === undefined || init.name === undefined) ? "" : init.name;
    }
    function initBoardModel(object, init) {
        object.bid = (init === undefined || init.bid === undefined) ? 0 : init.bid;
        object.name = (init === undefined || init.name === undefined) ? "" : init.name;
        object.description = (init === undefined || init.description === undefined) ? "" : init.description;
        object.layers = (init === undefined || init.layers === undefined) ? new Array() : init.layers;
    }
    let initialized = false;
    function _init() {
        if (initialized)
            return;
        initialized = true;
        ORB_1.valueTypeByName.set("Point", { attributes: ["x", "y"] });
        ORB_1.valueTypeByName.set("Size", { attributes: ["width", "height"] });
        ORB_1.valueTypeByName.set("Matrix", { attributes: ["a", "b", "c", "d", "e", "f"] });
        ORB_1.valueTypeByName.set("Rectangle", { attributes: ["origin", "size"] });
        ORB_1.valueTypeByName.set("Figure", { attributes: ["id", "matrix"] });
        ORB_1.valueTypeByName.set("figure.AttributedFigure", { attributes: ["id", "matrix", "stroke", "strokeWidth", "fill"] });
        ORB_1.valueTypeByName.set("figure.Shape", { attributes: ["id", "matrix", "stroke", "strokeWidth", "fill", "origin", "size"] });
        ORB_1.valueTypeByName.set("figure.Rectangle", { attributes: ["id", "matrix", "stroke", "strokeWidth", "fill", "origin", "size"] });
        ORB_1.valueTypeByName.set("figure.Circle", { attributes: ["id", "matrix", "stroke", "strokeWidth", "fill", "origin", "size"] });
        ORB_1.valueTypeByName.set("figure.Text", { attributes: ["id", "matrix", "stroke", "strokeWidth", "fill", "origin", "size", "text"] });
        ORB_1.valueTypeByName.set("figure.Group", { attributes: ["id", "matrix", "childFigures"] });
        ORB_1.valueTypeByName.set("figure.Transform", { attributes: ["id", "matrix", "childFigures"] });
        ORB_1.valueTypeByName.set("FigureModel", { attributes: ["data"] });
        ORB_1.valueTypeByName.set("Layer", { attributes: ["data", "id", "name"] });
        ORB_1.valueTypeByName.set("User", { attributes: ["uid", "name", "password", "email", "fullname", "avatar"] });
        ORB_1.valueTypeByName.set("Card", { attributes: ["id", "name", "description"] });
        ORB_1.valueTypeByName.set("BoardModel", { attributes: ["bid", "name", "description", "layers"] });
    }
    _init();

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class Point {
        constructor(xOrPoint, y) {
            if (xOrPoint === undefined) {
                initPoint(this);
            }
            else if (typeof xOrPoint === "object") {
                initPoint(this, xOrPoint);
            }
            else {
                initPoint(this, { x: xOrPoint, y: y });
            }
        }
        toString() {
            return `Point(${this.x}, ${this.y})`;
        }
    }
    class Size {
        constructor(widthOrSize, height) {
            if (widthOrSize === undefined) {
                initSize(this);
            }
            else if (typeof widthOrSize === "object") {
                initSize(this, widthOrSize);
            }
            else {
                initSize(this, { width: widthOrSize, height: height });
            }
        }
        toString() {
            return `Size(${this.width}, ${this.height})`;
        }
    }
    function pointPlusSize(point, size) {
        return new Point({
            x: point.x + size.width,
            y: point.y + size.height
        });
    }
    function pointMinusSize(point, size) {
        return new Point({
            x: point.x - size.width,
            y: point.y - size.height
        });
    }
    function pointPlusPoint(a, b) {
        return new Point({
            x: a.x + b.x,
            y: a.y + b.y
        });
    }
    function pointMinusPoint(a, b) {
        return new Point({
            x: a.x - b.x,
            y: a.y - b.y
        });
    }
    function pointMultiplyNumber(a, b) {
        return new Point({
            x: a.x * b,
            y: a.y * b
        });
    }
    function sizeMultiplyNumber(a, b) {
        return new Size({
            width: a.width * b,
            height: a.height * b
        });
    }
    function pointMinus(a) {
        return new Point({
            x: -a.x,
            y: -a.y
        });
    }
    function rotatePointAroundPointBy(point, center, byRadiant) {
        let vector = pointMinusPoint(point, center);
        let radiant = Math.atan2(vector.y, vector.x) + byRadiant;
        let diameter = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        let p = new Point(center.x + Math.cos(radiant) * diameter, center.y + Math.sin(radiant) * diameter);
        // FIXME: move this sanity check into separate test
        let m = new Matrix();
        m.translate(pointMinus(center));
        m.rotate(byRadiant);
        m.translate(center);
        let pp = m.transformPoint(point);
        if (!pointEqualsPoint(p, pp))
            throw Error("something's wrong with the matrix");
        return p;
    }
    // let epsilon = Number.EPSILON * 2.0
    let epsilon = 0.000000001;
    function isZero(a) {
        return Math.abs(a) <= epsilon;
    }
    function isOne(a) {
        return (1.0 - Math.abs(a)) <= epsilon;
    }
    function isEqual(a, b) {
        return isZero(a - b);
    }
    function isLessEqual(a, b) {
        if (a < b)
            return true;
        return Math.abs(a - b) < epsilon;
    }
    function pointEqualsPoint(a, b) {
        return isZero(a.x - b.x) && isZero(a.y - b.y);
    }
    function signedArea(p0, p1, p2) {
        return (p0.x - p2.x) * (p1.y - p2.y) - (p1.x - p2.x) * (p0.y - p2.y);
    }
    function squaredLength(a) {
        return a.x * a.x + a.y * a.y;
    }
    class Rectangle$1 {
        constructor(xOrOriginOrRectangle, yOrSize, width, height) {
            if (xOrOriginOrRectangle === undefined) {
                initRectangle(this);
            }
            else if (yOrSize === undefined) {
                if (!xOrOriginOrRectangle.hasOwnProperty("origin") ||
                    !xOrOriginOrRectangle.hasOwnProperty("size")) {
                    throw Error("yikes");
                }
                initRectangle(this, xOrOriginOrRectangle);
            }
            else if (width === undefined) {
                if (!xOrOriginOrRectangle.hasOwnProperty("x") || // FIXME:
                    !xOrOriginOrRectangle.hasOwnProperty("y") ||
                    !yOrSize.hasOwnProperty("width") ||
                    !yOrSize.hasOwnProperty("height")) {
                    throw Error("yikes");
                }
                initRectangle(this, { origin: xOrOriginOrRectangle, size: yOrSize });
            }
            else {
                if (typeof xOrOriginOrRectangle !== "number" ||
                    typeof yOrSize !== "number") {
                    throw Error("yikes");
                }
                initRectangle(this, { origin: { x: xOrOriginOrRectangle, y: yOrSize },
                    size: { width: width, height: height } });
            }
        }
        set(x, y, width, height) {
            this.origin.x = x;
            this.origin.y = y;
            this.size.width = width;
            this.size.height = height;
            return this;
        }
        contains(p) {
            return this.origin.x <= p.x && p.x <= this.origin.x + this.size.width &&
                this.origin.y <= p.y && p.y <= this.origin.y + this.size.height;
        }
        inside(p) {
            return this.origin.x < p.x && p.x < this.origin.x + this.size.width &&
                this.origin.y < p.y && p.y < this.origin.y + this.size.height;
        }
        containsRectangle(r) {
            return this.contains(r.origin) &&
                this.contains(new Point({ x: r.origin.x + r.size.width, y: r.origin.y })) &&
                this.contains(new Point({ x: r.origin.x + r.size.width, y: r.origin.y + r.size.height })) &&
                this.contains(new Point({ x: r.origin.x, y: r.origin.y + r.size.height }));
        }
        intersects(r) {
            // based on Dan Cohen and Ivan Sutherland's clipping algorithm
            let x00 = this.origin.x;
            let x01 = x00 + this.size.width;
            if (x00 > x01) {
                [x00, x01] = [x01, x00];
            }
            let x10 = r.origin.x;
            let x11 = x10 + r.size.width;
            if (x10 > x11) {
                [x10, x11] = [x11, x10];
            }
            let y00 = this.origin.y;
            let y01 = y00 + this.size.height;
            if (y00 > y01) {
                [y00, y01] = [y01, y00];
            }
            let y10 = r.origin.y;
            let y11 = y10 + r.size.height;
            if (y10 > y11) {
                [y10, y11] = [y11, y10];
            }
            let f0 = 0;
            if (x00 < x10)
                f0 |= 1;
            if (x00 > x11)
                f0 |= 2;
            if (y00 < y10)
                f0 |= 4;
            if (y00 > y11)
                f0 |= 8;
            let f1 = 0;
            if (x01 < x10)
                f1 |= 1;
            if (x01 > x11)
                f1 |= 2;
            if (y01 < y10)
                f1 |= 4;
            if (y01 > y11)
                f1 |= 8;
            return (f0 & f1) == 0;
        }
        expandByPoint(p) {
            if (p.x < this.origin.x) {
                this.size.width += this.origin.x - p.x;
                this.origin.x = p.x;
            }
            else if (p.x > this.origin.x + this.size.width) {
                this.size.width = p.x - this.origin.x;
            }
            if (p.y < this.origin.y) {
                this.size.height += this.origin.y - p.y;
                this.origin.y = p.y;
            }
            else if (p.y > this.origin.y + this.size.height) {
                this.size.height = p.y - this.origin.y;
            }
            return this;
        }
        center() {
            return new Point({
                x: this.origin.x + this.size.width / 2.0,
                y: this.origin.y + this.size.height / 2.0
            });
        }
        forAllEdges(callback, transform) {
            if (transform !== undefined) {
                callback(transform.transformPoint(this.origin));
                callback(transform.transformPoint(pointPlusSize(this.origin, { width: this.size.width, height: 0 })));
                callback(transform.transformPoint(pointPlusSize(this.origin, { width: 0, height: this.size.height })));
                callback(transform.transformPoint(pointPlusSize(this.origin, this.size)));
            }
            else {
                callback(this.origin);
                callback(pointPlusSize(this.origin, { width: this.size.width, height: 0 }));
                callback(pointPlusSize(this.origin, { width: 0, height: this.size.height }));
                callback(pointPlusSize(this.origin, this.size));
            }
        }
        expandByRectangle(rectangle, transform) {
            if (this.size.width === 0 && this.size.height === 0) {
                this.origin.x = rectangle.origin.x;
                this.origin.y = rectangle.origin.y;
                this.size.width = rectangle.size.width;
                this.size.height = rectangle.size.height;
            }
            else {
                rectangle.forAllEdges((edge) => {
                    this.expandByPoint(edge);
                }, transform);
            }
            return this;
        }
        inflate(expansion) {
            this.origin.x -= expansion;
            this.origin.y -= expansion;
            expansion *= 2.0;
            this.size.width += expansion;
            this.size.height += expansion;
            return this;
        }
        toString() {
            return `Rectangle(${this.origin.x}, ${this.origin.y}, ${this.size.width}, ${this.size.height})`;
        }
    }
    function lineCrossesLine(lineA, lineB) {
        // console.log("lineCrossesLine")
        let ax = lineA[1].x - lineA[0].x, ay = lineA[1].y - lineA[0].y, bx = lineB[1].x - lineB[0].x, by = lineB[1].y - lineB[0].y, cross = ax * by - ay * bx;
        if (isZero(cross))
            return false;
        let dx = lineA[0].x - lineB[0].x, dy = lineA[0].y - lineB[0].y, a = (bx * dy - by * dx) / cross, b = (ax * dy - ay * dx) / cross;
        if (isZero(a) || isOne(a) || isZero(b) || isOne(b))
            return false;
        if (a <= 0.0 || a >= 1.0 || b <= 0.0 || b >= 1.0)
            return false;
        // console.log("=> TRUE", a, b)
        return true;
    }
    function lineCrossesRect(x1, y1, x2, y2, // line
    xmin, ymin, xmax, ymax // rectangle
    ) {
        let line = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
        if (lineCrossesLine(line, [{ x: xmin, y: ymin }, { x: xmax, y: ymin }]))
            return true;
        if (lineCrossesLine(line, [{ x: xmin, y: ymax }, { x: xmax, y: ymax }]))
            return true;
        if (lineCrossesLine(line, [{ x: xmin, y: ymin }, { x: xmin, y: ymax }]))
            return true;
        if (lineCrossesLine(line, [{ x: xmax, y: ymin }, { x: xmax, y: ymax }]))
            return true;
        return false;
    }
    function lineCrossesRect2(l, r) {
        return lineCrossesRect(l[0].x, l[0].y, l[1].x, l[1].y, r.origin.x, r.origin.y, r.origin.x + r.size.width, r.origin.y + r.size.height);
    }
    // FIXME: DO A HUGE OVERHAUL: ADOPT FUNCTIONAL STYLE, DON'T LET METHODS RETURNING A MATRIX MODIFY THE MATRIX, RETURN A NEW ONE
    class Matrix {
        constructor(matrix) {
            initMatrix(this, matrix);
            if (matrix === undefined) {
                this.a = 1.0;
                this.d = 1.0;
            }
        }
        isIdentity() {
            return this.a === 1.0 && this.b === 0.0 &&
                this.c === 0.0 && this.d === 1.0 &&
                this.e === 0.0 && this.f === 0.0;
        }
        isOnlyTranslate() {
            return this.a === 1.0 && this.b === 0.0 &&
                this.c === 0.0 && this.d === 1.0;
        }
        isOnlyTranslateAndScale() {
            return this.b === 0.0 && this.c === 0.0;
        }
        identity() {
            [this.a, this.b, this.c, this.d, this.e, this.f] = [1, 0, 0, 1, 0, 0];
            return this;
        }
        append(matrix) {
            [this.a, this.b, this.c, this.d, this.e, this.f] =
                [this.a * matrix.a + this.c * matrix.b,
                    this.b * matrix.a + this.d * matrix.b,
                    this.a * matrix.c + this.c * matrix.d,
                    this.b * matrix.c + this.d * matrix.d,
                    this.a * matrix.e + this.c * matrix.f + this.e,
                    this.b * matrix.e + this.d * matrix.f + this.f];
            return this;
        }
        prepend(matrix) {
            [this.a, this.b, this.c, this.d, this.e, this.f] =
                [matrix.a * this.a + matrix.c * this.b,
                    matrix.b * this.a + matrix.d * this.b,
                    matrix.a * this.c + matrix.c * this.d,
                    matrix.b * this.c + matrix.d * this.d,
                    matrix.a * this.e + matrix.c * this.f + matrix.e,
                    matrix.b * this.e + matrix.d * this.f + matrix.f];
            return this;
        }
        invert() {
            let d = 1.0 / (this.a * this.d - this.c * this.b);
            let n11 = d * this.d;
            let n12 = d * -this.b;
            let n21 = d * -this.c;
            let n22 = d * this.a;
            let nX = d * (this.c * this.f - this.d * this.e);
            let nY = d * (this.b * this.e - this.a * this.f);
            this.a = n11;
            this.b = n12;
            this.c = n21;
            this.d = n22;
            this.e = nX;
            this.f = nY;
            return this;
        }
        translate(point) {
            let m = new Matrix({
                a: 1.0, c: 0.0, e: point.x,
                b: 0.0, d: 1.0, f: point.y
            });
            this.prepend(m);
            return this;
        }
        rotate(radiant) {
            let m = new Matrix({
                a: Math.cos(radiant), c: -Math.sin(radiant), e: 0,
                b: Math.sin(radiant), d: Math.cos(radiant), f: 0
            });
            this.prepend(m);
            return this;
        }
        getRotation() {
            let r0 = -Math.atan2(-this.b, this.a);
            let r1 = -Math.atan2(this.c, this.d);
            if (isEqual(r0, r1)) {
                if (r0 < 0)
                    r0 = Math.PI + r0;
                return r0;
            }
            return NaN;
        }
        scale(x, y) {
            let m = new Matrix({
                a: x, c: 0, e: 0,
                b: 0, d: y, f: 0
            });
            this.prepend(m);
            return this;
        }
        postTranslate(point) {
            let m = new Matrix({
                a: 1.0, c: 0.0, e: point.x,
                b: 0.0, d: 1.0, f: point.y
            });
            this.append(m);
            return this;
        }
        postRotate(radiant) {
            let m = new Matrix({
                a: Math.cos(radiant), c: -Math.sin(radiant), e: 0,
                b: Math.sin(radiant), d: Math.cos(radiant), f: 0
            });
            this.append(m);
            return this;
        }
        postScale(x, y) {
            let m = new Matrix({
                a: x, c: 0, e: 0,
                b: 0, d: y, f: 0
            });
            this.append(m);
            return this;
        }
        transformPoint(point) {
            return new Point({
                x: point.x * this.a + point.y * this.c + this.e,
                y: point.x * this.b + point.y * this.d + this.f
            });
        }
        transformArrayPoint(point) {
            return [
                point[0] * this.a + point[1] * this.c + this.e,
                point[0] * this.b + point[1] * this.d + this.f
            ];
        }
        transformSize(size) {
            return new Size({
                width: size.width * this.a + size.height * this.c,
                height: size.width * this.b + size.height * this.d
            });
        }
        toString() {
            return `{rotate: [${this.a}, ${this.b}, ${this.c}, ${this.d}], translate: [${this.e}, ${this.f}})`;
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    /**
     * The base class of a figures like rectangle, circle, bezier curve, text, image, etc
     */
    class Figure {
        constructor(init) {
            initFigure(this, init);
        }
        /**
         * create/update the figure's SVGElement
         * @param path The result from getPath() with transformations being applied.
         * @param parentSVG The SVGElement which will be this SVGElement's parent.
         * @param svg The SVGElement from a former invocation of updateSVG().
         */
        updateSVG(path, parentSVG, svg) {
            throw Error("updateSVG is not implemented for this class");
        }
    }
    Figure.FIGURE_RANGE = 5.0;
    Figure.HANDLE_RANGE = 5.0;

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    /**
     * The base class for all figures which have a stroke and/or fill.
     *
     * These include rectangle, circle, bezier curve, text, etc.
     * but not images, which bring their own color definition.
     */
    class AttributedFigure extends Figure {
        constructor(init) {
            super(init);
            this.stroke = "#000";
            this.strokeWidth = 1.0;
            this.fill = "#fff";
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    /**
     * The base class for all figures which fit into a rectangular shape with four handles to
     * scale them like rectangle, circle, text, star, ...
     */
    class Shape extends AttributedFigure {
        constructor(init) {
            super(init);
            figure.initShape(this, init);
        }
        transform(transform) {
            if (!transform.isOnlyTranslateAndScale())
                return false;
            this.origin = transform.transformPoint(this.origin);
            this.size = transform.transformSize(this.size);
            return true;
        }
        bounds() {
            return new Rectangle$1(this);
        }
        getHandlePosition(i) {
            switch (i) {
                case 0: return { x: this.origin.x, y: this.origin.y };
                case 1: return { x: this.origin.x + this.size.width, y: this.origin.y };
                case 2: return { x: this.origin.x + this.size.width, y: this.origin.y + this.size.height };
                case 3: return { x: this.origin.x, y: this.origin.y + this.size.height };
            }
            return undefined;
        }
        setHandlePosition(handle, pt) {
            if (handle < 0 || handle > 3)
                throw Error("yikes");
            if (handle == 0 || handle == 3) {
                this.size.width += this.origin.x - pt.x;
                this.origin.x = pt.x;
            }
            else {
                this.size.width += pt.x - (this.origin.x + this.size.width);
            }
            if (handle == 0 || handle == 1) {
                this.size.height += this.origin.y - pt.y;
                this.origin.y = pt.y;
            }
            else {
                this.size.height += pt.y - (this.origin.y + this.size.height);
            }
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class AbstractPath {
        translate(pointOrX, Y) {
            if (typeof pointOrX === "object")
                this.transform(new Matrix({
                    a: 1.0, b: 0.0,
                    c: 0.0, d: 1.0,
                    e: pointOrX.x, f: pointOrX.y
                }));
            else
                this.transform(new Matrix({
                    a: 1.0, b: 0.0,
                    c: 0.0, d: 1.0,
                    e: pointOrX, f: Y
                }));
            return this;
        }
    }

    var orientation = {exports: {}};

    var twoProduct_1 = twoProduct$1;

    var SPLITTER = +(Math.pow(2, 27) + 1.0);

    function twoProduct$1(a, b, result) {
      var x = a * b;

      var c = SPLITTER * a;
      var abig = c - a;
      var ahi = c - abig;
      var alo = a - ahi;

      var d = SPLITTER * b;
      var bbig = d - b;
      var bhi = d - bbig;
      var blo = b - bhi;

      var err1 = x - (ahi * bhi);
      var err2 = err1 - (alo * bhi);
      var err3 = err2 - (ahi * blo);

      var y = alo * blo - err3;

      if(result) {
        result[0] = y;
        result[1] = x;
        return result
      }

      return [ y, x ]
    }

    var robustSum = linearExpansionSum;

    //Easy case: Add two scalars
    function scalarScalar$1(a, b) {
      var x = a + b;
      var bv = x - a;
      var av = x - bv;
      var br = b - bv;
      var ar = a - av;
      var y = ar + br;
      if(y) {
        return [y, x]
      }
      return [x]
    }

    function linearExpansionSum(e, f) {
      var ne = e.length|0;
      var nf = f.length|0;
      if(ne === 1 && nf === 1) {
        return scalarScalar$1(e[0], f[0])
      }
      var n = ne + nf;
      var g = new Array(n);
      var count = 0;
      var eptr = 0;
      var fptr = 0;
      var abs = Math.abs;
      var ei = e[eptr];
      var ea = abs(ei);
      var fi = f[fptr];
      var fa = abs(fi);
      var a, b;
      if(ea < fa) {
        b = ei;
        eptr += 1;
        if(eptr < ne) {
          ei = e[eptr];
          ea = abs(ei);
        }
      } else {
        b = fi;
        fptr += 1;
        if(fptr < nf) {
          fi = f[fptr];
          fa = abs(fi);
        }
      }
      if((eptr < ne && ea < fa) || (fptr >= nf)) {
        a = ei;
        eptr += 1;
        if(eptr < ne) {
          ei = e[eptr];
          ea = abs(ei);
        }
      } else {
        a = fi;
        fptr += 1;
        if(fptr < nf) {
          fi = f[fptr];
          fa = abs(fi);
        }
      }
      var x = a + b;
      var bv = x - a;
      var y = b - bv;
      var q0 = y;
      var q1 = x;
      var _x, _bv, _av, _br, _ar;
      while(eptr < ne && fptr < nf) {
        if(ea < fa) {
          a = ei;
          eptr += 1;
          if(eptr < ne) {
            ei = e[eptr];
            ea = abs(ei);
          }
        } else {
          a = fi;
          fptr += 1;
          if(fptr < nf) {
            fi = f[fptr];
            fa = abs(fi);
          }
        }
        b = q0;
        x = a + b;
        bv = x - a;
        y = b - bv;
        if(y) {
          g[count++] = y;
        }
        _x = q1 + x;
        _bv = _x - q1;
        _av = _x - _bv;
        _br = x - _bv;
        _ar = q1 - _av;
        q0 = _ar + _br;
        q1 = _x;
      }
      while(eptr < ne) {
        a = ei;
        b = q0;
        x = a + b;
        bv = x - a;
        y = b - bv;
        if(y) {
          g[count++] = y;
        }
        _x = q1 + x;
        _bv = _x - q1;
        _av = _x - _bv;
        _br = x - _bv;
        _ar = q1 - _av;
        q0 = _ar + _br;
        q1 = _x;
        eptr += 1;
        if(eptr < ne) {
          ei = e[eptr];
        }
      }
      while(fptr < nf) {
        a = fi;
        b = q0;
        x = a + b;
        bv = x - a;
        y = b - bv;
        if(y) {
          g[count++] = y;
        } 
        _x = q1 + x;
        _bv = _x - q1;
        _av = _x - _bv;
        _br = x - _bv;
        _ar = q1 - _av;
        q0 = _ar + _br;
        q1 = _x;
        fptr += 1;
        if(fptr < nf) {
          fi = f[fptr];
        }
      }
      if(q0) {
        g[count++] = q0;
      }
      if(q1) {
        g[count++] = q1;
      }
      if(!count) {
        g[count++] = 0.0;  
      }
      g.length = count;
      return g
    }

    var twoSum$1 = fastTwoSum;

    function fastTwoSum(a, b, result) {
    	var x = a + b;
    	var bv = x - a;
    	var av = x - bv;
    	var br = b - bv;
    	var ar = a - av;
    	if(result) {
    		result[0] = ar + br;
    		result[1] = x;
    		return result
    	}
    	return [ar+br, x]
    }

    var twoProduct = twoProduct_1;
    var twoSum = twoSum$1;

    var robustScale = scaleLinearExpansion;

    function scaleLinearExpansion(e, scale) {
      var n = e.length;
      if(n === 1) {
        var ts = twoProduct(e[0], scale);
        if(ts[0]) {
          return ts
        }
        return [ ts[1] ]
      }
      var g = new Array(2 * n);
      var q = [0.1, 0.1];
      var t = [0.1, 0.1];
      var count = 0;
      twoProduct(e[0], scale, q);
      if(q[0]) {
        g[count++] = q[0];
      }
      for(var i=1; i<n; ++i) {
        twoProduct(e[i], scale, t);
        var pq = q[1];
        twoSum(pq, t[0], q);
        if(q[0]) {
          g[count++] = q[0];
        }
        var a = t[1];
        var b = q[1];
        var x = a + b;
        var bv = x - a;
        var y = b - bv;
        q[1] = x;
        if(y) {
          g[count++] = y;
        }
      }
      if(q[1]) {
        g[count++] = q[1];
      }
      if(count === 0) {
        g[count++] = 0.0;
      }
      g.length = count;
      return g
    }

    var robustDiff = robustSubtract;

    //Easy case: Add two scalars
    function scalarScalar(a, b) {
      var x = a + b;
      var bv = x - a;
      var av = x - bv;
      var br = b - bv;
      var ar = a - av;
      var y = ar + br;
      if(y) {
        return [y, x]
      }
      return [x]
    }

    function robustSubtract(e, f) {
      var ne = e.length|0;
      var nf = f.length|0;
      if(ne === 1 && nf === 1) {
        return scalarScalar(e[0], -f[0])
      }
      var n = ne + nf;
      var g = new Array(n);
      var count = 0;
      var eptr = 0;
      var fptr = 0;
      var abs = Math.abs;
      var ei = e[eptr];
      var ea = abs(ei);
      var fi = -f[fptr];
      var fa = abs(fi);
      var a, b;
      if(ea < fa) {
        b = ei;
        eptr += 1;
        if(eptr < ne) {
          ei = e[eptr];
          ea = abs(ei);
        }
      } else {
        b = fi;
        fptr += 1;
        if(fptr < nf) {
          fi = -f[fptr];
          fa = abs(fi);
        }
      }
      if((eptr < ne && ea < fa) || (fptr >= nf)) {
        a = ei;
        eptr += 1;
        if(eptr < ne) {
          ei = e[eptr];
          ea = abs(ei);
        }
      } else {
        a = fi;
        fptr += 1;
        if(fptr < nf) {
          fi = -f[fptr];
          fa = abs(fi);
        }
      }
      var x = a + b;
      var bv = x - a;
      var y = b - bv;
      var q0 = y;
      var q1 = x;
      var _x, _bv, _av, _br, _ar;
      while(eptr < ne && fptr < nf) {
        if(ea < fa) {
          a = ei;
          eptr += 1;
          if(eptr < ne) {
            ei = e[eptr];
            ea = abs(ei);
          }
        } else {
          a = fi;
          fptr += 1;
          if(fptr < nf) {
            fi = -f[fptr];
            fa = abs(fi);
          }
        }
        b = q0;
        x = a + b;
        bv = x - a;
        y = b - bv;
        if(y) {
          g[count++] = y;
        }
        _x = q1 + x;
        _bv = _x - q1;
        _av = _x - _bv;
        _br = x - _bv;
        _ar = q1 - _av;
        q0 = _ar + _br;
        q1 = _x;
      }
      while(eptr < ne) {
        a = ei;
        b = q0;
        x = a + b;
        bv = x - a;
        y = b - bv;
        if(y) {
          g[count++] = y;
        }
        _x = q1 + x;
        _bv = _x - q1;
        _av = _x - _bv;
        _br = x - _bv;
        _ar = q1 - _av;
        q0 = _ar + _br;
        q1 = _x;
        eptr += 1;
        if(eptr < ne) {
          ei = e[eptr];
        }
      }
      while(fptr < nf) {
        a = fi;
        b = q0;
        x = a + b;
        bv = x - a;
        y = b - bv;
        if(y) {
          g[count++] = y;
        } 
        _x = q1 + x;
        _bv = _x - q1;
        _av = _x - _bv;
        _br = x - _bv;
        _ar = q1 - _av;
        q0 = _ar + _br;
        q1 = _x;
        fptr += 1;
        if(fptr < nf) {
          fi = -f[fptr];
        }
      }
      if(q0) {
        g[count++] = q0;
      }
      if(q1) {
        g[count++] = q1;
      }
      if(!count) {
        g[count++] = 0.0;  
      }
      g.length = count;
      return g
    }

    (function (module) {

    var twoProduct = twoProduct_1;
    var robustSum$1 = robustSum;
    var robustScale$1 = robustScale;
    var robustSubtract = robustDiff;

    var NUM_EXPAND = 5;

    var EPSILON     = 1.1102230246251565e-16;
    var ERRBOUND3   = (3.0 + 16.0 * EPSILON) * EPSILON;
    var ERRBOUND4   = (7.0 + 56.0 * EPSILON) * EPSILON;

    function cofactor(m, c) {
      var result = new Array(m.length-1);
      for(var i=1; i<m.length; ++i) {
        var r = result[i-1] = new Array(m.length-1);
        for(var j=0,k=0; j<m.length; ++j) {
          if(j === c) {
            continue
          }
          r[k++] = m[i][j];
        }
      }
      return result
    }

    function matrix(n) {
      var result = new Array(n);
      for(var i=0; i<n; ++i) {
        result[i] = new Array(n);
        for(var j=0; j<n; ++j) {
          result[i][j] = ["m", j, "[", (n-i-1), "]"].join("");
        }
      }
      return result
    }

    function sign(n) {
      if(n & 1) {
        return "-"
      }
      return ""
    }

    function generateSum(expr) {
      if(expr.length === 1) {
        return expr[0]
      } else if(expr.length === 2) {
        return ["sum(", expr[0], ",", expr[1], ")"].join("")
      } else {
        var m = expr.length>>1;
        return ["sum(", generateSum(expr.slice(0, m)), ",", generateSum(expr.slice(m)), ")"].join("")
      }
    }

    function determinant(m) {
      if(m.length === 2) {
        return [["sum(prod(", m[0][0], ",", m[1][1], "),prod(-", m[0][1], ",", m[1][0], "))"].join("")]
      } else {
        var expr = [];
        for(var i=0; i<m.length; ++i) {
          expr.push(["scale(", generateSum(determinant(cofactor(m, i))), ",", sign(i), m[0][i], ")"].join(""));
        }
        return expr
      }
    }

    function orientation(n) {
      var pos = [];
      var neg = [];
      var m = matrix(n);
      var args = [];
      for(var i=0; i<n; ++i) {
        if((i&1)===0) {
          pos.push.apply(pos, determinant(cofactor(m, i)));
        } else {
          neg.push.apply(neg, determinant(cofactor(m, i)));
        }
        args.push("m" + i);
      }
      var posExpr = generateSum(pos);
      var negExpr = generateSum(neg);
      var funcName = "orientation" + n + "Exact";
      var code = ["function ", funcName, "(", args.join(), "){var p=", posExpr, ",n=", negExpr, ",d=sub(p,n);\
return d[d.length-1];};return ", funcName].join("");
      var proc = new Function("sum", "prod", "scale", "sub", code);
      return proc(robustSum$1, twoProduct, robustScale$1, robustSubtract)
    }

    var orientation3Exact = orientation(3);
    var orientation4Exact = orientation(4);

    var CACHED = [
      function orientation0() { return 0 },
      function orientation1() { return 0 },
      function orientation2(a, b) { 
        return b[0] - a[0]
      },
      function orientation3(a, b, c) {
        var l = (a[1] - c[1]) * (b[0] - c[0]);
        var r = (a[0] - c[0]) * (b[1] - c[1]);
        var det = l - r;
        var s;
        if(l > 0) {
          if(r <= 0) {
            return det
          } else {
            s = l + r;
          }
        } else if(l < 0) {
          if(r >= 0) {
            return det
          } else {
            s = -(l + r);
          }
        } else {
          return det
        }
        var tol = ERRBOUND3 * s;
        if(det >= tol || det <= -tol) {
          return det
        }
        return orientation3Exact(a, b, c)
      },
      function orientation4(a,b,c,d) {
        var adx = a[0] - d[0];
        var bdx = b[0] - d[0];
        var cdx = c[0] - d[0];
        var ady = a[1] - d[1];
        var bdy = b[1] - d[1];
        var cdy = c[1] - d[1];
        var adz = a[2] - d[2];
        var bdz = b[2] - d[2];
        var cdz = c[2] - d[2];
        var bdxcdy = bdx * cdy;
        var cdxbdy = cdx * bdy;
        var cdxady = cdx * ady;
        var adxcdy = adx * cdy;
        var adxbdy = adx * bdy;
        var bdxady = bdx * ady;
        var det = adz * (bdxcdy - cdxbdy) 
                + bdz * (cdxady - adxcdy)
                + cdz * (adxbdy - bdxady);
        var permanent = (Math.abs(bdxcdy) + Math.abs(cdxbdy)) * Math.abs(adz)
                      + (Math.abs(cdxady) + Math.abs(adxcdy)) * Math.abs(bdz)
                      + (Math.abs(adxbdy) + Math.abs(bdxady)) * Math.abs(cdz);
        var tol = ERRBOUND4 * permanent;
        if ((det > tol) || (-det > tol)) {
          return det
        }
        return orientation4Exact(a,b,c,d)
      }
    ];

    function slowOrient(args) {
      var proc = CACHED[args.length];
      if(!proc) {
        proc = CACHED[args.length] = orientation(args.length);
      }
      return proc.apply(undefined, args)
    }

    function generateOrientationProc() {
      while(CACHED.length <= NUM_EXPAND) {
        CACHED.push(orientation(CACHED.length));
      }
      var args = [];
      var procArgs = ["slow"];
      for(var i=0; i<=NUM_EXPAND; ++i) {
        args.push("a" + i);
        procArgs.push("o" + i);
      }
      var code = [
        "function getOrientation(", args.join(), "){switch(arguments.length){case 0:case 1:return 0;"
      ];
      for(var i=2; i<=NUM_EXPAND; ++i) {
        code.push("case ", i, ":return o", i, "(", args.slice(0, i).join(), ");");
      }
      code.push("}var s=new Array(arguments.length);for(var i=0;i<arguments.length;++i){s[i]=arguments[i]};return slow(s);}return getOrientation");
      procArgs.push(code.join(""));

      var proc = Function.apply(undefined, procArgs);
      module.exports = proc.apply(undefined, [slowOrient].concat(CACHED));
      for(var i=0; i<=NUM_EXPAND; ++i) {
        module.exports[i] = CACHED[i];
      }
    }

    generateOrientationProc();
    }(orientation));

    var robustPnp = robustPointInPolygon;

    var orient = orientation.exports;

    function robustPointInPolygon(vs, point) {
      var x = point[0];
      var y = point[1];
      var n = vs.length;
      var inside = 1;
      var lim = n;
      for(var i = 0, j = n-1; i<lim; j=i++) {
        var a = vs[i];
        var b = vs[j];
        var yi = a[1];
        var yj = b[1];
        if(yj < yi) {
          if(yj < y && y < yi) {
            var s = orient(a, b, point);
            if(s === 0) {
              return 0
            } else {
              inside ^= (0 < s)|0;
            }
          } else if(y === yi) {
            var c = vs[(i+1)%n];
            var yk = c[1];
            if(yi < yk) {
              var s = orient(a, b, point);
              if(s === 0) {
                return 0
              } else {
                inside ^= (0 < s)|0;
              }
            }
          }
        } else if(yi < yj) {
          if(yi < y && y < yj) {
            var s = orient(a, b, point);
            if(s === 0) {
              return 0
            } else {
              inside ^= (s < 0)|0;
            }
          } else if(y === yi) {
            var c = vs[(i+1)%n];
            var yk = c[1];
            if(yk < yi) {
              var s = orient(a, b, point);
              if(s === 0) {
                return 0
              } else {
                inside ^= (s < 0)|0;
              }
            }
          }
        } else if(y === yi) {
          var x0 = Math.min(a[0], b[0]);
          var x1 = Math.max(a[0], b[0]);
          if(i === 0) {
            while(j>0) {
              var k = (j+n-1)%n;
              var p = vs[k];
              if(p[1] !== y) {
                break
              }
              var px = p[0];
              x0 = Math.min(x0, px);
              x1 = Math.max(x1, px);
              j = k;
            }
            if(j === 0) {
              if(x0 <= x && x <= x1) {
                return 0
              }
              return 1 
            }
            lim = j+1;
          }
          var y0 = vs[(j+n-1)%n][1];
          while(i+1<lim) {
            var p = vs[i+1];
            if(p[1] !== y) {
              break
            }
            var px = p[0];
            x0 = Math.min(x0, px);
            x1 = Math.max(x1, px);
            i += 1;
          }
          if(x0 <= x && x <= x1) {
            return 0
          }
          var y1 = vs[(i+1)%n][1];
          if(x < x0 && (y0 < y !== y1 < y)) {
            inside ^= 1;
          }
        }
      }
      return 2 * inside - 1
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class Path extends AbstractPath {
        constructor(path) {
            super();
            this.data = [];
            if (path instanceof Array) {
                this.data.push({ type: 'M', values: [path[0].x, path[0].y] });
                for (let i = 1; i < path.length; ++i) {
                    this.data.push({ type: 'L', values: [path[i].x, path[i].y] });
                }
                this.data.push({ type: 'Z' });
            }
            else if (path instanceof Path) {
                for (let entry of path.data) {
                    switch (entry.type) {
                        case "M":
                            this.data.push({ type: 'M', values: [entry.values[0], entry.values[1]] });
                            break;
                        case "L":
                            this.data.push({ type: 'L', values: [entry.values[0], entry.values[1]] });
                            break;
                        case "C":
                            this.data.push({ type: 'C', values: [entry.values[0], entry.values[1], entry.values[2], entry.values[3], entry.values[4], entry.values[5]] });
                            break;
                        case "Z":
                            this.data.push({ type: 'Z' });
                            break;
                    }
                }
            }
        }
        clone() {
            return new Path(this);
        }
        clear() {
            this.data = [];
            return this;
        }
        empty() {
            return this.data.length == 0;
        }
        contains(point) {
            // using robustPointInPolygon for now
            // may want to have a look at "Practical Geometry Algorithms: with C++ Code" by Daniel Sunday
            const flat = [];
            for (let entry of this.data) {
                switch (entry.type) {
                    case "M":
                    case "L":
                        flat.push(entry.values);
                        break;
                    case "C":
                        throw Error("curves are not implemented yet");
                    case "Z":
                        if (entry !== this.data[this.data.length - 1])
                            throw Error("multiple segmentes are not implemented yet");
                }
            }
            return robustPnp(flat, [point.x, point.y]) <= 0;
        }
        // relativeMove
        // relativeLine
        // relativeCurve
        // append(path)
        transform(matrix) {
            for (let segment of this.data) {
                switch (segment.type) {
                    case 'M':
                    case 'L':
                        segment.values = matrix.transformArrayPoint(segment.values);
                        break;
                    case 'C':
                        {
                            let pt = matrix.transformArrayPoint([segment.values[0], segment.values[1]]);
                            segment.values[0] = pt[0];
                            segment.values[1] = pt[1];
                            pt = matrix.transformArrayPoint([segment.values[2], segment.values[3]]);
                            segment.values[2] = pt[0];
                            segment.values[3] = pt[1];
                            pt = matrix.transformArrayPoint([segment.values[4], segment.values[5]]);
                            segment.values[4] = pt[0];
                            segment.values[5] = pt[1];
                        }
                        break;
                }
            }
            return this;
        }
        move(pointOrX, Y) {
            if (typeof pointOrX === "object")
                this.data.push({ type: 'M', values: [pointOrX.x, pointOrX.y] });
            else
                this.data.push({ type: 'M', values: [pointOrX, Y] });
            return this;
        }
        line(pointOrX, Y) {
            if (typeof pointOrX === "object")
                this.data.push({ type: 'L', values: [pointOrX.x, pointOrX.y] });
            else
                this.data.push({ type: 'L', values: [pointOrX, Y] });
            return this;
        }
        curve(p0OrX0, p1OrY0, p2OrX1, Y1, X2, Y2) {
            if (typeof p0OrX0 === "object" &&
                typeof p1OrY0 === "object" &&
                typeof p2OrX1 === "object") {
                this.data.push({
                    type: 'C', values: [p0OrX0.x, p0OrX0.y,
                        p1OrY0.x, p1OrY0.y,
                        p2OrX1.x, p2OrX1.y]
                });
            }
            else if (typeof p0OrX0 === "number" &&
                typeof p1OrY0 === "number" &&
                typeof p2OrX1 === "number") {
                this.data.push({ type: 'C', values: [p0OrX0, p1OrY0, p2OrX1, Y1, X2, Y2] });
            }
            else {
                throw Error("yikes");
            }
            return this;
        }
        close() {
            this.data.push({ type: 'Z' });
            return this;
        }
        appendRect(rectangle) {
            this.move(rectangle.origin);
            this.line(rectangle.origin.x + rectangle.size.width, rectangle.origin.y);
            this.line(rectangle.origin.x + rectangle.size.width, rectangle.origin.y + rectangle.size.height);
            this.line(rectangle.origin.x, rectangle.origin.y + rectangle.size.height);
            this.close();
            return this;
        }
        appendCircle(rectangle) {
            // Michael Goldapp, "Approximation of circular arcs by cubic polynomials"
            // Computer Aided Geometric Design (#8 1991 pp.227-238) Tor Dokken and   
            // Morten Daehlen, "Good Approximations of circles by curvature-continuous
            // Bezier curves" Computer Aided Geometric Design (#7 1990 pp.  33-41).   
            // error is about 0.0273% of the circles radius
            // n := 4 segments, f := (4/3)*tan(pi/(2n))
            let f = 0.552284749831;
            let rx = 0.5 * rectangle.size.width, ry = 0.5 * rectangle.size.height, cx = rectangle.origin.x + rx, cy = rectangle.origin.y + ry;
            this.move({ x: cx, y: cy - ry });
            this.curve({ x: cx + rx * f, y: cy - ry }, { x: cx + rx, y: cy - ry * f }, { x: cx + rx, y: cy });
            this.curve({ x: cx + rx, y: cy + ry * f }, { x: cx + rx * f, y: cy + ry }, { x: cx, y: cy + ry });
            this.curve({ x: cx - rx * f, y: cy + ry }, { x: cx - rx, y: cy + ry * f }, { x: cx - rx, y: cy });
            this.curve({ x: cx - rx, y: cy - ry * f }, { x: cx - rx * f, y: cy - ry }, { x: cx, y: cy - ry });
            this.close();
            return this;
        }
        bounds() {
            let isFirstPoint = true;
            let rectangle = new Rectangle$1();
            for (let segment of this.data) {
                switch (segment.type) {
                    case 'M':
                    case 'L':
                        if (isFirstPoint) {
                            rectangle.origin.x = segment.values[0];
                            rectangle.origin.y = segment.values[1];
                            isFirstPoint = false;
                        }
                        else {
                            rectangle.expandByPoint(new Point({ x: segment.values[0], y: segment.values[1] }));
                        }
                        break;
                }
            }
            return rectangle;
        }
        createSVG(stroke = "#000", strokeWidth = 1, fill = "none") {
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "path");
            svg.setPathData(this.data);
            svg.setAttributeNS("", "stroke-width", String(strokeWidth));
            svg.setAttributeNS("", "stroke", stroke);
            svg.setAttributeNS("", "fill", fill);
            return svg;
        }
        updateSVG(parentSVG, svg) {
            if (!svg)
                svg = document.createElementNS("http://www.w3.org/2000/svg", "path");
            let svgPath = svg;
            svgPath.setPathData(this.data);
            return svg;
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class Rectangle extends Shape {
        constructor(init) {
            super(init);
            figure.initRectangle(this, init);
        }
        distance(pt) {
            // FIXME: not final: RANGE and fill="none" need to be considered
            if (this.origin.x <= pt.x && pt.x < this.origin.x + this.size.width &&
                this.origin.y <= pt.y && pt.y < this.origin.y + this.size.height) {
                return -1.0; // even closer than 0
            }
            return Number.MAX_VALUE;
        }
        getPath() {
            let path = new Path();
            path.appendRect(this);
            return path;
        }
        updateSVG(path, parentSVG, svg) {
            if (!svg)
                svg = document.createElementNS("http://www.w3.org/2000/svg", "path");
            let svgPath = svg;
            let p = path;
            svgPath.setPathData(p.data);
            svg.setAttributeNS("", "stroke-width", String(this.strokeWidth));
            svg.setAttributeNS("", "stroke", this.stroke);
            svg.setAttributeNS("", "fill", this.fill);
            return svg;
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class Circle extends Shape {
        constructor(init) {
            super(init);
            figure.initCircle(this, init);
        }
        distance(pt) {
            let rx = 0.5 * this.size.width, ry = 0.5 * this.size.height, cx = this.origin.x + rx, cy = this.origin.y + ry, dx = pt.x - cx, dy = pt.y - cy, phi = Math.atan((dy * rx) / (dx * ry));
            if (dx < 0.0)
                phi = phi + Math.PI;
            let ex = rx * Math.cos(phi), ey = ry * Math.sin(phi);
            if (this.fill !== "none") {
                let d = Math.sqrt(dx * dx + dy * dy) - Math.sqrt(ex * ex + ey * ey);
                if (d < 0.0)
                    return -1.0;
                return d;
            }
            dx -= ex;
            dy -= ey;
            return Math.sqrt(dx * dx + dy * dy);
        }
        getPath() {
            let path = new Path();
            path.appendCircle(this);
            return path;
        }
        updateSVG(path, parentSVG, svg) {
            if (!svg)
                svg = document.createElementNS("http://www.w3.org/2000/svg", "path");
            let svgPath = svg;
            let p = path;
            svgPath.setPathData(p.data);
            svg.setAttributeNS("", "stroke-width", String(this.strokeWidth));
            svg.setAttributeNS("", "stroke", this.stroke);
            svg.setAttributeNS("", "fill", this.fill);
            return svg;
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class OrderedArray {
        constructor(order) {
            this.array = new Array();
            this.order = order;
        }
        insert(element) {
            let firstIndex = 0, lastIndex = this.array.length, middleIndex = Math.floor((lastIndex + firstIndex) / 2);
            while (firstIndex < lastIndex) {
                if (this.order(element, this.array[middleIndex])) {
                    lastIndex = middleIndex - 1;
                }
                else if (this.order(this.array[middleIndex], element)) {
                    firstIndex = middleIndex + 1;
                }
                else {
                    return;
                }
                middleIndex = Math.floor((lastIndex + firstIndex) / 2);
            }
            if (middleIndex >= this.array.length) {
                this.array.push(element);
            }
            else if (middleIndex < 0) {
                this.array.splice(0, 0, element);
            }
            else if (this.order(element, this.array[middleIndex])) {
                this.array.splice(middleIndex, 0, element);
            }
            else {
                this.array.splice(middleIndex + 1, 0, element);
            }
        }
        at(index) {
            return this.array[index];
        }
        shift() {
            if (this.array.length == 0) {
                throw Error("OrderedArray.shift(): empty, can not shift");
            }
            return this.array.shift();
        }
        get length() {
            return this.array.length;
        }
        set length(a) {
            this.array.length = a;
        }
        empty() {
            return this.array.length === 0;
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    // description of an intersection between path segments
    class IntersectionPoint {
        constructor(type, src, u, pt) {
            this.type = type;
            this.src = src;
            this.u = u;
            this.pt = pt;
        }
    }
    class Intersection {
        constructor(t0, s0, u0, p0, t1, s1, u1, p1) {
            this.seg0 = new IntersectionPoint(t0, s0, u0, p0);
            this.seg1 = new IntersectionPoint(t1, s1, u1, p1);
        }
    }
    function _intersectLineLine(lineA, lineB) {
        let ax = lineA[1].x - lineA[0].x, ay = lineA[1].y - lineA[0].y, bx = lineB[1].x - lineB[0].x, by = lineB[1].y - lineB[0].y, cross = ax * by - ay * bx;
        if (isZero(cross))
            return undefined;
        let dx = lineA[0].x - lineB[0].x, dy = lineA[0].y - lineB[0].y, a = (bx * dy - by * dx) / cross, b = (ax * dy - ay * dx) / cross;
        if (a < 0.0 || a > 1.0 || b < 0.0 || b > 1.0)
            return undefined;
        return new Point(lineA[0].x + a * ax, lineA[0].y + a * ay);
    }
    function intersectLineLine(ilist, lineA, lineB) {
        let ax = lineA[1].x - lineA[0].x, ay = lineA[1].y - lineA[0].y, bx = lineB[1].x - lineB[0].x, by = lineB[1].y - lineB[0].y, cross = ax * by - ay * bx;
        if (isZero(cross))
            return;
        let dx = lineA[0].x - lineB[0].x, dy = lineA[0].y - lineB[0].y, a = (bx * dy - by * dx) / cross, b = (ax * dy - ay * dx) / cross;
        if (a < 0.0 || a > 1.0 || b < 0.0 || b > 1.0)
            return;
        let p = new Point(lineA[0].x + a * ax, lineA[0].y + a * ay);
        ilist.push(new Intersection("L", lineA, a, p, "L", lineB, b, p));
    }
    // a path is broken down into sweep events for the sweep algorithm
    class SweepEvent {
        constructor(p0OrEvent, p1) {
            if (p1 === undefined) {
                let e = p0OrEvent;
                this.type = e.type;
                this.p = new Array();
                for (let p of e.p) {
                    this.p.push(p);
                }
            }
            else {
                this.type = "L";
                this.p = new Array();
                this.p.push(p0OrEvent);
                this.p.push(p1);
            }
        }
        static less(e0, e1) {
            if (e0.p[0].y < e1.p[0].y)
                return true;
            if (e1.p[0].y < e0.p[0].y)
                return false;
            if (e0.p[0].x !== e1.p[0].x)
                return e0.p[0].x < e1.p[0].x;
            // see that e0 comes after e1 clockwise
            return signedArea(e0.p[0], e0.p[1], e1.p[1]) < 0;
        }
        toString() {
            let txt = `(${this.type}, [`;
            this.p.forEach(point => txt += `(${point.x},${point.y}), `);
            txt += `])`;
            return txt;
        }
    }
    // a slice represents a vertical corridor within the path
    class Slice {
        constructor() {
            this.left = new Array();
            this.right = new Array();
        }
    }
    // FIXME: make Array<Slice> a class with print function
    function printSlices(slices, asScript = true) {
        // return
        if (!asScript) {
            for (let sliceIndex = 0; sliceIndex < slices.length; ++sliceIndex) {
                let slice = slices[sliceIndex];
                console.log(`-------------------------- slice ${sliceIndex}: leftTop=${slice.left[0].p[0].x}, ${slice.left[0].p[0].y}, rightTop=${slice.right[0].p[0].x}, ${slice.right[0].p[0].y}  --------------------------`);
                for (let i = 0; i < slice.left.length; ++i) {
                    console.log(`left[${i}]  : ${slice.left[i].p[0].x}, ${slice.left[i].p[0].y} -> ${slice.left[i].p[1].x}, ${slice.left[i].p[1].y}`);
                }
                for (let i = 0; i < slice.right.length; ++i) {
                    console.log(`right[${i}]: ${slice.right[i].p[0].x}, ${slice.right[i].p[0].y} -> ${slice.right[i].p[1].x}, ${slice.right[i].p[1].y}`);
                }
            }
        }
        else {
            console.log("slices = [");
            for (let slice of slices) {
                console.log("    Slice {");
                console.log("        left = [");
                for (let event of slice.left) {
                    console.log("            ", event.p[0]);
                    console.log("            ", event.p[1]);
                    if (pointEqualsPoint(event.p[0], event.p[1]))
                        console.log("            EVENT IS A SINGULARITY *********************************************************");
                }
                console.log("        ]");
                console.log("        right = [");
                for (let event of slice.right) {
                    console.log("            ", event.p[0]);
                    console.log("            ", event.p[1]);
                    if (pointEqualsPoint(event.p[0], event.p[1]))
                        console.log("            EVENT IS A SINGULARITY *********************************************************");
                }
                console.log("        ]");
                console.log("    }");
            }
            console.log("]");
        }
    }
    function validateSlices(slices) {
        for (let sliceIndex = 0; sliceIndex < slices.length; ++sliceIndex) {
            let slice = slices[sliceIndex];
            for (let i = 0; i < slice.left.length; ++i) {
                if (slice.left[i].p[0].y > slice.left[i].p[1].y) {
                    console.log(`!!!!! slice ${sliceIndex}, left ${i}: edge doesn't point downX`);
                    printSlices(slices, true);
                    throw Error();
                }
            }
            for (let i = 0; i < slice.right.length; ++i) {
                if (slice.right[i].p[0].y > slice.right[i].p[1].y) {
                    console.log(`!!!!! slice ${sliceIndex}, right ${i}: edge doesn't point down`);
                    throw Error();
                }
            }
            let leftIndex = 0, rightIndex = 0;
            while (leftIndex < slice.left.length && slice.left[leftIndex].p[0].y < slice.right[rightIndex].p[0].y) {
                ++leftIndex;
            }
            while (rightIndex < slice.right.length && slice.left[leftIndex].p[0].y > slice.right[rightIndex].p[0].y) {
                ++rightIndex;
            }
            while (leftIndex < slice.left.length &&
                rightIndex < slice.right.length &&
                slice.left[leftIndex].p[0].y == slice.right[rightIndex].p[0].y &&
                slice.left[leftIndex].p[1].y == slice.right[rightIndex].p[1].y) {
                ++leftIndex;
                ++rightIndex;
            }
            if (leftIndex < slice.left.length && rightIndex < slice.right.length) ;
            // if (slice.left.length != slice.right.length) {
            //     okay = false
            //     console.log(`slice ${sliceIndex}, number of edges on left and right differ`)
            // } else {
            //     for(let i = 0; i < slice.left.length; ++i) {
            //         if (slice.left[i].p[0].y != slice.right[i].p[0].y) {
            //             okay = false
            //             console.log(`slice ${sliceIndex}, top of left and right edges at ${i} differs`)
            //         }
            //         if (slice.left[i].p[0].y != slice.right[i].p[0].y) {
            //             okay = false
            //             console.log(`slice ${sliceIndex}, bottom of left and right edges at ${i} differs`)
            //         }
            //     }
            // }
        }
    }
    // the events within a slice which surround a space available for a word to be placed
    class CornerEvents {
        constructor() {
            this.topLeftEvent = -1;
            this.bottomLeftEvent = -1;
            this.topRightEvent = -1;
            this.bottomRightEvent = -1;
        }
        hasLeftAndRightCorners() {
            return (this.topLeftEvent != -1 || this.bottomLeftEvent != -1) &&
                (this.topRightEvent != -1 || this.bottomRightEvent != -1);
        }
    }
    function withinSlices(rectangle, slices, trace = false) {
        if (trace) {
            console.log("WITHINSLICES ------------------------");
            console.log(rectangle);
            console.log(slices);
        }
        let rectTop = rectangle.origin.y, rectBottom = rectTop + rectangle.size.height, rectLeft = rectangle.origin.x, rectRight = rectLeft + rectangle.size.width;
        // PRECONDITION
        for (let i = 0; i < slices.length; ++i) {
            let slice = slices[i];
            if (rectTop < slice.left[0].p[0].y) {
                if (trace)
                    console.log("WITHINSLICES => FALSE (1)");
                return false;
            }
            if (rectBottom > slice.left[slice.left.length - 1].p[1].y) {
                if (trace)
                    console.log("WITHINSLICES => FALSE (2)");
                return false;
            }
            if (rectTop < slice.right[0].p[0].y) {
                if (trace)
                    console.log("WITHINSLICES => FALSE (3)");
                return false;
            }
            if (rectBottom > slice.right[slice.right.length - 1].p[1].y) {
                if (trace)
                    console.log("WITHINSLICES => FALSE (4)");
                return false;
            }
        }
        // ALGORITHM
        for (let i = 0; i < slices.length; ++i) {
            let slice = slices[i], leftOfBoxIsInside = true, rightOfBoxIsInside = true;
            for (let j = 0; j < slice.left.length; ++j) {
                // console.log("---------------------------")
                // console.log("left", j)
                // console.log(slice.left[j].p)
                if (slice.left[j].p[1].y < rectTop) {
                    // console.log("too high")
                    continue;
                }
                if (rectBottom < slice.left[j].p[0].y) {
                    // console.log("too low")
                    break;
                }
                if (rectRight < slice.left[j].p[0].x && rectRight < slice.left[j].p[1].x) {
                    // console.log("left of box")
                    leftOfBoxIsInside = false;
                    break;
                }
                if (slice.left[j].p[0].x <= rectLeft && slice.left[j].p[1].x <= rectLeft) {
                    // console.log("right of box")
                    continue;
                }
                // console.log("at least one endpoint within rectangle?")
                if (rectangle.contains(slice.left[j].p[0]) || rectangle.contains(slice.left[j].p[1])) {
                    // console.log("yes")
                    if (trace)
                        console.log("WITHINSLICES => FALSE (5)");
                    return false;
                }
                // console.log("no")
                // console.log("event crosses rectangle?")
                if (lineCrossesRect2(slice.left[j].p, rectangle)) {
                    if (trace) {
                        console.log("WITHINSLICES: LEFT CROSSES RECT");
                        console.log(rectangle);
                        console.log(slice.left[j].p);
                    }
                    leftOfBoxIsInside = false;
                    break;
                }
                // console.log("no")
            }
            if (!leftOfBoxIsInside) {
                if (trace)
                    console.log("WITHINSLICES: leftOfBoxIsInside");
                continue;
            }
            for (let j = 0; j < slice.right.length; ++j) {
                if (slice.right[j].p[1].y < rectTop)
                    continue;
                if (rectBottom < slice.right[j].p[0].y)
                    break;
                if (slice.right[j].p[0].x < rectLeft && slice.right[j].p[1].x < rectLeft) {
                    rightOfBoxIsInside = false;
                    break;
                }
                if (rectRight <= slice.right[j].p[0].x && rectRight <= slice.right[j].p[1].x)
                    continue;
                if (rectangle.contains(slice.right[j].p[0]) || rectangle.contains(slice.right[j].p[1])) {
                    if (trace)
                        console.log("WITHINSLICES => FALSE (6)");
                    return false;
                }
                if (lineCrossesRect2(slice.right[j].p, rectangle)) {
                    if (trace)
                        console.log("WITHINSLICES: RIGHT LINE CROSSES RECT");
                    rightOfBoxIsInside = false;
                    break;
                }
            }
            if (rightOfBoxIsInside) {
                if (trace) {
                    console.log(rectangle);
                    console.log(slices);
                    console.log("WITHINSLICES => TRUE");
                }
                return true;
            }
        }
        if (trace)
            console.log("WITHINSLICES => FALSE (7)");
        return false;
    }
    function appendEventAsNewSlice(slices, segment, sweepBuffer, bounds, trace = false) {
        // console.log(">>>>>>>>>>")
        let top = segment.p[0].y, line = [new Point(bounds.origin.x - 10, top),
            new Point(bounds.origin.x + bounds.size.width + 10, top)], intersectionsLeft = new Array(), intersectionsRight = new Array();
        let appendNewSliceAtRight = true;
        for (let sliceIndex = 0; sliceIndex < slices.length; ++sliceIndex) {
            intersectionsLeft.length = intersectionsRight.length = 0;
            // check for intersections with the slice's left side
            if (trace)
                console.log("check for intersections with the slice's left");
            for (let j = 0; j < slices[sliceIndex].left.length; ++j) {
                if (slices[sliceIndex].left[j].p[0].y <= top && top <= slices[sliceIndex].left[j].p[1].y) {
                    intersectLineLine(intersectionsLeft, line, slices[sliceIndex].left[j].p);
                }
            }
            // if new sweep event is left of the slice's left, create a new slice left of the slice
            if (segment.p[0].x < intersectionsLeft[0].seg0.pt.x) {
                if (trace)
                    console.log("new segment is outside the slide on the left");
                let newSlice = new Slice();
                newSlice.left.push(segment);
                if (sweepBuffer.length === 0)
                    throw Error("yikes");
                newSlice.right.push(sweepBuffer.shift());
                slices.splice(sliceIndex, 0, newSlice);
                appendNewSliceAtRight = false;
                break;
            }
            // check for intersections with the slice's right side
            if (trace)
                console.log("check for intersections with the slice's right");
            for (let j = 0; j < slices[sliceIndex].right.length; ++j) {
                if (slices[sliceIndex].right[j].p[0].y <= top && top <= slices[sliceIndex].right[j].p[1].y) {
                    intersectLineLine(intersectionsRight, line, slices[sliceIndex].right[j].p);
                }
            }
            // if new sweep event is left of the slice's right, split the slice into two slices
            if (segment.p[0].x < intersectionsRight[0].seg0.pt.x) {
                if (trace) {
                    console.log(`new segment is inside the slice`);
                    console.log(segment);
                }
                let newSlice = new Slice();
                let emptySegmentArray = newSlice.left;
                // the new slice's left becomes the old slice's left
                newSlice.left = slices[sliceIndex].left;
                // the new segment becomes the new slice's right HERE WE NEED TO EXTEND SHIT
                // COPY FROM THE OLD SLICE'S RIGHT DOWN TO TOP OF SEGMENT
                for (let i = 0; i < slices[sliceIndex].right.length && slices[sliceIndex].right[i].p[0].y < top; ++i) {
                    newSlice.right.push(new SweepEvent(slices[sliceIndex].right[i]));
                }
                newSlice.right[slices[sliceIndex].right.length - 1].p[1] = intersectionsRight[0].seg0.pt;
                // console.log('copied old slices right to new slices right and tweaked last point to intersection')
                newSlice.right[slices[sliceIndex].right.length - 1];
                // console.log(`${s.p[0].x}, ${s.p[0].y} -> ${s.p[1].x}, ${s.p[1].y}`)
                if (pointEqualsPoint(newSlice.right[slices[sliceIndex].right.length - 1].p[0], newSlice.right[slices[sliceIndex].right.length - 1].p[1])) {
                    newSlice.right.pop();
                    // throw Error("singularity")
                }
                newSlice.right.push(segment);
                // the old slice's left get's the next segment from the sweep buffer
                slices[sliceIndex].left = emptySegmentArray;
                // COPY FROM THE OLD SLICE'S LEFT DOWN TO TOP OF SEGMENT
                for (let i = 0; i < newSlice.left.length && newSlice.left[i].p[0].y < top; ++i) {
                    slices[sliceIndex].left.push(new SweepEvent(newSlice.left[i]));
                }
                slices[sliceIndex].left[slices[sliceIndex].left.length - 1].p[1] = intersectionsLeft[0].seg0.pt;
                // console.log('copied new slices left to old slices left and tweaked last point to intersection')
                slices[sliceIndex].left[slices[sliceIndex].left.length - 1];
                // console.log(`${s.p[0].x}, ${s.p[0].y} -> ${s.p[1].x}, ${s.p[1].y}`)
                if (pointEqualsPoint(slices[sliceIndex].left[slices[sliceIndex].left.length - 1].p[0], slices[sliceIndex].left[slices[sliceIndex].left.length - 1].p[1])) {
                    slices[sliceIndex].left.pop();
                    // throw Error("singularity")
                }
                slices[sliceIndex].left.push(sweepBuffer.shift());
                // insert the new slice
                slices.splice(sliceIndex, 0, newSlice);
                appendNewSliceAtRight = false;
                break;
            }
            // console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
        }
        if (appendNewSliceAtRight) {
            // if (this.trace)
            //     console.log("new segment is outside the slide on the right")
            let newSlice = new Slice();
            newSlice.left.push(segment);
            newSlice.right.push(sweepBuffer.shift());
            slices.push(newSlice);
        }
    }
    class WordWrap {
        /**
         * WordWrap algorithm will place all words provided by wordsource inside path
         */
        constructor(path, wordsource, trace) {
            this.trace = trace == true;
            this.sweepBuffer = new OrderedArray((a, b) => { return SweepEvent.less(a, b); });
            this.initializeSweepBufferFrom(path);
            // do not place the word boxes yet
            if (wordsource === undefined)
                return;
            this.placeWordBoxes(wordsource);
        }
        initializeSweepBufferFrom(path) {
            this.bounds = path.bounds();
            this.sweepBuffer.length = 0;
            let first, previous, current;
            for (let segment of path.data) {
                switch (segment.type) {
                    case 'M':
                        first = previous = new Point(segment.values[0], segment.values[1]);
                        break;
                    case 'L':
                        current = new Point(segment.values[0], segment.values[1]);
                        this.addSweepLine(previous, current);
                        previous = current;
                        break;
                    case 'C':
                        break;
                    case 'Z':
                        this.addSweepLine(previous, first);
                        break;
                }
            }
        }
        addSweepLine(p0, p1) {
            if (isZero(p0.y - p1.y))
                return;
            if ((p0.y > p1.y) ||
                (p0.y === p1.y && p0.x > p1.x)) {
                [p0, p1] = [p1, p0];
            }
            let sweepEvent = new SweepEvent(p0, p1);
            this.sweepBuffer.insert(sweepEvent);
        }
        placeWordBoxes(wordsource) {
            if (this.trace)
                console.log("WordWrap.placeWordBoxes(): ENTER");
            let slices = [];
            // if ((wordsource as TextSource).current != 0) {
            //     throw Error(`wordwrap placeWordBoxes start with box ${(wordsource as TextSource).current}`)
            // }
            wordsource.reset();
            let box = wordsource.pullBox();
            if (box === undefined) {
                console.log("WordWrap.placeWordBoxes(): NO BOXES");
                return;
            }
            // FIND THE POSITION OF THE FIRST BOX
            let [sliceIndex, cursor] = this.pointForBoxInSlices(box, slices);
            cursor = new Point(cursor);
            if (sliceIndex === -1) {
                if (this.trace)
                    console.log("WordWrap.placeWordBoxes(): NOT EVEN A FIRST SLICE");
                return;
            }
            let cornerEvents = this.findCornersAtCursorForBoxAtSlice(cursor, box, slices[sliceIndex]);
            let [left, right] = this.leftAndRightForAtCursorForBox(cursor, box, slices, sliceIndex, cornerEvents);
            let availableHorizontalSpace = right - left;
            if (this.trace) {
                console.log(`WordWrap.placeWordBoxes(): ENTER LOOP, HORIZONTAL SPACE IS ${availableHorizontalSpace}`);
                this.printSlices(slices);
            }
            while (box) {
                // when we have enough horizontal space, place the box
                // FIXME: this does not check the vertical space
                if (isLessEqual(box.width, availableHorizontalSpace)) {
                    wordsource.placeBox(cursor);
                    cursor.x += box.width + wordsource.space;
                    availableHorizontalSpace -= box.width + wordsource.space;
                    box = wordsource.pullBox();
                    if (this.trace) {
                        console.log(`WordWrap.placeWordBoxes(): PLACED BOX, REDUCED HORIZONTAL SPACE TO ${availableHorizontalSpace}`);
                        this.printSlices(slices);
                    }
                    continue;
                }
                wordsource.endOfSlice();
                // there wasn't enough horizontal space in this slice. if there's another slice, continue the line there
                ++sliceIndex;
                if (sliceIndex < slices.length) {
                    if (this.trace)
                        console.log(`WordWrap.placeWordBoxes(): NOT ENOUGH HORIZONTAL SPACE FOR ${box.width}, MOVE TO SLICE ${sliceIndex}`);
                    let cornerEvents = this.findCornersAtCursorForBoxAtSlice(cursor, box, slices[sliceIndex]);
                    let [left, right] = this.leftAndRightForAtCursorForBox(cursor, box, slices, sliceIndex, cornerEvents);
                    availableHorizontalSpace = right - left;
                    cursor.x = left;
                    continue;
                }
                // we've reached the last slice in the line, move to another line
                if (this.trace) {
                    console.log(`WordWrap.placeWordBoxes(): NOT ENOUGH HORIZONTAL SPACE FOR ${box.width}, LAST SLICE, NEW LINE`);
                    this.printSlices(slices);
                }
                wordsource.endOfLine();
                // move to new row
                sliceIndex = -1;
                availableHorizontalSpace = 0;
                cursor.y += box.height; // FIXME: this is already the next box to be placed AND boxes/lines may have different heights and ascents
                // console.log("WordWrap.placeWordBoxes(): before extendSlices()")
                // this.printSlices(slices)
                this.extendSlices(cursor, box, slices);
                // console.log("WordWrap.placeWordBoxes(): after extendSlices()")
                // this.printSlices(slices)
                // this.validateSlices(slices)
                // abort when below bounding box
                if (cursor.y + box.height > this.bounds.origin.y + this.bounds.size.height)
                    break;
            }
            wordsource.endOfWrap();
            if (this.trace)
                console.log("WordWrap.placeWordBoxes(): LEAVE");
        }
        printSlices(slices) {
            printSlices(slices);
        }
        validateSlices(slices) {
            validateSlices(slices);
        }
        pointForBoxInSlices(box, slices) {
            if (this.trace)
                console.log("======================== WordWrap.pointForBoxInSlices ========================");
            let point = new Point(this.bounds.origin);
            while (true) {
                if (this.trace)
                    console.log(`-------------------------- extend & level slices to accomodate ${point.y} to ${point.y + box.height} -----------------------------------------`);
                // console.log("####### BEFORE EXTENDSLICES")
                // this.printSlices(slices)
                // this.validateSlices(slices)
                this.extendSlices(point, box, slices);
                // console.log("####### BEFORE SLICE HORIZONTALLY")
                // this.printSlices(slices)
                // this.validateSlices(slices)
                // this.levelSlicesHorizontally(slices)
                // console.log("####### BEFORE MERGE AND DROP")
                // this.printSlices(slices)
                // this.validateSlices(slices)
                // this.mergeAndDropSlices(point, box, slices)
                // console.log("####### AFTER MERGE AND DROP")
                // this.printSlices(slices)
                // this.validateSlices(slices)
                if (slices.length === 0)
                    break;
                // CRAWL OVER SLICES AND FIND MOST TOP,LEFT ONE
                let rect = new Rectangle$1(point, box);
                for (let sliceIndex = 0; sliceIndex < slices.length; ++sliceIndex) {
                    let slice = slices[sliceIndex];
                    for (let leftIndex = 0; leftIndex < slice.left.length; ++leftIndex) {
                        for (let rightIndex = 0; rightIndex < slice.right.length; ++rightIndex) {
                            if (this.trace) {
                                console.log("CHECK ", sliceIndex, leftIndex, rightIndex, slice.left[leftIndex], slice.right[rightIndex]);
                            }
                            let possiblePoint = this.pointForBoxInCornerCore(box, slice.left[leftIndex], slice.right[rightIndex]);
                            if (possiblePoint !== undefined) {
                                rect.origin = possiblePoint;
                                if (withinSlices(rect, slices, this.trace)) {
                                    if (this.trace) {
                                        console.log("pointForBoxInSlices => point (1)");
                                    }
                                    return [sliceIndex, rect.origin];
                                }
                            }
                            possiblePoint = this.pointForBoxAtTop(box, slice.left[leftIndex], slice.right[rightIndex]);
                            if (possiblePoint !== undefined) {
                                rect.origin = possiblePoint;
                                if (withinSlices(rect, slices, this.trace)) {
                                    if (this.trace) {
                                        console.log("pointForBoxInSlices => point (2)");
                                    }
                                    return [sliceIndex, rect.origin];
                                }
                            }
                            possiblePoint = this.pointForBoxAtEdge(box, slice.left[leftIndex], slice.right[rightIndex]);
                            if (possiblePoint !== undefined) {
                                // this.mergeAndDropSlices(possiblePoint, box, slices)
                                this.extendSlices(possiblePoint, box, slices);
                                // this.levelSlicesHorizontally(slices)
                                rect.origin = possiblePoint;
                                if (withinSlices(rect, slices)) {
                                    if (this.trace) {
                                        console.log("pointForBoxInSlices => point (3)");
                                    }
                                    return [sliceIndex, rect.origin];
                                }
                            }
                            if (this.trace)
                                console.log(`pointForBoxInSlices point ${point.x}, ${point.y} not within slices (4)`);
                        }
                    }
                }
                point.y += box.height;
            }
            if (this.trace)
                console.log("pointForBoxInSlices => undefined (5)");
            return [-1, point];
        }
        // FIXME: would withinSlices() also cover the check done here?
        pointForBoxAtTop(box, leftEvent, rightEvent) {
            if (this.trace)
                console.log(`WordWrap.pointForBoxInCorner(box: (${box.width}, ${box.height}), left: ${leftEvent}, right: ${rightEvent})`);
            if (leftEvent.p[0].y !== rightEvent.p[0].y)
                return undefined;
            let leftPoint = leftEvent.p[0], leftVector = pointMinusPoint(leftEvent.p[1], leftPoint), rightPoint = rightEvent.p[0], sweepWidthTop = rightEvent.p[0].x - leftEvent.p[0].x;
            // top is not wide enough for box
            if (sweepWidthTop < box.width) // TODO: USE isZero()
                return undefined;
            // left side is /
            if (leftVector.x <= 0) { // FIXME: use isZero()?
                if (this.trace)
                    console.log("[2] return ", leftEvent.p[0]);
                return leftEvent.p[0];
            }
            // left side is \
            let bottomLine = [
                new Point(this.bounds.origin.x - 10, leftEvent.p[0].y + box.height),
                new Point(this.bounds.origin.x + this.bounds.size.width + 10, leftEvent.p[0].y + box.height)
            ];
            let leftPoint2 = _intersectLineLine(leftEvent.p, bottomLine);
            if (leftPoint2 === undefined) {
                console.log(`pointForBoxAtTop(): failed to find leftPoint2 between left event and bottom line at y=${bottomLine[0].y}`);
                return undefined;
            }
            leftPoint2.y = leftEvent.p[0].y;
            if (leftPoint2.x + box.width > rightPoint.x) {
                if (this.trace)
                    console.log("NOPE");
                return undefined;
            }
            let rightPoint2 = _intersectLineLine(rightEvent.p, bottomLine);
            if (rightPoint2) {
                if (rightPoint2.x - box.width < leftPoint2.x) {
                    if (this.trace)
                        console.log("[0] return undefined");
                    return undefined;
                }
            }
            if (this.trace)
                console.log("[1] return ", leftPoint2);
            return leftPoint2;
        }
        pointForBoxInCornerCore(box, leftEvent, rightEvent) {
            if (this.trace)
                console.log("WordWrap.pointForBoxInCornerCore");
            //             <--- sweepWidthTop -->
            // leftPoint  O                      O rightPoint
            //            |                      |
            // leftVector V                      V rightVector
            //             <- sweepWidthBottom ->
            let leftPoint = leftEvent.p[0], leftVector = pointMinusPoint(leftEvent.p[1], leftPoint), rightPoint = rightEvent.p[0], rightVector = pointMinusPoint(rightEvent.p[1], rightPoint), sweepWidthTop = rightEvent.p[0].x - leftEvent.p[0].x, sweepWidthBottom = rightEvent.p[1].x - leftEvent.p[1].x;
            if (sweepWidthTop < box.width && sweepWidthBottom < box.width)
                return undefined;
            if (this.trace)
                console.log("left and right vector:", leftVector, rightVector);
            // case:  \ \
            if (leftVector.x > 0 && rightVector.x > 0) {
                let d = new Point(box.width, -box.height);
                let E = leftVector.y / leftVector.x, v = (leftPoint.y + E * (rightPoint.x - leftPoint.x - d.x) + d.y - rightPoint.y) / (rightVector.y - E * rightVector.x);
                let p = pointPlusPoint(rightPoint, pointMultiplyNumber(rightVector, v));
                p.x -= box.width;
                if (this.trace) {
                    console.log("[4] return ", p);
                    console.log("p    :", p);
                    console.log("left :", leftEvent.p);
                    console.log("right:", rightEvent.p);
                }
                return p;
            }
            // case:  / /
            if (leftVector.x < 0 && rightVector.x < 0) {
                let d = new Point(box.width, box.height);
                let E = leftVector.y / leftVector.x, v = (leftPoint.y + E * (rightPoint.x - leftPoint.x - d.x) + d.y - rightPoint.y) / (rightVector.y - E * rightVector.x);
                let p = pointPlusPoint(rightPoint, pointMultiplyNumber(rightVector, v));
                p.x -= box.width;
                p.y -= box.height;
                if (this.trace)
                    console.log("[5] return ", p);
                return p;
            }
            // case: / \ )
            if (sweepWidthTop < sweepWidthBottom) {
                let rightEventMovedToLeft = [
                    new Point(rightEvent.p[0].x - box.width, rightEvent.p[0].y),
                    new Point(rightEvent.p[1].x - box.width, rightEvent.p[1].y)
                ];
                let p = _intersectLineLine(leftEvent.p, rightEventMovedToLeft);
                if (p !== undefined) {
                    if (this.trace)
                        console.log("[7] return ", p);
                    return p;
                }
            }
            // case: \ /
            if ((leftVector.x <= 0 && rightVector.x >= 0) &&
                isZero(rightEvent.p[0].y - leftEvent.p[0].y) &&
                (rightEvent.p[0].x - leftEvent.p[0].x) >= box.width) {
                if (this.trace)
                    console.log("[8] return ", leftEvent.p[0]);
                return leftEvent.p[0];
            }
            if (this.trace)
                console.log("[9] return undefined");
            return undefined;
        }
        //            _
        //            \ ----
        //             \    ----
        //              X       ----
        pointForBoxAtEdge(box, leftEvent, rightEvent) {
            let yMax = Math.max(leftEvent.p[1].y, rightEvent.p[1].y) + 10;
            let verticalLine = [new Point(leftEvent.p[1].x, leftEvent.p[0].y),
                new Point(leftEvent.p[1].x, yMax)];
            let crossingPoint = _intersectLineLine(verticalLine, rightEvent.p);
            if (crossingPoint === undefined)
                return undefined;
            let left = new SweepEvent(crossingPoint, verticalLine[1]);
            let right = new SweepEvent(crossingPoint, rightEvent.p[1]);
            return this.pointForBoxInCornerCore(box, left, right);
        }
        // pull as much slices as are required for current line
        extendSlices(cursor, box, slices) {
            // if (this.trace) {
            //     console.log("============== extendSlices =======================")
            //     console.log("  this.sweepBuffer.length = " + this.sweepBuffer.length)
            // }
            cursor.y;
            let bottom = cursor.y + box.height;
            // if (this.trace) {
            //     console.log("  extend slices to cover y=["+top+" - "+bottom+"]")
            //     console.log("  sweepBuffer has "+this.sweepBuffer.length+" entries")
            // }
            // for all sweep buffer elements within [top - bottom]
            while (!this.sweepBuffer.empty() &&
                this.sweepBuffer.at(0).p[0].y <= bottom) {
                // console.log("####### LOOP: BEFORE LEVEL HORIZONTALLY")
                // this.printSlices(slices)
                this.validateSlices(slices);
                this.levelSlicesHorizontally(slices);
                // console.log("####### LOOP: BEFORE MERGE AND DROP SLICES")
                // this.printSlices(slices)
                this.validateSlices(slices);
                this.mergeAndDropSlices(cursor, box, slices);
                // get next sweep event
                let segment = this.sweepBuffer.shift();
                // try to use sweep event as continuation of a existing slice
                // console.log("####### LOOP: BEFORE APPEND EVENT TO SLICES")
                // this.printSlices(slices)
                this.validateSlices(slices);
                if (this.appendEventToSlices(slices, segment)) {
                    // console.log("####### LOOP: ADDED EVENT TO SLICE")
                    // this.printSlices(slices)
                    this.validateSlices(slices);
                    continue;
                }
                // console.log("####### LOOP: ADDED NEW SLICE")
                this.appendEventAsNewSlice(slices, segment, this.trace);
                // this.printSlices(slices)
                this.validateSlices(slices);
            }
            // console.log("####### FINISH: BEFORE LEVEL HORIZONTALLY")
            // this.printSlices(slices)
            this.validateSlices(slices);
            this.levelSlicesHorizontally(slices);
            // console.log("####### FINISH: BEFORE MERGE AND DROP SLICES")
            // this.printSlices(slices)
            this.validateSlices(slices);
            this.mergeAndDropSlices(cursor, box, slices);
            // console.log("####### FINISH: BEFORE DROP EVENTS")
            // this.printSlices(slices)
            this.validateSlices(slices);
            this.dropEventsInSlices(cursor, box, slices);
            // console.log("####### FINISH: DONE EXTENDING")
            // this.printSlices(slices)
            this.validateSlices(slices);
        }
        appendEventToSlices(slices, segment) {
            for (let slice of slices) {
                if (slice.left.length == 0) {
                    console.log("Upsi, left slice is empty");
                }
                if (slice.right.length == 0)
                    console.log("Upsi, right slice is empty");
                if (pointEqualsPoint(slice.left[slice.left.length - 1].p[1], segment.p[0])) {
                    // if(this.trace)
                    //     console.log("extend slice on the left")
                    slice.left.push(segment);
                    return true;
                }
                else if (pointEqualsPoint(slice.right[slice.right.length - 1].p[1], segment.p[0])) {
                    // if (this.trace)
                    //     console.log("extend slice on the right")
                    slice.right.push(segment);
                    return true;
                }
            }
            return false;
        }
        appendEventAsNewSlice(slices, segment, trace = false) {
            appendEventAsNewSlice(slices, segment, this.sweepBuffer, this.bounds, trace);
        }
        // cut events vertically so that left and right event at the same index have the same y values
        levelSlicesHorizontally(slices) {
            // if (this.trace)
            //     console.log("levelSlicesHorizontally")
            for (let slice of slices) {
                // if (this.trace)
                //     console.log("  handle a slice")
                for (let index = 0; index < slice.left.length; ++index) {
                    if (index >= slice.left.length || index >= slice.right.length)
                        break;
                    if (slice.left[index].p[1].y > slice.right[index].p[1].y) {
                        // if (this.trace)
                        //     console.log("split left event")
                        // split left event
                        let pt = _intersectLineLine([new Point(this.bounds.origin.x - 10, slice.right[index].p[1].y),
                            new Point(this.bounds.origin.x + this.bounds.size.width + 10, slice.right[index].p[1].y)], slice.left[index].p);
                        if (pt === undefined) {
                            console.log(slice.right[index].p[1].y);
                            console.log(slice.left[index].p);
                            throw Error("yikes");
                        }
                        if (!pointEqualsPoint(slice.left[index].p[0], pt)) {
                            let event = new SweepEvent(slice.left[index].p[0], pt);
                            slice.left[index].p[0] = pt;
                            slice.left.splice(index, 0, event);
                        }
                    }
                    else if (slice.left[index].p[1].y < slice.right[index].p[1].y) {
                        // if (this.trace)
                        //     console.log("split right event")
                        // split right event
                        let pt = _intersectLineLine(slice.right[index].p, [new Point(this.bounds.origin.x - 10, slice.left[index].p[1].y),
                            new Point(this.bounds.origin.x + this.bounds.size.width + 10, slice.left[index].p[1].y)]);
                        if (pt === undefined) {
                            console.log(slice.right[index]);
                            console.log(slice.left[index].p[1].y);
                            throw Error("failed to split right event on left event");
                        }
                        if (!pointEqualsPoint(slice.right[index].p[0], pt)) {
                            let event = new SweepEvent(slice.right[index].p[0], pt);
                            slice.right[index].p[0] = pt;
                            slice.right.splice(index, 0, event);
                        }
                    }
                }
            }
        }
        dropEventsInSlices(cursor, box, slices) {
            // drop events
            for (let slice of slices) {
                while (slice.left.length > 0 && slice.left[0].p[1].y < cursor.y) {
                    slice.left.shift();
                }
                while (slice.right.length > 0 && slice.right[0].p[1].y < cursor.y) {
                    slice.right.shift();
                }
            }
        }
        mergeAndDropSlices(cursor, box, slices) {
            for (let index = 0; index < slices.length;) {
                if ((slices[index].left.length === 0 || slices[index].left[slices[index].left.length - 1].p[1].y < cursor.y) &&
                    (slices[index].right.length === 0 || slices[index].right[slices[index].right.length - 1].p[1].y < cursor.y)) {
                    // drop empty slice
                    slices.splice(index, 1);
                }
                else if (slices.length >= 2 &&
                    (slices[index].right.length === 0 || slices[index].right[slices[index].right.length - 1].p[1].y < cursor.y) &&
                    (slices[index + 1].left.length === 0 || slices[index + 1].left[slices[index + 1].left.length - 1].p[1].y < cursor.y)) {
                    // merge slices
                    slices[index].right = slices[index + 1].right;
                    slices.splice(index + 1, 1);
                }
                else {
                    ++index;
                }
            }
        }
        leftAndRightForAtCursorForBox(cursor, box, slices, sliceIndex, cornerEvents) {
            let topY = cursor.y, bottomY = cursor.y + box.height, horizontalTopLine = [new Point(this.bounds.origin.x - 10, topY),
                new Point(this.bounds.origin.x + this.bounds.size.width + 10, topY)], horizontalBottomLine = [new Point(this.bounds.origin.x - 10, bottomY),
                new Point(this.bounds.origin.x + this.bounds.size.width + 10, bottomY)], topLeft, topRight, bottomLeft, bottomRight;
            if (cornerEvents.topLeftEvent !== -1) {
                let intersections = new Array();
                intersectLineLine(intersections, slices[sliceIndex].left[cornerEvents.topLeftEvent].p, horizontalTopLine);
                if (intersections.length !== 1)
                    throw Error("yikes");
                topLeft = intersections[0].seg0.pt.x;
            }
            if (cornerEvents.topRightEvent !== -1) {
                let intersections = new Array();
                intersectLineLine(intersections, slices[sliceIndex].right[cornerEvents.topRightEvent].p, horizontalTopLine);
                if (intersections.length !== 1)
                    throw Error("yikes");
                topRight = intersections[0].seg0.pt.x;
            }
            if (cornerEvents.bottomLeftEvent !== -1) {
                let intersections = new Array();
                intersectLineLine(intersections, slices[sliceIndex].left[cornerEvents.bottomLeftEvent].p, horizontalBottomLine);
                if (intersections.length !== 1)
                    throw Error("yikes");
                bottomLeft = intersections[0].seg0.pt.x;
            }
            if (cornerEvents.bottomRightEvent !== -1) {
                let intersections = new Array();
                intersectLineLine(intersections, slices[sliceIndex].right[cornerEvents.bottomRightEvent].p, horizontalBottomLine);
                if (intersections.length !== 1)
                    throw Error("yikes");
                bottomRight = intersections[0].seg0.pt.x;
            }
            let left, right;
            if (topLeft === undefined) {
                left = bottomLeft;
            }
            else if (bottomLeft == undefined) {
                left = topLeft;
            }
            else {
                left = Math.max(topLeft, bottomLeft);
            }
            if (topRight === undefined) {
                right = bottomRight;
            }
            else if (bottomRight === undefined) {
                right = topRight;
            }
            else {
                right = Math.min(topRight, bottomRight);
            }
            return [left, right];
        }
        findCornersAtCursorForBoxAtSlice(cursor, box, slice) {
            let topY = cursor.y;
            let bottomY = cursor.y + box.height;
            let cornerEvents = new CornerEvents();
            for (let index = 0; index < slice.left.length; ++index) {
                if (slice.left[index].p[0].y <= topY && topY <= slice.left[index].p[1].y) {
                    cornerEvents.topLeftEvent = index;
                }
                if (slice.left[index].p[0].y <= bottomY && bottomY <= slice.left[index].p[1].y) {
                    cornerEvents.bottomLeftEvent = index;
                    break;
                }
            }
            for (let index = 0; index < slice.right.length; ++index) {
                if (slice.right[index].p[0].y <= topY && topY <= slice.right[index].p[1].y) {
                    cornerEvents.topRightEvent = index;
                }
                if (slice.right[index].p[0].y <= bottomY && bottomY <= slice.right[index].p[1].y) {
                    cornerEvents.bottomRightEvent = index;
                    break;
                }
            }
            return cornerEvents;
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class WordBox extends Rectangle$1 {
        constructor(w, h, word) {
            super(0, 0, w, h);
            this.ascent = 0;
            this.word = word;
            this.endOfLine = false;
            this.endOfSlice = false;
            this.endOfWrap = false;
        }
        reset() {
            this.endOfLine = false;
            this.endOfSlice = false;
            this.endOfWrap = false;
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class TextSource {
        constructor(text) {
            this.wordBoxes = [];
            this.current = 0;
            this.space = 0;
            this.height = 0;
            if (text == undefined)
                text = "Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
            TextSource.splitTextIntoWordBoxes(this.wordBoxes, text);
        }
        toString() {
            let text = "";
            for (const box of this.wordBoxes) {
                if (text.length != 0)
                    text += " ";
                text += box.word;
            }
            return text;
        }
        static splitTextIntoWordBoxes(wordBoxes, text) {
            let word = '';
            for (let char of text) {
                switch (char) {
                    case ' ':
                    case '\t':
                    case '\r':
                    case '\n':
                    case '\v':
                        let rectangle = new WordBox(word.length * 8, 16, word);
                        wordBoxes.push(rectangle);
                        word = "";
                        break;
                    default:
                        word += char;
                }
            }
            if (word.length > 0) {
                let rectangle = new WordBox(word.length * 8, 16, word);
                wordBoxes.push(rectangle);
            }
            if (wordBoxes.length === 0) {
                let rectangle = new WordBox(0, 16, "");
                wordBoxes.push(rectangle);
            }
        }
        reset() {
            this.current = 0;
            for (let w of this.wordBoxes) {
                w.reset();
            }
        }
        initializeWordBoxes(parentSVG) {
            this.parentSVG = parentSVG;
            // set this.space
            let spacer = document.createElementNS("http://www.w3.org/2000/svg", "text");
            spacer.setAttributeNS("", "font-family", "sans-serif");
            spacer.setAttributeNS("", "font-size", "12px");
            spacer.innerHTML = "&nbsp;";
            parentSVG.appendChild(spacer);
            this.space = spacer.getComputedTextLength();
            parentSVG.removeChild(spacer);
            // set height
            let a = document.createElementNS("http://www.w3.org/2000/svg", "text");
            a.innerHTML = "X";
            parentSVG.appendChild(a);
            this.height = a.getBBox().height;
            parentSVG.removeChild(a);
        }
        pullBox() {
            // console.log(`TextSource.pullBox(): current=${this.current}, wordBoxes.length=${this.wordBoxes.length}`)
            if (this.current >= this.wordBoxes.length) {
                // console.log(`  return undefined`)
                return undefined;
            }
            const word = this.wordBoxes[this.current];
            if (word.svg === undefined) {
                let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.style.cursor = "inherit";
                text.setAttributeNS("", "font-family", "sans-serif");
                text.setAttributeNS("", "font-size", "12px");
                text.setAttributeNS("", "stroke", "none");
                text.setAttributeNS("", "fill", "none");
                text.setAttributeNS("", "x", "0");
                text.setAttributeNS("", "y", "0");
                text.textContent = word.word;
                word.svg = text;
                this.parentSVG.appendChild(text);
            }
            // with the baseline at y, the bounding box provides information on ascent & descent
            const y = Number.parseFloat(word.svg.getAttributeNS("", "y"));
            let bbox = word.svg.getBBox();
            word.ascent = y - bbox.y;
            word.ascent = y - bbox.y;
            // console.log(word)
            if (word.word.length !== 0) {
                word.size.width = word.svg.getComputedTextLength();
                let bbox = word.svg.getBBox();
                word.size.height = bbox.height;
            }
            else {
                word.size.width = 0;
                word.size.height = this.height;
            }
            // console.log(`  return word '${word.word}' with svg ${word.svg === undefined ? "no" : "yes"}`)
            return word.size;
        }
        displayWordBoxes() {
            this.updateSVG();
        }
        updateSVG() {
            var _a;
            let visible = true;
            for (let word of this.wordBoxes) {
                if (visible) {
                    if (word.svg === undefined) {
                        console.log(`TextSource: word within visible area has no SVG element`);
                    }
                    else {
                        word.svg.setAttributeNS("", "x", `${word.origin.x}`);
                        word.svg.setAttributeNS("", "y", `${word.origin.y + word.ascent}`);
                        word.svg.setAttributeNS("", "fill", "#000");
                    }
                }
                else {
                    if (word.svg) {
                        (_a = word.svg.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(word.svg);
                        word.svg = undefined;
                    }
                }
                if (word.endOfWrap)
                    visible = false;
            }
        }
        placeBox(origin) {
            Object.assign(this.wordBoxes[this.current].origin, origin);
            ++this.current;
        }
        endOfSlice() {
            this.wordBoxes[this.current - 1].endOfSlice = true;
        }
        endOfLine() {
            this.wordBoxes[this.current - 1].endOfLine = true;
        }
        endOfWrap() {
            this.wordBoxes[this.current - 1].endOfWrap = true;
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class Text extends Shape {
        constructor(init) {
            super(init);
            this.stroke = "none";
            this.fill = "#000";
            figure.initText(this, init);
        }
        get text() {
            return this.textSource.toString();
        }
        set text(value) {
            this.textSource = new TextSource(value);
        }
        distance(pt) {
            // FIXME: not final: RANGE and fill="none" need to be considered
            if (this.origin.x <= pt.x && pt.x < this.origin.x + this.size.width &&
                this.origin.y <= pt.y && pt.y < this.origin.y + this.size.height) {
                return -1.0; // even closer than 0
            }
            return Number.MAX_VALUE;
        }
        getPath() {
            let path = new Path();
            path.appendRect(this);
            return path;
        }
        updateSVG(path, parentSVG, svg) {
            if (!svg) {
                // console.trace(`Text.updateSVG(): create new SVG group for the text`)
                // console.log(this)
                svg = document.createElementNS("http://www.w3.org/2000/svg", "g");
                svg.style.cursor = "inherit";
                parentSVG.appendChild(svg); // add to parent to that the calculation works
                this.textSource.initializeWordBoxes(svg);
                let wordwrap = new WordWrap(path);
                wordwrap.placeWordBoxes(this.textSource);
                this.textSource.updateSVG();
                // this.cursor = new TextEditor(this, svg, this.textSource)
                parentSVG.removeChild(svg); // FIXME: change API so that figures add themselves to the parent
            }
            else {
                this.textSource.reset();
                this.textSource.initializeWordBoxes(svg);
                let wordwrap = new WordWrap(path);
                wordwrap.placeWordBoxes(this.textSource);
                this.textSource.updateSVG();
                // this.cursor.updateCursor()
            }
            return svg;
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class Group extends Figure {
        constructor(init) {
            super(init);
            figure.initGroup(this, init);
        }
        add(figure) {
            this.childFigures.push(figure);
        }
        transform(transform) {
            return false;
        }
        distance(pt) {
            throw Error("not yet implemented");
        }
        bounds() {
            throw Error("not yet implemented");
        }
        getHandlePosition(i) {
            return undefined;
        }
        setHandlePosition(handle, pt) {
        }
        getPath() {
            throw Error("nope");
            // let path = new PathGroup()
            // for (let child of this.childFigures) {
            //     path.add(child.getPath())
            // }
            // return path
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    // TODO: get rid of this class and move the functionality into Group
    class Transform extends Group {
        constructor(init) {
            super(init);
            figure.initTransform(this, init);
        }
        add(figure) {
            this.childFigures.push(figure);
        }
        transform(matrix) {
            this.matrix.prepend(matrix);
            return true;
        }
        appendMatrix(matrix) {
            this.matrix.append(matrix);
            return true;
        }
        prependMatrix(matrix) {
            this.matrix.prepend(matrix);
            return true;
        }
        distance(pt) {
            let m = new Matrix(this.matrix);
            m.invert();
            pt = m.transformPoint(pt);
            return this.childFigures[0].distance(pt);
        }
        bounds() {
            let path = new Path();
            path.appendRect(this.childFigures[0].bounds());
            path.transform(this.matrix);
            return path.bounds();
        }
        getHandlePosition(i) {
            return undefined;
        }
        setHandlePosition(handle, pt) {
        }
        getPath() {
            let path = super.getPath();
            path.transform(this.matrix);
            return path;
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class Layer {
        constructor(init) {
            initFigureModel(this, init); // FIXME corba.js: shouldn't initLayer include this call?
            initLayer(this, init);
        }
        findFigureAt(point) {
            let mindist = Number.POSITIVE_INFINITY;
            let nearestFigure;
            for (let index = this.data.length - 1; index >= 0; --index) {
                let figure = this.data[index];
                let pointInFigureSpace;
                if (figure.matrix !== undefined) {
                    pointInFigureSpace = new Matrix(figure.matrix).invert().transformPoint(point);
                }
                else {
                    pointInFigureSpace = point;
                }
                let d = figure.distance(pointInFigureSpace);
                if (d < mindist) {
                    mindist = d;
                    nearestFigure = figure;
                }
            }
            if (mindist >= Figure.FIGURE_RANGE) {
                return undefined;
            }
            return nearestFigure;
        }
    }

    var bindDecorator = {};

    Object.defineProperty(bindDecorator, "__esModule", { value: true });
    var constants;
    (function (constants) {
        constants.typeOfFunction = 'function';
        constants.boolTrue = true;
    })(constants || (constants = {}));
    function bind(target, propertyKey, descriptor) {
        if (!descriptor || (typeof descriptor.value !== constants.typeOfFunction)) {
            throw new TypeError("Only methods can be decorated with @bind. <" + propertyKey + "> is not a method!");
        }
        return {
            configurable: constants.boolTrue,
            get: function () {
                var bound = descriptor.value.bind(this);
                // Credits to https://github.com/andreypopp/autobind-decorator for memoizing the result of bind against a symbol on the instance.
                Object.defineProperty(this, propertyKey, {
                    value: bound,
                    configurable: constants.boolTrue,
                    writable: constants.boolTrue
                });
                return bound;
            }
        };
    }
    var bind_1 = bindDecorator.bind = bind;
    bindDecorator.default = bind;

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class FigureSelectionModel {
        constructor() {
            this.modified = new toad.exports.Signal();
            this.selection = new Set();
        }
        set(figure) {
            this.selection.clear();
            this.selection.add(figure);
            this.modified.trigger();
        }
        add(figure) {
            this.selection.add(figure);
            this.modified.trigger();
        }
        remove(figure) {
            this.selection.delete(figure);
            this.modified.trigger();
        }
        replace(oldFigure, newFigure) {
            this.selection.delete(oldFigure);
            this.selection.add(newFigure);
            this.modified.trigger();
        }
        has(figure) {
            return this.selection.has(figure);
        }
        empty() {
            return this.selection.size === 0;
        }
        clear() {
            this.selection.clear();
            this.modified.trigger();
        }
        figureIds() {
            let result = new Array();
            for (let figure of this.selection)
                result.push(figure.id);
            return result;
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class Tool {
        constructor() {
            if (Tool.selection === undefined)
                Tool.selection = new FigureSelectionModel(); // FIXME: initialization via static doesn't work
            this.transformation = new Matrix();
            this.boundary = new Rectangle$1();
            this.boundaryTransformation = new Matrix();
            this.handles = new Map();
        }
        activate(event) { }
        deactivate(event) { }
        mousedown(event) { }
        mousemove(event) { }
        mouseup(event) { }
        keydown(event) { }
        clipboard(editor, event) { }
        updateBoundary() {
            // console.log(`SelectTool.updateBoundary() ENTER`)
            this.boundaryTransformation.identity();
            this.boundary = new Rectangle$1();
            if (Tool.selection.empty()) {
                // console.log(`SelectTool.updateBoundary() DONE`)
                return;
            }
            // get rotation of the selected figures
            let firstRotation = true;
            let rotation = 0.0;
            for (let figure of Tool.selection.selection) {
                let r;
                if (figure.matrix === undefined) {
                    r = 0.0;
                }
                else {
                    r = figure.matrix.getRotation();
                    if (isNaN(r)) {
                        rotation = 0.0;
                        break;
                    }
                }
                if (firstRotation) {
                    firstRotation = false;
                    rotation = r;
                }
                else {
                    if (!isEqual(r % (Math.PI / 2), rotation % (Math.PI / 2))) {
                        rotation = 0.0;
                        break;
                    }
                }
            }
            // get boundary of selected figures in a coordinate system rotated by 'rotation'
            let rotationAroundOrigin = new Matrix();
            rotationAroundOrigin.rotate(rotation);
            let inverseRotationAroundOrigin = new Matrix(rotationAroundOrigin).invert();
            let boundary = new Rectangle$1();
            let firstEdge = true;
            for (let figure of Tool.selection.selection) {
                let figureBoundary = figure.bounds();
                // console.log(`figure ${figure.id} matrix`, figure.matrix)
                figureBoundary.forAllEdges((edge) => {
                    // console.log(`figure ${figure.id} edge ${edge.x}, ${edge.y}`)
                    edge = inverseRotationAroundOrigin.transformPoint(edge);
                    if (firstEdge) {
                        firstEdge = false;
                        boundary.origin = edge;
                    }
                    else {
                        boundary.expandByPoint(edge);
                    }
                }, figure.matrix);
            }
            // get center in real coordinate system
            let center = rotationAroundOrigin.transformPoint(boundary.center());
            // setup rotated boundary
            this.boundary.origin = pointMinusSize(center, sizeMultiplyNumber(boundary.size, 0.5));
            this.boundary.size = boundary.size;
            if (rotation != 0.0) {
                this.boundaryTransformation.translate(pointMinus(center));
                this.boundaryTransformation.rotate(rotation);
                this.boundaryTransformation.translate(center);
            }
            // console.log(`SelectTool.updateBoundary() DONE`)
        }
        getBoundaryHandle(handle) {
            const m = new Matrix(this.transformation);
            m.append(this.boundaryTransformation);
            let x = this.boundary.origin.x, y = this.boundary.origin.y, w = this.boundary.size.width, h = this.boundary.size.height;
            m.transformPoint({ x: x + w / 2, y: y + h / 2 });
            let handleDirection;
            switch (handle % 8) {
                case 0:
                    handleDirection = { x: -1, y: -1 };
                    break;
                case 1:
                    handleDirection = { x: 0, y: -1 };
                    break;
                case 2:
                    handleDirection = { x: 1, y: -1 };
                    break;
                case 3:
                    handleDirection = { x: 1, y: 0 };
                    break;
                case 4:
                    handleDirection = { x: 1, y: 1 };
                    break;
                case 5:
                    handleDirection = { x: 0, y: 1 };
                    break;
                case 6:
                    handleDirection = { x: -1, y: 1 };
                    break;
                case 7:
                    handleDirection = { x: -1, y: 0 };
                    break;
            }
            const origin = m.transformPoint({ x: 0, y: 0 });
            handleDirection = pointMinusPoint(m.transformPoint(handleDirection), origin);
            //
            // ROTATE
            //
            if (handle >= 8) {
                let previous, center;
                switch (handle) {
                    case 8:
                        previous = m.transformPoint({ x: x, y: y + h });
                        center = m.transformPoint({ x: x, y: y });
                        break;
                    case 9:
                        previous = m.transformPoint({ x: x, y: y });
                        center = m.transformPoint({ x: x + w / 2, y: y });
                        break;
                    case 10:
                        previous = m.transformPoint({ x: x, y: y });
                        center = m.transformPoint({ x: x + w, y: y });
                        break;
                    case 11:
                        previous = m.transformPoint({ x: x + w, y: y });
                        center = m.transformPoint({ x: x + w, y: y + h / 2 });
                        break;
                    case 12:
                        previous = m.transformPoint({ x: x + w, y: y });
                        center = m.transformPoint({ x: x + w, y: y + h });
                        break;
                    case 13:
                        previous = m.transformPoint({ x: x + w, y: y + h });
                        center = m.transformPoint({ x: x + w / 2, y: y + h });
                        break;
                    case 14:
                        previous = m.transformPoint({ x: x + w, y: y + h });
                        center = m.transformPoint({ x: x, y: y + h });
                        break;
                    case 15:
                        previous = m.transformPoint({ x: x, y: y + h });
                        center = m.transformPoint({ x: x, y: y + h / 2 });
                        break;
                    default:
                        throw Error("yikes");
                }
                const toCenterX = pointMinusPoint(center, previous);
                const toCenter = pointMultiplyNumber(toCenterX, 1 / Math.sqrt(squaredLength(toCenterX)));
                const scale1 = m.transformPoint({ x: 0, y: 0 });
                const scale2 = m.transformPoint({ x: Figure.HANDLE_RANGE, y: 0 });
                const size = Math.sqrt(squaredLength(pointMinusPoint(scale2, scale1)));
                let start = pointPlusPoint(center, pointMultiplyNumber(toCenter, -size * 2));
                if (handle % 2 !== 0)
                    start = rotatePointAroundPointBy(start, center, -Math.PI / 4);
                const path = new Path();
                path.move(center);
                for (let i = 0, r = Math.PI / 2; i <= 8; ++i, r += Math.PI / 16) {
                    path.line(rotatePointAroundPointBy(start, center, r));
                }
                path.close();
                return { path, handleDirection };
            }
            switch (handle % 8) {
                case 0:
                    [x, y] = [x, y];
                    break;
                case 1:
                    [x, y] = [x + w / 2.0, y];
                    break;
                case 2:
                    [x, y] = [x + w, y];
                    break;
                case 3:
                    [x, y] = [x + w, y + h / 2.0];
                    break;
                case 4:
                    [x, y] = [x + w, y + h];
                    break;
                case 5:
                    [x, y] = [x + w / 2.0, y + h];
                    break;
                case 6:
                    [x, y] = [x, y + h];
                    break;
                case 7:
                    [x, y] = [x, y + h / 2.0];
                    break;
            }
            const r = new Rectangle$1(x, y, Figure.HANDLE_RANGE, Figure.HANDLE_RANGE);
            r.origin = m.transformPoint(r.origin);
            r.origin.x -= Figure.HANDLE_RANGE / 2.0;
            r.origin.y -= Figure.HANDLE_RANGE / 2.0;
            r.origin.x = Math.round(r.origin.x - 0.5) + 0.5;
            r.origin.y = Math.round(r.origin.y - 0.5) + 0.5;
            const path = new Path();
            path.appendRect(r);
            return { path, handleDirection };
        }
        setCursorForHandle(h, handle, svg) {
            const r1 = Math.atan2(handle.handleDirection.y, handle.handleDirection.x);
            const r2 = r1 + (13 - 7.5) / 16 * 2 * Math.PI;
            let r3 = (Math.round(r2 / (2 * Math.PI) * 8) + 8) % 8;
            // console.log(`h=${h}, r1=${r1}, r2=${r2}, r3=${r3}`)
            if (h >= 8)
                r3 += 8;
            switch (r3) {
                case 0:
                    svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-nw.svg) 6 6, move`);
                    break;
                case 1:
                    svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-n.svg) 4 7, move`);
                    break;
                case 2:
                    svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-ne.svg) 6 6, move`);
                    break;
                case 3:
                    svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-e.svg) 7 4, move`);
                    break;
                case 4:
                    svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-se.svg) 6 6, move`);
                    break;
                case 5:
                    svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-s.svg) 4 7, move`);
                    break;
                case 6:
                    svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-sw.svg) 6 6, move`);
                    break;
                case 7:
                    svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-w.svg) 7 4, move`);
                    break;
                case 8:
                    svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-nw.svg) 5 5, move`);
                    break;
                case 9:
                    svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-n.svg) 7 2, move`);
                    break;
                case 10:
                    svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-ne.svg) 8 5, move`);
                    break;
                case 11:
                    svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-e.svg) 5 7, move`);
                    break;
                case 12:
                    svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-se.svg) 8 8, move`);
                    break;
                case 13:
                    svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-s.svg) 7 5, move`);
                    break;
                case 14:
                    svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-sw.svg) 5 8, move`);
                    break;
                case 15:
                    svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-w.svg) 2 7, move`);
                    break;
            }
        }
        /*******************************************************************
         *                                                                 *
         *             O U T L I N E   &   D E C O R A T I O N             *
         *                                                                 *
         *******************************************************************/
        // NOTE: might want to generalize this in the future to be available
        //       for all tools, plugable for different look/device requirements,
        //       handles could be distinguished into corner, curve, ...
        updateOutlineAndDecorationOfSelection(editor) {
            // console.log(`Tool.updateOutlineAndDecorationOfSelection() for selection of ${Tool.selection.selection.size} figures`)
            this.updateOutlineOfSelection(editor);
            this.updateDecorationOfSelection(editor);
        }
        updateOutlineOfSelection(editor) {
            // console.log(`Tool.updateOutlineAndDecorationOfSelection() for selection of ${Tool.selection.selection.size} figures`)
            this.removeOutlines(editor);
            this.createOutlines(editor);
        }
        updateDecorationOfSelection(editor) {
            // console.log(`Tool.updateOutlineAndDecorationOfSelection() for selection of ${Tool.selection.selection.size} figures`)
            this.removeDecoration(editor);
            this.createDecoration(editor);
        }
        createOutlines(editor) {
            this.outline = document.createElementNS("http://www.w3.org/2000/svg", "g");
            // this.outline.setAttributeNS("", "transform", "translate(-1, 1)")
            for (let figure of Tool.selection.selection) {
                this.outline.appendChild(this.createOutline(editor, figure));
            }
            editor.decorationOverlay.appendChild(this.outline);
        }
        createOutline(editor, figure) {
            let path = figure.getPath();
            if (figure.matrix !== undefined)
                path.transform(figure.matrix);
            path.transform(this.transformation);
            let svg = path.updateSVG(editor.decorationOverlay, undefined);
            this.setOutlineColors(svg);
            return svg;
        }
        removeOutlines(editor) {
            if (this.outline) {
                editor.decorationOverlay.removeChild(this.outline);
                this.outline = undefined;
            }
        }
        setOutlineColors(svg) {
            if (svg instanceof SVGGElement) {
                // for(let child of svg.childNodes) {
                for (let i = 0; i < svg.childNodes.length; ++i) {
                    let child = svg.childNodes[i];
                    this.setOutlineColors(child);
                }
            }
            else {
                svg.setAttributeNS("", "stroke-width", "1");
                svg.setAttributeNS("", "stroke", "rgb(79,128,255)");
                svg.setAttributeNS("", "fill", "none");
            }
        }
        updateDecoration(editor) {
            this.removeDecoration(editor);
            this.createDecoration(editor);
        }
        createDecoration(editor) {
            if (Tool.selection.empty())
                return;
            this.decoration = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.updateBoundary(); // FIXME: side effect
            this.createDecorationRectangle(editor);
            this.createDecorationHandles(editor);
            editor.decorationOverlay.appendChild(this.decoration);
        }
        createDecorationRectangle(editor) {
            // adjust boundary to nice looking screen coordinates
            let rectangle = new Rectangle$1(this.boundary);
            rectangle.origin.x = Math.round(rectangle.origin.x - 0.5) + 0.5;
            rectangle.origin.y = Math.round(rectangle.origin.y - 0.5) + 0.5;
            rectangle.size.width = Math.round(rectangle.size.width);
            rectangle.size.height = Math.round(rectangle.size.height);
            // convert to path
            let path = new Path();
            path.appendRect(rectangle);
            // transform path to screen
            let m = new Matrix(this.transformation);
            m.append(this.boundaryTransformation);
            path.transform(m);
            // display path
            let svg = path.createSVG("rgb(79,128,255)");
            this.decoration.appendChild(svg);
        }
        createDecorationHandles(editor) {
            for (let h = 15; h >= 0; --h) {
                // let path = new Path()
                // path.appendRect(this.getBoundaryHandle(handle))
                const handle = this.getBoundaryHandle(h);
                let svg;
                if (h < 8) {
                    svg = handle.path.createSVG("rgb(79,128,255)", 1, "#fff");
                }
                else {
                    // transparent SVGElement can not be seen but clicked
                    svg = handle.path.createSVG("rgba(0,0,0,0)", 1, "rgba(0,0,0,0)");
                    // svg = handle.path.createSVG("rgb(79,128,255)", 1, "#ff0")
                }
                this.setCursorForHandle(h, handle, svg);
                this.decoration.appendChild(svg);
            }
        }
        removeDecoration(editor) {
            if (this.decoration) {
                editor.decorationOverlay.removeChild(this.decoration);
                this.decoration = undefined;
            }
        }
    }
    Tool.cursorPath = "img/cursor/";

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    var SelectToolState;
    (function (SelectToolState) {
        SelectToolState[SelectToolState["NONE"] = 0] = "NONE";
        SelectToolState[SelectToolState["DRAG_MARQUEE"] = 1] = "DRAG_MARQUEE";
        SelectToolState[SelectToolState["MOVE_HANDLE"] = 2] = "MOVE_HANDLE";
        SelectToolState[SelectToolState["MOVE_SELECTION"] = 3] = "MOVE_SELECTION"; // move selected
    })(SelectToolState || (SelectToolState = {}));
    class SelectTool extends Tool {
        constructor() {
            super();
            this.state = SelectToolState.NONE;
            this.marqueeOutlines = new Map();
            this.selectedHandle = 0;
            this.handleStart = new Point();
            this.oldBoundary = new Rectangle$1();
            this.rotationCenter = new Point();
            this.rotationStartDirection = 0;
        }
        activate(event) {
            event.editor.svgView.style.cursor = "default";
            Tool.selection.modified.add(() => {
                this.updateOutlineAndDecorationOfSelection(event.editor);
            }, this);
            Tool.selection.modified.trigger();
        }
        deactivate(event) {
            Tool.selection.modified.remove(this);
            this.removeOutlines(event.editor);
            this.removeDecoration(event.editor);
        }
        mousedown(event) {
            this.mouseDownAt = event;
            this.mouseLastAt = event;
            if (this.downHandle(event)) {
                this.state = SelectToolState.MOVE_HANDLE;
                // console.log(`DOWN: START TO MOVE HANDLE ${this.selectedHandle}`)
                return;
            }
            this.transformation.identity();
            let figure = event.editor.selectedLayer.findFigureAt(event);
            if (figure === undefined) {
                if (!event.shiftKey) {
                    Tool.selection.clear();
                }
                this.state = SelectToolState.DRAG_MARQUEE;
                return;
            }
            this.state = SelectToolState.MOVE_SELECTION;
            if (Tool.selection.has(figure)) {
                return;
            }
            Tool.selection.modified.lock();
            if (!event.shiftKey)
                Tool.selection.clear();
            Tool.selection.add(figure);
            Tool.selection.modified.unlock();
        }
        mousemove(event) {
            if (!event.mouseDown)
                return;
            switch (this.state) {
                case SelectToolState.MOVE_HANDLE:
                    this.moveHandle(event);
                    break;
                case SelectToolState.DRAG_MARQUEE:
                    this.dragMarquee(event);
                    break;
                case SelectToolState.MOVE_SELECTION:
                    this.moveSelection(event);
                    break;
            }
        }
        mouseup(event) {
            switch (this.state) {
                case SelectToolState.DRAG_MARQUEE:
                    this.stopMarquee(event);
                    break;
                case SelectToolState.MOVE_HANDLE:
                    // console.log("UP: HANDLE")
                    this.moveHandle(event);
                    this.stopHandle(event);
                    break;
                case SelectToolState.MOVE_SELECTION:
                    this.moveSelection(event);
                    this.stopMove(event);
                    break;
            }
            // reset state for next operation
            this.state = SelectToolState.NONE;
            this.transformation.identity();
            this.updateBoundary();
        }
        keydown(event) {
            if (event.code === "Backspace" || event.code === "Delete") {
                event.editor.deleteSelection();
                Tool.selection.modified.lock();
                Tool.selection.clear();
                Tool.selection.modified.unlock();
            }
        }
        /*******************************************************************
         *                                                                 *
         *                   M O V E   S E L E C T I O N                   *
         *                                                                 *
         *******************************************************************/
        moveSelection(event) {
            let moveAbsolute = pointMinusPoint(event, this.mouseDownAt);
            this.transformation.identity();
            this.transformation.translate(moveAbsolute);
            this.updateOutlineAndDecorationOfSelection(event.editor);
            // this.mouseLastAt = event
        }
        stopMove(event) {
            this.moveSelection(event);
            event.editor.transformSelection(this.transformation);
            this.mouseDownAt = undefined;
        }
        /*******************************************************************
         *                                                                 *
         *                           H A N D L E                           *
         *                                                                 *
         *******************************************************************/
        downHandle(event) {
            // console.log(`SelectTool.downHandle(): (${event.x}, ${event.y})`)
            if (Tool.selection.empty())
                return false;
            for (let handle = 0; handle < 16; ++handle) {
                const handleInfo = this.getBoundaryHandle(handle);
                if (!handleInfo.path.contains(event))
                    continue;
                this.selectedHandle = handle;
                this.handleStart = event;
                this.transformation.identity();
                this.oldBoundary = new Rectangle$1(this.boundary);
                if (handle >= 8) {
                    this.rotationCenter = this.boundary.center();
                    this.rotationStartDirection = Math.atan2(event.y - this.rotationCenter.y, event.x - this.rotationCenter.x);
                }
                return true;
            }
            return false;
        }
        moveHandle(event) {
            if (this.selectedHandle < 8)
                this.moveHandle2Scale(event);
            else
                this.moveHandle2Rotate(event);
        }
        moveHandle2Scale(event) {
            // console.log(`SelectTool.moveHandle2Scale()`)
            // new boundary = (x0,y0)-(x1,y1), old boundary = (ox0,oy0)-(ox1,oy1)
            let x0 = this.boundary.origin.x, y0 = this.boundary.origin.y, x1 = x0 + this.boundary.size.width, y1 = y0 + this.boundary.size.height, ox0 = this.oldBoundary.origin.x, oy0 = this.oldBoundary.origin.y, ox1 = ox0 + this.oldBoundary.size.width, oy1 = oy0 + this.oldBoundary.size.height;
            let m = new Matrix(this.boundaryTransformation);
            m.invert();
            let p = m.transformPoint(event);
            // console.log(`mouse up at screen ${event.x}, ${event.y}`)
            // console.log(`mouse up at boundary ${p.x}, ${p.y}`)
            switch (this.selectedHandle) {
                case 0:
                    [x0, y0] = [p.x, p.y];
                    break;
                case 1:
                    y0 = p.y;
                    break;
                case 2:
                    [x1, y0] = [p.x, p.y];
                    break;
                case 3:
                    x1 = p.x;
                    break;
                case 4:
                    [x1, y1] = [p.x, p.y];
                    break;
                case 5:
                    y1 = p.y;
                    break;
                case 6:
                    [x0, y1] = [p.x, p.y];
                    break;
                case 7:
                    x0 = p.x;
                    break;
            }
            let sx = (x1 - x0) / (ox1 - ox0), sy = (y1 - y0) / (oy1 - oy0);
            // console.log(`  handle ${this.selectedHandle}`)
            // console.log(`  ox0=${ox0}, oy0=${oy0}, ox1=${ox1}, oy1=${oy1}`)
            // console.log(`  x0=${x0}, y0=${y0}, x1=${x1}, y1=${y1}`)
            // console.log(`  sx=${sx}, sy=${sy}`)
            // let X0, OX0, Y0, OY0
            // if (this.boundaryTransformation) {
            // let [X0, Y0]   = this.boundaryTransformation.transformArrayPoint([x0, y0])
            // let [OX0, OY0] = this.boundaryTransformation.transformArrayPoint([ox0, oy0])
            // } else {
            let [X0, Y0] = [x0, y0];
            let [OX0, OY0] = [ox0, oy0];
            // }
            // console.log(`  translate(${-OX0}, ${-OY0})`)
            // console.log(`  scale(${sx}, ${sy})`)
            // console.log(`  translate(${X0}, ${Y0})`)
            this.transformation.identity();
            this.transformation.append(m);
            this.transformation.translate({ x: -OX0, y: -OY0 });
            this.transformation.scale(sx, sy);
            this.transformation.translate({ x: X0, y: Y0 });
            this.transformation.prepend(this.boundaryTransformation);
            // up to here the math for m2 is correct
            //m2.prepend(this.boundaryTransformation)
            // this.boundaryTransformation = m2
            //this.boundaryTransformation.identity()
            // this.transformation = m2
            this.updateOutlineAndDecorationOfSelection(event.editor);
        }
        moveHandle2Rotate(event) {
            // console.log(`moveHandle2Rotate`)
            let rotd = Math.atan2(event.y - this.rotationCenter.y, event.x - this.rotationCenter.x);
            rotd -= this.rotationStartDirection;
            let center = this.rotationCenter;
            // if (event.editor.getMatrix()) {
            //   ...
            // }
            // console.log(`SelectTool.moveHandle2Rotate(): center=(${center.x}, ${center.y}), radians=${rotd}`)
            this.transformation.identity();
            this.transformation.translate(pointMinus(center));
            this.transformation.rotate(rotd);
            this.transformation.translate(center);
            this.updateOutlineAndDecorationOfSelection(event.editor);
        }
        stopHandle(event) {
            // console.log(`stopHandle`)
            this.state = SelectToolState.NONE;
            // console.log("SelectTool.stopHandle() -> editor.transformSelection()")
            let transformation = this.transformation;
            this.transformation = new Matrix();
            // console.log(`SelectionTool.stopHandle(): rotation=${transformation.getRotation()}, PI/4=${Math.PI/4}`)
            event.editor.transformSelection(transformation);
            // this.updateBoundaryFromSelection() // because the figure is updated async, or just continue with the current selection?
            this.updateOutlineAndDecorationOfSelection(event.editor);
        }
        /*******************************************************************
         *                                                                 *
         *                            M A R Q U E E                        *
         *                                                                 *
         *******************************************************************/
        dragMarquee(event) {
            if (this.svgMarquee === undefined)
                this.createMarquee(event.editor);
            this.updateMarquee(event);
            this.removeMarqueeOutlines(event.editor);
            this.createMarqueeOutlines(event.editor);
        }
        stopMarquee(event) {
            Tool.selection.modified.lock();
            this.copyMarqueeToSelection();
            this.removeMarquee(event.editor);
            this.removeMarqueeOutlines(event.editor);
            Tool.selection.modified.unlock();
            this.mouseDownAt = undefined;
        }
        createMarquee(editor) {
            if (this.svgMarquee !== undefined)
                return;
            this.svgMarquee = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            this.svgMarquee.setAttributeNS("", 'stroke', 'rgb(79,128,255)');
            this.svgMarquee.setAttributeNS("", 'fill', 'rgba(79,128,255,0.2)');
            editor.decorationOverlay.appendChild(this.svgMarquee);
        }
        removeMarquee(editor) {
            if (this.svgMarquee === undefined)
                return;
            editor.decorationOverlay.removeChild(this.svgMarquee);
            this.svgMarquee = undefined;
        }
        copyMarqueeToSelection() {
            for (let pair of this.marqueeOutlines) {
                Tool.selection.add(pair[0]);
            }
        }
        updateMarquee(event) {
            let x0 = this.mouseDownAt.x, y0 = this.mouseDownAt.y, x1 = event.x, y1 = event.y;
            if (x1 < x0)
                [x0, x1] = [x1, x0];
            if (y1 < y0)
                [y0, y1] = [y1, y0];
            this.marqueeRectangle = new Rectangle$1({ origin: { x: x0, y: y0 }, size: { width: x1 - x0, height: y1 - y0 } });
            this.svgMarquee.setAttributeNS("", "x", String(Math.round(x0) + 0.5)); // FIXME: just a hunch for nice rendering
            this.svgMarquee.setAttributeNS("", "y", String(Math.round(y0) + 0.5));
            this.svgMarquee.setAttributeNS("", "width", String(Math.round(x1 - x0)));
            this.svgMarquee.setAttributeNS("", "height", String(Math.round(y1 - y0)));
        }
        createMarqueeOutlines(editor) {
            for (let figure of editor.selectedLayer.data) {
                if (Tool.selection.has(figure))
                    continue;
                let figureInMarquee = true;
                let bounds = figure.bounds();
                bounds.forAllEdges((edge) => {
                    if (!this.marqueeRectangle.contains(edge))
                        figureInMarquee = false;
                }, figure.matrix);
                if (!figureInMarquee)
                    continue;
                let svg = this.createOutline(editor, figure);
                editor.decorationOverlay.appendChild(svg);
                this.marqueeOutlines.set(figure, svg);
            }
        }
        removeMarqueeOutlines(editor) {
            for (let pair of this.marqueeOutlines) {
                editor.decorationOverlay.removeChild(pair[1]);
            }
            this.marqueeOutlines.clear();
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    /**
     * Create Shapes, eg. Rectangle, Circle, ...
     */
    class ShapeTool extends Tool {
        constructor(creator) {
            super();
            this.creator = creator;
        }
        activate(event) {
            Tool.selection.clear();
        }
        mousedown(event) {
            this.shape = new this.creator();
            this.shape.setHandlePosition(0, event);
            this.shape.setHandlePosition(2, event);
            if (event.editor.strokeAndFillModel) {
                this.shape.stroke = event.editor.strokeAndFillModel.stroke;
                this.shape.fill = event.editor.strokeAndFillModel.fill;
            }
            let path = this.shape.getPath();
            this.svg = this.shape.updateSVG(path, event.editor.decorationOverlay);
            // Tool.setOutlineColors(path) FIXME
            event.editor.decorationOverlay.appendChild(this.svg);
        }
        mousemove(event) {
            if (!event.mouseDown) {
                return;
            }
            let shape = this.shape;
            shape.setHandlePosition(2, event);
            let path = shape.getPath();
            shape.updateSVG(path, event.editor.decorationOverlay, this.svg);
        }
        mouseup(event) {
            let shape = this.shape;
            shape.setHandlePosition(2, event);
            if (shape.size.width < 0) {
                shape.origin.x += shape.size.width;
                shape.size.width = -shape.size.width;
            }
            if (shape.size.height < 0) {
                shape.origin.y += shape.size.height;
                shape.size.height = -shape.size.height;
            }
            // let path = shape.getPath()
            event.editor.decorationOverlay.removeChild(this.svg);
            event.editor.addFigure(shape);
            this.shape = undefined;
            this.svg = undefined;
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class EditorKeyboardEvent {
        constructor(editor, event) {
            this.editor = editor;
            this.event = event;
            this.code = event.code;
            this.value = event.key;
            this.shift = event.shiftKey;
            this.ctrl = event.ctrlKey;
            this.alt = event.altKey;
            this.meta = event.metaKey;
        }
        preventDefault() {
            this.event.preventDefault();
        }
        stopPropagation() {
            this.event.stopPropagation();
        }
        stopImmediatePropagation() {
            this.event.stopImmediatePropagation();
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    // FIXME: this class quickly turned into an TextEditor, merge it into TextTool
    class TextEditor {
        constructor(editor, text) {
            // cursor location when selection began
            this.selectionOffsetWord = null;
            this.selectionOffsetChar = 0;
            this.text = text;
            this.svgParent = editor.getSVG(text);
            this.textSource = text.textSource;
            this.boxes = text.textSource.wordBoxes;
            this.position = new Point();
            this.xDuringVerticalMovement = undefined;
            this.offsetWord = 0;
            this.offsetChar = 0;
            this.svgCursor = this.createCursor();
            this.updateCursor();
            editor.decorationOverlay.appendChild(this.svgCursor);
        }
        hasSelection() {
            return this.selectionOffsetWord !== null;
        }
        createCursor() {
            let cursor = document.createElementNS("http://www.w3.org/2000/svg", "line");
            cursor.setAttributeNS("", "stroke", "#000");
            return cursor;
        }
        stop() {
            if (this.svgCursor) {
                this.svgCursor.parentElement.removeChild(this.svgCursor);
                this.svgCursor = undefined;
            }
            if (this.svgSelection) {
                this.svgSelection.parentElement.removeChild(this.svgSelection);
                this.svgSelection = undefined;
            }
            this.selectionOffsetWord = null;
        }
        mousedown(e) {
            this.offsetWord = 0;
            this.offsetChar = 0;
            if (this.goNearY(e.y)) {
                this.goNearX(e.x);
            }
            this.selectionOffsetWord = this.offsetWord;
            this.selectionOffsetChar = this.offsetChar;
            this.updateCursor();
        }
        mousemove(e) {
            this.offsetWord = 0;
            this.offsetChar = 0;
            if (this.goNearY(e.y)) {
                this.goNearX(e.x);
                this.updateCursor();
            }
        }
        updateSelection(e) {
            if (e === undefined || e.shift) {
                if (this.selectionOffsetWord === null) {
                    this.selectionOffsetWord = this.offsetWord;
                    this.selectionOffsetChar = this.offsetChar;
                }
            }
            else {
                this.selectionOffsetWord = null;
            }
        }
        // TODO: break this method up!
        keydown(e) {
            e.preventDefault();
            if (e.code === "Home" || (e.ctrl && e.code === "KeyA")) {
                this.updateSelection(e);
                this.moveCursorBOL();
                this.updateCursor();
                return;
            }
            if (e.code === "End" || (e.ctrl && e.code === "KeyE")) {
                this.updateSelection(e);
                this.moveCursorEOL();
                this.updateCursor();
                return;
            }
            switch (e.code) {
                case "ArrowRight":
                    this.updateSelection(e);
                    this.moveCursorRight();
                    this.updateCursor();
                    break;
                case "ArrowLeft":
                    this.updateSelection(e);
                    this.moveCursorLeft();
                    this.updateCursor();
                    break;
                case "Backspace":
                    if (this.selectionOffsetWord !== null) {
                        this.deleteSelectedText();
                    }
                    else {
                        this.updateSelection();
                        this.moveCursorLeft();
                        this.deleteSelectedText();
                    }
                    this.textSource.reset();
                    new WordWrap(e.editor.getPath(this.text), this.textSource);
                    this.textSource.updateSVG();
                    this.updateCursor();
                    break;
                case "Delete":
                    if (this.selectionOffsetWord !== null) {
                        this.deleteSelectedText();
                    }
                    else {
                        this.updateSelection();
                        this.moveCursorRight();
                        this.deleteSelectedText();
                    }
                    // redo word wrap
                    this.textSource.reset();
                    new WordWrap(e.editor.getPath(this.text), this.textSource);
                    this.textSource.updateSVG();
                    this.updateCursor();
                    break;
                default:
                    if (e.value.length == 1) {
                        this.insertText(e.value);
                        this.textSource.reset();
                        new WordWrap(e.editor.getPath(this.text), this.textSource);
                        this.textSource.updateSVG();
                        this.updateCursor();
                    }
            }
            switch (e.code) {
                case "ArrowDown":
                    this.updateSelection(e);
                    if (this.xDuringVerticalMovement === undefined)
                        this.xDuringVerticalMovement = this.position.x;
                    if (this.gotoNextRow()) {
                        this.goNearX(this.xDuringVerticalMovement);
                        this.updateCursor();
                    }
                    break;
                case "ArrowUp":
                    this.updateSelection(e);
                    if (this.xDuringVerticalMovement === undefined)
                        this.xDuringVerticalMovement = this.position.x;
                    if (this.gotoPreviousRow()) {
                        this.goNearX(this.xDuringVerticalMovement);
                        this.updateCursor();
                    }
                    break;
                default:
                    this.xDuringVerticalMovement = undefined;
            }
        }
        clipboard(editor, event) {
            switch (event.type) {
                case "cut":
                    this.cut(editor, event);
                    break;
                case "copy":
                    this.copy(event);
                    break;
                case "paste":
                    this.paste(editor, event);
                    break;
            }
        }
        cut(editor, event) {
            if (!event.clipboardData)
                return;
            if (!this.hasSelection())
                return;
            this.copy(event);
            this.deleteSelectedText();
            this.text.textSource.reset();
            new WordWrap(editor.getPath(this.text), this.text.textSource);
            this.textSource.updateSVG();
            this.updateCursor();
        }
        copy(event) {
            if (!event.clipboardData)
                return;
            if (!this.hasSelection())
                return;
            const [offsetWord0, offsetChar0, offsetWord1, offsetChar1] = this.getSelection();
            if (offsetWord0 === offsetWord1) {
                const word = this.text.textSource.wordBoxes[offsetWord0].word;
                event.clipboardData.setData('text/plain', word.substr(offsetChar0, offsetChar1 - offsetChar0));
            }
            else {
                const words = this.text.textSource.wordBoxes;
                let text = words[offsetWord0].word.substr(offsetChar0) + " ";
                for (let i = offsetWord0 + 1; i < offsetWord1; ++i) {
                    text += words[i].word + " ";
                }
                text += words[offsetWord1].word.substr(0, offsetChar1);
                event.clipboardData.setData('text/plain', text);
            }
            event.preventDefault();
        }
        paste(editor, e) {
            const item = Array.from(e.clipboardData.items).filter(e => e.kind === "string" && e.type === "text/plain").shift();
            if (item === undefined)
                return;
            item.getAsString(clipText => {
                this.insertText(clipText);
                this.text.textSource.reset();
                new WordWrap(editor.getPath(this.text), this.text.textSource);
                this.text.textSource.updateSVG();
                this.updateCursor();
            });
        }
        insertText(value) {
            if (this.selectionOffsetWord !== null) {
                this.deleteSelectedText();
            }
            let newBoxes = [];
            TextSource.splitTextIntoWordBoxes(newBoxes, value);
            if (newBoxes.length === 0)
                return;
            let word0 = this.boxes[this.offsetWord];
            let tail0 = word0.word.substr(this.offsetChar);
            word0.word = word0.word.substr(0, this.offsetChar);
            word0.word += newBoxes[0].word;
            if (newBoxes.length > 1 || newBoxes[0].word.length == 0) {
                if (newBoxes.length > 1) {
                    newBoxes.splice(0, 1);
                }
                this.offsetChar = newBoxes[newBoxes.length - 1].word.length;
                this.offsetWord = this.offsetWord += newBoxes.length;
                newBoxes[newBoxes.length - 1].word += tail0;
                this.textSource.wordBoxes.splice(this.offsetWord + 1, 0, ...newBoxes);
            }
            else {
                this.offsetChar = word0.word.length;
                word0.word += tail0;
            }
            if (word0.svg) {
                word0.svg.textContent = word0.word;
            }
        }
        moveCursorRight() {
            ++this.offsetChar;
            if (this.offsetChar > this.boxes[this.offsetWord].word.length) {
                if (this.offsetWord >= this.boxes.length || this.boxes[this.offsetWord].endOfWrap) {
                    --this.offsetChar;
                }
                else {
                    this.offsetChar = 0;
                    ++this.offsetWord;
                }
            }
        }
        moveCursorLeft() {
            if (this.offsetWord === 0 && this.offsetChar === 0)
                return;
            --this.offsetChar;
            if (this.offsetChar < 0) {
                --this.offsetWord;
                const r = this.boxes[this.offsetWord];
                this.offsetChar = r.word.length;
            }
        }
        moveCursorBOL() {
            let offsetWord = this.offsetWord;
            while (true) {
                if ((offsetWord > 0 && this.boxes[offsetWord - 1].endOfLine) ||
                    offsetWord === 0) {
                    this.offsetWord = offsetWord;
                    this.offsetChar = 0;
                    break;
                }
                --offsetWord;
            }
        }
        moveCursorEOL() {
            let offsetWord = this.offsetWord;
            while (true) {
                if (offsetWord === this.boxes.length - 1 ||
                    (this.boxes[offsetWord].endOfLine || this.boxes[offsetWord].endOfWrap)) {
                    this.offsetWord = offsetWord;
                    this.offsetChar = this.boxes[offsetWord].word.length;
                    break;
                }
                ++offsetWord;
            }
        }
        deleteSelectedText() {
            var _a;
            const [offsetWord0, offsetChar0, offsetWord1, offsetChar1] = this.getSelection();
            if (offsetWord0 === offsetWord1) {
                const word = this.textSource.wordBoxes[offsetWord0];
                word.word = word.word.substring(0, offsetChar0) + word.word.substring(offsetChar1);
                if (word.svg !== undefined) {
                    word.svg.textContent = word.word;
                }
            }
            else {
                const word0 = this.textSource.wordBoxes[offsetWord0];
                const word1 = this.textSource.wordBoxes[offsetWord1];
                word0.word = word0.word.substring(0, offsetChar0) + word1.word.substring(offsetChar1);
                if (word0.svg !== undefined) {
                    word0.svg.textContent = word0.word;
                }
                for (let i = offsetWord0 + 1; i < offsetWord1; ++i) {
                    const word = this.textSource.wordBoxes[i];
                    if (word.svg) {
                        (_a = word.svg.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(word.svg);
                        word.svg = undefined;
                    }
                }
                this.textSource.wordBoxes.splice(offsetWord0 + 1, offsetWord1 - offsetWord0);
            }
            this.offsetWord = offsetWord0;
            this.offsetChar = offsetChar0;
            this.selectionOffsetWord = null;
        }
        // FIXME: name does not indicate position is not changed
        gotoNextRow() {
            let offsetWord = this.offsetWord;
            while (offsetWord < this.boxes.length && !this.boxes[offsetWord++].endOfLine) { }
            if (offsetWord >= this.boxes.length || this.boxes[offsetWord - 1].endOfWrap)
                return false;
            this.offsetWord = offsetWord;
            this.offsetChar = 0;
            return true;
        }
        gotoPreviousRow() {
            // console.log(`gotoPreviousRow: enter`)
            let offsetWord = this.offsetWord;
            // console.log(`gotoPreviousRow: goto bol in current line`)
            while (offsetWord > 0 && !this.boxes[offsetWord - 1].endOfLine) {
                --offsetWord;
            }
            // console.log(`gotoPreviousRow: bol offsetWord=${offsetWord}`)
            if (offsetWord == 0)
                return false;
            --offsetWord;
            // console.log(`gotoPreviousRow: goto bol in previous line`)
            while (offsetWord > 0 && !this.boxes[offsetWord - 1].endOfLine) {
                --offsetWord;
            }
            // console.log(`gotoPreviousRow: offsetWord=${offsetWord}`)
            this.offsetWord = offsetWord;
            this.offsetChar = 0;
            // console.log(`gotoPreviousRow: leave`)
            return true;
        }
        goNearY(y) {
            let rowWord = 0;
            let maxY = Number.MIN_VALUE;
            for (let i = 0; i < this.boxes.length; ++i) {
                let r = this.boxes[i];
                maxY = Math.max(maxY, r.origin.y + r.size.height);
                if (r.endOfLine) {
                    if (y <= maxY) {
                        this.offsetWord = rowWord;
                        return true;
                    }
                    maxY = Number.MIN_VALUE;
                    if (i + 1 >= this.boxes.length || r.endOfWrap)
                        break;
                    rowWord = i + 1;
                }
            }
            this.offsetWord = rowWord;
            return true;
        }
        // FIXME: name does not indicate going from offset(Char|Word) to position.x
        goNearX(x) {
            let offsetWord = this.offsetWord;
            let offsetChar = this.offsetChar;
            // console.log(`gotoCursorHorizontally(): enter with x=${x}, offsetWord=${offsetWord}, offsetChar=${offsetChar}`)
            while (true) {
                let r = this.boxes[offsetWord];
                // current position is right of r => next word
                if (x > r.origin.x + r.size.width) {
                    if (r.endOfLine) {
                        // console.log(`gotoCursorHorizontally: current position ${x} is right of ${r.origin.x + r.size.width} and we are end of line => stop`)
                        offsetChar = r.word.length;
                        break;
                    }
                    else {
                        ++offsetWord;
                        if (offsetWord === this.boxes.length) {
                            offsetChar = r.word.length;
                            --offsetWord;
                            break;
                        }
                        // console.log(`gotoCursorHorizontally: current position ${x} is right of ${r.origin.x + r.size.width} => next word ${offsetWord}`)
                        continue;
                    }
                }
                if (offsetWord != this.offsetWord && x < r.origin.x) {
                    let r0 = this.boxes[offsetWord - 1];
                    let x0 = r0.origin.x + r0.size.width;
                    let x1 = r.origin.x;
                    // console.log(`found character before word for x=${x}, x0=${x0}, x1=${x1}, compare x1-x >= x-x0 (${x1-x} >= ${x-x0})`)
                    if (x1 - x >= x - x0) {
                        offsetWord = offsetWord - 1;
                        offsetChar = r0.word.length;
                    }
                    else {
                        offsetChar = 0;
                    }
                    break;
                }
                // console.log(`gotoCursorHorizontally: search within word ${offsetWord}`)
                offsetChar = -1;
                let x0 = r.origin.x;
                for (let i = 1; i <= r.word.length; ++i) {
                    let x1 = r.origin.x + r.svg.getSubStringLength(0, i);
                    // console.log(`  i=${i}, x0=${x0}, x1=${x1}`)
                    if (x < x1) {
                        // console.log(`found character after word for x=${x}, x0=${x0}, x1=${x1}, compare x1-x >= x-x0 (${x1-x} >= ${x-x0})`)
                        if (x1 - x >= x - x0) {
                            offsetChar = i - 1;
                        }
                        else {
                            offsetChar = i;
                        }
                        // console.log(`offsetChar=${offsetChar}`)
                        break;
                    }
                    x0 = x1;
                }
                if (offsetChar == -1) {
                    // throw Error("failed to place cursor")
                    offsetChar = r.word.length;
                }
                break;
            } //  while(!this.boxes[offsetWord].endOfLine)
            this.offsetWord = offsetWord;
            this.offsetChar = offsetChar;
            // console.log(`gotoCursorHorizontally: offsetWord=${offsetWord}, offsetChar=${offsetChar}`)
        }
        getSelection() {
            if (this.selectionOffsetWord === null)
                throw Error("no selection");
            let [offsetWord0, offsetChar0] = [this.offsetWord, this.offsetChar];
            let [offsetWord1, offsetChar1] = [this.selectionOffsetWord, this.selectionOffsetChar];
            //  this.offsetToScreen(this.selectionOffsetWord, this.selectionOffsetChar)
            if (offsetWord0 > offsetWord1 ||
                (offsetWord0 === offsetWord1 &&
                    offsetChar0 > offsetChar1)) {
                return [offsetWord1, offsetChar1, offsetWord0, offsetChar0];
            }
            return [offsetWord0, offsetChar0, offsetWord1, offsetChar1];
        }
        // use offsetWord and offsetChar to place the cursor
        updateCursor() {
            var _a;
            const [x, y, h] = this.offsetToScreen(this.offsetWord, this.offsetChar);
            if (this.selectionOffsetWord === null) {
                if (this.svgSelection) {
                    (_a = this.svgSelection.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(this.svgSelection);
                    this.svgSelection = undefined;
                }
            }
            else {
                let [offsetWord0, offsetChar0, offsetWord1, offsetChar1] = this.getSelection();
                const path = new Path();
                // console.log(` create selection between offsets (${offsetWord0}, ${offsetChar0}) and (${offsetWord1}, ${offsetChar1})`)
                let offsetWord = offsetWord0;
                while (offsetWord <= offsetWord1) {
                    const word = this.boxes[offsetWord];
                    if (word.endOfLine || word.endOfSlice || offsetWord === offsetWord1) {
                        // console.log(`  create rectangle" endof`)
                        const [x0, y0, h0] = this.offsetToScreen(offsetWord0, offsetChar0);
                        let x1, y1, h1;
                        if (offsetWord < offsetWord1)
                            [x1, y1, h1] = this.offsetToScreen(offsetWord, word.word.length);
                        else
                            [x1, y1, h1] = this.offsetToScreen(offsetWord, offsetChar1);
                        path.move(x0, y0 + h0)
                            .line(x0, y0)
                            .line(x1, y1)
                            .line(x1, y1 + h1)
                            .close();
                        [offsetWord0, offsetChar0] = [offsetWord + 1, 0];
                    }
                    ++offsetWord;
                }
                if (this.svgSelection === undefined) {
                    this.svgSelection = path.createSVG("#b3d7ff", 1, "#b3d7ff");
                    this.svgParent.insertBefore(this.svgSelection, this.svgParent.children[0]);
                }
                else {
                    path.updateSVG(this.svgParent, this.svgSelection);
                }
            }
            this.position.x = x;
            this.position.y = y;
            const xs = `${Math.round(x) + 0.5}`;
            const y1 = `${Math.round(y) + 0.5}`;
            const y2 = `${Math.round(y + h) + 0.5}`;
            this.svgCursor.setAttributeNS("", "x1", xs);
            this.svgCursor.setAttributeNS("", "y1", y1);
            this.svgCursor.setAttributeNS("", "x2", xs);
            this.svgCursor.setAttributeNS("", "y2", y2);
            this.pauseCaretAnimation();
        }
        offsetToScreen(offsetWord, offsetChar) {
            let r = this.boxes[offsetWord];
            let x;
            if (r.word.length === 0) {
                x = 0;
            }
            else {
                // console.log(`word='${r.word}', word.length=${r.word.length}, call getSubStringLength(0, offsetChar=${this.offsetChar})`)
                x = offsetChar === 0 ? 0 : r.svg.getSubStringLength(0, offsetChar);
            }
            return [r.origin.x + x, r.origin.y, r.size.height];
        }
        pauseCaretAnimation() {
            // disable blinking for 0.5s while moving
            if (this.timer) {
                window.clearTimeout(this.timer);
                this.timer = undefined;
            }
            this.svgCursor.classList.remove("cursor-blink");
            this.timer = window.setTimeout(() => {
                this.svgCursor.classList.add("cursor-blink");
                this.timer = undefined;
            }, 500);
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    var TextCursorType;
    (function (TextCursorType) {
        TextCursorType[TextCursorType["NONE"] = 0] = "NONE";
        TextCursorType[TextCursorType["EDIT"] = 1] = "EDIT";
        TextCursorType[TextCursorType["AREA"] = 2] = "AREA";
        TextCursorType[TextCursorType["SHAPE"] = 3] = "SHAPE";
        TextCursorType[TextCursorType["PATH"] = 4] = "PATH";
    })(TextCursorType || (TextCursorType = {}));
    var TextToolState;
    (function (TextToolState) {
        TextToolState[TextToolState["NONE"] = 0] = "NONE";
        TextToolState[TextToolState["AREA"] = 1] = "AREA";
        TextToolState[TextToolState["EDIT"] = 2] = "EDIT";
    })(TextToolState || (TextToolState = {}));
    class TextTool extends Tool {
        constructor() {
            super();
            this.state = TextToolState.NONE;
            this.currentCursor = TextCursorType.NONE;
        }
        activate(event) {
            this.state = TextToolState.NONE;
        }
        deactivate(event) {
            this.stopEdit(event);
            this.setCursor(TextCursorType.NONE, event.editor.svgView);
            event.editor.svgView.style.cursor = "default";
            this.removeOutlines(event.editor);
            this.removeDecoration(event.editor);
        }
        mousedown(event) {
            let figure = event.editor.selectedLayer.findFigureAt(event);
            if (figure === undefined) {
                this.state = TextToolState.AREA;
                this.startDrawTextArea(event);
            }
            else {
                if (figure instanceof Text) {
                    this.text = figure;
                    this.state = TextToolState.EDIT;
                    this.startEdit(event);
                    this.texteditor.mousedown(event);
                    Tool.selection.set(figure);
                    this.updateDecorationOfSelection(event.editor);
                }
            }
        }
        mousemove(event) {
            switch (this.state) {
                case TextToolState.EDIT:
                    if (event.editor.mouseButtonIsDown) {
                        this.texteditor.mousemove(event);
                        return;
                    }
                case TextToolState.NONE:
                    this.setCursorBasedOnFigureBelowMouse(event);
                    break;
                case TextToolState.AREA:
                    this.resizeDrawTextArea(event);
                    break;
            }
        }
        mouseup(event) {
            switch (this.state) {
                case TextToolState.AREA:
                    this.stopDrawTextArea(event);
                    this.createTextArea(event);
                    this.state = TextToolState.EDIT;
                    this.startEdit(event);
                    break;
            }
        }
        keydown(event) {
            var _a;
            if (this.state == TextToolState.EDIT) {
                this.texteditor.keydown(event);
                (_a = event.editor.model) === null || _a === void 0 ? void 0 : _a.modified.trigger({
                    operation: Operation.UPDATE_FIGURES,
                    figures: [this.text.id]
                });
            }
        }
        clipboard(editor, event) {
            var _a;
            if (this.state == TextToolState.EDIT) {
                this.texteditor.clipboard(editor, event);
                (_a = editor.model) === null || _a === void 0 ? void 0 : _a.modified.trigger({
                    operation: Operation.UPDATE_FIGURES,
                    figures: [this.text.id]
                });
            }
        }
        setCursor(type, svg) {
            if (this.currentCursor === type)
                return;
            this.currentCursor = type;
            svg.style.cursor = "";
            switch (type) {
                case TextCursorType.NONE:
                    svg.style.cursor = "default";
                    break;
                case TextCursorType.EDIT:
                    svg.style.cursor = `url(${Tool.cursorPath}text-edit.svg) 9 12, move`;
                    break;
                case TextCursorType.AREA:
                    svg.style.cursor = `url(${Tool.cursorPath}text-area.svg) 9 12, move`;
                    break;
                case TextCursorType.SHAPE:
                    svg.style.cursor = `url(${Tool.cursorPath}text-shape.svg) 9 12, move`;
                    break;
                case TextCursorType.PATH:
                    svg.style.cursor = `url(${Tool.cursorPath}text-path.svg) 9 12, move`;
                    break;
            }
        }
        setCursorBasedOnFigureBelowMouse(event) {
            let figure = event.editor.selectedLayer.findFigureAt(event);
            // console.log(`at ${event.x},${event.y} found ${figure}`)
            if (figure === undefined) {
                this.setCursor(TextCursorType.AREA, event.editor.svgView);
            }
            else {
                if (figure instanceof Text) {
                    this.setCursor(TextCursorType.EDIT, event.editor.svgView);
                }
                else {
                    this.setCursor(TextCursorType.SHAPE, event.editor.svgView);
                }
            }
        }
        //
        // Edit
        //
        startEdit(event) {
            this.stopEdit(event);
            this.texteditor = new TextEditor(event.editor, this.text);
        }
        stopEdit(event) {
            var _a;
            if (this.texteditor === undefined)
                return;
            this.texteditor.stop();
            this.texteditor = undefined;
            (_a = event.editor.model) === null || _a === void 0 ? void 0 : _a.modified.trigger({
                operation: Operation.UPDATE_FIGURES,
                figures: [this.text.id]
            });
        }
        //
        // TextArea
        //
        startDrawTextArea(event) {
            this.mouseDownAt = event;
            // create text area
            this.defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            this.defs.innerHTML =
                `<pattern id="textToolPattern"
                x="0" y="0" width="100" height="4"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)">
               <line x1="0" y1="0" x2="100" y2="0" style="stroke: rgb(79,128,255)" />
            </pattern>`;
            event.editor.svgView.appendChild(this.defs);
            this.svgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            this.svgRect.setAttributeNS("", 'stroke', 'rgb(79,128,255)');
            this.svgRect.setAttributeNS("", 'fill', 'url(#textToolPattern)');
            event.editor.decorationOverlay.appendChild(this.svgRect);
        }
        resizeDrawTextArea(event) {
            let x0 = this.mouseDownAt.x, y0 = this.mouseDownAt.y, x1 = event.x, y1 = event.y;
            if (x1 < x0)
                [x0, x1] = [x1, x0];
            if (y1 < y0)
                [y0, y1] = [y1, y0];
            this.svgRect.setAttributeNS("", "x", `${Math.round(x0) + 0.5}`); // FIXME: just a hunch for nice rendering
            this.svgRect.setAttributeNS("", "y", `${Math.round(y0) + 0.5}`);
            this.svgRect.setAttributeNS("", "width", `${Math.round(x1 - x0)}`);
            this.svgRect.setAttributeNS("", "height", `${Math.round(y1 - y0)}`);
        }
        stopDrawTextArea(event) {
            event.editor.decorationOverlay.removeChild(this.svgRect);
            event.editor.svgView.removeChild(this.defs);
        }
        createTextArea(event) {
            let x0 = this.mouseDownAt.x, y0 = this.mouseDownAt.y, x1 = event.x, y1 = event.y;
            if (x1 < x0)
                [x0, x1] = [x1, x0];
            if (y1 < y0)
                [y0, y1] = [y1, y0];
            // we add the figure here
            let rect = new Rectangle$1(x0, y0, x1 - x0, y1 - y0);
            this.text = new Text(rect);
            event.editor.addFigure(this.text);
            Tool.selection.set(this.text);
            this.updateDecorationOfSelection(event.editor);
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class ToolModel extends toad.exports.OptionModel {
    }

    let strokeandfillStyle$1 = document.createElement("style");
    strokeandfillStyle$1.textContent = `
svg {
    top: 0;
    left: 0;
    width: 41px;
    height: 60px;
    background: none;
}
`;
    var StrokeOrFill;
    (function (StrokeOrFill) {
        StrokeOrFill[StrokeOrFill["STROKE"] = 0] = "STROKE";
        StrokeOrFill[StrokeOrFill["FILL"] = 1] = "FILL";
        StrokeOrFill[StrokeOrFill["NONE"] = 2] = "NONE";
        StrokeOrFill[StrokeOrFill["BOTH"] = 3] = "BOTH";
    })(StrokeOrFill || (StrokeOrFill = {}));
    class StrokeAndFillModel extends toad.exports.Model {
        constructor() {
            super();
            this._stroke = "#000";
            this._fill = "#fff";
            this._strokeOrFill = StrokeOrFill.STROKE;
        }
        set(value) {
            switch (this._strokeOrFill) {
                case StrokeOrFill.STROKE:
                    this.stroke = value;
                    break;
                case StrokeOrFill.FILL:
                    this.fill = value;
                    break;
                case StrokeOrFill.NONE:
                    break;
                case StrokeOrFill.BOTH:
                    this.modified.lock();
                    this.stroke = value;
                    this.fill = value;
                    this.modified.unlock();
                    break;
            }
        }
        get() {
            switch (this._strokeOrFill) {
                case StrokeOrFill.STROKE:
                    return this.stroke;
                case StrokeOrFill.FILL:
                    return this.fill;
                case StrokeOrFill.NONE:
                case StrokeOrFill.BOTH:
                    return "";
            }
        }
        set stroke(value) {
            if (value === this._stroke)
                return;
            this._stroke = value;
            this.modified.trigger();
        }
        get stroke() {
            return this._stroke;
        }
        set fill(value) {
            if (value === this._fill)
                return;
            this._fill = value;
            this.modified.trigger();
        }
        get fill() {
            return this._fill;
        }
        set strokeOrFill(value) {
            if (value === this._strokeOrFill)
                return;
            this._strokeOrFill = value;
            this.modified.trigger();
        }
        get strokeOrFill() {
            return this._strokeOrFill;
        }
    }
    // Remove the model and make it a tool operating on Tool.selection
    class StrokeAndFill extends toad.exports.ModelView {
        constructor(props) {
            super();
            this.stroke = "#000";
            this.fill = "#fff";
            this.svg = toad.exports.jsxs("svg", { children: [toad.exports.jsx("rect", { x: "0.5", y: "0.5", width: "27", height: "27", stroke: "#000", fill: "#000", set: toad.exports.ref(this, "fillElement"), onmousedown: this.focusFillBox }, void 0), toad.exports.jsx("line", { x1: "4", y1: "24", x2: "24", y2: "4", stroke: "#f00", strokeWidth: "2", strokeLinecap: "round", set: toad.exports.ref(this, "fillNoneElement") }, void 0), toad.exports.jsx("rect", { x: "13.5", y: "13.5", width: "27", height: "27", stroke: "#000", fill: "#fff", set: toad.exports.ref(this, "strokeOuterFrame") }, void 0), toad.exports.jsx("rect", { x: "15.5", y: "15.5", width: "23", height: "23", stroke: "#000", fill: "#000", set: toad.exports.ref(this, "strokeElement") }, void 0), toad.exports.jsx("line", { x1: "16", y1: "38", x2: "38", y2: "16", stroke: "#f00", strokeWidth: "2", strokeLinecap: "round", set: toad.exports.ref(this, "strokeNoneElement") }, void 0), toad.exports.jsx("rect", { x: "20.5", y: "20.5", width: "13", height: "13", stroke: "#fff", fill: "#fff" }, void 0), toad.exports.jsx("rect", { x: "21.5", y: "21.5", width: "11", height: "11", stroke: "#000", fill: "none" }, void 0), toad.exports.jsx("rect", { x: "13.5", y: "13.5", width: "27", height: "27", stroke: "rgba(0,0,0,0)", fill: "rgba(0,0,0,0)", set: toad.exports.ref(this, "strokeHitBox"), onmousedown: this.focusStrokeBox }, void 0), toad.exports.jsx("path", { d: "M 31 2.5 L 34 0 L 34  5 Z M 38.5 10 L 36 7 L 41 7 Z", fill: "#000" }, void 0), toad.exports.jsx("path", { d: "M 33.5 2.5 C 38.5 2.5 38.5 2.5 38.5, 7.5", stroke: "#000", fill: "none" }, void 0), toad.exports.jsx("rect", { x: "30.5", y: "0.5", width: "10", height: "10", stroke: "rgba(0,0,0,0)", fill: "rgba(0,0,0,0)", onmousedown: this.swapStrokeAndFill }, void 0), toad.exports.jsx("rect", { x: "4.5", y: "32.5", width: "7", height: "7", stroke: "#000", fill: "#000" }, void 0), toad.exports.jsx("rect", { x: "6.5", y: "34.5", width: "3", height: "3", stroke: "#fff", fill: "#fff" }, void 0), toad.exports.jsx("rect", { x: "1.5", y: "29.5", width: "7", height: "7", stroke: "#000", fill: "#fff" }, void 0), toad.exports.jsx("rect", { x: "1.5", y: "29.5", width: "10", height: "10", stroke: "rgba(0,0,0,0)", fill: "rgba(0,0,0,0)", onmousedown: this.setDefaultStrokeAndFill }, void 0), toad.exports.jsx("rect", { x: "0.5", y: "46.5", width: "13", height: "13", stroke: "#000", fill: "none", set: toad.exports.ref(this, "colorButtonIndicatorElement") }, void 0), toad.exports.jsx("rect", { x: "3.5", y: "49.5", width: "7", height: "7", stroke: "#000", fill: "#000", set: toad.exports.ref(this, "colorButtonElement") }, void 0), toad.exports.jsx("rect", { x: "0.5", y: "46.5", width: "13", height: "13", stroke: "rgba(0,0,0,0)", fill: "rgba(0,0,0,0)", onmousedown: this.assignColor }, void 0), toad.exports.jsx("rect", { x: "27.5", y: "46.5", width: "13", height: "13", stroke: "#000", fill: "none", set: toad.exports.ref(this, "noneButtonIndicatorElement") }, void 0), toad.exports.jsx("rect", { x: "30.5", y: "49.5", width: "7", height: "7", stroke: "#000", fill: "#fff" }, void 0), toad.exports.jsx("line", { x1: "32", y1: "55", x2: "36", y2: "51", stroke: "#f00", strokeWidth: "2", strokeLinecap: "round" }, void 0), toad.exports.jsx("rect", { x: "27.5", y: "46.5", width: "13", height: "13", stroke: "rgba(0,0,0,0)", fill: "rgba(0,0,0,0)", onmousedown: this.assignNone }, void 0)] }, void 0);
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.appendChild(document.importNode(strokeandfillStyle$1, true));
            this.shadowRoot.appendChild(this.svg);
            if (props && props.model)
                this.setModel(props.model);
        }
        focusFillBox() {
            if (this.model)
                this.model.strokeOrFill = StrokeOrFill.FILL;
            // move the fill box in front of the stroke box
            this.svg.removeChild(this.fillElement);
            this.svg.removeChild(this.fillNoneElement);
            this.svg.insertBefore(this.fillNoneElement, this.strokeHitBox.nextSibling);
            this.svg.insertBefore(this.fillElement, this.strokeHitBox.nextSibling);
        }
        focusStrokeBox() {
            if (this.model)
                this.model.strokeOrFill = StrokeOrFill.STROKE;
            // move the stroke box in front of the fill box
            this.svg.removeChild(this.fillElement);
            this.svg.removeChild(this.fillNoneElement);
            this.svg.insertBefore(this.fillElement, this.strokeOuterFrame);
            this.svg.insertBefore(this.fillNoneElement, this.strokeOuterFrame);
        }
        swapStrokeAndFill() {
            if (!this.model)
                return;
            this.model.modified.lock();
            let akku;
            akku = this.model.stroke;
            this.model.stroke = this.model.fill;
            this.model.fill = akku;
            akku = this.stroke;
            this.stroke = this.fill;
            this.fill = akku;
            this.model.modified.trigger();
            this.model.modified.unlock();
        }
        setDefaultStrokeAndFill() {
            if (!this.model)
                return;
            this.model.modified.lock();
            this.model.stroke = "#000";
            this.model.fill = "#fff";
            this.model.modified.unlock();
        }
        assignColor() {
            if (!this.model)
                return;
            this.model.modified.lock();
            switch (this.model.strokeOrFill) {
                case StrokeOrFill.STROKE:
                    this.model.stroke = this.stroke;
                    break;
                case StrokeOrFill.FILL:
                    this.model.fill = this.fill;
                    break;
            }
            this.model.modified.trigger(); // force assigning the current colors to the selection
            this.model.modified.unlock();
        }
        assignNone() {
            if (!this.model)
                return;
            this.model.set("none");
        }
        updateView() {
            if (!this.model)
                return;
            if (this.model.stroke !== "none")
                this.stroke = this.model.stroke;
            if (this.model.fill !== "none")
                this.fill = this.model.fill;
            this.noneButtonIndicatorElement.setAttributeNS("", "fill", this.model.get() === "none" ? "#888" : "#ddd");
            this.colorButtonIndicatorElement.setAttributeNS("", "fill", this.model.get() !== "none" ? "#888" : "#ddd");
            this.colorButtonElement.setAttributeNS("", "fill", this.model.strokeOrFill === StrokeOrFill.STROKE ? this.stroke : this.fill);
            if (this.model.stroke === "none") {
                this.strokeElement.setAttributeNS("", "fill", "#fff");
                this.strokeElement.setAttributeNS("", "stroke", "#fff");
                this.strokeNoneElement.setAttributeNS("", "stroke", "#f00");
            }
            else {
                this.strokeElement.setAttributeNS("", "fill", this.model.stroke);
                this.strokeElement.setAttributeNS("", "stroke", this.model.stroke);
                this.strokeNoneElement.setAttributeNS("", "stroke", "none");
            }
            if (this.model.fill === "none") {
                this.fillElement.setAttributeNS("", "fill", "#fff");
                this.fillNoneElement.setAttributeNS("", "stroke", "#f00");
            }
            else {
                this.fillElement.setAttributeNS("", "fill", this.model.fill);
                this.fillNoneElement.setAttributeNS("", "stroke", "none");
            }
        }
    }
    __decorate([
        bind_1
    ], StrokeAndFill.prototype, "focusFillBox", null);
    __decorate([
        bind_1
    ], StrokeAndFill.prototype, "focusStrokeBox", null);
    __decorate([
        bind_1
    ], StrokeAndFill.prototype, "swapStrokeAndFill", null);
    __decorate([
        bind_1
    ], StrokeAndFill.prototype, "setDefaultStrokeAndFill", null);
    __decorate([
        bind_1
    ], StrokeAndFill.prototype, "assignColor", null);
    __decorate([
        bind_1
    ], StrokeAndFill.prototype, "assignNone", null);

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    let style = document.createElement("style");
    style.textContent = `
    :host: {
        position: relative;
    }

    .stretch {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
    }

    .inputCatcher {
        overflow: hidden;
    }

    .inputCatcher:focus {
        /* the selected figure will have the outline */
        outline: none;
    }

    .scrollView {
        overflow: scroll;
        /* use background color to hide the inputCatcher */
        background: #fff;
    }

    .cursor-blink {
      animation: cursor-blink 1s steps(1, start) infinite;
    }

    @keyframes cursor-blink {
        50% { opacity: 0;       }
            100% { opacity: 1; }
    }
`;
    var Operation;
    (function (Operation) {
        Operation[Operation["ADD_LAYERS"] = 0] = "ADD_LAYERS";
        Operation[Operation["REMOVE_LAYERS"] = 1] = "REMOVE_LAYERS";
        Operation[Operation["ADD_FIGURES"] = 2] = "ADD_FIGURES";
        Operation[Operation["DELETE_FIGURES"] = 3] = "DELETE_FIGURES";
        Operation[Operation["TRANSFORM_FIGURES"] = 4] = "TRANSFORM_FIGURES";
        Operation[Operation["UPDATE_FIGURES"] = 5] = "UPDATE_FIGURES";
        Operation[Operation["MOVE_HANDLE"] = 6] = "MOVE_HANDLE";
    })(Operation || (Operation = {}));
    class CacheEntry {
        constructor(figure, parent = undefined) {
            this.figure = figure;
            this.parent = parent;
            this.path = undefined;
            this.svg = undefined;
        }
    }
    class FigureEditor extends toad.exports.ModelView {
        constructor(props) {
            super();
            this.cache = new Map();
            this.mouseButtonIsDown = false;
            this.bounds = new Rectangle$1();
            this.zoom = 1.0;
            this.inputCatcher = document.createElement("div");
            this.inputCatcher.classList.add("stretch");
            this.inputCatcher.classList.add("inputCatcher");
            this.inputCatcher.contentEditable = "true";
            this.inputCatcher.addEventListener("keydown", this.inputCatcherKeyDown);
            this.inputCatcher.addEventListener("cut", this.clipboard);
            this.inputCatcher.addEventListener("copy", this.clipboard);
            this.inputCatcher.addEventListener("paste", this.clipboard);
            this.scrollView = document.createElement("div");
            this.scrollView.classList.add("stretch");
            this.scrollView.classList.add("scrollView");
            this.scrollView.addEventListener("mousedown", this.mouseDown);
            this.scrollView.addEventListener("mousemove", this.mouseMove);
            this.scrollView.addEventListener("mouseup", this.mouseUp);
            this.svgView = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.decorationOverlay = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.svgView.appendChild(this.decorationOverlay);
            this.scrollView.appendChild(this.svgView);
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.appendChild(document.importNode(style, true));
            this.shadowRoot.appendChild(this.inputCatcher);
            this.shadowRoot.appendChild(this.scrollView);
            toad.exports.setInitialProperties(this, props);
            if (props === null || props === void 0 ? void 0 : props.tool)
                this.setModel(props.tool);
            if (props === null || props === void 0 ? void 0 : props.strokeandfill)
                this.setModel(props.strokeandfill);
        }
        setTool(tool) {
            if (tool == this.tool)
                return;
            if (this.tool) {
                this.tool.deactivate(this.createEditorMouseEvent());
            }
            this.tool = tool;
            if (this.tool)
                this.tool.activate(this.createEditorMouseEvent());
        }
        setModel(model) {
            if (model === undefined) {
                if (this.toolModel) {
                    this.toolModel.modified.remove(this);
                    this.toolModel = undefined;
                }
                if (this.strokeAndFillModel) {
                    this.strokeAndFillModel.modified.remove(this);
                    this.strokeAndFillModel = undefined;
                }
                super.setModel(undefined);
            }
            else if (model instanceof ToolModel) {
                if (this.toolModel === model)
                    return;
                this.toolModel = model;
                this.toolModel.modified.add(() => {
                    this.setTool(this.toolModel.value);
                }, this);
                this.setTool(this.toolModel.value);
            }
            else if (model instanceof StrokeAndFillModel) {
                if (this.strokeAndFillModel === model)
                    return;
                this.strokeAndFillModel = model;
                this.strokeAndFillModel.modified.add(() => {
                    for (let figure of Tool.selection.selection) {
                        if (figure instanceof AttributedFigure) {
                            figure.stroke = this.strokeAndFillModel.stroke;
                            figure.fill = this.strokeAndFillModel.fill;
                            let cached = this.cache.get(figure.id);
                            figure.updateSVG(cached === null || cached === void 0 ? void 0 : cached.path, this.layer, cached === null || cached === void 0 ? void 0 : cached.svg);
                        }
                    }
                }, this);
            }
            else {
                super.setModel(model);
            }
        }
        // called whenever the model is modified
        updateView(event) {
            // console.log(`FigureEditor.updateView(${JSON.stringify(event)})`)
            if (this.model === undefined || this.model.layers.length === 0) {
                return;
            }
            this.selectedLayer = this.model.layers[0];
            if (!this.layer) { // FIXME: this is a kludge to handle one layer, but we want to handle adding/removing multiple layers
                this.layer = document.createElementNS("http://www.w3.org/2000/svg", "g");
                this.layer.style.cursor = "inherit";
                this.svgView.insertBefore(this.layer, this.decorationOverlay);
            }
            let layer = this.layer;
            // event is undefined when a model is added or removed
            if (event === undefined) {
                if (this.model) {
                    // console.log(`### FigureEditor.updateView(): NEW MODEL, FAKE ADD_FIGURES MESSAGE`)
                    let figures = this.model.layers[0].data
                        .filter(figure => !this.cache.has(figure.id)) // FIXME: cache should be empty
                        .map(figure => figure.id);
                    event = {
                        operation: Operation.ADD_FIGURES,
                        figures: figures
                    };
                }
                else {
                    throw Error(`FigureEditor.updateView(): handling of removing a model hasn't been implemented yet`);
                    // TODO: clear cache, etc.
                }
            }
            switch (event.operation) {
                case Operation.ADD_FIGURES:
                    // add new figures to cache
                    this.model.layers[0].data.forEach((figure) => {
                        let notInCache = !this.cache.has(figure.id);
                        if (notInCache) {
                            this.cache.set(figure.id, new CacheEntry(figure));
                        }
                    });
                    for (let id of event.figures) {
                        let cached = this.cache.get(id);
                        if (!cached)
                            throw Error(`FigureEditor.updateView(): ADD_FIGURES cache lacks id ${id}`);
                        if (cached.figure instanceof Group) {
                            throw Error("FigureEditor.updateView(): ADD_FIGURES for groups not implemented yet");
                        }
                        if (!cached.path) {
                            cached.path = cached.figure.getPath();
                            if (cached.figure.matrix)
                                cached.path.transform(cached.figure.matrix);
                        }
                        let svg = cached.figure.updateSVG(cached.path, layer, cached.svg);
                        if (!cached.svg) {
                            layer.appendChild(svg); // FIXME: need to do positional insert 
                            cached.svg = svg;
                        }
                    }
                    break;
                case Operation.TRANSFORM_FIGURES:
                    for (let id of event.figures) {
                        let cached = this.cache.get(id);
                        if (!cached)
                            throw Error(`FigureEditor error: cache lacks id $id`);
                        if (cached.figure instanceof Group) {
                            throw Error("FigureEditor.updateView(): ADD_FIGURES for groups not implemented yet");
                        }
                        if (!cached.path)
                            throw Error("FigureEditor.updateView(): expected path in cache");
                        if (!cached.svg)
                            throw Error("FigureEditor.updateView(): expected svg in cache");
                        // variant i: get a new path
                        // cached.path = cached.figure.getPath()
                        // cached.svg = cached.figure.updateSVG(cached.path, cached.svg)
                        // variant ii: update the existing path
                        // console.log(`FigureEditor.updateView(): got transform figures`)
                        cached.path;
                        // console.log(`  before transform ${JSON.stringify(path)}`)
                        event.matrix;
                        // console.log(`FigureEditor.updateView(): transform path of figure ${id} by rotate ${m.getRotation()}, translate=${m.e}, ${m.f}`)
                        cached.path.transform(event.matrix);
                        // console.log(`  after transform ${JSON.stringify(path)}`)
                        cached.svg = cached.figure.updateSVG(cached.path, layer, cached.svg);
                        // variant iii: add transform to SVGElement
                    }
                    break;
                case Operation.UPDATE_FIGURES:
                    for (let id of event.figures) {
                        let cached = this.cache.get(id);
                        if (!cached)
                            throw Error(`FigureEditor error: cache lacks id $id`);
                        if (cached.figure instanceof Group) {
                            throw Error("FigureEditor.updateView(): UPDATE_FIGURES for groups not implemented yet");
                        }
                        if (!cached.path)
                            throw Error("FigureEditor.updateView(): expected path in cache");
                        if (!cached.svg)
                            throw Error("FigureEditor.updateView(): expected svg in cache");
                        cached.path = cached.figure.getPath();
                        if (cached.figure.matrix)
                            cached.path.transform(cached.figure.matrix);
                        cached.svg = cached.figure.updateSVG(cached.path, layer, cached.svg);
                    }
                    break;
                case Operation.DELETE_FIGURES:
                    for (let id of event.figures) {
                        let cached = this.cache.get(id);
                        if (!cached)
                            throw Error(`FigureEditor error: cache lacks id $id`);
                        if (cached.svg !== undefined)
                            layer.removeChild(cached.svg);
                        this.cache.delete(id);
                    }
                    break;
            }
            // update scrollbars
            // FIXME: replace setTimeout(..., 0) with something like, afterRendering(...)
            setTimeout(() => {
                this.bounds.expandByPoint({ x: this.scrollView.offsetWidth, y: this.scrollView.offsetHeight });
                this.svgView.style.width = this.bounds.size.width + "px";
                this.svgView.style.height = this.bounds.size.height + "px";
                this.adjustBounds();
                this.scrollView.scrollLeft = -this.bounds.origin.x;
                this.scrollView.scrollTop = -this.bounds.origin.y;
            }, 0);
        }
        adjustBounds() {
            if (!this.model)
                return;
            let bounds = new Rectangle$1();
            // include the viewing ports center
            bounds.expandByPoint({
                x: this.scrollView.offsetWidth / this.zoom,
                y: this.scrollView.offsetHeight / this.zoom
            });
            // include all figures
            for (let item of this.model.layers[0].data)
                bounds.expandByRectangle(item.bounds());
            // include visible areas top, left corner
            bounds.expandByPoint({
                x: this.bounds.origin.x + this.scrollView.scrollLeft,
                y: this.bounds.origin.y + this.scrollView.scrollTop
            });
            // include visible areas bottom, right corner
            bounds.expandByPoint({
                x: this.bounds.origin.x + this.scrollView.scrollLeft + this.scrollView.clientWidth / this.zoom,
                y: this.bounds.origin.y + this.scrollView.scrollTop + this.scrollView.clientHeight / this.zoom
            });
            let x = this.bounds.origin.x + this.scrollView.scrollLeft - bounds.origin.x;
            let y = this.bounds.origin.y + this.scrollView.scrollTop - bounds.origin.y;
            /*
            console.log("adjustBounds after scrolling")
            console.log("  old bounds   =("+editor.bounds.origin.x+","+editor.bounds.origin.y+","+editor.bounds.size.width+","+editor.bounds.size.height+")")
            console.log("  new bounds   =("+bounds.origin.x+","+bounds.origin.y+","+bounds.size.width+","+bounds.size.height+")")
            console.log("  scroll       =("+editor.window.scrollLeft+","+editor.window.scrollTop+")")
            console.log("  scroll mapped=("+(editor.bounds.origin.x+editor.window.scrollLeft)+","+(editor.bounds.origin.y+editor.window.scrollTop)+")")
            console.log("  new scroll   =("+x+","+y+")")
            */
            let zoomString = String(this.zoom);
            let scale = "scale(" + zoomString + " " + zoomString + ")";
            this.layer.setAttributeNS("", "transform", "translate(" + (-bounds.origin.x) + " " + (-bounds.origin.y) + ") " + scale);
            this.decorationOverlay.setAttributeNS("", "transform", "translate(" + (-bounds.origin.x) + " " + (-bounds.origin.y) + ") " + scale);
            this.svgView.style.width = (bounds.size.width * this.zoom) + "px";
            this.svgView.style.height = (bounds.size.height * this.zoom) + "px";
            this.scrollView.scrollLeft = x;
            this.scrollView.scrollTop = y;
            this.bounds = bounds;
        }
        transformSelection(matrix) {
            // console.log("FigureEditor.transformSelection()")
            this.model.transform(this.selectedLayer.id, Tool.selection.figureIds(), matrix);
        }
        deleteSelection() {
            this.model.delete(this.selectedLayer.id, Tool.selection.figureIds());
        }
        addFigure(figure) {
            this.model.add(this.selectedLayer.id, figure);
        }
        getPath(figure) {
            var _a;
            return (_a = this.cache.get(figure.id)) === null || _a === void 0 ? void 0 : _a.path;
        }
        getSVG(figure) {
            var _a;
            return (_a = this.cache.get(figure.id)) === null || _a === void 0 ? void 0 : _a.svg;
        }
        focus(options) {
            this.inputCatcher.focus(options);
        }
        //
        // MOUSE
        //
        mouseDown(mouseEvent) {
            // console.log(`FigureEditor.mouseDown()`)
            // console.log(this.tool)
            // console.log(this.selectedLayer)
            this.inputCatcher.focus({ preventScroll: true });
            mouseEvent.preventDefault();
            this.mouseButtonIsDown = true;
            if (this.tool && this.selectedLayer)
                this.tool.mousedown(this.createEditorMouseEvent(mouseEvent));
        }
        mouseMove(mouseEvent) {
            mouseEvent.preventDefault();
            if (this.tool && this.selectedLayer)
                this.tool.mousemove(this.createEditorMouseEvent(mouseEvent));
        }
        mouseUp(mouseEvent) {
            mouseEvent.preventDefault();
            this.mouseButtonIsDown = false;
            if (this.tool && this.selectedLayer)
                this.tool.mouseup(this.createEditorMouseEvent(mouseEvent));
        }
        createEditorMouseEvent(mouseEvent) {
            if (mouseEvent === undefined) {
                return { editor: this, x: 0, y: 0, shiftKey: false, mouseDown: false };
            }
            // (e.clientX-r.left, e.clientY-r.top) begins at the upper left corner of the editor window
            //                                     scrolling and origin are ignored
            let r = this.scrollView.getBoundingClientRect();
            let x = (mouseEvent.clientX + 0.5 - r.left + this.scrollView.scrollLeft + this.bounds.origin.x) / this.zoom;
            let y = (mouseEvent.clientY + 0.5 - r.top + this.scrollView.scrollTop + this.bounds.origin.y) / this.zoom;
            return { editor: this, x: x, y: y, shiftKey: mouseEvent.shiftKey, mouseDown: this.mouseButtonIsDown };
        }
        //
        // KEYBOARD
        //
        inputCatcherKeyDown(e) {
            if (e.metaKey !== true && e.key !== "Dead" && this.tool && this.selectedLayer) {
                this.tool.keydown(new EditorKeyboardEvent(this, e));
                // clear the input catcher so we do not accumulate data we do not need.
                // NOTE: do not clear it when e.key === "Dead" because the input method
                // uses the content to compose the character.
                // NOTE: there are some situations where dead key suddenly stops working
                //       the if statement might be wrong...?
                this.inputCatcher.textContent = "";
            }
        }
        //
        // CLIPBOARD
        //
        clipboard(event) {
            if (this.tool && this.selectedLayer)
                this.tool.clipboard(this, event);
        }
    }
    __decorate([
        bind_1
    ], FigureEditor.prototype, "mouseDown", null);
    __decorate([
        bind_1
    ], FigureEditor.prototype, "mouseMove", null);
    __decorate([
        bind_1
    ], FigureEditor.prototype, "mouseUp", null);
    __decorate([
        bind_1
    ], FigureEditor.prototype, "inputCatcherKeyDown", null);
    __decorate([
        bind_1
    ], FigureEditor.prototype, "clipboard", null);

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    let strokeandfillStyle = document.createElement("style");
    strokeandfillStyle.textContent = `
svg {
    top: 0;
    botton: 0;
    left: 0;
    right: 0;
    background: none;
}
`;
    class ColorSwatchModel extends toad.exports.Model {
        constructor() {
            super();
            this.data = [
                [0, 0, 0, ""],
                [128, 128, 128, ""],
                [191, 191, 191, ""],
                [255, 255, 255, ""],
                [128, 0, 0, ""],
                [255, 0, 0, ""],
                [255, 128, 0, ""],
                //          [255, 128, 128, ""],
                [255, 205, 148, ""],
                [255, 255, 0, ""],
                [0, 255, 0, ""],
                [0, 128, 0, ""],
                [0, 128, 128, ""],
                [0, 255, 255, ""],
                [0, 128, 255, ""],
                [0, 0, 255, ""],
                [0, 0, 128, ""],
                [128, 0, 128, ""],
                [128, 0, 255, ""],
                [128, 128, 255, ""],
                [255, 0, 255, ""],
                [255, 0, 128, ""],
                [255, 128, 255, ""],
                [255, 255, 128, ""],
                [128, 128, 0, ""],
                [128, 255, 0, ""],
                [128, 255, 128, ""],
                [0, 255, 128, ""],
                [128, 255, 255, ""],
            ];
        }
    }
    class ColorSwatch extends toad.exports.ActionView {
        constructor(props) {
            super();
            let model = (props === null || props === void 0 ? void 0 : props.model) ? props.model : new ColorSwatchModel();
            this.action = props === null || props === void 0 ? void 0 : props.action;
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            let x = 0, y = 0;
            for (let color of model.data) {
                let box = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                for (let n of [
                    ["x", String(1 + x * 10)],
                    ["y", String(1 + y * 10)],
                    ["width", "9"],
                    ["height", "9"],
                    ["stroke", "none"],
                    ["fill", "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")"]
                ]) {
                    box.setAttributeNS("", n[0], n[1]);
                }
                svg.appendChild(box);
                ++x;
                if (x >= 4) {
                    x = 0;
                    ++y;
                }
            }
            svg.onmousedown = (mouseEvent) => {
                if (this.action === undefined)
                    return;
                let bounds = svg.getBoundingClientRect();
                let mousePosition = new Point({ x: mouseEvent.x - bounds.left, y: mouseEvent.y - bounds.top });
                let x = 0, y = 0;
                for (let color of model.data) {
                    // FIXME: Point and Rectangle should really provide constructors with coordinates
                    let box = new Rectangle$1({ origin: { x: 1 + x * 10, y: 1 + y * 10 }, size: { width: 9, height: 9 } });
                    if (box.contains(mousePosition)) {
                        // console.log("got color ", color)
                        this.action.trigger("rgb(" + color[0] + "," + color[1] + "," + color[2] + ")");
                        break;
                    }
                    ++x;
                    if (x >= 4) {
                        x = 0;
                        ++y;
                    }
                }
            };
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.appendChild(document.importNode(strokeandfillStyle, true));
            this.shadowRoot.appendChild(svg);
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class AccountPreferences extends toad.exports.Dialog {
        constructor(user) {
            super();
            this.open("src/client/AccountPreferences.html");
            this.bind("fullname", user.fullname);
            this.bind("email", user.email);
            this.action("cancel", () => {
                this.close();
            });
            this.action("save", () => {
                this.close();
            });
        }
    }

    // This file is generated by the corba.js IDL compiler from 'src/shared/workflow.idl'.
    class BoardListener extends Skeleton_1 {
        constructor(orb) { super(orb); }
        static _idlClassName() {
            return "BoardListener";
        }
    }
    class Client extends Skeleton_1 {
        constructor(orb) { super(orb); }
        static _idlClassName() {
            return "Client";
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    // FigureEditor -> BoardModel -> Server -> BoardListener_impl -> FigureEditor.updateView()
    class BoardListener_impl extends BoardListener {
        constructor(orb, boardmodel) {
            super(orb);
            this.boardmodel = boardmodel;
        }
        layerById(layerID) {
            for (let layer of this.boardmodel.layers) {
                if (layer.id === layerID)
                    return layer;
            }
            throw Error("BoardListener_impl.layerById(): unknown layer id " + layerID);
        }
        add(layerId, figure) {
            return __awaiter$1(this, void 0, void 0, function* () {
                let layer = this.layerById(layerId);
                layer.data.push(figure);
                this.boardmodel.modified.trigger({
                    operation: Operation.ADD_FIGURES,
                    figures: [figure.id]
                });
            });
        }
        transform(layerId, figureIdArray, matrix, newIds) {
            return __awaiter$1(this, void 0, void 0, function* () {
                // console.log("BoardListener_impl.transform(", figureIdArray, ", ", matrix, ", ", newIds, ")")
                // FIXME: too many casts
                let layer = this.layerById(layerId);
                let figureIdSet = new Set();
                for (let id of figureIdArray)
                    figureIdSet.add(id);
                for (let index in layer.data) {
                    let fig = layer.data[index];
                    if (!figureIdSet.has(fig.id))
                        continue;
                    if (fig.transform(matrix)) // TODO: it doesn't work like this anymore, need to go thru FigureEditor?
                        continue;
                    throw Error("BoardListener_impl.transform(): inserting a Transform() figure is not implemented... and should also be deprecated.");
                    // let transform = new Transform()
                    // transform.id = newIds.shift()!
                    // transform.transform(matrix)
                    // let oldPath = fig.getPath()
                    // let oldParentNode = oldPath.svg.parentNode!
                    // let oldNextSibling = oldPath.svg.nextSibling
                    // oldParentNode.removeChild(oldPath.svg)
                    // transform.add(fig)
                    // let newPath = transform.getPath()
                    // newPath.updateSVG();
                    // oldParentNode.insertBefore(newPath.svg, oldNextSibling)
                    // layer.data[index] = transform
                }
                this.boardmodel.modified.trigger({
                    operation: Operation.TRANSFORM_FIGURES,
                    figures: figureIdArray,
                    matrix: matrix
                });
            });
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class LocalLayer extends Layer {
        createFigureId() {
            if (this.highestFigureId === undefined) {
                this.highestFigureId = 0;
                for (let figure of this.data) {
                    if (figure.id > this.highestFigureId) { // FIXME: recursive
                        this.highestFigureId = figure.id;
                    }
                }
            }
            return ++this.highestFigureId;
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class LocalLayerModel {
        constructor() {
            this.idCounter = -1;
            this.modified = new toad.exports.Signal();
            // this.modified.add((data: LayerEvent)=>{
            //     console.log(`LocalLayerModel.modified(), need to do something: ${JSON.stringify(data)}`)
            // })
            this.layers = new Array();
        }
        layerById(layerID) {
            for (let layer of this.layers) {
                if (layer.id === layerID)
                    return layer;
            }
            throw Error("LocalLayerModel.layerById(): unknown layer id " + layerID);
        }
        add(layerId, figure) {
            if (this.idCounter === -1) {
                this.setIdCounter();
            }
            // console.log(`LocalLayerModel.add(${layerId}, ${(figure as Object).constructor.name})`)
            let layer = this.layerById(layerId);
            figure.id = this.idCounter;
            ++this.idCounter;
            layer.data.push(figure);
            this.modified.trigger({ operation: Operation.ADD_FIGURES, figures: [figure.id] });
        }
        setIdCounter() {
            for (let layer of this.layers) {
                for (let figure of layer.data) {
                    this.setIdCounterByFigure(figure);
                }
            }
            ++this.idCounter;
        }
        setIdCounterByFigure(figure) {
            this.idCounter = Math.max(this.idCounter, figure.id);
            if (figure instanceof Group) {
                for (let groupFigure of figure.childFigures) {
                    this.setIdCounterByFigure(groupFigure);
                }
            }
        }
        // layerId: layer containing figures to be transformed
        // figureIds: figures to be transformed
        transform(layerID, figureIds, matrix /*, newIds: Array<number>*/) {
            // console.log(`LocalLayerModel.transform(${layerID}, ${figureIds}, ${matrix})`)
            let fastFigureIds = this.figureIdsAsSet(figureIds); // FIXME: could use the FigureEditor cache instead
            let layer = this.layerById(layerID);
            for (let index in layer.data) {
                let fig = layer.data[index];
                if (!fastFigureIds.has(fig.id))
                    continue;
                if (fig.matrix === undefined && fig.transform(matrix)) {
                    // console.log(`LocalLayerModel.transform(${layerID}, ${figureIds}, ${matrix}) -> trigger with UPDATE_FIGURES`)
                    this.modified.trigger({ operation: Operation.UPDATE_FIGURES, figures: [fig.id] });
                    continue;
                }
                if (fig.matrix === undefined)
                    fig.matrix = new Matrix();
                fig.matrix.prepend(matrix);
                // console.log(`LocalLayerModel.transform(${layerID}, ${figureIds}, ${matrix}) -> trigger with TRANSFORM_FIGURES`)
                this.modified.trigger({ operation: Operation.TRANSFORM_FIGURES, matrix: matrix, figures: [fig.id] });
            }
        }
        delete(layerID, figureIds) {
            // console.log(`LocalLayerModel.delete(${layerID}, ${figureIds})`)
            let fastFigureIds = this.figureIdsAsSet(figureIds); // FIXME: could use the FigureEditor cache instead
            let layer = this.layerById(layerID);
            for (let i = layer.data.length - 1; i >= 0; --i) {
                if (!fastFigureIds.has(layer.data[i].id))
                    continue;
                layer.data.splice(i, 1);
            }
            this.modified.trigger({ operation: Operation.DELETE_FIGURES, figures: figureIds });
        }
        figureIdsAsSet(figureIds) {
            // console.log(`LocalLayerModel.figureIdsAsSet(${figureIds})`)
            let figureIdSet = new Set();
            for (let id of figureIds)
                figureIdSet.add(id);
            return figureIdSet;
        }
    }

    function homeScreen(model, tool, strokeandfill, colorswatch, avatar) {
        // FIXME: let ColorSwatch take a closure
        // FIXME: make it possible to use Action directly
        const setcolor = toad.exports.action("setcolor", (data) => {
            strokeandfill.set(data);
        });
        return toad.exports.jsxs(toad.exports.Fragment, { children: [toad.exports.jsx("img", { src: "img/logo.svg", width: "44", height: "44", style: { position: "absolute", left: "2px", top: "2px" } }, void 0), toad.exports.jsxs("div", Object.assign({ style: { position: "absolute", left: 0, width: "41px", top: "49px", bottom: "32px", backgroundColor: "#e3dbdb" } }, { children: [toad.exports.jsx(toad.exports.ToolButton, { model: tool, value: "select", img: "img/tool/select.svg" }, void 0), toad.exports.jsx(toad.exports.ToolButton, { model: tool, value: "line", img: "img/tool/line.svg" }, void 0), toad.exports.jsx(toad.exports.ToolButton, { model: tool, value: "freehand", img: "img/tool/freehand.svg" }, void 0), toad.exports.jsx(toad.exports.ToolButton, { model: tool, value: "rectangle", img: "img/tool/rectangle.svg" }, void 0), toad.exports.jsx(toad.exports.ToolButton, { model: tool, value: "circle", img: "img/tool/circle.svg" }, void 0), toad.exports.jsx(toad.exports.ToolButton, { model: tool, value: "text", img: "img/tool/text.svg" }, void 0), toad.exports.jsx(toad.exports.ToolButton, { model: tool, value: "state", img: "img/tool/state.svg" }, void 0), toad.exports.jsx(toad.exports.ToolButton, { model: tool, value: "transition", img: "img/tool/transition.svg" }, void 0), toad.exports.jsx(StrokeAndFill, { model: strokeandfill }, void 0), toad.exports.jsx(ColorSwatch, { model: colorswatch, action: setcolor }, void 0)] }), void 0), toad.exports.jsx(FigureEditor, { model: model, tool: tool, strokeandfill: strokeandfill, style: { position: "absolute", left: "41px", right: "0px", top: "49px", bottom: "32px" } }, void 0), toad.exports.jsx("div", { id: "debug", style: { position: "absolute", left: "0", right: "0", height: "32px", bottom: "0", backgroundColor: "silver" } }, void 0), toad.exports.jsx("div", Object.assign({ style: { position: "absolute", left: "48px", right: "0", top: "0" } }, { children: toad.exports.jsx(toad.exports.Menu, { config: [
                            { name: "file", label: "File", sub: [
                                    { name: "new", label: "New", sub: [
                                            { name: "board", label: "Board" },
                                            { name: "card", label: "Card" },
                                            { name: "document", label: "Document" },
                                        ] },
                                    { name: "import", label: "Import" },
                                    { name: "export", label: "Export" },
                                    { name: "delete", label: "Delete" },
                                    { name: "permissions", label: "Permissions" },
                                ] },
                            { name: "edit", label: "Edit", sub: [
                                    { name: "undo", label: "Undo", shortcut: "Ctrl+Z" },
                                    { name: "redo", label: "Redo", shortcut: "Ctrl+Y" },
                                    { name: "cut", label: "Cut", shortcut: "Ctrl+X" },
                                    { name: "copy", label: "Copy", shortcut: "Ctrl+C" },
                                    { name: "paste", label: "Paste", shortcut: "Ctrl+V" },
                                    { name: "delete", label: "Delete", shortcut: "Del" },
                                    { name: "deselect-all", label: "Deselect All", shortcut: "Ctrl+Shift+A" },
                                    { name: "select-all", label: "Select All", shortcut: "Ctrl+A" },
                                ] },
                            { name: "object", label: "Object", sub: [
                                    { name: "transform", label: "Transform", sub: [
                                            { name: "again", label: "Transform Again", shortcut: "Ctrl+D" },
                                            { name: "move", label: "Move", shortcut: "Ctrl+Shift+M" },
                                            { name: "rotate", label: "Rotate" },
                                            { name: "mirror", label: "Mirror" },
                                            { name: "scale", label: "Scale" },
                                            { name: "shear", label: "Shear" },
                                        ] },
                                    { name: "arrange", label: "Arrange" },
                                    { name: "group", label: "Group" },
                                    { name: "ungroup", label: "Ungroup" },
                                ] },
                            { name: "type", label: "Type", sub: [
                                    { name: "font", label: "Font", sub: [
                                            { name: "family", label: "Family" },
                                            { name: "bold", label: "Bold", shortcut: "Ctrl+B" },
                                            { name: "italics", label: "Italics", shortcut: "Ctrl+I" },
                                            { name: "underline", label: "Underline", shortcut: "Ctrl+U" },
                                            { name: "stroke", label: "Stroke" },
                                            { name: "bigger", label: "Bigger", shortcut: "Ctrl++" },
                                            { name: "smaller", label: "Smaller", shortcut: "Ctrl+-" },
                                        ] },
                                    { name: "text", label: "Text", sub: [
                                            { name: "left", label: "Left" },
                                            { name: "center", label: "Center" },
                                            { name: "right", label: "Right" },
                                        ] },
                                ] },
                            { space: true },
                            { name: "help", label: "Help" },
                            { name: "settings", label: "Settings" },
                            { name: "account", label: "Account", model: avatar, sub: [
                                    { name: "preferences", label: "Preferences" },
                                    { name: "logout", label: "Logout" },
                                ] },
                        ] }, void 0) }), void 0)] }, void 0);
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    class IndexedDB {
        constructor() {
            this.stores = [];
        }
        delete(databaseName) {
            return new Promise((resolve, reject) => {
                const request = window.indexedDB.deleteDatabase(databaseName);
                request.onerror = () => reject(request.error);
                request.onsuccess = resolve;
            });
        }
        open(databaseName, version) {
            return new Promise((resolve, reject) => {
                const request = window.indexedDB.open(databaseName, version);
                request.onupgradeneeded = (event) => {
                    this.db = event.target.result;
                    this.stores.forEach(store => store.upgrade(this.db));
                };
                request.onerror = () => reject(request.error);
                request.onsuccess = (event) => {
                    this.db = request.result;
                    resolve(event);
                };
            });
        }
    }
    class ObjectStore {
        constructor(db, storeName, upgrade) {
            this.db = db;
            this.storeName = storeName;
            this.upgrade = upgrade;
            db.stores.push(this);
        }
        add(entity) {
            return __awaiter$1(this, void 0, void 0, function* () {
                const transaction = this.db.db.transaction(this.storeName, "readwrite");
                const store = transaction.objectStore(this.storeName);
                const request = store.add(entity);
                return new Promise((resolve, reject) => {
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            });
        }
        put(entity, key) {
            return __awaiter$1(this, void 0, void 0, function* () {
                const transaction = this.db.db.transaction(this.storeName, "readwrite");
                const store = transaction.objectStore(this.storeName);
                const request = store.put(entity, key);
                return new Promise((resolve, reject) => {
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            });
        }
        get(query) {
            return __awaiter$1(this, void 0, void 0, function* () {
                const transaction = this.db.db.transaction(this.storeName, "readonly");
                const store = transaction.objectStore(this.storeName);
                const request = store.get(query);
                return new Promise((resolve, reject) => {
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            });
        }
        getAll(query, count) {
            return __awaiter$1(this, void 0, void 0, function* () {
                const transaction = this.db.db.transaction(this.storeName, "readonly");
                const store = transaction.objectStore(this.storeName);
                const request = store.getAll(query, count);
                return new Promise((resolve, reject) => {
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            });
        }
        getAllKeys(query, count) {
            return __awaiter$1(this, void 0, void 0, function* () {
                const transaction = this.db.db.transaction(this.storeName, "readonly");
                const store = transaction.objectStore(this.storeName);
                const request = store.getAllKeys(query, count);
                return new Promise((resolve, reject) => {
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            });
        }
        delete(index) {
            return __awaiter$1(this, void 0, void 0, function* () {
                const transaction = this.db.db.transaction(this.storeName, "readwrite");
                const store = transaction.objectStore(this.storeName);
                const request = store.delete(index);
                return new Promise((resolve, reject) => {
                    request.onerror = () => reject(request.error);
                    request.onsuccess = resolve;
                });
            });
        }
    }

    class ExportDrawing extends toad.exports.Dialog {
        constructor(filename, layer, orb) {
            super();
            const filenameModel = new toad.exports.TextModel(filename);
            const download = document.createElement("a");
            download.type = "text/plain";
            download.style.display = "hidden";
            this.open(toad.exports.jsxs(toad.exports.Fragment, { children: [toad.exports.jsx("h1", { children: "Export" }, void 0), toad.exports.jsx("p", { children: toad.exports.jsx(toad.exports.TextView, { model: filenameModel }, void 0) }, void 0), toad.exports.jsxs("p", { children: [toad.exports.jsx(toad.exports.Button, Object.assign({ action: this.close }, { children: "Cancel" }), void 0), toad.exports.jsx(toad.exports.Button, Object.assign({ action: () => {
                                    download.download = filenameModel.value;
                                    download.href = URL.createObjectURL(new Blob([orb.serialize(layer.data)]));
                                    download.dispatchEvent(new MouseEvent("click"));
                                    this.close();
                                } }, { children: "Export" }), void 0)] }, void 0), download] }, void 0));
        }
    }

    class ImportDrawing extends toad.exports.Dialog {
        constructor(model, orb) {
            super();
            let uploadOccured = false;
            const upload = document.createElement("input");
            upload.type = "file";
            upload.style.display = "none";
            upload.addEventListener("change", () => __awaiter$1(this, void 0, void 0, function* () {
                var _a;
                uploadOccured = true;
                // console.log(upload.files)
                if (((_a = upload.files) === null || _a === void 0 ? void 0 : _a.length) === 1) {
                    const file = upload.files[0];
                    // console.log(`file: "${file.name}", size ${file.size} bytes`)
                    const content = yield file.text();
                    // console.log(content)
                    const data = orb.deserialize(content);
                    const layer = model.layers[0];
                    model.delete(layer.id, layer.data.map((f) => f.id));
                    layer.data = data;
                    model.modified.trigger(undefined);
                    this.close();
                }
            }), false);
            // we use a trick from
            //   https://stackoverflow.com/questions/34855400/cancel-event-on-input-type-file
            // to closed the dialog in case the upload was cancled:
            // when the file dialog closes, we the focus is returned to the window
            // if there wasn't an upload, we close the dialog
            window.addEventListener("focus", (e) => {
                setTimeout(() => {
                    if (!uploadOccured && this.shadow)
                        this.close();
                }, 300);
            }, { once: true });
            this.open(toad.exports.jsxs(toad.exports.Fragment, { children: [toad.exports.jsx("h1", { children: "Import" }, void 0), toad.exports.jsxs("p", { children: [toad.exports.jsx(toad.exports.Button, Object.assign({ action: this.close }, { children: "Cancel" }), void 0), toad.exports.jsx(toad.exports.Button, Object.assign({ action: () => {
                                    upload.dispatchEvent(new MouseEvent("click"));
                                } }, { children: "Import" }), void 0)] }, void 0), upload] }, void 0));
            upload.dispatchEvent(new MouseEvent("click"));
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    var dom;
    (function (dom) {
        function erase(n) {
            while (n.firstChild)
                n.removeChild(n.firstChild);
        }
        dom.erase = erase;
        function add(n0, n1) { n0.appendChild(n1); }
        dom.add = add;
        function instantiateTemplate(name) {
            return tmpl(name);
        }
        dom.instantiateTemplate = instantiateTemplate;
        function tmpl(name) {
            let t = document.querySelector('template[id="' + name + '"]');
            if (!t) {
                throw new Error("failed to find template '" + name + "'");
            }
            let x = t;
            let z = x.content;
            let y = document.importNode(z, true);
            return y;
        }
        dom.tmpl = tmpl;
    })(dom || (dom = {}));
    class Client_impl extends Client {
        constructor(orb, server) {
            super(orb);
            if (server !== undefined) {
                this.server = server;
                server.setClient(this);
                this.initializeSession();
            }
            else {
                this.offline();
            }
        }
        initializeSession() {
            let session = "";
            if (document.cookie) {
                let cookies = document.cookie.split(";");
                for (let i = 0; i < cookies.length; ++i) {
                    let str = cookies[i].trim();
                    if (str.indexOf("session=") == 0) {
                        session = str.substring(8, str.length);
                        break;
                    }
                }
            }
            this.server.initializeWebSession(session);
        }
        logonScreen(lifetime, disclaimer, inRemember, errorMessage) {
            return __awaiter$1(this, void 0, void 0, function* () {
                console.log("Client_impl.logonScreen()");
                let template = new toad.exports.Template("logonScreen");
                let logon = template.text("logon", "");
                let password = template.text("password", "");
                let remember = template.boolean("remember", inRemember);
                template.html("disclaimer", disclaimer);
                template.number("lifetime", lifetime, {});
                template.text("message", errorMessage);
                let logonAction = template.action("logon", () => {
                    template.clear();
                    this.server.logon(logon.value, password.value, remember.value);
                });
                let checkLogonCondition = function () {
                    logonAction.enabled = logon.value.trim().length != 0 && password.value.trim().length != 0;
                };
                checkLogonCondition();
                logon.modified.add(checkLogonCondition);
                password.modified.add(checkLogonCondition);
                dom.erase(document.body);
                dom.add(document.body, template.root);
            });
        }
        homeScreen(cookie, avatar, email, fullname) {
            return __awaiter$1(this, void 0, void 0, function* () {
                console.log("homeScreen()");
                this.createMenuActions(fullname, email);
                this.createAvatarModel(avatar);
                // this.createToolModel() // for figureeditor
                // this.createStrokeAndFillModel()
                const model = yield this.createBoardModel();
                this.getHomeScreen(model);
                if (cookie.length !== 0) {
                    document.cookie = cookie;
                }
                // let homeScreen = dom.instantiateTemplate('homeScreen')
                // msg.board.socket = msg.socket
                dom.erase(document.body);
                // homeScreen.appendTo(document.body)
                // dom.add(document.body, homeScreen)
            });
        }
        getHomeScreen(model) {
            // MODEL
            const tool = this.createToolModel();
            const strokeandfill = this.createStrokeAndFillModel();
            const colorswatch = new ColorSwatchModel();
            const avatar = this.createAvatarModel("img/avatars/whale.svg"); // FIXME: hack which only works only for offline
            // VIEW FIXME: move into separate file
            return homeScreen(model, tool, strokeandfill, colorswatch, avatar);
        }
        createBoardModel() {
            return __awaiter$1(this, void 0, void 0, function* () {
                let project = yield this.server.getProject(1);
                let board = yield project.getBoard(1);
                let boardmodel = yield board.getModel(); // FIXME: getModel should also set the listener so that we won't skip a beat
                boardmodel.board = board;
                let boardListener = new BoardListener_impl(this.orb, boardmodel);
                board.addListener(boardListener);
                toad.exports.bind("board", boardmodel);
                return boardmodel;
            });
        }
        offline() {
            return __awaiter$1(this, void 0, void 0, function* () {
                // console.log("offline()")
                let model = new LocalLayerModel();
                let layer = new LocalLayer();
                const db = new IndexedDB();
                // await db.delete("workflow")
                const store = new ObjectStore(db, "document", (db) => {
                    const objectStore = db.createObjectStore("document", {
                        // keyPath: "id",
                        autoIncrement: true
                    });
                    objectStore.createIndex("name", "name", { unique: false });
                });
                yield db.open("workflow", 2);
                const page = yield store.get(1);
                if (page === undefined) {
                    // console.log("CREATE INITIAL PAGE")
                    yield store.add({ name: "Untitled.wf", content: "" });
                }
                else {
                    // console.log("FOUND PREVIOUS PAGE")
                    // console.log(page)
                    if (page.content !== "") {
                        const layer2 = this.orb.deserialize(page.content);
                        layer.data = layer2.data;
                    }
                }
                model.modified.add(() => {
                    // console.log("SAVE")
                    store.put({ name: "Untitled.wf", content: this.orb.serialize(layer) }, 1);
                });
                model.layers.push(layer);
                toad.exports.bind("board", model);
                toad.exports.action("file|export", () => {
                    new ExportDrawing("Untitled.wf", layer, this.orb);
                });
                toad.exports.action("file|import", () => {
                    new ImportDrawing(model, this.orb);
                });
                const homeScreen = this.getHomeScreen(model);
                // this.createMenuActions("Maria Doe", "user@localhost")
                // this.createAvatarModel("img/avatars/whale.svg")
                // this.createToolModel() // for figureeditor
                // this.createStrokeAndFillModel()
                dom.erase(document.body);
                homeScreen.appendTo(document.body);
            });
        }
        createMenuActions(fullname, email) {
            toad.exports.action("account|preferences", () => {
                let user = {
                    fullname: new toad.exports.TextModel(fullname),
                    email: new toad.exports.TextModel(email)
                };
                new AccountPreferences(user);
            });
            toad.exports.action("account|logout", () => {
            });
        }
        createStrokeAndFillModel() {
            let strokeandfillmodel = new StrokeAndFillModel();
            toad.exports.bind("strokeandfill", strokeandfillmodel);
            toad.exports.bind("board", strokeandfillmodel);
            toad.exports.action("setcolor", (data) => {
                strokeandfillmodel.set(data);
            });
            return strokeandfillmodel;
        }
        createToolModel() {
            let toolmodel = new ToolModel();
            toolmodel.add("select", new SelectTool());
            toolmodel.add("rectangle", new ShapeTool(Rectangle));
            toolmodel.add("circle", new ShapeTool(Circle));
            toolmodel.add("text", new TextTool());
            toolmodel.stringValue = "select";
            toad.exports.bind("tool", toolmodel); // for tool buttons
            toad.exports.bind("board", toolmodel);
            return toolmodel;
        }
        createAvatarModel(avatar) {
            let model = new toad.exports.HtmlModel(`
            <svg height="32" width="32">
                <defs>
                    <clipPath id="mask">
                        <rect x="0" y="0" width="32" height="32" rx="4" ry="4" />
                    </clipPath>
                </defs>
                <rect x="0" y="0" width="32" height="32" rx="4" ry="4" stroke="none" fill="#08f" />
                <image clip-path="url(#mask)" xlink:href="${avatar}" x="2" y="2" width="28px" height="28px" />
            </svg>`);
            toad.exports.bind("avatar", model);
            return model;
        }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    // FigureEditor -> BoardModel -> Server -> BoardListener_impl -> FigureEditor.updateView()
    class BoardModel {
        constructor(init) {
            initBoardModel(this, init);
            this.modified = new toad.exports.Signal();
            console.log("BoardModel.constructor()");
        }
        // FIXME: too many functions to do stuff
        transform(layerID, indices, matrix) {
            this.board.transform(layerID, indices, matrix);
        }
        add(layerID, figure) {
            this.board.add(layerID, figure);
        }
        delete(layerID, indices) { }
    }

    /*
     *  workflow - A collaborative real-time white- and kanban board
     *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
     *
     *  This program is free software: you can redistribute it and/or modify
     *  it under the terms of the GNU Affero General Public License as published by
     *  the Free Software Foundation, either version 3 of the License, or
     *  (at your option) any later version.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU Affero General Public License for more details.
     *
     *  You should have received a copy of the GNU Affero General Public License
     *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */
    // import { openFile } from "./view/widgets/filedialog"
    function main(url) {
        return __awaiter$1(this, void 0, void 0, function* () {
            registerHTMLCustomElements();
            let orb = new ORB_1();
            // orb.debug = 1
            initializeORB(orb);
            initializeCORBAValueTypes();
            if (url === undefined) {
                // openFile()
                new Client_impl(orb);
                return;
            }
            try {
                yield orb.connect(url);
            }
            catch (error) {
                document.body.innerHTML = "could not connect to workflow server '" + url + "'. please try again later.";
                return;
            }
            orb.onclose = () => {
                document.body.innerHTML = "lost connection to workflow server '" + url + "'. please reload.";
            };
            let workflowserver = WorkflowServer.narrow(yield orb.resolve("WorkflowServer"));
            let sessionServerSide = yield workflowserver.getServer();
            new Client_impl(orb, sessionServerSide);
        });
    }
    function initializeORB(orb) {
        orb.registerStubClass(WorkflowServer);
        orb.registerStubClass(Server);
        orb.registerStubClass(Project);
        orb.registerStubClass(Board);
    }
    function initializeCORBAValueTypes() {
        ORB_1.registerValueType("Point", Point);
        ORB_1.registerValueType("Size", Size);
        ORB_1.registerValueType("Rectangle", Rectangle$1);
        ORB_1.registerValueType("Matrix", Matrix);
        ORB_1.registerValueType("Figure", Figure);
        ORB_1.registerValueType("figure.AttributedFigure", AttributedFigure);
        ORB_1.registerValueType("figure.Shape", Shape);
        ORB_1.registerValueType("figure.Rectangle", Rectangle);
        ORB_1.registerValueType("figure.Circle", Circle);
        ORB_1.registerValueType("figure.Text", Text);
        ORB_1.registerValueType("figure.Group", Group);
        ORB_1.registerValueType("figure.Transform", Transform);
        //    ORB.registerValueType("FigureModel", FigureModel)
        ORB_1.registerValueType("Layer", Layer);
        ORB_1.registerValueType("BoardModel", BoardModel);
    }
    function registerHTMLCustomElements() {
        toad.exports.View.define("toad-figureeditor", FigureEditor);
        toad.exports.View.define("toad-strokeandfill", StrokeAndFill);
        toad.exports.View.define("toad-colorswatch", ColorSwatch);
    }

    exports.initializeCORBAValueTypes = initializeCORBAValueTypes;
    exports.initializeORB = initializeORB;
    exports.main = main;
    exports.registerHTMLCustomElements = registerHTMLCustomElements;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
//# sourceMappingURL=workflow.js.map
