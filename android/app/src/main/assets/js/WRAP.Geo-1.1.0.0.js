/**
 * @namespace WRAP
 **/
var WRAP; if (typeof WRAP === 'undefined') WRAP = {};

/**
 * @class Geo
 * @static
 **/
WRAP.Geo = {
    
    version : "1.1",

    /**
     * 論理レイヤー（の重ね順）を登録する
     * @method setLayer
     * @param layers {Object} <br>
     {<br>
					interactive_layers : [{WRAP.GeoLayer}, ...],<br>
					plot_layers : [{WRAP.GeoLayer}, ...],<br>
					upper_layers : [{WRAP.GeoLayer}, ...],<br>
					lower_layers : [{WRAP.GeoLayer}, ...],<br>
     }<br>
     
     container.interactive_layers		ユーザーとのインタラクションを共なうコンテンツを描画するレイヤー
     container.plot_layers			インタラクションを共なわないコンテンツを描画するレイヤー
     container.upper_layers		ベースマップ（陸地）の上にオーバレイするイメージを描画するレイヤー
     container.lower_layers		ベースマップ（陸地）の下に描画するイメージを描画するレイヤー
     *
     *v1.0では、lower_layersおよび plot_layersは非対応
     * @return なし
     **/
    setLayer: function(container) {
        this.container = {
            interactive_layers:container.interactive_layers,
            plot_layers:container.plot_layers,
            upper_layers:container.upper_layers,
            lower_layers:container.lower_layers,
        };
        if ( !this.container.upper_layers )
            this.container.container.upper_layers = [];
        if ( this.container.plot_layers )
            this.container.upper_layers = this.container.upper_layers.concat(this.container.plot_layers)
        if ( this.container.interactive_layers )
            this.container.upper_layers = this.container.upper_layers.concat(this.container.interactive_layers)
    },
    
    /**
     * 現在のマップサイズを返す
     * @method getSize
     * @param なし <br>
     * @return { width:{Integer}, height:{Integer}} 
     **/
    getSize: function() {
        return this.map.getSize();
    },
    
    /**
     * 指定緯度経度座標の現在のマップ上のスクリーン座標を返す
     * @method getScreenPoint
     * @param ps {WRAP.Geo.Point} <br>
     * @return {WRAP.Geo.ScreenPoint} スクリーン座標
     **/
    getScreenPoint: function(pt) {
        return this.map.getScreenPoint(pt);
    },
    
    /**
     * 緯度経度座標点列をスクリーン座標に変換した Line配列を返す。
     * Lineは複数生成される場合が有る。
     * @method getScreenLine
     * @param points [[lon.lat],[lon.lat],...] <br>
     * @return {Array} スクリーン座標に変換された Line（WRAP.Geo.ScreenPoint）の配列
     **/
    getScreenLine: function(points) {
        var n, s, e, w;
        var pt = [];
        if ( points && points.length > 0 ) {
            var l_lat = points[0][1];
            var l_lon = points[0][0];
            n = s = l_lat;
            e = w = l_lon;
            var p = [l_lat, l_lon];
            pt.push(p);
            for ( var i = 1 ; i < points.length ; i++ ) {
                var c_lat = points[i][1];
                var c_lon = points[i][0];
                var d_lon = c_lon - l_lon;
                if ( d_lon < -180.0 )
                    c_lon += 360.0
                    else if ( d_lon >= 180.0 )
                        c_lon -= 360.0;
                if ( n < c_lat )
                    n = c_lat;
                if ( s > c_lat )
                    s = c_lat;
                if ( w > c_lon )
                    w = c_lon;
                if ( e < c_lon )
                    e = c_lon;
                var p = [c_lat, c_lon];
                pt.push(p);
                l_lat = c_lat;
                l_lon = c_lon;
            }
        }
        if ( w < -180.0 ) { // normalize lon (-180 to 540)
            w += 360.0;
            e += 360.0;
            for ( var i = 0 ; i < pt.length ; i++ )
                pt[i][1] += 360.0;
        }
        return this.map.getScreenLine(pt, n, s, w, e);
    },
    
    /**
     * 現在のマップの指定スクリーン座標の緯度経度を返す
     * @method getPoint
     * @param pt {WRAP.Geo.ScreenPoint} <br>
     * @return {WRAP.Geo.Point} 緯度経度座標
     **/
    getPoint: function(pt) {
        return this.map.getPoint(pt);
    },
    
    /**
     * 現在のマップの中心座標を返す
     * @method getCenterPoint
     * @param なし
     * @return {WRAP.Geo.Point}				point マップ中心の緯度経度座標
     **/
    getCenterPoint: function() {
        return this.map.getCenterPoint();
    },
    
    /**
     * 現在のマップの中心座標を指定緯度経度にする
     * @method setCenterPoint
     * @param {WRAP.Geo.Point} point マップ中心の緯度経度座標
     * @return なし
     **/
    setCenterPoint: function(pt) {
        this.map.setCenterPoint(pt);
    },
    
    /**
     * 現在のマップのズームを取得する
     * @method getZoom
     * @param なし
     * @return {Integer} zoom ズームID
     **/
    getZoom: function() {
        return this.map.getZoom();
    },
    
    /**
     * 現在のマップのズームを設定する
     * @method setZoom
     * @param {Integer} zoom ズームID
     * @return なし
     **/
    setZoom: function(zoom) {
        this.map.setZoom(zoom);
    },
    
    /**
     * 現在のマップサイズから上下左右の指定マージンを差し引いた領域に、
     * 指定した座標（配列）の全てを表示できる画角情報（中心座標およびズーム）を返す
     * @method getPerspective
     * @param {Array} points [{WRAP.Geo.Point}, ...] 緯度経度オブジェクトの配列
     * @param {Integer} margin マージン
     *
     * @return {Object}
     * ```
     *     {
     *          center：{WRAP.Geo.GeoPoint},		中心座標
	 *          zoom：{Integer}					ズームID
     *     }
     * ```
     **/
    getPerspective: function(pts, margin) {
        return this.map.getPerspective(pts, margin);
    },
    
    /**
     * 指定した２点間の距離（m）を返す
     * @method getDistance
     * @param {WRAP.Geo.Point} p0 地点1
     * @param {WRAP.Geo.Point} p1 地点2
     * @return {Number} 距離（m）
     **/
    getDistance: function(p0, p1) {
        if ( this.map && this.map.getDistance )
            return this.map.getDistance(p0, p1);
        return distance(p0.lonDegree(), p0.latDegree(), p1.lonDegree(), p1.latDegree());
    },
    
    /**
     * イベントハンドラを登録する
     * @method addEventHandler
     * @param {String} name イベント名
     * + ”mouseover” マウスが描画要素に重なる
     * + ”mouseout” マウスが描画要素から出る
     * + ”touch” 描画要素をクリック（タップ）する
     * + ”boundsChange” マップ画角が変化
     * + ”visibilityChange” レイヤーの可視状態が変化
     * @param {Function} function イベント発火時に呼び出されるコールバック関数<br>
     * コールバックの引数 (layer, reference, screen_point)
     * mouseover, mouseout, touchの場合
     * + {WRAP.Geo.Layer}		layer           イベントが発火したレイヤー
     * + {WRAP.DH.Reference}	reference       イベントが発火したオブジェクト参照
     * + {WRAP.Geo.ScreenPoint}	screen_point	イベント発火スクリーン座標
     * boundsChangeの場合
     * + {WRAP.Geo.Bounds}		bounds          画面表示しているマップ範囲
     * visibilityChangeの場合
     * + {WRAP.Geo.Layer}		layer           可視状態が変化したレイヤー
     * @return なし
     **/
    addEventHandler: function(name, cb) {
        var event = this.Interaction[name];
        if ( event )
            event.push(cb);
    },
    
    /**
     * イベントハンドラを削除する
     * @method removeEventHandler
     * @param {String} name イベント名
     * @param {Function} function 登録した関数
     * @return なし
     **/
    removeEventHandler: function(name, cb) {
        var event = this.Interaction[name];
        if ( event ) {
            var index = event.indexOf(cb);
            if ( index >= 0 )
                event.splice(index,1);
        }
    },

    /**
     * マップシステムを切り替える
     * @method switchMap
     * @param {Object} map GoogleMapsまたは OpenLayersの Mapオブジェクト
     * @return なし
     **/
    switchMap: function(map) {
        var zoom, center;
        if ( WRAP.Geo.map ) {
            zoom = WRAP.Geo.map.getZoom();
            center = WRAP.Geo.map.getCenterPoint();
        }
        if ( WRAP.Geo.map.context )
            map.context.revision = WRAP.Geo.map.context.revision;
        map.context.revision++;
        WRAP.Geo.map = map;
        if ( zoom && center ) {
            WRAP.Geo.map.setZoom(zoom);
            WRAP.Geo.map.setCenterPoint(center);
        }
        setTimeout(function() {
            map.update(true);
            WRAP.Geo.invalidate();
        }, 1000 );
    },
    
    /**
     * マウス・インタラクションの初期化を行う
     * @method setInteraction
     * @param {html div} div Mapを表示している HTML　div要素オブジェクト
     * @param {Object} livecamera ライブカメラ機能を利用する場合は、WRAP.DH.addObjectで登録したライブカメラデータオブジェクト
     *　　　　　　　　　　　　　　　　　仕様しない場合は指定しない
     * @return なし
     **/
    setInteraction: function(div, livecamera) {
        var self = this;
        WRAP.Geo.Interaction.init(livecamera, div);
        self.lastHit = null;
        self.lastClick = null;
        self.lastX = 0;
        self.lastY = 0;
        
        div.addEventListener('mousemove', function(evt) {
            if (evt._prevent )
                return;
            var r = div.getBoundingClientRect();
            var x = evt.clientX-r.left, y = evt.clientY-r.top;
                       
            self.lastX = x;
            self.lastY = y;
            var dragging = evt.which;
            if ( !dragging ) {
                if ( self.lastClick ) {
                    WRAP.Geo.enableScroll(true);
                    self.lastClick = null;
                }
            }
            else if ( self.lastClick ) {
                if ( self.lastClick.feature.draggable ) {
                    self.lastClick.feature.drag(x, y);
                    self.invalidate();
                    return;
                }
            }
                             
            var point = new WRAP.Geo.ScreenPoint(x, y);
            var hit = self.hit(point);
            if ( hit.pixel || !self.lastHit || hit.feature != self.lastHit.feature ) {
                if ( hit.feature && hit.feature.draggable ) {
                    WRAP.Geo.enableScroll(false);
                }
                             
                if ( self.lastHit && self.lastHit.feature && self.lastHit.feature.mouseout )
                    self.lastHit.feature.mouseout(x,y);
                if ( hit.feature && hit.feature.mouseover )
                    hit.feature.mouseover(x,y);
                self.lastHit = hit;
                if ( self.lastHit.feature ) {
                    var layer = self.lastHit.layer;
                    var text;
                    var hits = [];
                    if ( self._tooltipGroup ) {
                        for ( var i = 0 ; i < self._tooltipGroup.length ; i++ ) {
                            var g = self._tooltipGroup[i];
                            if ( g.indexOf(layer) >= 0 ) {
                                for ( var j = 0 ; j < g.length ; j++ ) {
                                     var l = g[j];
                                     if ( l.visible() ) {
                                        for ( var k = l._dl.length-1 ; k >= 0 ; k-- ) {
                                            var f = l._dl[k];
                                            var h = f.hit(point.x, point.y);
                                            if ( h ) {
                                                hits.push({ layer:l, feature:f, x:h.x, y:h.y });
                                                break;
                                            }
                                        }
                                    }
                                }
                                break;
                            }
                        }
                    }
                    if ( !hits.length )
                        hits.push(self.lastHit);
                    for ( var i = 0 ; i < hits.length ; i++ ) {
                        var l = hits[i].layer;
                        if ( l._tooltip_handler ) {
                             if ( text && text.length )
                                text += "<br/>";
                             else
                                text = "";
                             var content = l._tooltip_handler(hits[i].feature.geo, hits[i].feature.data);
                             if ( content )
                                text += content;
                        }
                    }
                    if ( text && text.length ) {
                        WRAP.Geo.currentFeature = self.lastHitfeature;
                        WRAP.Geo.Interaction.setTooltip(text);
                        WRAP.Geo.Interaction.showTooltip(self.lastHit.x,self.lastHit.y);
                    }
                    else {
                        WRAP.Geo.currentFeature = null;
                        WRAP.Geo.Interaction.clearTooltip();
                    }
                    //console.log("hit");
                }
                else {
                    WRAP.Geo.enableScroll(true);
                    WRAP.Geo.currentFeature = null;
                    WRAP.Geo.Interaction.clearTooltip();
                    //console.log("no hit");
                }
            }
        });
        
        var click_x, click_y;
        div.addEventListener('mousedown', function(evt) {
            click_x = evt.clientX;
            click_y = evt.clientY;
            var r = div.getBoundingClientRect();
            var x = evt.clientX-r.left, y = evt.clientY-r.top;
            var hit = self.hit(new WRAP.Geo.ScreenPoint(x, y));
            if ( hit && hit.feature ) {
                self.lastClick = hit;
                if ( self.lastClick.feature.draggable )
                    self.lastClick.feature.dragStart(x, y);
                             
                if ( hit.feature.touch )
                    hit.feature.touch(x,y);
            }
        });
        
        div.addEventListener('mouseup', function(evt) {
            if ( self.lastClick ) {
                if ( self.lastClick.feature.draggable ) {
                    self.lastClick.feature.dragEnd();
                }
                WRAP.Geo.enableScroll(true);
                self.lastClick = null;
            }
            else {
                if ( click_x == evt.clientX && click_y == evt.clientY ) {
                    var r = evt.target.getBoundingClientRect();
                    var x = evt.clientX-r.left, y = evt.clientY-r.top;
                    var handler = WRAP.Geo.Interaction.touch;
                    var sp = new WRAP.Geo.ScreenPoint(x,y);
                    for ( var i = 0 ; i < handler.length ; i++ )
                        handler[i](null, null, sp);
                }
            }
        });
        
        div.addEventListener('mouseout', function() {
            WRAP.Geo.enableScroll(true);
            WRAP.Geo.currentFeature = null;
            WRAP.Geo.Interaction.clearTooltip();
        });
        
    },
    
    /**
     * 現在のツールチップの表示状態を返す
     * @method currentTooltip
     * @param なし
     *
     * @return {Object}
     *
     * ツールチップ表示状態の場合
     *
     * ```
     *     {
     *          geo：{GeoJSON.Feature},     ツールチップ表示対象となる GeoJSONの Featureオブジェクト
     *          data：{Object},             GeoJSONにデータJSONが結びついている場合は、該当のデータオブジェクト
     *          conent：{String}	            Layer.setTooltipで設定したツールチップ内容テキスト
     *     }
     * ```
     *
     * ツールチップ非表示状態の場合
     *
     * null
     **/
    currentTooltip: function() {
        var content = WRAP.Geo.Interaction.getTooltip();
        if ( content && WRAP.Geo.currentFeature ) {
            return {
                geo:WRAP.Geo.currentFeature.geo,
                data:WRAP.Geo.currentFeature.data,
                content:content
            }
        }
    },
    
    addTooltipGroup: function(layers) {
        if ( !layers || !layers.length )
            return;
        if ( !this._tooltipGroup )
            this._tooltipGroup = [];
        for ( var i = 0 ; i < this._tooltipGroup ; i++ ) {
            var g = this._tooltipGroup[i];
            if ( layers.length == g.length ) {
                var j = 0;
                while ( j < layers.length ) {
                    if ( g.indexOf(layers[j++]) < 0 )
                        break;
                }
                if ( j >= layers.length )
                    return;
            }
        }
        this._tooltipGroup.push(layers);
    },
                        
    removeTooltipGroup: function(layers) {
        if ( !layers || !layers.length || !this._tooltipGroup )
            return;
        for ( var i = 0 ; i < this._tooltipGroup ; i++ ) {
            var g = this._tooltipGroup[i];
            if ( layers.length == g.length ) {
                var j = 0;
                while ( j < layers.length ) {
                    if ( g.indexOf(layers[j++]) < 0 )
                        break;
                }
                if ( j >= layers.length ) {
                    this._tooltipGroup.splice(i,1);
                    return;
                }
            }
        }
    },
    
    /**
     * マップ上の緯度経度座標を表現するクラス
     *
     * @class Geo.Point
     * @constructor
     * @param {Number} lat 緯度（分）
     * @param {Number} lon 経度（分）
     */
    Point: function(lat, lon) {
        
        /**
         * 緯度（分）
         * @property lat
         * @type {Number} 緯度（分）
         **/
        
        /**
         * 経度（分）
         * @property lon
         * @type {Number} 経度（分）
         **/
        
        /**
         * 緯度経度を（分）で設定する
         * @method setDegree
         * @param {Number} lat 緯度（分）
         * @param {Number} lon 経度（分）
         * @return なし
         **/
        this.set = function(lat, lon) {
            this.lat = parseFloat(lat);
            this.lon = parseFloat(lon);
            if ( this.lon < -10800 )
                this.lon += 21600;
            else if ( this.lon >= 10800 )
                this.lon -= 21600;
        }
        
        /**
         * 緯度経度を（度）で設定する
         * @method setDegree
         * @param {Number} lat 緯度（度）
         * @param {Number} lon 経度（度）
         * @return なし
         **/
        this.setDegree = function(lat, lon) {
            set(parseFloat(lat)*60.0. parseFloat(lon)*60.0);
        }
        
        /**
         * 緯度を（度）で取得する
         * @method latDegree
         * @param なし
         * @return {Number} 緯度（度）
         **/
        this.latDegree = function() {
            return this.lat/60.0;
        }

        /**
         * 経度を（度）で取得する
         * @method lonDegree
         * @param なし
         * @return {Number} 経度（度）
         **/
        this.lonDegree = function() {
            return this.lon/60.0;
        }
        
        this.set(lat, lon);
    },

    /**
     * マップ上の緯度経度領域を表現するクラス
     *
     * @class Geo.Bounds
     * @constructor
     * @param {Number} n 北限緯度（分）
     * @param {Number} s 南限緯度（分）
     * @param {Number} e 東限経度（分）
     * @param {Number} w 西限経度（分）
     */
    Bounds: function(n,s,e,w) {
        /**
         * 指定座標が Boundsに含まれるかどうかを判定する
         * @method contains
         * @param {WRAP.Geo.Point} point　座標
         * @return {Boolean} 含まれる場合は true、含まれない場合は false
         **/
        this.contains = function(point) {
            if ( point.lat > this.north || point.lat < this.south )
                return false;
            if ( this.west < this.east ) {
                if ( point.lon > this.east || point.lon < this.west )
                    return false;
            }
            else {
                if ( point.lon > this.east && point.lon < this.west )
                    return false;
            }
            return true;
        }
        /**
         * @property north
         * @type {Number} 北限緯度（分）
         **/
        this.north = n;
        /**
         * @property south
         * @type {Number} 南限緯度（分）
         **/
        this.south = s;
        /**
         * @property east
         * @type {Number} 東限経度（分）
         **/
        this.east = e;
        /**
         * @property west
         * @type {Number} 西限経度（分）
         **/
        this.west = w;
    },
    
    /**
     * マップ上のスクリーン座標を表現するクラス
     * @class Geo.ScreenPoint
     * @constructor
     * @param {Number} x x座標
     * @param {Number} y y座標
     */
    ScreenPoint: function(x, y) {
        this.x = x;
        this.y = y;
    },
    

    /**
     * マップ上のスクリーン座標範囲を表現するクラス
     * @class Geo.ScreenBounds
     * @constructor
     * @param {Number} x x座標
     * @param {Number} y y座標
     * @param {Number} width 幅
     * @param {Number} height 高さ
     */
    ScreenBounds: function(x, y, width, height) {
        /**
         * @property x
         * @type {Number} x座標
         **/
        this.x = x;
        /**
         * @property y
         * @type {Number} y座標
         **/
        this.y = y;
        /**
         * @property width
         * @type {Number} 幅
         **/
        this.width = width;
        /**
         * @property height
         * @type {Number} 高さ
         **/
        this.height = height;
    },
    
    /**
     * 論理レイヤークラス
     * @class Geo.Layer
     * @constructor
     * @param {String} name  レイヤー名称
     */
    Layer: function(name) {
        var self = this;
        this._name = name;
        this._visible = true;
        this._style = null;
        this._content = null;
        this._attr = null;
        this._data = null;
        this._conf = null;
        this._dl = [];
        this._revision = { data:0, conf:0, context:0, content:0, style:0 };
        
        /**
         * レイヤーにデータとレイヤーコンフィグをアタッチし、レンダラがレイヤー内にインスタンス化される
         * レンダラは設定されたデータを監視しデータ更新に応じて描画を更新する
         * @method configure
         * @param {WRAP.DH.Referecne} data 描画対象データの参照
         * @param {Object} conf レイヤーコンフィグ・データ
         * @return なし
         **/
        this.configure = function(data, conf) {
            this._data = data;
            this._conf = conf;
            this._revision.conf++;
            
            var name = conf.Renderer;
            if ( name && WRAP.Geo.Renderer[name] ) {
                this._renderer = new WRAP.Geo.Renderer[name]();
            }
            else {
                self._error("Implementation WRAP.Geo.Renderer."+name+" not found.");
            }
            
            if ( this._data ) {
                this._data.inspect(function() {
                    self._revision.data++;
                    self.render();
                }, true);
            }
            else {
                self.render();
            }
        }
        
        /**
         * レイヤーを表示する
         * @method show
         * @param なし
         * @return なし
         **/
        this.show = function() {
            this.setVisible(true);
        }
        
        /**
         * レイヤーを非表示にする
         * @method hide
         * @param なし
         * @return なし
         **/
        this.hide = function() {
            this.setVisible(false);
        }
        
        /**
         * レイヤーの表示状態を返す
         * @method visible
         * @param なし
         * @return {Boolean} true:表示、false：非表示
         **/
        this.visible = function() {
            return this._visible;
        }
        
        /**
         * レイヤーの表示状態を設定する
         * @method setVisible
         * @param {Boolean} true:表示、false：非表示
         * @return なし
         **/
        this.setVisible = function(flag) {
            if ( this._visible == flag )
                return;
            this._visible = flag;
            
            var handler = WRAP.Geo.Interaction.visibilityChange;
            if ( handler ) {
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this);
            }
            this.render();
            WRAP.Geo.invalidate();
        }
        
        /**
         * レイヤーに描画要素オブジェクト（Feature）を登録する
         * @method addFeature
         * @param {WRAP.Geo.Feature} feature 描画要素オブジェクト
         * @return なし
         **/
        this.addFeature = function(feature) {
            feature.layer = this;
            this._dl.push(feature);
        }
        
        /**
         * レイヤーから描画要素オブジェクト（Feature）を削除する
         * @method removeFeature
         * @param {WRAP.Geo.Feature} feature 描画要素オブジェクト
         * @return なし
         **/
        this.removeFeature = function(feature) {
            var index = this._dl.indexOf(feature);
            if ( index >= 0 )
                this._dl.splice(index, 1);
        }
        
        /**
         * レイヤーから描画内容（全ての描画要素）を削除する
         * @method clear
         * @param なし
         * @return なし
         **/
        this.clear = function() {
            this._dl = [];
            WRAP.Geo.invalidate();
        }
        
        /**
         * レイヤーに表示するコンテンツキーを設定する
         * コンテンツキーはデータ内部の可変属性を確定させるための（basetime、validtime、element、level...）などのキーで、構成・内容はデータに依存する
         * @method set
         * @param {Object} object 形式はデータに依存<br>
         *      例）<br>
         *      {
         *          basetime：{String}，
         *          validtime：{String}
         *      }
         *
         * @return なし
         **/
        this.set = function(content) {
            var c = JSON.parse(JSON.stringify(content));
            if ( this._timeController && this._data ) {
                if ( !this._timeController.validate(this, c) ) {
                    this._content = c;
                    self.clear();
                    return;
                }
            }
            if ( JSON.stringify(this._content) == JSON.stringify(c) )
                return;
            this._content = c;
            self._revision.content++;
            self.render();
        }
        
        /**
         * レイヤーに 現在 setされているコンテンツキー取得する。
         * 属性キーの構成・内容はデータに依存する（Basetime、Validtimeなど）
         * @method get
         * @param なし
         *
         * @return {Object} object 形式はデータに依存<br>
         *      例）<br>
         *      {
         *          basetime：{String}，
         *          validtime：{String}
         *      }
         **/
        this.get = function() {
            return this._content;
        }
        
        /**
         * レイヤーにアタッチしたレイヤーコンフィグの Attributes部分を指定オブジェクトでオーバーライドする
         *
         * レイヤーコンフィグとして共通のテンプレートを用いて内部の一部属性のみを変更する場合などに用いる
         * @method setAttributes
         * @param {Object} attr Attributes設定（内容は個々のレイヤーレンダラのConfig仕様に依存）
         * @return なし
         **/
        this.setAttributes = function(attr) {
            if ( this._content && attr &&
                JSON.stringify(this._content) == JSON.stringify(attr) )
                return;
            self._revision.conf++;
            this._attr = attr;
            this.render();
        }
        
        /**
         * レイヤー名称を返す
         * @method name
         * @param なし
         * @return {String} レイヤー名称
         **/
        this.name = function() {
            return this._name;
        }
        
        /**
         * レイヤーのスタイルを設定する
         * @method setStyle
         * @param {String} style スタイル名
         * @return なし
         **/
        this.setStyle = function(style) {
            if ( this._style == style )
                return;
            self._revision.style++;
            this._style = style;
            this.render();
        }
        
        /**
         * レイヤーにツールチップハンドラを設定する
         * @method setToolTip
         * @param {Function} handler ツールチップコンテンツ生成ハンドラ
         * コールバックの引数 (data)
         * + {WRAP.DH.Reference}	data	イベントが発火したオブジェクト参照
         * @return なし
         **/
        this.setTooltip = function(handler) {
            this._tooltip_handler = handler;
        }
        
        /**
         * レイヤーを再描画する
         * @method invalidate
         * @param なし
         * @return なし
         **/
        this.invalidate = function() {
            this._revision.data++;
            this.render();
        }
        
        /**
         * レイヤーに表示をマージするレイヤーを登録する。
         * @method merge
         * @param {Array}　layers　表示をマージするレイヤーの配列（nullまたは空配列の場合マージが解除される）
         * @return なし
         **/
        this.merge = function(layers) {
            if ( this.merged == layers )
                return;
            if ( this.merged && layers && this.merged.toString() == layers.toString() )
                return;
            this.merged = layers;
            this.invalidate();
        }
        
        this.getValue = function(point) {
            if ( this._renderer && this._renderer.getValue ) {
                var content = this._content;
                var context = WRAP.Geo.map.context;
                var data = this._data;
                return this._renderer.getValue(content, context, data, point);
            }
            return null;
        }
        
        this._currentConfiguration = function() {
            
            function copy(t, c) {
                for ( var key in c ) {
                    if ( Array.isArray(c[key]) )
                        t[key] = c[key];
                    else if ( typeof c[key] == "object" )
                        copy((t[key] = {}), c[key]);
                    else
                        t[key] = c[key];
                }
            }
            
            function override(t, c) {
                if ( !c )
                    return;
                for ( var key in c ) {
                    if ( typeof c[key] == "object" && t[key] )
                        override(t[key], c[key]);
                    else
                        t[key] = c[key];
                }
            }
            
            var conf = {};
            copy(conf, this._conf);
            if ( !conf.Attributes )
                conf.Attributes = {};
            override(conf.Attributes, this._attr);
            return conf;
        }
        
        this.render = function() {
            if ( this._visible && this._renderer && this._renderer.draw ) {
                var content = this._content;
                var conf = this._currentConfiguration();
                var context = WRAP.Geo.map.context;
                var style = this._style;
                var data = this._data;
                var revision = this._revision;
                var dl = this._dl;
                revision.context = context.revision;
                this._renderer.draw(this, content, conf, context, style, data, revision, dl);
                for ( var i = 0 ; i < dl.length ; i++ )
                    dl[i].layer = this;
            }
        }
        
        this.renderMerge = function(revision) {
            var dl = [];
            if ( this._visible ) {
                if ( this.merged && this._renderer && this._renderer.merge ) {
                    var conf = this._currentConfiguration();
                    var style = this._style;
//console.log("renderMerge "+this.name());
                    this._renderer.merge(dl, this._dl, conf, style);
                    this._merged_revision = revision;
                    for ( var i = 0 ; i < this.merged.length ; i++ ) {
                        var layer = this.merged[i];
                        if ( layer._visible && layer._renderer && layer._renderer.merge ) {
                            conf = layer._currentConfiguration();
                            style = layer._style;
//console.log("renderMerge "+layer.name());
                            layer._renderer.merge(dl, layer._dl, conf, style);
                            layer._merged_revision = revision;
                        }
                    }
                }
                else {
                    dl = this._dl;
                }
            }
            return dl;
        }
        
        this.setTimeController = function(controller) {
            this._timeController = controller;
        }
        
        this._error = function(e) {
            console.warn(this.name()+":"+e);
        }

    },
    
    Feature: {
        /**
         * ポイント描画要素クラス
         * @class Geo.Feature.Point
         * @constructor
         * @param {Object} style スタイル
         *
         * ```
         *     {
         *          point:[lon, lat],                   単位は度
         *          pointSize:{Number}                  ポイントサイズ
         *          lineWidth:{Number}                  ポイントの外周線のサイズ
         *          strokeStyle:{String}                ポイントの外周線の色　例）rgba(255,255,255,0.5)
         *          fillStyle:{String}                  ポイントの色　例）rgba(255,0,0,1.0)
         *          sensorSize:{Number}                 マウスイベントに反応するセンサーサイズ（省略時は、pointSizeが用いられる）
         *     }
         * ```
         **/
        Point: function(style) {
            this.draw = function(context) {
                context.drawPoint(style.point, style.pointSize,
                                  style.lineWidth, style.strokeStyle, style.fillStyle);
            }
            this.hit = function(x, y) {
                var s = style.pointSize;
                if ( style.sensorSize )
                    s = style.sensorSize;
                var p = WRAP.Geo.getScreenPoint(new WRAP.Geo.Point(style.point[1]*60, style.point[0]*60));
                var sx = p.x-s/2;
                var ex = sx+s;
                if ( x < sx || ex < x )
                    return null;
                var sy = p.y-s/2;
                var ey = sy+s;
                if ( y < sy || ey < y )
                    return null;
                return { x:p.x, y:p.y };
            }
            this.setDraggable = function(draggable, cb) {
                this.draggable = draggable;
                this.dragHandler = cb;
            }
            this.style = function() { return style };
            
            this.mouseover = function() {
                var handler = WRAP.Geo.Interaction.mouseover;
                var sp = WRAP.Geo.getScreenPoint(new WRAP.Geo.Point(style.point[1]*60, style.point[0]*60));
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this.layer, this, sp);
            }
            this.mouseout = function() {
                var handler = WRAP.Geo.Interaction.mouseout;
                var sp = WRAP.Geo.getScreenPoint(new WRAP.Geo.Point(style.point[1]*60, style.point[0]*60));
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this.layer, this, sp);
            }
            this.touch = function() {
                var handler = WRAP.Geo.Interaction.touch;
                var sp = WRAP.Geo.getScreenPoint(new WRAP.Geo.Point(style.point[1]*60, style.point[0]*60));
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this.layer, this, sp);
            }
            
            this.dragStart = function(x, y) {
                var p = WRAP.Geo.getScreenPoint(new WRAP.Geo.Point(style.point[1]*60, style.point[0]*60));
                this.anchor = {
                    lon:style.point[0],
                    lat:style.point[1],
                    ox:x,
                    oy:y,
                    x:p.x,
                    y:p.y
                }
            }
            this.drag = function(x, y) {
                if ( !this.anchor )
                    return;
                var pos = WRAP.Geo.getPoint(new WRAP.Geo.ScreenPoint(this.anchor.x+(x-this.anchor.ox), this.anchor.y+(y-this.anchor.oy)));
                style.point[0] = pos.lonDegree();
                style.point[1] = pos.latDegree();
                if ( this.dragHandler )
                    this.dragHandler(this, style.point);
            }
            this.dragEnd = function() {
                this.anchor = null;
            }
        },
        
        /**
         * テキスト描画要素クラス
         * @class Geo.Feature.Text
         * @constructor
         * @param {Object} style スタイル
         *
         * ```
         *     {
         *          point:[lon, lat],                   単位は度
         *          text:{String}                       文字列
         *          fontSize:{Number}                   フォントサイズ（ピクセル）
         *          fillStyle:{String}                  色　例）rgba(255,0,0,1.0)
         *          offsetX:{Number}                　　 テキストの表示オフセットX（ピクセル）
         *          offsetY:{Number}                　　 テキストの表示オフセットY（ピクセル）
         *          align:{String}                      文字列の水平方向アライン 'center' または 'right' または 'left'
         *     }
         * ```
         *
         **/
        Text: function(style) {
            this.draw = function(context) {
                context.drawText(style.point, style.text, style.fontSize, style.fillStyle, style.strokeStyle,
                                 style.offsetX, style.offsetY, style.align, style.rotation);
            }
            this.hit = function(x, y) {
                var ctx = WRAP.Geo._internal_context;
                if ( !ctx ) {
                    var cvs = WRAP.Geo._internal_canvas = document.createElement('canvas');
                    ctx = WRAP.Geo._internal_context = cvs.getContext("2d");
                }
                var h = style.fontSize;
                if ( style.fontSize ) {
                    ctx.font = style.fontSize + "px Arial";
                }
                else {
                    var w = ctx.measureText("W");
                    h = w.width*1.5;
                }
                var ox = parseFloat(style.offsetX) || 0;
                var oy = parseFloat(style.offsetY) || 0;
                var a = ctx.measureText(style.text);
                if ( style.align == 'left' )
                    ox += 0;
                else if ( style.align == 'right')
                    ox -= a.width;
                else
                    ox -= a.width*0.5;
                
                var p = WRAP.Geo.getScreenPoint(new WRAP.Geo.Point(style.point[1]*60, style.point[0]*60));
                var sx = p.x+ox;
                var sy = p.y+oy-h;
                var ex = sx+a.width;
                var ey = sy+h;
                if ( sx <= x && x <= ex && sy <= y && y <= ey )
                    return { x:p.x, y:p.y };
                return null;
            }
            this.mouseover = function() {
                var handler = WRAP.Geo.Interaction.mouseover;
                var sp = WRAP.Geo.getScreenPoint(new WRAP.Geo.Point(style.point[1]*60, style.point[0]*60));
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this.layer, this, sp);
            }
            this.mouseout = function() {
                var handler = WRAP.Geo.Interaction.mouseout;
                var sp = WRAP.Geo.getScreenPoint(new WRAP.Geo.Point(style.point[1]*60, style.point[0]*60));
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this.layer, this, sp);
            }
            this.touch = function() {
                var handler = WRAP.Geo.Interaction.touch;
                var sp = WRAP.Geo.getScreenPoint(new WRAP.Geo.Point(style.point[1]*60, style.point[0]*60));
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this.layer, this, sp);
            }
            this.style = function() { return style };
        },
        
        /**
         * Line描画要素クラス
         * 指定座標を基準としたピクセル座標のライン、ポリゴンの描画
         * @class Geo.Feature.Line
         * @constructor
         * @param {Object} style スタイル
         *
         * ```
         *     {
         *          point:[lon, lat],                   基準座標。単位は度
         *          line:[[x0, y0], [x1, y1], ...],     ピクセル座標配列
         *          　　　　　　　　　　　　　　　　　　　　　 または、ピクセル座標配列の配列でもよい[[[x0, y0], [x1, y1]], [[x2, y2], [x3, y3]]]
         *          lineWidth:{Number}                  line幅
         *          strokeStyle:{String}                lineの色　例）rgba(255,255,255,0.5)
         *          lineDash:[]                         [実線サイズ、空白サイズ]の破線パターン配列
         *          fillStyle:{String}                  塗りつぶし色　例）rgba(255,0,0,1.0)
         *          fillImage:{String}                  塗りつぶしパターンのImageファイルURL（画像サイズは縦横とも 2のn乗である必要があります）
         *     }
         * ```
         *
         **/
        Line: function(style) {
            this.draw = function(context) {
                context.drawLine(style.point, style.line, style.lineWidth, style.lineDash, style.strokeStyle,
                                 style.fillStyle, style.fillImage, style.option, style.rotation, this.id);
            }
            this.hit = function(x, y, context) {
                if ( context.hit(x,y, this.id) )
                    return { x:x, y:y };
                return null;
            }
            this.mouseover = function(x,y) {
                var handler = WRAP.Geo.Interaction.mouseover;
                var sp = new WRAP.Geo.ScreenPoint(x,y);
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this.layer, this, sp);
            }
            this.mouseout = function(x,y) {
                var handler = WRAP.Geo.Interaction.mouseout;
                var sp = new WRAP.Geo.ScreenPoint(x,y);
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this.layer, this, sp);
            }
            this.touch = function(x,y) {
                var handler = WRAP.Geo.Interaction.touch;
                var sp = new WRAP.Geo.ScreenPoint(x,y);
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this.layer, this, sp);
            }
            this.style = function() { return style };
        },
        
        /**
         * イメージ（アイコン）描画要素クラス
         * @class Geo.Feature.Image
         * @constructor
         * @param {Object} style スタイル
         *
         * ```
         *     {
         *          point:[lon, lat],                   単位は度
         *          image:{String}                      イメージファイルのURL
         *          width:{Number}                      イメージの横表示サイズ
         *          height:{Number}                     イメージの縦表示サイズ
         *          offsetX:{Number}                    イメージの横表示オフセット
         *          offsetY:{Number}                    イメージの縦表示オフセット
         *          rotation:{Number}                   イメージの回転角度（単位：度）
         *     }
         * ```
         *
         **/
        Image: function(style) {
            this.draw = function(context) {
                if ( style.image.data ) {
                    context.drawImageData(style.point, style.image, style.width, style.height,
                                      style.offsetX, style.offsetY, style.rotation);
                }
                else {
                    context.drawImage(style.point, style.image, style.width, style.height,
                                      style.offsetX, style.offsetY, style.rotation);
                }
            }
            this.hit = function(x, y) {
                var w = style.width;
                var h = style.height;
                var p = WRAP.Geo.getScreenPoint(new WRAP.Geo.Point(style.point[1]*60, style.point[0]*60));
                var sx = p.x-w/2;
                var ex = sx+w;
                if ( x < sx || ex < x )
                    return null;
                var sy = p.y-h/2;
                var ey = sy+h;
                if ( y < sy || ey < y )
                    return null;
                return { x:p.x, y:p.y };
            }
            this.style = function() { return style };
            
            this.mouseover = function() {
                var handler = WRAP.Geo.Interaction.mouseover;
                var sp = WRAP.Geo.getScreenPoint(new WRAP.Geo.Point(style.point[1]*60, style.point[0]*60));
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this.layer, this, sp);
            }
            this.mouseout = function() {
                var handler = WRAP.Geo.Interaction.mouseout;
                var sp = WRAP.Geo.getScreenPoint(new WRAP.Geo.Point(style.point[1]*60, style.point[0]*60));
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this.layer, this, sp);
            }
            this.touch = function() {
                var handler = WRAP.Geo.Interaction.touch;
                var sp = WRAP.Geo.getScreenPoint(new WRAP.Geo.Point(style.point[1]*60, style.point[0]*60));
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this.layer, this, sp);
            }
            
            this.set = function(layer, ref) {
                this.layer = layer;
                this.reference = ref;
                this.mouseover = function() {
                    var handler = WRAP.Geo.Interaction.mouseover;
                    var sp = WRAP.Geo.getScreenPoint(new WRAP.Geo.Point(style.point[1]*60, style.point[0]*60));
                    for ( var i = 0 ; i < handler.length ; i++ )
                        handler[i](this.layer, this.reference, sp);
                }
                this.mouseout = function() {
                    var handler = WRAP.Geo.Interaction.mouseout;
                    var sp = WRAP.Geo.getScreenPoint(new WRAP.Geo.Point(style.point[1]*60, style.point[0]*60));
                    for ( var i = 0 ; i < handler.length ; i++ )
                        handler[i](this.layer, this.reference, sp);
                }
                this.touch = function() {
                    var handler = WRAP.Geo.Interaction.touch;
                    var sp = WRAP.Geo.getScreenPoint(new WRAP.Geo.Point(style.point[1]*60, style.point[0]*60));
                    for ( var i = 0 ; i < handler.length ; i++ )
                        handler[i](this.layer, this.reference, sp);
                }
            }
        },
        
        /**
         * GeoLine描画要素クラス
         * 緯度経度座標のライン、ポリゴンの描画
         * @class Geo.Feature.GeoLine
         * @constructor
         * @param {Object} style スタイル
         *
         * ```
         *     {
         *          path:[[lat0, lon0], [lat1, lon1], ...],     座標配列
         *          　　　　　　　　　　　　　　　　　　　　　 または、座標配列の配列でもよい[[[lon00, lat00], [lon01, lat02], ...],
         *                                                                        [[lon10, lat10], [lon11, lat12], ...]]
         *          lineWidth:{Number}                  line幅
         *          strokeStyle:{String}                lineの色　例）rgba(255,255,255,0.5)
         *          lineDash:[]                         [実線サイズ、空白サイズ]の破線パターン配列
         *          fillStyle:{String}                  塗りつぶし色　例）rgba(255,0,0,1.0)
         *          fillImage:{String}                  塗りつぶしパターンのImageファイルURL（画像サイズは縦横とも 2のn乗である必要があります）
         *     }
         * ```
         *
         **/
        GeoLine: function(style) {
            this.draw = function(context) {
                context.drawPath(style.path, style.lineWidth, style.lineDash, style.strokeStyle,
                                 style.fillStyle, style.fillImage, style.option,
                                 (style.geodesic===undefined || style.geodesic), this.id);
            }
            this.hit = function(x, y, context) {
                if ( context.hit(x,y, this.id) )
                    return { x:x, y:y };
                return null;
            }
            this.mouseover = function(x,y) {
                var handler = WRAP.Geo.Interaction.mouseover;
                var sp = new WRAP.Geo.ScreenPoint(x,y);
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this.layer, this, sp);
            }
            this.mouseout = function(x,y) {
                var handler = WRAP.Geo.Interaction.mouseout;
                var sp = new WRAP.Geo.ScreenPoint(x,y);
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this.layer, this, sp);
            }
            this.touch = function(x,y) {
                var handler = WRAP.Geo.Interaction.touch;
                var sp = new WRAP.Geo.ScreenPoint(x,y);
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this.layer, this, sp);
            }
            
            this.style = function() { return style };
        },
        
        
        /**
         * GeoArc描画要素クラス
         * 指定座標に指定距離の円弧を描く
         * @class Geo.Feature.GeoArc
         * @constructor
         * @param {Object} style スタイル
         *
         * ```
         *     {
         *          point:[lon, lat],                   単位は度
         *          radius:{Number}                     半径（m）
         *          start:{Number}                      開始角度（度）
         *          end:{Number}                        終了角度（度）
         *          lineWidth:{Number}                  line幅
         *          strokeStyle:{String}                lineの色　例）rgba(255,255,255,0.5)
         *          fillStyle:{String}                  塗りつぶし色　例）rgba(255,0,0,1.0)
         *          fillImage:{String}                  塗りつぶしパターンのImageファイルURL（画像サイズは縦横とも 2のn乗である必要があります）
         *     }
         * ```
         *
         **/
        GeoArc: function(style) {
            this.draw = function(context) {
                context.drawArc(style.point, style.radius, style.start, style.end,
                                style.lineWidth, style.strokeStyle, style.fillStyle, style.fillImage, this.id);
            }
            this.hit = function(x, y, context) {
                if ( context.hit(x,y, this.id) )
                    return { x:x, y:y };
                return null;
            }
            this.mouseover = function(x,y) {
                var handler = WRAP.Geo.Interaction.mouseover;
                var sp = new WRAP.Geo.ScreenPoint(x,y);
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this.layer, this, sp);
            }
            this.mouseout = function(x,y) {
                var handler = WRAP.Geo.Interaction.mouseout;
                var sp = new WRAP.Geo.ScreenPoint(x,y);
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this.layer, this, sp);
            }
            this.touch = function(x,y) {
                var handler = WRAP.Geo.Interaction.touch;
                var sp = new WRAP.Geo.ScreenPoint(x,y);
                for ( var i = 0 ; i < handler.length ; i++ )
                    handler[i](this.layer, this, sp);
            }
            this.style = function() { return style };
        },
        
        Tile: function(style) {
            this.draw = function(context) {
                context.drawTile(style.tile, style.imageData);
            }
            this.hit = function(x, y) {
                if ( x < 0 || y < 0 )
                    return null;
                var p = WRAP.Geo.getPoint(new WRAP.Geo.ScreenPoint(x,y));
                var v;
                if ( this.layer )
                    v = this.layer.getValue(p);
                this.geo = {
                    geometry: {
                        type: "Point",
                        coordinates: [p.lonDegree(), p.latDegree()]
                    },
                    properties: v
                };
                return { x:x, y:y, pixel:true };
            }
            this.style = function() { return style };
        }
    },
    
    
    /**
     * アニメーションを管理するアニメーションコントローラクラス
     * セットアップ内容に従い、Layerの時間属性キーを切り替えアメーションを行う。
     *
     * アニメーションの処理フロー
     *
     * ・アニメーションコントローラクラスをインスタンス化
     *
     *          animation = new WRAP.Geo.Animation;
     *
     *
     * ・アニメーションの時間レンジを登録
     *
     *          時間配列、インターバール時間を登録
     *          animation.setTimeRange(
	 * 				[{validtime:20160701T000000}, {validtime:20160701T120000}, ...],
	 * 				1.0
     *          );
     *
     * @class Geo.Animation
     * @constructor
     * @param なし
     **/
    Animation: function() {
        
        /**
         * アニメーションの各フレームの属性キー配列とアニメーションフレームのインターバル時間を設定する
         * 属性キーは basetime、validtimeなどを含む WRAP.Geo.Later.set関数で指定する属性オブジェクトと同等のもので
         * 具体的な形式はデータに依存し各データの論理構造定義で定められる
         *
         *          属性キーの例）
         *          {
         *              basetime：{String},
         *              validtime：{String}
         *          }
         *
         * @method setTimeRange
         * @param {Array} time_list [{Object}, ...] フレームの属性キー配列
         * @param {Number} interval アニメーション・インターバル時間
         * @return なし
         **/
        this.setTimeRange = function(time_array, interval) {
            this._frame = time_array;
            this._interval = parseFloat(interval);
            this._last_time = 0;
            this._next_time = 0;
            this._current = -1;
            this._time = 0;
            
            this._setFrame(0);
            this._running = null;
            this._cb = null;
        }
        
        /**
         * アニメーションの各フレームのvalidtimeの範囲とアニメーションフレームのインターバル時間を設定する
         * @method setValidTimeRange
         * @param {String} start_time アニメーション開始フレームの Validtime
         * @param {String} end_time アニメーション終了フレームの Validtime
         * @param {Integer} step アニメーション各フレームの Validtimeの間隔（秒で指定）
         * @param {Number} interval アニメーション・インターバル時間（秒で指定）
         * @return 設定された Validtimeのリスト
         *          [
         *          　　{
         *             　　 validtime：{String}
         *          　　}, ...
         *          ]
         **/
        this.setValidTimeRange = function(start_time, end_time, step, interval) {
            var time_array = [{validtime:start_time}];
            var st = WRAP.DH._time(start_time);
            var et = WRAP.DH._time(end_time);
            var ct = WRAP.DH._setTime(st, step);
            while ( ct < et ) {
                time_array.push({validtime:WRAP.DH._timeString(ct)});
                ct = WRAP.DH._setTime(ct, step);
            }
            if ( st < et )
                time_array.push({validtime:end_time});
            
            this._frame = time_array;
            this._interval = parseFloat(interval);
            this._last_time = 0;
            this._next_time = 0;
            this._current = -1;
            this._time = 0;
            
            this._setFrame(0);
            this._running = null;
            this._cb = null;
            return time_array;
        }
        
        /**
         * アニメーションコントローラにレイヤーを結びつける
         *
         * フレームの属性キーを共有できる複数のレイヤーを一つのアニメーションコントローラに登録することができる
         *
         * @method setLayer
         * @param {Array} layer_list [{WRAP.Gei.Layer}, ...] レイヤー配列
         * @return なし
         **/
        this.setLayer = function(layer_array) {
            this._layer = layer_array;
        }

        /**
         * アニメーションコントローラにタイムコントローラを結びつける
         *
         * @method setTimeController
         * @param {WRAP.Geo.TimeController} controller タイムコントローラ
         * @return なし
         **/
        this.setTimeController = function(controller) {
            this._controller = controller;
        }
        
        /**
         * 現在の表示フレームを指定した時間に合わせる
         * @method setTime
         * @param {Object} key 属性キー(時間構造に対応した形式)
         *
         *     {
         *          basetime:"20160831T000000",
         *          valietime:"20160831T120000"
         *     }
         * @return {}
         **/
        this.setTime = function(time) {
            this._running = false;
            var index = 0;
            while ( index < this._frame.length ) {
                if ( !time.basetime || time.basetime == this._frame[index].basetime )
                    if ( time.validtime <= this._frame[index].validtime )
                        break;
                index++;
            }
            //console.log("setTime index="+index);
            this._setFrame(index);
        }

        /**
         * アニメーションを開始する
         * フレームが変わる毎に指定した関数がコールバックされる
         * @method start
         * @param {Function} function フレーム変化時に呼び出されるコールバック関数
         *
         * コールバックの引数
         * + {Object} time（時間）属性キー
         * @return なし
         **/
        this.start = function(cb) {
            this._cb = cb;
            if ( !this._running ) {
                this._running = true;
                this._current_time = WRAP.Geo.addAnimation(this);
                this._next_time = this._current_time+this._interval;
            }
        }

        /**
         * アニメーションを停止する
         * @method stop
         * @param  なし
         * @return  なし
         **/
        this.stop = function() {
            this._running = false;
            WRAP.Geo.removeAnimation(this);
        }

        /**
         * 現在の表示フレームの（時間）属性キーを返す
         * @method time
         * @param なし
         * @return {Object} 属性キーオブジェクト
         **/
        this.time = function() {
            return this._time;
        }
        
        this._setFrame = function(index) {
            //console.log("setFrame index="+index);
            if ( !this._frame || !this._frame.length ) {
                this._time = undefined;
                this._current = -1;
                return false;
            }
            if ( index < 0 )
                index = 0;
            if ( index >= this._frame.length )
                index = this._frame.length-1;
            if ( this._current != index ) {
                this._current = index;
                this._time = this._frame[index];
                //console.log("index="+index+" time="+JSON.stringify(this._frame[index]));
                if ( this._layer ) {
                    for ( var i = 0 ; i < this._layer.length ; i++ ) {
                        this._layer[i].set(this._frame[index]);
                    }
                }
                if ( this._controller ) {
                    this._controller.setDisplayTime(this._frame[index].validtime);
                }
                return true;
            }
            return false;
        }
        
        this._go = function(time) {
            if ( !this._running )
                return;
            if ( this._next_time <= time ) {
                //console.log("time:"+time+" next:"+this._next_time);
                if ( WRAP.Geo.upper_layers_updating ) {
                    //console.log("waiting...");
                    WRAP.Geo.drawTiles();
                    return;
                }
                this._next_time = time + this._interval;
                if ( this._setFrame(this._current+1) ) {
                    if ( this._cb )
                        this._cb(this._time);
                }
                if ( this._current >= this._frame.length-1 )
                    this.stop();
            }
        }
    },
    

    Context: function(map) {
        this.revision = 0;
        this.tiles = [];
        
        this.setTileBand = function(zoom, min_tile_x, max_tile_x, min_tile_y, max_tile_y) {
            if ( this.zoom == zoom
             && this.min_tile_x == min_tile_x && this.max_tile_x == max_tile_x
             && this.min_tile_y == min_tile_y && this.max_tile_y == max_tile_y )
                return;
            this.zoom = zoom;
            this.tile_band = Math.pow(2,zoom);
            this.canvas_band = this.tile_band*256;
            this.min_tile_x = min_tile_x;
            this.max_tile_x = max_tile_x;
            this.min_tile_y = min_tile_y;
            this.max_tile_y = max_tile_y;
            this.offset_x = (this.min_tile_x-this.tile_band/2)*256;
            this.offset_y = (this.tile_band/2-1-this.max_tile_y)*256;
            
            if ( this.tiles.length ) {
                var bounds = {};
                bounds.n = this.tiles[0].bounds.north/60.0;
                bounds.s = this.tiles[0].bounds.south/60.0;
                for ( var i = 1 ; i < this.tiles.length ; i++ ) {
                    if ( bounds.n < this.tiles[i].bounds.north/60.0 )
                        bounds.n = this.tiles[i].bounds.north/60.0;
                    if ( bounds.s > this.tiles[i].bounds.south/60.0 )
                        bounds.s = this.tiles[i].bounds.south/60.0;
                }
            }
            bounds.w = ((this.min_tile_x-this.tile_band/2)/this.tile_band)*360.0;
            bounds.e = ((this.max_tile_x+1-this.tile_band/2)/this.tile_band)*360.0;
            this.bounds = bounds;
//console.log("tile x="+min_tile_x+" - "+max_tile_x+" tile y="+min_tile_y+" - "+max_tile_y);
//console.log("this.offset_y="+this.offset_y);
            
            if ( !this.canvas ) {
                this.canvas = document.createElement("canvas");
                this.ctx = this.canvas.getContext('2d');
            }
            var tile_y = (this.max_tile_y-this.min_tile_y+1);
            var tile_x = (this.max_tile_x-this.min_tile_x+1);
            if ( this.max_tile_x < this.min_tile_x )
                tile_x = (this.tile_band-this.min_tile_x+this.max_tile_x+1);
            this.canvas.width = tile_x*256;
            this.canvas.height = tile_y*256;
            var z = zoom;
            for ( var yc = 0 ; yc < tile_y ; yc++ ) {
                var y = this.max_tile_y-yc;
                for ( var xc = 0 ; xc < tile_x ; xc++ ) {
                    var x = (this.min_tile_x+xc)%this.tile_band;
                    var tile = this.findTile(z, y, x);
                    if ( !tile ) {
//console.log("### tile not found");
                        continue;
                    }
                    tile.canvas = this.canvas;
                    tile.ctx = this.ctx;
                    tile.offset_x = xc*256;
                    tile.offset_y = yc*256;
                }
            }
        }
        
        this.lockTile = function() {
            for ( var i = 0 ; i < this.tiles.length ; i++ ) {
                this.tiles[i].locked = true;
            }
        }
        
        this.clearLockedTile = function() {
            for ( var i = this.tiles.length-1 ; i >= 0 ; i-- ) {
                if ( this.tiles[i].locked ) {
//console.log("delete tile z="+this.tiles[i].z+" y="+this.tiles[i].y+" x="+this.tiles[i].x);
                    this.tiles.splice(i, 1);
                }
            }
        }
        
        this.findTile = function(z, y, x) {
            for ( var i = 0 ; i < this.tiles.length ; i++ ) {
                var tile = this.tiles[i];
                if ( tile.z == z && tile.y == y && tile.x == x )
                    return tile;
            }
            return null;
        }
        
        this.addTile = function(type, z, y, x, cood, bounds) {
            this.revision++;
//console.log("add tile z="+z+" y="+y+" x="+x+" rev="+this.revision);
//            var canvas = document.createElement("canvas");
//            canvas.width = 256;
//            canvas.height = 256;
//            var ctx = canvas.getContext('2d');
            this.tiles.push({
                id: "M/"+z+"/"+y+"/"+x,
                type:type,
                z:z, y:y, x:x,
                cood:cood,
                bounds:bounds,
                            
//                canvas:canvas,
//                ctx:ctx
            });
        };
        
        this.tile = function(draw) {
            for ( var i = 0 ; i < this.tiles.length ; i++ ) {
                var tile = this.tiles[i];
                if ( !tile.valid )
                    draw(tile);
            }
        };
        
        this.drawImageData = function(point, imageData, width, height, offset_x, offset_y, rotation) {
            
            function _drawCanvas(ctx, canvas, ox, oy, width, height) {
                if ( rotation ) {
                    ctx.save();
                    ctx.translate(ox, oy);
                    ctx.rotate(rotation/180 * Math.PI);
                    ctx.drawImage(canvas, offset_x, offset_y, width, height);
                    ctx.restore();
                }
                else {
                    ctx.drawImage(canvas, ox+offset_x, oy+offset_y, width, height);
                }
            }
            
            function _makeCanvas(imageData) {
                var canvas = document.createElement("canvas");
                canvas.width = imageData.width;
                canvas.height = imageData.height;
                var c = canvas.getContext("2d");
                c.putImageData(imageData,0, 0);
                return canvas;
            }
            
            var ctx = this.ctx;
            var op = map.getScreenPoint(new WRAP.Geo.Point(0,0));
            var tpx = this.offset_x+op.x;
            var tpy = this.offset_y+op.y;
            
            var p = map.getScreenPoint(new WRAP.Geo.Point(point[1]*60.0, point[0]*60.0));
            var ox = p.x-tpx;
            var oy = p.y-tpy;
            
            var size = (width>height?width:height)*1.5;
            var sx = -size;
            var ex = this.canvas.width+size;
            var sy = -size;
            var ey = this.canvas.height+size;
            if ( oy < sy || ey < oy )
                return;
            var canvas = null;
            if ( sx <= ox && ox <= ex ) {
                if ( !canvas )
                    canvas = _makeCanvas(imageData);
                _drawCanvas(ctx, canvas, ox, oy, width, height);
            }
            var lox = ox - this.canvas_band;
            if ( sx <= lox && lox <= ex ) {
                if ( !canvas )
                    canvas = _makeCanvas(imageData);
                _drawCanvas(ctx, canvas, lox, oy, width, height);
            }
            var rox = ox + this.canvas_band;
            if ( sx <= rox && rox <= ex ) {
                if ( !canvas )
                    canvas = _makeCanvas(imageData);
                _drawCanvas(ctx, canvas, rox, oy, width, height);
            }
        };
        
        this.drawImage = function(point, url, width, height, offset_x, offset_y, rotation) {
            
            function _drawImage(ctx, ox, oy, width, height) {
                if ( rotation ) {
                    ctx.save();
                    ctx.translate(ox, oy);
                    ctx.rotate(rotation/180 * Math.PI);
                    ctx.drawImage(img, offset_x, offset_y, width, height);
                    ctx.restore();
                }
                else {
                    ctx.drawImage(img, ox+offset_x, oy+offset_y, width, height);
                }
            }
            
            var c = WRAP.Geo.imageCache[url];
            if ( c == undefined ) {
                c = WRAP.Geo.imageCache[url] = { loaded:false, image:new Image() };
                c.image.onload = function() {
                    c.loaded = true;
                    WRAP.Geo.invalidate();
                };
                c.image.src = url;
                return;
            }
            if ( c.loaded ) {
                var img = c.image;
                if ( width == 0 )
                    width = img.width;
                if ( height == 0 )
                    height = img.height;
                
                var ctx = this.ctx;
                var op = map.getScreenPoint(new WRAP.Geo.Point(0,0));
                var tpx = this.offset_x+op.x;
                var tpy = this.offset_y+op.y;
                
                var p = map.getScreenPoint(new WRAP.Geo.Point(point[1]*60.0, point[0]*60.0));
                var ox = p.x-tpx;
                var oy = p.y-tpy;
                
                var size = (width>height?width:height)*1.5;
                var sx = -size;
                var ex = this.canvas.width+size;
                var sy = -size;
                var ey = this.canvas.height+size;
                if ( oy < sy || ey < oy )
                    return;
                if ( sx <= ox && ox <= ex )
                    _drawImage(ctx, ox, oy, width, height);
                var lox = ox - this.canvas_band;
                if ( sx <= lox && lox <= ex )
                    _drawImage(ctx, lox, oy, width, height);
                var rox = ox + this.canvas_band;
                if ( sx <= rox && rox <= ex )
                    _drawImage(ctx, rox, oy, width, height);
            }
        };

        this.hit = function(x, y, id) {
            if ( !id )
                return false;
            
            var offset = WRAP.Geo.getScreenPoint(this.hitctx.anchor);
            x -= offset.x;
            y -= offset.y;
            
            var pd = this.hitctx.getImageData(x,y,1,1);
            if ( pd && pd.data ) {
                var draw_id = (pd.data[0]<<16) + (pd.data[1]<<8) + pd.data[2];
//console.log("r="+pd.data[0]+" g="+pd.data[1]+" b="+pd.data[2]+" id="+draw_id);
                return ( id == draw_id )
            }
            return false;
        }

        this._drawLines = function(lines, lineWidth, lineDash, strokeStyle, fillStyle, fillImage, option, id) {
            if ( id && (fillStyle || fillImage) ) {
                id = parseInt(id);
                var r = (id&0x00FF0000)>>16;
                var g = (id&0x0000FF00)>>8;
                var b = (id&0x000000FF);
                this.hitctx.fillStyle = "rgb("+r+","+g+","+b+")";
                this.hitctx.beginPath();
                for ( var j = 0 ; j < lines.length ; j++ ) {
                    var line = lines[j];
                    var x = line[0].x;
                    var y = line[0].y;
                    var i = 0;
                    this.hitctx.moveTo(x, y);
                    while ( ++i < lines[j].length ) {
                        x = line[i].x;
                        y = line[i].y;
                        this.hitctx.lineTo(x,y);
                    }
                }
                this.hitctx.closePath();
                this.hitctx.fill("evenodd");
            }
            
            var ctx = this.ctx;
            var op = map.getScreenPoint(new WRAP.Geo.Point(0,0));
            var cx = map.getSize().width/2;
            // adjust screen center 0,0 offset
            while ( op.x-cx >= this.canvas_band/2 )
                op.x -= this.canvas_band;
            while ( op.x-cx < -this.canvas_band/2 )
                op.x += this.canvas_band;
            var tpx = this.offset_x+op.x;
            var tpy = this.offset_y+op.y;
            var sy = 0;
            var ey = this.canvas.height;
            var sx = 0;
            var ex = this.canvas.width;
                  
            if ( option == 'cloud') {
                sy -= 10;
                ey += 10;
                sx -= 10;
                ex += 10;
            }

            var active_lines = [];
            if ( fillStyle ) {
                active_lines = lines;
            }
            else {
                for ( var j = 0 ; j < lines.length ; j++ ) {
                    var active = false;
                    var last = 15;
                    var i = -1;
                    while ( ++i < lines[j].length ) {
                        var current = 0;
                        var x = lines[j][i].x-tpx;
                        if ( x < sx )
                            current |= 1;
                        else if ( x > ex )
                            current |= 2;
                        var y = lines[j][i].y-tpy;
                        if ( y < sy )
                            current |= 4;
                        else if ( y > ey )
                            current |= 8;
                        if ( !(last|current) || !(last&current) ) {
                            active = true;
                            break;
                        }
                        last = current;
                    }
                    if ( active )
                      active_lines.push(lines[j]);
                }
            }
            if ( !active_lines.length )
                  return;
                  
            ctx.beginPath();
            for ( var j = 0 ; j < active_lines.length ; j++ ) {
                var line = active_lines[j];
                if ( option == 'cloud' || option == 'counter_cloud') {
                    var PI_DIV_3 = Math.PI/3;
                    if ( option == 'counter_cloud' )
                        PI_DIV_3 = -PI_DIV_3;
                    var COS_PI_DIV_3 = Math.cos(PI_DIV_3);
                    var SIN_PI_DIV_3 = Math.sin(PI_DIV_3);
                  
                    var tl = 10;
                    var x = line[0].x-tpx;
                    var y = line[0].y-tpy;
                    var i = 0;
                    ctx.moveTo(x, y);
                    var lx = x;
                    var ly = y;
                    var rl = tl;
                    while ( ++i < line.length ) {
                        var ex = line[i].x-tpx;
                        var ey = line[i].y-tpy;
                        var dx = ex-x;
                        var dy = ey-y;
                        var sl = Math.sqrt(dx*dx+dy*dy);
                        var l = sl;
                        var el = 0;
                        while (l >= rl) {
                            el += rl;
                            var r = el/sl;
                            var tx = x + dx*r;
                            var ty = y + dy*r;
                            var mx = tx-lx;
                            var my = ty-ly;
                            // rotate 60 deg
                            var cx = COS_PI_DIV_3 * mx - SIN_PI_DIV_3 * my + lx;
                            var cy = SIN_PI_DIV_3 * mx + COS_PI_DIV_3 * my + ly;
                            ctx.quadraticCurveTo(cx,cy, tx, ty);
                            //ctx.lineTo(cx,cy);
                            //ctx.lineTo(tx,ty);
                            lx = tx;
                            ly = ty;
                            l -= rl;
                            rl = tl;
                        }
                        rl -= l;
                        x = ex;
                        y = ey;
                    }
                    x = line[line.length-1].x-tpx;
                    y = line[line.length-1].y-tpy;
                    ctx.lineTo(x, y);
                }
                else {
                    var x = line[0].x-tpx;
                    var y = line[0].y-tpy;
                    var i = 0;
                    ctx.moveTo(x, y);
                    while ( ++i < active_lines[j].length ) {
                        x = line[i].x-tpx;
                        y = line[i].y-tpy;
                        ctx.lineTo(x,y);
                    }
                }
            }
            if ( fillStyle ) {
                ctx.closePath();
                ctx.fillStyle = fillStyle;
                ctx.fill("evenodd");
            }
            if ( fillImage ) {
                ctx.closePath();
                var ptn = ctx.createPattern(fillImage, "");
                ctx.fillStyle = ptn;
                ctx.fill("evenodd");
            }
            if ( strokeStyle ) {
                ctx.lineWidth = lineWidth||1;
                if ( lineDash )
                  ctx.setLineDash(lineDash);
                ctx.strokeStyle = strokeStyle;
                ctx.stroke();
                  
                if ( option == 'outset' || option == 'inset' ) {
                    ctx.beginPath();
                    for ( var j = 0 ; j < active_lines.length ; j++ ) {
                        var line = active_lines[j];
                        var PI_DIV_3 = Math.PI/3;
                        if ( option == 'inset' )
                            PI_DIV_3 = -PI_DIV_3;
                        var COS_PI_DIV_3 = Math.cos(PI_DIV_3);
                        var SIN_PI_DIV_3 = Math.sin(PI_DIV_3);

                        var tl = 10;
                        var x = line[0].x-tpx;
                        var y = line[0].y-tpy;
                        var i = 0;
                        var lx = x;
                        var ly = y;
                        var rl = tl;
                        while ( ++i < line.length ) {
                            var ex = line[i].x-tpx;
                            var ey = line[i].y-tpy;
                            var dx = ex-x;
                            var dy = ey-y;
                            var sl = Math.sqrt(dx*dx+dy*dy);
                            var l = sl;
                            var el = 0;
                            while (l >= rl) {
                                el += rl;
                                var r = el/sl;
                                var tx = x + dx*r;
                                var ty = y + dy*r;
                                var mx = tx-lx;
                                var my = ty-ly;
                                var hx = lx+0.5*(tx-lx);
                                var hy = ly+0.5*(ty-ly);
                                // rotate 60 deg
                                var cx = COS_PI_DIV_3 * mx - SIN_PI_DIV_3 * my + lx;
                                var cy = SIN_PI_DIV_3 * mx + COS_PI_DIV_3 * my + ly;
                                ctx.moveTo(cx,cy);
                                ctx.lineTo(hx,hy);
                                lx = tx;
                                ly = ty;
                                l -= rl;
                                rl = tl;
                            }
                            rl -= l;
                            x = ex;
                            y = ey;
                        }
                    }
                    ctx.stroke();
                }
                  
                if ( lineDash )
                    ctx.setLineDash([]);
            }
        };
        
        this._fragmentPath = function(path) {
            var fragments = [];
            for ( var i = 0 ; i < path.length ; i++ ) {
                var lat2 = path[i][1];
                var lon2 = path[i][0];
                if ( i > 0 ) {
                    var lat1 = path[i-1][1];
                    var lon1 = path[i-1][0];
                    var d_lon = lon2-lon1;
                    if ( d_lon < -180 ) {
                        d_lon += 360;
                        lon2 += 360;
                    }
                    else if ( d_lon >= 180 ) {
                        d_lon -= 360;
                        lon1 += 360;
                    }
                    var d = Math.abs(d_lon);
                    if ( d > 1.0 ) {
                        var line = new WRAP.Geo.GreatCircle(lat1, lon1, lat2, lon2);
                        var c_lat = lat1;
                        var c_lon = lon1;
                        fragments.push([c_lon, c_lat]);
                        var len = 0.0;
                        while ( len+1.0 < d ) {
                            len += 1.0;
                            var r = len/d;
                            var t = line.getPosition(r);
                            fragments.push([t.lon, t.lat]);
                            c_lat = t.lat;
                            c_lon = t.lon;
                        }
                    }
                    else {
                        fragments.push([lon1, lat1]);
                    }
                }
                fragments.push([lon2, lat2]);
            }
            return fragments;
        }
        
        this._addFragments = function(lines, fragments) {
            var line = WRAP.Geo.getScreenLine(fragments);
            for ( var i = 0 ; i < line.length ; i++ )
                lines.push(line[i]);
        }
        
        this._gcPos = function(lat, lon, angle, distance) {
            var dist = distance;
            var PI_MIN = 10800;
            var PI_MIN_1 = 9.259259e-5;
            var M_PI_2 = Math.PI/2;
            var M_1_PI = 1.0/Math.PI;
            
            /* MIN => RAD */
            function rad(min) {
                return min * Math.PI * PI_MIN_1;
            }
            
            /* RAD => MIN */
            function min(rad) {
                return rad * PI_MIN * M_1_PI;
            }
            
            var lat_min = lat*60.0;
            var lon_min = lon*60.0;

            var d_lon = 180.0-angle;
            
            /* course */
            var co_org = angle/180.0 * Math.PI;
            var cosb_ang = Math.cos(co_org);
            
            /* lat_dr */
            var a_arc = rad(dist);
            var c_arc = (0.5 - lat_min*PI_MIN_1) * Math.PI;
            var cosa_arc = Math.cos(a_arc);
            var cosc_arc = Math.cos(c_arc);
            var sina_arc = Math.sin(a_arc);
            var sinc_arc = Math.sin(c_arc);
            var cosb_arc = cosa_arc*cosc_arc+sina_arc*sinc_arc*cosb_ang;
            var b_arc;
            if ( cosb_arc > 1 )
                b_arc = 0;
            else if ( cosb_arc < -1 )
                b_arc = Math.PI;
            else
                b_arc = Math.acos(cosb_arc);
            
            var lat_dr = M_PI_2 - b_arc;
            lat_dr = min(lat_dr);
            /* lon_dr */
            var sinb_arc = Math.sin(b_arc);
            var cosa_ang = (cosa_arc*sinc_arc-sina_arc*cosc_arc*cosb_ang)/sinb_arc;
            var a_ang;
            if ( cosa_ang > 1 )
                a_ang = 0;
            else if ( cosa_ang < -1 )
                a_ang = Math.PI;
            else
                a_ang = Math.acos(cosa_ang);
            
            var lon_dr;
            if ( d_lon > 0 )
                lon_dr = rad(lon_min)+a_ang;
            else
                lon_dr = rad(lon_min)-a_ang;
            lon_dr = min(lon_dr);
            if ( lon_dr > PI_MIN )
                lon_dr = - PI_MIN * 2 + lon_dr;
            else if ( lon_dr < -PI_MIN )
                lon_dr =  PI_MIN * 2 + lon_dr;
            return { lat:lat_dr/60.0, lon:lon_dr/60.0 };
        }
        
        this.drawPath = function(path, lineWidth, lineDash, strokeStyle, fillStyle, fillImage, option, geodesic, id) {
            var c = {};
            if ( fillImage ) {
                var url = fillImage;
                c = WRAP.Geo.imageCache[url];
                if ( c == undefined ) {
                    c = WRAP.Geo.imageCache[url] = { loaded:false, image:new Image() };
                    c.image.onload = function() {
                        c.loaded = true;
                        WRAP.Geo.invalidate();
                    };
                    c.image.src = url;
                    return;
                }
            }
            if ( !fillImage || c.loaded ) {
                var lines = [];
                if ( Array.isArray(path[0][0]) ) {
                    for ( var i = 0 ; i < path.length ; i++ ) {
                        if ( path[i].length < 2 )
                            continue;
                        var fragments = path[i];
                        if ( geodesic )
                            fragments = this._fragmentPath(path[i]);
                        this._addFragments(lines, fragments);
                    }
                    if ( !lines.length )
                        return;
                }
                else {
                    if ( path.length < 2 )
                        return;
                    var fragments = path;
                    if ( geodesic )
                        fragments = this._fragmentPath(path);
                    this._addFragments(lines, fragments);
                }
                this._drawLines(lines, lineWidth, lineDash, strokeStyle, fillStyle, c.image, option, id);
            }
        };
        
        this.drawArc = function(point, radius, start, end, lineWidth, strokeStyle, fillStyle, fillImage, id) {
            var c = {};
            if ( fillImage ) {
                var url = fillImage;
                c = WRAP.Geo.imageCache[url];
                if ( c == undefined ) {
                    c = WRAP.Geo.imageCache[url] = { loaded:false, image:new Image() };
                    c.image.onload = function() {
                        c.loaded = true;
                        WRAP.Geo.invalidate();
                    };
                    c.image.src = url;
                    return;
                }
            }
            if ( !fillImage || c.loaded ) {
                var path = [];
                if ( start == end || Math.abs(end-start) > 360 ) {
                    start = 0;
                    end = 360;
                }
                var step = 1;
                if ( radius < 500000 )
                    step = 5;
                else if ( radius < 100000 )
                    step = 2;
                radius /= 1851.8518518518517;
                for ( var r = start ; r < end ; r+=step ) {
                    var pos = this._gcPos(point[1], point[0], r, radius);
                    path.push([pos.lon, pos.lat]);
                }
                var pos = this._gcPos(point[1], point[0], end, radius);
                path.push([pos.lon, pos.lat]);
                
                //for ( var i = 0 ; i < path.length ; i++ )
                //    console.log("path["+i+"]="+path[i][1]+","+path[i][0]);
                
                var lines = [];
                if ( path.length < 2 )
                    return;
                var fragments = this._fragmentPath(path);
                this._addFragments(lines, fragments);
                this._drawLines(lines, lineWidth, null, strokeStyle, fillStyle, c.image, null, id);
            }
        };
        
        this.drawPoint = function(point, size, lineWidth, strokeStyle, fillStyle) {
            
            function _drawPoint(ctx, ox, oy) {
                if ( fillStyle ) {
                    ctx.fillStyle = fillStyle;
                    ctx.beginPath();
                    ctx.arc(ox, oy, size/2-1, 0, Math.PI*2,true);
                    ctx.closePath();
                    ctx.fill();
                }
                if ( strokeStyle ) {
                    ctx.strokeStyle = strokeStyle;
                    ctx.lineWidth = lineWidth||1;
                    ctx.beginPath();
                    ctx.arc(ox, oy, size/2-1, 0, Math.PI*2,true);
                    ctx.closePath();
                    ctx.stroke();
                }
            }
            
            var p = map.getScreenPoint(new WRAP.Geo.Point(point[1]*60.0, point[0]*60.0));
            
            var ctx = this.ctx;
            var op = map.getScreenPoint(new WRAP.Geo.Point(0,0));
            var tpx = this.offset_x+op.x;
            var tpy = this.offset_y+op.y;
            var ox = p.x-tpx;
            var oy = p.y-tpy;
            
            var sx = -size;
            var ex = this.canvas.width+size;
            var sy = -size;
            var ey = this.canvas.height+size;
            if ( oy < sy || ey < oy )
                return;
            if ( sx <= ox && ox <= ex ) {
                _drawPoint(ctx, ox, oy);
            }
            var lox = ox - this.canvas_band;
            if ( sx <= lox && lox <= ex ) {
                _drawPoint(ctx, lox, oy);
            }
            var rox = ox + this.canvas_band;
            if ( sx <= rox && rox <= ex ) {
                _drawPoint(ctx, rox, oy);
            }
        };
        
        this.drawLine = function(point, path, lineWidth, lineDash, strokeStyle, fillStyle, fillImage, option, rotation, id) {
            
            function setLine(lines, path, band) {
                if ( path.length < 2 )
                    return;
                var line = [];
                var min, max;
                for ( var i = 0 ; i < path.length ; i++ ) {
                    var x = path[i][0];
                    var y = path[i][1];
                    if ( rotation ) {
                        var tx = x*cosr-y*sinr;
                        var ty = x*sinr+y*cosr;
                        x = tx, y = ty;
                    }
                    x += p.x;
                    y += p.y;
                    if ( i == 0 ) {
                        min = max = x;
                    }
                    else {
                        if ( min > x )
                            min = x;
                        if ( max < x )
                            max = x;
                    }
                    line.push(new WRAP.Geo.ScreenPoint(x, y));
                }
                lines.push(line);
                var lx = c.x-band/2, llx = lx-band;
                var rx = c.x+band/2, rrx = rx+band;
                //console.log("llx="+llx+" lx="+lx+" rx="+rx+" rrx="+rrx);
                //console.log(" min="+min+" max="+max+" band="+band);
                if ( min < lx && max > llx ) {
                    var nl = [];
                    for ( var i = 0 ; i < line.length ; i++ )
                        nl.push(new WRAP.Geo.ScreenPoint(line[i].x+band, line[i].y));
                    lines.push(nl);
                    //console.log("-band");
                }
                if ( min < rrx && max > rx ) {
                    var nl = [];
                    for ( var i = 0 ; i < line.length ; i++ )
                        nl.push(new WRAP.Geo.ScreenPoint(line[i].x-band, line[i].y));
                    lines.push(nl);
                    //console.log("+band");
                }
            }
            
            var c = {};
            if ( fillImage ) {
                var url = fillImage;
                c = WRAP.Geo.imageCache[url];
                if ( c == undefined ) {
                    c = WRAP.Geo.imageCache[url] = { loaded:false, image:new Image() };
                    c.image.onload = function() {
                        c.loaded = true;
                        WRAP.Geo.invalidate();
                    };
                    c.image.src = url;
                    return;
                }
            }
            if ( !fillImage || c.loaded ) {
                // get -180-180 normalized 0 offset
                var c = map.getScreenPoint(new WRAP.Geo.Point(0,0));
                var cx = map.getSize().width/2;
                while ( c.x - cx >= this.canvas_band/2 )
                    c.x -= this.canvas_band;
                while ( c.x - cx < -this.canvas_band/2 )
                    c.x += this.canvas_band;
                // noemalize base point offet
                var p = map.getScreenPoint(new WRAP.Geo.Point(point[1]*60.0, point[0]*60.0));
                while ( p.x-c.x > this.offset_x+this.canvas_band )
                    p.x -= this.canvas_band;
                while ( p.x-c.x < this.offset_x )
                    p.x += this.canvas_band;
                var cosr, sinr;
                if ( rotation ) {
                    cosr = Math.cos(Math.PI*rotation/180.0);
                    sinr = Math.sin(Math.PI*rotation/180.0);
                }
                var lines = [];
                
                if ( Array.isArray(path[0][0]) ) {
                    for ( var i = 0 ; i < path.length ; i++ )
                        setLine(lines, path[i], this.canvas_band);
                }
                else {
                    setLine(lines, path, this.canvas_band);
                }
                if ( !lines.length )
                    return;
                this._drawLines(lines, lineWidth, lineDash, strokeStyle, fillStyle, c.image, option, id);
            }
        };
            
        this.drawText = function(point, text, fontSize, fillStyle, strokeStyle, offset_x, offset_y, align, rotation) {
            
            function _drawText(ctx, x, y, ox, oy) {
                if ( rotation ) {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(rotation/180 * Math.PI);
                    ctx.translate(ox, oy);
                    if ( strokeStyle ) {
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = strokeStyle;
                        ctx.strokeText(text, 0, 0);
                    }
                    ctx.fillText(text, 0, 0);
                    ctx.restore();
                }
                else {
                    if ( strokeStyle ) {
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = strokeStyle;
                        ctx.strokeText(text, x+ox, y+oy);
                    }
                    ctx.fillText(text, x+ox, y+oy);
                }
            }
            
            var ctx = this.ctx;
            if ( fontSize )
                ctx.font = fontSize + "px Arial";
            if ( fillStyle )
                ctx.fillStyle = fillStyle;
            var ox = parseFloat(offset_x) || 0;
            var oy = parseFloat(offset_y) || 0;
            var a = ctx.measureText(text);
            if ( align == 'left' )
                ox += 0;
            else if ( align == 'right')
                ox -= a.width;
            else
                ox -= a.width*0.5;

            var op = map.getScreenPoint(new WRAP.Geo.Point(0,0));
            var tpx = this.offset_x+op.x;
            var tpy = this.offset_y+op.y;
            
            var p = map.getScreenPoint(new WRAP.Geo.Point(point[1]*60.0, point[0]*60.0));
            var x = p.x-tpx;
            var y = p.y-tpy;
            
            var size = a.width;
            var sx = -size;
            var ex = this.canvas.width+size;
            var sy = -size;
            var ey = this.canvas.height+size;
            if ( y < sy || ey <= y )
                return;
            if ( sx <= x && x <= ex ) {
                _drawText(ctx, x, y, ox, oy);
            }
            var lx = x - this.canvas_band;
            if ( sx <= lx && lx <= ex ) {
                _drawText(ctx, lx, y, ox, oy);
            }
            var rx = x + this.canvas_band;
            if ( sx <= rx && rx <= ex ) {
                _drawText(ctx, rx, y, ox, oy);
            }
            
        };
        
        this.drawTile = function(tile, imageData) {
            this.tile(function(draw_tile) {
                if ( draw_tile.id == tile.id ) {
                    var canvas = document.createElement("canvas");
                    canvas.width = 256;
                    canvas.height = 256;
                    var ctx = canvas.getContext("2d");
                    ctx.putImageData(imageData, 0, 0, 0, 0, 256, 256);
                    ctx.fillStyle = "rgba(0,0,0,0.0)";
                    ctx.fillRect(0,0,1,1);  // Webkit Bug 対策 （本コードを入れないと putImageDataが実行されないことがある）
                    draw_tile.ctx.drawImage(canvas, draw_tile.offset_x, draw_tile.offset_y);
                }
            });
        };
        
        this.begin = function(revision) {
            if ( !this.hitcvs ) {
                this.hitcvs = document.createElement("canvas");
                this.hitctx = this.hitcvs.getContext("2d");
            }
            var size = map.getSize();
            if ( this.hitcvs.width != size.width || this.hitcvs.width != size.width) {
                this.hitcvs.width = size.width;
                this.hitcvs.height = size.height;
            }
            this.hitctx.anchor = WRAP.Geo.getPoint(new WRAP.Geo.ScreenPoint(0,0));
            this.hitctx.clearRect(0,0,size.width,size.height);

            if ( !this.ctx )
                return;
            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

            for ( var i = 0 ; i < this.tiles.length ; i++ ) {
                var tile = this.tiles[i];
                if ( tile.revision != revision ) {
                    tile.valid = false;
//                    tile.ctx.clearRect(0,0,256,256);
                }
            }
        };
        
        this.end = function(revision) {
            this.rev++;
            for ( var i = 0 ; i < this.tiles.length ; i++ ) {
                var tile = this.tiles[i];
                tile.context_rev = this.rev;
                if ( tile.revision != revision ) {
                    tile.revision = revision;
                    tile.valid = true;
                }
                map.setTile(tile, revision);
            }
            map.update();
        };
        
        
        this.rev = 0;
    },
    
    GreatCircle: function(lat1, lon1, lat2, lon2) {
        this.p1 = [];
        this.p2 = [];
        this.omeda = 0;
        this.heading = 0;
        this.neg = false;
        
        if ( lon2 < lon1 ) {
            this.neg = true;
            var t;
            t = lon1;
            lon1 = lon2;
            lon2 = t;
            t = lat1;
            lat1 = lat2;
            lat2 = t;
        }
        this.offset = lon1;
        lon1 = 0;
        lon2 = lon2-this.offset;
        
        lat1 *= Math.PI/180;
        lon1 *= Math.PI/180;
        lat2 *= Math.PI/180;
        lon2 *= Math.PI/180;
        
        this.p1[0] = Math.cos(lat1) * Math.cos(lon1);
        this.p1[1] = Math.cos(lat1) * Math.sin(lon1);
        this.p1[2] = Math.sin(lat1);
        this.p2[0] = Math.cos(lat2) * Math.cos(lon2);
        this.p2[1] = Math.cos(lat2) * Math.sin(lon2);
        this.p2[2] = Math.sin(lat2);
        
        this.omega = Math.acos(this.p1[0]*this.p2[0]+this.p1[1]*this.p2[1]+this.p1[2]*this.p2[2]);
        this.sinomega = Math.sin(this.omega);
        var denom = Math.cos(lat1)*this.simomega;
        if ( Math.abs( denom ) > 0.001 ) {
            var a = (Math.sin(lat2) - Math.sin(lat1) * Math.cos(this.omega)) / denom;
            if( a < -1.0 ) a = -1.0;
            if( a > 1.0 ) a = 1.0;
            this.heading = Math.acos(a);
            
            var dlon = lon2 - lon1;
            while( dlon < -Math.PI ) dlon += Math.PI*2;
            while( dlon > Math.PI ) dlon -= Math.PI*2;
            
            if( dlon < 0 )
                this.heading = Math.PI*2 - this.heading;
        }
        else
            this.heading = 0.0;
    
        this.getDistance = function() {
            var rEarth = 3443.96;			// nm Radius of Earth at equator
            return this.omega*rEarth;
        }
        
//        this.getHeading = function() {
//            return this.heading * (180.0 / Math.PI);
//        }
        
        this.getPosition = function(t) {
            if ( this.neg )
                t = 1.0 - t;
            
            // SLERP r as p1 * (1-t) + p2 * t
            var ratio1 = Math.sin((1.0-t) * this.omega)/this.sinomega;
            var ratio2 = Math.sin(t * this.omega)/this.sinomega;
            
            var r = [];
            r[0] = this.p1[0]*ratio1+this.p2[0]*ratio2;
            r[1] = this.p1[1]*ratio1+this.p2[1]*ratio2;
            r[2] = this.p1[2]*ratio1+this.p2[2]*ratio2;
            
            // compute position in polar co-ordinates
            var lon = Math.atan2(r[1], r[0])*(180.0/Math.PI);
            var lat = Math.asin(r[2])*(180.0/Math.PI);
            
            lon += this.offset;
            return { lat:lat, lon:lon };
        }
    },
    
    // Name Space
    Bridge: {},
    
    Renderer: {},
    
    Interaction: { mouseover:[], mouseout:[], touch:[], boundsChange:[], visibilityChange:[] },
    
    // Internal
    timer:null,
    
    rendering:false,
    
    redrawQueue: [],
    
    valid: true,
    
    redraw: function (layer) {
        if ( this.redrawQueue.indexOf(layer) < 0 ) {
            this.redrawQueue.push(layer);
        }
    },
    
    render: function() {
        var self = this;
        self.valid = false;
        
        if ( !this.timer) {
            this.timer = setInterval(function() {
                if ( self.redrawQueue.length ) {
    //console.log("redraw queue="+self.redrawQueue.length);
                    var layer;
                    while ( (layer = self.redrawQueue.shift()) ) {
                        if ( layer.visible() ) {
                            layer.render();
                        }
                    }
                }
                else if (!self.valid ) {
                    var context = self.map.context;
                    if ( !context.tiles.length )
                        return;
                    var u = self.container.upper_layers;
                    if ( !u || !u.length )
                        return;
                    if ( self.rendering )
                        return;
                    self.rendering = true;
                    
                    // merge layer dl
                    for ( var j = u.length-1 ; j >= 0 ; j-- ) {
                        var layer = u[j];
                        if ( layer.visible() && layer.merged && layer.merged.length )
                            layer._merged_dl = layer.renderMerge(self.revision);
                    }
                    var dl = [];
                    for ( var j = u.length-1 ; j >= 0 ; j-- ) {
                        var layer = u[j];
                        if ( layer.visible() ) {
                            if ( layer._merged_dl )
                                dl.push(layer._merged_dl);
                            else if ( layer._merged_revision != self.revision )
                                dl.push(layer._dl);
                        }
                    }
                    // clear merged layer dl
                    for ( var j = u.length-1 ; j >= 0 ; j-- ) {
                        var layer = u[j];
                        layer._merged_dl = null;
                    }
                                     
                    context.begin(self.revision);
                    var hittest_id = 1000;
                    for ( var i = 0 ; i < dl.length ; i++ ) {
                        var f = dl[i];
                        var l = f.length;
                        for ( var j = 0 ; j < l ; j++ ) {
                            f[j].id = hittest_id++;
                            f[j].draw(context);
                        }
                    }
                    self.valid = true;
                    context.end(self.revision);
                    self.rendering = false;
                                     
                    if ( self.lastX !== undefined ) {   // avoid to scroll on the new draggable feature
                        var hit = self.hit(new WRAP.Geo.ScreenPoint(self.lastX, self.lastY));
                        if ( !self.lastHit || hit.feature != self.lastHit.feature ) {
                            if ( hit.feature && hit.feature.draggable ) {
                                WRAP.Geo.enableScroll(false);
                            }
                            self.lastHit = hit;
                        }
                    }
                }
                                     
            }, 20);
        }
    },
    
    invalidate: function() {
        this.revision++;
        this.render();
    },
    
    lastZoom: -1,
    
    lastContext: -1,
    
    updateBounds: function(bounds /*, changing*/) {
//console.log("bounds changed n="+(bounds.north/60)+" s="+(bounds.south/60)+" e="+(bounds.east/60)+" w="+(bounds.west/60));
        if ( WRAP.Geo.Interaction ) {
            WRAP.Geo.lastHit = null;
            WRAP.Geo.Interaction.clearTooltip();
        }
        
        var handler = WRAP.Geo.Interaction.boundsChange;
        if ( handler ) {
            for ( var i = 0 ; i < handler.length ; i++ )
                handler[i](bounds);
        }
        
//        if ( !changing ) {
//            if ( this.lastContext != this.map.context.revision ) {
                this.lastContext = this.map.context.revision;
                var u = WRAP.Geo.container.upper_layers;
                if ( !u || !u.length )
                    return;
                for ( var j = u.length-1 ; j >= 0 ; j-- ) {
                    u[j].render();
                }
//                this.render();
//            }
//        }
    },
    
    hit: function(point) {
        var context = this.map.context;
        if ( this.container && this.container.upper_layers ) {
            for ( var i = 0 ; i < this.container.upper_layers.length ; i++ ) {
                var l = this.container.upper_layers[i];
                if ( l.visible() ) {
                    for ( var j = l._dl.length-1 ; j >= 0  ; j-- ) {
                        var f = l._dl[j];
                        var h = f.hit(point.x, point.y, context);
                        if ( h ) {
                            return { layer:l, feature:f, x:h.x, y:h.y, pixel:h.pixel };
                        }
                    }
                }
            }
        }
        return {layer:null, geo:null};
    },
    
    addAnimation: function(a) {
        var self = this;
        this.animations.push(a);
        
        var current = new Date();
        if ( !this.animation_timer ) {
            this.animation_start = current;
            this.animation_timer = setInterval(function() {
                var current = new Date();
                var elapsed = (current-self.animation_start)/1000;
                for ( var i = 0 ; i < self.animations.length ; i++ )
                    self.animations[i]._go(elapsed);
            }, 15);
        }
        return (current - this.animation_start)/1000;
    },
    
    removeAnimation: function(a) {
        var index = this.animations.indexOf(a);
        if ( index >= 0 )
            this.animations.splice(index,1);
        
        if ( !this.animations.length && this.animation_timer ) {
            clearInterval(this.animation_timer);
            this.animation_timer = null;
            this.animation_start = null;
        }
    },
    
    /**
     * 時間管理クラス
     * 現在の表示時間を管理し、時間構造から対応する適切なデータ時間を決定する
     *
     * @class Geo.TimeController
     * @constructor
     * @param なし
     **/
    TimeController: function() {
        this._layers = [];
        var self = this;
        /**
         * 現在の表示時間を設定する
         * @method setDisplayTime
         * @param  {WRAP.Core.DateTime} time 時間
         * @return  なし
         **/
        this.setDisplayTime = function(time) {
            self._current_time = time;
            for ( var i = 0 ; i < self._layers.length ; i++ ) {
                var layer = self._layers[i];
                var content = layer.get();
                if ( content ) {
                    layer.set(content);
                }
            }
        }
        
        /**
         * 現在の表示時間を返す
         * @method displayTime
         * @param  なし
         * @return {WRAP.Core.DateTime} 時間
         **/
        this.displayTime = function() {
            return self._current_time;
        }

        /**
         * 時間管理を行うレイヤーを登録する
         * 登録されたレイヤーに対する、時間設定（set）は TimeControllerが実行する
         * @method addLayer
         * @param  {WRAP.Geo.Layer} layer レイヤー
         * @return {Object} なし
         **/
        this.addLayer = function(layer) {
            if ( self._layers.indexOf(layer) < 0 ) {
                layer.setTimeController(this);
                self._layers.push(layer);
            }
            this.setDisplayTime(self._current_time);
        }

        /**
         * レイヤーを時間管理対象から削除する
         * @method removeLayer
         * @param  {WRAP.Geo.Layer} layer レイヤー
         * @return {Object} なし
         **/
        this.removeLayer = function(layer) {
            var index = self._layers.indexOf(layer);
            if ( indexOf >= 0 ) {
                self._layers[index].setTimeController(null);
                self._layers.splice(index, 1);
            }
        }
        
        this.validate = function(layer, content) {
            //console.log("validate:"+layer.name());
            if ( !content )
                return false;
            if ( self._current_time && layer._data ) {
                
                if ( layer._data.validator ) // custom content validator
                    return (layer._data.validator(self._current_time, layer._data, content));
                
                var validtime;
                var timelist = layer._data.query("timelist").value();
                if ( timelist && content.basetime ) {
                    for ( var i = 0 ; i < timelist.length ; i++ ) {
                        if ( timelist[i].basetime == content.basetime ) {
                            validtime = timelist[i].validtime;
                            //console.log("basetime:"+content.basetime);
                            break;
                        }
                    }
                }
                else {
                    validtime = layer._data.query("validtime").value();
                    //console.log("validtime list ="+(validtime?validtime.length:"---"));
                }
                if ( validtime ) {
                    validtime = validtime.concat();
                    validtime.sort(
                        function(a,b){
                            if( a < b ) return -1;
                            if( a > b ) return 1;
                            return 0;
                    });
                    var dt = WRAP.DH._time(self._current_time);
                    var diff = 24*3600;
                    for ( var i = 0 ; i < validtime.length ; i++ ) {
                        var vt = WRAP.DH._time(validtime[i]);
                        var nt = (i<validtime.length-1)?WRAP.DH._time(validtime[i+1]):WRAP.DH._setTime(vt,diff);
                        if ( vt <= dt && dt < nt ) {
                            content.validtime = WRAP.DH._timeString(vt);
                            //console.log("validtime ="+content.validtime);
                            return true;
                        }
                        diff = WRAP.DH._elapsed(vt, nt);
                    }
                }
            }
            //console.log("validtime not found");
            content.validtime = null;
            return false;
        }
    },

    parseColor: function(color) {
        var tcv = document.createElement('canvas');
        tcv.width = 1, tcv.height = 1;
        var tcx = tcv.getContext('2d');
        tcx.fillStyle = color;
        tcx.fillRect(0,0,1,1);
        return tcx.getImageData(0,0,1,1).data;
    },
    
    enableScroll: function(enable) {
        if ( this.map.enableScroll )
            this.map.enableScroll(enable);
    },
    
    // Internal Debug function
    _tileCheck: function(context, dl) {
        for ( var i = 0 ; i < context.tiles.length ; i++ ) {
            var tile = context.tiles[i];
            var center = (128*256+128)*2;
            var lat = tile.cood[center];
            var lon = tile.cood[center+1];
            var feature;
            feature = new WRAP.Geo.Feature.Text({
                point:[lon, lat],
                text:tile.id,
                fontSize:14,
                fillStyle:'rgb(255,0,0)',
                offsetX:0,
                offsetY:0,
                align:'center'
            });
            dl.push(feature);
            feature = new WRAP.Geo.Feature.Text({
                point:[lon, lat],
                text:"lat="+lat,
                fontSize:14,
                fillStyle:'rgb(0,0,200)',
                offsetX:-50,
                offsetY:-40,
                align:'left'
            });
            dl.push(feature);
            feature = new WRAP.Geo.Feature.Text({
                point:[lon, lat],
                text:"lon="+lon,
                fontSize:14,
                fillStyle:'rgb(0,0,200)',
                offsetX:-50,
                offsetY:-20,
                align:'left'
            });
            dl.push(feature);
            feature = new WRAP.Geo.Feature.Line({
                point:[lon, lat],
                line:[[-120,-120],[120,-120],[120,120],[-120,120],[-120,-120]],
                lineWidth:1,
                strokeStyle:'rgb(40,40,200)',
            });
            dl.push(feature);
            feature = new WRAP.Geo.Feature.Line({
                point:[lon, lat],
                line:[[-124,-124],[124,-124],[124,124],[-124,124],[-124,-124]],
                lineWidth:1,
                strokeStyle:'rgb(40,200,40)',
            });
            dl.push(feature);
        }
    },
    
    container: {},
        
    timer: null,
    
    animation_timer: null,
    
    animation_start: null,
        
    animations: [],
        
    revision: 1,
        
    tiles: [],
    
    imageCache: {},
    
    distance : function(lon0, lat0, lon1, lat1) {
        var long_r = 6378137.000;     // [m] long radius
        var short_r = 6356752.314245; // [m] short radius
        var rate = Math.sqrt((long_r * long_r - short_r * short_r)/(long_r * long_r));
        var a_e_2 = long_r * (1-rate * rate);  // a(1-e^2)
        
        lon0 = lon0 * Math.PI/180;  lat0 = lat0 * Math.PI/180;
        lon1 = lon1 * Math.PI/180;  lat1 = lat1 * Math.PI/180;
        var d_lon = lon1 - lon0;
        var d_lat = lat1 - lat0;
        var ave_lat = (lat1+lat0)/2;
        var Wx = Math.sqrt(1-rate * rate * Math.sin(ave_lat) * Math.sin(ave_lat));
        var Mx = a_e_2 /Wx/Wx/Wx;
        var Nx = long_r /Wx;
        var dum = (d_lat * Mx)*(d_lat * Mx) + (d_lon* Nx * Math.cos(ave_lat)) * (d_lon* Nx * Math.cos(ave_lat));
        return Math.sqrt(dum);
    },
    
    check: function() {
    }
    
}



WRAP.Geo.Interaction = (function () {

    var base_div;
                      
    var tooltip;
    var tooltip_z = 10000;
    var tooltip_bgcolor = '#2e3a54';
    var tooltip_fgcolor = '#ffffff';
    var tooltip_border = '#ffffff';
    var arrow_offset = 20;
                  
    var camera_window = [];
    var current_camera;
    var camera_ox = 10;
    var camera_oy = 10;
    var camera_z = 20000;
    var camera_w = 640;
    var camera_h = 480;
    var camera_s = 0.3;
    var camera_m = 0.6;
    var camera_header = 26;
    var camera_footer = 20;
    var camera_bgcolor = '#f2f2f2';
    var camera_border = 'rgba(150,150,150,0.6)';
    var camera_sw = Math.floor(camera_w*camera_s);
    var camera_sh = Math.floor(camera_h*camera_s);
    var camera_mw = Math.floor(camera_w*camera_m);
    var camera_mh = Math.floor(camera_h*camera_m);
/*
    function isNumber(x){
        if( typeof(x) != 'number' && typeof(x) != 'string' )
            return false;
        else
            return (x == parseFloat(x) && isFinite(x));
    }
                      
    function pointStr(lat, lon) {
        var s = {lat:"", lon:""};
        var lat_m = 'N';
        if ( lat < 0 ) {
            lat = -lat;
            lat_m = 'S';
        }
        var lon_m = 'E';
        if ( lon < 0 ) {
            lon = -lon;
            lon_m = 'W';
        }
        var deg, m, min;
        deg = Math.floor(lat/60);
        m = (lat-deg*60)*60;
        min = Math.floor(m);
        s.lat  += deg;
        s.lat += "°";
        s.lat += min;
        s.lat += "'";
        s.lat += lat_m;
        deg = Math.floor(lon/60);
        m = (lon-deg*60)*60;
        min = Math.floor(m);
        s.lon  += deg;
        s.lon += "°";
        s.lon += min;
        s.lon += "'";
        s.lon += lon_m;
        return s;
    }

    var d16 = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    for ( var i = 0 ; i < 16 ; i++ )
        d16[i] = d16[i].replace(/N/g, "北").replace(/S/g, "南").replace(/W/g, "西").replace(/E/g, "東");
                      
    function dirStr(dir) {
        if ( !isNumber(dir) )
            return "";
        dir += (360/16)/2;
        while ( dir < 0 )
            dir += 360;
        while ( dir >= 360 )
            dir -= 360;
        dir = Math.floor(dir/(360/16));
        return d16[dir];
    }
*/
    function mouseOverHandler(layer, data, point) {
        if ( !layer || !data || !data.value )
            return;
        var data = data&&data.value();
        if ( data ) {
            var content;
            if ( layer.name().indexOf("LiveCamera") == 0 ) {
                var cw
                if ( !(cw=findCameraWindow(data.area_name)) )
                    cw = new LiveCameraWindow(data);
                activateCameraWindow(cw);
                if ( current_camera != cw ) {
                    var last_camera = current_camera;
                    if ( current_camera && current_camera.tooltip )
                        current_camera.hide();
                    current_camera = cw;
                    if ( last_camera )
                        last_camera.set();
                    if ( !current_camera.visible ) {
                        current_camera.tooltip = true;
                        cw.show(data.lat, data.lon);
                    }
                    current_camera.set();
                }
            }
            else {
                if ( layer._tooltip_handler ) {
                  content = layer._tooltip_handler(data);
                }
            }
            if ( content && content.length ) {
                setTooltip(content);
                showTooltip(point.x,point.y);
                return;
            }
        }
        clearTooltip();
    }


    function mouseOutHandler(layer/*, data, point*/) {
        if ( !layer )
            return;
        clearTooltip();
        if ( layer.name().indexOf("LiveCamera") == 0 ) {
            if ( current_camera && current_camera.tooltip ) {
                current_camera.hide();
            }
            var last_camera = current_camera;
            current_camera = null;
            if ( last_camera )
                last_camera.set();
        }
    }
                      
    function touchHandler(layer, data/*, point*/) {
        if ( !layer )
            return;
        clearTooltip();
        if ( layer.name().indexOf("LiveCamera") == 0 ) {
            if ( current_camera && current_camera.tooltip ) {
                data.query("image").load(function() {
//                    console.log("loaded");
                });
                current_camera.tooltip = false;
                current_camera.set();
            }
        }
    }

    function boundsChangeHandler() {
        for ( var i = 0 ; i < camera_window.length ; i++ ) {
            var w = camera_window[i];
            if ( !w.pinned )
                continue;
            var sp = WRAP.Geo.getScreenPoint(w.window.point);
            sp.x += camera_ox;
            sp.y += camera_ox;
            w.window.style.left = sp.x + 'px';
            w.window.style.top = sp.y + 'px';
        }
    }
                      
    function visibilityChangeHandler(layer) {
        if ( layer.name().indexOf("LiveCamera") == 0 ) {
            for ( var i = 0 ; i < camera_window.length ; i++ ) {
                var w = camera_window[i];
                  if ( layer.visible()) {
                        w.window.style.display = w.visible?'block':'none';
                  }
                  else {
                        w.window.style.display = 'none';
                        w.setImage(0);
                  }
                  w.animating = false;
            }
            if ( WRAP.Geo.Interaction.live_camera._data.handler
             && (WRAP.Geo.Interaction.live_camera._data.handler.auto_update=layer.visible()) )
                WRAP.Geo.Interaction.live_camera.load();
        }
    }

    function setStyle(style) {
        var css = document.createElement('style');
        var text = document.createTextNode(style);
        css.media = 'screen';
        css.type = 'text/css';
        if ( css.styleSheet )
            css.styleSheet.cssText = text.nodeValue;
        else
            css.appendChild(text);
        document.getElementsByTagName('head')[0].appendChild(css);
    }
                      
    function initTooltip() {
        if ( !tooltip ) {
            tooltip = document.createElement('div');
            base_div.appendChild(tooltip);
            tooltip.style.display = 'block';
            tooltip.style.top = "-1000px";
            tooltip.style.left = "-1000px";
            
            var style = 
                ".tooltip {"+
                "position: absolute;"+
                "background: "+tooltip_bgcolor+";"+
                "color: "+tooltip_fgcolor+";"+
                "border: 1px solid "+tooltip_border+";"+
                "padding: 10px;"+
                "    border-radius: 6px;"+
                "    z-index: "+tooltip_z+";"+
                "    pointer-events: none;"+
                "}"+
                
                ".lt-arrow:after, .lt-arrow:before {"+
                "right: 100%;"+
                "top: "+arrow_offset+"px;"+
                "border: solid transparent;"+
                "content: ' ';"+
                "height: 0;"+
                "width: 0;"+
                "position: absolute;"+
                "}"+
                ".lt-arrow:after {"+
                "    border-right-color: "+tooltip_bgcolor+";"+
                "    border-width: 8px;"+
                "    margin-top: -8px;"+
                "}"+
                ".lt-arrow:before {"+
                "    border-right-color: "+tooltip_border+";"+
                "    border-width: 9px;"+
                "    margin-top: -9px;"+
                "}"+
                
                ".lb-arrow:after, .lb-arrow:before {"+
                "right: 100%;"+
                "bottom: "+arrow_offset+"px;"+
                "border: solid transparent;"+
                "content: ' ';"+
                "height: 0;"+
                "width: 0;"+
                "position: absolute;"+
                "}"+
                ".lb-arrow:after {"+
                "    border-right-color: "+tooltip_bgcolor+";"+
                "    border-width: 8px;"+
                "    margin-top: -8px;"+
                "}"+
                ".lb-arrow:before {"+
                "    border-right-color: "+tooltip_border+";"+
                "    border-width: 9px;"+
                "    margin-top: -9px;"+
                "}"+
                
                ".rt-arrow:after, .rt-arrow:before {"+
                "left: 100%;"+
                "top: "+arrow_offset+"px;"+
                "border: solid transparent;"+
                "content: ' ';"+
                "height: 0;"+
                "width: 0;"+
                "position: absolute;"+
                "}"+
                ".rt-arrow:after {"+
                "    border-left-color: "+tooltip_bgcolor+";"+
                "    border-width: 8px;"+
                "    margin-top: -8px;"+
                "}"+
                ".rt-arrow:before {"+
                "    border-left-color: "+tooltip_border+";"+
                "    border-width: 9px;"+
                "    margin-top: -9px;"+
                "}"+
                
                ".rb-arrow:after, .rb-arrow:before {"+
                "left: 100%;"+
                "bottom: "+arrow_offset+"px;"+
                "border: solid transparent;"+
                "content: ' ';"+
                "height: 0;"+
                "width: 0;"+
                "position: absolute;"+
                "}"+
                ".rb-arrow:after {"+
                "    border-left-color: "+tooltip_bgcolor+";"+
                "    border-width: 8px;"+
                "    margin-top: -8px;"+
                "}"+
                ".rb-arrow:before {"+
                "    border-left-color: "+tooltip_border+";"+
                "    border-width: 9px;"+
                "    margin-top: -9px;"+
                "}";
            
            setStyle(style);
        }
    }

    function setTooltip(html) {
        if ( !tooltip )
            return;
        tooltip.innerHTML = html;
    }

    function clearTooltip() {
        if ( !tooltip )
            return;
        tooltip.style.display = 'none';
        tooltip.innerHTML = "";
    }
                        
    function getTooltip() {
        if ( tooltip.style.display == 'block' ) {
            return tooltip.innerHTML;
        }
        return null;
    }

    function showTooltip(x, y) {
        if ( !tooltip || !tooltip.innerHTML )
            return;
        var pw = tooltip.parentNode.clientWidth;
        var ph = tooltip.parentNode.clientHeight;
        if ( x < 0 || x >= pw || y < 0 || y >= ph ) {
            tooltip.style.display = 'none';
            return;
        }
        tooltip.style.display = 'block';
        var tw = tooltip.clientWidth;
        var th = tooltip.clientHeight;
                      
        if ( tw >= pw )
            tw = 0;
        
        var ox = 26, oy = 14, ay = oy+arrow_offset;
        var xm , ym;
                      
        if ( x+tw+ox*2 >= pw ) {
            x -= (tw+ox);
            xm = ' r';
        }
        else {
            x += ox;
            xm = ' l';
        }
        
        if ( y < ay ) {
            y = oy;
        }
        else if ( y >= ph-oy-arrow_offset ) {
            y = ph-oy-th;
        }
        else if ( y+th-arrow_offset >= ph-ay ) {
            y -= th-arrow_offset-2;
            if ( y > oy )
                ym = 'b-arrow'
            else
                y = oy;
        }
        else {
            y -= arrow_offset;
            if ( y > oy )
                ym = 't-arrow'
            else
                y = oy;
        }
        var c = 'tooltip';
        if ( xm && ym )
            c += (xm+ym);
        tooltip.style.top = "" + y + "px";
        tooltip.style.left = "" + x + "px";
        tooltip.setAttribute('class', c);
    }

    //function hideTooltip() {
    //    if ( !tooltip )
    //        return;
    //    tooltip.style.display = 'none';
    //}
        
    function initLiveCamera(data) {
        if ( !data )
            return;
        WRAP.Geo.Interaction.live_camera = data;
        var style =
            ".smooth_tran {"+
            "-webkit-transition-duration : 0.2s;"+
            "-moz-transition-duration : 0.2s;"+
            "-o-transition-duration : 0.2s;"+
            "-ms-transition-duration : 0.2s;"+
            "}"+
            ".current_window {"+
            "box-shadow : 0px 0px 50px #fff;"+
            "border: 1px solid #fff;"+
            "}"+
            ".live_camera {"+
            "position: absolute;"+
            "background-color: "+camera_bgcolor+";"+
            "border: 1px solid "+camera_border+";"+
            "user-select: none;"+
            "-webkit-user-select: none;"+
            "-moz-user-select: none;"+
            "-ms-user-select: none;"+
            "}"+
            ".small_window {"+
            "width: "+(camera_sw)+"px;"+
            "height: "+(camera_sh+camera_header)+"px;"+
            "}"+
            ".middle_window {"+
            "width: "+(camera_mw)+"px;"+
            "height: "+(camera_mh+camera_header+camera_footer)+"px;"+
            "}"+
            ".image_s {"+
            "position: absolute;"+
            "width: 100%;"+
            "height: "+camera_sh+"px;"+
            "top: "+camera_header+"px;"+
            "background-color: #bbb;"+
            "}"+
            ".image_m {"+
            "position: absolute;"+
            "width: 100%;"+
            "height: "+camera_mh+"px;"+
            "top: "+camera_header+"px;"+
            "background-color: #bbb;"+
            "}"+
            ".camera_button {"+
            "position: absolute;"+
            "width:20px;"+
            "height:20px;"+
            "padding:0;"+
            "border:solid 1px rgba(0,0,0,0);"+
            "border-radius:4px;"+
            "cursor:pointer;"+
            "user-select: none;"+
            "-webkit-user-select: none;"+
            "-moz-user-select: none;"+
            "-ms-user-select: none;"+
            "}"+
            ".camera_button:hover {"+
            "border:solid 1px rgba(150,150,150,0.8);"+
            "}"+
            ".camera_zoomin {"+
            "top:3px; right:28px;"+
            "background:url(img/bt_zoomIn.png) no-repeat left top;"+
            "}"+
            ".camera_zoomout {"+
            "top:3px; right:28px;"+
            "background:url(img/bt_zoomOut.png) no-repeat left top;"+
            "}"+
            ".camera_close {"+
            "top:3px; right:4px;"+
            "background:url(img/closebtn.png) no-repeat left top;"+
            "}"+
            ".camera_text {"+
            "user-select: none;"+
            "-webkit-user-select: none;"+
            "-moz-user-select: none;"+
            "-ms-user-select: none;"+
            "cursor:default;"+
            "position: absolute;"+
            "font-size:11px;"+
            "color:black;"+
            "width:100px;"+
            "height:10px;"+
            "}"+
            ".camera_name {"+
            "top:0px; left:4px;"+
            "}"+
            ".camera_time {"+
            "top:11px; left:4px;"+
            "}"+
            ".camera_time_button {"+
            "font-size:10px;"+
            "color:black;"+
            "position: absolute;"+
            "bottom:"+(1)+"px;"+
            "width:32px;"+
            "height:18px;"+
            "padding:0;"+
            "vertical-align:middle;"+
            "border:solid 1px rgba(120,120,120,1.0);"+
            "border-radius:4px;"+
            "background-color: "+camera_bgcolor+";"+
            "cursor:pointer;"+
            "}"+
            ".camera_time_button:hover {"+
            "background: #fefeff;"+
            "}"+
            ".camera_time_button:disabled {"+
            "color:#999;"+
            "border:solid 1px rgba(170,170,170,0.8);"+
            "pointer-events: none;"+
            "cursor:default;"+
            "}";
                      
        setStyle(style);
                      
        data.inspect(function() {
            for ( var i = 0 ; i < camera_window.length ; i++ ) {
                var cw = camera_window[i];
                if ( cw.visible && !cw.animating && cw.index==0 )
                    cw.setImage(cw.index);
            }
        });
    }
         
    function findCameraWindow(name) {
        for ( var i = 0 ; i < camera_window.length ; i++ ) {
            if ( camera_window[i].camera.area_name == name )
                return camera_window[i];
        }
        return null;
    }
                      
    function activateCameraWindow(target) {
        var index = camera_z;
        var i = 0;
        while ( i < camera_window.length ) {
            var cw = camera_window[i];
            if ( cw == target ) {
                var j = i+1;
                while ( j < camera_window.length ) {
                    cw = (camera_window[j-1] = camera_window[j]);
                    cw.window.style["z-index"] = index++;
                    j++;
                }
                camera_window[j-1] = target;
                break;
            }
            else {
                cw.window.style["z-index"] = index++;
            }
            i++;
        }
        if ( i == camera_window.length )
            camera_window.push(target);
        target.window.style["z-index"] = index;
    }
                      
    var dragging;
    var drag_x, drag_y;
    var offset_x, offset_y;
                      
    function LiveCameraWindow(camera) {
        var self = this;
        this.camera = camera;
                      
        this.visible = false;
        this.small = true;
        this.pinned = true;
        this.tooltip = true;
        this.animating = false;
        this.smooth = false;
                      
        var w = this.window = document.createElement('div');
        w.controller = this;
        w.style.display = 'none';
        w.setAttribute('class', 'live_camera small_window');
                      
//      var c = this.canvas = document.createElement('canvas');
        var c = this.canvas = document.createElement('div');
        c.width = camera_w;
        c.height = camera_h;
        c.setAttribute('class', 'image_s');
        //var ctx = c.getContext('2d');
        //ctx.fillStyle = "black";
        //ctx.fillRect(0,0,c.width,c.height);
                      
        w.appendChild(this.name = document.createElement('div'));
        this.name.setAttribute('class', 'camera_text camera_name');
        w.appendChild(this.time = document.createElement('div'));
        this.time.setAttribute('class', 'camera_text camera_time');
        w.appendChild(this.zoom = document.createElement('button'));
        this.zoom.setAttribute('class', 'camera_button camera_zoomin');
        w.appendChild(this.close = document.createElement('button'));
        this.close.setAttribute('class', 'camera_button camera_close');
                      
        var b;
        w.appendChild(b = this.time_frst = document.createElement('button'));
        b.setAttribute('class', 'camera_time_button');
        b.innerHTML = "|＜";
        b.style.left = '100px';
        b.style.display = 'none';
        w.appendChild(b = this.time_prev = document.createElement('button'));
        b.setAttribute('class', 'camera_time_button');
        b.innerHTML = "＜";
        b.style.left = '140px';
        b.style.display = 'none';
        w.appendChild(b = this.time_play = document.createElement('button'));
        b.setAttribute('class', 'camera_time_button');
        b.innerHTML = "▶";
        b.style.left = '180px';
        b.style.display = 'none';
        w.appendChild(b = this.time_next = document.createElement('button'));
        b.setAttribute('class', 'camera_time_button');
        b.innerHTML = "＞";
        b.style.left = '220px';
        b.style.display = 'none';
        w.appendChild(b = this.time_last = document.createElement('button'));
        b.setAttribute('class', 'camera_time_button');
        b.innerHTML = "＞|";
        b.style.left = '260px';
        b.style.display = 'none';

        w.appendChild(c);
                      
        this.setImage = function(index) {
            c = this.canvas;
            c.innerHTML = "";
            this.index = index;
            this.name.innerHTML = camera.l_name;
            this.time.innerHTML = "--";
            if ( camera.image && camera.image.length ) {
                if ( index < 0 )
                    index = 0;
                if ( index >= camera.image.length )
                    index = camera.image.length-1;
                var target = camera.image[index];
                if ( target.image ) {
                    c.width = target.image.width || 600;
                    c.height = target.image.height || 480;
                    target.image.style.width = '100%';
                    target.image.style.height = '100%';
                    target.image.style['pointer-events'] = 'none';
                    c.appendChild(target.image);
                }
                var jst = WRAP.DH._timeString(WRAP.DH._setTime(WRAP.DH._time(target.time),9*3600));
                var day = Number(jst.substr(6,2));
                var hour = Number(jst.substr(9,2));
                var min = Number(jst.substr(11,2));
                this.time.innerHTML = ""+day+"日 "+hour+"時 "+min+"分";

                self.time_frst.disabled = (index==camera.image.length-1);
                self.time_prev.disabled = (index==camera.image.length-1);
                self.time_play.disabled = (camera.image.length<=1);
                self.time_next.disabled = (index==0);
                self.time_last.disabled = (index==0);
            }
            else {
                self.time_frst.disabled = true;
                self.time_prev.disabled = true;
                self.time_play.disabled = true;
                self.time_next.disabled = true;
                self.time_last.disabled = true;
            }
            this.index = index;
        }
                      
        this.close.onclick = function() {
            self.hide();
        }
                      
        this.zoom.onclick = function() {
            self.smooth = true;
            if ( self.small ) {
                self.small = false;
                self.set();
            }
            else {
                self.small = true;
                self.set();
            }
        }
                      
        this.animate = function() {
            if ( !self.animating ) {
                self.time_play.innerHTML = "▶";
                return;
            }
            self.time_play.innerHTML = "■";
            var n = self.index-1;
            if ( n < 0 )
                n = self.camera.image.length-1;
            self.setImage(n);
            setTimeout(function() {
                self.animate();
            },500);
        }
                      
        this.time_frst.onclick = function() {
            self.setImage(self.camera.image.length-1);
        }
        this.time_prev.onclick = function() {
            self.setImage(self.index+1);
        }
        this.time_play.onclick = function() {
            if ((self.animating = !self.animating) )
                self.animate();
        }
        this.time_next.onclick = function() {
            self.setImage(self.index-1);
        }
        this.time_last.onclick = function() {
            self.setImage(0);
        }
                      
        w.onmousedown = function(evt){
            dragging = this;
            drag_x = w.style.left.replace(/px/, "");
            drag_y = w.style.top.replace(/px/, "");
            offset_x = evt.clientX-drag_x;
            offset_y = evt.clientY-drag_y;
            activateCameraWindow(dragging.controller);
        };
        w.onmouseup = function(/*evt*/){
            dragging = false;
        };
        w.onmousemove = function(evt){
            if ( dragging ) {
                var x = evt.clientX - offset_x;
                var y = evt.clientY - offset_y;
                dragging.controller.pinned = true;
                dragging.point = WRAP.Geo.getPoint(new WRAP.Geo.ScreenPoint(x-camera_ox, y-camera_oy));
                dragging.style.left = x + 'px';
                dragging.style.top = y + 'px';
            }
            evt._prevent = true;
            evt.preventDefault();
        };
               
        this.set = function() {
            var c = self.smooth?'smooth_tran ':'';
            c += 'live_camera';
            c += self.small?' small_window':' middle_window';
            if ( !this.tooltip && this == current_camera )
                c += ' current_window';
            self.window.setAttribute('class', c);
                      
            c = self.smooth?'smooth_tran ':'';
            c += self.small?' image_s':' image_m';
            self.canvas.setAttribute('class', c);
                      
            self.zoom.setAttribute('class', self.small?'camera_button camera_zoomin'
                                                      :'camera_button camera_zoomout');
            self.time_frst.style.display = self.small?'none':'block';
            self.time_prev.style.display = self.small?'none':'block';
            self.time_play.style.display = self.small?'none':'block';
            self.time_next.style.display = self.small?'none':'block';
            self.time_last.style.display = self.small?'none':'block';
                      
            self.zoom.style.display = self.tooltip?'none':'block';
            self.close.style.display = self.tooltip?'none':'block';
                      
            if ( self.small || !self.visible ) {
                self.animating = false;
            }
            if ( self.small )
                self.setImage(0);
                      
            if ( self.smooth ) {
                setTimeout(function(){
                    self.smooth = false;
                    self.set();
                },250);
            }
        }
                      
        this.show = function(lat, lon) {
            self.set();
            self.visible = true;
            this.window.point = new WRAP.Geo.Point(lat, lon);
            var sp = WRAP.Geo.getScreenPoint(this.window.point);
            sp.x += camera_ox;
            sp.y += camera_ox;
            this.window.style.top = "" + sp.y + "px";
            this.window.style.left = "" + sp.x + "px";
            this.window.style.display = 'block';
        }
                      
        this.hide = function() {
            this.window.style.display = 'none';
            self.visible = false;
            self.small = true;
            self.animating = false;
            self.setImage(0);
        }
                      
        base_div.appendChild(w);
        this.setImage(0);
    }
                      
    return {
        init: function(data, div) {
            base_div = div;
            initTooltip();
            initLiveCamera(data);
            WRAP.Geo.addEventHandler("mouseover", mouseOverHandler);
            WRAP.Geo.addEventHandler("mouseout", mouseOutHandler);
            WRAP.Geo.addEventHandler("touch", touchHandler);
            WRAP.Geo.addEventHandler("boundsChange", boundsChangeHandler);
            WRAP.Geo.addEventHandler("visibilityChange", visibilityChangeHandler);
        },
                        
        setTooltip: function(html) {
            setTooltip(html);
        },
                        
        showTooltip: function(x,y) {
            showTooltip(x,y);
        },
                      
        clearTooltip: function(x,y) {
            clearTooltip(x,y);
        },
                        
        getTooltip: function() {
            return getTooltip();
        },
                        
        alignLiveCamera: function() {
            for ( var i = 0 ; i < camera_window.length ; i++ ) {
                var cw = camera_window[i];
                cw.pinned = true;
            }
            var sx = base_div.clientLeft;
            var sy = base_div.clientTop;
            var ex = sx+base_div.clientWidth;
            var ey = sy+base_div.clientHeight;
            var offset = 10;
            var w = camera_sw+offset;
            var h = camera_sh+camera_header+offset;
            for ( var x = offset ; x+w < ex ; x+=w ) {
                for ( var y = offset ; y+h < ey ; y+=h ) {
                    var nd = 99999999;
                    var nearest = null;
                    for ( var i = 0 ; i < camera_window.length ; i++ ) {
                        var cw = camera_window[i];
                        if ( cw.pinned && cw.visible ) {
                            var cwsx = cw.window.style.left.replace(/px/, "");
                            var cwsy = cw.window.style.top.replace(/px/, "");
                            //var cwex = cwsx+cw.window.style.width.replace(/px/, "");
                            //var cwey = cwsy+cw.window.style.height.replace(/px/, "");
                            //if ( sx < cwex && cwsx< ex && sy < cwey && cwsy< ey ) {
                                var dx = cwsx-x;
                                var dy = cwsy-y;
                                var d = dx*dx+dy*dy;
                                if ( nd > d ) {
                                    nd = d;
                                    nearest = cw;
                                }
                            //}
                        }
                    }
                    if ( nearest ) {
                        nearest.smooth = true;
                        nearest.small = true;
                        nearest.pinned = false;
                        nearest.window.point = WRAP.Geo.getPoint(new WRAP.Geo.ScreenPoint(x, y));
                        nearest.window.style.left = x + 'px';
                        nearest.window.style.top = y + 'px';
                        nearest.set();
                    }
                }
            }
        },
                        
        mouseover:[],
        mouseout:[],
        touch:[],
        boundsChange:[],
        visibilityChange:[]
    };
                      
}());

WRAP.Geo.setOpenLayers = function(map) {

    WRAP.Geo.map = new WRAP.Geo.Bridge.OpenLayers(map);

    return WRAP.Geo.map;
}

WRAP.Geo.Bridge.OpenLayers = function(map) {
    var self = this;
    this.tile_prefix = "o_";

    this.map = map;
    this.view = map.getView();
    
    this.context = new WRAP.Geo.Context(this);
    
    this.canvas;
    this.tile_revision = {};
    
    this.tiles = [];
    
    this.markers = [];
    this.lines = [];
    this.touch = null;
    
    this.zoom = this.view.getZoom();
    this.center = this.view.getCenter();
//    this.projection = 0;//map.getProjection();
    this.bounds = 0;//map.getBounds();

    this.tileID = function(z, y, x) {
        return "G/"+z+"/"+y+"/"+x;
    }
    
    this.updateBounds = function(changing) {

        var extent = ol.proj.get("EPSG:3857").getExtent();
        
        self.zoom = self.view.getZoom();
        self.center = self.view.getCenter();
        var size = self.map.getSize();
        var nwp = self.map.getCoordinateFromPixel([0,0]);
        var sep = self.map.getCoordinateFromPixel(size);
        var nw = ol.proj.transform(nwp, 'EPSG:3857', 'EPSG:4326');
        var se = ol.proj.transform(sep, 'EPSG:3857', 'EPSG:4326');
        self.bounds = new WRAP.Geo.Bounds(nw[1]*60, se[1]*60, se[0]*60, nw[0]*60);
        var s = Math.pow(2,self.zoom);
//console.log("----------- "+s);
        
        nwp[0] -= extent[0];
        sep[0] -= extent[0];
        nwp[1] -= extent[1];
        sep[1] -= extent[1];
        var ew = extent[2]-extent[0];
        var eh = extent[3]-extent[1];
        nwp[0] = nwp[0]/ew*256;
        sep[0] = sep[0]/ew*256;
        nwp[1] = nwp[1]/eh*256;
        sep[1] = sep[1]/eh*256;
        
        var min_x = Math.floor(nwp[0]*s/256);
        var max_x = Math.floor(sep[0]*s/256);
        var min_y = Math.floor(sep[1]*s/256);
        var max_y = Math.floor(nwp[1]*s/256);
        
//console.log("min_x="+min_x+" max_x="+max_x+ " s="+s);
        min_x = min_x%s;
        max_x = max_x%s;
        while ( min_x < 0 )
            min_x += s;
        while ( max_x < 0 )
            max_x += s;
//console.log("  ==> min_x="+min_x+" max_x="+max_x+ " s="+s);
        
        function addTile(context, z, y, x) {
            var tile = context.findTile(z, y, x);
            if ( tile ) {
                tile.locked = false;
                return;
            }
            //console.log("addTile z="+z+" y="+y+" x="+x);
            var cood = new Float32Array(256*256*2);
            
//            var extent = ol.proj.get("EPSG:3857").getExtent();
            
            var zz = Math.pow(2,parseInt(z));
            var xx = (parseFloat(x))/zz;
            var yy = (parseFloat(y)+1)/zz;
            
            xx = xx*(extent[2]-extent[0])+extent[0];
            yy = yy*(extent[3]-extent[1])+extent[1];
            var xd = (extent[2]-extent[0])/zz/256;
            var yd = (extent[3]-extent[1])/zz/256;
            
            var c = {x:[256],y:[256]};
            for ( var i = 0 ; i < 256 ; i++ ) {
                var xxx = xx + xd*parseFloat(i);
                var yyy = yy - yd*parseFloat(i);
                var xp = ol.proj.transform([xxx,yy], 'EPSG:3857', 'EPSG:4326');
                c.x[i] = xp[0];
                if ( c.x[i] < -180.0 )
                    c.x[i] += 360.0;
                else if ( c.x[i] >= 180.0 )
                    c.x[i] -= 360.0;
                var yp = ol.proj.transform([xx,yyy], 'EPSG:3857', 'EPSG:4326');
                c.y[i] = yp[1];
            }
            var i = 0;
            for ( var yi = 0 ; yi < 256 ; yi++ ) {
                for ( var xi = 0 ; xi < 256 ; xi++ ) {
                    cood[i++] = c.y[yi];
                    cood[i++] = c.x[xi];
                }
            }
            context.addTile("M", z, y, x, cood,
                            new WRAP.Geo.Bounds(cood[0]*60.0, cood[2*256*255]*60.0, cood[2*256*256-1]*60.0, cood[1]*60.0));
        }
        
        if ( !changing ) {
            this.context.lockTile();
            var w = Math.pow(2,self.zoom);
            for ( var y = min_y ; y <= max_y ; y++ ) {
                if ( min_x <= max_x ) {
                    for ( var x = min_x ; x <= max_x ; x++ )
                        addTile(this.context, self.zoom, y, x);
                }
                else {
                    for ( var x = min_x ; x < w ; x++ )
                        addTile(this.context, self.zoom, y, x);
                    for ( var x = 0 ; x <= max_x ; x++ )
                        addTile(this.context, self.zoom, y, x);
                }
            }
            this.context.clearLockedTile();
            self.context.setTileBand(self.zoom, min_x, max_x, min_y, max_y);
        }
        
        WRAP.Geo.updateBounds(self.bounds, changing);
//        console.log("n="+nw[1]+" s="+se[1]+"w="+nw[0]+" e="+se[0]+" zoom="+self.zoom);
//        console.log("nwp[1]="+nwp[1]+" sep[1]="+sep[1]+"nwp[0]="+nwp[0]+" sep[0]="+sep[0]);
//        console.log("min_y="+min_y+" max_y="+max_y+"min_x="+min_x+" max_x="+max_x);
    }
    
    window.setTimeout(function() {
        self.updateBounds();
    }, 1000);
    
    this.setTile = function(tile, revision) {
        if ( !self.canvas )
            return;
        
        var id = self.tileID(tile.z, tile.y, tile.x);
//        if ( self.tile_revision[id] == revision )
//            return;
        self.tile_revision[id] = revision;
        
        var extent = ol.proj.get("EPSG:3857").getExtent();
        var zz = Math.pow(2,parseInt(tile.z));
        var ff = zz*256;
        var xx = (parseFloat(tile.x))/zz;
        var yy = (parseFloat(tile.y+1))/zz;
        xx = xx*(extent[2]-extent[0])+extent[0];
        yy = yy*(extent[3]-extent[1])+extent[1];
        

        var dst = self.map.getPixelFromCoordinate([self.canvas.extent[0], self.canvas.extent[3]]);
        var src = self.map.getPixelFromCoordinate([xx,yy]);
        
        //console.log("dst="+dst[0]+","+dst[1]+" src="+src[0]+","+src[1]);
        //console.log("pos="+(src[0]-dst[0])+","+(src[1]-dst[1]));
        
        var x = Math.floor(src[0])-Math.floor(dst[0]);
        if ( x < -256 )
            x += ff;
        if ( x >= ff )
            x -= ff;
        var y = Math.floor(src[1])-Math.floor(dst[1]);
        
        var pr = window.devicePixelRatio;
        
        self.canvas.ctx.clearRect(x*pr,y*pr,256*pr,256*pr);
        self.canvas.ctx.drawImage(tile.canvas,tile.offset_x,tile.offset_y,256,256,x*pr,y*pr,256*pr,256*pr);
        var s = 1;
        while ( x - ff*s >= 0 ) {
            self.canvas.ctx.clearRect((x-ff*s)*pr,y*pr,256*pr,256*pr);
            self.canvas.ctx.drawImage(tile.canvas,tile.offset_x,tile.offset_y,256,256,(x-ff*s)*pr,y*pr,256*pr,256*pr);
            s++;
        }
        s = 1;
        while ( x + ff*s < self.canvas.width ) {
            self.canvas.ctx.clearRect((x+ff*s)*pr,y*pr,256*pr,256*pr);
            self.canvas.ctx.drawImage(tile.canvas,tile.offset_x,tile.offset_y,256,256,(x+ff*s)*pr,y*pr,256*pr,256*pr);
            s++;
        }
/*
        self.canvas.ctx.fillStyle = 'rgba(255,0,0,0.8)';
        self.canvas.ctx.strokeStyle = 'rgba(0,0,255,0.4)';
        var sx = (x+2)*pr;
        var ex = (x+254)*pr;
        var sy = (y+2)*pr;
        var ey = (y+254)*pr;
        self.canvas.ctx.beginPath();
        self.canvas.ctx.moveTo(sx,sy);
        self.canvas.ctx.lineTo(ex,sy);
        self.canvas.ctx.lineTo(ex,ey);
        self.canvas.ctx.lineTo(sx,ey);
        self.canvas.ctx.lineTo(sx,sy);
        self.canvas.ctx.stroke();
        self.canvas.ctx.font = '14px Arial';
        self.canvas.ctx.fillText(tile.id+" : "+id,tile.offset_x+20,120);
        self.canvas.ctx.font = '16px Arial';
        self.canvas.ctx.fillStyle = 'rgba(0,0,0,0.8)';
//        self.canvas.ctx.fillText(cr+"->"+r, 20,160);
        self.canvas.ctx.fillStyle = 'rgba(0,100,0,0.8)';
        self.canvas.ctx.fillText("context:"+tile.context_rev, tile.offset_x+20,180);
        self.canvas.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        self.canvas.ctx.fillText(tile.offset_x+"/"+tile.canvas.width, tile.offset_x+20,200);
*/
        
        //console.log("tile id="+tile.id+" x="+tile.x+" canvas x="+x);
    }
    
    this.map.on('move', function(/*e*/) {
        self.updateBounds(true);
    });
    
    this.map.on('moveend', function(/*e*/) {
        self.updateBounds();
    });
    
    this.map.on('pointermove', function(e) {
        var point = self.map.getPixelFromCoordinate(e.coordinate);
        var ll = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');
        self.mouse_point = new WRAP.Geo.Point(ll[1]*60, ll[0]*60);
        self.mouse_screenpoint = new WRAP.Geo.ScreenPoint(point[0], point[1]);
//        console.log("mouse="+point[0]+","+point[1]+" pos="+ll[1]+","+ll[0]);
    });
    
    
    var canvasFunction = function(extent, resolution, pixelRatio, size, projection) {
        resolution=null;
        pixelRatio=null;
        projection=null;
        

        self.tile_revision = {};
        self.canvas = document.createElement('canvas');
        self.canvas.ctx = self.canvas.getContext("2d");
        self.canvas.extent = extent;
        
        var canvasWidth = size[0], canvasHeight = size[1];
        self.canvas.setAttribute('width', canvasWidth);
        self.canvas.setAttribute('height', canvasHeight);

/*
        // Canvas extent is different than map extent, so compute delta between
        // left-top of map and canvas extent.
        var mapExtent = map.getView().calculateExtent(map.getSize())
        var canvasOrigin = map.getPixelFromCoordinate([extent[0], extent[3]]);
        var mapOrigin = map.getPixelFromCoordinate([mapExtent[0], mapExtent[3]]);
        var delta = [mapOrigin[0]-canvasOrigin[0], mapOrigin[1]-canvasOrigin[1]]
        
        //console.log("canvasFunc extent "+extent[0]+","+extent[3]);
        //console.log("canvasFunc mapExtent"+mapExtent[0]+","+mapExtent[3]);
        
        var bottomLeft = ol.proj.transform(ol.extent.getBottomLeft(extent),
                                           'EPSG:3857', 'EPSG:4326');
        var topRight = ol.proj.transform(ol.extent.getTopRight(extent),
                                         'EPSG:3857', 'EPSG:4326');
        var endof_left   = bottomLeft[0];
        var endof_bottom = bottomLeft[1];
        var endof_right  = topRight[0];
        var endof_top    = topRight[1];
        
        console.log("left-bottom="+endof_left+","+endof_bottom);
        console.log("right-top="+endof_right+","+endof_top);
*/
        
        // draw test
/*
        var ctx = self.canvas.ctx;
        ctx.strokeStyle = 'rgba(255,20,20,0.6)';
        var ox = canvasWidth/2;
        var oy = canvasHeight/2;
        ctx.moveTo(ox+32,oy+32);
        ctx.lineTo(ox+32,oy+224);
        ctx.lineTo(ox+224,oy+224);
        ctx.lineTo(ox+224,oy+32);
        ctx.closePath();
        ctx.lineWidth = 3;
        ctx.stroke();
*/
//        WRAP.Geo.render();
        
        return self.canvas;
    };
    
    var canvasLayer = new ol.layer.Image({
        source: new ol.source.ImageCanvas({
            canvasFunction: canvasFunction,
            projection: 'EPSG:3857'
        })
    });
    this.map.addLayer(canvasLayer);
    
    this.getSize = function() {
        var size = self.map.getSize();
        return { width:size[0], height:size[1] };
    }
    
    this.getScreenPoint = function(pt) {
        if ( !pt )
            return new WRAP.Geo.ScreenPoint(0,0);
        var cood = ol.proj.transform([pt.lonDegree(), pt.latDegree()], 'EPSG:4326', 'EPSG:3857');
        if ( !cood )
            return new WRAP.Geo.ScreenPoint(0,0);
        var point = self.map.getPixelFromCoordinate(cood);
        if ( !point )
            return new WRAP.Geo.ScreenPoint(0,0);
        return new WRAP.Geo.ScreenPoint(point[0], point[1]);
    }
    
    
    this.getScreenLine = function(path, n, s, w, e) {
        var lines = [];
        var bn = self.bounds.north/60.0;
        var bs = self.bounds.south/60.0;
        var be = self.bounds.east/60.0;
        var bw = self.bounds.west/60.0;
        if ( be < bw )
            be += 360.0;
        if ( s >= bn || n <= bs )
            return lines;
        if ( bw < e && w < be ) {
            var line = [];
            for ( var i = 0 ; i < path.length ; i++ )
                line.push(this.getScreenPoint(new WRAP.Geo.Point(path[i][0]*60, path[i][1]*60)));
            lines.push(line);
        }
        if ( bw < e-360 && w < be-360 ) {
            var line = [];
            for ( var i = 0 ; i < path.length ; i++ )
                line.push(this.getScreenPoint(new WRAP.Geo.Point((path[i][0]*60, path[i][1]-360)*60)));
            lines.push(line);
        }
        else if ( bw-360 < e && w-360 < be ) {
            var line = [];
            for ( var i = 0 ; i < path.length ; i++ )
                line.push(this.getScreenPoint(new WRAP.Geo.Point((path[i][0]*60, path[i][1]+360)*60)));
            lines.push(line);
        }
        return lines;
    }
    
    this.getPoint = function(pt) {
        if ( !pt )
            return new WRAP.Geo.Point(0,0);
        var point = self.map.getCoordinateFromPixel([pt.x, pt.y]);
        if ( !point )
            return new WRAP.Geo.Point(0,0);
        var ll = ol.proj.transform(point, 'EPSG:3857', 'EPSG:4326');
        return new WRAP.Geo.Point(ll[1]*60,ll[0]*60);
    }

    this.getCenterPoint = function() {
        var cood = this.view.getCenter();
        var ll = ol.proj.transform(cood, 'EPSG:3857', 'EPSG:4326');
        return new WRAP.Geo.Point(ll[1]*60.0, ll[0]*60.0);
    }

    this.setCenterPoint = function(pt) {
        this.view.setCenter(ol.proj.transform([pt.lonDegree(), pt.latDegree()], 'EPSG:4326', 'EPSG:3857'));
    }

    this.getZoom = function() {
        return this.zoom;
    }

    this.setZoom = function(zoom) {
        this.view.setZoom((this.zoom = zoom));
    }

    this.getPerspective = function(pts, margin) {
        if (margin === void 0)
            margin = 0;
        var lat = pts[0].lat;
        var lon = pts[0].lon;
        var min_lat = lat, max_lat = lat, min_lon = lon, max_lon = lon;
        for ( var i = 1 ; i < pts.length ; i++ ) {
            var lat = pts[i].lat;
            var d = pts[i].lon - lon;
            if ( d >= 10800 )
                lon = pts[i].lon-21600;
            else if ( l < -10800 )
                lon = pts[i].lon+21600;
            else
                lon = pts[i].lon
                if ( min_lon > lon )
                    min_lon = lon;
            if ( max_lon < lon )
                max_lon = lon;
            if ( min_lat > lat )
                min_lat = lat;
            if ( max_lat < lat )
                max_lat = lat;
        }
        if ( lon < -10800 )
            lon += 21600;
        else if ( lon >= 10800 )
            lon -= 21600;
        
        var lt = ol.proj.transform([min_lon/60, min_lat/60], 'EPSG:4326', 'EPSG:3857');
        var rb = ol.proj.transform([max_lon/60, max_lat/60], 'EPSG:4326', 'EPSG:3857');
        var cy = (lt[1]+rb[1])/2;
        var cx = (rb[0]+lt[0])/2;
        var center = ol.proj.transform([cx, cy], 'EPSG:3857', 'EPSG:4326');
        lat = center[1];
        lon = center[0];
//        lt = self.map.getPixelFromCoordinate(lt);
//        rb = self.map.getPixelFromCoordinate(rb);
        lt = [lt[0]/(65536*4),lt[1]/(65536*4)];
        rb = [rb[0]/(65536*4),rb[1]/(65536*4)];
        var dy = Math.abs(lt[1]-rb[1]);
        var dx = Math.abs(rb[0]-lt[0]);
        var size = map.getSize();
        var w = size[0] - margin*2;
        var h = size[1] - margin*2;
        
        var log2 = Math.log(2);
        var yz = dy>0?(Math.log(h/dy)/log2):this.zoom;
        var xz = dx>0?(Math.log(w/dx)/log2):this.zoom;
        var zoom = Math.floor(yz<xz?yz:xz);
        if ( zoom > 19 ) zoom = 19;
        return { center:new WRAP.Geo.Point(lat*60.0, lon*60.0), zoom:zoom };
    }

    this.getCurrentPoint = function() {
        return { point:this.mouse_point, screenpoint:this.mouse_screenpoint };
    }
    
    this.update = function(redraw) {
        if ( redraw )
            this.updateBounds();
        this.map.render();
    }
    
    this.enableScroll = function(enable) {
        this.map.getInteractions().forEach(function(interaction) {
            if (interaction instanceof ol.interaction.DragPan) {
                interaction.setActive(enable);
            }
        }, this);
    }
    
    
}



WRAP.Geo.setGoogleMaps = function(map) {

    WRAP.Geo.map = new WRAP.Geo.Bridge.GoogleMaps(map);
    var GoogleMaps = WRAP.Geo.map.map;
    
    function OverlayMapType(tileSize) {
        this.tileSize = tileSize;
    }
    
    OverlayMapType.prototype.getTile = function(coord, z, ownerDocument) {
        var m = Math.pow(2,z);
        var x = coord.x;
        var y = m-coord.y-1;
        
        var id = WRAP.Geo.map.tileID(z,y,x);
//console.log("getTile x="+coord.x+" y="+coord.y+" id="+id);
        var cvs = document.getElementById(id);
//console.log("g_tile="+id);
        if ( cvs )
            return cvs;
        cvs = ownerDocument.createElement('canvas');
        cvs.id = id;
        cvs.width = 256, cvs.height = 256;
        cvs.ctx = cvs.getContext("2d");
//        cvs.pix = cvs.ctx.createImageData(256,256);
        setTimeout(function() { WRAP.Geo.render(); }, 10);
        return cvs;
    }
  
    WRAP.Geo.map.overland_layer = new OverlayMapType(new google.maps.Size(256, 256));
    WRAP.Geo.map.overland_layer_index = GoogleMaps.overlayMapTypes.length;
    GoogleMaps.overlayMapTypes.push(null); // reserve maptype placeholder
    
    WRAP.Geo.map.setOverLandLayer(true);
    return WRAP.Geo.map;
}

WRAP.Geo.Bridge.GoogleMaps = function(map) {
    var self = this;
    this.map = map;
    this.markers = [];
    this.lines = [];
    this.touch = null;
    
    this.context = new WRAP.Geo.Context(this);
    
    this.zoom = map.getZoom();
    this.center = map.getCenter();
    this.projection = map.getProjection();
    this.bounds = map.getBounds();
    
    this.tileID = function(z, y, x) {
        return "G/"+z+"/"+y+"/"+x;
    }
    
    this.updateBounds = function(changing) {
        
        if ( this.updateTimer )
            clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(function(){
        
            self.projection = map.getProjection();
            self.center = map.getCenter();
            self.zoom = map.getZoom();
            self.bounds = map.getBounds();
            if ( !self.bounds || !self.projection )
                return;
            var bounds = self.bounds;
            var ne = bounds.getNorthEast();
            var sw = bounds.getSouthWest();
            var nep = self.projection.fromLatLngToPoint(ne);
            var swp = self.projection.fromLatLngToPoint(sw);
            var s = Math.pow(2,self.zoom);
            var min_x = Math.floor(swp.x*s/256);
            var max_x = Math.floor((nep.x==256?255:nep.x)*s/256);
            var min_y = s-Math.floor(swp.y*s/256)-1;
            var max_y = s-Math.floor(nep.y*s/256)-1;
            
            function addTile(context, z, y, x) {
                var tile = context.findTile(z, y, x);
                if ( tile ) {
                    tile.locked = false;
                    return;
                }
                //console.log("addTile z="+z+" y="+y+" x="+x);
                var cood = new Float32Array(256*256*2);
                
                var zz = Math.pow(2,parseInt(z));
                var xx = 256*(parseFloat(x))/zz;
                var yy = 256*(zz-parseFloat(y)-1)/zz;
                var offset = 1.0/zz;
                
                var c = {x:[256],y:[256]};
                for ( var i = 0 ; i < 256 ; i++ ) {
                    var xxx = xx + offset*parseFloat(i);
                    var yyy = yy + offset*parseFloat(i);
                    var xp = self.projection.fromPointToLatLng(new google.maps.Point(xxx,yy));
                    c.x[i] = xp.lng();
                    var yp = self.projection.fromPointToLatLng(new google.maps.Point(xx,yyy));
                    c.y[i] = yp.lat();
                }
                var i = 0;
                for ( var yi = 0 ; yi < 256 ; yi++ ) {
                    for ( var xi = 0 ; xi < 256 ; xi++ ) {
                        cood[i++] = c.y[yi];
                        cood[i++] = c.x[xi];
                    }
                }
                context.addTile("M", z, y, x, cood,
                                new WRAP.Geo.Bounds(cood[0]*60.0, cood[2*256*255]*60.0, cood[2*256*256-1]*60.0, cood[1]*60.0));
            }

            //console.log("updateBounds y="+min_y+"->"+max_y+" x="+min_x+"->"+max_x);
            
            if ( !changing ) {
                self.context.lockTile();
                var w = Math.pow(2,self.zoom);
                for ( var y = min_y ; y <= max_y ; y++ ) {
                    if ( min_x <= max_x ) {
                        for ( var x = min_x ; x <= max_x ; x++ )
                            addTile(self.context, self.zoom, y, x);
                    }
                    else {
                        for ( var x = min_x ; x < w ; x++ )
                            addTile(self.context, self.zoom, y, x);
                        for ( var x = 0 ; x <= max_x ; x++ )
                            addTile(self.context, self.zoom, y, x);
                    }
                }
                self.context.clearLockedTile();
                self.context.setTileBand(self.zoom, min_x, max_x, min_y, max_y);
            }
            //console.log("N="+(ne.lat()*60.0)+" S="+(sw.lat()*60.0)+" E="+(ne.lng()*60.0)+" W="+(sw.lng()*60.0));
            WRAP.Geo.updateBounds(new WRAP.Geo.Bounds(ne.lat()*60.0, sw.lat()*60.0, ne.lng()*60.0, sw.lng()*60.0), changing);
            
        },10);
        
    }
    
    window.setTimeout(function() {
        self.updateBounds();
    }, 1000);
    
    google.maps.event.addListener(map, 'zoom_changed', function() {
        self.updateBounds();
    });
    
    google.maps.event.addListener(map, 'bounds_changed', function() {
        if ( self.touch ) {
            if ( self.touch.feature && self.touch.feature.mouseout )
                self.touch.feature.mouseout();
                self.touch = null;
        }
        self.updateBounds();
    });
    
    google.maps.event.addListener(map, 'idle', function() {
        if ( self.touch ) {
            if ( self.touch.feature && self.touch.feature.mouseout )
                self.touch.feature.mouseout();
            self.touch = null;
        }
        self.updateBounds();
    });
    
    google.maps.event.addListener(map, 'mousemove', function (event) {
        self.mouse_point = new WRAP.Geo.Point(event.latLng.lat()*60, event.latLng.lng()*60);
        self.mouse_screenpoint = new WRAP.Geo.ScreenPoint(event.pixel.x, event.pixel.y);
    });
    
    google.maps.event.addListener(map, 'click', function (event) {
        self.mouse_point = new WRAP.Geo.Point(event.latLng.lat()*60, event.latLng.lng()*60);
        self.mouse_screenpoint = new WRAP.Geo.ScreenPoint(event.pixel.x, event.pixel.y);
    });

    this.setOverLandLayer = function(show) {
        this.map.overlayMapTypes.setAt(WRAP.Geo.map.overland_layer_index,
                                         show?WRAP.Geo.map.overland_layer:null);
    }
    
    this.setTile = function(tile, revision) {
        
        function updateTile(z, y, x) {
        
            var id = self.tileID(z, y, x);
            var cvs = document.getElementById(id);
            if ( !cvs ) {
                //console.log("not found "+id);
                return false;
            }
            if ( cvs.revision != revision ) {
//var cr = cvs.revision;
//var r = revision;
                cvs.revision = revision;
                cvs.ctx.clearRect(0,0,256,256);
                cvs.ctx.drawImage(tile.canvas,tile.offset_x,tile.offset_y,256,256,0,0,256,256);
/*
                cvs.ctx.fillStyle = 'rgba(255,0,0,0.8)';
                cvs.ctx.strokeStyle = 'rgba(0,0,255,0.4)';
                var sx = 2;
                var ex = 254;
                var sy = 2;
                var ey = 254;
                cvs.ctx.beginPath();
                cvs.ctx.moveTo(sx,sy);
                cvs.ctx.lineTo(ex,sy);
                cvs.ctx.lineTo(ex,ey);
                cvs.ctx.lineTo(sx,ey);
                cvs.ctx.lineTo(sx,sy);
                cvs.ctx.stroke();
                cvs.ctx.font = '14px Arial';
                cvs.ctx.fillText(tile.id+" : "+id,20,120);
                cvs.ctx.font = '16px Arial';
                cvs.ctx.fillStyle = 'rgba(0,0,0,0.8)';
                cvs.ctx.fillText(cr+"->"+r, 20,160);
                cvs.ctx.fillStyle = 'rgba(0,100,0,0.8)';
                cvs.ctx.fillText("context:"+tile.context_rev, 20,180);
                cvs.ctx.fillStyle = 'rgba(0,0,0,0.8)';
                cvs.ctx.fillText(tile.offset_x+"/"+tile.canvas.width, 20,200);
*/
            }
            return true;
        }

        var band = Math.pow(2,tile.z);
        updateTile(tile.z, tile.y, tile.x);
        var sx = parseInt(tile.x);
        var sc = 1;
        while ( sc < 24 ) {
            if (updateTile(tile.z, tile.y, sx+sc*band))
                sx = sx+sc*band, sc = 1;
            else
                sc++;
        }
        sx = parseInt(tile.x);
        sc = 1;
        while ( sc < 24 ) {
            if (updateTile(tile.z, tile.y, sx-sc*band))
                sx = sx-sc*band, sc = 1;
            else
                sc++;
        }
//        console.log("tile="+tile.id+" x="+sx+" y="+sy);
    }
    
    this.getSize = function() {
        return { width:map.getDiv().offsetWidth, height:map.getDiv().offsetHeight };
    }

    this.getScreenPoint = function(pt) {
        if ( this.projection ) {
            var m = this.projection.fromLatLngToPoint(new google.maps.LatLng(pt.latDegree(), pt.lonDegree()));
            var c = this.projection.fromLatLngToPoint(this.center);
            var dx = m.x-c.x, dy = m.y-c.y;
            if ( dx < -128 ) dx += 256;
            if ( dx >= 128 ) dx -= 256;
            var s = Math.pow(2, this.zoom);
            var x = map.getDiv().offsetWidth*0.5+dx*s;
            var y = map.getDiv().offsetHeight*0.5+dy*s;
            return new WRAP.Geo.ScreenPoint(parseInt(x), parseInt(y));
        }
        return new WRAP.Geo.ScreenPoint(0,0);
    }

    this.getScreenLine = function(path, n, s/*, w, e*/) {
        var lines = [];
        if ( !this.projection )
            return lines;

        var z = Math.pow(2, this.zoom);
        var b = z*256;
        var hw = map.getDiv().offsetWidth*0.5;
        var hh = map.getDiv().offsetHeight*0.5;
        var sx = this.context.offset_x;
        var ex = sx + this.context.canvas.width;
        var bn = this.context.bounds.n;
        var bs = this.context.bounds.s;
        if ( s >= bn || n <= bs )
            return lines;
        var c = this.projection.fromLatLngToPoint(this.center);
        while ( c.x > 256 )
            c.x -= 256;
        while ( c.x < 0 )
            c.x += 256;
        var cx = (c.x-128)*z;
        var cy = (c.y-128)*z;
        
        var shift = 0;
        // re-adjust center to canvas range
        while ( cx < sx )
            cx += b, shift += b;
        while ( cx >= ex )
            cx -= b, shift -= b;
        
        var tp = [];
        var min_x = b*256;
        var max_x = -min_x;
        for ( var i = 0 ; i < path.length ; i++ ) {
            var lat = path[i][0];
            var lon = path[i][1];
            var m = this.projection.fromLatLngToPoint((new google.maps.LatLng(lat, lon)));
            m.y -= 128;
            m.x = 128.0*lon/180.0; // direct calculation avoid to nomalize longitude
            var x = m.x*z;
            var y = m.y*z;
            if ( min_x > x )
                min_x = x;
            if ( max_x < x )
                max_x = x;
            tp.push([x+hw-cx,y+hh-cy]);
        }
        
        var shifts = [];
        function addShift(s) {
            if ( shifts.indexOf(s) < 0 )
                shifts.push(s);
        }
        
        if ( sx < max_x && min_x < ex ) {
            addShift(0);
            addShift(0+shift);
        }
        if ( sx < max_x-b && min_x-b < ex ) {
            addShift(-b);
            addShift(-b+shift);
        }
        if ( sx < max_x+b && min_x+b < ex ) {
            addShift(b);
            addShift(b+shift);
        }
        for ( var j = 0 ; j < shifts.length ; j++ ) {
            var s = shifts[j];
            var line = [];
            for ( var i = 0 ; i < tp.length ; i++ ) {
                var p = tp[i];
                var x = p[0]+s;
                var y = p[1];
                line.push(new WRAP.Geo.ScreenPoint(x, y));
            }
            lines.push(line);
        }
        return lines;
    }
    
    this.getPoint = function(pt) {
        if ( this.projection ) {
            var x = pt.x-map.getDiv().offsetWidth*0.5;
            var y = pt.y-map.getDiv().offsetHeight*0.5;
            var c = this.projection.fromLatLngToPoint(this.center);
            var s = Math.pow(2, this.zoom);
            var px = c.x+x/s;
            var py = c.y+y/s;
            var ll = this.projection.fromPointToLatLng(new google.maps.Point(px, py));
            return new WRAP.Geo.Point(ll.lat()*60.0, ll.lng()*60.0);
        }
        return new WRAP.Geo.Point(0,0);
    }

    this.getCenterPoint = function() {
        return new WRAP.Geo.Point(self.center.lat()*60.0, self.center.lng()*60.0);
    }

    this.setCenterPoint = function(pt) {
        map.setCenter((this.center = new google.maps.LatLng(pt.latDegree(), pt.lonDegree())));
    }

    this.getZoom = function() {
        return this.zoom;
    }

    this.setZoom = function(zoom) {
        map.setZoom((this.zoom = zoom));
    }
    
    this.getPerspective = function(pts, margin) {
        if ( !this.projection || !pts || !pts.length )
            return { center:this.getCenterPoint(), zoom:this.zoom };
        if (margin === void 0)
            margin = 0;
        var lat = pts[0].lat;
        var lon = pts[0].lon;
        var min_lat = lat, max_lat = lat, min_lon = lon, max_lon = lon;
        for ( var i = 1 ; i < pts.length ; i++ ) {
            var lat = pts[i].lat;
            var d = pts[i].lon - lon;
            if ( d >= 10800 )
                lon = pts[i].lon-21600;
            else if ( d < -10800 )
                lon = pts[i].lon+21600;
            else
                lon = pts[i].lon
            if ( min_lon > lon )
                min_lon = lon;
            if ( max_lon < lon )
                max_lon = lon;
            if ( min_lat > lat )
                min_lat = lat;
            if ( max_lat < lat )
                max_lat = lat;
        }
        if ( lon < -10800 )
            lon += 21600;
        else if ( lon >= 10800 )
            lon -= 21600;
        
        var lt = this.projection.fromLatLngToPoint(new google.maps.LatLng(min_lat/60.0, min_lon/60.0));
        var rb = this.projection.fromLatLngToPoint(new google.maps.LatLng(max_lat/60.0, max_lon/60.0));
        var cy = (lt.y+rb.y)/2;
        var cx = (rb.x+lt.x)/2;
        var center = this.projection.fromPointToLatLng(new google.maps.Point(cx, cy));
        lat = center.lat();
        lon = center.lng();
        var dy = lt.y-rb.y;
        var dx = Math.abs(rb.x-lt.x);
        var w = map.getDiv().offsetWidth - margin*2;
        var h = map.getDiv().offsetHeight - margin*2;
        
        var log2 = Math.log(2);
        var yz = dy>0?(Math.log(h/dy)/log2):this.zoom;
        var xz = dx>0?(Math.log(w/dx)/log2):this.zoom;
        var zoom = Math.floor(yz<xz?yz:xz);
        if ( zoom > 19 ) zoom = 19;
        return { center:new WRAP.Geo.Point(lat*60.0, lon*60.0), zoom:zoom };
    }
    
    this.getDistance = function(p0, p1) {
        var g0 = new google.maps.LatLng(p0.latDegree(), p0.lonDegree());
        var g1 = new google.maps.LatLng(p1.latDegree(), p1.lonDegree());
        return google.maps.geometry.spherical.computeDistanceBetween(g0, g1);
    }
    
    this.getCurrentPoint = function() {
        return { point:this.mouse_point, screenpoint:this.mouse_screenpoint };
    }
    
    this.update = function() {
        
    }
    
    this.enableScroll = function(enable) {
        this.map.setOptions({draggable:enable});
    }
}



WRAP.Geo.Renderer.Mesh = function() {
    var self = this;
    
    this.palette = null;
    this.palette_value_min = 0;
    this.palette_value_max = 0;
    this.palette_gradient = true;
    this.palette_scale = 10;
    this.palette_step = 1;
    
    this.setPalette = function(style) {
        if ( !self.palette && style.palette ) {
            self.palette = [];
            self.palette_gradient = style.palette_gradient;
            self.palette_step = style.palette_step || 1;
            self.palette_scale = 1.0/self.palette_step;
            
            var p = style.palette;
            var l = [];
            for ( var i = 0 ; i < p.length ; i++ ) {
                var s = [];
                var value = p[i].value;
                if ( i == 0 ) {
                    this.palette_value_min = value;
                    this.palette_value_max = value;
                }
                else {
                    if ( this.palette_value_min > value )
                        this.palette_value_min = value;
                    if ( this.palette_value_max < value )
                        this.palette_value_max = value;
                }
                s.push(value);
                var color = WRAP.Geo.parseColor(p[i].color);
                s.push(color[0]);
                s.push(color[1]);
                s.push(color[2]);
                s.push(color[3]);
                l.push(s);
            }

            var m = 0;
            for ( var v = self.palette_value_min ; v <= self.palette_value_max ; v+=self.palette_step ) {
                while ( m < l.length-1 && v >= l[m+1][0] )
                    m++;
                if ( m == l.length-1 ) {
                    self.palette.push([
                       parseInt(l[m][1]),
                       parseInt(l[m][2]),
                       parseInt(l[m][3]),
                       parseInt(l[m][4])
                   ]);
                }
                else {
                    var sr = l[m][1];
                    var sg = l[m][2];
                    var sb = l[m][3];
                    var sa = l[m][4];
                    if ( self.palette_gradient ) {
                        var r = (v-l[m][0])/(l[m+1][0]-l[m][0]);
                        var er = l[m+1][1];
                        var eg = l[m+1][2];
                        var eb = l[m+1][3];
                        var ea = l[m+1][4];
                        self.palette.push([
                           parseInt(sr+(er-sr)*r),
                           parseInt(sg+(eg-sg)*r),
                           parseInt(sb+(eb-sb)*r),
                           parseInt((sa+(ea-sa)*r))
                        ]);
                    }
                    else {
                        self.palette.push([
                           parseInt(sr),
                           parseInt(sg),
                           parseInt(sb),
                           parseInt(sa)
                        ]);
                    }
                }
            }
        }
    }
    
    this.getColor = function(value) {
        var index = Math.floor((value-self.palette_value_min)*self.palette_scale);
        if ( index < 0 || index >= self.palette.length )
            return [0,0,0,0];
        return self.palette[index];
    }
    
    this.draw = function(layer, content, conf, context, style, data, revision, dl) {
        
        var valid = true;
        if ( this.context_revision != revision.context ) {
            valid = false;
        }

        if ( this.content_revision != revision.content ) {
            valid = false;
        }

        if ( this.conf_revision != revision.conf ) {
            valid = false;
        }
        
        if ( this.style_revision != revision.style ) {
            valid = false;
            this.palette = null;
        }
        
        if ( valid )
            return;
        
        var data_offset = conf.Attributes.data_offset || 0;
        
        var s = conf.Attributes.style.default;
        if ( !style && conf.Attributes.style_selector ) {
            if ( !conf.Attributes.style_selector.key || !conf.Attributes.style_selector.styles ) {
                console.log("style_selector formar error.");
                return;
            }
            var key = conf.Attributes.style_selector.key;
            for ( var i = 0 ; i < conf.Attributes.style_selector.styles.length ; i++ ) {
                var values = conf.Attributes.style_selector.styles[i].values;
                if ( values.indexOf(content[key]) >= 0 ) {
                    style = conf.Attributes.style_selector.styles[i].style;
                    break;
                }
            }
        }
        if ( style && conf.Attributes.style[style] )
            s = conf.Attributes.style[style];
        if ( !s )
            return;
        
        this.setPalette(s);
        var sampling = (s.fill_type!='block')?'interpolate':'nearest';
        var fill = s.fill_type;
        var contour = s.contour;
        
        var tiles = [];
        var drawn = [];
        for ( var i = 0 ; i < context.tiles.length ; i++ ) {
            var tile = context.tiles[i];
            for ( var j = 0 ; j < dl.length ; j++ ) {
                var f = dl[j];
                if ( f.data && f.data.tile && f.data.tile.id == tile.id && f.data.revision == revision.content ) {
                    drawn.push(f);
                    tile = null;
                    break;
                }
            }
            if ( tile )
                tiles.push(tile);
        }
        
//console.log("rendering Mesh");
        var data_tile = [];
        for ( var i = 0 ; i < tiles.length ; i++ ) {
            var tile = tiles[i];
            if ( !(data_tile[i] = data._handler().getTile(content, tile.id, sampling)) ) {
                data._handler().loadTile(content, tile.id, sampling, tile.z, tile.y, tile.x, tile.cood, tile.bounds,
                    function() {
                        WRAP.Geo.redraw(layer);
                    });
                return;
            }
        }
        
//console.log("tiles="+tiles.length+" drawn="+drawn.length);
        
        var tl = [];
        
        dl.length = 0;
        for ( var i = 0 ; i < drawn.length ; i++ ) {
            dl.push(drawn[i]);
            tl.push(drawn[i]);
        }
        
        for ( var i = 0 ; i < data_tile.length ; i++ ) {
            var src = data_tile[i];
            if ( !src || src.empty )
                continue;
            
            var tile = tiles[i];
            if ( !tile.ctx ) {
                console.log("tile.ctx not found : "+tile.id);
                continue;
            }
            var pix = tile.ctx.createImageData(256,256);
            var s = this.getData(content, src.data);
            if ( !s )
                continue;
            
            var d = pix.data;
            if ( fill ) {
                for ( var m = 0 ; m < 65536 ; m++ ) {
                    var value = s[m];
                    if ( isNaN(value) )
                        continue;
                    value += data_offset;
                    var col = this.getColor(value);
                    var p = m*4;
                    d[p] = col[0];
                    d[p+1] = col[1];
                    d[p+2] = col[2];
                    d[p+3] = col[3];
                }
            }
//console.log("tile="+tile.id+" min="+min+" max="+max);

            var label = [];
            if ( contour ) {
                var min = 0;
                var max = 0;
                for ( var p = 0 ; p < 65536 ; p++ ) {
                    var value = s[p];
                    if ( isNaN(value) )
                        continue;
                    if ( p == 0 ) {
                        min = max = value;
                    }
                    else {
                        if ( min > value )
                           min = value;
                        if ( max < value )
                            max = value;
                    }
                }
                
                for ( var j = 0 ; j < contour.length ; j++ ) {
                    var c = contour[j];
                    var col = WRAP.Geo.parseColor(c.strokeStyle);
                    var value = c.base - data_offset;
                    for ( var n = 0 ; n < c.num ; n++ ) {
                        if ( min <= value && value <= max ) {
                            var ll = -1;
                            var lx = 0, ly = 0;
                            
                            var index = 0;
                            for ( var y = 0 ; y < 256 ; y++ ) {
                                var py = (y==0)?0:-256;
                                var ny = (y==255)?0:256;
                                for ( var x = 0 ; x < 256 ; x++ ) {
                                    var px = (x==0)?0:-1;
                                    var nx = (x==255)?0:1;
                                    var vc = s[index];
                                    try {
                                        if ( vc >= value ) {
                                            var vt = s[index+py];
                                            var vl = s[index+px];
                                            var vr = s[index+nx];
                                            var vb = s[index+ny];
                                            if ( vt < value || vl < value || vr < value || vb < value ) {
                                                d[index*4] = col[0];
                                                d[index*4+1] = col[1];
                                                d[index*4+2] = col[2];
                                                d[index*4+3] = col[3];
                                                if ( c.lineWidth>1) {
                                                    d[index*4+4] = col[0];
                                                    d[index*4+5] = col[1];
                                                    d[index*4+6] = col[2];
                                                    d[index*4+7] = col[3];
                                                    d[index*4+1024] = col[0];
                                                    d[index*4+1024+1] = col[1];
                                                    d[index*4+1024+2] = col[2];
                                                    d[index*4+1024+3] = col[3];
                                                }
                                                
                                                var l = Math.abs(x-128)+Math.abs(y-128);
                                                if ( ll < 0 || l < ll ) {
                                                    ll = l;
                                                    lx = x;
                                                    ly = y;
                                                }
                                            }
                                        }
                                    }
                                    catch(e){
                                    }
                                    index++;
                                }
                            }
                            
                            if ( 20 < lx && lx <= 236 && 20 < ly && ly <= 236 ) {
                                label.push({x:lx, y:ly, value:value+data_offset, color:c.textColor});
                            }
                        }
                        value += c.interval;
                    }
                }
            }
            var feature = new WRAP.Geo.Feature.Tile({
                tile:tile,
                imageData:pix
            });
            dl.push(feature);
            tl.push(feature);

            var label_feature = [];
            for ( var l = 0 ; l < label.length ; l++ ) {
                var center = (128*256+128)*2;
                var lat = tile.cood[center];
                var lon = tile.cood[center+1];
                var text = new WRAP.Geo.Feature.Text({
                    point:[lon, lat],
                    text:label[l].value,
                    fontSize:12,
                    fillStyle:label[l].color,
                    offsetX:label[l].x-128,
                    offsetY:label[l].y-128,
                    align:'center'
                });
                label_feature.push(text);
            }
            feature.data = { tile:tile, label:label_feature, length:label.length, revision:revision.content };
        }
        
        for ( var m = 0 ; m < tl.length ; m++ ) {
            var f = tl[m];
            if ( f.data && f.data.label ) {
                var label = f.data.label;
                for ( var l = 0 ; l < label.length ; l++ ) {
                    dl.push(label[l]);
                }
            }
        }
        
        //WRAP.Geo._tileCheck(context, dl);
        
        this.context_revision = revision.context;
        this.content_revision = revision.content;
        this.conf_revision = context.conf;
        this.style_revision = revision.style;
        WRAP.Geo.invalidate();
    }
}

WRAP.Geo.Renderer.Mesh.prototype.getData = function(content, data) {
    if ( !content.element || !Array.isArray(content.element) )
        return data;
}


WRAP.Geo.Renderer.Image = function() {

    this.draw = function(layer, content, conf, context, style, data, revision, dl) {
        
        if ( !content )
            return;
        
        var valid = true;
        if ( this.context_revision != revision.context ) {
            valid = false;
        }

        if ( this.content_revision != revision.content ) {
            valid = false;
        }

        if ( this.conf_revision != revision.conf ) {
            valid = false;
            dl.length = 0;
            this.palette = null;
        }
        
        if ( this.style_revision != revision.style ) {
            valid = false;
            dl.length = 0;
            this.palette = null;
        }
        
        if ( valid )
            return;
        
        var s = conf.Attributes.style.default;
        if ( style && conf.Attributes.style[style] )
            s = conf.Attributes.style[style];
        if ( !s )
            return;
        
        var sampling = null;
        
        var tiles = [];
        var drawn = [];
        for ( var i = 0 ; i < context.tiles.length ; i++ ) {
            var tile = context.tiles[i];
            for ( var j = 0 ; j < dl.length ; j++ ) {
                var f = dl[j];
                if ( f.data && f.data.tile && f.data.tile.id == tile.id && f.data.revision == revision.content ) {
                    drawn.push(f);
                    tile = null;
                    break;
                }
            }
            if ( tile )
                tiles.push(tile);
        }

//console.log("rendering Image "+layer.name());
        var data_tile = [];
        for ( var i = 0 ; i < tiles.length ; i++ ) {
            var tile = tiles[i];
            if ( !(data_tile[i] = data._handler().getTile(content, tile.id, sampling)) ) {
                data._handler().loadTile(content, tile.id, sampling, tile.z, tile.y, tile.x, tile.cood, tile.bounds,
                    function() {
                        WRAP.Geo.redraw(layer);
                    });
                return;
            }
        }
        
//console.log("tiles="+tiles.length+" drawn="+drawn.length);
        
        dl.length = 0;
        for ( var i = 0 ; i < drawn.length ; i++ ) {
            dl.push(drawn[i]);
        }
        
        for ( var i = 0 ; i < data_tile.length ; i++ ) {
            var src = data_tile[i];
            if ( !src || src.empty || !src.data )
                continue;
            
            var tile = tiles[i];
            var pix = tile.ctx.createImageData(256,256);
            var sd = src.data;
            var dd = pix.data;
            var m = 0;
            if ( s.type == 'rgb_palette' && s.palette ) {
                var palette = s.palette;
                for ( var p = 0 ; p < 65536 ; p++ ) {
                    var r = sd[m];
                    var g = sd[m+1];
                    var b = sd[m+2];
                    var a = sd[m+3];
                    for ( var j = 0 ; j < palette.length ; j++ ) {
                        var col = palette[j][0];
                        if ( r == col[0] && g == col[1] && b == col[2] ) {
                            r = palette[j][1][0];
                            g = palette[j][1][1];
                            b = palette[j][1][2];
                            a = palette[j][1][3];
                            break;
                        }
                    }
                    dd[m++] = r;
                    dd[m++] = g;
                    dd[m++] = b;
                    dd[m++] = a;
                }
            }
            else if ( s.type == 'grayscale_palette' && s.palette ) {
                var palette = s.palette;
                for ( var j = 0 ; j < 65536 ; j++ ) {
                    var c = sd[m];
                    var p = palette[c];
                    dd[m++] = p[0];
                    dd[m++] = p[1];
                    dd[m++] = p[2];
                    dd[m++] = p[3];
                }
            }
            else if ( s.type == 'filter') {
                var rgb_offset = parseInt(s.rgb_offset) || 0;
                var opacity = parseFloat(s.opacity) || 1.0;
                for ( var j = 0 ; j < 65536 ; j++ ) {
                    var r = sd[m]+rgb_offset;
                    var g = sd[m+1]+rgb_offset;
                    var b = sd[m+2]+rgb_offset;
                    var a = sd[m+3]*opacity;
                    if ( r < 0 )
                        r = 0;
                    else if ( r > 255 )
                        r = 255;
                    if ( g < 0 )
                        g = 0;
                    else if ( g > 255 )
                        g = 255;
                    if ( b < 0 )
                        b = 0;
                    else if ( b > 255 )
                        b = 255;
                    dd[m++] = r;
                    dd[m++] = g;
                    dd[m++] = b;
                    dd[m++] = a;
                }
            }
            else {
                var num = sd.length;
                for ( var j = 0 ; j < num ; j++ )
                    dd[j] = sd[j];
            }
            var feature = new WRAP.Geo.Feature.Tile({
                tile:tile,
                imageData:pix
            });
feature.data = { tile:tile, revision:revision.content };
            dl.push(feature);
        }
        
        //WRAP.Geo._tileCheck(context, dl);
        
        this.context_revision = revision.context;
        this.content_revision = revision.content;
        this.conf_revision = context.conf;
        this.style_revision = revision.style;
        WRAP.Geo.invalidate();
    }
    
    this.merge = function(dst, src, conf, style) {
        var alt = [256,256,256,256];
        var s = conf.Attributes.style.default;
        if ( style && conf.Attributes.style[style] )
            s = conf.Attributes.style[style];
        if ( s && s.alternative_color && s.alternative_color.length == 4 )
            alt = s.alternative_color;
        var a = [];
        for ( var i = 0 ; i < src.length ; i++ ) {
            var s = src[i].style();
            if ( s.tile ) {
                var found = null;
                for ( var j = 0 ; j < dst.length ; j++ ) {
                    var d = dst[j].style();
                    if ( d.tile && d.tile.id == s.tile.id ) {
                        found = d;
                        break;
                    }
                }
                if ( !found ) {
                    var pix = s.tile.ctx.createImageData(256,256);
                    var sp = s.imageData.data;
                    var dp = pix.data;
                    for ( var k = 0 ; k < 65536 ; k++ ) {
                        var p = k*4;
                        if ( sp[p] == alt[0] && sp[p+1] == alt[1] && sp[p+2] == alt[2] && sp[p+3] == alt[3]) {
                            dp[p] = alt[0];
                            dp[p+1] = alt[1];
                            dp[p+2] = alt[2];
                            dp[p+3] = alt[3];
                        }
                        else {
                            dp[p] = sp[p];
                            dp[p+1] = sp[p+1];
                            dp[p+2] = sp[p+2];
                            dp[p+3] = sp[p+3];
                        }
                    }
                    a.push(new WRAP.Geo.Feature.Tile({
                        tile:s.tile,
                        imageData:pix
                    }));
                }
                else if ( s.imageData && found.imageData ){
                    var sp = s.imageData.data;
                    var dp = found.imageData.data;
                    for ( var k = 0 ; k < 65536 ; k++ ) {
                        var p = k*4;
                        if ( sp[p] == alt[0] && sp[p+1] == alt[1] && sp[p+2] == alt[2] && sp[p+3] == alt[3]) {
                            if ( dp[p+3] == 0 ) {
                                dp[p] = alt[0];
                                dp[p+1] = alt[1];
                                dp[p+2] = alt[2];
                                dp[p+3] = alt[3];
                            }
                        }
                        else if ( sp[p+3] ) {
                            dp[p] = sp[p];
                            dp[p+1] = sp[p+1];
                            dp[p+2] = sp[p+2];
                            dp[p+3] = sp[p+3];
                        }
                    }
                }
            }
        }
        for ( var i = 0 ; i < a.length ; i++ )
            dst.push(a[i]);
    }
    
    this.getValue = function(content, context, data, point) {
        for ( var i = 0 ; i < context.tiles.length ; i++ ) {
            var tile = context.tiles[i];
            var tb_north = tile.bounds.north;
            var tb_south = tile.bounds.south;
            if ( point.lat > tb_north || point.lat < tb_south )
                continue;
            var tb_east = tile.bounds.east;
            if ( tb_east < -10800 )
                tb_east += 21600;
            else if ( tb_east >= 10800 )
                tb_east -= 21600;
            var tb_west = tile.bounds.west;
            if ( tb_west < -10800 )
                tb_west += 21600;
            else if ( tb_west >= 10800 )
                tb_west -= 21600;
            if ( tb_west < tb_east ) {
                if ( point.lon > tb_east || point.lon < tb_west )
                    continue;
            }
            else {
                if ( point.lon > tb_east && point.lon < tb_west )
                    continue;
            }
            var data_tile = data._handler().getTile(content, tile.id);
            if ( data_tile ) {
                var lat = point.latDegree();
                var lon = point.lonDegree();
                var i = 0;
                var y = 0;
                while ( y < 256 && tile.cood[i] > lat ) {
                    y++;
                    i += 512;
                }
                var x = 0;
                while ( x < 256 ) {
                    var cx = tile.cood[i+1];
                    if ( cx < 0 )
                        cx += 360;
                    else if ( cx >= 180 )
                        cx -= 360;
                    if ( lon <= cx )
                        break;
                    x++;
                    i += 2;
                }
                var index = (y*256+x)*4;
                return {
                    data:[data_tile.data[index],data_tile.data[index+1],data_tile.data[index+2],data_tile.data[index+3]]
                }
            }
            break;
        }
        return null;
    }
}



WRAP.Geo.Renderer.GridValue = function() {

    this.style_revision;
    this.context_revision;
    
    this.draw = function(layer, content, conf, context, style, data, revision, dl) {
        
        if ( this.revision && this.revision.context == revision.context )
            return;
        
        if ( this.style_revision != revision.style ) {
            this.style_revision = revision.style;
        }
        
        var data_offset = conf.Attributes.data_offset || 0;
        
        var s = conf.Attributes.style.default;
        if ( style && conf.Attributes.style[style] )
            s = conf.Attributes.style[style];
        if ( !s )
            return;

        var sampling = "value";
        
        var data_tile = [];
        for ( var i = 0 ; i < context.tiles.length ; i++ ) {
            var tile = context.tiles[i];
            if ( !(data_tile[i] = data._handler().getTile(content, tile.id, sampling)) ) {
                data._handler().loadTile(content, tile.id, sampling, tile.z, tile.y, tile.x, tile.cood, tile.bounds,
                    function() {
                        WRAP.Geo.redraw(layer);
                    });
                return;
            }
        }
        
        var data_offset = conf.Attributes.data_offset || 0;
        var digit = (s.fractional_digits===undefined)?1:parseInt(s.fractional_digits);
        var offsetX = s.offset_x || 0;
        var offsetY = s.offset_y || 0;

        dl.length = 0;
        for ( var i = 0 ; i < data_tile.length ; i++ ) {
            var data = data_tile[i].data;
            for ( var j = 0 ; j < data.length ; j++ ) {
                var v = data[j];
                if ( !v.value || isNaN(v.value) )
                    continue;
                
                var text = (v.value+data_offset).toFixed(digit);
                var feature;
                feature = new WRAP.Geo.Feature.Text({
                    point:[v.lon,v.lat],
                    text:text,
                    fontSize:14,
                    fillStyle:s.color,
                    offsetX:offsetX,
                    offsetY:offsetY,
                    align:'center'
                });
                dl.push(feature);
            }
        }

        this.context_revision = context.revision;
        WRAP.Geo.invalidate();
    }
}



WRAP.Geo.Renderer.WindArrow = function() {

    this.style_revision;
    this.context_revision;
    
    this.image = null;
    this.arrow_step = 0;
    this.image_width = 32;
    this.image_height = 64;
    
    this.draw = function(layer, content, conf, context, style, data, revision, dl) {
        
        if ( this.revision && this.revision.context == revision.context )
            return;
        
        if ( this.style_revision != revision.style ) {
            this.style_revision = revision.style;
        }
        
        var data_offset = conf.Attributes.data_offset || 0;
        
        var s = conf.Attributes.style.default;
        if ( style && conf.Attributes.style[style] )
            s = conf.Attributes.style[style];
        if ( !s )
            return;
        
        function makeWindArrow(image, canvas, ctx, face) {
            for ( var w = 5 ; w < 200 ; w+= 5) {
                ctx.clearRect(0,0,canvas.width,canvas.height);
                
                var scale = 1.5;
                var offsetY = 4;
                var lastY = 24;
                var center = {x:canvas.width/2, y:canvas.height-1};
                var n = w;
                n *= 2;
                n /= 10;
                n = Math.round(n);
                n *= 10;
                n /= 2;
                if(n>=50) lastY += 5*Math.floor(n/50);
                if(n>0) {
                    ctx.beginPath();
                    ctx.moveTo(center.x, center.y);
                    ctx.lineTo(center.x, center.y+(-lastY - (n<6 ? 4 : 0))*scale);
                    ctx.stroke();
                };
                while(n>=50) {
                    ctx.beginPath();
                    ctx.moveTo(center.x, center.y+(-lastY)*scale);
                    ctx.lineTo(center.x +(10*face)*scale, center.y+(-lastY+1.5)*scale);
                    ctx.lineTo(center.x, center.y+(-lastY+5)*scale);
                    ctx.lineTo(center.x, center.y+(-lastY)*scale);
                    ctx.stroke();
                    n -= 50;
                    lastY -= (offsetY+2.5);
                }
                if(w > 50) lastY -= 2;
                while(n>=10) {
                    ctx.moveTo(center.x, center.y+(-lastY)*scale);
                    ctx.lineTo(center.x+(10*face)*scale, center.y+(-lastY-4)*scale);
                    n -= 10;
                    lastY -= offsetY;
                }
                if(n>=5) {
                    ctx.moveTo(center.x, center.y+(-lastY)*scale);
                    ctx.lineTo(center.x+(7*face)*scale, center.y+(-lastY-3)*scale);
                    n -= 5;
                    lastY -= offsetY;
                }
                ctx.stroke();
                image.push(ctx.getImageData(0,0,canvas.width,canvas.height));
            }
        }
        
        function makeCalmLine(image, canvas, ctx) {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            var scale = 1.5;
            var lastY = 24;
            var center = {x:canvas.width/2, y:canvas.height-1};
            ctx.beginPath();
            ctx.moveTo(center.x, center.y);
            ctx.lineTo(center.x, center.y+(-lastY-4)*scale);
            ctx.stroke();
            image.push(ctx.getImageData(0,0,canvas.width,canvas.height));
        }
        
        function makeCalmMark(image, canvas, ctx) {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(canvas.width/2,canvas.height-6,3,0,Math.PI*2,true);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
            image.push(ctx.getImageData(0,0,canvas.width,canvas.height));
        }
        
        if ( !this.image ) {
            this.image = [];
            
            var canvas = document.createElement('canvas');
            canvas.width = this.image_width;
            canvas.height = this.image_height;
            var ctx = canvas.getContext("2d");
            
            ctx.strokeStyle = s.color;
            ctx.fillStyle = s.color;
            ctx.lineCap = 'round';
            ctx.lineWidth = 1.5;
            
            makeWindArrow(this.image, canvas, ctx, 1.0);
            this.arrow_step = this.image.length;
            makeWindArrow(this.image, canvas, ctx, -1.0);
            makeCalmLine(this.image, canvas, ctx);
            makeCalmMark(this.image, canvas, ctx);
        }

        var sampling = "value";
        
        var data_tile = [];
        for ( var i = 0 ; i < context.tiles.length ; i++ ) {
            var tile = context.tiles[i];
            if ( !(data_tile[i] = data._handler().getTile(content, tile.id, sampling)) ) {
                data._handler().loadTile(content, tile.id, sampling, tile.z, tile.y, tile.x, tile.cood, tile.bounds,
                    function() {
                        WRAP.Geo.redraw(layer);
                    });
                return;
            }
        }
        
        var data_offset = conf.Attributes.data_offset || 0;

        dl.length = 0;
        for ( var i = 0 ; i < data_tile.length ; i++ ) {
            var data = data_tile[i].data;
            for ( var j = 0 ; j < data.length ; j++ ) {
                var v = data[j];
                if ( !v.value || v.value.length != 2 || isNaN(v.value[0]) || isNaN(v.value[1]) )
                    continue;
                
                var u_spd = v.value[0]+data_offset;
                var v_spd = v.value[1]+data_offset;
                var speed = Math.sqrt(u_spd*u_spd + v_spd*v_spd) / 0.514;
                speed = Math.round(speed);
                
                var dir = 0;
                if ( speed > 0 ) {
                    dir = Math.atan2(u_spd, v_spd) * (180 / Math.PI);
                    dir -= 180;
                    if (dir < 0) {
                        dir += 360;
                    }
                }
                var i_spd = Math.floor(speed);
                var i_dir = Math.floor(dir);
                var i_dir = i_spd?(i_dir||360):0;
                var speed_text = i_spd+"KT";
                var direction_text = i_spd?(('000'+i_dir).slice(-3)):"";
                
                var feature;
                var iw = this.image_width*0.6;
                var ih = this.image_height*0.6;
                
                var index = Math.floor((speed+2.0)/5.0) -1;
                if ( index >= this.arrow_step )
                    index = this.arrow_step-1;
                var r = dir;
                var x = -iw/2;
                var y = -ih;
                if ( index == -1 ) {
                    if ( Math.floor(speed) > 0 ) {
                        index = this.image.length-2;
                    }
                    else {
                        r = 0;
                        y += 5;
                        index = this.image.length-1;
                    }
                }
                else {
                    if ( v.lat < 0 )
                        index += this.arrow_step;
                }
                feature = new WRAP.Geo.Feature.Image({
                    point:[v.lon,v.lat],
                    image:this.image[index],
                    width:iw,
                    height:ih,
                    offsetX:x,
                    offsetY:y,
                    rotation:r
                });
                dl.push(feature);
                feature.geo = {
                    geometry: {
                        type:"Point",
                        coordinates:[v.lon,v.lat]
                    },
                    properties: {
                        u:u_spd,
                        v:v_spd,
                        speed:speed,
                        direction:dir,
                        speed_text:speed_text,
                        direction_text:direction_text,
                    }
                };
                
/*
                    var text = speed.toFixed(digit);
                    feature = new WRAP.Geo.Feature.Text({
                        point:[v.lon,v.lat],
                        text:text,
                        fontSize:14,
                        fillStyle:s.color,
                        offsetX:offsetX,
                        offsetY:offsetY,
                        align:'center'
                    });
                    dl.push(feature);
*/
            }
        }
        
        this.context_revision = context.revision;
        WRAP.Geo.invalidate();
    }
}



WRAP.Geo.Renderer.DataJSON = function() {
    
    this.draw = function(layer, content, conf, context, style, data, revision, dl) {
        style = null;
        content = null;
        context = null;
        
        var root = data.query("data").value();
        if ( !root || !root.position || !root.data ) {
            return;
        }
        
        var valid = true;
        if ( this.content_revision != revision.content ) {
            valid = false;
        }
        
        if ( this.conf_revision != revision.conf ) {
            valid = false;
        }
        
        if ( this.style_revision != revision.style ) {
            valid = false;
        }
        
        if ( this.data_revision != revision.data ) {
            valid = false;
        }
        
        if ( valid )
            return;
        
//console.log("draw:"+layer.name());
layer = null;
        
        dl.length = 0;

        var style_name = "default";
        
        var features = root.position.features;
        if ( !features ) {
            features = [];
            if ( root.position.type == "Feature" )
                features.push(root.position);
        }
        
        var render_types = conf.Attributes.features;
        var data_conf = data._handler().conf;
        var geo_id = data_conf.Attributes.DataStructure.geo_position_key || 'position_id';
        var data_id = data_conf.Attributes.DataStructure.data_position_key || 'position_id';
        
        var geo_feature = {};
        
        var duplicated = 0;
        
        var length = features.length;
        for ( var i = 0 ; i < length ; i++ ) {
            var item = features[i];
            var prop = item.properties;
            if ( !prop )
                continue;
            var geometry = item.geometry;
            if ( !geometry )
                continue;
            var id = prop[geo_id];
            if ( geo_feature[id] )
                duplicated++;
            geo_feature[id] = item;
        }

        function drawItem(item, id) {
            var style = null;
            for ( var j = 0 ; j < render_types.length ; j++ ) {
                var selector = render_types[j].selector;
                if ( selector ) {
                    if ( selector.type == "key_value" ) {
                        if ( item[selector.key] == selector.value ) {
                            style = render_types[j].style;
                            break;
                        }
                    }
                }
                else {
                    style = render_types[j].style;
                    break;
                }
            }
            
            var ts = style && style[style_name];
            if ( !ts )
                return;
        
            var geo = geo_feature[id];
            if ( !geo )
                return;
            
            var geometry = geo.geometry;
            if ( !geometry )
                return;

            if ( item.display_flag === false )
                return;
            
            if ( geometry.type == "Point" ) {
                var point = geometry.coordinates;
                if ( ts.type == "image" ) {
                    var feature = new WRAP.Geo.Feature.Image({
                        point:point,
                        image:ts.url,
                        width:ts.width,
                        height:ts.height,
                        offsetX:ts.offset_x,
                        offsetY:ts.offset_y,
                        rotation:ts.rotation
                    });
                    feature.geo = geo;
                    feature.data = item;
                    dl.push(feature);
                }
                else if ( ts.type == "point" ) {
                    var feature = new WRAP.Geo.Feature.Point({
                        point:point,
                        strokeStyle:ts.line_color,
                        strokeWidth:ts.line_width,
                        fillStyle:ts.point_color,
                        pointSize:ts.point_size,
                        sensorSize:ts.sensor_size
                    });
                    feature.geo = geo;
                    feature.data = item;
                    dl.push(feature);
                }
            }
            else if ( geometry.type == "MultiPoint" ) {
                for ( var k = 0 ; k < geometry.coordinates.length ; k++ ) {
                    var point = geometry.coordinates[k];
                    if ( ts.type == "image" ) {
                        var feature = new WRAP.Geo.Feature.Image({
                            point:point,
                            image:ts.url,
                            width:ts.width,
                            height:ts.height,
                            offsetX:ts.offset_x,
                            offsetY:ts.offset_y,
                            rotation:ts.rotation
                        });
                        feature.geo = geo;
                        feature.data = item;
                        dl.push(feature);
                    }
                    else if ( ts.type == "point" ) {
                        var feature = new WRAP.Geo.Feature.Point({
                            point:point,
                            strokeStyle:ts.line_color,
                            strokeWidth:ts.line_width,
                            fillStyle:ts.point_color,
                            pointSize:ts.point_size,
                            sensorSize:ts.sensor_size
                        });
                        feature.geo = geo;
                        feature.data = item;
                        dl.push(feature);
                    }
                }
            }
            else if ( geometry.type == "LineString" || geometry.type == "MultiLineString" ) {
                var points = geometry.coordinates;
                if ( points ) {
                    var feature = new WRAP.Geo.Feature.GeoLine({
                        path:points,
                        lineWidth:ts.line_width,
                        strokeStyle:ts.line_color
                    });
                    feature.geo = geo;
                    feature.data = item;
                    dl.push(feature);
                }
            }
            else if ( geometry.type == "Polygon" ) {
                var points = geometry.coordinates;
                if ( points ) {
                    var feature = new WRAP.Geo.Feature.GeoLine({
                        path:points,
                        lineWidth:ts.line_width,
                        strokeStyle:ts.line_color,
                        fillStyle:ts.fill_color,
                        fillImage:ts.fill_image
                    });
                    feature.geo = geo;
                    feature.data = item;
                    dl.push(feature);
                }
            }
            else if ( geometry.type == "MultiPolygon" ) {
                for ( var l = 0 ; l < geometry.coordinates.length ; l++ ) {
                    var points = geometry.coordinates[l];
                    if ( points ) {
                        var feature = new WRAP.Geo.Feature.GeoLine({
                            path:points,
                            lineWidth:ts.line_width,
                            strokeStyle:ts.line_color,
                            fillStyle:ts.fill_color,
                            fillImage:ts.fill_image
                        });
                        feature.geo = geo;
                        feature.data = item;
                        dl.push(feature);
                    }
                }
            }
        }
        
        var count = 0;
        if ( Array.isArray(root.data.data) ) {
            count = root.data.data.length;
            for ( var i = 0 ; i < count ; i++ ) {
                var item = root.data.data[i];
                var id = item[data_id];
                drawItem(item, id);
            }
        }
        else {
            for ( var key in root.data.data ) {
                var item = root.data.data[key];
                drawItem(item, key);
                count++;
            }
        }
        
        this.content_revision = revision.content;
        this.conf_revision = revision.conf;
        this.style_revision = revision.style;
        this.data_revision = revision.data;
        WRAP.Geo.invalidate();
        //console.log("  display list -> "+dl.length);
    }
}


WRAP.Geo.Renderer.GeoJSON = function() {

    this.initialized = false;
    
    this.draw = function(layer, content, conf, context, style, data, revision, dl) {
        WRAP.Geo.check(layer, content, conf, context, style, data, revision, dl);
        
        var features = [];
        
        var current_zoom = -1;
        if ( context && context.tiles.length )
            current_zoom = context.zoom;
        
        var tiled = data._handler().tiled();
        if ( !tiled ) {
            var root = data.query("data").value();
            if ( !root ) {
                if ( !this.initialized ) {
                    this.initialized = true;
                    data.load(function() {
                        WRAP.Geo.redraw(layer);
                    });
                }
                return;
            }
            
            if ( !conf.Attributes.min_zoom ) {
                if ( this.content_revision == revision.content
                 &&  this.conf_revision == revision.conf
                 &&  this.style_revision == revision.style
                 &&  this.data_revision == revision.data )
                    return;
            }
            else {
                if ( this.last_zoom == current_zoom
                 &&  this.content_revision == revision.content
                 &&  this.conf_revision == revision.conf
                 &&  this.style_revision == revision.style
                 &&  this.data_revision == revision.data )
                    return;
            }
            
            if ( !(features = root.features) ) {
                features = [];
                if ( root.type == "Feature" )
                    features.push(root);
            }
        }
        else {
            if ( this.content_revision == revision.content
             &&  this.context_revision == revision.context
             &&  this.conf_revision == revision.conf
             &&  this.style_revision == revision.style
             &&  this.data_revision == revision.data )
                return;
            
            var gd = data._handler().getData(content, context);
            if ( !gd ) {
                data._handler().loadData(content, context, function() {
                    WRAP.Geo.redraw(layer);
                });
                return;
            }
            
            for ( var i = 0 ; i < gd.length ; i++ ) {
                var fc = gd[i].features;
                if ( fc ) {
                    for ( var j = 0 ; j < fc.length ; j++ )
                        features.push(fc[j]);
                }
                else if ( gd[i].type == "Feature" ) {
                    features.push(gd[i]);
                }
            }
        }
        
        //console.log("draw:"+layer.name());
        
        dl.length = 0;

        if ( !conf.Attributes.min_zoom || current_zoom >= conf.Attributes.min_zoom ) {

            var style_name = style||"default";
            
            var render_types = conf.Attributes.features;
            var length = features.length;
            for ( var i = 0 ; i < length ; i++ ) {
                var item = features[i];
                var geometry = item.geometry;
                if ( !geometry )
                    continue;
                var prop = item.properties;
                if ( prop && prop.display_flag === false )
                    continue;
                
                var style = null;
                for ( var j = 0 ; j < render_types.length ; j++ ) {
                    var selector = render_types[j].selector;
                    if ( selector ) {
                        if ( selector.type == "key_value" ) {
                            if ( prop[selector.key] == selector.value ) {
                                style = render_types[j].style;
                                break;
                            }
                        }
                    }
                    else {
                        style = render_types[j].style;
                        break;
                    }
                }
                
                var ts = style && style[style_name];
                if ( !ts )
                    continue;
                
                var geodesic = (ts.geodesic === undefined || ts.geodesic === true);
                
                if ( geometry.type == "Point" ) {
                    var point = geometry.coordinates;
                    if ( ts.type == "image" ) {
                        var feature = new WRAP.Geo.Feature.Image({
                            point:point,
                            image:ts.url,
                            width:ts.width,
                            height:ts.height,
                            offsetX:ts.offset_x,
                            offsetY:ts.offset_y,
                            rotation:ts.rotation
                        });
                        feature.geo = item;
                        dl.push(feature);
                    }
                    else if ( ts.type == "point" ) {
                        var feature = new WRAP.Geo.Feature.Point({
                            point:point,
                            strokeStyle:ts.line_color,
                            strokeWidth:ts.line_width,
                            fillStyle:ts.point_color,
                            pointSize:ts.point_size,
                            sensorSize:ts.sensor_size
                        });
                        feature.geo = item;
                        dl.push(feature);
                    }
                }
                else if ( geometry.type == "MultiPoint" ) {
                    for ( var k = 0 ; k < geometry.coordinates.length ; k++ ) {
                        var point = geometry.coordinates[k];
                        if ( ts.type == "image" ) {
                            var feature = new WRAP.Geo.Feature.Image({
                                point:point,
                                image:ts.url,
                                width:ts.width,
                                height:ts.height,
                                offsetX:ts.offset_x,
                                offsetY:ts.offset_y,
                                rotation:ts.rotation
                            });
                            feature.geo = item;
                            dl.push(feature);
                        }
                        else if ( ts.type == "point" ) {
                            var feature = new WRAP.Geo.Feature.Point({
                                point:point,
                                strokeStyle:ts.line_color,
                                strokeWidth:ts.line_width,
                                fillStyle:ts.point_color,
                                pointSize:ts.point_size,
                                sensorSize:ts.sensor_size
                            });
                            feature.geo = item;
                            dl.push(feature);
                        }
                    }
                }
                else if ( geometry.type == "LineString" || geometry.type == "MultiLineString" ) {
                    var points = geometry.coordinates;
                    if ( points ) {
                        var feature = new WRAP.Geo.Feature.GeoLine({
                            path:points,
                            lineWidth:ts.line_width,
                            strokeStyle:ts.line_color,
                            option:ts.option,
                            geodesic:geodesic
                        });
                        feature.geo = item;
                        dl.push(feature);
                    }
                }
                else if ( geometry.type == "Polygon" ) {
                    var points = geometry.coordinates;
                    if ( points ) {
                        var feature = new WRAP.Geo.Feature.GeoLine({
                            path:points,
                            lineWidth:ts.line_width,
                            strokeStyle:ts.line_color,
                            fillStyle:ts.fill_color,
                            fillImage:ts.fill_image,
                            option:ts.option,
                            geodesic:geodesic
                        });
                        feature.geo = item;
                        dl.push(feature);
                    }
                }
                else if ( geometry.type == "MultiPolygon" ) {
                    for ( var l = 0 ; l < geometry.coordinates.length ; l++ ) {
                        var points = geometry.coordinates[l];
                        if ( points ) {
                            var feature = new WRAP.Geo.Feature.GeoLine({
                                path:points,
                                lineWidth:ts.line_width,
                                strokeStyle:ts.line_color,
                                fillStyle:ts.fill_color,
                                fillImage:ts.fill_image,
                                geodesic:geodesic
                            });
                            feature.geo = item;
                            dl.push(feature);
                        }
                    }
                }
            }
        }
        
        this.content_revision = revision.content;
        this.context_revision = revision.context;
        this.conf_revision = revision.conf;
        this.style_revision = revision.style;
        this.data_revision = revision.data;
        this.last_zoom = current_zoom;
        WRAP.Geo.invalidate();
        //console.log("  display list -> "+dl.length);
    }
}


WRAP.Geo.Renderer.Lightning = function() {
    
    this.draw = function(layer, content, conf, context, style, data, revision, dl) {
        context = null;
        content = null;
        style = null;
        
        var root = data.query("data").value();
        if ( !root )
            return;
        
        var valid = true;
        if ( this.conf_revision != revision.conf ) {
            valid = false;
        }
        
        if ( this.data_revision != revision.data ) {
            valid = false;
        }
        
        if ( valid )
            return;
        
        console.log("draw:"+layer.name());
        
        var style = conf.Attributes.style.default;
        var icon_width = style.icon_width;
        var icon_height = style.icon_height;
        var icon_offset_x = style.icon_offset_x;
        var icon_offset_y = style.icon_offset_y;
        var icon = style.icon;
        
        dl.length = 0;
        
        
        var features = root.features;
        if ( !features ) {
            features = [];
            if ( root.type == "Feature" )
                features.push(root);
        }
        
        var length = features.length;
        for ( var i = 0 ; i < length ; i++ ) {
            var item = features[i];
            var geometry = item.geometry;
            if ( !geometry )
                continue;
            if ( geometry.type == "Point" ) {
                var prop = item.properties;
                if ( prop && prop.display_flag === false )
                    continue;
                
                var ct = WRAP.Core.currentTime();
                var dt = new WRAP.Core.DateTime(prop.obs_time);
                var e = dt.diff(ct)/60;
                //console.log("currentTime "+ct.text()+" dataTime="+dt.text()+" diff_min="+e);
                for ( var j = 0 ; j < icon.length ; j++ ) {
                    if ( parseInt(icon[j].ge) <= e && e < parseInt(icon[j].lt) ) {
                        var point = geometry.coordinates;
                        var feature = new WRAP.Geo.Feature.Image({
                            point:point,
                            image:icon[j].image,
                            width:icon_width,
                            height:icon_height,
                            offsetX:icon_offset_x,
                            offsetY:icon_offset_y,
                        });
                        feature.geo = item;
                        dl.push(feature);
                        break;
                    }
                }
            }
        }
        this.conf_revision = revision.conf;
        this.style_data = revision.data;
        WRAP.Geo.invalidate();
    }
}


WRAP.Geo.Renderer.SIGWX = function() {

    this.draw = function(layer, content, conf, context, style, data, revision, dl) {
        
        var valid = true;
        if ( this.content_revision != revision.content ) {
            valid = false;
        }
        
//        if ( this.context_revision != revision.context ) {
            valid = false;
//        }
        
        if ( this.conf_revision != revision.conf ) {
            valid = false;
        }
        
        if ( valid )
            return;
        
        var gd = data._handler().getData(content, context);
        if ( !gd ) {
            data._handler().loadData(content, context, function() {
                WRAP.Geo.redraw(layer);
            });
            return;
        }
        
        dl.length = 0;
        
        var features = [];
        for ( var i = 0 ; i < gd.length ; i++ ) {
            var fc = gd[i].features;
            if ( fc ) {
                for ( var j = 0 ; j < fc.length ; j++ )
                    features.push(fc[j]);
            }
            else if ( gd[i].type == "Feature" ) {
                features.push(gd[i]);
            }
        }

        var style = conf.Attributes;
        
        var length = features.length;
        
        function center(points) {
            if ( Array.isArray(points[0]) )
                points = points[0];
            var cps = [];
            var size = WRAP.Geo.getSize();
            var sp = WRAP.Geo.getScreenLine(points);
            if ( !sp )
                return cps;
            for ( var i = 0 ; i < sp.length ; i++ ) {
                var line = sp[i];
                var minX = 9999;	var maxX = -9999;
                var minY = 9999;	var maxY = -9999;
                for ( var j = 0 ; j < line.length ; j++ ) {
                    var x = line[j].x;
                    var y = line[j].y;
                    if ( y < 0 || size.height <= y )
                        continue;
                    if ( x < 0 || size.width <= x )
                        continue;
                    if ( minX > x )
                        minX = x;
                    if ( maxX < x )
                        maxX = x;
                    if ( minY > y )
                        minY = y;
                    if ( maxY < y )
                        maxY = y;
                }
                if ( maxX > 0 && maxY > 0 ) {
                    var x = (minX+maxX)/2.0;
                    var y = (minY+maxY)/2.0;
                    var point = WRAP.Geo.getPoint(new WRAP.Geo.ScreenPoint(x,y));
                    cps.push([point.lonDegree(), point.latDegree()]);
                }
            }
            return cps;
        }
        
        function flightLevel(fl) {
            return (fl && Math.round(fl/30.48)) || "XXX";
        }
        
        var illegal_altitude = "-99999";
        var feature;
        // Turbulence
        for ( var i = 0 ; i < length ; i++ ) {
            var item = features[i];
            var geometry = item.geometry;
            if ( !geometry )
                continue;
            var prop = item.properties;
            if ( prop.contents_kind == "TURBULENCE" ) {
                var line_color, mark, mark_center;
                if ( prop.extended_degree == 6 ) {
                    line_color = style.turbulence_color_mod;
                    mark = [
                        [[0,0],[0,0]],
                        [[0,2],[1,2],[2,1],[3,2],[4,2]]
                    ];
                    mark_center = 2;
                }
                else if ( prop.extended_degree == 7 ) {
                    line_color = style.turbulence_color_sev;
                    mark = [
                        [[1,1],[2,0],[3,1]],
                        [[0,2],[1,2],[2,1],[3,2],[4,2]]
                    ];
                    mark_center = 2;
                }
                else {
                    line_color = style.turbulence_color_mod_to_sev;
                    mark = [
                        [[0,2],[1,2],[2,1],[3,2],[4,2]],
                        [[6,1],[7,0],[8,1]],
                        [[5,2],[6,2],[7,1],[8,2],[9,2]]
                    ];
                    mark_center = 4.5;
                }
                
                var points = geometry.coordinates;
                if ( points ) {
                    feature = new WRAP.Geo.Feature.GeoLine({
                        path:points,
                        lineWidth:style.turbulence_line_width,
                        strokeStyle:line_color,
                        lineDash:[12,12]
                    });
                    dl.push(feature);
                }
                var cps = center(points);
                if ( cps && cps.length ) {
                    for ( var m = 0 ; m < cps.length ; cps++ ) {
                        var pos = cps[m];
                        var hi = null, lo = null;
                        if ( prop.altitudes.length == 1 )
                            hi = prop.altitudes[0];
                        else if ( prop.altitudes.length == 2 )
                            lo = prop.altitudes[0], hi = prop.altitudes[1];
                        feature = new WRAP.Geo.Feature.Text({
                            point:pos,
                            text:flightLevel(hi),
                            fontSize:11,
                            fillStyle:style.turbulence_label_color,
                            offsetX:0,
                            offsetY:0,
                            align:'center'
                        });
                        dl.push(feature);
                        feature = new WRAP.Geo.Feature.Text({
                            point:pos,
                            text:flightLevel(lo),
                            fontSize:11,
                            fillStyle:style.turbulence_label_color,
                            offsetX:0,
                            offsetY:12,
                            align:'center'
                        });
                        dl.push(feature);
                        
                        if ( mark ) {
                            var scale = 4;
                            for ( var j = 0 ; j < mark.length ; j++ ) {
                                var line = mark[j];
                                for ( var k = 0 ; k < line.length ; k++ ) {
                                    var p = line[k];
                                    p[0] = p[0]*scale-mark_center*scale;
                                    p[1] = p[1]*scale-24;
                                }
                            }
                            feature = new WRAP.Geo.Feature.Line({
                                point:pos,
                                line:mark,
                                lineWidth:1,
                                strokeStyle:style.turbulence_label_color
                            });
                            dl.push(feature);
                        }
                    }
                }
            }
        }
        // Cloud
        var orientation = (style.cloud_line_orientation == 'counterclockwise')
                        ? 'counter_cloud':'cloud';
        for ( var i = 0 ; i < length ; i++ ) {
            var item = features[i];
            var geometry = item.geometry;
            if ( !geometry )
                continue;
            var prop = item.properties;
            if ( prop.contents_kind == "CLOUD" ) {
                var points = geometry.coordinates;
                if ( points ) {
                    feature = new WRAP.Geo.Feature.GeoLine({
                        path:points,
                        lineWidth:style.cloud_line_width,
                        strokeStyle:style.cloud_line_color,
                        option:orientation
                    });
                    dl.push(feature);
                }
                var cps = center(points);
                if ( cps && cps.length ) {
                    for ( var m = 0 ; m < cps.length ; cps++ ) {
                        var pos = cps[m];
                        if (prop.cloud_distribution) {
                            var y = -36;
                            var arr = prop.cloud_distribution.split("/");
                            for (var k = 0; k < arr.length; k++) {
                                feature = new WRAP.Geo.Feature.Text({
                                    point:pos,
                                    text:arr[k],
                                    fontSize:11,
                                    fillStyle:style.turbulence_label_color,
                                    offsetX:0,
                                    offsetY:(y+=12),
                                    align:'center'
                                });
                                dl.push(feature);
                            }
                            feature = new WRAP.Geo.Feature.Text({
                                point:pos,
                                text:prop.cloud_type,
                                fontSize:11,
                                fillStyle:style.turbulence_label_color,
                                offsetX:0,
                                offsetY:(y+=12),
                                align:'center'
                            });
                            dl.push(feature);
                            var fl1 = "XXX";
                            var fl2 = "XXX";
                            if (0 < prop.altitudes.length) fl1 = flightLevel(prop.altitudes[0]);
                            if (1 < prop.altitudes.length) fl2 = flightLevel(prop.altitudes[1]);
                            feature = new WRAP.Geo.Feature.Text({
                                point:pos,
                                text:fl1,
                                fontSize:11,
                                fillStyle:style.turbulence_label_color,
                                offsetX:0,
                                offsetY:(y+=12),
                                align:'center'
                            });
                            dl.push(feature);
                            feature = new WRAP.Geo.Feature.Text({
                                point:pos,
                                text:fl2,
                                fontSize:11,
                                fillStyle:style.turbulence_label_color,
                                offsetX:0,
                                offsetY:(y+=12),
                                align:'center'
                            });
                            dl.push(feature);
                        }
                        else {
                            if (prop.extended_degree) {
                                var fl_top = "XXX";
                                var fl_base = "XXX";
                                if (prop.airframe_icing) {
                                    if (3 < prop.altitudes.length) {
                                        if (prop.altitudes[0] != illegal_altitude) fl_base = flightLevel(prop.altitudes[0]);
                                        if (prop.altitudes[1] != illegal_altitude) fl_top = flightLevel(prop.altitudes[1]);
                                    }
                                } else {
                                    if (1 < prop.altitudes.length) {
                                        if (prop.altitudes[0] != illegal_altitude) fl_base = flightLevel(prop.altitudes[0]);
                                        if (prop.altitudes[1] != illegal_altitude) fl_top = flightLevel(prop.altitudes[1]);
                                    }
                                }
                                var icon;
                                if ( prop.extended_degree == 2 )
                                    icon = style.cloud_turb_mod_icon;
                                else if ( prop.extended_degree == 3 )
                                    icon = style.cloud_turb_sev_icon;
                                
                                var y = -26;
                                if ( icon ) {
                                    feature = new WRAP.Geo.Feature.Image({
                                        point:pos,
                                        image:icon,
                                        width:style.cloud_icon_width,
                                        height:style.cloud_icon_height,
                                        offsetX:-style.cloud_icon_width/2-6,
                                        offsetY:(y+6),
                                    });
                                    dl.push(feature);
                                }
                                feature = new WRAP.Geo.Feature.Text({
                                    point:pos,
                                    text:fl_top,
                                    fontSize:11,
                                    fillStyle:style.turbulence_label_color,
                                    offsetX:14,
                                    offsetY:(y+=12),
                                    align:'center'
                                });
                                dl.push(feature);
                                feature = new WRAP.Geo.Feature.Text({
                                    point:pos,
                                    text:fl_base,
                                    fontSize:11,
                                    fillStyle:style.turbulence_label_color,
                                    offsetX:14,
                                    offsetY:(y+=12),
                                    align:'center'
                                });
                                dl.push(feature);
                            }
                            
                            if (prop.airframe_icing) {
                                var icing_type = 'MOD';
                                var icon = style.cloud_ice_mod_icon;
                                if (prop.airframe_icing.lastIndexOf('MOD', 0) === 0) { // "MOD  (CLOUD)" val=5
                                    icing_type = 'MOD';
                                } else if (prop.airframe_icing.lastIndexOf('SEV', 0) === 0) { // "SEV  (CLOUD)" val=8
                                    icing_type = 'SEV';
                                    icon = style.cloud_ice_sev_icon;
                                }
                                
                                
                                var fl_top = "XXX";
                                var fl_base = "XXX";
                                if (prop.extended_degree) {
                                    if (3 < prop.altitudes.length) {
                                        if (prop.altitudes[2] != illegal_altitude) fl_base = flightLevel(prop.altitudes[2]);
                                        if (prop.altitudes[3] != illegal_altitude) fl_top = flightLevel(prop.altitudes[3]);
                                    }
                                } else {
                                    if (1 < prop.altitudes.length) {
                                        if (prop.altitudes[0] != illegal_altitude) fl_base = flightLevel(prop.altitudes[0]);
                                        if (prop.altitudes[1] != illegal_altitude) fl_top = flightLevel(prop.altitudes[1]);
                                    }
                                }
                                var y = -2;
                                feature = new WRAP.Geo.Feature.Image({
                                    point:pos,
                                    image:icon,
                                    width:style.cloud_icon_width,
                                    height:style.cloud_icon_height,
                                    offsetX:-style.cloud_icon_width/2-6,
                                    offsetY:(y+6),
                                });
                                dl.push(feature);
                                feature = new WRAP.Geo.Feature.Text({
                                    point:pos,
                                    text:fl_top,
                                    fontSize:11,
                                    fillStyle:style.turbulence_label_color,
                                    offsetX:14,
                                    offsetY:(y+=12),
                                    align:'center'
                                });
                                dl.push(feature);
                                feature = new WRAP.Geo.Feature.Text({
                                    point:pos,
                                    text:fl_base,
                                    fontSize:11,
                                    fillStyle:style.turbulence_label_color,
                                    offsetX:14,
                                    offsetY:(y+=12),
                                    align:'center'
                                });
                                dl.push(feature);
                            }
                        }
                    }
                }
            }
        }
        // VOLCANO
        for ( var i = 0 ; i < length ; i++ ) {
            var item = features[i];
            var geometry = item.geometry;
            if ( !geometry )
                continue;
            var prop = item.properties;
            if ( prop.contents_kind == "VOLCANO" ) {
                for ( var k = 0 ; k < geometry.coordinates.length ; k++ ) {
                    var point = geometry.coordinates[k];
                    feature = new WRAP.Geo.Feature.Image({
                        point:point,
                        image:style.volcano_icon,
                        width:style.volcano_icon_width,
                        height:style.volcano_icon_height,
                        offsetX:-style.volcano_icon_width/2,
                        offsetY:-style.volcano_icon_height/2
                    });
                    feature.geo = item;
                    dl.push(feature);
                    feature = new WRAP.Geo.Feature.Text({
                        point:point,
                        text:prop.feature_name,
                        fontSize:11,
                        fillStyle:style.volcano_label_color,
                        offsetX:2,
                        offsetY:22,
                        align:'left'
                    });
                    dl.push(feature);
                }
            }
        }
        // JET STREAM
        var knotBaseLen = 12;
        var knotHeight = 20;
        var fiftyKnotSpacing = -3;
        var tenAndFiveKnotSpacing = -6;
        var changeMarkLen = 20;
        var changeMarkSpacing = 4;
        var capLen = 12;
        
        for ( var i = 0 ; i < length ; i++ ) {
            var item = features[i];
            var geometry = item.geometry;
            if ( !geometry )
                continue;
            var prop = item.properties;
            if ( prop.contents_kind == "JET STREAM" ) {
                var points = geometry.coordinates;
                var attrbs = prop.points;
                
                for ( var j = 0 ; j < points.length ; j++ ) {
                    var lines = WRAP.Geo.getScreenLine(points[j]);
                    var isSouth = (points[j][0][1] < 0);
                    for ( var l = 0 ; l < lines.length ; l++ ) {
                        var line = lines[l];
                        var line_points = points[j].concat();
                        var line_attrib = attrbs.concat();
                        var node = [];
                        var rotation = 0;
                        for ( var k = 0 ; k < line.length ; k++ ) {
                            var point = line_points[k];
                            var cp = line[k];
                            var attrb = line_attrib[k];

                            var knots = attrb[0] || 0;
                            if ( knots ) {
                                knots = Number(knots)/0.514;
                                knots = Math.round(knots) + 2.0;
                            }
                            
                            var nseg = { knots:knots, arrow:null, changeBar:null };
                            node.push(nseg);
                            
                            if ( k < line.length-1 ) {
                                var np = line[k+1];
                                var dx = np.x-cp.x;
                                var dy = np.y-cp.y;
                                var sl = dx*dx+dy*dy;
                                
                                rotation = Math.atan2(np.y-cp.y, np.x-cp.x)*180.0/Math.PI;
                                
                                if ( knots > 0 ) {
                                    var fl = "FL"+flightLevel(point[2]||0);
                                    var above_80kt = attrb[2]?flightLevel(attrb[2]):0;
                                    var below_80kt = attrb[4]?flightLevel(attrb[4]):0;
                                    
                                    var fiftyKnotCount = Math.floor(knots / 50);
                                    var tenKnotCount = Math.floor((knots % 50) / 10);
                                    var fiveKnotCount = Math.floor((knots % 10) / 5);
                                    var tenAndFiveKnotCount = tenKnotCount + fiveKnotCount;
                                    var totalMarkLength = (fiftyKnotCount + tenAndFiveKnotCount) * knotBaseLen +
                                                          (fiftyKnotCount - 1) * fiftyKnotSpacing +
                                                          (tenAndFiveKnotCount - 1) * tenAndFiveKnotSpacing +
                                                          (fiftyKnotCount > 0 ? tenAndFiveKnotSpacing : fiftyKnotSpacing);
                                    
                                    var r = 0;
                                    while ( sl <= totalMarkLength * totalMarkLength ) {
                                        r++;
                                        var s = k+1+r;
                                        if ( s > line.length-1 )
                                            break;
                                        var mp = line[s];
                                        var dx = mp.x-cp.x;
                                        var dy = mp.y-cp.y;
                                        sl = dx*dx+dy*dy;
                                    }
                                    
                                    if ( sl > totalMarkLength * totalMarkLength ) {
                                        if ( r > 0 ) {
                                            line.splice(k+1, r);
                                            line_points.splice(k+1, r);
                                            line_attrib.splice(k+1, r);
                                            np = line[k+1];
                                            dx = np.x-cp.x;
                                            dy = np.y-cp.y;
                                            sl = dx*dx+dy*dy;
                                            rotation = Math.atan2(np.y-cp.y, np.x-cp.x)*180.0/Math.PI;
                                        }
                                        // draw wind mark
                                        var wind_fill = [];
                                        var wind_line = [];
                                        var n = fiftyKnotCount + tenKnotCount + fiveKnotCount;
                                        var kh = isSouth?knotHeight:-knotHeight;
                                        var x = 0;
                                        for ( var l = 0; l < n; l++ ) {
                                            var xSpacingInc = tenAndFiveKnotSpacing;
                                            if ( l < fiftyKnotCount ) {
                                                if ( l == 0 )
                                                    xSpacingInc = fiftyKnotSpacing;
                                                if ( l == fiftyKnotCount - 1 )
                                                    xSpacingInc = tenAndFiveKnotSpacing;
                                                wind_fill.push([[x,0],[x+knotBaseLen,0],[x,kh],[x,0]]);
                                            }
                                            else if ( l < fiftyKnotCount + tenKnotCount ) {
                                                wind_line.push([[x+knotBaseLen,0],[x, kh]]);
                                            }
                                            else {
                                                wind_line.push([[x+knotBaseLen,0],[x+knotBaseLen/2, kh/2]]);
                                            }
                                            x += (knotBaseLen+xSpacingInc);
                                        }
                                        for ( var m = 0 ; m < wind_fill.length ; m++ ) {
                                            feature = new WRAP.Geo.Feature.Line({
                                                point:point,
                                                line:wind_fill[m],
                                                fillStyle:style.jetstream_line_color,
                                                rotation:rotation
                                            });
                                            dl.push(feature);
                                        }
                                        if ( wind_line.length ) {
                                            feature = new WRAP.Geo.Feature.Line({
                                                point:point,
                                                line:wind_line,
                                                lineWidth:1,
                                                strokeStyle:style.jetstream_line_color,
                                                rotation:rotation
                                            });
                                            dl.push(feature);
                                        }
                                        var fx = 2, fy = 12;
                                        var ex = 2, ey = 24;
                                        var r = rotation;
                                        if ( isSouth ) {
                                            if ( r < -90 || r > 90 ) {
                                                r += 180;
                                                fx -= 30;
                                                ex -= 30;
                                            }
                                            else {
                                                fy = -4;
                                                ey = -16;
                                            }
                                        }
                                        else {
                                            if ( r < -90 || r > 90 ) {
                                                r += 180;
                                                fx -= 30;
                                                ex -= 30;
                                                fy = -4;
                                                ey = -16;
                                            }
                                        }
                                        if ( point[2] ) {
                                            feature = new WRAP.Geo.Feature.Text({
                                                point:point,
                                                text:fl,
                                                fontSize:11,
                                                fillStyle:style.jetstream_label_color,
                                                offsetX:fx,
                                                offsetY:fy,
                                                align:'left',
                                                rotation:r
                                            });
                                            dl.push(feature);
                                        }
                                        if ( below_80kt && above_80kt ) {
                                            feature = new WRAP.Geo.Feature.Text({
                                                point:point,
                                                text:below_80kt+"/"+above_80kt,
                                                fontSize:11,
                                                fillStyle:style.jetstream_label_color,
                                                offsetX:ex,
                                                offsetY:ey,
                                                align:'left',
                                                rotation:r
                                            });
                                            dl.push(feature);
                                        }
                                        nseg.arrow = true;
                                    }
                                    else if ( sl > changeMarkSpacing * changeMarkSpacing ) {
                                        var changeMarkHeight = changeMarkLen/2;
                                        var mark_line = [];
                                        mark_line.push([[0, changeMarkHeight], [0, -changeMarkHeight]]);
                                        mark_line.push([[changeMarkSpacing, changeMarkHeight], [changeMarkSpacing, -changeMarkHeight]]);
                                        feature = new WRAP.Geo.Feature.Line({
                                            point:point,
                                            line:mark_line,
                                            lineWidth:1,
                                            strokeStyle:style.jetstream_line_color,
                                            rotation:rotation
                                        });
                                        nseg.changeBar = feature;
                                    }
                                }
                                var px = np.x-cp.x;
                                var py = np.y-cp.y;
                                feature = new WRAP.Geo.Feature.Line({
                                    point:point,
                                    line:[[0,0],[px, py]],
                                    lineWidth:style.jetstream_line_width,
                                    strokeStyle:style.jetstream_line_color
                                });
                                dl.push(feature);
                            }
                            else if ( k > 0 ){
                                var cap_line = [];
                                cap_line.push([[0, 0], [capLen, -capLen/2], [capLen, capLen/2], [0,0]]);
                                feature = new WRAP.Geo.Feature.Line({
                                    point:point,
                                    line:cap_line,
                                    fillStyle:style.jetstream_line_color,
                                    rotation:rotation-180
                                });
                                dl.push(feature);
                            }
                        }
                        for ( var k = 0 ; k < node.length ; k++ ) {
                            var nseg = node[k];
                            if ( nseg.changeBar ) {
                                var pre = 0, aft = 0;
                                for ( var l = k-1 ; l >= 0 ; l-- ) {
                                    if ( node[l].arrow ) {
                                        pre = node[l].knots;
                                        break;
                                    }
                                }
                                for ( var l = k+1 ; l < node.length ; l++ ) {
                                    if ( node[l].arrow ) {
                                        aft = node[l].knots;
                                        break;
                                    }
                                }
                                if ( pre && Math.abs(pre-nseg.knots) >= 20
                                 ||  aft && Math.abs(aft-nseg.knots) >= 20 )
                                    dl.push(nseg.changeBar);
                            }
                        }
                    }
                }
/*
for ( var j = 0 ; j < points.length ; j++ ) {
    var line = points[j];
    for ( var k = 0 ; k < line.length ; k++ ) {
        var point = line[k];
        if ( k < line.length-1 ) {
            var t = line[k+1];
            feature = new WRAP.Geo.Feature.Line({
                point:point,
                line:[[0,0],[0,-20]],
                strokeStyle:'black',
                strokeWidth:2,
                rotation:rotation
            });
        }
        dl.push(feature);
        
        feature = new WRAP.Geo.Feature.Point({
            point:point,
            strokeStyle:'black',
            strokeWidth:2,
            fillStyle:'white',
            pointSize:5
        });
        dl.push(feature);
    }
}
*/
            }
        }
        // TROPOPAUSE
        for ( var i = 0 ; i < length ; i++ ) {
            var item = features[i];
            var geometry = item.geometry;
            if ( !geometry )
                continue;
            var prop = item.properties;
            if ( prop.contents_kind == "TROPOPAUSE" ) {
                for ( var j = 0 ; j < geometry.coordinates.length ; j++ ) {
                    var point = geometry.coordinates[j];
                    if ( point && point[2] ) {
                        var value = flightLevel(point[2]);
                        if ( prop.significance == 'MINIMUM' ) {
                            feature = new WRAP.Geo.Feature.Line({
                                point:point,
                                line:[[-13,-7], [13, -7], [13, 12], [0, 19], [-13, 12], [-13,-7]],
                                lineWidth:0.5,
                                strokeStyle:'#000000',
                                fillStyle:'#ffffff'
                            });
                            dl.push(feature);
                            feature = new WRAP.Geo.Feature.Text({
                                point:point,
                                text:"L",
                                fontSize:11,
                                fillStyle:'#000',
                                offsetX:0,
                                offsetY:15,
                                align:'center'
                            });
                            dl.push(feature);
                        }
                        else if ( prop.significance == 'MAXIMUM' ) {
                            feature = new WRAP.Geo.Feature.Line({
                                point:point,
                                line:[[-13,-12], [0, -19], [13, -12], [13, 7], [-13, 7], [-13,-7]],
                                lineWidth:0.5,
                                strokeStyle:'#000000',
                                fillStyle:'#ffffff'
                            });
                            dl.push(feature);
                            feature = new WRAP.Geo.Feature.Text({
                                point:point,
                                text:"H",
                                fontSize:11,
                                fillStyle:'#000',
                                offsetX:0,
                                offsetY:-7,
                                align:'center'
                            });
                            dl.push(feature);
                        }
                        else {
                            feature = new WRAP.Geo.Feature.Line({
                                point:point,
                                line:[[-13,-7], [13, -7], [13, 7], [-13, 7], [-13,-7]],
                                lineWidth:0.5,
                                strokeStyle:'#000000',
                                fillStyle:'#ffffff'
                            });
                            dl.push(feature);
                        }
                        feature = new WRAP.Geo.Feature.Text({
                            point:point,
                            text:value,
                            fontSize:11,
                            fillStyle:'#000',
                            offsetX:0,
                            offsetY:4,
                            align:'center'
                        });
                        dl.push(feature);
                    }
                }
            }
        }
        this.content_revision = revision.content;
        this.context_revision = revision.context;
        this.conf_revision = revision.conf;
        WRAP.Geo.invalidate();
        //console.log("  display list -> "+dl.length);
    }
}


WRAP.Geo.Renderer.ASCScale = function() {

    this.style_revision;
    this.context_revision;
    
    this.draw = function(layer, content, conf, context, style, data, revision, dl) {
        
        if ( this.revision && this.revision.context == revision.context )
            return;
        
        if ( this.style_revision != revision.style ) {
            this.style_revision = revision.style;
        }
        
        var s = conf.Attributes.style.default;
        if ( style && conf.Attributes.style[style] )
            s = conf.Attributes.style[style];
        if ( !s )
            return;

        var grid = data._handler().getGrid();
        if ( !grid )
            return;
        
        var gw = parseInt(grid.Width);
        var gh = parseInt(grid.Height);
        
        var sampling = "highest";
        if ( s.min_blocksize )
            sampling += (" "+s.min_blocksize);
        
        if ( !content || !content.element || !content.level )
            return;
        var element = Array.isArray(content.element)?content.element:[content.element];
        var level = Array.isArray(content.level)?content.level:[content.level];
        
        var rc = {};
        for ( var key in content ) {
            if ( key != 'element' && key != 'level' )
                rc[key] = content[key];
        }

        var tiles = []; // [elememt][level][tile]
        for ( var e = 0 ; e < element.length ; e++ ) {
            tiles[e] = [];
            for ( var l = 0 ; l < level.length ; l++ ) {
                tiles[e][l] = [];
            }
        }
        for ( var i = 0 ; i < context.tiles.length ; i++ ) {
            var tile = context.tiles[i];
            for ( var e = 0 ; e < element.length ; e++ ) {
                rc.element = element[e];
                for ( var l = 0 ; l < level.length ; l++ ) {
                    rc.level = level[l];
                    var data_tile;
                    if ( !(data_tile = data._handler().getTile(rc, tile.id, sampling)) ) {
                        data._handler().loadTile(rc, tile.id, sampling, tile.z, tile.y, tile.x, tile.cood, tile.bounds,
                            function() {
                                WRAP.Geo.redraw(layer);
                            });
                        return;
                    }
                    tiles[e][l][i] = data_tile;
                }
            }
        }
        

        dl.length = 0;
        
        var step;
        var vm = new Uint8Array(gw*gh);
        var pos = [];
        /* priority
            ICE(1)=1
            CONV(1)=2
            TURB(3)=3
            ICE(2)=4
            CONV(2)=5
            TURB(4)=6
            TURB(5)=7
        */
        var color = [
            'rgba(0,0,0,0)',
            s.icing_lgt_color,
            s.conv_lgt_color,
            s.turb_mod_color,
            s.icing_mod_color,
            s.conv_mod_color,
            s.turb_mod_to_sev_color,
            s.turb_sev_color
        ];
        var type = [-1,0,1,2,0,1,2,2];
        var ice_line_icon_size = 10;
        var ice_icon_size = 12;

        for ( var e = 0 ; e < element.length ; e++ ) {
            var ev = element[e];
            for ( var l = 0 ; l < level.length ; l++ ) {
                var el = tiles[e][l];
                for ( var i = 0 ; i < el.length ; i++ ) {
                    var data = el[i].data;
                    for ( var j = 0 ; j < data.length ; j++ ) {
                        var v = data[j];
                        if ( !v.value || isNaN(v.value) || !v.step )
                            continue;
                        var value;
                        if ( ev == 'ICING' ) {
                            if ( v.value == 1 )
                                value = 1;
                            else if ( v.value == 2 )
                                value = 4;
                        }
                        else if ( ev == 'CONV' ) {
                            if ( v.value == 1 )
                                value = 2;
                            else if ( v.value == 2 )
                                value = 5;
                        }
                        else if ( ev == 'TURB' ) {
                            if ( v.value == 3 )
                                value = 3;
                            else if ( v.value == 4 )
                                value = 6;
                            else if ( v.value == 5 )
                                value = 7;
                        }
                        if ( value ) {
                            var index = v.y*gw+v.x;
                            if ( !vm[index] || vm[index] < value ) {
                                vm[index] = value ;
                                pos[index] = {lat:v.lat, lon:v.lon};
                                step = v.step;
                            }
                        }
                    }
                }
            }
        }
        
        function icingIcon(path, x, y, w, h, r) {
            var sp = [x+w*0.170, y+h*0.720];
            var m1 = [x+w*0.230, y+h*0.460];
            var m2 = [x+w*0.400, y+h*0.350];
            var cp = [x+w*0.500, y+h*0.333];
            var m3 = [x+w*0.600, y+h*0.350];
            var m4 = [x+w*0.770, y+h*0.460];
            var ep = [x+w*0.830, y+h*0.720];
            var ty = y+h*0.500;
            var by = y+h*0.200;
            if ( r == 1 ) {
                path.push([sp, m1, m2, cp, m3, m4, ep]);
                path.push([[x+w*0.5,ty],[x+w*0.5,by]]);
            }
            else if (r == 4 ) {
                path.push([sp, m1, m2, cp, m3, m4, ep]);
                path.push([[x+w*0.4,ty],[x+w*0.4,by]]);
                path.push([[x+w*0.6,ty],[x+w*0.6,by]]);
            }
        }
        
        function turbIcon(path, x, y, w, h, r) {
            var xs = x+w*0.2;
            var x1 = x+w*0.35;
            var xc = x+w*0.5;
            var x2 = x+w*0.65;
            var xe = x+w*0.8;
            var ys = y+h*0.2;
            var yc = y+h*0.5;
            var ye = y+h*0.8;
            
            if ( r == 7 ) {
                path.push([[xs,ys],[x1,ys],[xc,yc],[x2,ys],[xe,ys]]);
                path.push([[x1,yc],[xc,ye],[x2,yc]]);
            }
            else {
                path.push([[xs,ys],[x1,ys],[xc,ye],[x2,ys],[xe,ys]]);
            }
            
            /*
            path.push([[xs, ys],[xe,ys],[xe,ye],[xs,ye],[xs,ys]]);
            */
        }
        
        if ( step ) {
            var gxd = parseFloat(grid.LonInterval)*step;
            var gyd = parseFloat(grid.LatInterval)*step;
            var gxh = gxd/2;
            var gyh = gyd/2;
            
            for ( var rank = 1 ; rank <= 7 ; rank++ ) {
                var t = type[rank];
                var i = 0;
                for ( var y = 0 ; y < gh ; y++ ) {
                    var s = i;
                    for ( var x = 0 ; x < gw ; x++ ) {
                        var v = vm[i];
                        if ( v == rank ) {
                            
                            var c = color[v];
                            var p = pos[i];
                            var feature;
                            var sx = p.lon-gxh;
                            var ex = p.lon+gxh;
                            var sy = p.lat+gyh;
                            var ey = p.lat-gxh;
/*
                            var p = WRAP.Geo.parseColor(c);
                            feature = new WRAP.Geo.Feature.GeoLine({
                                path:[[sx,sy],[ex,sy],[ex,ey],[sx,ey],[sx,sy]],
                                fillStyle:"rgba("+p[0]+","+p[1]+","+p[2]+",0.05)"
                            });
                            dl.push(feature);
*/
                            var lt, rb, ww, hh;
                            
                            if ( t == 0 || t == 2 ) {
                                lt = WRAP.Geo.getScreenPoint(new WRAP.Geo.Point(sy*60,sx*60));
                                rb = WRAP.Geo.getScreenPoint(new WRAP.Geo.Point(ey*60,ex*60));
                                ww = Math.abs(lt.x-rb.x);
                                hh = Math.abs(lt.y-rb.y);
                                var iw_num = Math.floor(ww/ice_icon_size);
                                var ih_num = Math.floor(hh/ice_icon_size);
                                if ( iw_num && ih_num ) {
                                    var wst = (ex-sx)/iw_num;
                                    var hst = (sy-ey)/ih_num;
                                    var path = [];
                                    for ( var iy = 0 ; iy < ih_num ; iy++ ) {
                                        var my = sy-hst*(iy+0.5);
                                        var msy = my-hst/2;
                                        for ( var ix = 0 ; ix < iw_num ; ix++ ) {
                                            var mx = sx+wst*(ix+0.5);
                                            var msx = mx-wst/2;
                                            if ( t == 0 )
                                                icingIcon(path, msx, msy, wst, hst, rank);
                                            else
                                                turbIcon(path, msx, msy, wst, hst, rank);
                                        }
                                    }
                                    dl.push(new WRAP.Geo.Feature.GeoLine({
                                        path:path,
                                        strokeStyle:c,
                                        lineWidth:1.5
                                    }));
                                }
                            }

                            var u = i-(gw*step);
                            if ( u > 0 && vm[u] < v ) {
                                if ( t == 0 ) {         // ICE
                                    var iw_num = Math.floor(ww/ice_line_icon_size);
                                    var ih_num = Math.floor(hh/ice_line_icon_size);
                                    if ( iw_num && ih_num ) {
                                        var wst = (ex-sx)/iw_num;
                                        var hst = (sy-ey)/ih_num;
                                        var mw = wst*0.3;
                                        var mh = hst*0.2;
                                        for ( var m = 0 ; m < iw_num ; m++ ) {
                                            var mx = sx+wst*(m+0.5);
                                            dl.push(new WRAP.Geo.Feature.GeoLine({
                                                path:[[mx-mw,sy+mh],[mx, sy-mh],[mx+mw,sy+mh]],
                                                strokeStyle:c,
                                                lineWidth:1.5
                                            }));
                                        }
                                    }
                                }
                                else if ( t == 1 ) {    // CONV
                                    dl.push(new WRAP.Geo.Feature.GeoLine({
                                        path:[[ex,sy],[sx,sy]],
                                        strokeStyle:c,
                                        lineWidth:2,
                                        option:'cloud'
                                    }));
                                }
                                else if ( t == 2 ) {    // TURB
                                    dl.push(new WRAP.Geo.Feature.GeoLine({
                                        path:[[[ex,sy],[ex+(sx-ex)*0.33,sy]],
                                              [[ex+(sx-ex)*0.66,sy],[sx,sy]]],
                                        strokeStyle:c,
                                        lineWidth:2
                                    }));
                                }
                            }
                            var b = i+(gw*step);
                            if ( b < vm.length && vm[b] < v ) {
                                if ( t == 0 ) {         // ICE
                                    var iw_num = Math.floor(ww/ice_line_icon_size);
                                    var ih_num = Math.floor(hh/ice_line_icon_size);
                                    if ( iw_num && ih_num ) {
                                        var wst = (ex-sx)/iw_num;
                                        var hst = (sy-ey)/ih_num;
                                        var mw = wst*0.3;
                                        var mh = hst*0.2;
                                        for ( var m = 0 ; m < iw_num ; m++ ) {
                                            var mx = sx+wst*(m+0.5);
                                            dl.push(new WRAP.Geo.Feature.GeoLine({
                                                path:[[mx-mw,ey+mh],[mx, ey-mh],[mx+mw,ey+mh]],
                                                strokeStyle:c,
                                                lineWidth:1.5
                                            }));
                                        }
                                    }
                                }
                                else if ( t == 1 ) {    // CONV
                                    dl.push(new WRAP.Geo.Feature.GeoLine({
                                        path:[[sx,ey],[ex,ey]],
                                        strokeStyle:c,
                                        lineWidth:2,
                                        option:'cloud'
                                    }));
                                }
                                else if ( t == 2 ) {    // TURB
                                    dl.push(new WRAP.Geo.Feature.GeoLine({
                                        path:[[[ex,ey],[ex+(sx-ex)*0.33,ey]],
                                             [[ex+(sx-ex)*0.66,ey],[sx,ey]]],
                                        strokeStyle:c,
                                        lineWidth:2
                                    }));
                                }
                            }
                            var l = s+(x-step)%gw;
                            if ( vm[l] < v ) {
                                if ( t == 0 ) {         // ICE
                                    var iw_num = Math.floor(ww/ice_line_icon_size);
                                    var ih_num = Math.floor(hh/ice_line_icon_size);
                                    if ( iw_num && ih_num ) {
                                        var wst = (ex-sx)/iw_num;
                                        var hst = (sy-ey)/ih_num;
                                        var mw = wst*0.3;
                                        var mh = hst*0.2;
                                        for ( var m = 0 ; m < ih_num ; m++ ) {
                                            var my = sy-hst*(m+0.5);
                                            dl.push(new WRAP.Geo.Feature.GeoLine({
                                                path:[[sx-mw,my+mh],[sx,my-mh],[sx+mw,my+mh]],
                                                strokeStyle:c,
                                                lineWidth:1.5
                                            }));
                                        }
                                    }
                                }
                                else if ( t == 1 ) {    // CONV
                                    dl.push(new WRAP.Geo.Feature.GeoLine({
                                        path:[[sx,sy],[sx,ey]],
                                        strokeStyle:c,
                                        lineWidth:2,
                                        option:'cloud'
                                    }));
                                }
                                else if ( t == 2 ) {    // TURB
                                    dl.push(new WRAP.Geo.Feature.GeoLine({
                                        path:[[[sx,sy],[sx,sy+(ey-sy)*0.33]],
                                              [[sx,sy+(ey-sy)*0.66],[sx,ey]]],
                                        strokeStyle:c,
                                        lineWidth:2
                                    }));
                                }
                                
                            }
                            var r = s+(x+step)%gw;
                            if ( vm[r] < v ) {
                                if ( t == 0 ) {         // ICE
                                    var iw_num = Math.floor(ww/ice_line_icon_size);
                                    var ih_num = Math.floor(hh/ice_line_icon_size);
                                    if ( iw_num && ih_num ) {
                                        var wst = (ex-sx)/iw_num;
                                        var hst = (sy-ey)/ih_num;
                                        var mw = wst*0.3;
                                        var mh = hst*0.2;
                                        for ( var m = 0 ; m < ih_num ; m++ ) {
                                            var my = sy-hst*(m+0.5);
                                            dl.push(new WRAP.Geo.Feature.GeoLine({
                                                path:[[ex-mw,my+mh],[ex,my-mh],[ex+mw,my+mh]],
                                                strokeStyle:c,
                                                lineWidth:1.5
                                            }));
                                        }
                                    }
                                }
                                else if ( t == 1 ) {    // CONV
                                    dl.push(new WRAP.Geo.Feature.GeoLine({
                                        path:[[ex,ey],[ex,sy]],
                                        strokeStyle:c,
                                        lineWidth:2,
                                        option:'cloud'
                                    }));
                                }
                                else if ( t == 2 ) {    // TURB
                                    dl.push(new WRAP.Geo.Feature.GeoLine({
                                        path:[[[ex,sy],[ex,sy+(ey-sy)*0.33]],
                                        [[ex,sy+(ey-sy)*0.66],[ex,ey]]],
                                        strokeStyle:c,
                                        lineWidth:2
                                    }));
                                }
                            }
                        }
                        i++;
                    }
                }
            }
        }
        
// Check Grid Rank
var check = false;
        if ( check) {
            var i = 0;
            for ( var y = 0 ; y < gh ; y++ ) {
                for ( var x = 0 ; x < gw ; x++ ) {
                    var v = vm[i];
                    if ( v ) {
                        var p = pos[i];
                        var feature;
                        feature = new WRAP.Geo.Feature.Text({
                            point:[p.lon,p.lat],
                            text:v,
                            fontSize:12,
                            fillStyle:'#000',
                            offsetX:0,
                            offsetY:6,
                            align:'center'
                        });
                        dl.push(feature);
                    }
                    i++;
                }
            }
        }

        this.context_revision = context.revision;
        WRAP.Geo.invalidate();
    }
}



WRAP.Geo.Renderer.Isotach = function() {
    var self = this;
    
    this.palette = null;
    this.palette_value_min = 0;
    this.palette_value_max = 0;
    this.palette_gradient = true;
    this.palette_scale = 10;
    this.palette_step = 1;
    
    this.setPalette = function(style) {
        if ( !self.palette && style.palette ) {
            self.palette = [];
            self.palette_gradient = style.palette_gradient;
            self.palette_step = style.palette_step || 1;
            self.palette_scale = 1.0/self.palette_step;
            
            var p = style.palette;
            var l = [];
            for ( var i = 0 ; i < p.length ; i++ ) {
                var s = [];
                var value = p[i].value;
                if ( i == 0 ) {
                    this.palette_value_min = value;
                    this.palette_value_max = value;
                }
                else {
                    if ( this.palette_value_min > value )
                        this.palette_value_min = value;
                    if ( this.palette_value_max < value )
                        this.palette_value_max = value;
                }
                s.push(value);
                var color = WRAP.Geo.parseColor(p[i].color);
                s.push(color[0]);
                s.push(color[1]);
                s.push(color[2]);
                s.push(color[3]);
                l.push(s);
            }

            var m = 0;
            for ( var v = self.palette_value_min ; v <= self.palette_value_max ; v+=self.palette_step ) {
                while ( m < l.length-1 && v >= l[m+1][0] )
                    m++;
                if ( m == l.length-1 ) {
                    self.palette.push([
                       parseInt(l[m][1]),
                       parseInt(l[m][2]),
                       parseInt(l[m][3]),
                       parseInt(l[m][4])
                   ]);
                }
                else {
                    var sr = l[m][1];
                    var sg = l[m][2];
                    var sb = l[m][3];
                    var sa = l[m][4];
                    if ( self.palette_gradient ) {
                        var r = (v-l[m][0])/(l[m+1][0]-l[m][0]);
                        var er = l[m+1][1];
                        var eg = l[m+1][2];
                        var eb = l[m+1][3];
                        var ea = l[m+1][4];
                        self.palette.push([
                           parseInt(sr+(er-sr)*r),
                           parseInt(sg+(eg-sg)*r),
                           parseInt(sb+(eb-sb)*r),
                           parseInt((sa+(ea-sa)*r))
                        ]);
                    }
                    else {
                        self.palette.push([
                           parseInt(sr),
                           parseInt(sg),
                           parseInt(sb),
                           parseInt(sa)
                        ]);
                    }
                }
            }
        }
    }
    
    this.getColor = function(value) {
        var index = Math.floor((value-self.palette_value_min)*self.palette_scale);
        if ( index < 0 || index >= self.palette.length )
            return [0,0,0,0];
        return self.palette[index];
    }
    
    this.draw = function(layer, content, conf, context, style, data, revision, dl) {
        
        var valid = true;
        if ( this.context_revision != revision.context ) {
            valid = false;
        }

        if ( this.content_revision != revision.content ) {
            valid = false;
        }

        if ( this.conf_revision != revision.conf ) {
            valid = false;
        }
        
        if ( this.style_revision != revision.style ) {
            valid = false;
            this.palette = null;
        }
        
        if ( valid )
            return;
        
        var data_offset = conf.Attributes.data_offset || 0;
        
        var s = conf.Attributes.style.default;
        if ( !style && conf.Attributes.style_selector ) {
            if ( !conf.Attributes.style_selector.key || !conf.Attributes.style_selector.styles ) {
                console.log("style_selector formar error.");
                return;
            }
            var key = conf.Attributes.style_selector.key;
            for ( var i = 0 ; i < conf.Attributes.style_selector.styles.length ; i++ ) {
                var values = conf.Attributes.style_selector.styles[i].values;
                if ( values.indexOf(content[key]) >= 0 ) {
                    style = conf.Attributes.style_selector.styles[i].style;
                    break;
                }
            }
        }
        if ( style && conf.Attributes.style[style] )
            s = conf.Attributes.style[style];
        if ( !s )
            return;
        
        this.setPalette(s);
        var sampling = (s.fill_type!='block')?'interpolate':'nearest';
        var fill = s.fill_type;
        var contour = s.contour;
        
//console.log("rendering Mesh");
        var data_tile = [];
        for ( var i = 0 ; i < context.tiles.length ; i++ ) {
            var tile = context.tiles[i];
            if ( !(data_tile[i] = data._handler().getTile(content, tile.id, sampling)) ) {
                data._handler().loadTile(content, tile.id, sampling, tile.z, tile.y, tile.x, tile.cood, tile.bounds,
                    function() {
                        WRAP.Geo.redraw(layer);
                    });
                return;
            }
        }
        
        dl.length = 0;
        for ( var i = 0 ; i < data_tile.length ; i++ ) {
            var src = data_tile[i];
            if ( !src || src.empty )
                continue;
            
            var tile = context.tiles[i];
            var pix = tile.ctx.createImageData(256,256);
            var s = this.getData(content, src.data);
            if ( !s )
                continue;
            
            var d = pix.data;
            if ( fill ) {
                for ( var m = 0 ; m < 65536 ; m++ ) {
                    var value = s[m];
                    if ( value === undefined )
                        continue;
                    value += data_offset;
                    var col = this.getColor(value);
                    var p = m*4;
                    d[p] = col[0];
                    d[p+1] = col[1];
                    d[p+2] = col[2];
                    d[p+3] = col[3];
                }
            }
//console.log("tile="+tile.id+" min="+min+" max="+max);

            var label = [];
            if ( contour ) {
                var min = 0;
                var max = 0;
                for ( var p = 0 ; p < 65536 ; p++ ) {
                    var value = s[p];
                    if ( value === undefined )
                        continue;
                    if ( p == 0 ) {
                        min = max = value;
                    }
                    else {
                        if ( min > value )
                           min = value;
                        if ( max < value )
                            max = value;
                    }
                }
                
                for ( var j = 0 ; j < contour.length ; j++ ) {
                    var c = contour[j];
                    var col = WRAP.Geo.parseColor(c.strokeStyle);
                    var value = c.base - data_offset;
                    for ( var n = 0 ; n < c.num ; n++ ) {
                        if ( min <= value && value <= max ) {
                            var ll = -1;
                            var lx = 0, ly = 0;
                            
                            var index = 0;
                            for ( var y = 0 ; y < 256 ; y++ ) {
                                var py = (y==0)?0:-256;
                                var ny = (y==255)?0:256;
                                for ( var x = 0 ; x < 256 ; x++ ) {
                                    var px = (x==0)?0:-1;
                                    var nx = (x==255)?0:1;
                                    var vc = s[index];
                                    if ( vc >= value ) {
                                        var vt = s[index+py];
                                        var vl = s[index+px];
                                        var vr = s[index+nx];
                                        var vb = s[index+ny];
                                        if ( vt < value || vl < value || vr < value || vb < value ) {
                                            d[index*4] = col[0];
                                            d[index*4+1] = col[1];
                                            d[index*4+2] = col[2];
                                            d[index*4+3] = col[3];
                                            if ( c.lineWidth>1) {
                                                d[index*4+4] = col[0];
                                                d[index*4+5] = col[1];
                                                d[index*4+6] = col[2];
                                                d[index*4+7] = col[3];
                                                d[index*4+1024] = col[0];
                                                d[index*4+1024+1] = col[1];
                                                d[index*4+1024+2] = col[2];
                                                d[index*4+1024+3] = col[3];
                                            }
                                            
                                            var l = Math.abs(x-128)+Math.abs(y-128);
                                            if ( ll < 0 || l < ll ) {
                                                ll = l;
                                                lx = x;
                                                ly = y;
                                            }
                                        }
                                    }
                                    index++;
                                }
                            }
                            
                            if ( 20 < lx && lx <= 236 && 20 < ly && ly <= 236 ) {
                                label.push({x:lx, y:ly, value:value+data_offset, color:c.textColor});
                            }
                        }
                        value += c.interval;
                    }
                }
            }
            var feature = new WRAP.Geo.Feature.Tile({
                tile:tile,
                imageData:pix
            });
            dl.push(feature);
            
            for ( var l = 0 ; l < label.length ; l++ ) {
                var center = (128*256+128)*2;
                var lat = tile.cood[center];
                var lon = tile.cood[center+1];
                var feature;
                feature = new WRAP.Geo.Feature.Text({
                    point:[lon, lat],
                    text:label[l].value,
                    fontSize:12,
                    fillStyle:label[l].color,
                    offsetX:label[l].x-128,
                    offsetY:label[l].y-128,
                    align:'center'
                });
                dl.push(feature);
            }
        }
        
        //WRAP.Geo._tileCheck(context, dl);
        
        this.context_revision = revision.context;
        this.content_revision = revision.content;
        this.conf_revision = context.conf;
        this.style_revision = revision.style;
        WRAP.Geo.invalidate();
    }
}

WRAP.Geo.Renderer.Isotach.prototype.getData = function(content, data) {
    if ( !content.element || !Array.isArray(content.element) )
        return;
    
    var u = data[0];
    var v = data[1];
    var s = [];
    for ( var p = 0 ; p < 65536 ; p++ ) {
        var u_spd = u[p];
        var v_spd = v[p];
        if ( !isNaN(u_spd) && !isNaN(v_spd) ) {
            s[p] = Math.sqrt(u_spd*u_spd + v_spd*v_spd) / 0.514;
        }
    }
    return s;
}


WRAP.Geo.Renderer.IcingProbavility = function() {

    this.style_revision;
    this.context_revision;
    
    this.draw = function(layer, content, conf, context, style, data, revision, dl) {
        
        if ( this.revision && this.revision.context == revision.context )
            return;
        
        if ( this.style_revision != revision.style ) {
            this.style_revision = revision.style;
        }
        
        var s = conf.Attributes.style.default;
        if ( style && conf.Attributes.style[style] )
            s = conf.Attributes.style[style];
        if ( !s )
            return;

        var sampling = "value";
        if ( s.min_blocksize )
            sampling += (" "+s.min_blocksize);
        
        var data_tile = [];
        for ( var i = 0 ; i < context.tiles.length ; i++ ) {
            var tile = context.tiles[i];
            if ( !(data_tile[i] = data._handler().getTile(content, tile.id, sampling)) ) {
                data._handler().loadTile(content, tile.id, sampling, tile.z, tile.y, tile.x, tile.cood, tile.bounds,
                    function() {
                        WRAP.Geo.redraw(layer);
                    });
                return;
            }
        }
        
        dl.length = 0;
        for ( var i = 0 ; i < data_tile.length ; i++ ) {
            var data = data_tile[i].data;
            for ( var j = 0 ; j < data.length ; j++ ) {
                var v = data[j];
                if ( !v.value || v.value.length != 2 )
                    continue;
                var tm = v.value[0];
                if ( isNaN(tm) )
                    continue;
                var rh = v.value[1];
                if ( isNaN(rh) )
                    continue;
                
                tm -= 273.15;
                if ( -15.0 <= tm && tm <= 0.0 && rh >= 90.0 ) {
                    //var text = tm.toFixed(2)+","+rh.toFixed(2);
                    var text = "＊";
                    var feature;
                    feature = new WRAP.Geo.Feature.Text({
                        point:[v.lon,v.lat],
                        text:text,
                        fontSize:14,
                        fillStyle:s.icon_color,
                        offsetX:0,
                        offsetY:-7,
                        align:'center'
                    });
                    dl.push(feature);
                }
            }
        }

        this.context_revision = context.revision;
        WRAP.Geo.invalidate();
    }
}



WRAP.Geo.Renderer.GridLine = function() {
    
    this.draw = function(layer, content, conf, context, style, data, revision, dl) {
        layer = null;
        data = null;
        revision = null;
        content = null;
        context = null;
        
        var s = conf.Attributes.style.default;
        if ( style && conf.Attributes.style[style] )
            s = conf.Attributes.style[style];
        if ( !s )
            return;
        
        
        dl.length = 0;
        
        var interval = s.grid_interval || 10;
        var line_width = s.line_width || 1;
        var line_color = s.line_color;
        var font_size = s.font_size || 14;
        var text_color = s.text_color || 'black';
        var edge_color = s.text_edge_color;
        var top, bottom, left, right;
        if ( s.position ) {
            top = (s.position.indexOf("top")>=0);
            bottom = (s.position.indexOf("bottom")>=0);
            left = (s.position.indexOf("left")>=0);
            right = (s.position.indexOf("right")>=0);
        }
        

        
        var vl = 85;
        
        var lat = [];
        var lon = [];
        
        var h = 0;
        while ( h <= 180 ) {
            if ( h == 0 || h == 180 ) {
                lon.push({lon:h, text:h});
            }
            else {
                lon.push({lon:h, text:"E"+h});
                lon.push({lon:-h, text:"W"+h});
            }
            h += interval;
        }
        var v = 0;
        while ( v <= vl ) {
            if ( v == 0 ) {
                lat.push({lat:v, text:v});
            }
            else {
                lat.push({lat:v, text:"N"+v});
                lat.push({lat:-v, text:"S"+v});
            }
            v += interval;
        }
        
        for ( h = 0 ; h < lon.length ; h++ ) {
            var x = lon[h].lon;
            dl.push(new WRAP.Geo.Feature.GeoLine({
                path:[[x,vl],[x,-vl]],
                lineWidth:line_width,
                strokeStyle:line_color,
                geodesic:false
            }));
            for ( v = 0 ; v < lat.length ; v++ ) {
                var y = lat[v].lat;
                dl.push(new WRAP.Geo.Feature.GeoLine({
                    path:[[x,y],[x+interval,y]],
                    lineWidth:line_width,
                    strokeStyle:line_color,
                    geodesic:false
                }));
            }
        }
        
        var size = WRAP.Geo.getSize();
        
        for ( var x = 10 ; x < size.width-10 ; x++ ) {
            if ( top ) {
                var p = WRAP.Geo.getPoint(new WRAP.Geo.ScreenPoint(x, 0));
                var pl = p.lonDegree();
                for ( h = 0 ; h < lon.length ; h++ ) {
                    var ll = lon[h];
                    var cl = ll.lon;
                    var d = Math.abs(cl-pl);
                    if ( !ll.top || ll.top.d > d )
                        ll.top = {d:d, point:p};
                }
            }
            if ( bottom ) {
                var p = WRAP.Geo.getPoint(new WRAP.Geo.ScreenPoint(x, size.height));
                var pl = p.lonDegree();
                for ( h = 0 ; h < lon.length ; h++ ) {
                    var ll = lon[h];
                    var cl = ll.lon;
                    var d = Math.abs(cl-pl);
                    if ( !ll.bottom || ll.bottom.d > d )
                        ll.bottom = {d:d, point:p};
                }
            }
        }
        for ( var y = 20 ; y < size.height-20 ; y++ ) {
            if ( left ) {
                var p = WRAP.Geo.getPoint(new WRAP.Geo.ScreenPoint(0, y));
                var pl = p.latDegree();
                for ( v = 0 ; v < lat.length ; v++ ) {
                    var ll = lat[v];
                    var cl = ll.lat;
                    var d = Math.abs(cl-pl);
                    if ( !ll.left || ll.left.d > d )
                        ll.left = {d:d, point:p};
                }
            }
            if ( right ) {
                var p = WRAP.Geo.getPoint(new WRAP.Geo.ScreenPoint(size.width, y));
                var pl = p.latDegree();
                for ( v = 0 ; v < lat.length ; v++ ) {
                    var ll = lat[v];
                    var cl = ll.lat;
                    var d = Math.abs(cl-pl);
                    if ( !ll.right || ll.right.d > d )
                        ll.right = {d:d, point:p};
                }
            }
        }
        
        for ( h = 0 ; h < lon.length ; h++ ) {
            var ll;
            if ( (ll=lon[h].top) && ll.d < 4 ) {
                dl.push(new WRAP.Geo.Feature.Text({
                    point:[ll.point.lonDegree(), ll.point.latDegree()],
                    text:lon[h].text,
                    fontSize:font_size,
                    strokeStyle:edge_color,
                    fillStyle:text_color,
                    offsetX:0,
                    offsetY:font_size+2,
                    align:'center'
                }));
            }
            if ( (ll=lon[h].bottom) && ll.d < 4 ) {
                dl.push(new WRAP.Geo.Feature.Text({
                    point:[ll.point.lonDegree(), ll.point.latDegree()],
                    text:lon[h].text,
                    fontSize:font_size,
                    strokeStyle:edge_color,
                    fillStyle:text_color,
                    offsetX:0,
                    offsetY:-4,
                    align:'center'
                }));
            }
        }
        for ( v = 0 ; v < lat.length ; v++ ) {
            if ( (ll=lat[v].left) && ll.d < 4 ) {
                dl.push(new WRAP.Geo.Feature.Text({
                    point:[ll.point.lonDegree(), ll.point.latDegree()],
                    text:lat[v].text,
                    fontSize:font_size,
                    strokeStyle:edge_color,
                    fillStyle:text_color,
                    offsetX:2,
                    offsetY:font_size/2,
                    align:'left'
                }));
            }
            if ( (ll=lat[v].right) && ll.d < 4 ) {
                dl.push(new WRAP.Geo.Feature.Text({
                    point:[ll.point.lonDegree(), ll.point.latDegree()],
                    text:lat[v].text,
                    fontSize:font_size,
                    strokeStyle:edge_color,
                    fillStyle:text_color,
                    offsetX:-3,
                    offsetY:font_size/2,
                    align:'right'
                }));
            }
        }
        
        WRAP.Geo.invalidate();
    }
}


WRAP.Geo.Renderer.LiveCamera = function() {
    
    var dir_sep = 16;

    var icons = {t:{}, s:{}, a:{}};
    
    function make_icon(layer, icon, error) {
        icon.img = null;
        var img = new Image();
        img.onload = function() {
            icon.img = [];
            var cvs = document.createElement("canvas");
            var context = cvs.getContext("2d");
            for ( var deg = 0 ; deg < dir_sep ; deg++ ) {
                var angle = deg*(360/dir_sep)*Math.PI/180;
                cvs.width = 32;
                cvs.height = 32;
                var centerX = cvs.width/2;
                var centerY = cvs.height/2;
                context.save();
                context.translate(centerX, centerY);
                context.rotate(angle);
                context.translate(-centerX, -centerY);
                context.drawImage(img, 0, 0, 32, 32);
                context.restore();
                var url = cvs.toDataURL('image/png');
                icon.img.push(url);
            }
            WRAP.Geo.redraw(layer);
        }
        img.onerror = function() {
            icon.img = [];
            for ( var deg = 0 ; deg < dir_sep ; deg++ ) {
                icon.img.push(error);
            }
        }
        img.src = icon.url;
    }

    this.draw = function(layer, content, conf, context, style, data, revision, dl) {
        content = null;
        context = null;
        
        var root = data.query("data").value();
        if ( !root )
            return;
        
        var style = conf.Attributes.style.default;
        var icon_width = style.icon_width;
        var icon_height = style.icon_height;
        var icon_offset_x = style.icon_offset_x;
        var icon_offset_y = style.icon_offset_y;
        var icon_n = style.icon_nondir;
        var icon_t = style.icon_t;
        var icon_s = style.icon_s;
        var icon_a = style.icon_a;
        
        if ( !icon_n || !icon_t || !icon_s || !icon_a )
            return;
        
        if ( icons.a.url != icon_a ) {
            icons.a.url = icon_a;
            make_icon(layer, icons.a,icon_n);
        }
        if ( icons.s.url != icon_s ) {
            icons.s.url = icon_s;
            make_icon(layer, icons.s,icon_s);
        }
        if ( icons.t.url != icon_t ) {
            icons.t.url = icon_t;
            make_icon(layer, icons.t,icon_n);
        }
        if ( !icons.a.img || !icons.s.img || !icons.t.img ) {
            setTimeout(function() {
                WRAP.Geo.redraw(layer);
            }, 500);
            return;
        }
        
        var valid = true;
        if ( this.content_revision != revision.content ) {
            valid = false;
            this.content_revision = revision.content;
        }
        
        if ( valid )
            return;
        
console.log("draw:"+layer.name());
        
        dl.length = 0;
        
        for ( var key in root ) {
            var c = root[key];
            if ( c.lat && c.lon ) {
                var image;
                if ( !c.dir ) {
                    image = icon_n;
                }
                else {
                    var dir = Math.floor((c.dir+(360/(dir_sep*2)))/(360/dir_sep));
                    dir = dir%dir_sep;
                    image = icons.s.img[dir];
                }
                var feature = new WRAP.Geo.Feature.Image({
                    point:[c.lon/60.0, c.lat/60.0],
                    image:image,
                    width:icon_width,
                    height:icon_height,
                    offsetX:icon_offset_x,
                    offsetY:icon_offset_y
                });
                feature.set(layer, data.query("data."+key));
                dl.push(feature);
            }
        }
        WRAP.Geo.invalidate();
console.log("  display list -> "+dl.length);
    }
}

