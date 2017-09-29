/**
 * @namespace WRAP
 *
 **/

var WRAP; if (typeof WRAP === 'undefined') WRAP = {};

/**
 * @class DH
 * @static
 **/
WRAP.DH = {
    
    version: "1.1",
    
    /**
     *
     * データ・コンフィグの格納ディレクトリのパスを指定する
     * @property conf_path
     * @type {String}
     * @default "./pri/wrap/conf/data"
     **/
    conf_path: "./pri/wrap/conf/data",
    
    
    /**
     * カスタマコード、ユーザー名を設定する
     *
     * @method setUser
     * @param customercode {String} カスタマコード
     * @param username {String} ユーザー名
     **/
    setUser : function(customercode, username) {
        this.user = username;
        this.customer = customercode;
        if ( this._data ) {
            var reload;
            for ( var key in this._data )
                (reload = this._data[key].reload) && reload();
        }
    },
    
    /**
     * 処理対象のオブジェクトを指定する
     *
     * オブジェクト識別子はデータ毎に定められたユニークな文字列
     * @method addObject
     * @param id {String} オブジェクト識別子
     * @return {WRAP.DH.Reference} 対象オブジェクトのルートの参照オブジェクト
     **/
    addObject: function(id) {
        var self = this;
        self._data[id] = {name:id, base:{}, load:[], inspect:[]};
        var conf = this.conf_path + "/" + id + ".json";
        this._getJSON(conf, "configuration", function(c) {
            var data = self._data[id];
            data.conf = c;
            var name = c.DataHandler;
            if ( name && self.DataHandler[name] ) {
                data.handler = new self.DataHandler[name](data.ref, data.conf, data.base);
                WRAP.DH._load(data);
            }
            else {
                self._error("Implementation WRAP.DH.DataHandler."+name+" not found.");
            }
        });
        return (self._data[id].ref = new this.Reference(id));
    },
    
    /**
     * オブジェクトを処理対象から削除する
     * @method removeObject
     * @param id {String} オブジェクト識別子
     **/
    removeObject: function(id) {
        delete this._data[id];
    },
    
    /**
     * オブジェクトの参照（Rerenceオブジェクト）を返す
     *
     * 参照識別子はオブジェクト名称を「.」連結したオブジェクトのパス文字列
     *
     * 配列の場合[]でインデックスを指定可能
     *
     *      　記述方式
     *      　・オブジェクトの階層を表す場合、オブジェクト名を「.」連結する。
     *      　		　　"object.element1.element2"
     *
     *      　・テーブル（配列）内のインデックスを指定する。
     *      　		　　"JMA_RADAR.timelist[2]"
     *
     *      　・テーブル内の１要素について値が一致する要素を指定する。
     *      　		　　"JMA_RADAR.timelist[basetime=20160512T000000]"
     *
     * @method query
     * @param key {String} 参照識別子
     **/
    query: function(key) {
        return new this.Reference(key);
    },
    
    // Classes
    /**
     * Data Handling内で管理するオブジェクトの参照を表現するクラス
     *
     * @class DH.Reference
     * @constructor
     * @param key {String} 参照識別子
     * @param root {WRAP.DH.Reference} addObjectで返されたルートオブジェクト
     */
    Reference: function(key, root) {
        if ( !root ) {
            this._string = key;
            var ks = key.split(".");
            if ( !ks.length || !(this._data = WRAP.DH._data[ks[0]]) )
                WRAP.DH._error("Invalid reference. key="+key+" root object not found.");
        }
        else {
            this._string = root._string+"."+key;
            this._data = root._data;
        }
        
        this._path = (root?root._path:[]).concat(key?key.split("."):[]);

        /**
         * 当該オブジェクトの下位階層を検索し、参照識別子に対応する参照オブジェクトを返す。
         *
         * @method query
         * @param key {String} 参照識別子
         * @return {WEAP.DH.Reference} 参照オブジェクト
         **/
        this.query = function(key) {
            return new WRAP.DH.Reference(key, this);
        }

        /**
         * オブジェクトが配列の場合は、要素数を返す
         *
         * @method length
         * @return {Number} 配列のサイズ。<br>オブジェクトが配列でない場合は nullを返す
         **/
        this.length = function() {
            var v = this.value();
            return Array.isArray(v)?v.length:0;
        }

        /**
         * 参照オブジェクトの値（オブジェクト）を返す
         *
         *
         *        使用例）
         *        var route = WRAP.DH.query("Copilot.ffs_route").value()             // ffs_route配列（論理構成）が返る。
         *        var id = WRAP.DH.query("Copilot.ffs_route[2].id").value()			// ffs_routeのindex=2位置のidオブジェクトが返される。
         *        var vt = WRAP.DH.query("JMA_RADAR.timelist[basetime=20160512T000000]").query("validtime[1].time").value()
         *                                      // JMA_RADARのbassetime 20160512T000000の１件目の validtimeを返す。
         *
         * @method value
         * @return {Object} 参照オブジェクトの実体オブジェクトまたは値
         **/
        this.value = function() {
            var v;
            var data = this._data;
            if ( data ) {
                if ( data.handler && data.handler.resolve )
                    data.handler.resolve(this);
                if ( (v=data.base) ) {
                    for ( var i = 1 ; i < this._path.length ; i++ ) {
                        var key = this._path[i];
                        if ( !(v=this._resolve(v, key)) )
                            break;
                    }
                }
            }
            return v;
        }
    
        /**
         * 参照先オブジェクトが存在する（ロードされている）かどうかを返す
         *
         * @method available
         * @return {Boolean} 参照先オブジェクトが存在していれば true、<br>存在していない場合 false
         **/
        this.available = function() {
            return !(this.value() === undefined);
        }

        /**
         * 参照先オブジェクトをロードする
         *
         * @method load
         * @param cb {Function} コールバック関数
         *
         * <コールバック引数>
         * + __state__ String   ”completed”または ”error”
         * + __reference__  WRAP.DH.Reference    ロードされたオブジェクト参照
         * @return
         **/
        this.load = function(cb) {
            this._data.load.push({ref:this,cb:cb?cb:this._nop});
            WRAP.DH._load(this._data);
        }

        /**
         * オブジェクトの更新を監視する
         *
         * 参照先オブジェクトが更新された場合に指定したコールバック関数を呼び出す
         * @method inspect
         * @param cb {Function} コールバック関数
         * @param immediate {Boolean} trueの場合本関数呼び出し時点でデータがロードれていれば直ちにコールバックする
         *
         * <コールバック引数>
         * + __reference__  WRAP.DH.Reference    ロードされたオブジェクト参照
         * @return
         **/
        this.inspect = function(cb, immediate) {
            if ( cb ) {
                var key = this._string+"."+cb.toString();
                this._data.inspect.push({key:key,ref:this,cb:cb});
                if ( immediate && this.available() )
                    cb(this);
            }
            else {
                for ( var i = 0 ; i < this._data.inspect.length ; i++ ) {
                    if ( this._data.inspect[i].ref == this ) {
                        this.splice(i, 1);
                        return;
                    }
                    i++;
                }
            }
        }
        
        /**
         * 参照オブジェクトが配列の場合に、各要素を引数とする指定フィルタ関数を呼び出す
         *
         * filter関数でリターンしたオブジェクトを要素とする配列として返す。
         *
         * @method filter
         * @param cb {Function} コールバック関数
         * @param immediate {Boolean} trueの場合本関数呼び出し時点でデータがロードれていれば直ちにコールバックする
         *
         * <コールバック引数>
         * + __object__  Object    配列内要素
         * @return {Array} フィルタ関数がretuenした非indefinedオブジェクトを要素とする配列<br>
         * 本参照オブジェクトが配列を参照してなかった場合は、undefinedを返す。配列のサイズ。
         **/
        this.filter = function(cb) {
            var v = this.value();
            if ( Array.isArray(v) ) {
                var array = [];
                var l = v.length;
                for ( var i = 0 ; i < l ; i++ ) {
                    var r = cb(v[i]);
                    if ( !(r === undefined) )
                        array.push(r);
                }
                return array;
            }
            return undefined;
        }
        
        /**
         * データオブジェクトにディスプレイタイムに対するコンテンツ時間を決定するためのカストマイズロジックを登録する。<br/>
         * デフォルトではデータオブジェクトはDisplayTimeの直近の （指定 Basetimeにおける） Validtimeを選択する。<br/>
         * これ以外のロジックでコンテンツ時間を決定したい場合に、本関数によりカスタム処理を登録する。<br/>
         *
         * カスタムロジックは、引数の dataオブジェクトから現在のタイムリストを取得し、引数のcontentオブジェクトの bastime、valitdimeプロパティを設定する。
         *
         * @method validate
         * @param cb {Function} コールバック関数
         * @param result {Boolean} trueの場合、指定content属性によりレイヤーがレンダリングされる。falseの場合はレイヤーの表示内容がクリアされる。
         *
         * <コールバック引数>
         * + __displaytime__  {String}    ディスプレイタイム（YYYYMMDDThhmmss型）
         * + __data__  {WRAP.DH.Reference}    データオブジェクト
         * + __content__  {Object}    現在のコンテンツ属性
         * @return {Boolean} true：レイヤー更新、false：レイヤークリア<br>
         **/
        this.validate = function(cb) {
            this.validator = cb;
        }
        
        this._resolve = function(value, key) {
            var v;
            var bs = key.indexOf("[");
            var be = key.indexOf("]");
            if ( bs < 0 && be < 0 ) {
                v = value[key];
            }
            else if ( bs < 0 || be < 0 ) {
                WRAP.DH._error("Invalid reference key. \""+key+"\"");
            }
            else {
                var e = key.substring(0, bs);
                if ( (v = value[e]) ) {
                    var eq = key.indexOf("=");
                    if ( eq > bs ) {
                        if ( Array.isArray(v) ) {
                            var idx = key.substring(bs+1, eq);
                            var cnd = key.substring(eq+1, be);
                            var l = v.length;
                            var i = 0;
                            while ( i < l ) {
                                if ( v[i][idx] == cnd )
                                   break;
                                i++;
                            }
                            v = (i < l)?v[i]:undefined;
                        }
                    }
                    else {
                        var idx = key.substring(bs+1, be);
                        v = v[idx];
                    }
                }
            }
            return v;
        }
                               
        this._contain = function(ref) {
            var l = this._path.length;
            for ( var i = 0 ; i < l ; i++ ) {
                if ( this._path[i] != ref._path[i] )
                    return false;
            }
            return true;
        }
        
        this._equal = function(ref) {
            var l = this._path.length;
            if ( l != ref._path.length )
                return false;
            for ( var i = 0 ; i < l ; i++ ) {
                if ( this._path[i] != ref._path[i] )
                    return false;
            }
            return true;
        }
        
        this._handler = function() {
            return this._data.handler;
        }
        
        this._nop = function() {}
    },
    
    // Name Space
    DataHandler: {},
    
    // Internal Objects
    _cache: function(max) {
        this.array = [];
        this.max = max;
        
        this.get = function(key) {
            for ( var i = 0 ; i < this.array.length ; i++ ) {
                if ( this.array[i].key == key ) {
                    var t = this.array[i];
                    this.array.splice(i,1);
                    this.array.unshift(t);
                    return t;
                }
            }
            return null;
        }
        
        this.set = function(key, data) {
            var r = this.get(key);
            if ( r ) {
                r.data = data;
                return;
            }
            this.array.unshift({key:key, data:data});
            if ( this.array.length >= this.max )
                this.array.pop();
        }
    },
    
    _get: function(url, desc, cb, err) {
        var self = this;
        var xhr = new XMLHttpRequest();
        if (xhr) {
            xhr.onreadystatechange = function() {
                if ( xhr.readyState === 4 ) {
                    if ( xhr.status === 200 || xhr.status === 0 ) {
                        cb(xhr.responseText);
                    }
                    else {
                        self._error(desc+" load error. ("+xhr.status+") ["+url+"]");
                        if ( err )
                            err();
                        else
                            cb(null);
                    }
                }
            };
            var postfix = (url.indexOf("?")>=0)?"&":"?";
            postfix += "t="+(new Date()).getTime();
            xhr.open("GET", url+postfix, true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.send(null);
        }
    },
    
    _getJSON: function(url, desc, cb, err) {
        var self = this;
        this._get(url, desc, function(res) {
            var obj = null;
            try {
                obj = JSON.parse(res);
            }
            catch (e) {
                self._error(desc+" parse error. ["+url+"]");
            }
            if ( obj )
                cb(obj, url);
            else if ( err )
                err(url);
            else
                cb(null);
        }, err);
    },
                               
    _load: function(data) {
        if ( !data.handler )
            return;
        var rq;
        while ( (rq=data.load.shift()) ) {
            rq.ref.cb = rq.cb;
            data.handler.load(rq.ref,
                function(state, ref) {
                    if ( ref ) {
                        for ( var i = 0 ; i < data.inspect.length ; i++ ) {
                            var t = data.inspect[i];
                            if ( ref._contain(t.ref) || t.ref._contain(ref) )
                                t.cb(t.ref);
                        }
                        if ( ref.cb ) {
                            ref.cb(state, ref);
                            delete ref.cb;
                        }
                    }
                });
        }
    },
                               
    _padding: function(v, l) {
        if ( l == void 0 )
            l = 2;
        var t = "" + v;
        while ( t.length < l )
            t = "0" + t;
        return t;
    },

    _timeString: function(time, d, m, t) {
        var str = "";
        if ( arguments.length == 1 )
            d="",m="T",t="";
        if ( d == "" || d ) {
            str += time.getUTCFullYear()+d;
            str += this._padding(time.getUTCMonth()+1)+d;
            str += this._padding(time.getUTCDate());
        }
        if ( m )
            str += m;
        if ( t == "" || t ) {
            str += this._padding(time.getUTCHours())+t;
            str += this._padding(time.getUTCMinutes())+t;
            str += this._padding(time.getUTCSeconds());
        }
        return str;
    },

    _time: function(str) {
        str = str.replace(/ +/g,' ').replace(/:| |T|\//g,",");
        var t  = [0,0,0,0,0,0,-1];
        var m  = [4,2,2,2,2,2,-1];
        var k = 0, d = 0;
        for ( var i = 0 ; i < str.length && m[k] > 0 ; i++ ) {
            var c = str.charAt(i);
            if ( isNaN(c) ) {
                if ( c == "," )
                    k++, d = 0;
            }
            else {
                if ( m[k] == d )
                    k++, d = 0;
                t[k] = t[k]*10+parseInt(c);
                d++;
            }
        }
        return new Date(Date.UTC(t[0],t[1]-1,t[2],t[3],t[4],t[5]));
    },

    _currentTime: function() {
        return new Date;
    },
                               
    _setTime: function(time, sec) {
        return new Date(time.getTime()+sec*1000);
    },
                               
    _elapsed: function(from, to) {
        return parseInt((to.getTime()-from.getTime())/1000);
    },
                               
    _error: function(e) {
        console.warn((this.name||"Error")+":"+e);
    },
    
    _data: {},
                                             
    Test: {}
}



WRAP.DH.DataHandler.GeoTiff = function(reference, conf, base) {
    
    var self = this;
    
    self.name = conf.Name;
    self.ref = reference;

    self.tile_cache = new WRAP.DH._cache(1000);
    self.data_cache = new WRAP.DH._cache(200);
    
    self.file = conf.Attributes.File;
    self.grid = conf.Attributes.DataGrid;
    self.update_interval = parseFloat(conf.Attributes.UpdateInterval);
    
    self.boundary = {
        n:self.grid.LatBase,
        w:self.grid.LonBase,
        s:self.grid.LatBase-self.grid.LatInterval*self.grid.Height,
        e:self.grid.LonBase+self.grid.LonInterval*self.grid.Width,
    }
    self.tiled = self.grid.TileSize;
    if ( self.tiled ) {
        var y_tile = 1;
        var x_tile = 1;
        var yt = self.tiled, xt = self.tiled;
        while ( yt < self.grid.Height ) {
            yt *= 2;
            y_tile++;
        }
        while ( xt < self.grid.Width ) {
            xt *= 2;
            x_tile++;
        }
        self.max_zoom = (y_tile>x_tile)?y_tile:x_tile;
    }
    
    this.load = function(ref, cb) {
        var file = conf.Attributes.TimeList;
        if ( file ) {
            WRAP.DH._getJSON(file, "Timelist", function(data) {
                if ( data.timelist ) {
                    base.timelist = data.timelist;
                    cb("completed", ref);
                }
                else if ( data.validtime ) {
                    base.validtime = data.validtime;
                    cb("completed", ref);
                }
                else {
                    WRAP.DH._error(self.name + " Timelist format.");
                    cb("error", null);
                }
                             
                if ( self.update_interval > 0 ) {
                    setTimeout(function() {
                        self.ref.load();
                    }, self.update_interval*1000);
                }
            });
        }
    }

    var fieldTagNames = {
        // TIFF Baseline
        0x013B: 'Artist',
        0x0102: 'BitsPerSample',
        0x0109: 'CellLength',
        0x0108: 'CellWidth',
        0x0140: 'ColorMap',
        0x0103: 'Compression',
        0x8298: 'Copyright',
        0x0132: 'DateTime',
        0x0152: 'ExtraSamples',
        0x010A: 'FillOrder',
        0x0121: 'FreeByteCounts',
        0x0120: 'FreeOffsets',
        0x0123: 'GrayResponseCurve',
        0x0122: 'GrayResponseUnit',
        0x013C: 'HostComputer',
        0x010E: 'ImageDescription',
        0x0101: 'ImageLength',
        0x0100: 'ImageWidth',
        0x010F: 'Make',
        0x0119: 'MaxSampleValue',
        0x0118: 'MinSampleValue',
        0x0110: 'Model',
        0x00FE: 'NewSubfileType',
        0x0112: 'Orientation',
        0x0106: 'PhotometricInterpretation',
        0x011C: 'PlanarConfiguration',
        0x0128: 'ResolutionUnit',
        0x0116: 'RowsPerStrip',
        0x0115: 'SamplesPerPixel',
        0x0131: 'Software',
        0x0117: 'StripByteCounts',
        0x0111: 'StripOffsets',
        0x00FF: 'SubfileType',
        0x0107: 'Threshholding',
        0x011A: 'XResolution',
        0x011B: 'YResolution',
        
        // TIFF Extended
        0x0146: 'BadFaxLines',
        0x0147: 'CleanFaxData',
        0x0157: 'ClipPath',
        0x0148: 'ConsecutiveBadFaxLines',
        0x01B1: 'Decode',
        0x01B2: 'DefaultImageColor',
        0x010D: 'DocumentName',
        0x0150: 'DotRange',
        0x0141: 'HalftoneHints',
        0x015A: 'Indexed',
        0x015B: 'JPEGTables',
        0x011D: 'PageName',
        0x0129: 'PageNumber',
        0x013D: 'Predictor',
        0x013F: 'PrimaryChromaticities',
        0x0214: 'ReferenceBlackWhite',
        0x0153: 'SampleFormat',
        0x0154: 'SMinSampleValue',
        0x0155: 'SMaxSampleValue',
        0x022F: 'StripRowCounts',
        0x014A: 'SubIFDs',
        0x0124: 'T4Options',
        0x0125: 'T6Options',
        0x0145: 'TileByteCounts',
        0x0143: 'TileLength',
        0x0144: 'TileOffsets',
        0x0142: 'TileWidth',
        0x012D: 'TransferFunction',
        0x013E: 'WhitePoint',
        0x0158: 'XClipPathUnits',
        0x011E: 'XPosition',
        0x0211: 'YCbCrCoefficients',
        0x0213: 'YCbCrPositioning',
        0x0212: 'YCbCrSubSampling',
        0x0159: 'YClipPathUnits',
        0x011F: 'YPosition',
        
        // EXIF
        0x9202: 'ApertureValue',
        0xA001: 'ColorSpace',
        0x9004: 'DateTimeDigitized',
        0x9003: 'DateTimeOriginal',
        0x8769: 'Exif IFD',
        0x9000: 'ExifVersion',
        0x829A: 'ExposureTime',
        0xA300: 'FileSource',
        0x9209: 'Flash',
        0xA000: 'FlashpixVersion',
        0x829D: 'FNumber',
        0xA420: 'ImageUniqueID',
        0x9208: 'LightSource',
        0x927C: 'MakerNote',
        0x9201: 'ShutterSpeedValue',
        0x9286: 'UserComment',
        
        // IPTC
        0x83BB: 'IPTC',
        
        // ICC
        0x8773: 'ICC Profile',
        
        // XMP
        0x02BC: 'XMP',
        
        // GDAL
        0xA480: 'GDAL_METADATA',
        0xA481: 'GDAL_NODATA',
        
        // Photoshop
        0x8649: 'Photoshop',
        
        // GeoTiff
        0x830E: 'ModelPixelScale',
        0x8482: 'ModelTiepoint',
        0x85D8: 'ModelTransformation',
        0x87AF: 'GeoKeyDirectory',
        0x87B0: 'GeoDoubleParams',
        0x87B1: 'GeoAsciiParams'
    };
    
    var key;
    var fieldTags = {};
    for (key in fieldTagNames) {
        fieldTags[fieldTagNames[key]] = parseInt(key);
    }
    
    var arrayFields = [fieldTags.BitsPerSample, fieldTags.ExtraSamples, fieldTags.SampleFormat, fieldTags.StripByteCounts, fieldTags.StripOffsets, fieldTags.StripRowCounts, fieldTags.TileByteCounts, fieldTags.TileOffsets];
    
    var fieldTypeNames = {
        0x0001: 'BYTE',
        0x0002: 'ASCII',
        0x0003: 'SHORT',
        0x0004: 'LONG',
        0x0005: 'RATIONAL',
        0x0006: 'SBYTE',
        0x0007: 'UNDEFINED',
        0x0008: 'SSHORT',
        0x0009: 'SLONG',
        0x000A: 'SRATIONAL',
        0x000B: 'FLOAT',
        0x000C: 'DOUBLE',
        // introduced by BigTIFF
        0x0010: 'LONG8',
        0x0011: 'SLONG8',
        0x0012: 'IFD8'
    };
    
    var fieldTypes = {};
    for (key in fieldTypeNames) {
        fieldTypes[fieldTypeNames[key]] = parseInt(key);
    }
    
    var geoKeyNames = {
        1024: 'GTModelTypeGeoKey',
        1025: 'GTRasterTypeGeoKey',
        1026: 'GTCitationGeoKey',
        2048: 'GeographicTypeGeoKey',
        2049: 'GeogCitationGeoKey',
        2050: 'GeogGeodeticDatumGeoKey',
        2051: 'GeogPrimeMeridianGeoKey',
        2052: 'GeogLinearUnitsGeoKey',
        2053: 'GeogLinearUnitSizeGeoKey',
        2054: 'GeogAngularUnitsGeoKey',
        2055: 'GeogAngularUnitSizeGeoKey',
        2056: 'GeogEllipsoidGeoKey',
        2057: 'GeogSemiMajorAxisGeoKey',
        2058: 'GeogSemiMinorAxisGeoKey',
        2059: 'GeogInvFlatteningGeoKey',
        2060: 'GeogAzimuthUnitsGeoKey',
        2061: 'GeogPrimeMeridianLongGeoKey',
        2062: 'GeogTOWGS84GeoKey',
        3072: 'ProjectedCSTypeGeoKey',
        3073: 'PCSCitationGeoKey',
        3074: 'ProjectionGeoKey',
        3075: 'ProjCoordTransGeoKey',
        3076: 'ProjLinearUnitsGeoKey',
        3077: 'ProjLinearUnitSizeGeoKey',
        3078: 'ProjStdParallel1GeoKey',
        3079: 'ProjStdParallel2GeoKey',
        3080: 'ProjNatOriginLongGeoKey',
        3081: 'ProjNatOriginLatGeoKey',
        3082: 'ProjFalseEastingGeoKey',
        3083: 'ProjFalseNorthingGeoKey',
        3084: 'ProjFalseOriginLongGeoKey',
        3085: 'ProjFalseOriginLatGeoKey',
        3086: 'ProjFalseOriginEastingGeoKey',
        3087: 'ProjFalseOriginNorthingGeoKey',
        3088: 'ProjCenterLongGeoKey',
        3089: 'ProjCenterLatGeoKey',
        3090: 'ProjCenterEastingGeoKey',
        3091: 'ProjCenterNorthingGeoKey',
        3092: 'ProjScaleAtNatOriginGeoKey',
        3093: 'ProjScaleAtCenterGeoKey',
        3094: 'ProjAzimuthAngleGeoKey',
        3095: 'ProjStraightVertPoleLongGeoKey',
        3096: 'ProjRectifiedGridAngleGeoKey',
        4096: 'VerticalCSTypeGeoKey',
        4097: 'VerticalCitationGeoKey',
        4098: 'VerticalDatumGeoKey',
        4099: 'VerticalUnitsGeoKey'
    };
    
    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
    
    
    var DataView64 = function () {
        function DataView64(arrayBuffer) {
            this._dataView = new DataView(arrayBuffer);
        }
        
        _createClass(DataView64, [
          {
              key: "getUint64",
              value: function (offset, littleEndian) {
                  var left = this.getUint32(offset, littleEndian);
                  var right = this.getUint32(offset + 4, littleEndian);
                  if (littleEndian) {
                      return left << 32 | right;
                  }
                      return right << 32 | left;
                  }
          }, {
              key: "getInt64",
              value: function (offset, littleEndian) {
                  var left, right;
                  if (littleEndian) {
                      left = this.getInt32(offset, littleEndian);
                      right = this.getUint32(offset + 4, littleEndian);
                      return left << 32 | right;
                  }
                  left = this.getUint32(offset, littleEndian);
                  right = this.getInt32(offset + 4, littleEndian);
                  return right << 32 | left;
                  }
          }, {
              key: "getUint8",
              value: function (offset, littleEndian) {
                      return this._dataView.getUint8(offset, littleEndian);
                  }
          }, {
              key: "getInt8",
              value: function (offset, littleEndian) {
                      return this._dataView.getInt8(offset, littleEndian);
                  }
          }, {
              key: "getUint16",
              value: function (offset, littleEndian) {
                      return this._dataView.getUint16(offset, littleEndian);
                  }
          }, {
              key: "getInt16",
              value: function (offset, littleEndian) {
                      return this._dataView.getInt16(offset, littleEndian);
                  }
          }, {
              key: "getUint32",
              value: function (offset, littleEndian) {
                      return this._dataView.getUint32(offset, littleEndian);
                  }
          }, {
              key: "getInt32",
              value: function (offset, littleEndian) {
                      return this._dataView.getInt32(offset, littleEndian);
                  }
          }, {
              key: "getFloat32",
              value: function (offset, littleEndian) {
                      return this._dataView.getFloat32(offset, littleEndian);
                  }
          }, {
              key: "getFloat64",
              value: function (offset, littleEndian) {
                      return this._dataView.getFloat64(offset, littleEndian);
                  }
          }, {
              key: "buffer",
              get: function () {
                  return this._dataView.buffer;
              }
        }]);
        return DataView64;
    }();
    
    function GeoTIFF(rawData, options) {
        this.dataView = new DataView64(rawData);
        options = options || {};
        this.cache = options.cache || false;
        
        var BOM = this.dataView.getUint16(0, 0);
        if (BOM === 0x4949) {
            this.littleEndian = true;
        } else if (BOM === 0x4D4D) {
            this.littleEndian = false;
        } else {
            throw new TypeError("Invalid byte order value.");
        }
        
        var magicNumber = this.dataView.getUint16(2, this.littleEndian);
        if (this.dataView.getUint16(2, this.littleEndian) === 42) {
            this.bigTiff = false;
        } else if (magicNumber === 43) {
            this.bigTiff = true;
            var offsetBytesize = this.dataView.getUint16(4, this.littleEndian);
            if (offsetBytesize !== 8) {
                throw new Error("Unsupported offset byte-size.");
            }
        } else {
            throw new TypeError("Invalid magic number.");
        }
        
        this.fileDirectories = this.parseFileDirectories(this.getOffset(this.bigTiff ? 8 : 4));
    }
    
    GeoTIFF.prototype = {
        getOffset: function (offset) {
            if (this.bigTiff) {
                return this.dataView.getUint64(offset, this.littleEndian);
            }
            return this.dataView.getUint32(offset, this.littleEndian);
        },
            
        getFieldTypeLength: function (fieldType) {
            switch (fieldType) {
                case fieldTypes.BYTE:case fieldTypes.ASCII:case fieldTypes.SBYTE:case fieldTypes.UNDEFINED:
                    return 1;
                case fieldTypes.SHORT:case fieldTypes.SSHORT:
                    return 2;
                case fieldTypes.LONG:case fieldTypes.SLONG:case fieldTypes.FLOAT:
                    return 4;
                case fieldTypes.RATIONAL:case fieldTypes.SRATIONAL:case fieldTypes.DOUBLE:
                case fieldTypes.LONG8:case fieldTypes.SLONG8:case fieldTypes.IFD8:
                    return 8;
                default:
                    throw new RangeError("Invalid field type: " + fieldType);
            }
        },
            
        getValues: function (fieldType, count, offset) {
            var values = null;
            var readMethod = null;
            var fieldTypeLength = this.getFieldTypeLength(fieldType);
            var i;
            
            switch (fieldType) {
                case fieldTypes.BYTE:case fieldTypes.ASCII:case fieldTypes.UNDEFINED:
                    values = new Uint8Array(count);readMethod = this.dataView.getUint8;
                    break;
                case fieldTypes.SBYTE:
                    values = new Int8Array(count);readMethod = this.dataView.getInt8;
                    break;
                case fieldTypes.SHORT:
                    values = new Uint16Array(count);readMethod = this.dataView.getUint16;
                    break;
                case fieldTypes.SSHORT:
                    values = new Int16Array(count);readMethod = this.dataView.getInt16;
                    break;
                case fieldTypes.LONG:
                    values = new Uint32Array(count);readMethod = this.dataView.getUint32;
                    break;
                case fieldTypes.SLONG:
                    values = new Int32Array(count);readMethod = this.dataView.getInt32;
                    break;
                case fieldTypes.LONG8:case fieldTypes.IFD8:
                    values = new Array(count);readMethod = this.dataView.getUint64;
                    break;
                case fieldTypes.SLONG8:
                    values = new Array(count);readMethod = this.dataView.getInt64;
                    break;
                case fieldTypes.RATIONAL:
                    values = new Uint32Array(count * 2);readMethod = this.dataView.getUint32;
                    break;
                case fieldTypes.SRATIONAL:
                    values = new Int32Array(count * 2);readMethod = this.dataView.getInt32;
                    break;
                case fieldTypes.FLOAT:
                    values = new Float32Array(count);readMethod = this.dataView.getFloat32;
                    break;
                case fieldTypes.DOUBLE:
                    values = new Float64Array(count);readMethod = this.dataView.getFloat64;
                    break;
                default:
                    throw new RangeError("Invalid field type: " + fieldType);
            }
            
            // normal fields
            if (!(fieldType === fieldTypes.RATIONAL || fieldType === fieldTypes.SRATIONAL)) {
                for (i = 0; i < count; ++i) {
                    values[i] = readMethod.call(this.dataView, offset + i * fieldTypeLength, this.littleEndian);
                }
            }
            // RATIONAL or SRATIONAL
            else {
                for (i = 0; i < count; i += 2) {
                    values[i] = readMethod.call(this.dataView, offset + i * fieldTypeLength, this.littleEndian);
                    values[i + 1] = readMethod.call(this.dataView, offset + (i * fieldTypeLength + 4), this.littleEndian);
                }
            }
            
            if (fieldType === fieldTypes.ASCII) {
                return String.fromCharCode.apply(null, values);
            }
            return values;
        },
            
        getFieldValues: function (fieldTag, fieldType, typeCount, valueOffset) {
            var fieldValues;
            var fieldTypeLength = this.getFieldTypeLength(fieldType);
            
            if (fieldTypeLength * typeCount <= (this.bigTiff ? 8 : 4)) {
                fieldValues = this.getValues(fieldType, typeCount, valueOffset);
            } else {
                var actualOffset = this.getOffset(valueOffset);
                fieldValues = this.getValues(fieldType, typeCount, actualOffset);
            }
            
            if (typeCount === 1 && arrayFields.indexOf(fieldTag) === -1 && !(fieldType === fieldTypes.RATIONAL || fieldType === fieldTypes.SRATIONAL)) {
                return fieldValues[0];
            }
            
            return fieldValues;
        },
            
        parseGeoKeyDirectory: function (fileDirectory) {
            var rawGeoKeyDirectory = fileDirectory.GeoKeyDirectory;
            if (!rawGeoKeyDirectory) {
                return null;
            }
            
            var geoKeyDirectory = {};
            for (var i = 4; i < rawGeoKeyDirectory[3] * 4; i += 4) {
                var key = geoKeyNames[rawGeoKeyDirectory[i]],
                location = rawGeoKeyDirectory[i + 1] ? fieldTagNames[rawGeoKeyDirectory[i + 1]] : null,
                count = rawGeoKeyDirectory[i + 2],
                offset = rawGeoKeyDirectory[i + 3];
                
                var value = null;
                if (!location) {
                    value = offset;
                } else {
                    value = fileDirectory[location];
                    if (typeof value === "undefined" || value === null) {
                        throw new Error("Could not get value of geoKey '" + key + "'.");
                    } else if (typeof value === "string") {
                        value = value.substring(offset, offset + count - 1);
                    } else if (value.subarray) {
                        value = value.subarray(offset, offset + count - 1);
                    }
                }
                geoKeyDirectory[key] = value;
            }
            return geoKeyDirectory;
        },
            
        parseFileDirectories: function (byteOffset) {
            var nextIFDByteOffset = byteOffset;
            var fileDirectories = [];
            
            while (nextIFDByteOffset !== 0x00000000) {
                var numDirEntries = this.bigTiff ? this.dataView.getUint64(nextIFDByteOffset, this.littleEndian) : this.dataView.getUint16(nextIFDByteOffset, this.littleEndian);
                
                var fileDirectory = {};
                
                for (var i = byteOffset + (this.bigTiff ? 8 : 2), entryCount = 0; entryCount < numDirEntries; i += this.bigTiff ? 20 : 12, ++entryCount) {
                    var fieldTag = this.dataView.getUint16(i, this.littleEndian);
                    var fieldType = this.dataView.getUint16(i + 2, this.littleEndian);
                    var typeCount = this.bigTiff ? this.dataView.getUint64(i + 4, this.littleEndian) : this.dataView.getUint32(i + 4, this.littleEndian);
                    //console.log("tifftag="+fieldTag);
                    
                    fileDirectory[fieldTagNames[fieldTag]] = this.getFieldValues(fieldTag, fieldType, typeCount, i + (this.bigTiff ? 12 : 8));
                }
                fileDirectories.push([fileDirectory, this.parseGeoKeyDirectory(fileDirectory)]);
                
                nextIFDByteOffset = this.getOffset(i);
            }
            return fileDirectories;
        }
    };
    
    
    
    var loadImage = function (filename, min, max, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', filename);
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.responseType = 'arraybuffer';
        xhr.onload = function (/*e*/) {
//            var TIFFTAG_IMAGEWIDTH = 256;
//            var TIFFTAG_IMAGELENGTH = 257;
//            var TIFFTAG_SAMPLEFORMAT = 339;
            var SAMPLEFORMAT_IEEEFP = 3;

            if ( !Module ) {
                console.log("WRAP.ASM Module not found.");
                cb(filename, []);
                return;
            }
            
            Module.printErr = function(msg) {
                //console.log(msg);
                msg = null;
            }
            
            if ( !Module.tmpFileID )
                Module.tmpFileID = 1;
            else
                Module.tmpFileID += 1;
            var file = String(Module.tmpFileID) + '.tiff';
            Module.FS.createDataFile('/', file, new Uint8Array(xhr.response), true, false);
            var tiff = Module.ccall('TIFFOpen', 'number', ['string', 'string'], [file,'r']);
            if ( !tiff ) {
                console.log("Tiff load error. "+file);
                cb(filename, []);
                return;
            }
            
            var geotiff = new GeoTIFF(this.response);
            var data = geotiff.fileDirectories && geotiff.fileDirectories[0] && geotiff.fileDirectories[0][0];
            var width = data.ImageWidth;    //Module.ccall('GetField', 'number', ['number', 'number'], [tiff, TIFFTAG_IMAGEWIDTH]);
            var height = data.ImageLength;  //Module.ccall('GetField', 'number', ['number', 'number'], [tiff, TIFFTAG_IMAGELENGTH]);
            var format = data.SampleFormat && data.SampleFormat[0];  //Module.ccall('GetField', 'number', ['number', 'number'], [tiff, TIFFTAG_SAMPLEFORMAT]);
            //console.log("file load completed width="+width+" height="+height+" format="+format );
            
            var raster = Module.ccall('_TIFFmalloc', 'number', ['number'], [width * height * 4]);
            //console.log("raster  "+raster);
            var result;
            if ( format == SAMPLEFORMAT_IEEEFP ) {
                result = Module.ccall('TIFFReadEncodedStrip', 'number',
                                      ['number','number','number','number'],
                                      [tiff,0,raster,width * height * 4]);
            }
            else {
                result = Module.ccall('TIFFReadRGBAImageOriented', 'number',
                                      ['number','number','number','number','number','number'],
                                      [tiff,width,height,raster,1,0]);
            }
            if (result === 0) {
                console.log('GeoTiff Data Parse Error');
                cb([]);
                return;
            }
            //console.log("result  "+result);
            
            var data;
            if ( format == SAMPLEFORMAT_IEEEFP )
                data = Module.HEAPF32.subarray(raster/4, raster + width * height);
            else
                data = Module.HEAPU8.subarray(raster, raster + width * height * 4);

            var values = [];
            var count = width*height;

            if ( format == SAMPLEFORMAT_IEEEFP ) {
                if ( !isNaN(min) && !isNaN(max) ) {
                    for (var i = 0 ; i < count ; i++ ) {
                        var v = data[i];
                        if ( min <= v && v <= max )
                            values[i] = v;
                    }
                }
                else if ( !isNaN(min) ) {
                    for (var i = 0 ; i < count ; i++ ) {
                        var v = data[i];
                        if ( min <= v )
                            values[i] = v;
                    }
                }
                else if ( !isNaN(max) ) {
                    for (var i = 0 ; i < count ; i++ ) {
                        var v = data[i];
                        if ( v <= max )
                            values[i] = v;
                    }
                }
                else {
                    for (var i = 0 ; i < count ; i++ )
                        values[i] = data[i];
                }
            }
            Module.ccall('_TIFFfree', 'number', ['number'], [raster]);
            Module.ccall('TIFFClose', 'number', ['number'], [tiff]);
            
            cb(filename, values);
        };
        xhr.onerror = function (/*e*/) {
            var values = [];
            cb(filename, values);
        }
        xhr.send();
    };
        
    function filePath(content, tile) {
        var path = [];
        
        var elements = (content.element&&Array.isArray(content.element))?content.element.length:0;
        if ( elements ) {
            for ( var i = 0 ; i < elements ; i++ ) {
                var file = self.file;
                for ( var key in content ) {
                    var v = content[key];
                    if ( key == 'element' )
                        v = content[key][i];
                    var t = "%"+key+"%";
                    if ( file.indexOf(t) >= 0 )
                        file = file.replace(t, v);
                }
                if ( tile ) {
                    for ( var key in tile ) {
                        var t = "%"+key+"%";
                        if ( file.indexOf(t) >= 0 )
                            file = file.replace(t, tile[key]);
                    }
                }
                path.push({file:file, index:i});
            }
        }
        else {
            var file = self.file;
            for ( var key in content ) {
                var t = "%"+key+"%";
                if ( file.indexOf(t) >= 0 )
                    file = file.replace(t, content[key]);
            }
            if ( tile ) {
                for ( var key in tile ) {
                    var t = "%"+key+"%";
                    if ( file.indexOf(t) >= 0 )
                        file = file.replace(t, tile[key]);
                }
            }
            path.push({file:file, index:0});
        }
        
        return path;
    }
    
    function makeTileKey(content, tile_id, option) {
        var tile_key = "";
        var count = 0;
        for ( var key in content ) {
            var v = content[key];
            if ( Array.isArray(v) && v.length ) {
                var t = v[0];
                for ( var i = 0 ; i < v.length ; i++ ) {
                    t += ("+"+v[i]);
                }
            }
            if ( count++ )
                tile_key += "/";
            tile_key += v;
        }
        tile_key += "/"+tile_id;
        if ( option )
            tile_key += "/"+option;
        return tile_key;
    }
    
    this.getGrid = function() {
        return self.grid;
    }
    
    this.getTile = function(content, tile_id, option) {
        var tile = this.tile_cache.get(makeTileKey(content, tile_id, option));
        if ( tile && tile.data )
            return tile.data;
//console.log("getTile false"+ makeTileKey(content, z, y, x));
        return null;
    }
    
    this.loadTile = function(content, tile_id, option, z, y, x, cood, bounds, cb) {
        var key = makeTileKey(content, tile_id, option);
        if ( self.tile_cache.get(key) ) {
            cb();
            return;
        }

        var data_list = [];
        if ( self.tiled ) {
//console.log("loadTile key="+key);
            
            var s_lat = cood[0];
            var s_lon = cood[1];
            var e_lat = cood[256*256*2-2];
            var e_lon = cood[256*256*2-1];
            var req_lond = Math.abs(e_lon-s_lon)/256;
            var req_latd = Math.abs(s_lat-e_lat)/256;
            
            var z = 0;
            var lond = self.grid.LonInterval;
            var latd = self.grid.LatInterval;
            while ( z < self.max_zoom ) {
                if ( lond >= req_lond && latd >= req_latd )
                    break;
                lond *= 2;
                latd *= 2;
                z++;
            }
            var sep = Math.pow(2,z);
            var tileHeight = self.grid.LatInterval*self.grid.TileSize*sep;
            var tileWidth = self.grid.LonInterval*self.grid.TileSize*sep;
            var h = Math.ceil(self.grid.Height/self.grid.TileSize);
            var w = Math.ceil(self.grid.Width/self.grid.TileSize);
            for ( var y = 0 ; y < h ; y ++ ) {
                var sy = self.grid.LatBase - y*tileHeight;
                var ey = sy - tileHeight;
                if ( e_lat > sy || ey > s_lat )
                    continue;
                for ( var x = 0 ; x < w ; x ++ ) {
                    var sx = self.grid.LonBase + x*tileWidth;
                    var ex = sx+tileWidth;
                    if ( e_lon < sx || ex < s_lon )
                        continue;
                    var data_file = filePath(content, {z:z, y:y, x:x});
                    for ( var i = 0 ; i < data_file.length ; i++ ) {
//console.log("tile="+data_file[i]);
                        var data = self.data_cache.get(data_file[i].file);
                        data_list.push({
                            file:data_file[i].file,
                            index:data_file[i].index,
                            element:data_file.length,
                            width:self.grid.TileSize,
                            height:self.grid.TileSize,
                            n:sy,
                            w:sx,
                            s:ey,
                            e:ex,
                            latInterval:self.grid.LatInterval*sep,
                            lonInterval:self.grid.LonInterval*sep,
                            data:data?data.data:null
                        });
                    }
                }
            }
        }
        else {
            var data_file = filePath(content);
            for ( var i = 0 ; i < data_file.length ; i++ ) {
                var data = self.data_cache.get(data_file[i]);
                var eee = content.element;
                if ( data_file.length > 1 )
                    eee = content.element[data_file[i].index];
                var minValue = self.grid.MinValue;
                var maxValue = self.grid.MaxValue;
                var override = self.grid.element && self.grid.element[eee];
                if ( override ) {
                if ( override.MinValue )
                    minValue = override.MinValue;
                if ( override.MaxValue )
                    maxValue = override.MaxValue;
                }
//console.log("elemen="+eee+" index="+data_file[i].index+" Max="+maxValue+" Min="+minValue);
                data_list.push({
                    file:data_file[i].file,
                    index:data_file[i].index,
                    element:data_file.length,
                    width:self.grid.Width,
                    height:self.grid.Height,
                    n:self.grid.LatBase,
                    w:self.grid.LonBase,
                    s:self.grid.LatBase-self.grid.LatInterval*self.grid.Height,
                    e:self.grid.LonBase+self.grid.LonInterval*self.grid.Width,
                    latInterval:self.grid.LatInterval,
                    lonInterval:self.grid.LonInterval,
                    minValue:minValue,
                    maxValue:maxValue,
                    data:data?data.data:null
                });
            }
        }
        
        function loadComplete() {
            var completed = true;
            for ( var i = 0 ; i < data_list.length ; i++ ) {
//console.log("data_list["+i+"] data="+(data_list[i].data?"true":"false"));
//if ( data_list[i].data )
//    console.log("data_list["+i+"] data.data="+(data_list[i].data.data?"true":"false"));
                if ( !data_list[i].data || !data_list[i].data.data ) {
//console.log("!!!");
                    var data = self.data_cache.get(data_list[i].file);
                    if ( data && data.data && data.data.data ) {
                       data_list[i].data = data.data;
                        continue;
                    }
                    completed = false;
                    break;
                }
            }
            if ( completed ) {
//console.log("loadCompelte key="+key);
                if ( option.indexOf("value") >= 0 ) {
                    var interval = 40;
                    var prms = option.split(" ");
                    if ( prms.length > 1 && parseInt(prms[1]) )
                        interval = parseInt(prms[1]);
                    var n = bounds.north/60.0 + 0.1;
                    var s = bounds.south/60.0;
                    var w = bounds.west/60.0 - 0.1;
                    var e = bounds.east/60.0;
                    
                    var tile = { data:[] };
                    for ( var i = 0 ; i < data_list.length ; i++ ) {
                        var d = data_list[i];
                        var v = d.data.data;
                        var sep = Math.pow(2,z);
                        var ppd = 256/(360.0/sep)
                        var step = 1;
                        var di = d.lonInterval;
                        while ( step < 256 ) {
                            if ( di*ppd >= interval )
                                break;
                            di *= 2.0;
                            step *= 2.0;
                        }
                        
                        for ( yi = 0 ; yi < d.height ; yi+=step ) {
                            var lat = d.n - d.latInterval*yi;
                            if ( lat > n || s >= lat )
                                continue;
                            for ( xi = 0 ; xi < d.width ; xi+=step ) {
                                var lon = d.w + d.lonInterval*xi;
                                if ( lon < -180 )
                                    lon += 360;
                                else if ( lon >= 180 )
                                    lon -= 360;
                                if ( lon < w || e <= lon )
                                    continue;
                                var d_index = yi*d.width+xi;
                                var vv = v[d_index];
                                if ( d.element > 1 ) {
                                    var vd = null;
                                    for ( var t = 0 ; t < tile.data.length ; t++ ) {
                                        var a = tile.data[t];
                                        if ( a.lat == lat && a.lon == lon ) {
                                            vd = a;
                                            a.value[d.index] = vv;
                                            break;
                                        }
                                    }
                                    if ( !vd ) {
                                        vd = {lat:lat, lon:lon, value:[], x:xi, y:yi, step:step};
                                        vd.value[d.index] = vv;
                                        tile.data.push(vd);
                                    }
                                    
                                }
                                else {
                                    tile.data.push({lat:lat, lon:lon, value:vv, x:xi, y:yi, step:step});
                                }
                            }
                        }
                    }
                    self.tile_cache.set(key, tile);
                    cb();
                    return;
                }
                if ( option.indexOf("highest") >= 0 ) {
                    var interval = 40;
                    var prms = option.split(" ");
                    if ( prms.length > 1 && parseInt(prms[1]) )
                        interval = parseInt(prms[1]);
                    var n = bounds.north/60.0 + 0.1;
                    var s = bounds.south/60.0;
                    var w = bounds.west/60.0 - 0.1;
                    var e = bounds.east/60.0;
                    
                    var tile = { data:[] };
                    for ( var i = 0 ; i < data_list.length ; i++ ) {
                        var d = data_list[i];
                        var v = d.data.data;
                        var sep = Math.pow(2,z);
                        var ppd = 256/(360.0/sep)
                        var step = 1;
                        var di = d.lonInterval;
                        while ( step < 256 ) {
                            if ( di*ppd >= interval )
                                break;
                            di *= 2.0;
                            step *= 2.0;
                        }
                        
                        for ( yi = 0 ; yi < d.height ; yi+=step ) {
                            var lat = d.n - d.latInterval*(yi+(step/2));
                            if ( lat > n || s >= lat )
                                continue;
                            for ( xi = 0 ; xi < d.width ; xi+=step ) {
                                var lon = d.w + d.lonInterval*(xi+(step/2));
                                if ( lon < -180 )
                                    lon += 360;
                                else if ( lon >= 180 )
                                    lon -= 360;
                                if ( lon < w || e <= lon )
                                    continue;
                                var vv = undefined;
                                for ( var ys = 0 ; ys < step ; ys++ ) {
                                    for ( var xs = 0 ; xs < step ; xs++ ) {
                                        var d_index = (yi+ys)*d.width+(xi+xs);
                                        var vvv = v[d_index];
                                        if ( vv === undefined || vv < vvv )
                                            vv = vvv;
                                    }
                                }
                                if ( d.element > 1 ) {
                                    var vd = null;
                                    for ( var t = 0 ; t < tile.data.length ; t++ ) {
                                        var a = tile.data[t];
                                        if ( a.lat == lat && a.lon == lon ) {
                                            vd = a;
                                            a.value[d.index] = vv;
                                            break;
                                        }
                                    }
                                    if ( !vd ) {
                                        vd = {lat:lat, lon:lon, value:[], x:xi, y:yi, step:step};
                                        vd.value[d.index] = vv;
                                        tile.data.push(vd);
                                    }
                                    
                                }
                                else {
                                    tile.data.push({lat:lat, lon:lon, value:vv, x:xi, y:yi, step:step});
                                }
                            }
                        }
                    }
                    self.tile_cache.set(key, tile);
                    cb();
                    return;
                }
                
                var num = 256*256;
                var tile = {
                    width:256,
                    height:256,
                }
                
                if ( data_list.length && data_list[0].element > 1 ) {
                    tile.data = [];
                    for ( var i = 0 ; i < data_list[0].element ; i++ )
                        tile.data[i] = new Array(num);
                }
                else {
                    tile.data =  new Array(num);
                }
                
                var l = 0;
                if ( option == "interpolate") {
                    for ( var p = 0 ; p < num ; p++ ) {
                        var lat = cood[l++];
                        var lon = cood[l++];
                        for ( var i = 0 ; i < data_list.length ; i++ ) {
                            var d = data_list[i];
                            var out = (d.element <= 1)?tile.data:tile.data[d.index];
                            var v = d.data.data;
                            var yp = (d.n-lat)/d.latInterval;
                            var yi = Math.floor(yp);
                            if ( 0 <= yi && yi < d.height ) {
                                var xp = ((lon >= d.w)?(lon-d.w):(lon-(d.w-360)))/d.lonInterval;
                                var xi = Math.floor(xp);
                                if ( 0 <= xi && xi < d.width ) {
                                    var d_index = yi*d.width+xi;
                                    var vv = v[d_index];
                                    
                                    if ( yi+1 < d.height && xi+1 < d.width ) {
                                        var lt = vv;
                                        var rt = v[d_index+1];
                                        var lb = v[d_index+d.width];
                                        var rb = v[d_index+d.width+1];
                                        var yr = yp-yi;
                                        var xr = xp-xi;
                                        vv = lt*(1.0-yr)*(1.0-xr)
                                           + rt*(1.0-yr)*xr
                                           + lb*yr*(1.0-xr)
                                           + rb*xr*yr;
                                    }
                                    out[p] = vv;
                                }
                            }
                        }
                    }
                }
                else {  // nearest
                    for ( var p = 0 ; p < num ; p++ ) {
                        var lat = cood[l++];
                        var lon = cood[l++];
                        for ( var i = 0 ; i < data_list.length ; i++ ) {
                            var d = data_list[i];
                            var out = (d.element <= 1)?tile.data:tile.data[d.index];
                            var v = d.data.data;
                            var yi = Math.floor((d.n-lat)/d.latInterval);
                            if ( 0 <= yi && yi < d.height ) {
                                var xp = ((lon >= d.w)?(lon-d.w):(lon-(d.w-360)))/d.lonInterval;
                                var xi = Math.floor(xp);
                                if ( 0 <= xi && xi < d.width ) {
                                    var d_index = yi*d.width+xi;
                                    var vv = v[d_index];
                                    out[p] = vv;
                                }
                            }
                        }
                    }
                }
                
//console.log("load complete set cache "+key);
                self.tile_cache.set(key, tile);
                cb();
            }
            return completed;
        }
            
        if ( loadComplete() ) {
            return;
        }
        
        for ( var i = 0 ; i < data_list.length ; i++ ) {
            if ( !data_list[i].data ) {
                data_list[i].data = {};
                self.data_cache.set(data_list[i].file, data_list[i].data);
//console.log("loadImage "+data_list[i].file);
                loadImage(data_list[i].file, data_list[i].minValue, data_list[i].maxValue,
                    function(file, data) {
//console.log("loaded "+file);
                          
                        var loaded = {data:data};
    /*
                        var length = loaded.data.length;
                        var minValue = data_list[i].minValue;
                        if ( minValue ) {
                            for ( var j = 0 ; j < length ; j++ ) {
                                var v = loaded.data[j];
                                if ( v < minValue )
                                    loaded.data[j] = undefined;
                            }
                        }
                        var maxValue = data_list[i].maxValue;
                        if ( maxValue ) {
                            for ( var j = 0 ; j < length ; j++ ) {
                                var v = loaded.data[j];
                                if ( v > maxValue )
                                    loaded.data[j] = undefined;
                            }
                        }
    */
                        self.data_cache.set(file, loaded);
                        for ( var j = 0 ; j < data_list.length ; j++ ) {
                            if ( data_list[j].file == file ) {
                                  data_list[j].data = loaded;
                                  loadComplete();
                                  break;
                            }
                        }
                    });
            }
        }
    }
    
    if ( self.update_interval > 0 )
        self.ref.load();
}


WRAP.DH.DataHandler.TMS = function(reference, conf, base) {
    
    var self = this;
    
    self.name = conf.Name;
    self.ref = reference;

    self.tile_cache = new WRAP.DH._cache(1000);
    self.data_cache = new WRAP.DH._cache(200);
    
    self.api = conf.Attributes.API;
    self.file = conf.Attributes.File;
    self.grid = conf.Attributes.DataGrid;
    self.bbox = self.grid.BoundingBox;
    self.ycoordinate = self.grid.YCoordinate || 1;
    self.min_z = self.grid.MinZoom;
    self.max_z = self.grid.MaxZoom;
    self.update_interval = parseFloat(conf.Attributes.UpdateInterval);
    
    this.load = function(ref, cb) {
        var file = conf.Attributes.TimeList;
        if ( file ) {
            WRAP.DH._getJSON(file, "Timelist", function(data) {
                if ( data.timelist ) {
                    base.timelist = data.timelist;
                    cb("completed", ref);
                }
                else if ( data.validtime ) {
                    base.validtime = data.validtime;
                    cb("completed", ref);
                }
                else {
                    if ( self.api == 'satdb' ) {
                        base.validtime = [];
                        for ( var i = 0 ; i < data.length ; i++ ) {
                            var t = data[i].split("_");
                            if ( t.length > 0 ) {
                                var s = t[t.length-1];
                                self.satdb_timestamp_length = s.length;
                                s = s.substr(0,8) + "T" + s.substr(8,6);
                                if ( s.length == 13 )
                                    s += "00";
                                base.validtime.push(s);
                            }
                        }
                        base.validtime.sort(
                            function(a,b){
                                if( a > b ) return -1;
                                if( a < b ) return 1;
                                return 0;
                            });
                             
                        cb("completed", ref);
                        return;
                    }
                             
                    WRAP.DH._error(self.name + " Timelist format.");
                    cb("error", null);
                }

                if ( self.update_interval > 0 ) {
                    setTimeout(function() {
                        self.ref.load();
                    }, self.update_interval*1000);
                }
            });
        }
    }

    
    function filePath(content, tile) {
        var file = self.file;
        for ( var key in content ) {
            var v = content[key];
            if ( !v )
                continue;
            if ( self.api == 'satdb' && key == 'validtime' ) {
                if ( self.satdb_timestamp_length == 12 )
                    v = v.substr(0,8)+v.substr(9,4);
                else if ( self.satdb_timestamp_length == 14 )
                    v = v.substr(0,8)+v.substr(9,6);
            }
            var t = "%"+key+"%";
            if ( file.indexOf(t) >= 0 )
                file = file.replace(t, v);
        }
        if ( tile ) {
            for ( var key in tile ) {
                var t = "%"+key+"%";
                if ( file.indexOf(t) >= 0 )
                    file = file.replace(t, tile[key]);
            }
        }
        return file;
    }
    
    function makeTileKey(content, tile_id, option) {
        var tile_key = "";
        var count = 0;
        for ( var key in content ) {
            var v = content[key];
            if ( Array.isArray(v) && v.length ) {
                var t = v[0];
                for ( var i = 0 ; i < v.length ; i++ ) {
                    t += ("+"+v[i]);
                }
            }
            if ( count++ )
                tile_key += "/";
            tile_key += v;
        }
        tile_key += "/"+tile_id;
        if ( option )
            tile_key += "/"+option;
        return tile_key;
    }
    
    this.getTile = function(content, tile_id, option) {
        var tile = this.tile_cache.get(makeTileKey(content, tile_id, option));
        if ( tile && tile.data )
            return tile.data;
//console.log("getTile false"+ makeTileKey(content, z, y, x));
        return null;
    }
    
    this.loadTile = function(content, tile_id, option, z, y, x, cood, bbox, cb) {
        cood = null;
        
        var key = makeTileKey(content, tile_id, option);
        if ( self.tile_cache.get(key) ) {
            cb();
            return;
        }
        if ( self.bbox ) {
            var north = bbox.north/60;
            var south = bbox.south/60;
            var west = bbox.west/60;
            var east = bbox.east/60;
            if ( self.bbox.North < south || self.bbox.South > north
            　|| ( (self.bbox.East < west || self.bbox.West > east)
                && (self.bbox.East+360 < west || self.bbox.West+360 > east) ) ) {
                var tile = {
                    empty:true,
                    data:new Uint8Array(4*256*256)
                };
                self.tile_cache.set(key, tile);
                cb();
                return;
            }
        }
        
        var tx = x, ty = y, tz = z;
        if ( z > self.max_z ) {
            var d = Math.pow(2,(z-self.max_z));
            tz = self.max_z;
            ty = Math.floor(y/d);
            tx = Math.floor(x/d);
            var tid = "M/"+tz+"/"+ty+"/"+tx;
            var tkey = makeTileKey(content, tid, option);
            var tile = self.tile_cache.get(tkey);
            if ( tile && tile.data ) {
                if ( tile.data.canvas ) {
                    var sw = Math.floor(256/d);
                    var canvas = document.createElement('canvas');
                    canvas.width = 256;
                    canvas.height = 256;
                    var ctx = canvas.getContext("2d");
                    var id = ctx.getImageData(0, 0, 256, 256);
                    var mx = x-tx*d;
                    var my = d-1-(y-ty*d);
                    var src = tile.data.data;
                    var dst = id.data;
                    var sy = my*sw;
                    var sx = mx*sw;
                    if ( d < 256 ) {
                        for ( var y = 0 ; y < sw ; y++ ) {
                            var sdy = y*d;
                            for ( var x = 0 ; x < sw ; x++ ) {
                                var sdx = x*d;
                                var s = ((sy+y)*256+(sx+x))*4;
                                var r = src[s], g = src[s+1], b = src[s+2], a = src[s+3];
                                for ( var dy = 0 ; dy < d ; dy++ ) {
                                    var i = ((sdy+dy)*256+sdx)*4;
                                    for ( var dx = 0 ; dx < d ; dx++ ) {
                                        dst[i++] = r;
                                        dst[i++] = g;
                                        dst[i++] = b;
                                        dst[i++] = a;
                                    }
                                }
                            }
                        }
                    }
                    else {
                        var i = 0;
                        var s = (sy*256+sx)*4;
                        var r = src[s], g = src[s+1], b = src[s+2], a = src[s+3];
                        for ( var y = 0 ; y < 256 ; y++ ) {
                            for ( var x = 0 ; x < 256 ; x++ ) {
                                dst[i++] = r;
                                dst[i++] = g;
                                dst[i++] = b;
                                dst[i++] = a;
                            }
                        }
                    }
                    var tile = {
                        width:256,
                        height:256,
                        canvas:canvas,
                        ctx:ctx,
                        data:id.data
                    };
                    self.tile_cache.set(key, tile);
                    cb();
                }
                else {
                    var tile = {
                        empty:true,
                        data:new Uint8Array(4*256*256)
                    };
                    self.tile_cache.set(key, tile);
                    cb();
                }
                return;
            }
            key = tkey;
        }
        
        if ( self.ycoordinate == -1 )
            ty = Math.pow(2,tz) - 1 - ty;
        var data_file = filePath(content, {z:tz, y:ty, x:tx});
        
        if ( !data_file || data_file.indexOf("%") >= 0 ) {
            var tile = {
                empty:true,
                data:new Uint8Array(4*256*256)
            };
            self.tile_cache.set(key, tile);
            cb();
            return;
        }
        
        var img = new Image();
        img.crossOrigin = "use-credentials"; // "anonymous";
        img.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var id = ctx.getImageData(0, 0, 256, 256)
            var tile = {
                width:256,
                height:256,
                canvas:canvas,
                ctx:ctx,
                data:id.data
            }
            self.tile_cache.set(key, tile);
            cb();
        };
        img.onerror = function() {
            var tile = {
                empty:true,
                data:new Uint8Array(4*256*256)
            };
            self.tile_cache.set(key, tile);
            cb();
        };
        img.src = data_file;
    }
    
    if ( self.update_interval > 0 )
        self.ref.load();
}


WRAP.DH.DataHandler.DataJSON = function(reference, conf, base) {
    
    var self = this;
    
    self.name = conf.Name;
    self.ref = reference;
    self.conf = conf;
    self.update_interval = parseFloat(conf.Attributes.UpdateInterval);
    self.position = null;
    base.data = {};
    
    this.load = function(ref, cb) {
        var point_file = conf.Attributes.PointFile;
        var data_file = conf.Attributes.DataFile;
        if ( WRAP.DH.customer ) {
            if ( point_file.indexOf("%user%") >= 0 )
                point_file = point_file.replace(/%user%/g, WRAP.DH.user);
            if ( point_file.indexOf("%customer%") >= 0 )
                point_file = point_file.replace(/%customer%/g, WRAP.DH.customer);
            if ( data_file.indexOf("%user%") >= 0 )
                data_file = data_file.replace(/%user%/g, WRAP.DH.user);
            if ( data_file.indexOf("%customer%") >= 0 )
                data_file = data_file.replace(/%customer%/g, WRAP.DH.customer);
        }
        
        WRAP.DH._getJSON(point_file, conf.Name, function(data) {
            //console.log("loaded:"+point_file);
            base.data.position = data;
            if ( base.data.data )
                cb("completed", ref);
        });

        WRAP.DH._getJSON(data_file, conf.Name, function(data) {
            //console.log("loaded:"+data_file);
            base.data.data = data
            if ( base.data.position )
                cb("completed", ref);
                 
            if ( self.update_interval > 0 ) {
                setTimeout(function() {
                    self.ref.load();
                }, self.update_interval*1000);
            }
        });
    }

    this.reload = function() {
        this.load(self.reference, function() {});
    }
    
    if ( self.update_interval > 0 )
        self.ref.load();
}


WRAP.DH.DataHandler.GeoJSON = function(reference, conf, base) {
    
    var self = this;
    self.data_cache = new WRAP.DH._cache(500);
    
    self.name = conf.Name;
    self.file = conf.Attributes.File;
    self.timelist = conf.Attributes.TimeList;
    
    if ( (self.grid = conf.Attributes.DataGrid) ) {
        self.min_zoom = self.grid.MinZoom;
        self.max_zoom = self.grid.MaxZoom;
        var bb = self.grid.BoundingBox;
        if ( bb ) {
            self.sx = bb.West;
            self.sy = bb.North;
            self.ex = bb.East;
            self.ey = bb.South;
            var width = self.ex-self.sx;
            var height = self.sy-self.ey;
            self.size = (width >= height)?width:height;
        }
    }
    
    self.ref = reference;
    self.update_interval = parseFloat(conf.Attributes.UpdateInterval);
    
    this.load = function(ref, cb) {
        if ( self.timelist ) {
            WRAP.DH._getJSON(self.timelist, "Timelist", function(data) {
                if ( data.timelist ) {
                    base.timelist = data.timelist;
                    cb("completed", ref);
                }
                else if ( data.validtime ) {
                    base.validtime = data.validtime;
                    cb("completed", ref);
                }
                else {
                    WRAP.DH._error(self.name + " Timelist format.");
                    cb("error", null);
                }

                if ( self.update_interval > 0 ) {
                    setTimeout(function() {
                        self.ref.load();
                    }, self.update_interval*1000);
                }
            });
        }
        else if ( self.file ) {
            if ( self.tiled() )
                return;
            
            var file = self.file;
            if ( WRAP.DH.user && file.indexOf("%user%") >= 0 )
                file = file.replace(/%user%/g, WRAP.DH.user);
            if ( WRAP.DH.customer && file.indexOf("%customer%") >= 0 )
                file = file.replace(/%customer%/g, WRAP.DH.customer);

            if ( file.indexOf("%") >= 0 )
                return;

            WRAP.DH._getJSON(file, conf.Name, function(data) {
                //console.log("loaded:"+file);
                base.data = data;
                if ( cb ) {
                    cb("completed", ref);
                }

                if ( self.update_interval > 0 ) {
                    setTimeout(function() {
                        self.ref.load();
                    }, self.update_interval*1000);
                }
            });
        }
    }
    
    this.reload = function() {
        this.load(self.reference, function() {});
    }
    
    function filePath(content, tile) {
       var file = self.file;
        for ( var key in content ) {
            var t = "%"+key+"%";
            if ( file.indexOf(t) >= 0 )
                file = file.replace(t, content[key]);
        }
        if ( tile ) {
            for ( var key in tile ) {
                var t = "%"+key+"%";
                if ( file.indexOf(t) >= 0 )
                    file = file.replace(t, tile[key]);
            }
        }
        return file;
    }
    
    this.tiled = function() {
        return self.max_zoom;
    }
    
    this.getTileList = function(content, context) {

        var tiles = [];
        
        if ( self.size > 0 ) {
            var zoom = Math.round((self.min_zoom+self.max_zoom)/2);
            if ( context.tiles.length ) {
                var z = context.zoom;
                var dpt = 360/Math.pow(2,z);
                zoom = 0;
                var size = self.size;
                while ( size > dpt ) {
                    size /= 2;
                    zoom++;
                }
                //console.log("dpt="+dpt+" size="+size+" zoom="+zoom);
            }
            if ( zoom < self.min_zoom )
                zoom = self.min_zoom;
            else if ( zoom > self.max_zoom )
                zoom = self.max_zoom;
        
            var m = Math.pow(2,zoom);
            var s = self.size/m;
            var mx = Math.floor((self.ex-self.sx)/s);
            if ( mx*s == self.ex-self.sx )
                mx--;
            var my = Math.floor((self.sy-self.ey)/s);
            if ( my*s == self.sy-self.ey )
                my--;
            for ( var i = 0 ; i < context.tiles.length ; i++ ) {
                var tile = context.tiles[i];
                var cood = tile.cood;
                var s_lat = cood[0];
                var s_lon = cood[1];
                var e_lat = cood[256*256*2-2];
                var e_lon = cood[256*256*2-1];
                var siy = Math.floor((self.sy-s_lat)/s);
                var eiy = Math.floor((self.sy-e_lat)/s);
                var six = Math.floor((s_lon-self.sx)/s);
                var eix = Math.floor((e_lon-self.sx)/s);
                for ( var y = siy ; y <= eiy ; y++ ) {
                    if ( 0 <= y && y <= my ) {
                        for ( var x = six ; x <= eix ; x++ ) {
                            if ( 0 <= x && x <= mx ) {
                                var file = filePath(content, {z:zoom, y:y, x:x});
                                if ( tiles.indexOf(file) < 0 )
                                    tiles.push(file);
                            }
                        }
                    }
                }
                if ( s_lon >= 180 || e_lon >= 180) {
                    six = Math.floor(((s_lon-360)-self.sx)/s);
                    eix = Math.floor(((e_lon-360)-self.sx)/s);
                    for ( var y = siy ; y <= eiy ; y++ ) {
                        if ( 0 <= y && y <= my ) {
                            for ( var x = six ; x <= eix ; x++ ) {
                                if ( 0 <= x && x <= mx ) {
                                    var file = filePath(content, {z:zoom, y:y, x:x});
                                    if ( tiles.indexOf(file) < 0 )
                                        tiles.push(file);
                                }
                            }
                        }
                    }
                }
            }
        }
        return tiles;
    }
    
    this.getTiles = function(files) {
        var tiles = [];
        for ( var i = 0 ; i < files.length ; i++ ) {
            var data = this.data_cache.get(files[i]);
            if ( data && data.data )
                tiles.push(data.data);
            else
                return null;
        }
        return tiles;
    }
    
    this.getData = function(content, context) {
        if ( !this.tiled() ) {
            context = null;
            var path = filePath(content);
            
            var data = this.data_cache.get(path);
            if ( data && data.data )
                return [data.data];
        }
        else {
            var tiles = this.getTileList(content, context);
            return this.getTiles(tiles);
        }
        return null;
    }
    
    this.loadData = function(content, context, cb) {
        if ( !this.tiled() ) {
            var path = filePath(content);
            if ( !path || path.indexOf("%") >= 0 )
                return;
            
            var data = this.data_cache.get(path);
            if ( data && data.data )
                return [data.data];
            WRAP.DH._getJSON(path, conf.Name, function(data) {
                self.data_cache.set(path, data);
                 if ( cb )
                    cb();
            });
        }
        else {
            var tiles = this.getTileList(content, context);
            for ( var i = 0 ; i < tiles.length ; i++ ) {
                var path = tiles[i];
                var data = this.data_cache.get(path);
                if ( !data ) {
                    WRAP.DH._getJSON(path, conf.Name,
                        function(data, url) {
                            self.data_cache.set(url, data);
                            if ( cb && self.getTiles(tiles) )
                                cb();
                        },
                        function(url) {
                            self.data_cache.set(url, {});   // empty geojson
                            if ( cb && self.getTiles(tiles) )
                                cb();
                        });
                }
            }
        }
    }
    
    if ( self.update_interval > 0 )
        self.ref.load();
}

WRAP.DH.DataHandler.LiveCamera = function(reference, conf, base) {
    
    var time_range = 3600*10;      // 10hour
    var max_image = 10;
    
    var self = this;
    
    self.initial = true;
    self.ref = reference;
    self.name = conf.Name;
    self.update_interval = parseFloat(conf.Attributes.UpdateInterval);
    self.auto_update = false;
    
    this.load = function(ref, cb) {
        var depth = ref._path.length;
        if ( depth < 3 ) {
            console.log("Load LiveCamera Info (autou pdate="+self.auto_update+")");
            
            if ( !base.data || self.auto_update ) {
                WRAP.DH._get(conf.Attributes.CameraMaster, "LiveCamera Master", function(data) {
                    if ( data ) {
                        if ( !base.data )
                            base.data = {};
                        var master = data.split("\n");
                        var camera_num = 0;
                        for ( var i = 0 ; i < master.length ; i++ ) {
                            var camera = master[i];
                            if ( camera.length ) {
                                camera_num++;
                                if ( !base.data[camera] )
                                    base.data[camera] = {};
                                base.data[camera].active = true;
                            }
                        }
                        var count = 0;
                        for ( var key in base.data ) {
                            if ( !base.data[key].active ) {
                                delete base.data[key];
                            }
                            else {
                                delete base.data[key].active;
                                var info_url = conf.Attributes.CameraServer+"/info/public/camera_master/"+key;
                             
                                if ( WRAP.DH.Test.Camera )
                                    info_url = "./pri/data/LIVE_CAMERA/test/"+key+"/info.json";

                                WRAP.DH._getJSON(info_url, "LiveCamera Info", function(info) {
                                    if ( info ) {
                                        if ( base.data[info.AREA] ) {
                                            var c = base.data[info.AREA];
                                            c.area_name = info.AREA;
                                            c.e_name = info.Shibakoen;
                                            c.l_name = info.LNAME;
                                            c.company = info.COMPNY;
                                            c.jpscsn = info.JPSCSN;
                                            c.lat = parseFloat(info.LATD)*60.0;
                                            c.lon = parseFloat(info.LOND)*60.0;
                                            c.dir = (info.DIR!=-1)?info.DIR*(360/16):undefined;
                                            c.gid = info.GID;
                                            if ( !self.initial || conf.Attributes.InitialLoad ) {
                                                ref.query("data").query(info.AREA).load(
                                                    function(/*r*/) {
                                                        if ( ++count >= camera_num ) {
                                                            self.initial = false;
                                                            cb("completed", ref);
                                                        }
                                                    });
                                            }
                                            else {
                                                if ( ++count >= camera_num ) {
                                                    self.initial = false;
                                                    cb("completed", ref);
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        if ( ++count >= camera_num ) {
                                            self.initial = false;
                                            cb("completed", ref);
                                        }
                                    }
                                });
                            }
                        }
                        
                    }
                    else {
                        WRAP.DH._error("LiveCamera Master not found.");
                        cb("error", null);
                    }
                            
                    if ( self.auto_update && self.update_interval > 0 ) {
                        setTimeout(function() {
                            self.ref.load();
                        }, self.update_interval*1000);
                    }
                });
            }
        }
        else if ( depth >= 3 ){
            var name = ref._path[2];
            
            var now = WRAP.DH._currentTime();
            var from = WRAP.DH._setTime(now,-time_range);
            var time_start = WRAP.DH._timeString(from,"","","");
            var time_end = WRAP.DH._timeString(now,"","","");

            var image_url = conf.Attributes.CameraServer+"/date/public/"+name+"/"+time_start+"/"+time_end+"/";
                         
            if ( WRAP.DH.Test.Camera )
                image_url = "./pri/data/LIVE_CAMERA/test/"+name+"/files.json";
                         
            WRAP.DH._getJSON(image_url, "LiveCamera File List", function(files) {
                if ( files && files.keys ) {
                    if ( base.data[name] ) {
                        files.keys.sort(function(a,b) {
                            if ( a > b ) return -1;
                            if ( a < b ) return 1;
                            return 0;
                        });
                        var t = base.data[name].image;
                        var n = base.data[name].image = [];
                        var image_count = 0;
                        for ( var i = 0 ; i < files.keys.length ; i++ ) {
                            var file = files.keys[i].split(".");
                            var file_time = WRAP.DH._time(file[0]);
                            var time = WRAP.DH._timeString(file_time);
                            var image = null;
                            var requested = false;
                         
                            if ( t ) {
                                for ( var j = 0 ; j < t.length ; j++ ) {
                                    if ( t[j].time == time ) {
                                        requested = true;
                                        image = t[j].image;
                                        break;
                                    }
                                }
                            }
                            if ( (depth>3 || i == 0) || requested ) {
                                var target;
                                n.push(target={time:time, image:image});
                                if ( !requested ) {
                                    var img = new Image();
                                    target.image = img;
                                    img.target = target;
                                    img.onload = function() {
                                    }
                                    img.onerror = function() {
                                        img.onerror = null;
                                        img.src = "img/broken_img.png";
                                    }
                                    var file_time = WRAP.DH._time(time);
                                    var fts = WRAP.DH._timeString(file_time, "", "", "");
                                    var image_url = conf.Attributes.CameraServer+"/img/public/"+name+"/"+fts+".jpeg";
                                          
                                    if ( WRAP.DH.Test.Camera )
                                        image_url = "./pri/data/LIVE_CAMERA/test/"+name+"/"+fts+".jpeg";
                                    //console.log("load Image "+image_url);
                                    img.src = image_url;
                                }
                                else {
                                }
                             }
                             if ( ++image_count >= max_image )
                                break;
                        }
                    }
                }
                cb("completed", ref);
            });
        }
    }
    
    if ( self.update_interval > 0 )
        self.ref.load();
}
