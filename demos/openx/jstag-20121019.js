var OX = OX || function (w, d) {
        var utils, template;

        function initImports() {
            utils = OX.utils;
            template = OX.templater
        }
        function initTemplates() {
            var templates = {
                ifrmDoc: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN""http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><title>OpenX</title><base target="_top" />{head}</head><body style="margin: 0; padding: 0">{html}</body></html>',
                ifrmNoDoc: "<iframe src='{src}' width='0' height='0' style='display:none;' frameborder='0' marginheight='0' marginwidth='0' scrolling='no'></iframe>",
                recordSegments: "<div style='position: absolute; left: 0px; top: 0px; visibility: hidden;'><img src='{gw}/1.0/rs?",
                arjRequest: "<script id='ox_req_{cb}' src='{src}'><\/script>"
            };
            for (var name in templates) {
                templates.hasOwnProperty(name) && template.register(name, templates[name])
            }
        }
        var _OX_pageURL = null,
            _OX_lookup = {}, _OX_refererURL = null,
            _OX_frameCreatives, _OX_variables = {}, UNDEF = "undefined",
            IFRM_SWF = "<script type='text/javascript'>var OX_swfobject = window.parent.OX.swfobject(window, document, navigator);<\/script>";
        var _OX_enrichRequest = function () {
            var parameters = "";
            parameters += "&res=" + w.screen.width + "x" + w.screen.height + "x" + w.screen.colorDepth;
            parameters += "&plg=" + _OX_detectPlugins();
            parameters += d.charset ? "&ch=" + d.charset : (d.characterSet ? "&ch=" + d.characterSet : "");
            parameters += "&tz=" + (new Date()).getTimezoneOffset();
            if (_OX_variables) {
                for (var k in _OX_variables) {
                    if (_OX_variables.hasOwnProperty(k)) {
                        for (var i = 0; i < _OX_variables[k].length; ++i) {
                            parameters += "&c." + escape(k) + "=" + escape(_OX_variables[k][i])
                        }
                    }
                }
            }
            return parameters
        };
        var _OX_detectPlugins = function () {
            var cookie = "OX_plg";
            if (_OX_detectPlugins.pluginlist) {
                return _OX_detectPlugins.pluginlist
            }
            if (d.cookie) {
                var arr = d.cookie.split((escape(cookie) + "="));
                if (2 <= arr.length) {
                    var arr2 = arr[1].split(";");
                    if (arr2[0]) {
                        if (arr2[0].indexOf("|") >= 0) {
                            return unescape(arr2[0].split("|").join(","))
                        }
                    }
                }
            }
            var pluginlist = "";
            var supported = [];
            var plugins = {
                swf: {
                    activex: ["ShockwaveFlash.ShockwaveFlash", "ShockwaveFlash.ShockwaveFlash.3", "ShockwaveFlash.ShockwaveFlash.4", "ShockwaveFlash.ShockwaveFlash.5", "ShockwaveFlash.ShockwaveFlash.6", "ShockwaveFlash.ShockwaveFlash.7"],
                    plugin: /flash/gim
                },
                sl: {
                    activex: ["AgControl.AgControl"],
                    plugin: /silverlight/gim
                },
                pdf: {
                    activex: ["acroPDF.PDF.1", "PDF.PdfCtrl.1", "PDF.PdfCtrl.4", "PDF.PdfCtrl.5", "PDF.PdfCtrl.6"],
                    plugin: /adobe\s?acrobat/gim
                },
                qt: {
                    activex: ["QuickTime.QuickTime", "QuickTime.QuickTime.4"],
                    plugin: /quicktime/gim
                },
                wmp: {
                    activex: ["WMPlayer.OCX"],
                    plugin: /(windows\smedia)|(Microsoft)/gim
                },
                shk: {
                    activex: ["SWCtl.SWCtl", "SWCt1.SWCt1.7", "SWCt1.SWCt1.8", "SWCt1.SWCt1.9", "ShockwaveFlash.ShockwaveFlash.1"],
                    plugin: /shockwave/gim
                },
                rp: {
                    activex: ["RealPlayer", "rmocx.RealPlayer G2 Control.1"],
                    plugin: /realplayer/gim
                }
            };
            for (var p in plugins) {
                if (w.ActiveXObject) {
                    for (var i = 0; i < plugins[p].activex.length; ++i) {
                        try {
                            ActiveXObject(plugins[p].activex[i]);
                            supported.push(p);
                            break
                        } catch (e) {}
                    }
                } else {
                    var n = w.navigator;
                    for (var j = 0; j < n.plugins.length; ++j) {
                        if (n.plugins[j].name.match(plugins[p].plugin)) {
                            supported.push(p);
                            break
                        }
                    }
                }
            }
            pluginlist = supported.join("|");
            _OX_detectPlugins.pluginlist = pluginlist;
            d.cookie = cookie + "=" + pluginlist;
            return pluginlist
        };
        var frameCreativeHelper = function (opts) {
            var isIE = false;
            /*@cc_on
      isIE = true;
      @*/
            var ifrm, creativePage = template.apply("ifrmDoc", {
                head: IFRM_SWF,
                html: opts.html
            });
            try {
                ifrm = (isIE && opts.name != "") ? d.createElement('<iframe name="' + opts.name + '">') : d.createElement("iframe")
            } catch (e) {
                ifrm = d.createElement("iframe")
            }
            ifrm.setAttribute("width", opts.width);
            ifrm.setAttribute("height", opts.height);
            ifrm.setAttribute("frameSpacing", "0");
            ifrm.setAttribute("frameBorder", "no");
            ifrm.setAttribute("scrolling", "no");
            if (opts.name != "") {
                ifrm.setAttribute("id", opts.name);
                ifrm.setAttribute("name", opts.name)
            }
            if (isIE) {
                ifrm.src = 'javascript:window["contents"]'
            }
            if (opts.replace) {
                utils.DOM.replace(opts.element, ifrm)
            } else {
                utils.DOM.append(opts.element, ifrm)
            }
            if (opts.impression) {
                (new Image()).src = opts.impression + "&ob=1"
            }
            if (isIE) {
                ifrm.contentWindow.contents = creativePage;
                return ifrm
            }
            var ifrmDoc = (ifrm.contentWindow || ifrm.contentDocument);
            if (ifrmDoc.document) {
                ifrmDoc = ifrmDoc.document
            }
            if (ifrmDoc) {
                ifrmDoc.open("text/html", "replace");
                ifrmDoc.write(creativePage);
                ifrmDoc.close()
            }
            return ifrm
        };
        var AdUnit = function (auid) {
            var xport = {
                id: auid,
                requested: 0,
                creatives: [],
                fallback: null,
                imp_beacon: null,
                mkt_floor: null,
                frameElement: null,
                ng_floor: null
                /**/
            };
            xport.reset = function () {
                this.requested = 1;
                this.creatives = [];
                /**/
            };
            return xport
        };
        var Creative = function (settings) {
            return {
                html: settings.html,
                is_fallback: settings.is_fallback,
                framed: settings.framed,
                width: settings.frame_width,
                height: settings.frame_height,
                impression: settings.impression
            }
        };
        var OXObj = function (json) {
            var _lmPid = null,
                _lmFloor = null,
                _lmWidth = null,
                _lmHeight = null,
                _lmHid = null,
                _lmHts = null,
                _pages = [],
                _topics = [],
                _variables = [],
                _target = null,
                _pageURL = null,
                _refererURL = null,
                _md = 0,
                _sd = 0,
                _xid = null,
                _rd = null,
                _rm = null,
                _test = 0,
                _clickRedirectURL = null,
                _cb = utils.rand(),
                _gateway = "",
                _mode, _adunits = [],
                _dbgNode, _pxlNode, _frameCreatives, xport = this,
                resetAdUnits = function () {
                    for (var auid in _adunits) {
                        _adunits.hasOwnProperty(auid) && _adunits[auid].reset()
                    }
                }, addArjCallback = function () {
                    w["OX" + _cb] = w["OX" + _cb] || function (cb) {
                        return function (json) {
                            w.OX.parseArj(cb, json)
                        }
                    }(_cb)
                }, autoRefreshEnabled = function () {
                    return (_rm != null) && (_rm >= 0)
                }, writeDebugAndPixels = function (opts) {
                    var reqNode = d.getElementById("ox_req_" + _cb);
                    if (_dbgNode) {
                        utils.DOM.remove(_dbgNode);
                        _dbgNode = 0
                    }
                    if (_pxlNode) {
                        utils.DOM.remove(_pxlNode);
                        _pxlNode = 0
                    }
                    if (opts.pixels) {
                        var ifrm = template.apply("ifrmNoDoc", {
                            src: opts.pixels
                        });
                        _pxlNode = utils.DOM.create(ifrm);
                        utils.DOM.append(reqNode, _pxlNode)
                    }
                    if (opts.debug) {
                        _dbgNode = d.createComment(" " + opts.debug.replace(/--/g, "- -"));
                        utils.DOM.append(reqNode, _dbgNode)
                    }
                }, createAdRequestUrl = function () {
                    var reqUrl = _gateway + "/1.0/arj?o=" + _cb;
                    reqUrl += "&callback=OX" + _cb;
                    var adUnitsRequested = [];
                    var adUnitMktFloors = [];
                    var adUnitNgFloors = [];
                    for (var auid in _adunits) {
                        if (_adunits.hasOwnProperty(auid)) {
                            var adunit = _adunits[auid];
                            for (var c = 0; c < adunit.requested; c++) {
                                adUnitsRequested.push(auid)
                            }
                            if (adunit.mkt_floor != null) {
                                adUnitMktFloors.push(auid + ":" + adunit.mkt_floor)
                            }
                            if (adunit.ng_floor != null) {
                                adUnitNgFloors.push(auid + ":" + adunit.ng_floor)
                            }
                        }
                    }
                    if (adUnitsRequested.length > 0) {
                        reqUrl += "&auid=" + adUnitsRequested.join(",")
                    }
                    if (adUnitMktFloors.length > 0) {
                        reqUrl += "&aumf=" + adUnitMktFloors.join(",")
                    }
                    if (adUnitNgFloors.length > 0) {
                        reqUrl += "&aungf=" + adUnitNgFloors.join(",")
                    }
                    if (_pages.length > 0) {
                        reqUrl += "&pgid=" + _pages.join(",")
                    }
                    if (_topics.length > 0) {
                        reqUrl += "&tid=" + _topics.join(",")
                    }
                    if (_target != null) {
                        reqUrl += "&tg=" + _target
                    }
                    if (_pageURL != null) {
                        reqUrl += "&ju=" + escape(_pageURL)
                    }
                    if (_refererURL) {
                        reqUrl += "&jr=" + escape(_refererURL)
                    }
                    if (_xid) {
                        reqUrl += "&xid=" + escape(_xid)
                    }
                    if (_md) {
                        reqUrl += "&md=1"
                    }
                    if (_sd) {
                        reqUrl += "&ns=1"
                    }
                    if (_rm) {
                        reqUrl += "&rm=" + _rm
                    }
                    if (_rm && _rd) {
                        reqUrl += "&rd=" + _rd
                    }
                    if (_lmPid != null) {
                        reqUrl += "&pid=" + _lmPid
                    }
                    if (_lmFloor != null) {
                        reqUrl += "&pf=" + _lmFloor
                    }
                    if (_lmWidth != null) {
                        reqUrl += "&rw=" + _lmWidth
                    }
                    if (_lmHeight != null) {
                        reqUrl += "&rh=" + _lmHeight
                    }
                    if (_lmHid != null) {
                        reqUrl += "&hid=" + _lmHid
                    }
                    if (_lmHts != null) {
                        reqUrl += "&hts=" + _lmHts
                    }
                    if (_test) {
                        reqUrl += "&test=true"
                    }
                    for (var k in _variables) {
                        if (_variables.hasOwnProperty(k)) {
                            for (var i = 0; i < _variables[k].length; ++i) {
                                reqUrl += "&c." + escape(k) + "=" + escape(_variables[k][i])
                            }
                        }
                    }
                    reqUrl += _OX_enrichRequest();
                    /**/
                    if (_clickRedirectURL != null) {
                        reqUrl += "&r=" + escape(_clickRedirectURL)
                    }
                    return reqUrl
                };
            this.setGateway = function (url) {
                _gateway = utils.ensureRightProtocol(url)
            };
            this.setMode = function (mode) {
                _mode = mode
            };
            this.setLMPid = function (pid) {
                _lmPid = pid
            };
            this.setLMFloor = function (floor) {
                _lmFloor = floor
            };
            this.setLMSize = function (size) {
                var wh = size.split("x");
                _lmWidth = wh[0];
                _lmHeight = wh[1]
            };
            this.setLMHRID = function (hmrid) {
                var id_ts = hmrid.split("-");
                _lmHid = id_ts[0];
                _lmHts = id_ts[1]
            };
            this.addPage = function (id) {
                _pages.push(id)
            };
            this.addContentTopic = function (id) {
                _topics.push(id)
            };
            this.addVariable = function (key, value) {
                if (!_variables[key]) {
                    _variables[key] = []
                }
                _variables[key].push(value)
            };
            this.setAnchorTarget = function (target) {
                _target = target
            };
            this.setPageURL = function (url) {
                _pageURL = utils.ensureRightProtocol(url)
            };
            this.setRefererURL = function (url) {
                _refererURL = url
            };
            this.disableMarket = function () {
                _md = 1
            };
            this.enableMarket = function () {
                _md = 0
            };
            this.disableSegmentation = function () {
                _sd = 1
            };
            this.enableSegmentation = function () {
                _sd = 0
            };
            this.setUserID = function (xid) {
                _xid = xid
            };
            this.setRefreshDelay = function (rd) {
                _rd = rd
            };
            this.setRefreshMax = function (rm) {
                _rm = rm
            };
            this.frameCreatives = function (enable) {
                _frameCreatives = enable
            };
            this.setTest = function (test) {
                _test = test
            };
            this.setClickRedirectURL = function (url) {
                _clickRedirectURL = url
            };
            this.getOrCreateAdUnit = function (auid) {
                if (!_adunits[auid]) {
                    _adunits[auid] = new AdUnit(auid)
                }
                return _adunits[auid]
            };
            this.addAdUnit = function (auid) {
                this.getOrCreateAdUnit(auid).requested++
            };
            this.setAdUnitMarketFloor = function (auid, floor) {
                this.getOrCreateAdUnit(auid).mkt_floor = floor
            };
            this.setAdUnitNGFloor = function (auid, floor) {
                this.getOrCreateAdUnit(auid).ng_floor = floor
            };
            this.setAdUnitFallback = function (auid, fallback) {
                this.getOrCreateAdUnit(auid).fallback = fallback
            };
            this.setAdUnitImpBeacon = function (auid, imp_beacon) {
                this.getOrCreateAdUnit(auid).imp_beacon = imp_beacon
            };
            this.addCreative = function (auid, opts) {
                var creative = new Creative(opts);
                this.getOrCreateAdUnit(auid).creatives.push(creative)
            };
            this.doAdRefresh = function () {
                resetAdUnits();
                var replaceId = "ox_req_" + _cb,
                    reqURL = createAdRequestUrl(),
                    reqNode = d.createElement("script");
                reqNode.id = replaceId;
                reqNode.src = reqURL;
                utils.DOM.replace(replaceId, reqNode)
            };
            this.fetchAds = function () {
                addArjCallback();
                var request = template.apply("arjRequest", {
                    cb: _cb,
                    src: createAdRequestUrl()
                });
                d.write(request)
            };
            this.fetchAdsComplete = function () {
                if (_mode == "lmkt") {
                    this.showAdUnit(_lmPid)
                } else {
                    if (_mode == "immediate") {
                        for (var auid in _adunits) {
                            if (_adunits[auid].requested) {
                                this.showAdUnit(auid);
                                break
                            }
                        }
                    } else {
                        for (var auid in _adunits) {
                            if (_adunits[auid].frameElement != null) {
                                this.showAdUnit(auid)
                            }
                        }
                    }
                }
                if (_rm != null && _rm > 0) {
                    _rm--;
                    w.setTimeout((function (cxt) {
                        return function () {
                            cxt.doAdRefresh()
                        }
                    })(this), 1000 * _rd)
                }
            };
            this.showAdUnit = function (auid) {
                /**/
                try {
                    var adunit = _adunits[auid],
                        creative = adunit.creatives.shift(),
                        html = adunit.fallback,
                        framed = function () {
                            if (creative && creative.framed) {
                                return true
                            }
                            if (typeof _frameCreatives != UNDEF) {
                                return _frameCreatives
                            }
                            return _OX_frameCreatives
                        }();
                    if (creative) {
                        if (creative.is_fallback) {
                            html = adunit.fallback || creative.html
                        } else {
                            html = creative.html + (adunit.imp_beacon || "")
                        }
                    }
                    if (creative && framed) {
                        adunit.frameElement = this.frameCreative({
                            html: html,
                            width: (creative ? creative.width : adunit.frameElement.width),
                            height: (creative ? creative.height : adunit.frameElement.height),
                            frameElement: adunit.frameElement,
                            name: "ox_frame_" + auid + "_" + _cb,
                            impression: creative.impression
                        })
                    } else {
                        html && OX.renderCreative(html)
                    }
                } catch (err) {}
            };
            this.frameCreative = function (opts) {
                name = typeof name !== UNDEF ? name : "";
                return frameCreativeHelper({
                    html: opts.html,
                    width: opts.width,
                    height: opts.height,
                    name: opts.name,
                    element: opts.frameElement || utils.DOM.lastScript(),
                    replace: opts.frameElement != null,
                    impression: opts.impression
                })
            };
            this.parseArj = function (json) {
                var auids = [];
                for (var i = 0; i < json.ads.ad.length; i++) {
                    var add = json.ads.ad[i];
                    if (_rd == null && add.refresh_delay) {
                        _rd = add.refresh_delay
                    }
                    if (_rm == null && add.refresh_max) {
                        _rm = add.refresh_max
                    }
                    var framed = add.framed || autoRefreshEnabled();
                    /**/
                    var impression = add.creative[0].tracking ? add.creative[0].tracking.impression : null;
                    this.addCreative(add.adunitid, {
                        html: add.html,
                        framed: framed,
                        frame_width: add.creative[0].width,
                        frame_height: add.creative[0].height,
                        is_fallback: add.is_fallback,
                        impression: impression
                    })
                }
                writeDebugAndPixels({
                    debug: json.ads.debug,
                    pixels: json.ads.pixels
                });
                this.fetchAdsComplete()
            };
            /**/
            _OX_lookup[_cb] = this;
            this.setMode("deferred");
            this.setGateway(w._OX_gateway);
            this.setPageURL(_OX_pageURL ? _OX_pageURL : utils.detectPageURL());
            this.setRefererURL(_OX_refererURL ? _OX_refererURL : utils.detectRefererURL());
            if (typeof json != UNDEF) {
                if (json.pid || json.website) {
                    this.setMode("lmkt");
                    this.setLMPid(json.pid ? json.pid : json.website);
                    this.setLMSize(json.size);
                    if (json.floor) {
                        this.setLMFloor(json.floor)
                    }
                    if (json.hrid) {
                        this.setLMHRID(json.hrid)
                    }
                    if (json.beacon) {
                        this.setAdUnitImpBeacon(json.pid || json.website, json.beacon)
                    }
                    if (json.fallback) {
                        this.setAdUnitFallback(json.pid || json.website, json.fallback)
                    }
                    if (json.channel) {
                        this.addVariable("channel", json.channel)
                    }
                } else {
                    this.setMode("immediate");
                    if (json.auid) {
                        this.addAdUnit(json.auid)
                    }
                    if (json.gw) {
                        this.setGateway(json.gw)
                    }
                    if (json.tid) {
                        this.addContentTopic(json.tid)
                    }
                    if (json.tg) {
                        this.setAnchorTarget(json.tg)
                    }
                    if (json.aumf) {
                        this.setAdUnitMarketFloor(json.auid, json.aumf)
                    }
                    if (json.aungf) {
                        this.setAdUnitNGFloor(json.auid, json.aungf)
                    }
                    if (json.imp_beacon) {
                        this.setAdUnitImpBeacon(json.auid, json.imp_beacon)
                    }
                    if (json.fallback) {
                        this.setAdUnitFallback(json.auid, json.fallback)
                    }
                }
                if (json.url) {
                    this.setPageURL(json.url)
                }
                if (json.ref) {
                    this.setRefererURL(json.ref)
                }
                if (json.test) {
                    this.setTest(true)
                }
                if (json.md) {
                    this.disableMarket()
                }
                if (json.ns) {
                    this.disableSegmentation()
                }
                if (json.userid) {
                    this.setUserID(json.userid)
                }
                if (json.r) {
                    this.setClickRedirectURL(json.r)
                }
                if (json.rd) {
                    this.setRefreshDelay(json.rd)
                }
                if (json.rm) {
                    this.setRefreshMax(json.rm)
                }
                if (json.frameCreatives) {
                    this.frameCreatives(1);
                    /**/
                }
                if (json.vars) {
                    for (var k in json.vars) {
                        if (json.vars.hasOwnProperty(k)) {
                            this.addVariable(k, json.vars[k])
                        }
                    }
                }
            }
        };
        var xport = function (json) {
            return new OXObj(json)
        };
        xport.setGateway = function (url) {
            w._OX_gateway = url
        };
        xport.setPageURL = function (url) {
            _OX_pageURL = url
        };
        xport.setRefererURL = function (url) {
            _OX_refererURL = url
        };
        xport.parseArj = function (_cb, json) {
            _OX_lookup[_cb].parseArj(json)
        };
        /**/
        xport.addCreative = function (cb, auid, html, framed, frame_width, frame_height, is_fallback) {
            _OX_lookup[cb].addCreative(auid, {
                html: html,
                framed: framed,
                frame_width: frame_width,
                frame_height: frame_height,
                is_fallback: is_fallback
            })
        };
        xport.fetchAdsComplete = function (cb) {
            _OX_lookup[cb].fetchAdsComplete()
        };
        xport.renderCreative = function (creative) {
            d.readyState !== "complete" && d.write(creative)
        };
        xport.addVariable = function (key, value) {
            if (!_OX_variables[key]) {
                _OX_variables[key] = []
            }
            _OX_variables[key].push(value)
        };
        xport.requestAd = function (json) {
            w.OX(json).fetchAds()
        };
        xport.recordAction = function (json) {
            var gw = json.gw ? json.gw : w._OX_gateway;
            gw = location.protocol == "https:" ? gw.replace("http:", "https:") : gw;
            var request = "<script src='" + gw + "/1.0/raj?";
            /**/
            request += json.cvid ? "cvid=" + json.cvid : "";
            request += _OX_enrichRequest();
            if (json.vars) {
                for (var k in json.vars) {
                    if (json.vars.hasOwnProperty(k)) {
                        request += json.vars[k] ? "&c." + escape(k) + "=" + escape(json.vars[k]) : ""
                    }
                }
            }
            request += w.location ? "&ju=" + escape(w.location) : "";
            request += d.referrer ? "&jr=" + escape(d.referrer) : "";
            if (json.test) {
                request += "&test=true"
            }
            request += "&cb=" + utils.rand();
            request += "'><\/script>";
            d.write(request)
        };
        xport.recordSegments = function (json) {
            if (json.expires) {
                var expires = Date.parse(json.expires);
                var now = new Date();
                if (expires < now) {
                    return
                }
            }
            var gw = json.gw ? json.gw : w._OX_gateway;
            gw = location.protocol == "https:" ? gw.replace("http:", "https:") : gw;
            var request = template.apply("recordSegments", {
                gw: gw
            });
            request += json.add ? "as=" + json.add : "";
            request += json.del ? "&ds=" + json.del : "";
            request += json.channel ? "&channel=" + json.channel : "";
            request += _OX_enrichRequest();
            if (json.vars) {
                for (var k in json.vars) {
                    if (json.vars.hasOwnProperty(k)) {
                        request += json.vars[k] ? "&c." + escape(k) + "=" + escape(json.vars[k]) : ""
                    }
                }
            }
            request += w.location ? "&ju=" + escape(w.location) : "";
            request += d.referrer ? "&jr=" + escape(d.referrer) : "";
            if (json.test) {
                request += "&test=true"
            }
            request += "&cb=" + utils.rand();
            request += "' border='0' height='0' width='0'/></div>";
            d.write(request)
        };
        xport.appendTag = function (html) {
            d.write(html)
        };
        xport.frameCreatives = function (enable) {
            _OX_frameCreatives = enable
        };
        xport.init = function () {
            var init = 0;
            return function () {
                if (!init) {
                    initImports();
                    initTemplates();
                    init = 1
                }
            }
        }();
        return xport
    }(window, document);
OX.templater = OX.templater || function () {
    var d = "{",
        a = "}",
        b = {}, c = {};
    c.register = function (e, f) {
        b[e] = f
    };
    c.apply = function (f, m) {
        m = m || {};
        var e = "",
            k = 0,
            h = "",
            j, l = b[f];
        for (var g = 0; g < l.length; g++) {
            j = l.charAt(g);
            switch (j) {
                case d:
                    k = 1;
                    break;
                case a:
                    h += m[e] || "";
                    k = 0;
                    e = "";
                    break;
                default:
                    if (k) {
                        e += j
                    } else {
                        h += j
                    }
            }
        }
        return h
    };
    return c
}();
OX.utils = OX.utils || function (a, c) {
    var b = {};
    b.getOXMediaType = function () {
        var g, k, f;
        g = c.getElementsByTagName("script");
        for (var d = g.length - 1; d >= 0; d--) {
            k = g[d].src || "";
            var h = k.indexOf("ox-d.registerguard.com");
            if (h == 7 || h == 8) {
                try {
                    f = k.length ? (/\/\/[^\/]+\/([^\/]+)\//).exec(k) : "";
                    f = (f != null && f[1]) ? f[1] : "w"
                } catch (j) {
                    f = "w"
                }
                return f
            }
        }
        return "w"
    };
    b.ensureRightProtocol = function (e) {
        if (!e) {
            return e
        }
        var d = e.indexOf("//");
        if (d != 5 && d != 6) {
            e = "http:" + e
        }
        return (location.protocol == "https:") ? e.replace("http:", "https:") : e
    };
    b.detectPageURL = function () {
        var d = a.location + "";
        try {
            d = top.location.href;
            d = d || c.referrer
        } catch (f) {
            d = c.referrer
        }
        return d || ""
    };
    b.detectRefererURL = function () {
        var d = c.referrer;
        try {
            d = top.document.referrer
        } catch (f) {}
        return d || ""
    };
    b.rand = function () {
        return Math.floor(Math.random() * 9999999999) + ""
    };
    b.DOM = {
        lastScript: function () {
            var d = c.getElementsByTagName("script");
            return d[d.length - 1]
        },
        prepend: function (e, d) {
            e.parentNode.insertBefore(d, e)
        },
        append: function (e, d) {
            e.parentNode.insertBefore(d, e.nextSibling)
        },
        replace: function (e, d) {
            if (typeof e == "string") {
                e = c.getElementById(e)
            }
            e.parentNode.replaceChild(d, e)
        },
        remove: function (d) {
            d.parentNode.removeChild(d)
        },
        create: function (e) {
            var d = c.createElement("p");
            d.innerHTML = e;
            return d.firstChild
        }
    };
    return b
}(window, document);
/* SWFObject v2.2 <http://code.google.com/p/swfobject/> 
        is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
OX.swfobject = function (O, j, t) {
    var D = "undefined",
        r = "object",
        S = "Shockwave Flash",
        W = "ShockwaveFlash.ShockwaveFlash",
        q = "application/x-shockwave-flash",
        R = "SWFObjectExprInst",
        x = "onreadystatechange",
        O = O || window,
        j = j || document,
        t = t || navigator,
        T = false,
        U = [h],
        o = [],
        N = [],
        I = [],
        l, Q, E, B, J = false,
        a = false,
        n, G, m = true,
        M = function () {
            var aa = typeof j.getElementById != D && typeof j.getElementsByTagName != D && typeof j.createElement != D,
                ah = t.userAgent.toLowerCase(),
                Y = t.platform.toLowerCase(),
                ae = Y ? /win/.test(Y) : /win/.test(ah),
                ac = Y ? /mac/.test(Y) : /mac/.test(ah),
                af = /webkit/.test(ah) ? parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false,
                X = !+"\v1",
                ag = [0, 0, 0],
                ab = null;
            if (typeof t.plugins != D && typeof t.plugins[S] == r) {
                ab = t.plugins[S].description;
                if (ab && !(typeof t.mimeTypes != D && t.mimeTypes[q] && !t.mimeTypes[q].enabledPlugin)) {
                    T = true;
                    X = false;
                    ab = ab.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                    ag[0] = parseInt(ab.replace(/^(.*)\..*$/, "$1"), 10);
                    ag[1] = parseInt(ab.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                    ag[2] = /[a-zA-Z]/.test(ab) ? parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0
                }
            } else {
                if (typeof O.ActiveXObject != D) {
                    try {
                        var ad = new ActiveXObject(W);
                        if (ad) {
                            ab = ad.GetVariable("$version");
                            if (ab) {
                                X = true;
                                ab = ab.split(" ")[1].split(",");
                                ag = [parseInt(ab[0], 10), parseInt(ab[1], 10), parseInt(ab[2], 10)]
                            }
                        }
                    } catch (Z) {}
                }
            }
            return {
                w3: aa,
                pv: ag,
                wk: af,
                ie: X,
                win: ae,
                mac: ac
            }
        }(),
        k = function () {
            if (!M.w3) {
                return
            }
            if ((typeof j.readyState != D && j.readyState == "complete") || (typeof j.readyState == D && (j.getElementsByTagName("body")[0] || j.body))) {
                f()
            }
            if (!J) {
                if (typeof j.addEventListener != D) {
                    j.addEventListener("DOMContentLoaded", f, false)
                }
                if (M.ie && M.win) {
                    j.attachEvent(x, function () {
                        if (j.readyState == "complete") {
                            j.detachEvent(x, arguments.callee);
                            f()
                        }
                    });
                    if (O == top) {
                        (function () {
                            if (J) {
                                return
                            }
                            try {
                                j.documentElement.doScroll("left")
                            } catch (X) {
                                setTimeout(arguments.callee, 0);
                                return
                            }
                            f()
                        })()
                    }
                }
                if (M.wk) {
                    (function () {
                        if (J) {
                            return
                        }
                        if (!/loaded|complete/.test(j.readyState)) {
                            setTimeout(arguments.callee, 0);
                            return
                        }
                        f()
                    })()
                }
                s(f)
            }
        }();

    function f() {
        if (J) {
            return
        }
        try {
            var Z = j.getElementsByTagName("body")[0].appendChild(C("span"));
            Z.parentNode.removeChild(Z)
        } catch (aa) {
            return
        }
        J = true;
        var X = U.length;
        for (var Y = 0; Y < X; Y++) {
            U[Y]()
        }
    }
    function K(X) {
        if (J) {
            X()
        } else {
            U[U.length] = X
        }
    }
    function s(Y) {
        if (typeof O.addEventListener != D) {
            O.addEventListener("load", Y, false)
        } else {
            if (typeof j.addEventListener != D) {
                j.addEventListener("load", Y, false)
            } else {
                if (typeof O.attachEvent != D) {
                    i(O, "onload", Y)
                } else {
                    if (typeof O.onload == "function") {
                        var X = O.onload;
                        O.onload = function () {
                            X();
                            Y()
                        }
                    } else {
                        O.onload = Y
                    }
                }
            }
        }
    }
    function h() {
        if (T) {
            V()
        } else {
            H()
        }
    }
    function V() {
        var X = j.getElementsByTagName("body")[0];
        var aa = C(r);
        aa.setAttribute("type", q);
        var Z = X.appendChild(aa);
        if (Z) {
            var Y = 0;
            (function () {
                if (typeof Z.GetVariable != D) {
                    var ab = Z.GetVariable("$version");
                    if (ab) {
                        ab = ab.split(" ")[1].split(",");
                        M.pv = [parseInt(ab[0], 10), parseInt(ab[1], 10), parseInt(ab[2], 10)]
                    }
                } else {
                    if (Y < 10) {
                        Y++;
                        setTimeout(arguments.callee, 10);
                        return
                    }
                }
                X.removeChild(aa);
                Z = null;
                H()
            })()
        } else {
            H()
        }
    }
    function H() {
        var ag = o.length;
        if (ag > 0) {
            for (var af = 0; af < ag; af++) {
                var Y = o[af].id;
                var ab = o[af].callbackFn;
                var aa = {
                    success: false,
                    id: Y
                };
                if (M.pv[0] > 0) {
                    var ae = c(Y);
                    if (ae) {
                        if (F(o[af].swfVersion) && !(M.wk && M.wk < 312)) {
                            w(Y, true);
                            if (ab) {
                                aa.success = true;
                                aa.ref = z(Y);
                                ab(aa)
                            }
                        } else {
                            if (o[af].expressInstall && A()) {
                                var ai = {};
                                ai.data = o[af].expressInstall;
                                ai.width = ae.getAttribute("width") || "0";
                                ai.height = ae.getAttribute("height") || "0";
                                if (ae.getAttribute("class")) {
                                    ai.styleclass = ae.getAttribute("class")
                                }
                                if (ae.getAttribute("align")) {
                                    ai.align = ae.getAttribute("align")
                                }
                                var ah = {};
                                var X = ae.getElementsByTagName("param");
                                var ac = X.length;
                                for (var ad = 0; ad < ac; ad++) {
                                    if (X[ad].getAttribute("name").toLowerCase() != "movie") {
                                        ah[X[ad].getAttribute("name")] = X[ad].getAttribute("value")
                                    }
                                }
                                P(ai, ah, Y, ab)
                            } else {
                                p(ae);
                                if (ab) {
                                    ab(aa)
                                }
                            }
                        }
                    }
                } else {
                    w(Y, true);
                    if (ab) {
                        var Z = z(Y);
                        if (Z && typeof Z.SetVariable != D) {
                            aa.success = true;
                            aa.ref = Z
                        }
                        ab(aa)
                    }
                }
            }
        }
    }
    function z(aa) {
        var X = null;
        var Y = c(aa);
        if (Y && Y.nodeName == "OBJECT") {
            if (typeof Y.SetVariable != D) {
                X = Y
            } else {
                var Z = Y.getElementsByTagName(r)[0];
                if (Z) {
                    X = Z
                }
            }
        }
        return X
    }
    function A() {
        return !a && F("6.0.65") && (M.win || M.mac) && !(M.wk && M.wk < 312)
    }
    function P(aa, ab, X, Z) {
        a = true;
        E = Z || null;
        B = {
            success: false,
            id: X
        };
        var ae = c(X);
        if (ae) {
            if (ae.nodeName == "OBJECT") {
                l = g(ae);
                Q = null
            } else {
                l = ae;
                Q = X
            }
            aa.id = R;
            if (typeof aa.width == D || (!/%$/.test(aa.width) && parseInt(aa.width, 10) < 310)) {
                aa.width = "310"
            }
            if (typeof aa.height == D || (!/%$/.test(aa.height) && parseInt(aa.height, 10) < 137)) {
                aa.height = "137"
            }
            j.title = j.title.slice(0, 47) + " - Flash Player Installation";
            var ad = M.ie && M.win ? "ActiveX" : "PlugIn",
                ac = "MMredirectURL=" + O.location.toString().replace(/&/g, "%26") + "&MMplayerType=" + ad + "&MMdoctitle=" + j.title;
            if (typeof ab.flashvars != D) {
                ab.flashvars += "&" + ac
            } else {
                ab.flashvars = ac
            }
            if (M.ie && M.win && ae.readyState != 4) {
                var Y = C("div");
                X += "SWFObjectNew";
                Y.setAttribute("id", X);
                ae.parentNode.insertBefore(Y, ae);
                ae.style.display = "none";
                (function () {
                    if (ae.readyState == 4) {
                        ae.parentNode.removeChild(ae)
                    } else {
                        setTimeout(arguments.callee, 10)
                    }
                })()
            }
            u(aa, ab, X)
        }
    }
    function p(Y) {
        if (M.ie && M.win && Y.readyState != 4) {
            var X = C("div");
            Y.parentNode.insertBefore(X, Y);
            X.parentNode.replaceChild(g(Y), X);
            Y.style.display = "none";
            (function () {
                if (Y.readyState == 4) {
                    Y.parentNode.removeChild(Y)
                } else {
                    setTimeout(arguments.callee, 10)
                }
            })()
        } else {
            Y.parentNode.replaceChild(g(Y), Y)
        }
    }
    function g(ab) {
        var aa = C("div");
        if (M.win && M.ie) {
            aa.innerHTML = ab.innerHTML
        } else {
            var Y = ab.getElementsByTagName(r)[0];
            if (Y) {
                var ad = Y.childNodes;
                if (ad) {
                    var X = ad.length;
                    for (var Z = 0; Z < X; Z++) {
                        if (!(ad[Z].nodeType == 1 && ad[Z].nodeName == "PARAM") && !(ad[Z].nodeType == 8)) {
                            aa.appendChild(ad[Z].cloneNode(true))
                        }
                    }
                }
            }
        }
        return aa
    }
    function u(ai, ag, Y) {
        var X, aa = c(Y);
        if (M.wk && M.wk < 312) {
            return X
        }
        if (aa) {
            if (typeof ai.id == D) {
                ai.id = Y
            }
            if (M.ie && M.win) {
                var ah = "";
                for (var ae in ai) {
                    if (ai[ae] != Object.prototype[ae]) {
                        if (ae.toLowerCase() == "data") {
                            ag.movie = ai[ae]
                        } else {
                            if (ae.toLowerCase() == "styleclass") {
                                ah += ' class="' + ai[ae] + '"'
                            } else {
                                if (ae.toLowerCase() != "classid") {
                                    ah += " " + ae + '="' + ai[ae] + '"'
                                }
                            }
                        }
                    }
                }
                var af = "";
                for (var ad in ag) {
                    if (ag[ad] != Object.prototype[ad]) {
                        af += '<param name="' + ad + '" value="' + ag[ad] + '" />'
                    }
                }
                aa.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + ah + ">" + af + "</object>";
                N[N.length] = ai.id;
                X = c(ai.id)
            } else {
                var Z = C(r);
                Z.setAttribute("type", q);
                for (var ac in ai) {
                    if (ai[ac] != Object.prototype[ac]) {
                        if (ac.toLowerCase() == "styleclass") {
                            Z.setAttribute("class", ai[ac])
                        } else {
                            if (ac.toLowerCase() != "classid") {
                                Z.setAttribute(ac, ai[ac])
                            }
                        }
                    }
                }
                for (var ab in ag) {
                    if (ag[ab] != Object.prototype[ab] && ab.toLowerCase() != "movie") {
                        e(Z, ab, ag[ab])
                    }
                }
                aa.parentNode.replaceChild(Z, aa);
                X = Z
            }
        }
        return X
    }
    function e(Z, X, Y) {
        var aa = C("param");
        aa.setAttribute("name", X);
        aa.setAttribute("value", Y);
        Z.appendChild(aa)
    }
    function y(Y) {
        var X = c(Y);
        if (X && X.nodeName == "OBJECT") {
            if (M.ie && M.win) {
                X.style.display = "none";
                (function () {
                    if (X.readyState == 4) {
                        b(Y)
                    } else {
                        setTimeout(arguments.callee, 10)
                    }
                })()
            } else {
                X.parentNode.removeChild(X)
            }
        }
    }
    function b(Z) {
        var Y = c(Z);
        if (Y) {
            for (var X in Y) {
                if (typeof Y[X] == "function") {
                    Y[X] = null
                }
            }
            Y.parentNode.removeChild(Y)
        }
    }
    function c(Z) {
        var X = null;
        try {
            X = j.getElementById(Z)
        } catch (Y) {}
        return X
    }
    function C(X) {
        return j.createElement(X)
    }
    function i(Z, X, Y) {
        Z.attachEvent(X, Y);
        I[I.length] = [Z, X, Y]
    }
    function F(Z) {
        var Y = M.pv,
            X = Z.split(".");
        X[0] = parseInt(X[0], 10);
        X[1] = parseInt(X[1], 10) || 0;
        X[2] = parseInt(X[2], 10) || 0;
        return (Y[0] > X[0] || (Y[0] == X[0] && Y[1] > X[1]) || (Y[0] == X[0] && Y[1] == X[1] && Y[2] >= X[2])) ? true : false
    }
    function v(ac, Y, ad, ab) {
        if (M.ie && M.mac) {
            return
        }
        var aa = j.getElementsByTagName("head")[0];
        if (!aa) {
            return
        }
        var X = (ad && typeof ad == "string") ? ad : "screen";
        if (ab) {
            n = null;
            G = null
        }
        if (!n || G != X) {
            var Z = C("style");
            Z.setAttribute("type", "text/css");
            Z.setAttribute("media", X);
            n = aa.appendChild(Z);
            if (M.ie && M.win && typeof j.styleSheets != D && j.styleSheets.length > 0) {
                n = j.styleSheets[j.styleSheets.length - 1]
            }
            G = X
        }
        if (M.ie && M.win) {
            if (n && typeof n.addRule == r) {
                n.addRule(ac, Y)
            }
        } else {
            if (n && typeof j.createTextNode != D) {
                n.appendChild(j.createTextNode(ac + " {" + Y + "}"))
            }
        }
    }
    function w(Z, X) {
        if (!m) {
            return
        }
        var Y = X ? "visible" : "hidden";
        if (J && c(Z)) {
            c(Z).style.visibility = Y
        } else {
            v("#" + Z, "visibility:" + Y)
        }
    }
    function L(Y) {
        var Z = /[\\\"<>\.;]/;
        var X = Z.exec(Y) != null;
        return X && typeof encodeURIComponent != D ? encodeURIComponent(Y) : Y
    }
    var d = function () {
        if (M.ie && M.win) {
            window.attachEvent("onunload", function () {
                var ac = I.length;
                for (var ab = 0; ab < ac; ab++) {
                    I[ab][0].detachEvent(I[ab][1], I[ab][2])
                }
                var Z = N.length;
                for (var aa = 0; aa < Z; aa++) {
                    y(N[aa])
                }
                for (var Y in M) {
                    M[Y] = null
                }
                M = null;
                for (var X in OX_swfobject) {
                    OX_swfobject[X] = null
                }
                OX_swfobject = null
            })
        }
    }();
    return {
        registerObject: function (ab, X, aa, Z) {
            if (M.w3 && ab && X) {
                var Y = {};
                Y.id = ab;
                Y.swfVersion = X;
                Y.expressInstall = aa;
                Y.callbackFn = Z;
                o[o.length] = Y;
                w(ab, false)
            } else {
                if (Z) {
                    Z({
                        success: false,
                        id: ab
                    })
                }
            }
        },
        getObjectById: function (X) {
            if (M.w3) {
                return z(X)
            }
        },
        embedSWF: function (ab, ah, ae, ag, Y, aa, Z, ad, af, ac) {
            var X = {
                success: false,
                id: ah
            };
            if (M.w3 && !(M.wk && M.wk < 312) && ab && ah && ae && ag && Y) {
                w(ah, false);
                K(function () {
                    ae += "";
                    ag += "";
                    var aj = {};
                    if (af && typeof af === r) {
                        for (var al in af) {
                            aj[al] = af[al]
                        }
                    }
                    aj.data = ab;
                    aj.width = ae;
                    aj.height = ag;
                    var am = {};
                    if (ad && typeof ad === r) {
                        for (var ak in ad) {
                            am[ak] = ad[ak]
                        }
                    }
                    if (Z && typeof Z === r) {
                        for (var ai in Z) {
                            if (typeof am.flashvars != D) {
                                am.flashvars += "&" + ai + "=" + escape(Z[ai])
                            } else {
                                am.flashvars = ai + "=" + escape(Z[ai])
                            }
                        }
                    }
                    if (F(Y)) {
                        var an = u(aj, am, ah);
                        if (aj.id == ah) {
                            w(ah, true)
                        }
                        X.success = true;
                        X.ref = an
                    } else {
                        if (aa && A()) {
                            aj.data = aa;
                            P(aj, am, ah, ac);
                            return
                        } else {
                            w(ah, true)
                        }
                    }
                    if (ac) {
                        ac(X)
                    }
                })
            } else {
                if (ac) {
                    ac(X)
                }
            }
        },
        switchOffAutoHideShow: function () {
            m = false
        },
        ua: M,
        getFlashPlayerVersion: function () {
            return {
                major: M.pv[0],
                minor: M.pv[1],
                release: M.pv[2]
            }
        },
        hasFlashPlayerVersion: F,
        createSWF: function (Z, Y, X) {
            if (M.w3) {
                return u(Z, Y, X)
            } else {
                return undefined
            }
        },
        showExpressInstall: function (Z, aa, X, Y) {
            if (M.w3 && A()) {
                P(Z, aa, X, Y)
            }
        },
        removeSWF: function (X) {
            if (M.w3) {
                y(X)
            }
        },
        createCSS: function (aa, Z, Y, X) {
            if (M.w3) {
                v(aa, Z, Y, X)
            }
        },
        addDomLoadEvent: K,
        addLoadEvent: s,
        getQueryParamValue: function (aa) {
            var Z = j.location.search || j.location.hash;
            if (Z) {
                if (/\?/.test(Z)) {
                    Z = Z.split("?")[1]
                }
                if (aa == null) {
                    return L(Z)
                }
                var Y = Z.split("&");
                for (var X = 0; X < Y.length; X++) {
                    if (Y[X].substring(0, Y[X].indexOf("=")) == aa) {
                        return L(Y[X].substring((Y[X].indexOf("=") + 1)))
                    }
                }
            }
            return ""
        },
        expressInstallCallback: function () {
            if (a) {
                var X = c(R);
                if (X && l) {
                    X.parentNode.replaceChild(l, X);
                    if (Q) {
                        w(Q, true);
                        if (M.ie && M.win) {
                            l.style.display = "block"
                        }
                    }
                    if (E) {
                        E(B)
                    }
                }
                a = false
            }
        }
    }
};
var OX_swfobject = OX_swfobject || OX.swfobject(window, document, navigator);
(function (a, g) {
    OX.init();
    a._OX_gateway = "http://ox-d.registerguard.com/" + OX.utils.getOXMediaType();
    if (a.OXM_ad) {
        var f = a.OXM_ad;
        var c = ["fallback", "floor", "size"];
        for (var e = 0; e < c.length; e++) {
            if (!f.hasOwnProperty(c[e])) {
                throw 1
            }
        }
        a.OX.requestAd(f);
        var b = "http" + (location.href.match(/^https/) ? "s" : "") + "://bid.openx.net/cm?wid=" + (f.pid ? f.pid : f.website);
        g.write("<div style='position: absolute; width: 0px; height: 0px; overflow: hidden'><img src='" + b + "' /></div>");
        a.OXM_ad = null
    }
    if (a.OX_ads && a.OX_ads.length) {
        for (var e = a.OX_ads.length; e--;) {
            OX.requestAd(a.OX_ads[e])
        }
        a.OX_ads = []
    }
})(window, document);