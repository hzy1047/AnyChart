if(!_.mekko){_.mekko=1;(function($){var xJ=function(a,b){a.cP&&$.Dr(a,b)},yJ=function(a,b,c,d,e,g){$.iy.call(this,a,b,c,d,e);this.Tt=g},zJ=function(a,b){$.xx.call(this,!0);this.Vu=this.qu=null;this.Yga=!!a;this.Tt=!!b;this.ja.pointsPadding=0;this.ja.defaultSeriesType="mekko";$.Qo(this.Ha,[["pointsPadding",4294967295,1]])},AJ=function(a,b,c,d,e,g){a.data.length&&(a.data[0].o.missing||(c.push(a.ca.name()),d.push(a.data[0].data.value)),a.data[b].o.missing||(e.push(a.ca.name()),g.push(a.data[b].data.value)))},gea=function(a){if(a.xm.length){var b=
[],c=[],d=[],e=[],g=a.xm[0].data.length-1,h;if("direct"==a.bb().yv())for(h=a.xm.length;h--;)AJ(a.xm[h],g,b,d,c,e);else for(h=0;h<a.xm.length;h++)AJ(a.xm[h],g,b,d,c,e);g=a.YJ();g.Yg();g.ld.apply(g,b);g.dh();xJ(g,d);g=a.pL();g.Yg();g.ld.apply(g,c);g.dh();xJ(g,e)}},BJ=function(a){$.Hx.call(this,a)},CJ=function(a,b,c,d){if(0!=b.get("value")&&c){var e=b.o("x"),g=b.o("zero"),h=b.o("value"),k=d?b.o("pointWidth"):a.j;b.o("pointWidth",k);d=Math.abs($.Pl($.P(a.ca.xa.I("pointsPadding"),k)));k-=2*d;e-=k/2;k=
e+k;b=b.o("stroke")?b.o("stroke"):c.path.stroke();b=$.bc(b);var l=b/2;e=$.Dn(e+l,b);k=$.Dn(k-l,b);h+=a.ua?-l:l;g-=a.ua?-l:l;h=$.Dn(h,b);g=$.Dn(g,b);d&&(b=Math.abs(g-h),d=b>2*d?d:b/2-1,g-=a.ua?-d:d,h+=a.ua?-d:d);d=c.path;$.Fx(d,a.ua,e,h);$.Gx(d,a.ua,k,h,k,g,e,g);d.close();d=c.hatchFill;$.Fx(d,a.ua,e,h);$.Gx(d,a.ua,k,h,k,g,e,g);d.close()}},DJ=function(a){var b=new zJ(!1);b.Jd="mekko";b.ia(!0,$.kl("mekko"));for(var c=0,d=arguments.length;c<d;c++)b.mekko(arguments[c]);return b},EJ=function(a){var b=new zJ(!0);
b.Jd="mosaic";b.ia(!0,$.kl("mosaic"));for(var c=0,d=arguments.length;c<d;c++)b.mekko(arguments[c]);return b},FJ=function(a){var b=new zJ(!1,!0);b.Jd="barmekko";b.ia(!0,$.kl("barmekko"));for(var c=0,d=arguments.length;c<d;c++)b.mekko(arguments[c]);return b};$.I(yJ,$.iy);yJ.prototype.E_=function(a){return!this.Tt&&0>a?0:a};yJ.prototype.sq=function(a,b,c){(this.Tt||0<a.get("value"))&&yJ.F.sq.call(this,a,b,c)};yJ.prototype.Vf=function(a,b,c){(this.Tt||0<a.get("value"))&&yJ.F.Vf.call(this,a,b,c)};$.I(zJ,$.xx);var GJ={};GJ.mekko={xb:29,Eb:2,Fb:[$.gD,$.UC],Cb:null,yb:null,wb:$.jy|5767168,ub:"value",tb:"zero"};zJ.prototype.Mi=GJ;$.Hw(zJ,zJ.prototype.Mi);$.f=zJ.prototype;$.f.ta=$.xx.prototype.ta|268435456;$.f.CM=function(a){zJ.F.CM.call(this,a);$.W(a,64)&&this.B(268435456,1)};
$.f.YJ=function(){if($.n(void 0)){var a=$.rr(this.qu,void 0,"ordinal",$.jr,null,this.KI,this);if(a){var b=this.qu==a;this.qu=a;this.qu.ga(b);if(!b){a=458752;if(this.Lt()&&"categories"==this.Te().xj()||this.Tt)a|=512;this.B(a,268435457)}}return this}this.qu||(this.qu=$.rr(this.qu,{},"ordinal",$.jr,null,this.KI,this),this.qu.ga(!1));return this.qu};
$.f.pL=function(){if($.n(void 0)){var a=$.rr(this.Vu,void 0,"ordinal",$.jr,null,this.KI,this);if(a){var b=this.Vu==a;this.Vu=a;this.Vu.ga(b);b||this.B(458752,268435457)}return this}this.Vu||(this.Vu=$.rr(this.Vu,{},"ordinal",$.jr,null,this.KI,this),this.Vu.ga(!1));return this.Vu};$.f.KI=function(a){$.V(this);if($.W(a,4)){a=458752;if(this.Lt()&&"categories"==this.Te().xj()||this.Tt)a|=512;this.B(a,268435456)}this.ga(!0)};$.f.Oy=function(){return $.jr};
$.f.EB=function(){return["Mekko chart X scale","ordinal"]};$.f.tK=function(){return"linear"};$.f.uF=function(){return 15};$.f.uK=function(){return["Chart scale","ordinal, linear, log, date-time"]};$.f.Lt=function(){return!0};
$.f.Ul=function(a,b){if(this.Tt&&1==this.am()&&$.L(this.Wa(),$.Cr)){this.nb();var c=[],d,e=this.Wa().names(),g=this.Wa().values(),h=this.Vh(0);for(d=0;d<g.length;d++){var k=null;$.G(b)&&(k={value:g[d],name:e[d]},k=b.call(k,k));$.y(k)||(k=String(e[d]));var l=this.ec().lc(d);c.push({text:k,iconType:"square",iconStroke:$.Vk(l,1),iconFill:l,iconHatchFill:h.hatchFill()})}return c}return zJ.F.Ul.call(this,a,b)};
$.f.m1=function(a){if(this.Yga){var b=!this.Wa().Fe(),c="left"==a.orientation()||"bottom"==a.orientation();a.scale(c==b?this.YJ():this.pL())}else a.scale(this.bb())};
$.f.nb=function(){var a=this.O(196608);this.O(458752)&&this.B(268435456);zJ.F.nb.call(this);if(a){var b,c=[],d=[],e=this.xm.length;for(a=0;a<this.xm.length;a++){var g=this.xm[a].data;for(b=0;b<g.length;b++){$.n(d[b])||(d[b]=0);if(g[b].o.missing){d[b]++;var h=0}else h=$.Q(g[b].data.value),h=this.Tt?Math.abs(h):0>h?0:h;void 0==c[b]?c.push(h):c[b]+=h}}for(a=0;a<this.xm.length;a++)for(g=this.xm[a].data,b=h=0;b<g.length;b++)g[b].o.category=d[b]<e?h++:h;c=(0,$.Ye)(c,function(a,b){return d[b]<e});xJ(this.Wa(),
c)}this.O(268435456)&&(gea(this),this.N(268435456))};var HJ={};$.T(HJ,0,"pointsPadding",$.Yo);$.bp(zJ,HJ);$.f=zJ.prototype;$.f.bu=function(a,b){return new yJ(this,this,a,b,!1,this.Tt)};$.f.Sr=function(){return"mekko"};$.f.tJ=function(){return 3};$.f.J=function(){var a=zJ.F.J.call(this);a.type=this.Ta();$.mp(this,HJ,a);return{chart:a}};$.f.fs=function(a,b,c){$.bx(a,"firstCategoriesScale",this.YJ(),b,c);$.bx(a,"lastCategoriesScale",this.pL(),b,c);zJ.F.fs.call(this,a,b,c)};
$.f.GT=function(a,b,c,d){var e=a.J();(a.scale()==this.YJ()&&"left"!=a.orientation()||a.scale()==this.pL()&&"right"!=a.orientation())&&$.bx(e,"scale",a.scale(),b,c);d.push($.oa(a));return e};$.f.$=function(a,b){zJ.F.$.call(this,a,b);$.ep(this,HJ,a)};var IJ=zJ.prototype;IJ.xScale=IJ.Wa;IJ.yScale=IJ.bb;IJ.crosshair=IJ.cg;IJ.xAxis=IJ.gi;IJ.getXAxesCount=IJ.DB;IJ.yAxis=IJ.Gj;IJ.getYAxesCount=IJ.FB;IJ.getSeries=IJ.We;IJ.palette=IJ.ec;IJ.markerPalette=IJ.kf;IJ.hatchFillPalette=IJ.Vd;IJ.getType=IJ.Ta;
IJ.addSeries=IJ.Kk;IJ.getSeriesAt=IJ.Vh;IJ.getSeriesCount=IJ.am;IJ.removeSeries=IJ.Do;IJ.removeSeriesAt=IJ.An;IJ.removeAllSeries=IJ.Mp;IJ.getPlotBounds=IJ.Pf;IJ.annotations=IJ.Jj;IJ.lineMarker=IJ.uo;IJ.rangeMarker=IJ.Co;IJ.textMarker=IJ.Ko;$.I(BJ,$.Hx);$.uC[29]=BJ;$.f=BJ.prototype;$.f.type=29;$.f.flags=263905;$.f.Gg={path:"path",hatchFill:"path"};$.f.Sf=function(a,b){if(!a.o("missing")){var c=this.Sc.Qc(b);CJ(this,a,c)}};$.f.rs=function(a){var b=a.o("shapes"),c;for(c in b)b[c].clear();CJ(this,a,b,!0)};$.f.QC=function(a){if(!a.o("missing")){var b=a.o("shapes"),c;for(c in b)b[c].clear();CJ(this,a,b,!0)}};$.so.mekko=DJ;$.so.mosaic=EJ;$.so.barmekko=FJ;$.H("anychart.mekko",DJ);$.H("anychart.mosaic",EJ);$.H("anychart.barmekko",FJ);}).call(this,$)}