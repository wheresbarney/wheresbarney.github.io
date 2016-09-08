window.STR = window.STR || {},
  function(STR) {
    (function(e, t) {
      typeof module == "object" && typeof module.exports == "object" ? module.exports = e.document ? t(e, !0) : function(e) {
        if (!e.document) throw new Error("jQuery requires a window with a document");
        return t(e)
      } : t(e)
    })(typeof window != "undefined" ? window : this, function(window, noGlobal) {
      function isArraylike(e) {
        var t = e.length,
          n = jQuery.type(e);
        return n === "function" || jQuery.isWindow(e) ? !1 : e.nodeType === 1 && t ? !0 : n === "array" || t === 0 || typeof t == "number" && t > 0 && t - 1 in e
      }

      function winnow(e, t, n) {
        if (jQuery.isFunction(t)) return jQuery.grep(e, function(e, r) {
          return !!t.call(e, r, e) !== n
        });
        if (t.nodeType) return jQuery.grep(e, function(e) {
          return e === t !== n
        });
        if (typeof t == "string") {
          if (risSimple.test(t)) return jQuery.filter(t, e, n);
          t = jQuery.filter(t, e)
        }
        return jQuery.grep(e, function(e) {
          return indexOf.call(t, e) >= 0 !== n
        })
      }

      function sibling(e, t) {
        while ((e = e[t]) && e.nodeType !== 1);
        return e
      }

      function createOptions(e) {
        var t = optionsCache[e] = {};
        return jQuery.each(e.match(rnotwhite) || [], function(e, n) {
          t[n] = !0
        }), t
      }

      function completed() {
        document.removeEventListener("DOMContentLoaded", completed, !1), window.removeEventListener("load", completed, !1), jQuery.ready()
      }

      function Data() {
        Object.defineProperty(this.cache = {}, 0, {
          get: function() {
            return {}
          }
        }), this.expando = jQuery.expando + Math.random()
      }

      function dataAttr(e, t, n) {
        var r;
        if (n === undefined && e.nodeType === 1) {
          r = "data-" + t.replace(rmultiDash, "-$1").toLowerCase(), n = e.getAttribute(r);
          if (typeof n == "string") {
            try {
              n = n === "true" ? !0 : n === "false" ? !1 : n === "null" ? null : +n + "" === n ? +n : rbrace.test(n) ? jQuery.parseJSON(n) : n
            } catch (i) {}
            data_user.set(e, t, n)
          } else n = undefined
        }
        return n
      }

      function returnTrue() {
        return !0
      }

      function returnFalse() {
        return !1
      }

      function safeActiveElement() {
        try {
          return document.activeElement
        } catch (e) {}
      }

      function manipulationTarget(e, t) {
        return jQuery.nodeName(e, "table") && jQuery.nodeName(t.nodeType !== 11 ? t : t.firstChild, "tr") ? e.getElementsByTagName("tbody")[0] || e.appendChild(e.ownerDocument.createElement("tbody")) : e
      }

      function disableScript(e) {
        return e.type = (e.getAttribute("type") !== null) + "/" + e.type, e
      }

      function restoreScript(e) {
        var t = rscriptTypeMasked.exec(e.type);
        return t ? e.type = t[1] : e.removeAttribute("type"), e
      }

      function setGlobalEval(e, t) {
        var n = 0,
          r = e.length;
        for (; n < r; n++) data_priv.set(e[n], "globalEval", !t || data_priv.get(t[n], "globalEval"))
      }

      function cloneCopyEvent(e, t) {
        var n, r, i, s, o, u, a, f;
        if (t.nodeType !== 1) return;
        if (data_priv.hasData(e)) {
          s = data_priv.access(e), o = data_priv.set(t, s), f = s.events;
          if (f) {
            delete o.handle, o.events = {};
            for (i in f)
              for (n = 0, r = f[i].length; n < r; n++) jQuery.event.add(t, i, f[i][n])
          }
        }
        data_user.hasData(e) && (u = data_user.access(e), a = jQuery.extend({}, u), data_user.set(t, a))
      }

      function getAll(e, t) {
        var n = e.getElementsByTagName ? e.getElementsByTagName(t || "*") : e.querySelectorAll ? e.querySelectorAll(t || "*") : [];
        return t === undefined || t && jQuery.nodeName(e, t) ? jQuery.merge([e], n) : n
      }

      function fixInput(e, t) {
        var n = t.nodeName.toLowerCase();
        if (n === "input" && rcheckableType.test(e.type)) t.checked = e.checked;
        else if (n === "input" || n === "textarea") t.defaultValue = e.defaultValue
      }

      function actualDisplay(e, t) {
        var n, r = jQuery(t.createElement(e)).appendTo(t.body),
          i = window.getDefaultComputedStyle && (n = window.getDefaultComputedStyle(r[0])) ? n.display : jQuery.css(r[0], "display");
        return r.detach(), i
      }

      function defaultDisplay(e) {
        var t = document,
          n = elemdisplay[e];
        if (!n) {
          n = actualDisplay(e, t);
          if (n === "none" || !n) iframe = (iframe || jQuery("<iframe frameborder='0' width='0' height='0'/>")).appendTo(t.documentElement), t = iframe[0].contentDocument, t.write(), t.close(), n = actualDisplay(e, t), iframe.detach();
          elemdisplay[e] = n
        }
        return n
      }

      function curCSS(e, t, n) {
        var r, i, s, o, u = e.style;
        return n = n || getStyles(e), n && (o = n.getPropertyValue(t) || n[t]), n && (o === "" && !jQuery.contains(e.ownerDocument, e) && (o = jQuery.style(e, t)), rnumnonpx.test(o) && rmargin.test(t) && (r = u.width, i = u.minWidth, s = u.maxWidth, u.minWidth = u.maxWidth = u.width = o, o = n.width, u.width = r, u.minWidth = i, u.maxWidth = s)), o !== undefined ? o + "" : o
      }

      function addGetHookIf(e, t) {
        return {
          get: function() {
            if (e()) {
              delete this.get;
              return
            }
            return (this.get = t).apply(this, arguments)
          }
        }
      }

      function vendorPropName(e, t) {
        if (t in e) return t;
        var n = t[0].toUpperCase() + t.slice(1),
          r = t,
          i = cssPrefixes.length;
        while (i--) {
          t = cssPrefixes[i] + n;
          if (t in e) return t
        }
        return r
      }

      function setPositiveNumber(e, t, n) {
        var r = rnumsplit.exec(t);
        return r ? Math.max(0, r[1] - (n || 0)) + (r[2] || "px") : t
      }

      function augmentWidthOrHeight(e, t, n, r, i) {
        var s = n === (r ? "border" : "content") ? 4 : t === "width" ? 1 : 0,
          o = 0;
        for (; s < 4; s += 2) n === "margin" && (o += jQuery.css(e, n + cssExpand[s], !0, i)), r ? (n === "content" && (o -= jQuery.css(e, "padding" + cssExpand[s], !0, i)), n !== "margin" && (o -= jQuery.css(e, "border" + cssExpand[s] + "Width", !0, i))) : (o += jQuery.css(e, "padding" + cssExpand[s], !0, i), n !== "padding" && (o += jQuery.css(e, "border" + cssExpand[s] + "Width", !0, i)));
        return o
      }

      function getWidthOrHeight(e, t, n) {
        var r = !0,
          i = t === "width" ? e.offsetWidth : e.offsetHeight,
          s = getStyles(e),
          o = jQuery.css(e, "boxSizing", !1, s) === "border-box";
        if (i <= 0 || i == null) {
          i = curCSS(e, t, s);
          if (i < 0 || i == null) i = e.style[t];
          if (rnumnonpx.test(i)) return i;
          r = o && (support.boxSizingReliable() || i === e.style[t]), i = parseFloat(i) || 0
        }
        return i + augmentWidthOrHeight(e, t, n || (o ? "border" : "content"), r, s) + "px"
      }

      function showHide(e, t) {
        var n, r, i, s = [],
          o = 0,
          u = e.length;
        for (; o < u; o++) {
          r = e[o];
          if (!r.style) continue;
          s[o] = data_priv.get(r, "olddisplay"), n = r.style.display, t ? (!s[o] && n === "none" && (r.style.display = ""), r.style.display === "" && isHidden(r) && (s[o] = data_priv.access(r, "olddisplay", defaultDisplay(r.nodeName)))) : (i = isHidden(r), (n !== "none" || !i) && data_priv.set(r, "olddisplay", i ? n : jQuery.css(r, "display")))
        }
        for (o = 0; o < u; o++) {
          r = e[o];
          if (!r.style) continue;
          if (!t || r.style.display === "none" || r.style.display === "") r.style.display = t ? s[o] || "" : "none"
        }
        return e
      }

      function Tween(e, t, n, r, i) {
        return new Tween.prototype.init(e, t, n, r, i)
      }

      function createFxNow() {
        return setTimeout(function() {
          fxNow = undefined
        }), fxNow = jQuery.now()
      }

      function genFx(e, t) {
        var n, r = 0,
          i = {
            height: e
          };
        t = t ? 1 : 0;
        for (; r < 4; r += 2 - t) n = cssExpand[r], i["margin" + n] = i["padding" + n] = e;
        return t && (i.opacity = i.width = e), i
      }

      function createTween(e, t, n) {
        var r, i = (tweeners[t] || []).concat(tweeners["*"]),
          s = 0,
          o = i.length;
        for (; s < o; s++)
          if (r = i[s].call(n, t, e)) return r
      }

      function defaultPrefilter(e, t, n) {
        var r, i, s, o, u, a, f, l, c = this,
          h = {},
          p = e.style,
          d = e.nodeType && isHidden(e),
          v = data_priv.get(e, "fxshow");
        n.queue || (u = jQuery._queueHooks(e, "fx"), u.unqueued == null && (u.unqueued = 0, a = u.empty.fire, u.empty.fire = function() {
          u.unqueued || a()
        }), u.unqueued++, c.always(function() {
          c.always(function() {
            u.unqueued--, jQuery.queue(e, "fx").length || u.empty.fire()
          })
        })), e.nodeType === 1 && ("height" in t || "width" in t) && (n.overflow = [p.overflow, p.overflowX, p.overflowY], f = jQuery.css(e, "display"), l = f === "none" ? data_priv.get(e, "olddisplay") || defaultDisplay(e.nodeName) : f, l === "inline" && jQuery.css(e, "float") === "none" && (p.display = "inline-block")), n.overflow && (p.overflow = "hidden", c.always(function() {
          p.overflow = n.overflow[0], p.overflowX = n.overflow[1], p.overflowY = n.overflow[2]
        }));
        for (r in t) {
          i = t[r];
          if (rfxtypes.exec(i)) {
            delete t[r], s = s || i === "toggle";
            if (i === (d ? "hide" : "show")) {
              if (i !== "show" || !v || v[r] === undefined) continue;
              d = !0
            }
            h[r] = v && v[r] || jQuery.style(e, r)
          } else f = undefined
        }
        if (!jQuery.isEmptyObject(h)) {
          v ? "hidden" in v && (d = v.hidden) : v = data_priv.access(e, "fxshow", {}), s && (v.hidden = !d), d ? jQuery(e).show() : c.done(function() {
            jQuery(e).hide()
          }), c.done(function() {
            var t;
            data_priv.remove(e, "fxshow");
            for (t in h) jQuery.style(e, t, h[t])
          });
          for (r in h) o = createTween(d ? v[r] : 0, r, c), r in v || (v[r] = o.start, d && (o.end = o.start, o.start = r === "width" || r === "height" ? 1 : 0))
        } else(f === "none" ? defaultDisplay(e.nodeName) : f) === "inline" && (p.display = f)
      }

      function propFilter(e, t) {
        var n, r, i, s, o;
        for (n in e) {
          r = jQuery.camelCase(n), i = t[r], s = e[n], jQuery.isArray(s) && (i = s[1], s = e[n] = s[0]), n !== r && (e[r] = s, delete e[n]), o = jQuery.cssHooks[r];
          if (o && "expand" in o) {
            s = o.expand(s), delete e[r];
            for (n in s) n in e || (e[n] = s[n], t[n] = i)
          } else t[r] = i
        }
      }

      function Animation(e, t, n) {
        var r, i, s = 0,
          o = animationPrefilters.length,
          u = jQuery.Deferred().always(function() {
            delete a.elem
          }),
          a = function() {
            if (i) return !1;
            var t = fxNow || createFxNow(),
              n = Math.max(0, f.startTime + f.duration - t),
              r = n / f.duration || 0,
              s = 1 - r,
              o = 0,
              a = f.tweens.length;
            for (; o < a; o++) f.tweens[o].run(s);
            return u.notifyWith(e, [f, s, n]), s < 1 && a ? n : (u.resolveWith(e, [f]), !1)
          },
          f = u.promise({
            elem: e,
            props: jQuery.extend({}, t),
            opts: jQuery.extend(!0, {
              specialEasing: {}
            }, n),
            originalProperties: t,
            originalOptions: n,
            startTime: fxNow || createFxNow(),
            duration: n.duration,
            tweens: [],
            createTween: function(t, n) {
              var r = jQuery.Tween(e, f.opts, t, n, f.opts.specialEasing[t] || f.opts.easing);
              return f.tweens.push(r), r
            },
            stop: function(t) {
              var n = 0,
                r = t ? f.tweens.length : 0;
              if (i) return this;
              i = !0;
              for (; n < r; n++) f.tweens[n].run(1);
              return t ? u.resolveWith(e, [f, t]) : u.rejectWith(e, [f, t]), this
            }
          }),
          l = f.props;
        propFilter(l, f.opts.specialEasing);
        for (; s < o; s++) {
          r = animationPrefilters[s].call(f, e, l, f.opts);
          if (r) return r
        }
        return jQuery.map(l, createTween, f), jQuery.isFunction(f.opts.start) && f.opts.start.call(e, f), jQuery.fx.timer(jQuery.extend(a, {
          elem: e,
          anim: f,
          queue: f.opts.queue
        })), f.progress(f.opts.progress).done(f.opts.done, f.opts.complete).fail(f.opts.fail).always(f.opts.always)
      }

      function addToPrefiltersOrTransports(e) {
        return function(t, n) {
          typeof t != "string" && (n = t, t = "*");
          var r, i = 0,
            s = t.toLowerCase().match(rnotwhite) || [];
          if (jQuery.isFunction(n))
            while (r = s[i++]) r[0] === "+" ? (r = r.slice(1) || "*", (e[r] = e[r] || []).unshift(n)) : (e[r] = e[r] || []).push(n)
        }
      }

      function inspectPrefiltersOrTransports(e, t, n, r) {
        function o(u) {
          var a;
          return i[u] = !0, jQuery.each(e[u] || [], function(e, u) {
            var f = u(t, n, r);
            if (typeof f == "string" && !s && !i[f]) return t.dataTypes.unshift(f), o(f), !1;
            if (s) return !(a = f)
          }), a
        }
        var i = {},
          s = e === transports;
        return o(t.dataTypes[0]) || !i["*"] && o("*")
      }

      function ajaxExtend(e, t) {
        var n, r, i = jQuery.ajaxSettings.flatOptions || {};
        for (n in t) t[n] !== undefined && ((i[n] ? e : r || (r = {}))[n] = t[n]);
        return r && jQuery.extend(!0, e, r), e
      }

      function ajaxHandleResponses(e, t, n) {
        var r, i, s, o, u = e.contents,
          a = e.dataTypes;
        while (a[0] === "*") a.shift(), r === undefined && (r = e.mimeType || t.getResponseHeader("Content-Type"));
        if (r)
          for (i in u)
            if (u[i] && u[i].test(r)) {
              a.unshift(i);
              break
            }
        if (a[0] in n) s = a[0];
        else {
          for (i in n) {
            if (!a[0] || e.converters[i + " " + a[0]]) {
              s = i;
              break
            }
            o || (o = i)
          }
          s = s || o
        } if (s) return s !== a[0] && a.unshift(s), n[s]
      }

      function ajaxConvert(e, t, n, r) {
        var i, s, o, u, a, f = {},
          l = e.dataTypes.slice();
        if (l[1])
          for (o in e.converters) f[o.toLowerCase()] = e.converters[o];
        s = l.shift();
        while (s) {
          e.responseFields[s] && (n[e.responseFields[s]] = t), !a && r && e.dataFilter && (t = e.dataFilter(t, e.dataType)), a = s, s = l.shift();
          if (s)
            if (s === "*") s = a;
            else if (a !== "*" && a !== s) {
            o = f[a + " " + s] || f["* " + s];
            if (!o)
              for (i in f) {
                u = i.split(" ");
                if (u[1] === s) {
                  o = f[a + " " + u[0]] || f["* " + u[0]];
                  if (o) {
                    o === !0 ? o = f[i] : f[i] !== !0 && (s = u[0], l.unshift(u[1]));
                    break
                  }
                }
              }
            if (o !== !0)
              if (o && e["throws"]) t = o(t);
              else try {
                t = o(t)
              } catch (c) {
                return {
                  state: "parsererror",
                  error: o ? c : "No conversion from " + a + " to " + s
                }
              }
          }
        }
        return {
          state: "success",
          data: t
        }
      }

      function buildParams(e, t, n, r) {
        var i;
        if (jQuery.isArray(t)) jQuery.each(t, function(t, i) {
          n || rbracket.test(e) ? r(e, i) : buildParams(e + "[" + (typeof i == "object" ? t : "") + "]", i, n, r)
        });
        else if (!n && jQuery.type(t) === "object")
          for (i in t) buildParams(e + "[" + i + "]", t[i], n, r);
        else r(e, t)
      }

      function getWindow(e) {
        return jQuery.isWindow(e) ? e : e.nodeType === 9 && e.defaultView
      }
      var arr = [],
        slice = arr.slice,
        concat = arr.concat,
        push = arr.push,
        indexOf = arr.indexOf,
        class2type = {},
        toString = class2type.toString,
        hasOwn = class2type.hasOwnProperty,
        support = {},
        document = window.document,
        version = "2.1.1 -css/hiddenVisibleSelectors,-effects/animatedSelector,-exports/amd",
        jQuery = function(e, t) {
          return new jQuery.fn.init(e, t)
        },
        rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
        rmsPrefix = /^-ms-/,
        rdashAlpha = /-([\da-z])/gi,
        fcamelCase = function(e, t) {
          return t.toUpperCase()
        };
      jQuery.fn = jQuery.prototype = {
        jquery: version,
        constructor: jQuery,
        selector: "",
        length: 0,
        toArray: function() {
          return slice.call(this)
        },
        get: function(e) {
          return e != null ? e < 0 ? this[e + this.length] : this[e] : slice.call(this)
        },
        pushStack: function(e) {
          var t = jQuery.merge(this.constructor(), e);
          return t.prevObject = this, t.context = this.context, t
        },
        each: function(e, t) {
          return jQuery.each(this, e, t)
        },
        map: function(e) {
          return this.pushStack(jQuery.map(this, function(t, n) {
            return e.call(t, n, t)
          }))
        },
        slice: function() {
          return this.pushStack(slice.apply(this, arguments))
        },
        first: function() {
          return this.eq(0)
        },
        last: function() {
          return this.eq(-1)
        },
        eq: function(e) {
          var t = this.length,
            n = +e + (e < 0 ? t : 0);
          return this.pushStack(n >= 0 && n < t ? [this[n]] : [])
        },
        end: function() {
          return this.prevObject || this.constructor(null)
        },
        push: push,
        sort: arr.sort,
        splice: arr.splice
      }, jQuery.extend = jQuery.fn.extend = function() {
        var e, t, n, r, i, s, o = arguments[0] || {},
          u = 1,
          a = arguments.length,
          f = !1;
        typeof o == "boolean" && (f = o, o = arguments[u] || {}, u++), typeof o != "object" && !jQuery.isFunction(o) && (o = {}), u === a && (o = this, u--);
        for (; u < a; u++)
          if ((e = arguments[u]) != null)
            for (t in e) {
              n = o[t], r = e[t];
              if (o === r) continue;
              f && r && (jQuery.isPlainObject(r) || (i = jQuery.isArray(r))) ? (i ? (i = !1, s = n && jQuery.isArray(n) ? n : []) : s = n && jQuery.isPlainObject(n) ? n : {}, o[t] = jQuery.extend(f, s, r)) : r !== undefined && (o[t] = r)
            }
          return o
      }, jQuery.extend({
        expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),
        isReady: !0,
        error: function(e) {
          throw new Error(e)
        },
        noop: function() {},
        isFunction: function(e) {
          return jQuery.type(e) === "function"
        },
        isArray: Array.isArray,
        isWindow: function(e) {
          return e != null && e === e.window
        },
        isNumeric: function(e) {
          return !jQuery.isArray(e) && e - parseFloat(e) >= 0
        },
        isPlainObject: function(e) {
          return jQuery.type(e) !== "object" || e.nodeType || jQuery.isWindow(e) ? !1 : e.constructor && !hasOwn.call(e.constructor.prototype, "isPrototypeOf") ? !1 : !0
        },
        isEmptyObject: function(e) {
          var t;
          for (t in e) return !1;
          return !0
        },
        type: function(e) {
          return e == null ? e + "" : typeof e == "object" || typeof e == "function" ? class2type[toString.call(e)] || "object" : typeof e
        },
        globalEval: function(code) {
          var script, indirect = eval;
          code = jQuery.trim(code), code && (code.indexOf("use strict") === 1 ? (script = document.createElement("script"), script.text = code, document.head.appendChild(script).parentNode.removeChild(script)) : indirect(code))
        },
        camelCase: function(e) {
          return e.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase)
        },
        nodeName: function(e, t) {
          return e.nodeName && e.nodeName.toLowerCase() === t.toLowerCase()
        },
        each: function(e, t, n) {
          var r, i = 0,
            s = e.length,
            o = isArraylike(e);
          if (n)
            if (o)
              for (; i < s; i++) {
                r = t.apply(e[i], n);
                if (r === !1) break
              } else
                for (i in e) {
                  r = t.apply(e[i], n);
                  if (r === !1) break
                } else if (o)
                  for (; i < s; i++) {
                    r = t.call(e[i], i, e[i]);
                    if (r === !1) break
                  } else
                    for (i in e) {
                      r = t.call(e[i], i, e[i]);
                      if (r === !1) break
                    }
                return e
        },
        trim: function(e) {
          return e == null ? "" : (e + "").replace(rtrim, "")
        },
        makeArray: function(e, t) {
          var n = t || [];
          return e != null && (isArraylike(Object(e)) ? jQuery.merge(n, typeof e == "string" ? [e] : e) : push.call(n, e)), n
        },
        inArray: function(e, t, n) {
          return t == null ? -1 : indexOf.call(t, e, n)
        },
        merge: function(e, t) {
          var n = +t.length,
            r = 0,
            i = e.length;
          for (; r < n; r++) e[i++] = t[r];
          return e.length = i, e
        },
        grep: function(e, t, n) {
          var r, i = [],
            s = 0,
            o = e.length,
            u = !n;
          for (; s < o; s++) r = !t(e[s], s), r !== u && i.push(e[s]);
          return i
        },
        map: function(e, t, n) {
          var r, i = 0,
            s = e.length,
            o = isArraylike(e),
            u = [];
          if (o)
            for (; i < s; i++) r = t(e[i], i, n), r != null && u.push(r);
          else
            for (i in e) r = t(e[i], i, n), r != null && u.push(r);
          return concat.apply([], u)
        },
        guid: 1,
        proxy: function(e, t) {
          var n, r, i;
          return typeof t == "string" && (n = e[t], t = e, e = n), jQuery.isFunction(e) ? (r = slice.call(arguments, 2), i = function() {
            return e.apply(t || this, r.concat(slice.call(arguments)))
          }, i.guid = e.guid = e.guid || jQuery.guid++, i) : undefined
        },
        now: Date.now,
        support: support
      }), jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(e, t) {
        class2type["[object " + t + "]"] = t.toLowerCase()
      });
      var docElem = window.document.documentElement,
        selector_hasDuplicate, matches = docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector,
        selector_sortOrder = function(e, t) {
          if (e === t) return selector_hasDuplicate = !0, 0;
          var n = t.compareDocumentPosition && e.compareDocumentPosition && e.compareDocumentPosition(t);
          if (n) return n & 1 ? e === document || jQuery.contains(document, e) ? -1 : t === document || jQuery.contains(document, t) ? 1 : 0 : n & 4 ? -1 : 1;
          return e.compareDocumentPosition ? -1 : 1
        };
      jQuery.extend({
        find: function(e, t, n, r) {
          var i, s, o = 0;
          n = n || [], t = t || document;
          if (!e || typeof e != "string") return n;
          if ((s = t.nodeType) !== 1 && s !== 9) return [];
          if (r)
            while (i = r[o++]) jQuery.find.matchesSelector(i, e) && n.push(i);
          else jQuery.merge(n, t.querySelectorAll(e));
          return n
        },
        unique: function(e) {
          var t, n = [],
            r = 0,
            i = 0;
          selector_hasDuplicate = !1, e.sort(selector_sortOrder);
          if (selector_hasDuplicate) {
            while (t = e[r++]) t === e[r] && (i = n.push(r));
            while (i--) e.splice(n[i], 1)
          }
          return e
        },
        text: function(e) {
          var t, n = "",
            r = 0,
            i = e.nodeType;
          if (!i)
            while (t = e[r++]) n += jQuery.text(t);
          else {
            if (i === 1 || i === 9 || i === 11) return e.textContent;
            if (i === 3 || i === 4) return e.nodeValue
          }
          return n
        },
        contains: function(e, t) {
          var n = e.nodeType === 9 ? e.documentElement : e,
            r = t && t.parentNode;
          return e === r || !!r && r.nodeType === 1 && !!n.contains(r)
        },
        isXMLDoc: function(e) {
          return (e.ownerDocument || e).documentElement.nodeName !== "HTML"
        },
        expr: {
          attrHandle: {},
          match: {
            bool: /^(?:checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped)$/i,
            needsContext: /^[\x20\t\r\n\f]*[>+~]/
          }
        }
      }), jQuery.extend(jQuery.find, {
        matches: function(e, t) {
          return jQuery.find(e, null, null, t)
        },
        matchesSelector: function(e, t) {
          return matches.call(e, t)
        },
        attr: function(e, t) {
          return e.getAttribute(t)
        }
      });
      var rneedsContext = jQuery.expr.match.needsContext,
        rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        risSimple = /^.[^:#\[\.,]*$/;
      jQuery.filter = function(e, t, n) {
        var r = t[0];
        return n && (e = ":not(" + e + ")"), t.length === 1 && r.nodeType === 1 ? jQuery.find.matchesSelector(r, e) ? [r] : [] : jQuery.find.matches(e, jQuery.grep(t, function(e) {
          return e.nodeType === 1
        }))
      }, jQuery.fn.extend({
        find: function(e) {
          var t, n = this.length,
            r = [],
            i = this;
          if (typeof e != "string") return this.pushStack(jQuery(e).filter(function() {
            for (t = 0; t < n; t++)
              if (jQuery.contains(i[t], this)) return !0
          }));
          for (t = 0; t < n; t++) jQuery.find(e, i[t], r);
          return r = this.pushStack(n > 1 ? jQuery.unique(r) : r), r.selector = this.selector ? this.selector + " " + e : e, r
        },
        filter: function(e) {
          return this.pushStack(winnow(this, e || [], !1))
        },
        not: function(e) {
          return this.pushStack(winnow(this, e || [], !0))
        },
        is: function(e) {
          return !!winnow(this, typeof e == "string" && rneedsContext.test(e) ? jQuery(e) : e || [], !1).length
        }
      });
      var rootjQuery, rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
        init = jQuery.fn.init = function(e, t) {
          var n, r;
          if (!e) return this;
          if (typeof e == "string") {
            e[0] === "<" && e[e.length - 1] === ">" && e.length >= 3 ? n = [null, e, null] : n = rquickExpr.exec(e);
            if (n && (n[1] || !t)) {
              if (n[1]) {
                t = t instanceof jQuery ? t[0] : t, jQuery.merge(this, jQuery.parseHTML(n[1], t && t.nodeType ? t.ownerDocument || t : document, !0));
                if (rsingleTag.test(n[1]) && jQuery.isPlainObject(t))
                  for (n in t) jQuery.isFunction(this[n]) ? this[n](t[n]) : this.attr(n, t[n]);
                return this
              }
              return r = document.getElementById(n[2]), r && r.parentNode && (this.length = 1, this[0] = r), this.context = document, this.selector = e, this
            }
            return !t || t.jquery ? (t || rootjQuery).find(e) : this.constructor(t).find(e)
          }
          return e.nodeType ? (this.context = this[0] = e, this.length = 1, this) : jQuery.isFunction(e) ? typeof rootjQuery.ready != "undefined" ? rootjQuery.ready(e) : e(jQuery) : (e.selector !== undefined && (this.selector = e.selector, this.context = e.context), jQuery.makeArray(e, this))
        };
      init.prototype = jQuery.fn, rootjQuery = jQuery(document);
      var rparentsprev = /^(?:parents|prev(?:Until|All))/,
        guaranteedUnique = {
          children: !0,
          contents: !0,
          next: !0,
          prev: !0
        };
      jQuery.extend({
        dir: function(e, t, n) {
          var r = [],
            i = n !== undefined;
          while ((e = e[t]) && e.nodeType !== 9)
            if (e.nodeType === 1) {
              if (i && jQuery(e).is(n)) break;
              r.push(e)
            }
          return r
        },
        sibling: function(e, t) {
          var n = [];
          for (; e; e = e.nextSibling) e.nodeType === 1 && e !== t && n.push(e);
          return n
        }
      }), jQuery.fn.extend({
        has: function(e) {
          var t = jQuery(e, this),
            n = t.length;
          return this.filter(function() {
            var e = 0;
            for (; e < n; e++)
              if (jQuery.contains(this, t[e])) return !0
          })
        },
        closest: function(e, t) {
          var n, r = 0,
            i = this.length,
            s = [],
            o = rneedsContext.test(e) || typeof e != "string" ? jQuery(e, t || this.context) : 0;
          for (; r < i; r++)
            for (n = this[r]; n && n !== t; n = n.parentNode)
              if (n.nodeType < 11 && (o ? o.index(n) > -1 : n.nodeType === 1 && jQuery.find.matchesSelector(n, e))) {
                s.push(n);
                break
              }
          return this.pushStack(s.length > 1 ? jQuery.unique(s) : s)
        },
        index: function(e) {
          return e ? typeof e == "string" ? indexOf.call(jQuery(e), this[0]) : indexOf.call(this, e.jquery ? e[0] : e) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1
        },
        add: function(e, t) {
          return this.pushStack(jQuery.unique(jQuery.merge(this.get(), jQuery(e, t))))
        },
        addBack: function(e) {
          return this.add(e == null ? this.prevObject : this.prevObject.filter(e))
        }
      }), jQuery.each({
        parent: function(e) {
          var t = e.parentNode;
          return t && t.nodeType !== 11 ? t : null
        },
        parents: function(e) {
          return jQuery.dir(e, "parentNode")
        },
        parentsUntil: function(e, t, n) {
          return jQuery.dir(e, "parentNode", n)
        },
        next: function(e) {
          return sibling(e, "nextSibling")
        },
        prev: function(e) {
          return sibling(e, "previousSibling")
        },
        nextAll: function(e) {
          return jQuery.dir(e, "nextSibling")
        },
        prevAll: function(e) {
          return jQuery.dir(e, "previousSibling")
        },
        nextUntil: function(e, t, n) {
          return jQuery.dir(e, "nextSibling", n)
        },
        prevUntil: function(e, t, n) {
          return jQuery.dir(e, "previousSibling", n)
        },
        siblings: function(e) {
          return jQuery.sibling((e.parentNode || {}).firstChild, e)
        },
        children: function(e) {
          return jQuery.sibling(e.firstChild)
        },
        contents: function(e) {
          return e.contentDocument || jQuery.merge([], e.childNodes)
        }
      }, function(e, t) {
        jQuery.fn[e] = function(n, r) {
          var i = jQuery.map(this, t, n);
          return e.slice(-5) !== "Until" && (r = n), r && typeof r == "string" && (i = jQuery.filter(r, i)), this.length > 1 && (guaranteedUnique[e] || jQuery.unique(i), rparentsprev.test(e) && i.reverse()), this.pushStack(i)
        }
      });
      var rnotwhite = /\S+/g,
        optionsCache = {};
      jQuery.Callbacks = function(e) {
        e = typeof e == "string" ? optionsCache[e] || createOptions(e) : jQuery.extend({}, e);
        var t, n, r, i, s, o, u = [],
          a = !e.once && [],
          f = function(c) {
            t = e.memory && c, n = !0, o = i || 0, i = 0, s = u.length, r = !0;
            for (; u && o < s; o++)
              if (u[o].apply(c[0], c[1]) === !1 && e.stopOnFalse) {
                t = !1;
                break
              }
            r = !1, u && (a ? a.length && f(a.shift()) : t ? u = [] : l.disable())
          },
          l = {
            add: function() {
              if (u) {
                var n = u.length;
                (function o(t) {
                  jQuery.each(t, function(t, n) {
                    var r = jQuery.type(n);
                    r === "function" ? (!e.unique || !l.has(n)) && u.push(n) : n && n.length && r !== "string" && o(n)
                  })
                })(arguments), r ? s = u.length : t && (i = n, f(t))
              }
              return this
            },
            remove: function() {
              return u && jQuery.each(arguments, function(e, t) {
                var n;
                while ((n = jQuery.inArray(t, u, n)) > -1) u.splice(n, 1), r && (n <= s && s--, n <= o && o--)
              }), this
            },
            has: function(e) {
              return e ? jQuery.inArray(e, u) > -1 : !!u && !!u.length
            },
            empty: function() {
              return u = [], s = 0, this
            },
            disable: function() {
              return u = a = t = undefined, this
            },
            disabled: function() {
              return !u
            },
            lock: function() {
              return a = undefined, t || l.disable(), this
            },
            locked: function() {
              return !a
            },
            fireWith: function(e, t) {
              return u && (!n || a) && (t = t || [], t = [e, t.slice ? t.slice() : t], r ? a.push(t) : f(t)), this
            },
            fire: function() {
              return l.fireWith(this, arguments), this
            },
            fired: function() {
              return !!n
            }
          };
        return l
      }, jQuery.extend({
        Deferred: function(e) {
          var t = [
              ["resolve", "done", jQuery.Callbacks("once memory"), "resolved"],
              ["reject", "fail", jQuery.Callbacks("once memory"), "rejected"],
              ["notify", "progress", jQuery.Callbacks("memory")]
            ],
            n = "pending",
            r = {
              state: function() {
                return n
              },
              always: function() {
                return i.done(arguments).fail(arguments), this
              },
              then: function() {
                var e = arguments;
                return jQuery.Deferred(function(n) {
                  jQuery.each(t, function(t, s) {
                    var o = jQuery.isFunction(e[t]) && e[t];
                    i[s[1]](function() {
                      var e = o && o.apply(this, arguments);
                      e && jQuery.isFunction(e.promise) ? e.promise().done(n.resolve).fail(n.reject).progress(n.notify) : n[s[0] + "With"](this === r ? n.promise() : this, o ? [e] : arguments)
                    })
                  }), e = null
                }).promise()
              },
              promise: function(e) {
                return e != null ? jQuery.extend(e, r) : r
              }
            },
            i = {};
          return r.pipe = r.then, jQuery.each(t, function(e, s) {
            var o = s[2],
              u = s[3];
            r[s[1]] = o.add, u && o.add(function() {
              n = u
            }, t[e ^ 1][2].disable, t[2][2].lock), i[s[0]] = function() {
              return i[s[0] + "With"](this === i ? r : this, arguments), this
            }, i[s[0] + "With"] = o.fireWith
          }), r.promise(i), e && e.call(i, i), i
        },
        when: function(e) {
          var t = 0,
            n = slice.call(arguments),
            r = n.length,
            i = r !== 1 || e && jQuery.isFunction(e.promise) ? r : 0,
            s = i === 1 ? e : jQuery.Deferred(),
            o = function(e, t, n) {
              return function(r) {
                t[e] = this, n[e] = arguments.length > 1 ? slice.call(arguments) : r, n === u ? s.notifyWith(t, n) : --i || s.resolveWith(t, n)
              }
            },
            u, a, f;
          if (r > 1) {
            u = new Array(r), a = new Array(r), f = new Array(r);
            for (; t < r; t++) n[t] && jQuery.isFunction(n[t].promise) ? n[t].promise().done(o(t, f, n)).fail(s.reject).progress(o(t, a, u)) : --i
          }
          return i || s.resolveWith(f, n), s.promise()
        }
      });
      var readyList;
      jQuery.fn.ready = function(e) {
        return jQuery.ready.promise().done(e), this
      }, jQuery.extend({
        isReady: !1,
        readyWait: 1,
        holdReady: function(e) {
          e ? jQuery.readyWait++ : jQuery.ready(!0)
        },
        ready: function(e) {
          if (e === !0 ? --jQuery.readyWait : jQuery.isReady) return;
          jQuery.isReady = !0;
          if (e !== !0 && --jQuery.readyWait > 0) return;
          readyList.resolveWith(document, [jQuery]), jQuery.fn.triggerHandler && (jQuery(document).triggerHandler("ready"), jQuery(document).off("ready"))
        }
      }), jQuery.ready.promise = function(e) {
        return readyList || (readyList = jQuery.Deferred(), document.readyState === "complete" ? setTimeout(jQuery.ready) : (document.addEventListener("DOMContentLoaded", completed, !1), window.addEventListener("load", completed, !1))), readyList.promise(e)
      }, jQuery.ready.promise();
      var access = jQuery.access = function(e, t, n, r, i, s, o) {
        var u = 0,
          a = e.length,
          f = n == null;
        if (jQuery.type(n) === "object") {
          i = !0;
          for (u in n) jQuery.access(e, t, u, n[u], !0, s, o)
        } else if (r !== undefined) {
          i = !0, jQuery.isFunction(r) || (o = !0), f && (o ? (t.call(e, r), t = null) : (f = t, t = function(e, t, n) {
            return f.call(jQuery(e), n)
          }));
          if (t)
            for (; u < a; u++) t(e[u], n, o ? r : r.call(e[u], u, t(e[u], n)))
        }
        return i ? e : f ? t.call(e) : a ? t(e[0], n) : s
      };
      jQuery.acceptData = function(e) {
        return e.nodeType === 1 || e.nodeType === 9 || !+e.nodeType
      }, Data.uid = 1, Data.accepts = jQuery.acceptData, Data.prototype = {
        key: function(e) {
          if (!Data.accepts(e)) return 0;
          var t = {},
            n = e[this.expando];
          if (!n) {
            n = Data.uid++;
            try {
              t[this.expando] = {
                value: n
              }, Object.defineProperties(e, t)
            } catch (r) {
              t[this.expando] = n, jQuery.extend(e, t)
            }
          }
          return this.cache[n] || (this.cache[n] = {}), n
        },
        set: function(e, t, n) {
          var r, i = this.key(e),
            s = this.cache[i];
          if (typeof t == "string") s[t] = n;
          else if (jQuery.isEmptyObject(s)) jQuery.extend(this.cache[i], t);
          else
            for (r in t) s[r] = t[r];
          return s
        },
        get: function(e, t) {
          var n = this.cache[this.key(e)];
          return t === undefined ? n : n[t]
        },
        access: function(e, t, n) {
          var r;
          return t === undefined || t && typeof t == "string" && n === undefined ? (r = this.get(e, t), r !== undefined ? r : this.get(e, jQuery.camelCase(t))) : (this.set(e, t, n), n !== undefined ? n : t)
        },
        remove: function(e, t) {
          var n, r, i, s = this.key(e),
            o = this.cache[s];
          if (t === undefined) this.cache[s] = {};
          else {
            jQuery.isArray(t) ? r = t.concat(t.map(jQuery.camelCase)) : (i = jQuery.camelCase(t), t in o ? r = [t, i] : (r = i, r = r in o ? [r] : r.match(rnotwhite) || [])), n = r.length;
            while (n--) delete o[r[n]]
          }
        },
        hasData: function(e) {
          return !jQuery.isEmptyObject(this.cache[e[this.expando]] || {})
        },
        discard: function(e) {
          e[this.expando] && delete this.cache[e[this.expando]]
        }
      };
      var data_priv = new Data,
        data_user = new Data,
        rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
        rmultiDash = /([A-Z])/g;
      jQuery.extend({
        hasData: function(e) {
          return data_user.hasData(e) || data_priv.hasData(e)
        },
        data: function(e, t, n) {
          return data_user.access(e, t, n)
        },
        removeData: function(e, t) {
          data_user.remove(e, t)
        },
        _data: function(e, t, n) {
          return data_priv.access(e, t, n)
        },
        _removeData: function(e, t) {
          data_priv.remove(e, t)
        }
      }), jQuery.fn.extend({
        data: function(e, t) {
          var n, r, i, s = this[0],
            o = s && s.attributes;
          if (e === undefined) {
            if (this.length) {
              i = data_user.get(s);
              if (s.nodeType === 1 && !data_priv.get(s, "hasDataAttrs")) {
                n = o.length;
                while (n--) o[n] && (r = o[n].name, r.indexOf("data-") === 0 && (r = jQuery.camelCase(r.slice(5)), dataAttr(s, r, i[r])));
                data_priv.set(s, "hasDataAttrs", !0)
              }
            }
            return i
          }
          return typeof e == "object" ? this.each(function() {
            data_user.set(this, e)
          }) : access(this, function(t) {
            var n, r = jQuery.camelCase(e);
            if (s && t === undefined) {
              n = data_user.get(s, e);
              if (n !== undefined) return n;
              n = data_user.get(s, r);
              if (n !== undefined) return n;
              n = dataAttr(s, r, undefined);
              if (n !== undefined) return n;
              return
            }
            this.each(function() {
              var n = data_user.get(this, r);
              data_user.set(this, r, t), e.indexOf("-") !== -1 && n !== undefined && data_user.set(this, e, t)
            })
          }, null, t, arguments.length > 1, null, !0)
        },
        removeData: function(e) {
          return this.each(function() {
            data_user.remove(this, e)
          })
        }
      }), jQuery.extend({
        queue: function(e, t, n) {
          var r;
          if (e) return t = (t || "fx") + "queue", r = data_priv.get(e, t), n && (!r || jQuery.isArray(n) ? r = data_priv.access(e, t, jQuery.makeArray(n)) : r.push(n)), r || []
        },
        dequeue: function(e, t) {
          t = t || "fx";
          var n = jQuery.queue(e, t),
            r = n.length,
            i = n.shift(),
            s = jQuery._queueHooks(e, t),
            o = function() {
              jQuery.dequeue(e, t)
            };
          i === "inprogress" && (i = n.shift(), r--), i && (t === "fx" && n.unshift("inprogress"), delete s.stop, i.call(e, o, s)), !r && s && s.empty.fire()
        },
        _queueHooks: function(e, t) {
          var n = t + "queueHooks";
          return data_priv.get(e, n) || data_priv.access(e, n, {
            empty: jQuery.Callbacks("once memory").add(function() {
              data_priv.remove(e, [t + "queue", n])
            })
          })
        }
      }), jQuery.fn.extend({
        queue: function(e, t) {
          var n = 2;
          return typeof e != "string" && (t = e, e = "fx", n--), arguments.length < n ? jQuery.queue(this[0], e) : t === undefined ? this : this.each(function() {
            var n = jQuery.queue(this, e, t);
            jQuery._queueHooks(this, e), e === "fx" && n[0] !== "inprogress" && jQuery.dequeue(this, e)
          })
        },
        dequeue: function(e) {
          return this.each(function() {
            jQuery.dequeue(this, e)
          })
        },
        clearQueue: function(e) {
          return this.queue(e || "fx", [])
        },
        promise: function(e, t) {
          var n, r = 1,
            i = jQuery.Deferred(),
            s = this,
            o = this.length,
            u = function() {
              --r || i.resolveWith(s, [s])
            };
          typeof e != "string" && (t = e, e = undefined), e = e || "fx";
          while (o--) n = data_priv.get(s[o], e + "queueHooks"), n && n.empty && (r++, n.empty.add(u));
          return u(), i.promise(t)
        }
      });
      var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
        cssExpand = ["Top", "Right", "Bottom", "Left"],
        isHidden = function(e, t) {
          return e = t || e, jQuery.css(e, "display") === "none" || !jQuery.contains(e.ownerDocument, e)
        },
        rcheckableType = /^(?:checkbox|radio)$/i;
      (function() {
        var e = document.createDocumentFragment(),
          t = e.appendChild(document.createElement("div")),
          n = document.createElement("input");
        n.setAttribute("type", "radio"), n.setAttribute("checked", "checked"), n.setAttribute("name", "t"), t.appendChild(n), support.checkClone = t.cloneNode(!0).cloneNode(!0).lastChild.checked, t.innerHTML = "<textarea>x</textarea>", support.noCloneChecked = !!t.cloneNode(!0).lastChild.defaultValue
      })();
      var strundefined = typeof undefined;
      support.focusinBubbles = "onfocusin" in window;
      var rkeyEvent = /^key/,
        rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
        rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
        rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;
      jQuery.event = {
        global: {},
        add: function(e, t, n, r, i) {
          var s, o, u, a, f, l, c, h, p, d, v, m = data_priv.get(e);
          if (!m) return;
          n.handler && (s = n, n = s.handler, i = s.selector), n.guid || (n.guid = jQuery.guid++), (a = m.events) || (a = m.events = {}), (o = m.handle) || (o = m.handle = function(t) {
            return typeof jQuery !== strundefined && jQuery.event.triggered !== t.type ? jQuery.event.dispatch.apply(e, arguments) : undefined
          }), t = (t || "").match(rnotwhite) || [""], f = t.length;
          while (f--) {
            u = rtypenamespace.exec(t[f]) || [], p = v = u[1], d = (u[2] || "").split(".").sort();
            if (!p) continue;
            c = jQuery.event.special[p] || {}, p = (i ? c.delegateType : c.bindType) || p, c = jQuery.event.special[p] || {}, l = jQuery.extend({
              type: p,
              origType: v,
              data: r,
              handler: n,
              guid: n.guid,
              selector: i,
              needsContext: i && jQuery.expr.match.needsContext.test(i),
              namespace: d.join(".")
            }, s), (h = a[p]) || (h = a[p] = [], h.delegateCount = 0, (!c.setup || c.setup.call(e, r, d, o) === !1) && e.addEventListener && e.addEventListener(p, o, !1)), c.add && (c.add.call(e, l), l.handler.guid || (l.handler.guid = n.guid)), i ? h.splice(h.delegateCount++, 0, l) : h.push(l), jQuery.event.global[p] = !0
          }
        },
        remove: function(e, t, n, r, i) {
          var s, o, u, a, f, l, c, h, p, d, v, m = data_priv.hasData(e) && data_priv.get(e);
          if (!m || !(a = m.events)) return;
          t = (t || "").match(rnotwhite) || [""], f = t.length;
          while (f--) {
            u = rtypenamespace.exec(t[f]) || [], p = v = u[1], d = (u[2] || "").split(".").sort();
            if (!p) {
              for (p in a) jQuery.event.remove(e, p + t[f], n, r, !0);
              continue
            }
            c = jQuery.event.special[p] || {}, p = (r ? c.delegateType : c.bindType) || p, h = a[p] || [], u = u[2] && new RegExp("(^|\\.)" + d.join("\\.(?:.*\\.|)") + "(\\.|$)"), o = s = h.length;
            while (s--) l = h[s], (i || v === l.origType) && (!n || n.guid === l.guid) && (!u || u.test(l.namespace)) && (!r || r === l.selector || r === "**" && l.selector) && (h.splice(s, 1), l.selector && h.delegateCount--, c.remove && c.remove.call(e, l));
            o && !h.length && ((!c.teardown || c.teardown.call(e, d, m.handle) === !1) && jQuery.removeEvent(e, p, m.handle), delete a[p])
          }
          jQuery.isEmptyObject(a) && (delete m.handle, data_priv.remove(e, "events"))
        },
        trigger: function(e, t, n, r) {
          var i, s, o, u, a, f, l, c = [n || document],
            h = hasOwn.call(e, "type") ? e.type : e,
            p = hasOwn.call(e, "namespace") ? e.namespace.split(".") : [];
          s = o = n = n || document;
          if (n.nodeType === 3 || n.nodeType === 8) return;
          if (rfocusMorph.test(h + jQuery.event.triggered)) return;
          h.indexOf(".") >= 0 && (p = h.split("."), h = p.shift(), p.sort()), a = h.indexOf(":") < 0 && "on" + h, e = e[jQuery.expando] ? e : new jQuery.Event(h, typeof e == "object" && e), e.isTrigger = r ? 2 : 3, e.namespace = p.join("."), e.namespace_re = e.namespace ? new RegExp("(^|\\.)" + p.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, e.result = undefined, e.target || (e.target = n), t = t == null ? [e] : jQuery.makeArray(t, [e]), l = jQuery.event.special[h] || {};
          if (!r && l.trigger && l.trigger.apply(n, t) === !1) return;
          if (!r && !l.noBubble && !jQuery.isWindow(n)) {
            u = l.delegateType || h, rfocusMorph.test(u + h) || (s = s.parentNode);
            for (; s; s = s.parentNode) c.push(s), o = s;
            o === (n.ownerDocument || document) && c.push(o.defaultView || o.parentWindow || window)
          }
          i = 0;
          while ((s = c[i++]) && !e.isPropagationStopped()) e.type = i > 1 ? u : l.bindType || h, f = (data_priv.get(s, "events") || {})[e.type] && data_priv.get(s, "handle"), f && f.apply(s, t), f = a && s[a], f && f.apply && jQuery.acceptData(s) && (e.result = f.apply(s, t), e.result === !1 && e.preventDefault());
          return e.type = h, !r && !e.isDefaultPrevented() && (!l._default || l._default.apply(c.pop(), t) === !1) && jQuery.acceptData(n) && a && jQuery.isFunction(n[h]) && !jQuery.isWindow(n) && (o = n[a], o && (n[a] = null), jQuery.event.triggered = h, n[h](), jQuery.event.triggered = undefined, o && (n[a] = o)), e.result
        },
        dispatch: function(e) {
          e = jQuery.event.fix(e);
          var t, n, r, i, s, o = [],
            u = slice.call(arguments),
            a = (data_priv.get(this, "events") || {})[e.type] || [],
            f = jQuery.event.special[e.type] || {};
          u[0] = e, e.delegateTarget = this;
          if (f.preDispatch && f.preDispatch.call(this, e) === !1) return;
          o = jQuery.event.handlers.call(this, e, a), t = 0;
          while ((i = o[t++]) && !e.isPropagationStopped()) {
            e.currentTarget = i.elem, n = 0;
            while ((s = i.handlers[n++]) && !e.isImmediatePropagationStopped())
              if (!e.namespace_re || e.namespace_re.test(s.namespace)) e.handleObj = s, e.data = s.data, r = ((jQuery.event.special[s.origType] || {}).handle || s.handler).apply(i.elem, u), r !== undefined && (e.result = r) === !1 && (e.preventDefault(), e.stopPropagation())
          }
          return f.postDispatch && f.postDispatch.call(this, e), e.result
        },
        handlers: function(e, t) {
          var n, r, i, s, o = [],
            u = t.delegateCount,
            a = e.target;
          if (u && a.nodeType && (!e.button || e.type !== "click"))
            for (; a !== this; a = a.parentNode || this)
              if (a.disabled !== !0 || e.type !== "click") {
                r = [];
                for (n = 0; n < u; n++) s = t[n], i = s.selector + " ", r[i] === undefined && (r[i] = s.needsContext ? jQuery(i, this).index(a) >= 0 : jQuery.find(i, this, null, [a]).length), r[i] && r.push(s);
                r.length && o.push({
                  elem: a,
                  handlers: r
                })
              }
          return u < t.length && o.push({
            elem: this,
            handlers: t.slice(u)
          }), o
        },
        props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        fixHooks: {},
        keyHooks: {
          props: "char charCode key keyCode".split(" "),
          filter: function(e, t) {
            return e.which == null && (e.which = t.charCode != null ? t.charCode : t.keyCode), e
          }
        },
        mouseHooks: {
          props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
          filter: function(e, t) {
            var n, r, i, s = t.button;
            return e.pageX == null && t.clientX != null && (n = e.target.ownerDocument || document, r = n.documentElement, i = n.body, e.pageX = t.clientX + (r && r.scrollLeft || i && i.scrollLeft || 0) - (r && r.clientLeft || i && i.clientLeft || 0), e.pageY = t.clientY + (r && r.scrollTop || i && i.scrollTop || 0) - (r && r.clientTop || i && i.clientTop || 0)), !e.which && s !== undefined && (e.which = s & 1 ? 1 : s & 2 ? 3 : s & 4 ? 2 : 0), e
          }
        },
        fix: function(e) {
          if (e[jQuery.expando]) return e;
          var t, n, r, i = e.type,
            s = e,
            o = this.fixHooks[i];
          o || (this.fixHooks[i] = o = rmouseEvent.test(i) ? this.mouseHooks : rkeyEvent.test(i) ? this.keyHooks : {}), r = o.props ? this.props.concat(o.props) : this.props, e = new jQuery.Event(s), t = r.length;
          while (t--) n = r[t], e[n] = s[n];
          return e.target || (e.target = document), e.target.nodeType === 3 && (e.target = e.target.parentNode), o.filter ? o.filter(e, s) : e
        },
        special: {
          load: {
            noBubble: !0
          },
          focus: {
            trigger: function() {
              if (this !== safeActiveElement() && this.focus) return this.focus(), !1
            },
            delegateType: "focusin"
          },
          blur: {
            trigger: function() {
              if (this === safeActiveElement() && this.blur) return this.blur(), !1
            },
            delegateType: "focusout"
          },
          click: {
            trigger: function() {
              if (this.type === "checkbox" && this.click && jQuery.nodeName(this, "input")) return this.click(), !1
            },
            _default: function(e) {
              return jQuery.nodeName(e.target, "a")
            }
          },
          beforeunload: {
            postDispatch: function(e) {
              e.result !== undefined && e.originalEvent && (e.originalEvent.returnValue = e.result)
            }
          }
        },
        simulate: function(e, t, n, r) {
          var i = jQuery.extend(new jQuery.Event, n, {
            type: e,
            isSimulated: !0,
            originalEvent: {}
          });
          r ? jQuery.event.trigger(i, null, t) : jQuery.event.dispatch.call(t, i), i.isDefaultPrevented() && n.preventDefault()
        }
      }, jQuery.removeEvent = function(e, t, n) {
        e.removeEventListener && e.removeEventListener(t, n, !1)
      }, jQuery.Event = function(e, t) {
        if (!(this instanceof jQuery.Event)) return new jQuery.Event(e, t);
        e && e.type ? (this.originalEvent = e, this.type = e.type, this.isDefaultPrevented = e.defaultPrevented || e.defaultPrevented === undefined && e.returnValue === !1 ? returnTrue : returnFalse) : this.type = e, t && jQuery.extend(this, t), this.timeStamp = e && e.timeStamp || jQuery.now(), this[jQuery.expando] = !0
      }, jQuery.Event.prototype = {
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse,
        preventDefault: function() {
          var e = this.originalEvent;
          this.isDefaultPrevented = returnTrue, e && e.preventDefault && e.preventDefault()
        },
        stopPropagation: function() {
          var e = this.originalEvent;
          this.isPropagationStopped = returnTrue, e && e.stopPropagation && e.stopPropagation()
        },
        stopImmediatePropagation: function() {
          var e = this.originalEvent;
          this.isImmediatePropagationStopped = returnTrue, e && e.stopImmediatePropagation && e.stopImmediatePropagation(), this.stopPropagation()
        }
      }, jQuery.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout",
        pointerenter: "pointerover",
        pointerleave: "pointerout"
      }, function(e, t) {
        jQuery.event.special[e] = {
          delegateType: t,
          bindType: t,
          handle: function(e) {
            var n, r = this,
              i = e.relatedTarget,
              s = e.handleObj;
            if (!i || i !== r && !jQuery.contains(r, i)) e.type = s.origType, n = s.handler.apply(this, arguments), e.type = t;
            return n
          }
        }
      }), support.focusinBubbles || jQuery.each({
        focus: "focusin",
        blur: "focusout"
      }, function(e, t) {
        var n = function(e) {
          jQuery.event.simulate(t, e.target, jQuery.event.fix(e), !0)
        };
        jQuery.event.special[t] = {
          setup: function() {
            var r = this.ownerDocument || this,
              i = data_priv.access(r, t);
            i || r.addEventListener(e, n, !0), data_priv.access(r, t, (i || 0) + 1)
          },
          teardown: function() {
            var r = this.ownerDocument || this,
              i = data_priv.access(r, t) - 1;
            i ? data_priv.access(r, t, i) : (r.removeEventListener(e, n, !0), data_priv.remove(r, t))
          }
        }
      }), jQuery.fn.extend({
        on: function(e, t, n, r, i) {
          var s, o;
          if (typeof e == "object") {
            typeof t != "string" && (n = n || t, t = undefined);
            for (o in e) this.on(o, t, n, e[o], i);
            return this
          }
          n == null && r == null ? (r = t, n = t = undefined) : r == null && (typeof t == "string" ? (r = n, n = undefined) : (r = n, n = t, t = undefined));
          if (r === !1) r = returnFalse;
          else if (!r) return this;
          return i === 1 && (s = r, r = function(e) {
            return jQuery().off(e), s.apply(this, arguments)
          }, r.guid = s.guid || (s.guid = jQuery.guid++)), this.each(function() {
            jQuery.event.add(this, e, r, n, t)
          })
        },
        one: function(e, t, n, r) {
          return this.on(e, t, n, r, 1)
        },
        off: function(e, t, n) {
          var r, i;
          if (e && e.preventDefault && e.handleObj) return r = e.handleObj, jQuery(e.delegateTarget).off(r.namespace ? r.origType + "." + r.namespace : r.origType, r.selector, r.handler), this;
          if (typeof e == "object") {
            for (i in e) this.off(i, t, e[i]);
            return this
          }
          if (t === !1 || typeof t == "function") n = t, t = undefined;
          return n === !1 && (n = returnFalse), this.each(function() {
            jQuery.event.remove(this, e, n, t)
          })
        },
        trigger: function(e, t) {
          return this.each(function() {
            jQuery.event.trigger(e, t, this)
          })
        },
        triggerHandler: function(e, t) {
          var n = this[0];
          if (n) return jQuery.event.trigger(e, t, n, !0)
        }
      });
      var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
        rtagName = /<([\w:]+)/,
        rhtml = /<|&#?\w+;/,
        rnoInnerhtml = /<(?:script|style|link)/i,
        rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
        rscriptType = /^$|\/(?:java|ecma)script/i,
        rscriptTypeMasked = /^true\/(.*)/,
        rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
        wrapMap = {
          option: [1, "<select multiple='multiple'>", "</select>"],
          thead: [1, "<table>", "</table>"],
          col: [2, "<table><colgroup>", "</colgroup></table>"],
          tr: [2, "<table><tbody>", "</tbody></table>"],
          td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
          _default: [0, "", ""]
        };
      wrapMap.optgroup = wrapMap.option, wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead, wrapMap.th = wrapMap.td, jQuery.extend({
        clone: function(e, t, n) {
          var r, i, s, o, u = e.cloneNode(!0),
            a = jQuery.contains(e.ownerDocument, e);
          if (!support.noCloneChecked && (e.nodeType === 1 || e.nodeType === 11) && !jQuery.isXMLDoc(e)) {
            o = getAll(u), s = getAll(e);
            for (r = 0, i = s.length; r < i; r++) fixInput(s[r], o[r])
          }
          if (t)
            if (n) {
              s = s || getAll(e), o = o || getAll(u);
              for (r = 0, i = s.length; r < i; r++) cloneCopyEvent(s[r], o[r])
            } else cloneCopyEvent(e, u);
          return o = getAll(u, "script"), o.length > 0 && setGlobalEval(o, !a && getAll(e, "script")), u
        },
        buildFragment: function(e, t, n, r) {
          var i, s, o, u, a, f, l = t.createDocumentFragment(),
            c = [],
            h = 0,
            p = e.length;
          for (; h < p; h++) {
            i = e[h];
            if (i || i === 0)
              if (jQuery.type(i) === "object") jQuery.merge(c, i.nodeType ? [i] : i);
              else if (!rhtml.test(i)) c.push(t.createTextNode(i));
            else {
              s = s || l.appendChild(t.createElement("div")), o = (rtagName.exec(i) || ["", ""])[1].toLowerCase(), u = wrapMap[o] || wrapMap._default, s.innerHTML = u[1] + i.replace(rxhtmlTag, "<$1></$2>") + u[2], f = u[0];
              while (f--) s = s.lastChild;
              jQuery.merge(c, s.childNodes), s = l.firstChild, s.textContent = ""
            }
          }
          l.textContent = "", h = 0;
          while (i = c[h++]) {
            if (r && jQuery.inArray(i, r) !== -1) continue;
            a = jQuery.contains(i.ownerDocument, i), s = getAll(l.appendChild(i), "script"), a && setGlobalEval(s);
            if (n) {
              f = 0;
              while (i = s[f++]) rscriptType.test(i.type || "") && n.push(i)
            }
          }
          return l
        },
        cleanData: function(e) {
          var t, n, r, i, s = jQuery.event.special,
            o = 0;
          for (;
            (n = e[o]) !== undefined; o++) {
            if (jQuery.acceptData(n)) {
              i = n[data_priv.expando];
              if (i && (t = data_priv.cache[i])) {
                if (t.events)
                  for (r in t.events) s[r] ? jQuery.event.remove(n, r) : jQuery.removeEvent(n, r, t.handle);
                data_priv.cache[i] && delete data_priv.cache[i]
              }
            }
            delete data_user.cache[n[data_user.expando]]
          }
        }
      }), jQuery.fn.extend({
        text: function(e) {
          return access(this, function(e) {
            return e === undefined ? jQuery.text(this) : this.empty().each(function() {
              if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) this.textContent = e
            })
          }, null, e, arguments.length)
        },
        append: function() {
          return this.domManip(arguments, function(e) {
            if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
              var t = manipulationTarget(this, e);
              t.appendChild(e)
            }
          })
        },
        prepend: function() {
          return this.domManip(arguments, function(e) {
            if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
              var t = manipulationTarget(this, e);
              t.insertBefore(e, t.firstChild)
            }
          })
        },
        before: function() {
          return this.domManip(arguments, function(e) {
            this.parentNode && this.parentNode.insertBefore(e, this)
          })
        },
        after: function() {
          return this.domManip(arguments, function(e) {
            this.parentNode && this.parentNode.insertBefore(e, this.nextSibling)
          })
        },
        remove: function(e, t) {
          var n, r = e ? jQuery.filter(e, this) : this,
            i = 0;
          for (;
            (n = r[i]) != null; i++)!t && n.nodeType === 1 && jQuery.cleanData(getAll(n)), n.parentNode && (t && jQuery.contains(n.ownerDocument, n) && setGlobalEval(getAll(n, "script")), n.parentNode.removeChild(n));
          return this
        },
        empty: function() {
          var e, t = 0;
          for (;
            (e = this[t]) != null; t++) e.nodeType === 1 && (jQuery.cleanData(getAll(e, !1)), e.textContent = "");
          return this
        },
        clone: function(e, t) {
          return e = e == null ? !1 : e, t = t == null ? e : t, this.map(function() {
            return jQuery.clone(this, e, t)
          })
        },
        html: function(e) {
          return access(this, function(e) {
            var t = this[0] || {},
              n = 0,
              r = this.length;
            if (e === undefined && t.nodeType === 1) return t.innerHTML;
            if (typeof e == "string" && !rnoInnerhtml.test(e) && !wrapMap[(rtagName.exec(e) || ["", ""])[1].toLowerCase()]) {
              e = e.replace(rxhtmlTag, "<$1></$2>");
              try {
                for (; n < r; n++) t = this[n] || {}, t.nodeType === 1 && (jQuery.cleanData(getAll(t, !1)), t.innerHTML = e);
                t = 0
              } catch (i) {}
            }
            t && this.empty().append(e)
          }, null, e, arguments.length)
        },
        replaceWith: function() {
          var e = arguments[0];
          return this.domManip(arguments, function(t) {
            e = this.parentNode, jQuery.cleanData(getAll(this)), e && e.replaceChild(t, this)
          }), e && (e.length || e.nodeType) ? this : this.remove()
        },
        detach: function(e) {
          return this.remove(e, !0)
        },
        domManip: function(e, t) {
          e = concat.apply([], e);
          var n, r, i, s, o, u, a = 0,
            f = this.length,
            l = this,
            c = f - 1,
            h = e[0],
            p = jQuery.isFunction(h);
          if (p || f > 1 && typeof h == "string" && !support.checkClone && rchecked.test(h)) return this.each(function(n) {
            var r = l.eq(n);
            p && (e[0] = h.call(this, n, r.html())), r.domManip(e, t)
          });
          if (f) {
            n = jQuery.buildFragment(e, this[0].ownerDocument, !1, this), r = n.firstChild, n.childNodes.length === 1 && (n = r);
            if (r) {
              i = jQuery.map(getAll(n, "script"), disableScript), s = i.length;
              for (; a < f; a++) o = n, a !== c && (o = jQuery.clone(o, !0, !0), s && jQuery.merge(i, getAll(o, "script"))), t.call(this[a], o, a);
              if (s) {
                u = i[i.length - 1].ownerDocument, jQuery.map(i, restoreScript);
                for (a = 0; a < s; a++) o = i[a], rscriptType.test(o.type || "") && !data_priv.access(o, "globalEval") && jQuery.contains(u, o) && (o.src ? jQuery._evalUrl && jQuery._evalUrl(o.src) : jQuery.globalEval(o.textContent.replace(rcleanScript, "")))
              }
            }
          }
          return this
        }
      }), jQuery.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
      }, function(e, t) {
        jQuery.fn[e] = function(e) {
          var n, r = [],
            i = jQuery(e),
            s = i.length - 1,
            o = 0;
          for (; o <= s; o++) n = o === s ? this : this.clone(!0), jQuery(i[o])[t](n), push.apply(r, n.get());
          return this.pushStack(r)
        }
      });
      var iframe, elemdisplay = {},
        rmargin = /^margin/,
        rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i"),
        getStyles = function(e) {
          return e.ownerDocument.defaultView.getComputedStyle(e, null)
        };
      (function() {
        function s() {
          i.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute", i.innerHTML = "", n.appendChild(r);
          var s = window.getComputedStyle(i, null);
          e = s.top !== "1%", t = s.width === "4px", n.removeChild(r)
        }
        var e, t, n = document.documentElement,
          r = document.createElement("div"),
          i = document.createElement("div");
        if (!i.style) return;
        i.style.backgroundClip = "content-box", i.cloneNode(!0).style.backgroundClip = "", support.clearCloneStyle = i.style.backgroundClip === "content-box", r.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute", r.appendChild(i), window.getComputedStyle && jQuery.extend(support, {
          pixelPosition: function() {
            return s(), e
          },
          boxSizingReliable: function() {
            return t == null && s(), t
          },
          reliableMarginRight: function() {
            var e, t = i.appendChild(document.createElement("div"));
            return t.style.cssText = i.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0", t.style.marginRight = t.style.width = "0", i.style.width = "1px", n.appendChild(r), e = !parseFloat(window.getComputedStyle(t, null).marginRight), n.removeChild(r), e
          }
        })
      })(), jQuery.swap = function(e, t, n, r) {
        var i, s, o = {};
        for (s in t) o[s] = e.style[s], e.style[s] = t[s];
        i = n.apply(e, r || []);
        for (s in t) e.style[s] = o[s];
        return i
      };
      var rdisplayswap = /^(none|table(?!-c[ea]).+)/,
        rnumsplit = new RegExp("^(" + pnum + ")(.*)$", "i"),
        rrelNum = new RegExp("^([+-])=(" + pnum + ")", "i"),
        cssShow = {
          position: "absolute",
          visibility: "hidden",
          display: "block"
        },
        cssNormalTransform = {
          letterSpacing: "0",
          fontWeight: "400"
        },
        cssPrefixes = ["Webkit", "O", "Moz", "ms"];
      jQuery.extend({
        cssHooks: {
          opacity: {
            get: function(e, t) {
              if (t) {
                var n = curCSS(e, "opacity");
                return n === "" ? "1" : n
              }
            }
          }
        },
        cssNumber: {
          columnCount: !0,
          fillOpacity: !0,
          flexGrow: !0,
          flexShrink: !0,
          fontWeight: !0,
          lineHeight: !0,
          opacity: !0,
          order: !0,
          orphans: !0,
          widows: !0,
          zIndex: !0,
          zoom: !0
        },
        cssProps: {
          "float": "cssFloat"
        },
        style: function(e, t, n, r) {
          if (!e || e.nodeType === 3 || e.nodeType === 8 || !e.style) return;
          var i, s, o, u = jQuery.camelCase(t),
            a = e.style;
          t = jQuery.cssProps[u] || (jQuery.cssProps[u] = vendorPropName(a, u)), o = jQuery.cssHooks[t] || jQuery.cssHooks[u];
          if (n === undefined) return o && "get" in o && (i = o.get(e, !1, r)) !== undefined ? i : a[t];
          s = typeof n, s === "string" && (i = rrelNum.exec(n)) && (n = (i[1] + 1) * i[2] + parseFloat(jQuery.css(e, t)), s = "number");
          if (n == null || n !== n) return;
          s === "number" && !jQuery.cssNumber[u] && (n += "px"), !support.clearCloneStyle && n === "" && t.indexOf("background") === 0 && (a[t] = "inherit");
          if (!o || !("set" in o) || (n = o.set(e, n, r)) !== undefined) a[t] = n
        },
        css: function(e, t, n, r) {
          var i, s, o, u = jQuery.camelCase(t);
          return t = jQuery.cssProps[u] || (jQuery.cssProps[u] = vendorPropName(e.style, u)), o = jQuery.cssHooks[t] || jQuery.cssHooks[u], o && "get" in o && (i = o.get(e, !0, n)), i === undefined && (i = curCSS(e, t, r)), i === "normal" && t in cssNormalTransform && (i = cssNormalTransform[t]), n === "" || n ? (s = parseFloat(i), n === !0 || jQuery.isNumeric(s) ? s || 0 : i) : i
        }
      }), jQuery.each(["height", "width"], function(e, t) {
        jQuery.cssHooks[t] = {
          get: function(e, n, r) {
            if (n) return rdisplayswap.test(jQuery.css(e, "display")) && e.offsetWidth === 0 ? jQuery.swap(e, cssShow, function() {
              return getWidthOrHeight(e, t, r)
            }) : getWidthOrHeight(e, t, r)
          },
          set: function(e, n, r) {
            var i = r && getStyles(e);
            return setPositiveNumber(e, n, r ? augmentWidthOrHeight(e, t, r, jQuery.css(e, "boxSizing", !1, i) === "border-box", i) : 0)
          }
        }
      }), jQuery.cssHooks.marginRight = addGetHookIf(support.reliableMarginRight, function(e, t) {
        if (t) return jQuery.swap(e, {
          display: "inline-block"
        }, curCSS, [e, "marginRight"])
      }), jQuery.each({
        margin: "",
        padding: "",
        border: "Width"
      }, function(e, t) {
        jQuery.cssHooks[e + t] = {
          expand: function(n) {
            var r = 0,
              i = {},
              s = typeof n == "string" ? n.split(" ") : [n];
            for (; r < 4; r++) i[e + cssExpand[r] + t] = s[r] || s[r - 2] || s[0];
            return i
          }
        }, rmargin.test(e) || (jQuery.cssHooks[e + t].set = setPositiveNumber)
      }), jQuery.fn.extend({
        css: function(e, t) {
          return access(this, function(e, t, n) {
            var r, i, s = {},
              o = 0;
            if (jQuery.isArray(t)) {
              r = getStyles(e), i = t.length;
              for (; o < i; o++) s[t[o]] = jQuery.css(e, t[o], !1, r);
              return s
            }
            return n !== undefined ? jQuery.style(e, t, n) : jQuery.css(e, t)
          }, e, t, arguments.length > 1)
        },
        show: function() {
          return showHide(this, !0)
        },
        hide: function() {
          return showHide(this)
        },
        toggle: function(e) {
          return typeof e == "boolean" ? e ? this.show() : this.hide() : this.each(function() {
            isHidden(this) ? jQuery(this).show() : jQuery(this).hide()
          })
        }
      }), jQuery.Tween = Tween, Tween.prototype = {
        constructor: Tween,
        init: function(e, t, n, r, i, s) {
          this.elem = e, this.prop = n, this.easing = i || "swing", this.options = t, this.start = this.now = this.cur(), this.end = r, this.unit = s || (jQuery.cssNumber[n] ? "" : "px")
        },
        cur: function() {
          var e = Tween.propHooks[this.prop];
          return e && e.get ? e.get(this) : Tween.propHooks._default.get(this)
        },
        run: function(e) {
          var t, n = Tween.propHooks[this.prop];
          return this.options.duration ? this.pos = t = jQuery.easing[this.easing](e, this.options.duration * e, 0, 1, this.options.duration) : this.pos = t = e, this.now = (this.end - this.start) * t + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), n && n.set ? n.set(this) : Tween.propHooks._default.set(this), this
        }
      }, Tween.prototype.init.prototype = Tween.prototype, Tween.propHooks = {
        _default: {
          get: function(e) {
            var t;
            return e.elem[e.prop] == null || !!e.elem.style && e.elem.style[e.prop] != null ? (t = jQuery.css(e.elem, e.prop, ""), !t || t === "auto" ? 0 : t) : e.elem[e.prop]
          },
          set: function(e) {
            jQuery.fx.step[e.prop] ? jQuery.fx.step[e.prop](e) : e.elem.style && (e.elem.style[jQuery.cssProps[e.prop]] != null || jQuery.cssHooks[e.prop]) ? jQuery.style(e.elem, e.prop, e.now + e.unit) : e.elem[e.prop] = e.now
          }
        }
      }, Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
        set: function(e) {
          e.elem.nodeType && e.elem.parentNode && (e.elem[e.prop] = e.now)
        }
      }, jQuery.easing = {
        linear: function(e) {
          return e
        },
        swing: function(e) {
          return .5 - Math.cos(e * Math.PI) / 2
        }
      }, jQuery.fx = Tween.prototype.init, jQuery.fx.step = {};
      var fxNow, timerId, rfxtypes = /^(?:toggle|show|hide)$/,
        rfxnum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i"),
        rrun = /queueHooks$/,
        animationPrefilters = [defaultPrefilter],
        tweeners = {
          "*": [
            function(e, t) {
              var n = this.createTween(e, t),
                r = n.cur(),
                i = rfxnum.exec(t),
                s = i && i[3] || (jQuery.cssNumber[e] ? "" : "px"),
                o = (jQuery.cssNumber[e] || s !== "px" && +r) && rfxnum.exec(jQuery.css(n.elem, e)),
                u = 1,
                a = 20;
              if (o && o[3] !== s) {
                s = s || o[3], i = i || [], o = +r || 1;
                do u = u || ".5", o /= u, jQuery.style(n.elem, e, o + s); while (u !== (u = n.cur() / r) && u !== 1 && --a)
              }
              return i && (o = n.start = +o || +r || 0, n.unit = s, n.end = i[1] ? o + (i[1] + 1) * i[2] : +i[2]), n
            }
          ]
        };
      jQuery.Animation = jQuery.extend(Animation, {
          tweener: function(e, t) {
            jQuery.isFunction(e) ? (t = e, e = ["*"]) : e = e.split(" ");
            var n, r = 0,
              i = e.length;
            for (; r < i; r++) n = e[r], tweeners[n] = tweeners[n] || [], tweeners[n].unshift(t)
          },
          prefilter: function(e, t) {
            t ? animationPrefilters.unshift(e) : animationPrefilters.push(e)
          }
        }), jQuery.speed = function(e, t, n) {
          var r = e && typeof e == "object" ? jQuery.extend({}, e) : {
            complete: n || !n && t || jQuery.isFunction(e) && e,
            duration: e,
            easing: n && t || t && !jQuery.isFunction(t) && t
          };
          r.duration = jQuery.fx.off ? 0 : typeof r.duration == "number" ? r.duration : r.duration in jQuery.fx.speeds ? jQuery.fx.speeds[r.duration] : jQuery.fx.speeds._default;
          if (r.queue == null || r.queue === !0) r.queue = "fx";
          return r.old = r.complete, r.complete = function() {
            jQuery.isFunction(r.old) && r.old.call(this), r.queue && jQuery.dequeue(this, r.queue)
          }, r
        }, jQuery.fn.extend({
          fadeTo: function(e, t, n, r) {
            return this.filter(isHidden).css("opacity", 0).show().end().animate({
              opacity: t
            }, e, n, r)
          },
          animate: function(e, t, n, r) {
            var i = jQuery.isEmptyObject(e),
              s = jQuery.speed(t, n, r),
              o = function() {
                var t = Animation(this, jQuery.extend({}, e), s);
                (i || data_priv.get(this, "finish")) && t.stop(!0)
              };
            return o.finish = o, i || s.queue === !1 ? this.each(o) : this.queue(s.queue, o)
          },
          stop: function(e, t, n) {
            var r = function(e) {
              var t = e.stop;
              delete e.stop, t(n)
            };
            return typeof e != "string" && (n = t, t = e, e = undefined), t && e !== !1 && this.queue(e || "fx", []), this.each(function() {
              var t = !0,
                i = e != null && e + "queueHooks",
                s = jQuery.timers,
                o = data_priv.get(this);
              if (i) o[i] && o[i].stop && r(o[i]);
              else
                for (i in o) o[i] && o[i].stop && rrun.test(i) && r(o[i]);
              for (i = s.length; i--;) s[i].elem === this && (e == null || s[i].queue === e) && (s[i].anim.stop(n), t = !1, s.splice(i, 1));
              (t || !n) && jQuery.dequeue(this, e)
            })
          },
          finish: function(e) {
            return e !== !1 && (e = e || "fx"), this.each(function() {
              var t, n = data_priv.get(this),
                r = n[e + "queue"],
                i = n[e + "queueHooks"],
                s = jQuery.timers,
                o = r ? r.length : 0;
              n.finish = !0, jQuery.queue(this, e, []), i && i.stop && i.stop.call(this, !0);
              for (t = s.length; t--;) s[t].elem === this && s[t].queue === e && (s[t].anim.stop(!0), s.splice(t, 1));
              for (t = 0; t < o; t++) r[t] && r[t].finish && r[t].finish.call(this);
              delete n.finish
            })
          }
        }), jQuery.each(["toggle", "show", "hide"], function(e, t) {
          var n = jQuery.fn[t];
          jQuery.fn[t] = function(e, r, i) {
            return e == null || typeof e == "boolean" ? n.apply(this, arguments) : this.animate(genFx(t, !0), e, r, i)
          }
        }), jQuery.each({
          slideDown: genFx("show"),
          slideUp: genFx("hide"),
          slideToggle: genFx("toggle"),
          fadeIn: {
            opacity: "show"
          },
          fadeOut: {
            opacity: "hide"
          },
          fadeToggle: {
            opacity: "toggle"
          }
        }, function(e, t) {
          jQuery.fn[e] = function(e, n, r) {
            return this.animate(t, e, n, r)
          }
        }), jQuery.timers = [], jQuery.fx.tick = function() {
          var e, t = 0,
            n = jQuery.timers;
          fxNow = jQuery.now();
          for (; t < n.length; t++) e = n[t], !e() && n[t] === e && n.splice(t--, 1);
          n.length || jQuery.fx.stop(), fxNow = undefined
        }, jQuery.fx.timer = function(e) {
          jQuery.timers.push(e), e() ? jQuery.fx.start() : jQuery.timers.pop()
        }, jQuery.fx.interval = 13, jQuery.fx.start = function() {
          timerId || (timerId = setInterval(jQuery.fx.tick, jQuery.fx.interval))
        }, jQuery.fx.stop = function() {
          clearInterval(timerId), timerId = null
        }, jQuery.fx.speeds = {
          slow: 600,
          fast: 200,
          _default: 400
        }, jQuery.fn.delay = function(e, t) {
          return e = jQuery.fx ? jQuery.fx.speeds[e] || e : e, t = t || "fx", this.queue(t, function(t, n) {
            var r = setTimeout(t, e);
            n.stop = function() {
              clearTimeout(r)
            }
          })
        },
        function() {
          var e = document.createElement("input"),
            t = document.createElement("select"),
            n = t.appendChild(document.createElement("option"));
          e.type = "checkbox", support.checkOn = e.value !== "", support.optSelected = n.selected, t.disabled = !0, support.optDisabled = !n.disabled, e = document.createElement("input"), e.value = "t", e.type = "radio", support.radioValue = e.value === "t"
        }();
      var nodeHook, boolHook, attrHandle = jQuery.expr.attrHandle;
      jQuery.fn.extend({
        attr: function(e, t) {
          return access(this, jQuery.attr, e, t, arguments.length > 1)
        },
        removeAttr: function(e) {
          return this.each(function() {
            jQuery.removeAttr(this, e)
          })
        }
      }), jQuery.extend({
        attr: function(e, t, n) {
          var r, i, s = e.nodeType;
          if (!e || s === 3 || s === 8 || s === 2) return;
          if (typeof e.getAttribute === strundefined) return jQuery.prop(e, t, n);
          if (s !== 1 || !jQuery.isXMLDoc(e)) t = t.toLowerCase(), r = jQuery.attrHooks[t] || (jQuery.expr.match.bool.test(t) ? boolHook : nodeHook);
          if (n === undefined) return r && "get" in r && (i = r.get(e, t)) !== null ? i : (i = jQuery.find.attr(e, t), i == null ? undefined : i);
          if (n !== null) return r && "set" in r && (i = r.set(e, n, t)) !== undefined ? i : (e.setAttribute(t, n + ""), n);
          jQuery.removeAttr(e, t)
        },
        removeAttr: function(e, t) {
          var n, r, i = 0,
            s = t && t.match(rnotwhite);
          if (s && e.nodeType === 1)
            while (n = s[i++]) r = jQuery.propFix[n] || n, jQuery.expr.match.bool.test(n) && (e[r] = !1), e.removeAttribute(n)
        },
        attrHooks: {
          type: {
            set: function(e, t) {
              if (!support.radioValue && t === "radio" && jQuery.nodeName(e, "input")) {
                var n = e.value;
                return e.setAttribute("type", t), n && (e.value = n), t
              }
            }
          }
        }
      }), boolHook = {
        set: function(e, t, n) {
          return t === !1 ? jQuery.removeAttr(e, n) : e.setAttribute(n, n), n
        }
      }, jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function(e, t) {
        var n = attrHandle[t] || jQuery.find.attr;
        attrHandle[t] = function(e, t, r) {
          var i, s;
          return r || (s = attrHandle[t], attrHandle[t] = i, i = n(e, t, r) != null ? t.toLowerCase() : null, attrHandle[t] = s), i
        }
      });
      var rfocusable = /^(?:input|select|textarea|button)$/i;
      jQuery.fn.extend({
        prop: function(e, t) {
          return access(this, jQuery.prop, e, t, arguments.length > 1)
        },
        removeProp: function(e) {
          return this.each(function() {
            delete this[jQuery.propFix[e] || e]
          })
        }
      }), jQuery.extend({
        propFix: {
          "for": "htmlFor",
          "class": "className"
        },
        prop: function(e, t, n) {
          var r, i, s, o = e.nodeType;
          if (!e || o === 3 || o === 8 || o === 2) return;
          return s = o !== 1 || !jQuery.isXMLDoc(e), s && (t = jQuery.propFix[t] || t, i = jQuery.propHooks[t]), n !== undefined ? i && "set" in i && (r = i.set(e, n, t)) !== undefined ? r : e[t] = n : i && "get" in i && (r = i.get(e, t)) !== null ? r : e[t]
        },
        propHooks: {
          tabIndex: {
            get: function(e) {
              return e.hasAttribute("tabindex") || rfocusable.test(e.nodeName) || e.href ? e.tabIndex : -1
            }
          }
        }
      }), support.optSelected || (jQuery.propHooks.selected = {
        get: function(e) {
          var t = e.parentNode;
          return t && t.parentNode && t.parentNode.selectedIndex, null
        }
      }), jQuery.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() {
        jQuery.propFix[this.toLowerCase()] = this
      });
      var rclass = /[\t\r\n\f]/g;
      jQuery.fn.extend({
        addClass: function(e) {
          var t, n, r, i, s, o, u = typeof e == "string" && e,
            a = 0,
            f = this.length;
          if (jQuery.isFunction(e)) return this.each(function(t) {
            jQuery(this).addClass(e.call(this, t, this.className))
          });
          if (u) {
            t = (e || "").match(rnotwhite) || [];
            for (; a < f; a++) {
              n = this[a], r = n.nodeType === 1 && (n.className ? (" " + n.className + " ").replace(rclass, " ") : " ");
              if (r) {
                s = 0;
                while (i = t[s++]) r.indexOf(" " + i + " ") < 0 && (r += i + " ");
                o = jQuery.trim(r), n.className !== o && (n.className = o)
              }
            }
          }
          return this
        },
        removeClass: function(e) {
          var t, n, r, i, s, o, u = arguments.length === 0 || typeof e == "string" && e,
            a = 0,
            f = this.length;
          if (jQuery.isFunction(e)) return this.each(function(t) {
            jQuery(this).removeClass(e.call(this, t, this.className))
          });
          if (u) {
            t = (e || "").match(rnotwhite) || [];
            for (; a < f; a++) {
              n = this[a], r = n.nodeType === 1 && (n.className ? (" " + n.className + " ").replace(rclass, " ") : "");
              if (r) {
                s = 0;
                while (i = t[s++])
                  while (r.indexOf(" " + i + " ") >= 0) r = r.replace(" " + i + " ", " ");
                o = e ? jQuery.trim(r) : "", n.className !== o && (n.className = o)
              }
            }
          }
          return this
        },
        toggleClass: function(e, t) {
          var n = typeof e;
          return typeof t == "boolean" && n === "string" ? t ? this.addClass(e) : this.removeClass(e) : jQuery.isFunction(e) ? this.each(function(n) {
            jQuery(this).toggleClass(e.call(this, n, this.className, t), t)
          }) : this.each(function() {
            if (n === "string") {
              var t, r = 0,
                i = jQuery(this),
                s = e.match(rnotwhite) || [];
              while (t = s[r++]) i.hasClass(t) ? i.removeClass(t) : i.addClass(t)
            } else if (n === strundefined || n === "boolean") this.className && data_priv.set(this, "__className__", this.className), this.className = this.className || e === !1 ? "" : data_priv.get(this, "__className__") || ""
          })
        },
        hasClass: function(e) {
          var t = " " + e + " ",
            n = 0,
            r = this.length;
          for (; n < r; n++)
            if (this[n].nodeType === 1 && (" " + this[n].className + " ").replace(rclass, " ").indexOf(t) >= 0) return !0;
          return !1
        }
      });
      var rreturn = /\r/g;
      jQuery.fn.extend({
        val: function(e) {
          var t, n, r, i = this[0];
          if (!arguments.length) {
            if (i) return t = jQuery.valHooks[i.type] || jQuery.valHooks[i.nodeName.toLowerCase()], t && "get" in t && (n = t.get(i, "value")) !== undefined ? n : (n = i.value, typeof n == "string" ? n.replace(rreturn, "") : n == null ? "" : n);
            return
          }
          return r = jQuery.isFunction(e), this.each(function(n) {
            var i;
            if (this.nodeType !== 1) return;
            r ? i = e.call(this, n, jQuery(this).val()) : i = e, i == null ? i = "" : typeof i == "number" ? i += "" : jQuery.isArray(i) && (i = jQuery.map(i, function(e) {
              return e == null ? "" : e + ""
            })), t = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];
            if (!t || !("set" in t) || t.set(this, i, "value") === undefined) this.value = i
          })
        }
      }), jQuery.extend({
        valHooks: {
          option: {
            get: function(e) {
              var t = jQuery.find.attr(e, "value");
              return t != null ? t : jQuery.trim(jQuery.text(e))
            }
          },
          select: {
            get: function(e) {
              var t, n, r = e.options,
                i = e.selectedIndex,
                s = e.type === "select-one" || i < 0,
                o = s ? null : [],
                u = s ? i + 1 : r.length,
                a = i < 0 ? u : s ? i : 0;
              for (; a < u; a++) {
                n = r[a];
                if ((n.selected || a === i) && (support.optDisabled ? !n.disabled : n.getAttribute("disabled") === null) && (!n.parentNode.disabled || !jQuery.nodeName(n.parentNode, "optgroup"))) {
                  t = jQuery(n).val();
                  if (s) return t;
                  o.push(t)
                }
              }
              return o
            },
            set: function(e, t) {
              var n, r, i = e.options,
                s = jQuery.makeArray(t),
                o = i.length;
              while (o--) {
                r = i[o];
                if (r.selected = jQuery.inArray(r.value, s) >= 0) n = !0
              }
              return n || (e.selectedIndex = -1), s
            }
          }
        }
      }), jQuery.each(["radio", "checkbox"], function() {
        jQuery.valHooks[this] = {
          set: function(e, t) {
            if (jQuery.isArray(t)) return e.checked = jQuery.inArray(jQuery(e).val(), t) >= 0
          }
        }, support.checkOn || (jQuery.valHooks[this].get = function(e) {
          return e.getAttribute("value") === null ? "on" : e.value
        })
      }), jQuery.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(e, t) {
        jQuery.fn[t] = function(e, n) {
          return arguments.length > 0 ? this.on(t, null, e, n) : this.trigger(t)
        }
      }), jQuery.fn.extend({
        hover: function(e, t) {
          return this.mouseenter(e).mouseleave(t || e)
        },
        bind: function(e, t, n) {
          return this.on(e, null, t, n)
        },
        unbind: function(e, t) {
          return this.off(e, null, t)
        },
        delegate: function(e, t, n, r) {
          return this.on(t, e, n, r)
        },
        undelegate: function(e, t, n) {
          return arguments.length === 1 ? this.off(e, "**") : this.off(t, e || "**", n)
        }
      });
      var nonce = jQuery.now(),
        rquery = /\?/;
      jQuery.parseJSON = function(e) {
        return JSON.parse(e + "")
      }, jQuery.parseXML = function(e) {
        var t, n;
        if (!e || typeof e != "string") return null;
        try {
          n = new DOMParser, t = n.parseFromString(e, "text/xml")
        } catch (r) {
          t = undefined
        }
        return (!t || t.getElementsByTagName("parsererror").length) && jQuery.error("Invalid XML: " + e), t
      };
      var ajaxLocParts, ajaxLocation, rhash = /#.*$/,
        rts = /([?&])_=[^&]*/,
        rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
        rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
        rnoContent = /^(?:GET|HEAD)$/,
        rprotocol = /^\/\//,
        rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,
        prefilters = {},
        transports = {},
        allTypes = "*/".concat("*");
      try {
        ajaxLocation = location.href
      } catch (e) {
        ajaxLocation = document.createElement("a"), ajaxLocation.href = "", ajaxLocation = ajaxLocation.href
      }
      ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [], jQuery.extend({
        active: 0,
        lastModified: {},
        etag: {},
        ajaxSettings: {
          url: ajaxLocation,
          type: "GET",
          isLocal: rlocalProtocol.test(ajaxLocParts[1]),
          global: !0,
          processData: !0,
          async: !0,
          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
          accepts: {
            "*": allTypes,
            text: "text/plain",
            html: "text/html",
            xml: "application/xml, text/xml",
            json: "application/json, text/javascript"
          },
          contents: {
            xml: /xml/,
            html: /html/,
            json: /json/
          },
          responseFields: {
            xml: "responseXML",
            text: "responseText",
            json: "responseJSON"
          },
          converters: {
            "* text": String,
            "text html": !0,
            "text json": jQuery.parseJSON,
            "text xml": jQuery.parseXML
          },
          flatOptions: {
            url: !0,
            context: !0
          }
        },
        ajaxSetup: function(e, t) {
          return t ? ajaxExtend(ajaxExtend(e, jQuery.ajaxSettings), t) : ajaxExtend(jQuery.ajaxSettings, e)
        },
        ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
        ajaxTransport: addToPrefiltersOrTransports(transports),
        ajax: function(e, t) {
          function S(e, t, s, u) {
            var f, m, g, b, E, S = t;
            if (y === 2) return;
            y = 2, o && clearTimeout(o), n = undefined, i = u || "", w.readyState = e > 0 ? 4 : 0, f = e >= 200 && e < 300 || e === 304, s && (b = ajaxHandleResponses(l, w, s)), b = ajaxConvert(l, b, w, f);
            if (f) l.ifModified && (E = w.getResponseHeader("Last-Modified"), E && (jQuery.lastModified[r] = E), E = w.getResponseHeader("etag"), E && (jQuery.etag[r] = E)), e === 204 || l.type === "HEAD" ? S = "nocontent" : e === 304 ? S = "notmodified" : (S = b.state, m = b.data, g = b.error, f = !g);
            else {
              g = S;
              if (e || !S) S = "error", e < 0 && (e = 0)
            }
            w.status = e, w.statusText = (t || S) + "", f ? p.resolveWith(c, [m, S, w]) : p.rejectWith(c, [w, S, g]), w.statusCode(v), v = undefined, a && h.trigger(f ? "ajaxSuccess" : "ajaxError", [w, l, f ? m : g]), d.fireWith(c, [w, S]), a && (h.trigger("ajaxComplete", [w, l]), --jQuery.active || jQuery.event.trigger("ajaxStop"))
          }
          typeof e == "object" && (t = e, e = undefined), t = t || {};
          var n, r, i, s, o, u, a, f, l = jQuery.ajaxSetup({}, t),
            c = l.context || l,
            h = l.context && (c.nodeType || c.jquery) ? jQuery(c) : jQuery.event,
            p = jQuery.Deferred(),
            d = jQuery.Callbacks("once memory"),
            v = l.statusCode || {},
            m = {},
            g = {},
            y = 0,
            b = "canceled",
            w = {
              readyState: 0,
              getResponseHeader: function(e) {
                var t;
                if (y === 2) {
                  if (!s) {
                    s = {};
                    while (t = rheaders.exec(i)) s[t[1].toLowerCase()] = t[2]
                  }
                  t = s[e.toLowerCase()]
                }
                return t == null ? null : t
              },
              getAllResponseHeaders: function() {
                return y === 2 ? i : null
              },
              setRequestHeader: function(e, t) {
                var n = e.toLowerCase();
                return y || (e = g[n] = g[n] || e, m[e] = t), this
              },
              overrideMimeType: function(e) {
                return y || (l.mimeType = e), this
              },
              statusCode: function(e) {
                var t;
                if (e)
                  if (y < 2)
                    for (t in e) v[t] = [v[t], e[t]];
                  else w.always(e[w.status]);
                return this
              },
              abort: function(e) {
                var t = e || b;
                return n && n.abort(t), S(0, t), this
              }
            };
          p.promise(w).complete = d.add, w.success = w.done, w.error = w.fail, l.url = ((e || l.url || ajaxLocation) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//"), l.type = t.method || t.type || l.method || l.type, l.dataTypes = jQuery.trim(l.dataType || "*").toLowerCase().match(rnotwhite) || [""], l.crossDomain == null && (u = rurl.exec(l.url.toLowerCase()), l.crossDomain = !(!u || u[1] === ajaxLocParts[1] && u[2] === ajaxLocParts[2] && (u[3] || (u[1] === "http:" ? "80" : "443")) === (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? "80" : "443")))), l.data && l.processData && typeof l.data != "string" && (l.data = jQuery.param(l.data, l.traditional)), inspectPrefiltersOrTransports(prefilters, l, t, w);
          if (y === 2) return w;
          a = l.global, a && jQuery.active++ === 0 && jQuery.event.trigger("ajaxStart"), l.type = l.type.toUpperCase(), l.hasContent = !rnoContent.test(l.type), r = l.url, l.hasContent || (l.data && (r = l.url += (rquery.test(r) ? "&" : "?") + l.data, delete l.data), l.cache === !1 && (l.url = rts.test(r) ? r.replace(rts, "$1_=" + nonce++) : r + (rquery.test(r) ? "&" : "?") + "_=" + nonce++)), l.ifModified && (jQuery.lastModified[r] && w.setRequestHeader("If-Modified-Since", jQuery.lastModified[r]), jQuery.etag[r] && w.setRequestHeader("If-None-Match", jQuery.etag[r])), (l.data && l.hasContent && l.contentType !== !1 || t.contentType) && w.setRequestHeader("Content-Type", l.contentType), w.setRequestHeader("Accept", l.dataTypes[0] && l.accepts[l.dataTypes[0]] ? l.accepts[l.dataTypes[0]] + (l.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") : l.accepts["*"]);
          for (f in l.headers) w.setRequestHeader(f, l.headers[f]);
          if (!l.beforeSend || l.beforeSend.call(c, w, l) !== !1 && y !== 2) {
            b = "abort";
            for (f in {
              success: 1,
              error: 1,
              complete: 1
            }) w[f](l[f]);
            n = inspectPrefiltersOrTransports(transports, l, t, w);
            if (!n) S(-1, "No Transport");
            else {
              w.readyState = 1, a && h.trigger("ajaxSend", [w, l]), l.async && l.timeout > 0 && (o = setTimeout(function() {
                w.abort("timeout")
              }, l.timeout));
              try {
                y = 1, n.send(m, S)
              } catch (E) {
                if (!(y < 2)) throw E;
                S(-1, E)
              }
            }
            return w
          }
          return w.abort()
        },
        getJSON: function(e, t, n) {
          return jQuery.get(e, t, n, "json")
        },
        getScript: function(e, t) {
          return jQuery.get(e, undefined, t, "script")
        }
      }), jQuery.each(["get", "post"], function(e, t) {
        jQuery[t] = function(e, n, r, i) {
          return jQuery.isFunction(n) && (i = i || r, r = n, n = undefined), jQuery.ajax({
            url: e,
            type: t,
            dataType: i,
            data: n,
            success: r
          })
        }
      }), jQuery.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(e, t) {
        jQuery.fn[t] = function(e) {
          return this.on(t, e)
        }
      }), jQuery._evalUrl = function(e) {
        return jQuery.ajax({
          url: e,
          type: "GET",
          dataType: "script",
          async: !1,
          global: !1,
          "throws": !0
        })
      }, jQuery.fn.extend({
        wrapAll: function(e) {
          var t;
          return jQuery.isFunction(e) ? this.each(function(t) {
            jQuery(this).wrapAll(e.call(this, t))
          }) : (this[0] && (t = jQuery(e, this[0].ownerDocument).eq(0).clone(!0), this[0].parentNode && t.insertBefore(this[0]), t.map(function() {
            var e = this;
            while (e.firstElementChild) e = e.firstElementChild;
            return e
          }).append(this)), this)
        },
        wrapInner: function(e) {
          return jQuery.isFunction(e) ? this.each(function(t) {
            jQuery(this).wrapInner(e.call(this, t))
          }) : this.each(function() {
            var t = jQuery(this),
              n = t.contents();
            n.length ? n.wrapAll(e) : t.append(e)
          })
        },
        wrap: function(e) {
          var t = jQuery.isFunction(e);
          return this.each(function(n) {
            jQuery(this).wrapAll(t ? e.call(this, n) : e)
          })
        },
        unwrap: function() {
          return this.parent().each(function() {
            jQuery.nodeName(this, "body") || jQuery(this).replaceWith(this.childNodes)
          }).end()
        }
      });
      var r20 = /%20/g,
        rbracket = /\[\]$/,
        rCRLF = /\r?\n/g,
        rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
        rsubmittable = /^(?:input|select|textarea|keygen)/i;
      jQuery.param = function(e, t) {
        var n, r = [],
          i = function(e, t) {
            t = jQuery.isFunction(t) ? t() : t == null ? "" : t, r[r.length] = encodeURIComponent(e) + "=" + encodeURIComponent(t)
          };
        t === undefined && (t = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional);
        if (jQuery.isArray(e) || e.jquery && !jQuery.isPlainObject(e)) jQuery.each(e, function() {
          i(this.name, this.value)
        });
        else
          for (n in e) buildParams(n, e[n], t, i);
        return r.join("&").replace(r20, "+")
      }, jQuery.fn.extend({
        serialize: function() {
          return jQuery.param(this.serializeArray())
        },
        serializeArray: function() {
          return this.map(function() {
            var e = jQuery.prop(this, "elements");
            return e ? jQuery.makeArray(e) : this
          }).filter(function() {
            var e = this.type;
            return this.name && !jQuery(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(e) && (this.checked || !rcheckableType.test(e))
          }).map(function(e, t) {
            var n = jQuery(this).val();
            return n == null ? null : jQuery.isArray(n) ? jQuery.map(n, function(e) {
              return {
                name: t.name,
                value: e.replace(rCRLF, "\r\n")
              }
            }) : {
              name: t.name,
              value: n.replace(rCRLF, "\r\n")
            }
          }).get()
        }
      }), jQuery.ajaxSettings.xhr = function() {
        try {
          return new XMLHttpRequest
        } catch (e) {}
      };
      var xhrId = 0,
        xhrCallbacks = {},
        xhrSuccessStatus = {
          0: 200,
          1223: 204
        },
        xhrSupported = jQuery.ajaxSettings.xhr();
      window.ActiveXObject && jQuery(window).on("unload", function() {
        for (var e in xhrCallbacks) xhrCallbacks[e]()
      }), support.cors = !!xhrSupported && "withCredentials" in xhrSupported, support.ajax = xhrSupported = !!xhrSupported, jQuery.ajaxTransport(function(e) {
        var t;
        if (support.cors || xhrSupported && !e.crossDomain) return {
          send: function(n, r) {
            var i, s = e.xhr(),
              o = ++xhrId;
            s.open(e.type, e.url, e.async, e.username, e.password);
            if (e.xhrFields)
              for (i in e.xhrFields) s[i] = e.xhrFields[i];
            e.mimeType && s.overrideMimeType && s.overrideMimeType(e.mimeType), !e.crossDomain && !n["X-Requested-With"] && (n["X-Requested-With"] = "XMLHttpRequest");
            for (i in n) s.setRequestHeader(i, n[i]);
            t = function(e) {
              return function() {
                t && (delete xhrCallbacks[o], t = s.onload = s.onerror = null, e === "abort" ? s.abort() : e === "error" ? r(s.status, s.statusText) : r(xhrSuccessStatus[s.status] || s.status, s.statusText, typeof s.responseText == "string" ? {
                  text: s.responseText
                } : undefined, s.getAllResponseHeaders()))
              }
            }, s.onload = t(), s.onerror = t("error"), t = xhrCallbacks[o] = t("abort");
            try {
              s.send(e.hasContent && e.data || null)
            } catch (u) {
              if (t) throw u
            }
          },
          abort: function() {
            t && t()
          }
        }
      }), jQuery.ajaxSetup({
        accepts: {
          script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
          script: /(?:java|ecma)script/
        },
        converters: {
          "text script": function(e) {
            return jQuery.globalEval(e), e
          }
        }
      }), jQuery.ajaxPrefilter("script", function(e) {
        e.cache === undefined && (e.cache = !1), e.crossDomain && (e.type = "GET")
      }), jQuery.ajaxTransport("script", function(e) {
        if (e.crossDomain) {
          var t, n;
          return {
            send: function(r, i) {
              t = jQuery("<script>").prop({
                async: !0,
                charset: e.scriptCharset,
                src: e.url
              }).on("load error", n = function(e) {
                t.remove(), n = null, e && i(e.type === "error" ? 404 : 200, e.type)
              }), document.head.appendChild(t[0])
            },
            abort: function() {
              n && n()
            }
          }
        }
      });
      var oldCallbacks = [],
        rjsonp = /(=)\?(?=&|$)|\?\?/;
      jQuery.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
          var e = oldCallbacks.pop() || jQuery.expando + "_" + nonce++;
          return this[e] = !0, e
        }
      }), jQuery.ajaxPrefilter("json jsonp", function(e, t, n) {
        var r, i, s, o = e.jsonp !== !1 && (rjsonp.test(e.url) ? "url" : typeof e.data == "string" && !(e.contentType || "").indexOf("application/x-www-form-urlencoded") && rjsonp.test(e.data) && "data");
        if (o || e.dataTypes[0] === "jsonp") return r = e.jsonpCallback = jQuery.isFunction(e.jsonpCallback) ? e.jsonpCallback() : e.jsonpCallback, o ? e[o] = e[o].replace(rjsonp, "$1" + r) : e.jsonp !== !1 && (e.url += (rquery.test(e.url) ? "&" : "?") + e.jsonp + "=" + r), e.converters["script json"] = function() {
          return s || jQuery.error(r + " was not called"), s[0]
        }, e.dataTypes[0] = "json", i = window[r], window[r] = function() {
          s = arguments
        }, n.always(function() {
          window[r] = i, e[r] && (e.jsonpCallback = t.jsonpCallback, oldCallbacks.push(r)), s && jQuery.isFunction(i) && i(s[0]), s = i = undefined
        }), "script"
      }), jQuery.parseHTML = function(e, t, n) {
        if (!e || typeof e != "string") return null;
        typeof t == "boolean" && (n = t, t = !1), t = t || document;
        var r = rsingleTag.exec(e),
          i = !n && [];
        return r ? [t.createElement(r[1])] : (r = jQuery.buildFragment([e], t, i), i && i.length && jQuery(i).remove(), jQuery.merge([], r.childNodes))
      };
      var _load = jQuery.fn.load;
      jQuery.fn.load = function(e, t, n) {
        if (typeof e != "string" && _load) return _load.apply(this, arguments);
        var r, i, s, o = this,
          u = e.indexOf(" ");
        return u >= 0 && (r = jQuery.trim(e.slice(u)), e = e.slice(0, u)), jQuery.isFunction(t) ? (n = t, t = undefined) : t && typeof t == "object" && (i = "POST"), o.length > 0 && jQuery.ajax({
          url: e,
          type: i,
          dataType: "html",
          data: t
        }).done(function(e) {
          s = arguments, o.html(r ? jQuery("<div>").append(jQuery.parseHTML(e)).find(r) : e)
        }).complete(n && function(e, t) {
          o.each(n, s || [e.responseText, t, e])
        }), this
      };
      var docElem = window.document.documentElement;
      jQuery.offset = {
        setOffset: function(e, t, n) {
          var r, i, s, o, u, a, f, l = jQuery.css(e, "position"),
            c = jQuery(e),
            h = {};
          l === "static" && (e.style.position = "relative"), u = c.offset(), s = jQuery.css(e, "top"), a = jQuery.css(e, "left"), f = (l === "absolute" || l === "fixed") && (s + a).indexOf("auto") > -1, f ? (r = c.position(), o = r.top, i = r.left) : (o = parseFloat(s) || 0, i = parseFloat(a) || 0), jQuery.isFunction(t) && (t = t.call(e, n, u)), t.top != null && (h.top = t.top - u.top + o), t.left != null && (h.left = t.left - u.left + i), "using" in t ? t.using.call(e, h) : c.css(h)
        }
      }, jQuery.fn.extend({
        offset: function(e) {
          if (arguments.length) return e === undefined ? this : this.each(function(t) {
            jQuery.offset.setOffset(this, e, t)
          });
          var t, n, r = this[0],
            i = {
              top: 0,
              left: 0
            },
            s = r && r.ownerDocument;
          if (!s) return;
          return t = s.documentElement, jQuery.contains(t, r) ? (typeof r.getBoundingClientRect !== strundefined && (i = r.getBoundingClientRect()), n = getWindow(s), {
            top: i.top + n.pageYOffset - t.clientTop,
            left: i.left + n.pageXOffset - t.clientLeft
          }) : i
        },
        position: function() {
          if (!this[0]) return;
          var e, t, n = this[0],
            r = {
              top: 0,
              left: 0
            };
          return jQuery.css(n, "position") === "fixed" ? t = n.getBoundingClientRect() : (e = this.offsetParent(), t = this.offset(), jQuery.nodeName(e[0], "html") || (r = e.offset()), r.top += jQuery.css(e[0], "borderTopWidth", !0), r.left += jQuery.css(e[0], "borderLeftWidth", !0)), {
            top: t.top - r.top - jQuery.css(n, "marginTop", !0),
            left: t.left - r.left - jQuery.css(n, "marginLeft", !0)
          }
        },
        offsetParent: function() {
          return this.map(function() {
            var e = this.offsetParent || docElem;
            while (e && !jQuery.nodeName(e, "html") && jQuery.css(e, "position") === "static") e = e.offsetParent;
            return e || docElem
          })
        }
      }), jQuery.each({
        scrollLeft: "pageXOffset",
        scrollTop: "pageYOffset"
      }, function(e, t) {
        var n = "pageYOffset" === t;
        jQuery.fn[e] = function(r) {
          return access(this, function(e, r, i) {
            var s = getWindow(e);
            if (i === undefined) return s ? s[t] : e[r];
            s ? s.scrollTo(n ? window.pageXOffset : i, n ? i : window.pageYOffset) : e[r] = i
          }, e, r, arguments.length, null)
        }
      }), jQuery.each(["top", "left"], function(e, t) {
        jQuery.cssHooks[t] = addGetHookIf(support.pixelPosition, function(e, n) {
          if (n) return n = curCSS(e, t), rnumnonpx.test(n) ? jQuery(e).position()[t] + "px" : n
        })
      }), jQuery.each({
        Height: "height",
        Width: "width"
      }, function(e, t) {
        jQuery.each({
          padding: "inner" + e,
          content: t,
          "": "outer" + e
        }, function(n, r) {
          jQuery.fn[r] = function(r, i) {
            var s = arguments.length && (n || typeof r != "boolean"),
              o = n || (r === !0 || i === !0 ? "margin" : "border");
            return access(this, function(t, n, r) {
              var i;
              return jQuery.isWindow(t) ? t.document.documentElement["client" + e] : t.nodeType === 9 ? (i = t.documentElement, Math.max(t.body["scroll" + e], i["scroll" + e], t.body["offset" + e], i["offset" + e], i["client" + e])) : r === undefined ? jQuery.css(t, n, o) : jQuery.style(t, n, r, o)
            }, t, s ? r : undefined, s, null)
          }
        })
      }), jQuery.fn.size = function() {
        return this.length
      }, jQuery.fn.andSelf = jQuery.fn.addBack;
      var _jQuery = window.jQuery,
        _$ = window.$;
      return jQuery.noConflict = function(e) {
        return window.$ === jQuery && (window.$ = _$), e && window.jQuery === jQuery && (window.jQuery = _jQuery), jQuery
      }, typeof noGlobal === strundefined && (window.jQuery = window.$ = jQuery), jQuery
    }),
    function() {
      function a(e, t) {
        return RegExp.prototype.test.call(e, t)
      }

      function f(e) {
        return !a(i, e)
      }

      function c(e) {
        return e.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&")
      }

      function p(e) {
        return String(e).replace(/[&<>"'\/]/g, function(e) {
          return h[e]
        })
      }

      function d(e) {
        this.string = e, this.tail = e, this.pos = 0
      }

      function v(e, t) {
        this.view = e, this.parent = t, this.clearCache()
      }

      function m() {
        this.clearCache()
      }

      function g(e) {
        var t = e[3],
          n = t,
          r;
        while ((r = e[4]) && r.length) e = r[r.length - 1], n = e[3];
        return [t, n]
      }

      function y(e) {
        function n(e, n, r) {
          if (!t[e]) {
            var i = y(n);
            t[e] = function(e, t) {
              return i(e, t, r)
            }
          }
          return t[e]
        }
        var t = {};
        return function(t, r, i) {
          var s = "",
            o, u;
          for (var a = 0, f = e.length; a < f; ++a) {
            o = e[a];
            switch (o[0]) {
              case "#":
                u = i.slice.apply(i, g(o)), s += t._section(o[1], r, u, n(a, o[4], i));
                break;
              case "^":
                s += t._inverted(o[1], r, n(a, o[4], i));
                break;
              case ">":
                s += t._partial(o[1], r);
                break;
              case "&":
                s += t._name(o[1], r);
                break;
              case "name":
                s += t._escaped(o[1], r);
                break;
              case "text":
                s += o[1]
            }
          }
          return s
        }
      }

      function b(e) {
        var t = [],
          n = t,
          r = [],
          i, s;
        for (var o = 0; o < e.length; ++o) {
          i = e[o];
          switch (i[0]) {
            case "#":
            case "^":
              i[4] = [], r.push(i), n.push(i), n = i[4];
              break;
            case "/":
              if (r.length === 0) throw new Error("Unopened section: " + i[1]);
              s = r.pop();
              if (s[1] !== i[1]) throw new Error("Unclosed section: " + s[1]);
              r.length > 0 ? n = r[r.length - 1][4] : n = t;
              break;
            default:
              n.push(i)
          }
        }
        s = r.pop();
        if (s) throw new Error("Unclosed section: " + s[1]);
        return t
      }

      function w(e) {
        var t, n;
        for (var r = 0; r < e.length; ++r) t = e[r], n && n[0] === "text" && t[0] === "text" ? (n[1] += t[1], n[3] = t[3], e.splice(r--, 1)) : n = t
      }

      function E(e) {
        if (e.length !== 2) throw new Error("Invalid tags: " + e.join(" "));
        return [new RegExp(c(e[0]) + "\\s*"), new RegExp("\\s*" + c(e[1]))]
      }
      var e = window.Mustache,
        t = {};
      t.name = "mustache.js", t.version = "0.7.0", t.tags = ["{{", "}}"], t.Scanner = d, t.Context = v, t.Writer = m, t.noConflict = function() {
        var t = window.Mustache;
        return window.Mustache = e, t
      };
      var n = /\s*/,
        r = /\s+/,
        i = /\S/,
        s = /\s*=/,
        o = /\s*\}/,
        u = /#|\^|\/|>|\{|&|=|!/,
        l = Array.isArray || function(e) {
          return Object.prototype.toString.call(e) === "[object Array]"
        },
        h = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
          "/": "&#x2F;"
        };
      t.escape = p, d.prototype.eos = function() {
        return this.tail === ""
      }, d.prototype.scan = function(e) {
        var t = this.tail.match(e);
        return t && t.index === 0 ? (this.tail = this.tail.substring(t[0].length), this.pos += t[0].length, t[0]) : ""
      }, d.prototype.scanUntil = function(e) {
        var t, n = this.tail.search(e);
        switch (n) {
          case -1:
            t = this.tail, this.pos += this.tail.length, this.tail = "";
            break;
          case 0:
            t = "";
            break;
          default:
            t = this.tail.substring(0, n), this.tail = this.tail.substring(n), this.pos += n
        }
        return t
      }, v.make = function(e) {
        return e instanceof v ? e : new v(e)
      }, v.prototype.clearCache = function() {
        this._cache = {}
      }, v.prototype.push = function(e) {
        return new v(e, this)
      }, v.prototype.lookup = function(e) {
        var t = this._cache[e];
        if (!t) {
          if (e === ".") t = this.view;
          else {
            var n = this;
            while (n) {
              if (e.indexOf(".") > 0) {
                var r = e.split("."),
                  i = 0;
                t = n.view;
                while (t && i < r.length) t = t[r[i++]]
              } else t = n.view[e]; if (t != null) break;
              n = n.parent
            }
          }
          this._cache[e] = t
        }
        return typeof t == "function" && (t = t.call(this.view)), t
      }, m.prototype.clearCache = function() {
        this._cache = {}, this._partialCache = {}
      }, m.prototype.compile = function(e, n) {
        var r = this._cache[e];
        if (!r) {
          var i = t.parse(e, n);
          r = this._cache[e] = this.compileTokens(i, e)
        }
        return r
      }, m.prototype.compilePartial = function(e, t, n) {
        var r = this.compile(t, n);
        return this._partialCache[e] = r, r
      }, m.prototype.compileTokens = function(e, t) {
        var n = y(e),
          r = this;
        return function(e, i) {
          if (i)
            if (typeof i == "function") r._loadPartial = i;
            else
              for (var s in i) r.compilePartial(s, i[s]);
          return n(r, v.make(e), t)
        }
      }, m.prototype.render = function(e, t, n) {
        return this.compile(e)(t, n)
      }, m.prototype._section = function(e, t, n, r) {
        var i = t.lookup(e);
        switch (typeof i) {
          case "object":
            if (l(i)) {
              var s = "";
              for (var o = 0, u = i.length; o < u; ++o) s += r(this, t.push(i[o]));
              return s
            }
            return i ? r(this, t.push(i)) : "";
          case "function":
            var a = this,
              f = function(e) {
                return a.render(e, t)
              };
            return i.call(t.view, n, f) || "";
          default:
            if (i) return r(this, t)
        }
        return ""
      }, m.prototype._inverted = function(e, t, n) {
        var r = t.lookup(e);
        return !r || l(r) && r.length === 0 ? n(this, t) : ""
      }, m.prototype._partial = function(e, t) {
        !(e in this._partialCache) && this._loadPartial && this.compilePartial(e, this._loadPartial(e));
        var n = this._partialCache[e];
        return n ? n(t) : ""
      }, m.prototype._name = function(e, t) {
        var n = t.lookup(e);
        return typeof n == "function" && (n = n.call(t.view)), n == null ? "" : String(n)
      }, m.prototype._escaped = function(e, n) {
        return t.escape(this._name(e, n))
      }, t.parse = function(e, i) {
        function g() {
          if (v && !m)
            while (p.length) h.splice(p.pop(), 1);
          else p = [];
          v = !1, m = !1
        }
        i = i || t.tags;
        var a = E(i),
          l = new d(e),
          h = [],
          p = [],
          v = !1,
          m = !1,
          y, S, x, T;
        while (!l.eos()) {
          y = l.pos, x = l.scanUntil(a[0]);
          if (x)
            for (var N = 0, C = x.length; N < C; ++N) T = x.charAt(N), f(T) ? p.push(h.length) : m = !0, h.push(["text", T, y, y + 1]), y += 1, T === "\n" && g();
          y = l.pos;
          if (!l.scan(a[0])) break;
          v = !0, S = l.scan(u) || "name", l.scan(n);
          if (S === "=") x = l.scanUntil(s), l.scan(s), l.scanUntil(a[1]);
          else if (S === "{") {
            var k = new RegExp("\\s*" + c("}" + i[1]));
            x = l.scanUntil(k), l.scan(o), l.scanUntil(a[1]), S = "&"
          } else x = l.scanUntil(a[1]); if (!l.scan(a[1])) throw new Error("Unclosed tag at " + l.pos);
          h.push([S, x, y, l.pos]);
          if (S === "name" || S === "{" || S === "&") m = !0;
          S === "=" && (i = x.split(r), a = E(i))
        }
        return w(h), b(h)
      };
      var S = new m;
      t.clearCache = function() {
        return S.clearCache()
      }, t.compile = function(e, t) {
        return S.compile(e, t)
      }, t.compilePartial = function(e, t, n) {
        return S.compilePartial(e, t, n)
      }, t.compileTokens = function(e, t) {
        return S.compileTokens(e, t)
      }, t.render = function(e, t, n) {
        return S.render(e, t, n)
      }, t.to_html = function(e, n, r, i) {
        var s = t.render(e, n, r);
        if (typeof i != "function") return s;
        i(s)
      }, window.Mustache = t
    }(),
    function() {
      var e = window.UUID,
        t = function() {};
      t.noConflict = function() {
        var t = window.UUID;
        return window.UUID = e, t
      }, t.generate = function() {
        var e = t._getRandomInt,
          n = t._hexAligner;
        return n(e(32), 8) + "-" + n(e(16), 4) + "-" + n(16384 | e(12), 4) + "-" + n(32768 | e(14), 4) + "-" + n(e(48), 12)
      }, t._getRandomInt = function(e) {
        return e < 0 ? NaN : e <= 30 ? 0 | Math.random() * (1 << e) : e <= 53 ? (0 | Math.random() * (1 << 30)) + (0 | Math.random() * (1 << e - 30)) * (1 << 30) : NaN
      }, t._getIntAligner = function(e) {
        return function(t, n) {
          var r = t.toString(e),
            i = n - r.length,
            s = "0";
          for (; i > 0; i >>>= 1, s += s) i & 1 && (r = s + r);
          return r
        }
      }, t._hexAligner = t._getIntAligner(16), t.FIELD_NAMES = ["timeLow", "timeMid", "timeHiAndVersion", "clockSeqHiAndReserved", "clockSeqLow", "node"], t.FIELD_SIZES = [32, 16, 16, 8, 8, 48], t.genV4 = function() {
        var e = t._getRandomInt;
        return (new t)._init(e(32), e(16), 16384 | e(12), 128 | e(6), e(8), e(48))
      }, t.parse = function(e) {
        var n, r = /^(?:urn:uuid:|\{)?([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{2})([0-9a-f]{2})-([0-9a-f]{12})(?:\})?$/i;
        return (n = r.exec(e)) ? (new t)._init(parseInt(n[1], 16), parseInt(n[2], 16), parseInt(n[3], 16), parseInt(n[4], 16), parseInt(n[5], 16), parseInt(n[6], 16)) : null
      }, t.prototype._init = function() {
        var e = t.FIELD_NAMES,
          n = t.FIELD_SIZES,
          r = t._binAligner,
          i = t._hexAligner;
        this.intFields = new Array(6), this.bitFields = new Array(6), this.hexFields = new Array(6);
        for (var s = 0; s < 6; s++) {
          var o = parseInt(arguments[s] || 0);
          this.intFields[s] = this.intFields[e[s]] = o, this.bitFields[s] = this.bitFields[e[s]] = r(o, n[s]), this.hexFields[s] = this.hexFields[e[s]] = i(o, n[s] / 4)
        }
        return this.version = this.intFields.timeHiAndVersion >> 12 & 15, this.bitString = this.bitFields.join(""), this.hexString = this.hexFields[0] + "-" + this.hexFields[1] + "-" + this.hexFields[2] + "-" + this.hexFields[3] + this.hexFields[4] + "-" + this.hexFields[5], this.urn = "urn:uuid:" + this.hexString, this
      }, t._binAligner = t._getIntAligner(2), t.prototype.toString = function() {
        return this.hexString
      }, t.prototype.equals = function(e) {
        if (e instanceof t) {
          for (var n = 0; n < 6; n++)
            if (this.intFields[n] !== e.intFields[n]) return !1;
          return !0
        }
        return !1
      }, t.genV1 = function() {
        var e = (new Date).getTime(),
          n = t._state;
        e != n.timestamp ? (e < n.timestamp && n.sequence++, n.timestamp = e, n.tick = t._getRandomInt(4)) : Math.random() < t._tsRatio && n.tick < 9984 ? n.tick += 1 + t._getRandomInt(4) : n.sequence++;
        var r = t._getTimeFieldValues(n.timestamp),
          i = r.low + n.tick,
          s = r.hi & 4095 | 4096;
        n.sequence &= 16383;
        var o = n.sequence >>> 8 | 128,
          u = n.sequence & 255;
        return (new t)._init(i, r.mid, s, o, u, n.node)
      }, t.resetState = function() {
        t._state = new t._state.constructor
      }, t._tsRatio = .25, t._state = new function() {
        var n = t._getRandomInt;
        this.timestamp = 0, this.sequence = n(14), this.node = (n(8) | 1) * 1099511627776 + n(40), this.tick = n(4)
      }, t._getTimeFieldValues = function(e) {
        var t = e - Date.UTC(1582, 9, 15),
          n = t / 4294967296 * 1e4 & 268435455;
        return {
          low: (t & 268435455) * 1e4 % 4294967296,
          mid: n & 65535,
          hi: n >>> 16,
          timestamp: t
        }
      }, t.makeBackwardCompatible = function() {
        var e = t.generate;
        t.generate = function(n) {
          return n && n.version == 1 ? t.genV1().hexString : e.call(t)
        }, t.makeBackwardCompatible = function() {}
      }, window.UUID = t
    }(), window.matchMedia || (window.matchMedia = function() {
        "use strict";
        var e = window.styleMedia || window.media;
        if (!e) {
          var t = document.createElement("style"),
            n = document.getElementsByTagName("script")[0],
            r = null;
          t.type = "text/css", t.id = "matchmediajs-test", n.parentNode.insertBefore(t, n), r = "getComputedStyle" in window && window.getComputedStyle(t, null) || t.currentStyle, e = {
            matchMedium: function(e) {
              var n = "@media " + e + "{ #matchmediajs-test { width: 1px; } }";
              return t.styleSheet ? t.styleSheet.cssText = n : t.textContent = n, r.width === "1px"
            }
          }
        }
        return function(t) {
          return {
            matches: e.matchMedium(t || "all"),
            media: t || "all"
          }
        }
      }()),
      function(e, t) {
        var n, r, i, s, o, u, a, f, l, c, h = t.createElement.bind(t),
          p = t.createTextNode.bind(t),
          d, v, m;
        r = h("span"),
          function(e) {
            e.position = "absolute", e.whiteSpace = "pre", e.visibility = "hidden"
          }(r.style), d = h("span"), v = h("span"), v.style.display = "block", v.style.overflow = "hidden", v.appendChild(p("â ")), n = function(e, n) {
            var g;
            if (!e.ownerDocument || !e.ownerDocument === t) return;
            o = a = 0, u = 1, c = !1, s = [], i = (e.textContent || e.innerText).replace(/\n/g, " ");
            for (g = 1; g < n; g++) m = v.cloneNode(!0), d.appendChild(m), g === 1 && (v.style.textIndent = 0);
            v.style.textIndent = "", m = void 0;
            while (e.firstChild) e.removeChild(e.firstChild);
            e.appendChild(d);
            for (g = 0; g < n - 1; g++) s.push(d.childNodes[g].clientWidth);
            e.removeChild(d);
            while (d.firstChild) d.removeChild(d.firstChild);
            e.appendChild(r), i.replace(/ /g, function(t, d) {
              if (u === n) return;
              r.appendChild(p(i.substr(o, d - o))), s[u - 1] <= r.clientWidth ? (c ? (l = i.substr(o, d + 1 - o), o = d + 1) : (l = i.substr(o, a - o), o = a), f = h("span"), f.appendChild(p(l)), e.appendChild(f), c = !0, u++) : c = !1, a = d + 1, r.removeChild(r.firstChild)
            }), e.removeChild(r), f = h("span"), u === n && function(e) {
              e.display = "block", e.overflow = "hidden", e.textIndent = 0, e.textOverflow = "ellipsis", e.whiteSpace = "nowrap"
            }(f.style), f.appendChild(p(i.substr(o))), e.appendChild(f)
          }, e.clamp = n
      }(window, window.document),
      function() {
        "use strickt";

        function o(e) {
          if (!(this instanceof o)) return new o(e);
          e || (e = {}), typeof e == "number" && (e = {
            frameRate: e
          }), e.useNative != null || (e.useNative = !0), this.options = e, this.frameRate = e.frameRate || o.FRAME_RATE, this._frameLength = 1e3 / this.frameRate, this._isCustomFrameRate = this.frameRate !== o.FRAME_RATE, this._timeoutId = null, this._callbacks = {}, this._lastTickTime = 0, this._tickCounter = 0
        }
        var e = function() {
            "use strict";
            var e, t = window;
            try {
              t.top.name, t = t.top
            } catch (n) {}
            e.request = t.requestAnimationFrame, e.cancel = t.cancelAnimationFrame || t.cancelRequestAnimationFrame, e.supported = !1;
            var r = ["Webkit", "Moz", "ms", "O"];
            for (var i = 0; i < r.length && !e.request; i++) e.request = t[r[i] + "RequestAnimationFrame"], e.cancel = t[r[i] + "CancelAnimationFrame"] || t[r[i] + "CancelRequestAnimationFrame"];
            return e.request && e.request.call(null, function() {
              e.supported = !0
            }), e
          },
          t = Date.now || function() {
            return (new Date).getTime()
          },
          n = {
            navigationStart: function() {
              t()
            }
          },
          r = {
            now: function() {
              return window.performance && window.performance.now ? window.performance.now() : t() - n.navigationStart
            }
          },
          i = e.request,
          s = e.cancel;
        o.FRAME_RATE = 60, o.shim = function(e) {
          var t = new o(e);
          return window.requestAnimationFrame = function(e) {
            return t.request(e)
          }, window.cancelAnimationFrame = function(e) {
            return t.cancel(e)
          }, t
        }, o.prototype.request = function(n) {
          var s = this;
          ++this._tickCounter;
          if (e.supported && this.options.useNative && !this._isCustomFrameRate) return i(n);
          if (!n) throw new TypeError("Not enough arguments");
          if (this._timeoutId == null) {
            var o = this._frameLength + this._lastTickTime - t();
            o < 0 && (o = 0), this._timeoutId = setTimeout(function() {
              s._lastTickTime = t(), s._timeoutId = null, ++s._tickCounter;
              var n = s._callbacks;
              s._callbacks = {};
              for (var o in n) n[o] && (e.supported && s.options.useNative ? i(n[o]) : n[o](r.now()))
            }, o)
          }
          return this._callbacks[this._tickCounter] = n, this._tickCounter
        }, o.prototype.cancel = function(t) {
          e.supported && this.options.useNative && s(t), delete this._callbacks[t]
        }, window.AnimationFrame = o
      }(),
      function() {
        STR.Vendor == null && (STR.Vendor = {}), STR.Vendor.$ = $.noConflict(!0), STR.Vendor.UUID = UUID.noConflict(), STR.Vendor.Mustache = Mustache.noConflict(), STR.Vendor.Clamp = clamp
      }.call(this), STR.Vendor.$ && STR.Vendor.$.extend(STR.Vendor.$.easing, {
        def: "easeOutQuad",
        swing: function(e, t, n, r, i) {
          return STR.Vendor.$.easing[STR.Vendor.$.easing.def](e, t, n, r, i)
        },
        easeOutQuad: function(e, t, n, r, i) {
          return -r * (t /= i) * (t - 2) + n
        },
        easeInOutQuint: function(e, t, n, r, i) {
          return (t /= i / 2) < 1 ? r / 2 * t * t * t * t * t + n : r / 2 * ((t -= 2) * t * t * t * t + 2) + n
        }
      }),
      function(e) {
        "use strict";
        e(STR.Vendor.$)
      }(function(e) {
        "use strict";
        var t = window.Slick || {};
        t = function() {
          function n(n, r) {
            var i = this,
              s;
            i.defaults = {
              accessibility: !0,
              adaptiveHeight: !1,
              appendArrows: e(n),
              appendDots: e(n),
              arrows: !0,
              asNavFor: null,
              prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="Previous" tabindex="0" role="button">Previous</button>',
              nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="Next" tabindex="0" role="button">Next</button>',
              autoplay: !1,
              autoplaySpeed: 3e3,
              centerMode: !1,
              centerPadding: "50px",
              cssEase: "ease",
              customPaging: function(t, n) {
                return e('<button type="button" data-role="none" role="button" tabindex="0" />').text(n + 1)
              },
              dots: !1,
              dotsClass: "slick-dots",
              draggable: !0,
              easing: "linear",
              edgeFriction: .35,
              fade: !1,
              focusOnSelect: !1,
              infinite: !0,
              initialSlide: 0,
              lazyLoad: "ondemand",
              mobileFirst: !1,
              pauseOnHover: !0,
              pauseOnFocus: !0,
              pauseOnDotsHover: !1,
              respondTo: "window",
              responsive: null,
              rows: 1,
              rtl: !1,
              slide: "",
              slidesPerRow: 1,
              slidesToShow: 1,
              slidesToScroll: 1,
              speed: 500,
              swipe: !0,
              swipeToSlide: !1,
              touchMove: !0,
              touchThreshold: 5,
              useCSS: !0,
              useTransform: !0,
              variableWidth: !1,
              vertical: !1,
              verticalSwiping: !1,
              waitForAnimate: !0,
              zIndex: 1e3
            }, i.initials = {
              animating: !1,
              dragging: !1,
              autoPlayTimer: null,
              currentDirection: 0,
              currentLeft: null,
              currentSlide: 0,
              direction: 1,
              $dots: null,
              listWidth: null,
              listHeight: null,
              loadIndex: 0,
              $nextArrow: null,
              $prevArrow: null,
              slideCount: null,
              slideWidth: null,
              $slideTrack: null,
              $slides: null,
              sliding: !1,
              slideOffset: 0,
              swipeLeft: null,
              $list: null,
              touchObject: {},
              transformsEnabled: !1,
              unslicked: !1
            }, e.extend(i, i.initials), i.activeBreakpoint = null, i.animType = null, i.animProp = null, i.breakpoints = [], i.breakpointSettings = [], i.cssTransitions = !1, i.focussed = !1, i.interrupted = !1, i.hidden = "hidden", i.paused = !0, i.positionProp = null, i.respondTo = null, i.rowCount = 1, i.shouldClick = !0, i.$slider = e(n), i.$slidesCache = null, i.transformType = null, i.transitionType = null, i.visibilityChange = "visibilitychange", i.windowWidth = 0, i.windowTimer = null, s = e(n).data("slick") || {}, i.options = e.extend({}, i.defaults, r, s), i.currentSlide = i.options.initialSlide, i.originalSettings = i.options, typeof document.mozHidden != "undefined" ? (i.hidden = "mozHidden", i.visibilityChange = "mozvisibilitychange") : typeof document.webkitHidden != "undefined" && (i.hidden = "webkitHidden", i.visibilityChange = "webkitvisibilitychange"), i.autoPlay = e.proxy(i.autoPlay, i), i.autoPlayClear = e.proxy(i.autoPlayClear, i), i.autoPlayIterator = e.proxy(i.autoPlayIterator, i), i.changeSlide = e.proxy(i.changeSlide, i), i.clickHandler = e.proxy(i.clickHandler, i), i.selectHandler = e.proxy(i.selectHandler, i), i.setPosition = e.proxy(i.setPosition, i), i.swipeHandler = e.proxy(i.swipeHandler, i), i.dragHandler = e.proxy(i.dragHandler, i), i.keyHandler = e.proxy(i.keyHandler, i), i.instanceUid = t++, i.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/, i.registerBreakpoints(), i.init(!0)
          }
          var t = 0;
          return n
        }(), t.prototype.activateADA = function() {
          var e = this;
          e.$slideTrack.find(".slick-active").attr({
            "aria-hidden": "false"
          }).find("a, input, button, select").attr({
            tabindex: "0"
          })
        }, t.prototype.addSlide = t.prototype.slickAdd = function(t, n, r) {
          var i = this;
          if (typeof n == "boolean") r = n, n = null;
          else if (n < 0 || n >= i.slideCount) return !1;
          i.unload(), typeof n == "number" ? n === 0 && i.$slides.length === 0 ? e(t).appendTo(i.$slideTrack) : r ? e(t).insertBefore(i.$slides.eq(n)) : e(t).insertAfter(i.$slides.eq(n)) : r === !0 ? e(t).prependTo(i.$slideTrack) : e(t).appendTo(i.$slideTrack), i.$slides = i.$slideTrack.children(this.options.slide), i.$slideTrack.children(this.options.slide).detach(), i.$slideTrack.append(i.$slides), i.$slides.each(function(t, n) {
            e(n).attr("data-slick-index", t)
          }), i.$slidesCache = i.$slides, i.reinit()
        }, t.prototype.animateHeight = function() {
          var e = this;
          if (e.options.slidesToShow === 1 && e.options.adaptiveHeight === !0 && e.options.vertical === !1) {
            var t = e.$slides.eq(e.currentSlide).outerHeight(!0);
            e.$list.animate({
              height: t
            }, e.options.speed)
          }
        }, t.prototype.animateSlide = function(t, n) {
          var r = {},
            i = this;
          i.animateHeight(), i.options.rtl === !0 && i.options.vertical === !1 && (t = -t), i.transformsEnabled === !1 ? i.options.vertical === !1 ? i.$slideTrack.animate({
            left: t
          }, i.options.speed, i.options.easing, n) : i.$slideTrack.animate({
            top: t
          }, i.options.speed, i.options.easing, n) : i.cssTransitions === !1 ? (i.options.rtl === !0 && (i.currentLeft = -i.currentLeft), e({
            animStart: i.currentLeft
          }).animate({
            animStart: t
          }, {
            duration: i.options.speed,
            easing: i.options.easing,
            step: function(e) {
              e = Math.ceil(e), i.options.vertical === !1 ? (r[i.animType] = "translate(" + e + "px, 0px)", i.$slideTrack.css(r)) : (r[i.animType] = "translate(0px," + e + "px)", i.$slideTrack.css(r))
            },
            complete: function() {
              n && n.call()
            }
          })) : (i.applyTransition(), t = Math.ceil(t), i.options.vertical === !1 ? r[i.animType] = "translate3d(" + t + "px, 0px, 0px)" : r[i.animType] = "translate3d(0px," + t + "px, 0px)", i.$slideTrack.css(r), n && setTimeout(function() {
            i.disableTransition(), n.call()
          }, i.options.speed))
        }, t.prototype.getNavTarget = function() {
          var t = this,
            n = t.options.asNavFor;
          return n && n !== null && (n = e(n).not(t.$slider)), n
        }, t.prototype.asNavFor = function(t) {
          var n = this,
            r = n.getNavTarget();
          r !== null && typeof r == "object" && r.each(function() {
            var n = e(this).slick("getSlick");
            n.unslicked || n.slideHandler(t, !0)
          })
        }, t.prototype.applyTransition = function(e) {
          var t = this,
            n = {};
          t.options.fade === !1 ? n[t.transitionType] = t.transformType + " " + t.options.speed + "ms " + t.options.cssEase : n[t.transitionType] = "opacity " + t.options.speed + "ms " + t.options.cssEase, t.options.fade === !1 ? t.$slideTrack.css(n) : t.$slides.eq(e).css(n)
        }, t.prototype.autoPlay = function() {
          var e = this;
          e.autoPlayClear(), e.slideCount > e.options.slidesToShow && (e.autoPlayTimer = setInterval(e.autoPlayIterator, e.options.autoplaySpeed))
        }, t.prototype.autoPlayClear = function() {
          var e = this;
          e.autoPlayTimer && clearInterval(e.autoPlayTimer)
        }, t.prototype.autoPlayIterator = function() {
          var e = this,
            t = e.currentSlide + e.options.slidesToScroll;
          !e.paused && !e.interrupted && !e.focussed && (e.options.infinite === !1 && (e.direction === 1 && e.currentSlide + 1 === e.slideCount - 1 ? e.direction = 0 : e.direction === 0 && (t = e.currentSlide - e.options.slidesToScroll, e.currentSlide - 1 === 0 && (e.direction = 1))), e.slideHandler(t))
        }, t.prototype.buildArrows = function() {
          var t = this;
          t.options.arrows === !0 && (t.$prevArrow = e(t.options.prevArrow).addClass("slick-arrow"), t.$nextArrow = e(t.options.nextArrow).addClass("slick-arrow"), t.slideCount > t.options.slidesToShow ? (t.$prevArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"), t.$nextArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"), t.htmlExpr.test(t.options.prevArrow) && t.$prevArrow.prependTo(t.options.appendArrows), t.htmlExpr.test(t.options.nextArrow) && t.$nextArrow.appendTo(t.options.appendArrows), t.options.infinite !== !0 && t.$prevArrow.addClass("slick-disabled").attr("aria-disabled", "true")) : t.$prevArrow.add(t.$nextArrow).addClass("slick-hidden").attr({
            "aria-disabled": "true",
            tabindex: "-1"
          }))
        }, t.prototype.buildDots = function() {
          var t = this,
            n, r;
          if (t.options.dots === !0 && t.slideCount > t.options.slidesToShow) {
            t.$slider.addClass("slick-dotted"), r = e("<ul />").addClass(t.options.dotsClass);
            for (n = 0; n <= t.getDotCount(); n += 1) r.append(e("<li />").append(t.options.customPaging.call(this, t, n)));
            t.$dots = r.appendTo(t.options.appendDots), t.$dots.find("li").first().addClass("slick-active").attr("aria-hidden", "false")
          }
        }, t.prototype.buildOut = function() {
          var t = this;
          t.$slides = t.$slider.children(t.options.slide + ":not(.slick-cloned)").addClass("slick-slide"), t.slideCount = t.$slides.length, t.$slides.each(function(t, n) {
            e(n).attr("data-slick-index", t).data("originalStyling", e(n).attr("style") || "")
          }), t.$slider.addClass("slick-slider"), t.$slideTrack = t.slideCount === 0 ? e('<div class="slick-track"/>').appendTo(t.$slider) : t.$slides.wrapAll('<div class="slick-track"/>').parent(), t.$list = t.$slideTrack.wrap('<div aria-live="polite" class="slick-list"/>').parent(), t.$slideTrack.css("opacity", 0);
          if (t.options.centerMode === !0 || t.options.swipeToSlide === !0) t.options.slidesToScroll = 1;
          e("img[data-lazy]", t.$slider).not("[src]").addClass("slick-loading"), t.setupInfinite(), t.buildArrows(), t.buildDots(), t.updateDots(), t.setSlideClasses(typeof t.currentSlide == "number" ? t.currentSlide : 0), t.options.draggable === !0 && t.$list.addClass("draggable")
        }, t.prototype.buildRows = function() {
          var e = this,
            t, n, r, i, s, o, u;
          i = document.createDocumentFragment(), o = e.$slider.children();
          if (e.options.rows > 1) {
            u = e.options.slidesPerRow * e.options.rows, s = Math.ceil(o.length / u);
            for (t = 0; t < s; t++) {
              var a = document.createElement("div");
              for (n = 0; n < e.options.rows; n++) {
                var f = document.createElement("div");
                for (r = 0; r < e.options.slidesPerRow; r++) {
                  var l = t * u + (n * e.options.slidesPerRow + r);
                  o.get(l) && f.appendChild(o.get(l))
                }
                a.appendChild(f)
              }
              i.appendChild(a)
            }
            e.$slider.empty().append(i), e.$slider.children().children().children().css({
              width: 100 / e.options.slidesPerRow + "%",
              display: "inline-block"
            })
          }
        }, t.prototype.checkResponsive = function(t, n) {
          var r = this,
            i, s, o, u = !1,
            a = r.$slider.width(),
            f = window.innerWidth || e(window).width();
          r.respondTo === "window" ? o = f : r.respondTo === "slider" ? o = a : r.respondTo === "min" && (o = Math.min(f, a));
          if (r.options.responsive && r.options.responsive.length && r.options.responsive !== null) {
            s = null;
            for (i in r.breakpoints) r.breakpoints.hasOwnProperty(i) && (r.originalSettings.mobileFirst === !1 ? o < r.breakpoints[i] && (s = r.breakpoints[i]) : o > r.breakpoints[i] && (s = r.breakpoints[i]));
            if (s !== null)
              if (r.activeBreakpoint !== null) {
                if (s !== r.activeBreakpoint || n) r.activeBreakpoint = s, r.breakpointSettings[s] === "unslick" ? r.unslick(s) : (r.options = e.extend({}, r.originalSettings, r.breakpointSettings[s]), t === !0 && (r.currentSlide = r.options.initialSlide), r.refresh(t)), u = s
              } else r.activeBreakpoint = s, r.breakpointSettings[s] === "unslick" ? r.unslick(s) : (r.options = e.extend({}, r.originalSettings, r.breakpointSettings[s]), t === !0 && (r.currentSlide = r.options.initialSlide), r.refresh(t)), u = s;
            else r.activeBreakpoint !== null && (r.activeBreakpoint = null, r.options = r.originalSettings, t === !0 && (r.currentSlide = r.options.initialSlide), r.refresh(t), u = s);
            !t && u !== !1 && r.$slider.trigger("breakpoint", [r, u])
          }
        }, t.prototype.changeSlide = function(t, n) {
          var r = this,
            i = e(t.currentTarget),
            s, o, u;
          i.is("a") && t.preventDefault(), i.is("li") || (i = i.closest("li")), u = r.slideCount % r.options.slidesToScroll !== 0, s = u ? 0 : (r.slideCount - r.currentSlide) % r.options.slidesToScroll;
          switch (t.data.message) {
            case "previous":
              o = s === 0 ? r.options.slidesToScroll : r.options.slidesToShow - s, r.slideCount > r.options.slidesToShow && r.slideHandler(r.currentSlide - o, !1, n);
              break;
            case "next":
              o = s === 0 ? r.options.slidesToScroll : s, r.slideCount > r.options.slidesToShow && r.slideHandler(r.currentSlide + o, !1, n);
              break;
            case "index":
              var a = t.data.index === 0 ? 0 : t.data.index || i.index() * r.options.slidesToScroll;
              r.slideHandler(r.checkNavigable(a), !1, n), i.children().trigger("focus");
              break;
            default:
              return
          }
        }, t.prototype.checkNavigable = function(e) {
          var t = this,
            n, r;
          n = t.getNavigableIndexes(), r = 0;
          if (e > n[n.length - 1]) e = n[n.length - 1];
          else
            for (var i in n) {
              if (e < n[i]) {
                e = r;
                break
              }
              r = n[i]
            }
          return e
        }, t.prototype.cleanUpEvents = function() {
          var t = this;
          t.options.dots && t.$dots !== null && e("li", t.$dots).off("click.slick", t.changeSlide).off("mouseenter.slick", e.proxy(t.interrupt, t, !0)).off("mouseleave.slick", e.proxy(t.interrupt, t, !1)), t.$slider.off("focus.slick blur.slick"), t.options.arrows === !0 && t.slideCount > t.options.slidesToShow && (t.$prevArrow && t.$prevArrow.off("click.slick", t.changeSlide), t.$nextArrow && t.$nextArrow.off("click.slick", t.changeSlide)), t.$list.off("touchstart.slick mousedown.slick", t.swipeHandler), t.$list.off("touchmove.slick mousemove.slick", t.swipeHandler), t.$list.off("touchend.slick mouseup.slick", t.swipeHandler), t.$list.off("touchcancel.slick mouseleave.slick", t.swipeHandler), t.$list.off("click.slick", t.clickHandler), e(document).off(t.visibilityChange, t.visibility), t.cleanUpSlideEvents(), t.options.accessibility === !0 && t.$list.off("keydown.slick", t.keyHandler), t.options.focusOnSelect === !0 && e(t.$slideTrack).children().off("click.slick", t.selectHandler), e(window).off("orientationchange.slick.slick-" + t.instanceUid, t.orientationChange), e(window).off("resize.slick.slick-" + t.instanceUid, t.resize), e(window).off("load.slick.slick-" + t.instanceUid, t.setPosition), e(document).off("ready.slick.slick-" + t.instanceUid, t.setPosition)
        }, t.prototype.cleanUpSlideEvents = function() {
          var t = this;
          t.$list.off("mouseenter.slick", e.proxy(t.interrupt, t, !0)), t.$list.off("mouseleave.slick", e.proxy(t.interrupt, t, !1))
        }, t.prototype.cleanUpRows = function() {
          var e = this,
            t;
          e.options.rows > 1 && (t = e.$slides.children().children(), t.removeAttr("style"), e.$slider.empty().append(t))
        }, t.prototype.clickHandler = function(e) {
          var t = this;
          t.shouldClick === !1 && (e.stopImmediatePropagation(), e.stopPropagation(), e.preventDefault())
        }, t.prototype.destroy = function(t) {
          var n = this;
          n.autoPlayClear(), n.touchObject = {}, n.cleanUpEvents(), e(".slick-cloned", n.$slider).detach(), n.$dots && n.$dots.remove(), n.$prevArrow && n.$prevArrow.length && (n.$prevArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display", ""), n.htmlExpr.test(n.options.prevArrow) && n.$prevArrow.remove()), n.$nextArrow && n.$nextArrow.length && (n.$nextArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display", ""), n.htmlExpr.test(n.options.nextArrow) && n.$nextArrow.remove()), n.$slides && (n.$slides.removeClass("slick-slide slick-active slick-center slick-visible slick-current").removeAttr("aria-hidden").removeAttr("data-slick-index").each(function() {
            e(this).attr("style", e(this).data("originalStyling"))
          }), n.$slideTrack.children(this.options.slide).detach(), n.$slideTrack.detach(), n.$list.detach(), n.$slider.append(n.$slides)), n.cleanUpRows(), n.$slider.removeClass("slick-slider"), n.$slider.removeClass("slick-initialized"), n.$slider.removeClass("slick-dotted"), n.unslicked = !0, t || n.$slider.trigger("destroy", [n])
        }, t.prototype.disableTransition = function(e) {
          var t = this,
            n = {};
          n[t.transitionType] = "", t.options.fade === !1 ? t.$slideTrack.css(n) : t.$slides.eq(e).css(n)
        }, t.prototype.fadeSlide = function(e, t) {
          var n = this;
          n.cssTransitions === !1 ? (n.$slides.eq(e).css({
            zIndex: n.options.zIndex
          }), n.$slides.eq(e).animate({
            opacity: 1
          }, n.options.speed, n.options.easing, t)) : (n.applyTransition(e), n.$slides.eq(e).css({
            opacity: 1,
            zIndex: n.options.zIndex
          }), t && setTimeout(function() {
            n.disableTransition(e), t.call()
          }, n.options.speed))
        }, t.prototype.fadeSlideOut = function(e) {
          var t = this;
          t.cssTransitions === !1 ? t.$slides.eq(e).animate({
            opacity: 0,
            zIndex: t.options.zIndex - 2
          }, t.options.speed, t.options.easing) : (t.applyTransition(e), t.$slides.eq(e).css({
            opacity: 0,
            zIndex: t.options.zIndex - 2
          }))
        }, t.prototype.filterSlides = t.prototype.slickFilter = function(e) {
          var t = this;
          e !== null && (t.$slidesCache = t.$slides, t.unload(), t.$slideTrack.children(this.options.slide).detach(), t.$slidesCache.filter(e).appendTo(t.$slideTrack), t.reinit())
        }, t.prototype.focusHandler = function() {
          var t = this;
          t.$slider.off("focus.slick blur.slick").on("focus.slick blur.slick", "*:not(.slick-arrow)", function(n) {
            n.stopImmediatePropagation();
            var r = e(this);
            setTimeout(function() {
              t.options.pauseOnFocus && (t.focussed = r.is(":focus"), t.autoPlay())
            }, 0)
          })
        }, t.prototype.getCurrent = t.prototype.slickCurrentSlide = function() {
          var e = this;
          return e.currentSlide
        }, t.prototype.getDotCount = function() {
          var e = this,
            t = 0,
            n = 0,
            r = 0;
          if (e.options.infinite === !0)
            while (t < e.slideCount)++r, t = n + e.options.slidesToScroll, n += e.options.slidesToScroll <= e.options.slidesToShow ? e.options.slidesToScroll : e.options.slidesToShow;
          else if (e.options.centerMode === !0) r = e.slideCount;
          else if (!e.options.asNavFor) r = 1 + Math.ceil((e.slideCount - e.options.slidesToShow) / e.options.slidesToScroll);
          else
            while (t < e.slideCount)++r, t = n + e.options.slidesToScroll, n += e.options.slidesToScroll <= e.options.slidesToShow ? e.options.slidesToScroll : e.options.slidesToShow;
          return r - 1
        }, t.prototype.getLeft = function(e) {
          var t = this,
            n, r, i = 0,
            s;
          return t.slideOffset = 0, r = t.$slides.first().outerHeight(!0), t.options.infinite === !0 ? (t.slideCount > t.options.slidesToShow && (t.slideOffset = t.slideWidth * t.options.slidesToShow * -1, i = r * t.options.slidesToShow * -1), t.slideCount % t.options.slidesToScroll !== 0 && e + t.options.slidesToScroll > t.slideCount && t.slideCount > t.options.slidesToShow && (e > t.slideCount ? (t.slideOffset = (t.options.slidesToShow - (e - t.slideCount)) * t.slideWidth * -1, i = (t.options.slidesToShow - (e - t.slideCount)) * r * -1) : (t.slideOffset = t.slideCount % t.options.slidesToScroll * t.slideWidth * -1, i = t.slideCount % t.options.slidesToScroll * r * -1))) : e + t.options.slidesToShow > t.slideCount && (t.slideOffset = (e + t.options.slidesToShow - t.slideCount) * t.slideWidth, i = (e + t.options.slidesToShow - t.slideCount) * r), t.slideCount <= t.options.slidesToShow && (t.slideOffset = 0, i = 0), t.options.centerMode === !0 && t.options.infinite === !0 ? t.slideOffset += t.slideWidth * Math.floor(t.options.slidesToShow / 2) - t.slideWidth : t.options.centerMode === !0 && (t.slideOffset = 0, t.slideOffset += t.slideWidth * Math.floor(t.options.slidesToShow / 2)), t.options.vertical === !1 ? n = e * t.slideWidth * -1 + t.slideOffset : n = e * r * -1 + i, t.options.variableWidth === !0 && (t.slideCount <= t.options.slidesToShow || t.options.infinite === !1 ? s = t.$slideTrack.children(".slick-slide").eq(e) : s = t.$slideTrack.children(".slick-slide").eq(e + t.options.slidesToShow), t.options.rtl === !0 ? s[0] ? n = (t.$slideTrack.width() - s[0].offsetLeft - s.width()) * -1 : n = 0 : n = s[0] ? s[0].offsetLeft * -1 : 0, t.options.centerMode === !0 && (t.slideCount <= t.options.slidesToShow || t.options.infinite === !1 ? s = t.$slideTrack.children(".slick-slide").eq(e) : s = t.$slideTrack.children(".slick-slide").eq(e + t.options.slidesToShow + 1), t.options.rtl === !0 ? s[0] ? n = (t.$slideTrack.width() - s[0].offsetLeft - s.width()) * -1 : n = 0 : n = s[0] ? s[0].offsetLeft * -1 : 0, n += (t.$list.width() - s.outerWidth()) / 2)), n
        }, t.prototype.getOption = t.prototype.slickGetOption = function(e) {
          var t = this;
          return t.options[e]
        }, t.prototype.getNavigableIndexes = function() {
          var e = this,
            t = 0,
            n = 0,
            r = [],
            i;
          e.options.infinite === !1 ? i = e.slideCount : (t = e.options.slidesToScroll * -1, n = e.options.slidesToScroll * -1, i = e.slideCount * 2);
          while (t < i) r.push(t), t = n + e.options.slidesToScroll, n += e.options.slidesToScroll <= e.options.slidesToShow ? e.options.slidesToScroll : e.options.slidesToShow;
          return r
        }, t.prototype.getSlick = function() {
          return this
        }, t.prototype.getSlideCount = function() {
          var t = this,
            n, r, i;
          return i = t.options.centerMode === !0 ? t.slideWidth * Math.floor(t.options.slidesToShow / 2) : 0, t.options.swipeToSlide === !0 ? (t.$slideTrack.find(".slick-slide").each(function(n, s) {
            if (s.offsetLeft - i + e(s).outerWidth() / 2 > t.swipeLeft * -1) return r = s, !1
          }), n = Math.abs(e(r).attr("data-slick-index") - t.currentSlide) || 1, n) : t.options.slidesToScroll
        }, t.prototype.goTo = t.prototype.slickGoTo = function(e, t) {
          var n = this;
          n.changeSlide({
            data: {
              message: "index",
              index: parseInt(e)
            }
          }, t)
        }, t.prototype.init = function(t) {
          var n = this;
          e(n.$slider).hasClass("slick-initialized") || (e(n.$slider).addClass("slick-initialized"), n.buildRows(), n.buildOut(), n.setProps(), n.startLoad(), n.loadSlider(), n.initializeEvents(), n.updateArrows(), n.updateDots(), n.checkResponsive(!0), n.focusHandler()), t && n.$slider.trigger("init", [n]), n.options.accessibility === !0 && n.initADA(), n.options.autoplay && (n.paused = !1, n.autoPlay())
        }, t.prototype.initADA = function() {
          var t = this;
          t.$slides.add(t.$slideTrack.find(".slick-cloned")).attr({
            "aria-hidden": "true",
            tabindex: "-1"
          }).find("a, input, button, select").attr({
            tabindex: "-1"
          }), t.$slideTrack.attr("role", "listbox"), t.$slides.not(t.$slideTrack.find(".slick-cloned")).each(function(n) {
            e(this).attr("role", "option");
            var r = t.options.centerMode ? n : Math.floor(n / t.options.slidesToShow);
            t.options.dots === !0 && e(this).attr("aria-describedby", "slick-slide" + t.instanceUid + r + "")
          }), t.$dots !== null && t.$dots.attr("role", "tablist").find("li").each(function(n) {
            e(this).attr({
              role: "presentation",
              "aria-selected": "false",
              "aria-controls": "navigation" + t.instanceUid + n + "",
              id: "slick-slide" + t.instanceUid + n + ""
            })
          }).first().attr("aria-selected", "true").end().find("button").attr("role", "button").end().closest("div").attr("role", "toolbar"), t.activateADA()
        }, t.prototype.initArrowEvents = function() {
          var e = this;
          e.options.arrows === !0 && e.slideCount > e.options.slidesToShow && (e.$prevArrow.off("click.slick").on("click.slick", {
            message: "previous"
          }, e.changeSlide), e.$nextArrow.off("click.slick").on("click.slick", {
            message: "next"
          }, e.changeSlide))
        }, t.prototype.initDotEvents = function() {
          var t = this;
          t.options.dots === !0 && t.slideCount > t.options.slidesToShow && e("li", t.$dots).on("click.slick", {
            message: "index"
          }, t.changeSlide), t.options.dots === !0 && t.options.pauseOnDotsHover === !0 && e("li", t.$dots).on("mouseenter.slick", e.proxy(t.interrupt, t, !0)).on("mouseleave.slick", e.proxy(t.interrupt, t, !1))
        }, t.prototype.initSlideEvents = function() {
          var t = this;
          t.options.pauseOnHover && (t.$list.on("mouseenter.slick", e.proxy(t.interrupt, t, !0)), t.$list.on("mouseleave.slick", e.proxy(t.interrupt, t, !1)))
        }, t.prototype.initializeEvents = function() {
          var t = this;
          t.initArrowEvents(), t.initDotEvents(), t.initSlideEvents(), t.$list.on("touchstart.slick mousedown.slick", {
            action: "start"
          }, t.swipeHandler), t.$list.on("touchmove.slick mousemove.slick", {
            action: "move"
          }, t.swipeHandler), t.$list.on("touchend.slick mouseup.slick", {
            action: "end"
          }, t.swipeHandler), t.$list.on("touchcancel.slick mouseleave.slick", {
            action: "end"
          }, t.swipeHandler), t.$list.on("click.slick", t.clickHandler), e(document).on(t.visibilityChange, e.proxy(t.visibility, t)), t.options.accessibility === !0 && t.$list.on("keydown.slick", t.keyHandler), t.options.focusOnSelect === !0 && e(t.$slideTrack).children().on("click.slick", t.selectHandler), e(window).on("orientationchange.slick.slick-" + t.instanceUid, e.proxy(t.orientationChange, t)), e(window).on("resize.slick.slick-" + t.instanceUid, e.proxy(t.resize, t)), e(window).on("load.slick.slick-" + t.instanceUid, t.setPosition), e(document).on("ready.slick.slick-" + t.instanceUid, t.setPosition)
        }, t.prototype.initUI = function() {
          var e = this;
          e.options.arrows === !0 && e.slideCount > e.options.slidesToShow && (e.$prevArrow.show(), e.$nextArrow.show()), e.options.dots === !0 && e.slideCount > e.options.slidesToShow && e.$dots.show()
        }, t.prototype.keyHandler = function(e) {
          var t = this;
          e.target.tagName.match("TEXTAREA|INPUT|SELECT") || (e.keyCode === 37 && t.options.accessibility === !0 ? t.changeSlide({
            data: {
              message: t.options.rtl === !0 ? "next" : "previous"
            }
          }) : e.keyCode === 39 && t.options.accessibility === !0 && t.changeSlide({
            data: {
              message: t.options.rtl === !0 ? "previous" : "next"
            }
          }))
        }, t.prototype.lazyLoad = function() {
          function o(n) {
            e("img[data-lazy]", n).each(function() {
              var n = e(this),
                r = e(this).attr("data-lazy"),
                i = document.createElement("img");
              i.onload = function() {
                n.animate({
                  opacity: 0
                }, 100, function() {
                  n.attr("src", r).animate({
                    opacity: 1
                  }, 200, function() {
                    n.removeAttr("data-lazy").removeClass("slick-loading")
                  }), t.$slider.trigger("lazyLoaded", [t, n, r])
                })
              }, i.onerror = function() {
                n.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"), t.$slider.trigger("lazyLoadError", [t, n, r])
              }, i.src = r
            })
          }
          var t = this,
            n, r, i, s;
          t.options.centerMode === !0 ? t.options.infinite === !0 ? (i = t.currentSlide + (t.options.slidesToShow / 2 + 1), s = i + t.options.slidesToShow + 2) : (i = Math.max(0, t.currentSlide - (t.options.slidesToShow / 2 + 1)), s = 2 + (t.options.slidesToShow / 2 + 1) + t.currentSlide) : (i = t.options.infinite ? t.options.slidesToShow + t.currentSlide : t.currentSlide, s = Math.ceil(i + t.options.slidesToShow), t.options.fade === !0 && (i > 0 && i--, s <= t.slideCount && s++)), n = t.$slider.find(".slick-slide").slice(i, s), o(n), t.slideCount <= t.options.slidesToShow ? (r = t.$slider.find(".slick-slide"), o(r)) : t.currentSlide >= t.slideCount - t.options.slidesToShow ? (r = t.$slider.find(".slick-cloned").slice(0, t.options.slidesToShow), o(r)) : t.currentSlide === 0 && (r = t.$slider.find(".slick-cloned").slice(t.options.slidesToShow * -1), o(r))
        }, t.prototype.loadSlider = function() {
          var e = this;
          e.setPosition(), e.$slideTrack.css({
            opacity: 1
          }), e.$slider.removeClass("slick-loading"), e.initUI(), e.options.lazyLoad === "progressive" && e.progressiveLazyLoad()
        }, t.prototype.next = t.prototype.slickNext = function() {
          var e = this;
          e.changeSlide({
            data: {
              message: "next"
            }
          })
        }, t.prototype.orientationChange = function() {
          var e = this;
          e.checkResponsive(), e.setPosition()
        }, t.prototype.pause = t.prototype.slickPause = function() {
          var e = this;
          e.autoPlayClear(), e.paused = !0
        }, t.prototype.play = t.prototype.slickPlay = function() {
          var e = this;
          e.autoPlay(), e.options.autoplay = !0, e.paused = !1, e.focussed = !1, e.interrupted = !1
        }, t.prototype.postSlide = function(e) {
          var t = this;
          t.unslicked || (t.$slider.trigger("afterChange", [t, e]), t.animating = !1, t.setPosition(), t.swipeLeft = null, t.options.autoplay && t.autoPlay(), t.options.accessibility === !0 && t.initADA())
        }, t.prototype.prev = t.prototype.slickPrev = function() {
          var e = this;
          e.changeSlide({
            data: {
              message: "previous"
            }
          })
        }, t.prototype.preventDefault = function(e) {
          e.preventDefault()
        }, t.prototype.progressiveLazyLoad = function(t) {
          t = t || 1;
          var n = this,
            r = e("img[data-lazy]", n.$slider),
            i, s, o;
          r.length ? (i = r.first(), s = i.attr("data-lazy"), o = document.createElement("img"), o.onload = function() {
            i.attr("src", s).removeAttr("data-lazy").removeClass("slick-loading"), n.options.adaptiveHeight === !0 && n.setPosition(), n.$slider.trigger("lazyLoaded", [n, i, s]), n.progressiveLazyLoad()
          }, o.onerror = function() {
            t < 3 ? setTimeout(function() {
              n.progressiveLazyLoad(t + 1)
            }, 500) : (i.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"), n.$slider.trigger("lazyLoadError", [n, i, s]), n.progressiveLazyLoad())
          }, o.src = s) : n.$slider.trigger("allImagesLoaded", [n])
        }, t.prototype.refresh = function(t) {
          var n = this,
            r, i;
          i = n.slideCount - n.options.slidesToShow, !n.options.infinite && n.currentSlide > i && (n.currentSlide = i), n.slideCount <= n.options.slidesToShow && (n.currentSlide = 0), r = n.currentSlide, n.destroy(!0), e.extend(n, n.initials, {
            currentSlide: r
          }), n.init(), t || n.changeSlide({
            data: {
              message: "index",
              index: r
            }
          }, !1)
        }, t.prototype.registerBreakpoints = function() {
          var t = this,
            n, r, i, s = t.options.responsive || null;
          if (e.type(s) === "array" && s.length) {
            t.respondTo = t.options.respondTo || "window";
            for (n in s) {
              i = t.breakpoints.length - 1, r = s[n].breakpoint;
              if (s.hasOwnProperty(n)) {
                while (i >= 0) t.breakpoints[i] && t.breakpoints[i] === r && t.breakpoints.splice(i, 1), i--;
                t.breakpoints.push(r), t.breakpointSettings[r] = s[n].settings
              }
            }
            t.breakpoints.sort(function(e, n) {
              return t.options.mobileFirst ? e - n : n - e
            })
          }
        }, t.prototype.reinit = function() {
          var t = this;
          t.$slides = t.$slideTrack.children(t.options.slide).addClass("slick-slide"), t.slideCount = t.$slides.length, t.currentSlide >= t.slideCount && t.currentSlide !== 0 && (t.currentSlide = t.currentSlide - t.options.slidesToScroll), t.slideCount <= t.options.slidesToShow && (t.currentSlide = 0), t.registerBreakpoints(), t.setProps(), t.setupInfinite(), t.buildArrows(), t.updateArrows(), t.initArrowEvents(), t.buildDots(), t.updateDots(), t.initDotEvents(), t.cleanUpSlideEvents(), t.initSlideEvents(), t.checkResponsive(!1, !0), t.options.focusOnSelect === !0 && e(t.$slideTrack).children().on("click.slick", t.selectHandler), t.setSlideClasses(typeof t.currentSlide == "number" ? t.currentSlide : 0), t.setPosition(), t.focusHandler(), t.paused = !t.options.autoplay, t.autoPlay(), t.$slider.trigger("reInit", [t])
        }, t.prototype.resize = function() {
          var t = this;
          e(window).width() !== t.windowWidth && (clearTimeout(t.windowDelay), t.windowDelay = window.setTimeout(function() {
            t.windowWidth = e(window).width(), t.checkResponsive(), t.unslicked || t.setPosition()
          }, 50))
        }, t.prototype.removeSlide = t.prototype.slickRemove = function(e, t, n) {
          var r = this;
          typeof e == "boolean" ? (t = e, e = t === !0 ? 0 : r.slideCount - 1) : e = t === !0 ? --e : e;
          if (r.slideCount < 1 || e < 0 || e > r.slideCount - 1) return !1;
          r.unload(), n === !0 ? r.$slideTrack.children().remove() : r.$slideTrack.children(this.options.slide).eq(e).remove(), r.$slides = r.$slideTrack.children(this.options.slide), r.$slideTrack.children(this.options.slide).detach(), r.$slideTrack.append(r.$slides), r.$slidesCache = r.$slides, r.reinit()
        }, t.prototype.setCSS = function(e) {
          var t = this,
            n = {},
            r, i;
          t.options.rtl === !0 && (e = -e), r = t.positionProp == "left" ? Math.ceil(e) + "px" : "0px", i = t.positionProp == "top" ? Math.ceil(e) + "px" : "0px", n[t.positionProp] = e, t.transformsEnabled === !1 ? t.$slideTrack.css(n) : (n = {}, t.cssTransitions === !1 ? (n[t.animType] = "translate(" + r + ", " + i + ")", t.$slideTrack.css(n)) : (n[t.animType] = "translate3d(" + r + ", " + i + ", 0px)", t.$slideTrack.css(n)))
        }, t.prototype.setDimensions = function() {
          var e = this;
          e.options.vertical === !1 ? e.options.centerMode === !0 && e.$list.css({
            padding: "0px " + e.options.centerPadding
          }) : (e.$list.height(e.$slides.first().outerHeight(!0) * e.options.slidesToShow), e.options.centerMode === !0 && e.$list.css({
            padding: e.options.centerPadding + " 0px"
          })), e.listWidth = e.$list.width(), e.listHeight = e.$list.height(), e.options.vertical === !1 && e.options.variableWidth === !1 ? (e.slideWidth = Math.ceil(e.listWidth / e.options.slidesToShow), e.$slideTrack.width(Math.ceil(e.slideWidth * e.$slideTrack.children(".slick-slide").length))) : e.options.variableWidth === !0 ? e.$slideTrack.width(5e3 * e.slideCount) : (e.slideWidth = Math.ceil(e.listWidth), e.$slideTrack.height(Math.ceil(e.$slides.first().outerHeight(!0) * e.$slideTrack.children(".slick-slide").length)));
          var t = e.$slides.first().outerWidth(!0) - e.$slides.first().width();
          e.options.variableWidth === !1 && e.$slideTrack.children(".slick-slide").width(e.slideWidth - t)
        }, t.prototype.setFade = function() {
          var t = this,
            n;
          t.$slides.each(function(r, i) {
            n = t.slideWidth * r * -1, t.options.rtl === !0 ? e(i).css({
              position: "relative",
              right: n,
              top: 0,
              zIndex: t.options.zIndex - 2,
              opacity: 0
            }) : e(i).css({
              position: "relative",
              left: n,
              top: 0,
              zIndex: t.options.zIndex - 2,
              opacity: 0
            })
          }), t.$slides.eq(t.currentSlide).css({
            zIndex: t.options.zIndex - 1,
            opacity: 1
          })
        }, t.prototype.setHeight = function() {
          var e = this;
          if (e.options.slidesToShow === 1 && e.options.adaptiveHeight === !0 && e.options.vertical === !1) {
            var t = e.$slides.eq(e.currentSlide).outerHeight(!0);
            e.$list.css("height", t)
          }
        }, t.prototype.setOption = t.prototype.slickSetOption = function() {
          var t = this,
            n, r, i, s, o = !1,
            u;
          e.type(arguments[0]) === "object" ? (i = arguments[0], o = arguments[1], u = "multiple") : e.type(arguments[0]) === "string" && (i = arguments[0], s = arguments[1], o = arguments[2], arguments[0] === "responsive" && e.type(arguments[1]) === "array" ? u = "responsive" : typeof arguments[1] != "undefined" && (u = "single"));
          if (u === "single") t.options[i] = s;
          else if (u === "multiple") e.each(i, function(e, n) {
            t.options[e] = n
          });
          else if (u === "responsive")
            for (r in s)
              if (e.type(t.options.responsive) !== "array") t.options.responsive = [s[r]];
              else {
                n = t.options.responsive.length - 1;
                while (n >= 0) t.options.responsive[n].breakpoint === s[r].breakpoint && t.options.responsive.splice(n, 1), n--;
                t.options.responsive.push(s[r])
              }
          o && (t.unload(), t.reinit())
        }, t.prototype.setPosition = function() {
          var e = this;
          e.setDimensions(), e.setHeight(), e.options.fade === !1 ? e.setCSS(e.getLeft(e.currentSlide)) : e.setFade(), e.$slider.trigger("setPosition", [e])
        }, t.prototype.setProps = function() {
          var e = this,
            t = document.body.style;
          e.positionProp = e.options.vertical === !0 ? "top" : "left", e.positionProp === "top" ? e.$slider.addClass("slick-vertical") : e.$slider.removeClass("slick-vertical"), (t.WebkitTransition !== undefined || t.MozTransition !== undefined || t.msTransition !== undefined) && e.options.useCSS === !0 && (e.cssTransitions = !0), e.options.fade && (typeof e.options.zIndex == "number" ? e.options.zIndex < 3 && (e.options.zIndex = 3) : e.options.zIndex = e.defaults.zIndex), t.OTransform !== undefined && (e.animType = "OTransform", e.transformType = "-o-transform", e.transitionType = "OTransition", t.perspectiveProperty === undefined && t.webkitPerspective === undefined && (e.animType = !1)), t.MozTransform !== undefined && (e.animType = "MozTransform", e.transformType = "-moz-transform", e.transitionType = "MozTransition", t.perspectiveProperty === undefined && t.MozPerspective === undefined && (e.animType = !1)), t.webkitTransform !== undefined && (e.animType = "webkitTransform", e.transformType = "-webkit-transform", e.transitionType = "webkitTransition", t.perspectiveProperty === undefined && t.webkitPerspective === undefined && (e.animType = !1)), t.msTransform !== undefined && (e.animType = "msTransform", e.transformType = "-ms-transform", e.transitionType = "msTransition", t.msTransform === undefined && (e.animType = !1)), t.transform !== undefined && e.animType !== !1 && (e.animType = "transform", e.transformType = "transform", e.transitionType = "transition"), e.transformsEnabled = e.options.useTransform && e.animType !== null && e.animType !== !1
        }, t.prototype.setSlideClasses = function(e) {
          var t = this,
            n, r, i, s;
          r = t.$slider.find(".slick-slide").removeClass("slick-active slick-center slick-current").attr("aria-hidden", "true"), t.$slides.eq(e).addClass("slick-current"), t.options.centerMode === !0 ? (n = Math.floor(t.options.slidesToShow / 2), t.options.infinite === !0 && (e >= n && e <= t.slideCount - 1 - n ? t.$slides.slice(e - n, e + n + 1).addClass("slick-active").attr("aria-hidden", "false") : (i = t.options.slidesToShow + e, r.slice(i - n + 1, i + n + 2).addClass("slick-active").attr("aria-hidden", "false")), e === 0 ? r.eq(r.length - 1 - t.options.slidesToShow).addClass("slick-center") : e === t.slideCount - 1 && r.eq(t.options.slidesToShow).addClass("slick-center")), t.$slides.eq(e).addClass("slick-center")) : e >= 0 && e <= t.slideCount - t.options.slidesToShow ? t.$slides.slice(e, e + t.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false") : r.length <= t.options.slidesToShow ? r.addClass("slick-active").attr("aria-hidden", "false") : (s = t.slideCount % t.options.slidesToShow, i = t.options.infinite === !0 ? t.options.slidesToShow + e : e, t.options.slidesToShow == t.options.slidesToScroll && t.slideCount - e < t.options.slidesToShow ? r.slice(i - (t.options.slidesToShow - s), i + s).addClass("slick-active").attr("aria-hidden", "false") : r.slice(i, i + t.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false")), t.options.lazyLoad === "ondemand" && t.lazyLoad()
        }, t.prototype.setupInfinite = function() {
          var t = this,
            n, r, i;
          t.options.fade === !0 && (t.options.centerMode = !1);
          if (t.options.infinite === !0 && t.options.fade === !1) {
            r = null;
            if (t.slideCount > t.options.slidesToShow) {
              t.options.centerMode === !0 ? i = t.options.slidesToShow + 1 : i = t.options.slidesToShow;
              for (n = t.slideCount; n > t.slideCount - i; n -= 1) r = n - 1, e(t.$slides[r]).clone(!0).attr("id", "").attr("data-slick-index", r - t.slideCount).prependTo(t.$slideTrack).addClass("slick-cloned");
              for (n = 0; n < i; n += 1) r = n, e(t.$slides[r]).clone(!0).attr("id", "").attr("data-slick-index", r + t.slideCount).appendTo(t.$slideTrack).addClass("slick-cloned");
              t.$slideTrack.find(".slick-cloned").find("[id]").each(function() {
                e(this).attr("id", "")
              })
            }
          }
        }, t.prototype.interrupt = function(e) {
          var t = this;
          e || t.autoPlay(), t.interrupted = e
        }, t.prototype.selectHandler = function(t) {
          var n = this,
            r = e(t.target).is(".slick-slide") ? e(t.target) : e(t.target).parents(".slick-slide"),
            i = parseInt(r.attr("data-slick-index"));
          i || (i = 0);
          if (n.slideCount <= n.options.slidesToShow) {
            n.setSlideClasses(i), n.asNavFor(i);
            return
          }
          n.slideHandler(i)
        }, t.prototype.slideHandler = function(e, t, n) {
          var r, i, s, o, u = null,
            a = this,
            f;
          t = t || !1;
          if (a.animating === !0 && a.options.waitForAnimate === !0) return;
          if (a.options.fade === !0 && a.currentSlide === e) return;
          if (a.slideCount <= a.options.slidesToShow) return;
          t === !1 && a.asNavFor(e), r = e, u = a.getLeft(r), o = a.getLeft(a.currentSlide), a.currentLeft = a.swipeLeft === null ? o : a.swipeLeft;
          if (a.options.infinite === !1 && a.options.centerMode === !1 && (e < 0 || e > a.getDotCount() * a.options.slidesToScroll)) {
            a.options.fade === !1 && (r = a.currentSlide, n !== !0 ? a.animateSlide(o, function() {
              a.postSlide(r)
            }) : a.postSlide(r));
            return
          }
          if (a.options.infinite === !1 && a.options.centerMode === !0 && (e < 0 || e > a.slideCount - a.options.slidesToScroll)) {
            a.options.fade === !1 && (r = a.currentSlide, n !== !0 ? a.animateSlide(o, function() {
              a.postSlide(r)
            }) : a.postSlide(r));
            return
          }
          a.options.autoplay && clearInterval(a.autoPlayTimer), r < 0 ? a.slideCount % a.options.slidesToScroll !== 0 ? i = a.slideCount - a.slideCount % a.options.slidesToScroll : i = a.slideCount + r : r >= a.slideCount ? a.slideCount % a.options.slidesToScroll !== 0 ? i = 0 : i = r - a.slideCount : i = r, a.animating = !0, a.$slider.trigger("beforeChange", [a, a.currentSlide, i]), s = a.currentSlide, a.currentSlide = i, a.setSlideClasses(a.currentSlide), a.options.asNavFor && (f = a.getNavTarget(), f = f.slick("getSlick"), f.slideCount <= f.options.slidesToShow && f.setSlideClasses(a.currentSlide)), a.updateDots(), a.updateArrows();
          if (a.options.fade === !0) {
            n !== !0 ? (a.fadeSlideOut(s), a.fadeSlide(i, function() {
              a.postSlide(i)
            })) : a.postSlide(i), a.animateHeight();
            return
          }
          n !== !0 ? a.animateSlide(u, function() {
            a.postSlide(i)
          }) : a.postSlide(i)
        }, t.prototype.startLoad = function() {
          var e = this;
          e.options.arrows === !0 && e.slideCount > e.options.slidesToShow && (e.$prevArrow.hide(), e.$nextArrow.hide()), e.options.dots === !0 && e.slideCount > e.options.slidesToShow && e.$dots.hide(), e.$slider.addClass("slick-loading")
        }, t.prototype.swipeDirection = function() {
          var e, t, n, r, i = this;
          return e = i.touchObject.startX - i.touchObject.curX, t = i.touchObject.startY - i.touchObject.curY, n = Math.atan2(t, e), r = Math.round(n * 180 / Math.PI), r < 0 && (r = 360 - Math.abs(r)), r <= 45 && r >= 0 ? i.options.rtl === !1 ? "left" : "right" : r <= 360 && r >= 315 ? i.options.rtl === !1 ? "left" : "right" : r >= 135 && r <= 225 ? i.options.rtl === !1 ? "right" : "left" : i.options.verticalSwiping === !0 ? r >= 35 && r <= 135 ? "down" : "up" : "vertical"
        }, t.prototype.swipeEnd = function(e) {
          var t = this,
            n, r;
          t.dragging = !1, t.interrupted = !1, t.shouldClick = t.touchObject.swipeLength > 10 ? !1 : !0;
          if (t.touchObject.curX === undefined) return !1;
          t.touchObject.edgeHit === !0 && t.$slider.trigger("edge", [t, t.swipeDirection()]);
          if (t.touchObject.swipeLength >= t.touchObject.minSwipe) {
            r = t.swipeDirection();
            switch (r) {
              case "left":
              case "down":
                n = t.options.swipeToSlide ? t.checkNavigable(t.currentSlide + t.getSlideCount()) : t.currentSlide + t.getSlideCount(), t.currentDirection = 0;
                break;
              case "right":
              case "up":
                n = t.options.swipeToSlide ? t.checkNavigable(t.currentSlide - t.getSlideCount()) : t.currentSlide - t.getSlideCount(), t.currentDirection = 1;
                break;
              default:
            }
            r != "vertical" && (t.slideHandler(n), t.touchObject = {}, t.$slider.trigger("swipe", [t, r]))
          } else t.touchObject.startX !== t.touchObject.curX && (t.slideHandler(t.currentSlide), t.touchObject = {})
        }, t.prototype.swipeHandler = function(e) {
          var t = this;
          if (t.options.swipe === !1 || "ontouchend" in document && t.options.swipe === !1) return;
          if (t.options.draggable === !1 && e.type.indexOf("mouse") !== -1) return;
          t.touchObject.fingerCount = e.originalEvent && e.originalEvent.touches !== undefined ? e.originalEvent.touches.length : 1, t.touchObject.minSwipe = t.listWidth / t.options.touchThreshold, t.options.verticalSwiping === !0 && (t.touchObject.minSwipe = t.listHeight / t.options.touchThreshold);
          switch (e.data.action) {
            case "start":
              t.swipeStart(e);
              break;
            case "move":
              t.swipeMove(e);
              break;
            case "end":
              t.swipeEnd(e)
          }
        }, t.prototype.swipeMove = function(e) {
          var t = this,
            n = !1,
            r, i, s, o, u;
          u = e.originalEvent !== undefined ? e.originalEvent.touches : null;
          if (!t.dragging || u && u.length !== 1) return !1;
          r = t.getLeft(t.currentSlide), t.touchObject.curX = u !== undefined ? u[0].pageX : e.clientX, t.touchObject.curY = u !== undefined ? u[0].pageY : e.clientY, t.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(t.touchObject.curX - t.touchObject.startX, 2))), t.options.verticalSwiping === !0 && (t.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(t.touchObject.curY - t.touchObject.startY, 2)))), i = t.swipeDirection();
          if (i === "vertical") return;
          e.originalEvent !== undefined && t.touchObject.swipeLength > 4 && e.preventDefault(), o = (t.options.rtl === !1 ? 1 : -1) * (t.touchObject.curX > t.touchObject.startX ? 1 : -1), t.options.verticalSwiping === !0 && (o = t.touchObject.curY > t.touchObject.startY ? 1 : -1), s = t.touchObject.swipeLength, t.touchObject.edgeHit = !1, t.options.infinite === !1 && (t.currentSlide === 0 && i === "right" || t.currentSlide >= t.getDotCount() && i === "left") && (s = t.touchObject.swipeLength * t.options.edgeFriction, t.touchObject.edgeHit = !0), t.options.vertical === !1 ? t.swipeLeft = r + s * o : t.swipeLeft = r + s * (t.$list.height() / t.listWidth) * o, t.options.verticalSwiping === !0 && (t.swipeLeft = r + s * o);
          if (t.options.fade === !0 || t.options.touchMove === !1) return !1;
          if (t.animating === !0) return t.swipeLeft = null, !1;
          t.setCSS(t.swipeLeft)
        }, t.prototype.swipeStart = function(e) {
          var t = this,
            n;
          t.interrupted = !0;
          if (t.touchObject.fingerCount !== 1 || t.slideCount <= t.options.slidesToShow) return t.touchObject = {}, !1;
          e.originalEvent !== undefined && e.originalEvent.touches !== undefined && (n = e.originalEvent.touches[0]), t.touchObject.startX = t.touchObject.curX = n !== undefined ? n.pageX : e.clientX, t.touchObject.startY = t.touchObject.curY = n !== undefined ? n.pageY : e.clientY, t.dragging = !0
        }, t.prototype.unfilterSlides = t.prototype.slickUnfilter = function() {
          var e = this;
          e.$slidesCache !== null && (e.unload(), e.$slideTrack.children(this.options.slide).detach(), e.$slidesCache.appendTo(e.$slideTrack), e.reinit())
        }, t.prototype.unload = function() {
          var t = this;
          e(".slick-cloned", t.$slider).remove(), t.$dots && t.$dots.remove(), t.$prevArrow && t.htmlExpr.test(t.options.prevArrow) && t.$prevArrow.remove(), t.$nextArrow && t.htmlExpr.test(t.options.nextArrow) && t.$nextArrow.remove(), t.$slides.removeClass("slick-slide slick-active slick-visible slick-current").attr("aria-hidden", "true").css("width", "")
        }, t.prototype.unslick = function(e) {
          var t = this;
          t.$slider.trigger("unslick", [t, e]), t.destroy()
        }, t.prototype.updateArrows = function() {
          var e = this,
            t;
          t = Math.floor(e.options.slidesToShow / 2), e.options.arrows === !0 && e.slideCount > e.options.slidesToShow && !e.options.infinite && (e.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false"), e.$nextArrow.removeClass("slick-disabled").attr("aria-disabled", "false"), e.currentSlide === 0 ? (e.$prevArrow.addClass("slick-disabled").attr("aria-disabled", "true"), e.$nextArrow.removeClass("slick-disabled").attr("aria-disabled", "false")) : e.currentSlide >= e.slideCount - e.options.slidesToShow && e.options.centerMode === !1 ? (e.$nextArrow.addClass("slick-disabled").attr("aria-disabled", "true"), e.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false")) : e.currentSlide >= e.slideCount - 1 && e.options.centerMode === !0 && (e.$nextArrow.addClass("slick-disabled").attr("aria-disabled", "true"), e.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false")))
        }, t.prototype.updateDots = function() {
          var e = this;
          e.$dots !== null && (e.$dots.find("li").removeClass("slick-active").attr("aria-hidden", "true"), e.$dots.find("li").eq(Math.floor(e.currentSlide / e.options.slidesToScroll)).addClass("slick-active").attr("aria-hidden", "false"))
        }, t.prototype.visibility = function() {
          var e = this;
          e.options.autoplay && (document[e.hidden] ? e.interrupted = !0 : e.interrupted = !1)
        }, e.fn.slick = function() {
          var e = this,
            n = arguments[0],
            r = Array.prototype.slice.call(arguments, 1),
            i = e.length,
            s, o;
          for (s = 0; s < i; s++) {
            typeof n == "object" || typeof n == "undefined" ? e[s].slick = new t(e[s], n) : o = e[s].slick[n].apply(e[s].slick, r);
            if (typeof o != "undefined") return o
          }
          return e
        }
      }),
      function() {
        STR.Tag != null ? console.log("SHARETHROUGH'S TAG.JS IS ALREADY DEFINED ON PAGE") : STR.Tag = {
          Views: {},
          Models: {},
          Helpers: {},
          Factories: {},
          AdserverUrl: "//btlr.sharethrough.com/v4",
          ClientJsUrl: "//native.sharethrough.com",
          BakeryUrl: "//platform-cdn.sharethrough.com",
          TrackingHost: "//b.sharethrough.com",
          ClickoutHost: "http://clickout.sharethrough.com",
          placements: {},
          templateStores: {}
        }
      }.call(this),
      function() {
        STR.Tag.Factories.CreativeFactory = function() {
          function e() {}
          return e.prototype.getCreative = function(e, t, n, r) {
            var i;
            return r == null && (r = void 0), i = "" + STR.Tag.AdserverUrl + "?placement_key=" + t, e != null && e !== "" && (i += "&user_id=" + e), i += "&" + STR.Tag.Helpers.UidProvider.adServerParams(), STR.Tag.Helpers.AjaxHelper.ijsonGet(i, n)
          }, e
        }()
      }.call(this),
      function() {
        STR.Tag.Factories.FactoryChooser = {
          chooseFactories: function(e, t) {
            var n;
            return STR.Tag.Helpers.HtmlUtility.getParameterByName("preview_mode") === !0 ? n = new STR.Tag.Factories.PreviewCreativeFactory : e ? n = new STR.Tag.Factories.SfpCreativeFactory : t ? n = new STR.Tag.Factories.SfpCampaignFactory : n = new STR.Tag.Factories.CreativeFactory, n
          }
        }
      }.call(this),
      function() {
        var e, t = function(e, t) {
          return function() {
            return e.apply(t, arguments)
          }
        };
        e = STR.Vendor.$, STR.Tag.Factories.PreviewCreativeFactory = function() {
          function e() {
            this.localCallback = t(this.localCallback, this), this.callback = {}
          }
          return e.prototype.getCreative = function(e, t, n) {
            var r;
            return this.callback = n, r = "" + STR.Tag.AdserverUrl + "?placement_key=" + t, r += "&" + STR.Tag.Helpers.UidProvider.adServerParams(), STR.Tag.Helpers.AjaxHelper.ijsonGet(r, this.localCallback)
          }, e.prototype.localCallback = function(e) {
            var t, n;
            return t = this.constructCreativeFromQueryString(), e.creatives = [{
              creative: t
            }, {
              creative: t
            }, {
              creative: t
            }, {
              creative: t
            }, {
              creative: t
            }], n = this.getParameterByName("promoted_by_text"), n !== "" && (e.placement.placementAttributes.promoted_by_text = n), this.callback(e)
          }, e.prototype.constructCreativeFromQueryString = function() {
            return {
              action: this.getParameterByName("action"),
              advertiser: this.getParameterByName("advertiser"),
              advertiser_key: "fake-advertiser-key",
              beacons: {
                impression: [],
                visible: [],
                click: [],
                play: [],
                completed_silent_play: [],
                thirty_second_silent_play: [],
                fifteen_second_silent_play: [],
                ten_second_silent_play: [],
                silent_play: []
              },
              brand_logo_url: this.getParameterByName("brand_logo_url"),
              campaign_key: "fake-campaign-key",
              creative_key: "fake-creative-key",
              custom_engagement_label: this.getParameterByName("custom_engagement_label"),
              custom_engagement_url: this.getParameterByName("custom_engagement_url"),
              description: this.getParameterByName("description"),
              media_url: this.getParameterByName("media_url"),
              share_url: this.getParameterByName("share_url"),
              thumbnail_url: this.getParameterByName("thumbnail_url"),
              title: this.getParameterByName("title"),
              variant_key: "fake-variant-key",
              force_click_to_play: this.getParameterByName("force_click_to_play")
            }
          }, e.prototype.getParameterByName = function(e) {
            return STR.Tag.Helpers.HtmlUtility.getParameterByName(e) ? decodeURIComponent(decodeURIComponent(STR.Tag.Helpers.HtmlUtility.getParameterByName(e))) : ""
          }, e
        }()
      }.call(this),
      function() {
        STR.Tag.Factories.SfpCampaignFactory = function() {
          function e() {}
          return e.prototype.getCreative = function(e, t, n, r, i) {
            var s;
            return s = "" + STR.Tag.AdserverUrl + "?placement_key=" + t + "&campaign_key=" + i, e != null && e !== "" && (s += "&user_id=" + e), s += "&" + STR.Tag.Helpers.UidProvider.adServerParams(), STR.Tag.Helpers.AjaxHelper.ijsonGet(s, n)
          }, e
        }()
      }.call(this),
      function() {
        STR.Tag.Factories.SfpCreativeFactory = function() {
          function e() {}
          return e.prototype.getCreative = function(e, t, n, r, i) {
            var s;
            return s = "" + STR.Tag.AdserverUrl + "?placement_key=" + t + "&creative_key=" + r, e != null && e !== "" && (s += "&user_id=" + e), s += "&" + STR.Tag.Helpers.UidProvider.adServerParams(), STR.Tag.Helpers.AjaxHelper.ijsonGet(s, n)
          }, e
        }()
      }.call(this),
      function() {
        var e;
        e = STR.Vendor.$, STR.Tag.Helpers.AdUnitHelper = {
          insertCreativeTypeBranding: function(e, t) {
            var n;
            return n = this.getReplacementForType(e), t.replace(/{{advertiser}}/, "{{advertiser}}" + n)
          },
          getReplacementForType: function(e) {
            return e === "hosted-video" ? this.html5PlayerImgTag() : e === "video" ? this.youtubeImgTag() : ""
          },
          youtubeImgTag: function() {
            var t, n, r;
            return r = this.imgTagWidthAttributes("100%"), n = this.imgTagHeightAttributes("100%"), t = this.platformImgTagDefaults(), e("<img>", {
              src: "" + STR.Tag.ClientJsUrl + "/assets/youtube-squared.png",
              style: "" + r + n + t
            })
          },
          html5PlayerImgTag: function() {
            var t, n, r;
            return r = this.imgTagWidthAttributes("100%"), n = this.imgTagHeightAttributes("100%"), t = this.platformImgTagDefaults(), e("<img>", {
              src: "" + STR.Tag.ClientJsUrl + "/assets/non-YT-play-squared.png",
              style: "" + r + n + t
            })
          },
          getIconWrapper: function(t, n) {
            var r;
            return n == null && (n = .25), r = t * n, e("<div>", {
              "class": "icon-wrapper",
              style: "position:absolute;height:" + r + "px;min-height:16px;max-height:40px;width:" + r + "px;min-width:16px;max-width:40px;left:0;top:0;"
            })
          },
          imgTagWidthAttributes: function(e) {
            var t, n;
            return n = ["width", "min-width", "max-width"],
              function() {
                var r, i, s;
                s = [];
                for (r = 0, i = n.length; r < i; r++) t = n[r], s.push("" + t + ":" + e + ";");
                return s
              }().join("")
          },
          imgTagHeightAttributes: function(e) {
            var t, n;
            return n = ["height", "min-height", "max-height"],
              function() {
                var r, i, s;
                s = [];
                for (r = 0, i = n.length; r < i; r++) t = n[r], s.push("" + t + ":" + e + ";");
                return s
              }().join("")
          },
          platformImgTagDefaults: function() {
            return "margin:0;padding:0;"
          },
          insertBrandLogo: function(e) {
            var t;
            return t = this.brandLogoImgTag(), e.replace(/{{brand_logo}}/, "" + t)
          },
          brandLogoImgTag: function() {
            var e, t;
            return t = this.imgTagWidthAttributes("16px"), e = this.imgTagHeightAttributes("16px"), "<img src={{brand_logo_url}} style='" + t + e + "position:relative;top:-1px;display:inline-block;margin-bottom:0;border:none;margin-left:0;margin-right:5px;'>"
          },
          getOptOut: function(t) {
            var n;
            return t ? n = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAMAAADW3miqAAABYlBMVEUAAACAgICqqqqAgICZmZmqqqqioqKqqqqvr6+urq6urq6xsbG2travr6+1tbWzs7O0tLSzs7O0tLS2trazs7O2tra1tbW0tLS1tbW3t7e1tbW3t7e1tbW1tbW1tbW2tra2tra2tra3t7e1tbW2tra2tra1tbW3t7e2tra2tra2tra2tra3t7e2tra3t7e3t7e2tra3t7e2tra3t7e2tra2tra3t7e2tra2tra2tra2tra2tra2tra3t7e3t7e3t7e2tra2tra2tra3t7e4uLi5ubm6urq7u7u8vLy9vb2+vr6/v7/BwcHCwsLDw8PExMTIyMjLy8vPz8/R0dHS0tLT09PU1NTW1tbX19fa2trb29vd3d3e3t7f39/i4uLj4+Pk5OTm5ubn5+fp6enq6urs7Ozt7e3v7+/x8fHy8vLz8/P09PT29vb39/f4+Pj5+fn6+vr7+/v8/Pz9/f3+/v7///+u2Vr6AAAAQnRSTlMAAgMEBQYLDxATFhccICYoLDIzP0BGSEtPVVZmZ25vc3aFjY6Pk5Wbnauss7S1uLvD0NXX2tzl6uvu7/Hy9/r7/P1llHhJAAABXklEQVR4AYXU11fiQBTH8eyyne3LdpZVsBcFOxYsvxBUCkRREQFFEREVjOH+/57DnBMTMpN8XvN9yp17JRtPIBr+Ijn7MQtgc/idQ/JxAszK/xeC5HUwBsPcT17y7O8iLKY+2ZpvEfRaH3hjST6MgWfJ/9xIXvWvQSDik5jfCzDbgsWotxvFYCIX2pVtmAW7EUzUJhHdF2Q8GeyJ0jVimqooSpR1MtTS3ChTJzMtw4vUYr5FhmoS3EjbVUo6Sxo5gB/RGZC6IKL2ASCLIrrMAup1OYH4sXa6w4vixQfqsE97t0RU4kVA8pxIK8jZOpE4AnINorsOOUTxoxTAfoMwUhqknyhQqqzR88KxtPZxaIxFPOCrimjABvVG8FRcHl2oG/1xfL7j710XYea760pF/3kkM599OTeG3trW3N+z5tOfuQcjFINh/pfw9EyCWe176XrERrySI09gOfxVsngEHXr/oBBJ080AAAAASUVORK5CYII=" : n = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAEmklEQVRoBe2aTWtUVxjHM0nTZpNKsVjNwoUWcdGNYNCNi0JFmcSBCM5C+gVc9EWoAWkXWdSNLdiXLyC4UxnIJBMEXelGieKydaFoFzEBwWqjmMBk+vuHew8nd869c869iWPAC4dz7nOel//zcs6998z09Ly/uhuB0jqZL9Xr9QN9fX0j6NtVKpWGWq3WUNS3oD1lPAdtjvGjZrPZqFQqdxhrrtBVyIHp6emvent7TwCsAsDtIUiQmUemvrKycmV0dPRGiKzNm8sBon2QaJ8HwCFbWd4xztwiK+Nk5XaojiAHiLjK4xfa8VBDPvw4UqOdISOPfPjF4+2AygXgl2mf+CrPw4cDz2lV37Lq9TEC+G8Afm2jwQuLbMiWbPpg65iBRqPxGwq/81GW5CGSr5H9EPoHyTmfe+R/HxkZ+T6LNzMDUeSDwWP4bxblodnZ2cGFhYVBxl9D+zcLiGtOgeuUidQMIKiaV9n0uZRn0F4tLS19MTY29tjmmZqaGmPnqtk0nzGON2lH09aE0wHAa7e5S8uzYK+Wy+UTLnCUo/b+z1xzWTQc0MLe79qdnCWEEW2VecD38GB6kgYGnf+kzWXRhUWYXDxtDughBXPufR7ZvS5DExMTsrXHNedDEyZhS/K2OaAnbJIp5B5DRyYnJ/clZYaHh09B25Kkh9y7sK1ZA1q4vNtcD1Hq4qVen9F+YPeRrsH+/v6T9Gdp/S7+EBolethe0Gv2Z72YhShL4yULn9Iuoi+NJTc9wmhe/mwLJaJWya35LQlGGE3lGAdYIAeIWtArsQfmlxi8RDu2vLy8kz74YZa0IYzCGtNNCbFA9DFS5FpC+AEg/6JXu4ex67wKiL568Rx4E4+L9BHW1Vdv4wAKdxVRiuyvPMB+KqjDV9xgNSVEtIZ8pVP49hHhk7VabVvK/LqRbawmA6Re37BFjJSRLw8MDDxEyedFFHWSFdaYZz0zEOvcTRa2xjcb1O+I9RoH8KrwCUGslEX2UTze6N44gKGn62WMh02hWvTAYbAaB6hfndlsisvGahyggjaNAzZW4wCh9z7KeAfSZLAaB3hzbLwDwLwg2FiNAzqrJDXzXhq6yCSM0bnqKgrjAHctFke9i9i8TEcYzZZvO6Dv2SteWrrIlMS4xgF96ZCiW13El2la2OyvMTGvcUAEFsi4+iIXUTIptvWQfifd5skau7C1OaAjbjwNPoCyDXOw9cq+t8ZpdIvFPRQmYUvOtjkgBpjP0J4nmT3v71er1RcpvDdT6JlkYREmF5PTAZ2AIVClNV1CKbQZSqe6uLj4Zcp8D3OnKIPj6PV+5giDsAiTS2/mS5cOVnkx+8Ml6KCd8/0im5mZ+Rn5Hx062kgE5VvA/9k2EREyHRCP7/E6UfoP9peR3k7dxyzowU5M6Ox4vN7RARlRJjB4gRZ6Ut0Jo3M+KpvTWZGPBb0cELNO7XBgc/7EJAeIhh5y+2mFtljpSrukWzZkK40nSffOgC2oU2IdtJKRzfUzq+2ExioruiqOHKMFneoR6XnaFPKXQyIuu/aVKwO2gmic+lcDzQN0Dgc35K8GDizvSW81Av8D0tr8FvFwVBYAAAAASUVORK5CYII=", e("<span>", {
              "class": "str-opt-out",
              style: "cursor:pointer;position:absolute;height:18px;min-height:18px;max-height:18px;width:18px;min-width:18px;max-width:18px;right:0;bottom:0;padding:0px;margin:8px;background-size:18px 18px;background-color: transparent !important;background-repeat:no-repeat;background-image: url('" + n + "');"
            })
          },
          imgixThumbnailUrl: function(e, t, n) {
            var r;
            return r = e.replace("//static.sharethrough.com", "//str-assets.imgix.net").replace("/thumb_320/", "/original/"), r.match("w=320&h=250") ? r = r.replace("w=320&h=250", "w=" + t + "&h=" + n) : r.match(/str-assets\.imgix\.net/) && (r += "?w=" + t + "&h=" + n + "&auto=format&fit=crop"), r
          }
        }
      }.call(this),
      function() {
        var e;
        e = 0, STR.Tag.Helpers.AjaxHelper = {
          ijsonMessages: {},
          messageListenerSet: !1,
          nextCacheSafeCallbackName: function() {
            return e++, "native_callback_" + e
          },
          get: function(e, t, n) {
            return STR.Vendor.$.ajax({
              url: e,
              dataType: "jsonp",
              success: t,
              jsonpCallback: "native_callback_" + n
            })
          },
          ijsonGet: function(e, t) {
            var n, r, i;
            return this.messageListenerSet || (window.addEventListener("message", this.handlePostMessage), this.messageListenerSet = !0), i = this.nextCacheSafeCallbackName(), e += "&ijson=" + i, n = (new Date).getTime(), e += "&cache=" + n, this.ijsonMessages[i] = {
              success: t
            }, r = document.createElement("iframe"), r.style.cssText = "display:none;", r.src = e, r.setAttribute("data-message-id", i), document.body.appendChild(r)
          },
          handlePostMessage: function(e) {
            return function(e) {
              var t, n, r, i, s;
              try {
                return i = JSON.parse(e.data), r = i.message_id, s = STR.Tag.Helpers.AjaxHelper.ijsonMessages[r].success, s(i.response), n = document.body.querySelector("iframe[data-message-id='" + r + "']"), document.body.removeChild(n), delete STR.Tag.Helpers.AjaxHelper.ijsonMessages[r]
              } catch (o) {
                t = o
              }
            }
          }(this)
        }
      }.call(this),
      function() {
        STR.Tag.Helpers.canAutoPlayHTML5Video = function() {
          var e, t, n;
          return t = /Android/i.test(navigator.userAgent), n = /iPhone|iPad|iPod/i.test(navigator.userAgent), e = document.getElementsByTagName("body")[0].className.match(/force-sprite/), !(n || t || e)
        }, STR.Tag.Helpers.isiOS = function() {
          return /iPhone|iPad|iPod/i.test(navigator.userAgent)
        }, STR.Tag.Helpers.setupRAF = function() {
          if (STR.Tag.Helpers.isiOS()) return AnimationFrame.shim()
        }
      }.call(this),
      function() {
        var e, t = function(e, t) {
          return function() {
            return e.apply(t, arguments)
          }
        };
        e = STR.Vendor.$, STR.Tag.Helpers.BeaconCannon = function() {
          function n() {
            this.setUid = t(this.setUid, this), STR.Tag.Helpers.UidProvider.whenUidReady(this.setUid)
          }
          return n.instance = void 0, n.getInstance = function() {
            return this.instance || (this.instance = new STR.Tag.Helpers.BeaconCannon), this.instance
          }, n.prototype.beaconQueue = [], n.prototype.setUid = function(e) {
            var t, n, r, i, s;
            this.uid = e, i = this.beaconQueue, s = [];
            for (n = 0, r = i.length; n < r; n++) t = i[n], s.push(this.sendBeaconRequest.apply(this, t));
            return s
          }, n.prototype.firePixel = function(e) {
            var t;
            return t = new Image, t.src = STR.Tag.Helpers.ObjectHelper.replaceCacheBusterParam(e), t
          }, n.prototype.fireBeacon = function(e, t, n) {
            return this.uid != null ? this.sendBeaconRequest(e, t, n) : this.queueBeacon(e, t, n)
          }, n.prototype.queueBeacon = function(e, t, n) {
            return this.beaconQueue.push([e, t, n])
          }, n.prototype.sendBeaconRequest = function(e, t, n) {
            return this.firePixel(this.generateBeaconRequest(e, t, n))
          }, n.prototype.generateBeaconRequest = function(t, n, r) {
            var i, s, o, u;
            return i = e.extend({}, r, this.defaultParams()), i.uid = this.uid, o = function() {
              var e;
              e = [];
              for (s in i) u = i[s], e.push("" + encodeURIComponent(s) + "=" + encodeURIComponent(u));
              return e
            }(), "" + t + "/" + n + "?" + o.join("&")
          }, n.prototype.defaultParams = function() {
            var e, t;
            return e = STR.Tag.Helpers.PageGeometryHelper.viewportDimensions(), t = {
              session: STR.currentSession,
              bwidth: e[0],
              bheight: e[1],
              pref: this.getReferrer(),
              ploc: this.getPloc(),
              ua: this.getUserAgent(),
              umtime: (new Date).getTime()
            }, STR.Vendor.$.extend({}, STR.Tag.Helpers.UidProvider.beaconParams(), t)
          }, n.prototype.getUserAgent = function() {
            return this.userAgent || (this.userAgent = window.navigator.userAgent)
          }, n.prototype.getReferrer = function() {
            return this.referrer || (this.referrer = encodeURIComponent(window.document.referrer))
          }, n.prototype.getPloc = function() {
            return this.ploc || (this.ploc = encodeURIComponent(window.document.location.href))
          }, n
        }()
      }.call(this),
      function() {
        var e = function(e, t) {
          return function() {
            return e.apply(t, arguments)
          }
        };
        STR.Tag.Helpers.BlueKaiHelpers = function() {
          function n() {
            this.expireTimeout = e(this.expireTimeout, this), this.startTimeout = e(this.startTimeout, this), this.callbacks = [], this.defineUidReadyCallback(), this.startTimeout(), this.dropJS(), this.dropPhintPixel()
          }
          var t;
          return n.prototype.WAIT_THRESHOLD = 2e3, n.prototype.STR_CALLBACK_NAME = "STRBKCallback", n.init = function() {
            var e;
            return e = new this
          }, n.prototype.whenUidReady = function(e) {
            return this.status != null ? e(this.uid, this.status, this.targets) : this.callbacks.push(e)
          }, n.prototype.defineUidReadyCallback = function() {
            return window[this.STR_CALLBACK_NAME] = function(e) {
              return function(t) {
                var n, r, i;
                if (!e.status) return window.clearTimeout(e.timeoutID), r = new STR.Tag.Helpers.BlueKaiResponseParser, n = r.getUid(t), i = r.getTargets(t), n != null ? e.setUid(n, "valid", i) : e.setUid("", "not_available", i)
              }
            }(this)
          }, n.prototype.startTimeout = function() {
            return this.timeoutID = window.setTimeout(this.expireTimeout, this.WAIT_THRESHOLD)
          }, n.prototype.dropJS = function() {
            return STR.Vendor.$.ajax({
              url: t(this.STR_CALLBACK_NAME),
              dataType: "script",
              timeout: this.WAIT_THRESHOLD
            })
          }, n.prototype.dropPhintPixel = function() {
            var e;
            return e = new Image, e.src = "//tags.bluekai.com/site/20214?limit=1&phint=user%3Dtrue"
          }, n.prototype.setUid = function(e, t, n) {
            var r, i, s, o, u;
            this.uid = e, this.status = t, this.targets = n, o = this.callbacks, u = [];
            for (i = 0, s = o.length; i < s; i++) r = o[i], u.push(r(this.uid, this.status, this.targets));
            return u
          }, n.prototype.expireTimeout = function() {
            return this.setUid("", "expired", [])
          }, t = function(e) {
            var t;
            return t = "//tags.bluekai.com/site/20087", "" + t + "?ret=js&jscb=" + e
          }, n
        }()
      }.call(this),
      function() {
        STR.Tag.Helpers.BlueKaiResponseParser = function() {
          function i() {}
          var e, t, n, r;
          return i.prototype.getUid = function(e) {
            var n, i, s, o, u;
            s = null, i = t(e);
            for (o = 0, u = i.length; o < u; o++) {
              n = i[o], s = r(n);
              if (s != null) break
            }
            return s
          }, i.prototype.getTargets = function(r) {
            var i, s, o, u, a, f, l;
            s = t(r), l = [];
            for (a = 0, f = s.length; a < f; a++) i = s[a], u = e(i), o = n(i), l.push({
              id: u,
              categories: o
            });
            return l
          }, e = function(e) {
            var t;
            return (t = e.campaign) != null ? t.toString() : void 0
          }, n = function(e) {
            var t, n, r, i, s;
            t = e.categories || [], s = [];
            for (r = 0, i = t.length; r < i; r++) n = t[r], n.categoryID != null && s.push(n.categoryID.toString());
            return s
          }, r = function(e) {
            if (e.STBKUUID != null) return e.STBKUUID
          }, t = function(e) {
            return (e != null ? e.campaigns : void 0) || []
          }, i
        }()
      }.call(this),
      function() {
        var e;
        e = STR.Vendor.$, STR.Tag.Helpers.CardHelper = {
          HEADER_FOOTER_HEIGHT: 120,
          getDimensions: function(t) {
            var n, r, i, s, o, u, a, f, l, c, h;
            return h = STR.Tag.Helpers.CardHelper.getInnerWidth(window), c = STR.Tag.Helpers.CardHelper.getInnerHeight(window), n = STR.Tag.Helpers.CardHelper.getMarginLeft("body"), a = e(window).scrollTop(), window.matchMedia("(max-width: 767px)").matches ? (f = a, s = 0, l = h, i = c) : window.matchMedia("(min-width: 768px) and (max-width:1024px)").matches ? (l = .6 * h, o = STR.Tag.Helpers.CardHelper.maxWidthForCreative(t), l > o && (l = o), u = STR.Tag.Helpers.CardHelper.ratioForCreative(t), l * u + STR.Tag.Helpers.CardHelper.HEADER_FOOTER_HEIGHT > c ? (i = c, l = Math.floor(i / u)) : i = l * u + STR.Tag.Helpers.CardHelper.HEADER_FOOTER_HEIGHT, f = (c - i) / 2 + a, s = (h - l) / 2 - n) : (l = STR.Tag.Helpers.CardHelper.maxWidthForCreative(t), u = STR.Tag.Helpers.CardHelper.ratioForCreative(t), l * u + STR.Tag.Helpers.CardHelper.HEADER_FOOTER_HEIGHT > c ? (i = c, l = Math.floor(i / u)) : i = l * u + STR.Tag.Helpers.CardHelper.HEADER_FOOTER_HEIGHT, f = (c - i) / 2 + a, s = h / 2 - l / 2 - n), r = {
              top: f,
              left: s,
              width: l,
              height: i
            }
          },
          animateIn: function(e, t, n, r, i, s) {
            var o;
            return o = STR.Tag.Helpers.CardHelper.getDimensions(i), t.animate({
              opacity: 1
            }), n.css({
              left: e.offset().left,
              top: e.offset().top,
              width: e.outerWidth(),
              height: e.outerHeight()
            }).animate({
              opacity: 1
            }, 200).animate({
              top: o.top,
              left: o.left,
              width: o.width,
              height: o.height
            }, 400, "easeInOutQuint", s), r.delay(600).animate({
              opacity: 1
            })
          },
          animateOut: function(e, t, n, r, i) {
            return t.animate({
              opacity: 0
            }), r.animate({
              opacity: 0
            }, 200), n.delay(200).animate({
              top: e.offset().top,
              left: e.offset().left,
              height: e.outerHeight(),
              width: e.outerWidth()
            }, 500, "easeInOutQuint").animate({
              opacity: 0
            }, 500, "swing", i)
          },
          RATIO_VIDEO: 9 / 16,
          RATIO_ARTICLE: 8 / 6,
          MAX_WIDTH_VIDEO: 600,
          MAX_WIDTH_VERTICAL: 400,
          ratioForCreative: function(e) {
            if (e.video_aspect_ratio) return e.video_aspect_ratio;
            if (e.action === "video" || e.action === "hosted-video" || e.action === "autoplay") return STR.Tag.Helpers.CardHelper.RATIO_VIDEO;
            if (e.action === "article") return STR.Tag.Helpers.CardHelper.RATIO_ARTICLE
          },
          maxWidthForCreative: function(e) {
            if (e.video_aspect_ratio && e.video_aspect_ratio === 16 / 9) return STR.Tag.Helpers.CardHelper.MAX_WIDTH_VERTICAL;
            if (e.action === "video" || e.action === "hosted-video" || e.action === "autoplay" || e.action === "article") return STR.Tag.Helpers.CardHelper.MAX_WIDTH_VIDEO
          },
          getInnerWidth: function(e) {
            return e.innerWidth
          },
          getInnerHeight: function(e) {
            var t, n;
            n = Infinity;
            try {
              n = window.top.innerHeight
            } catch (r) {
              t = r
            }
            return Math.min(e.innerHeight, n)
          },
          getMarginLeft: function(t) {
            var n;
            return n = e(t).css("margin-left"), n ? parseFloat(n) : 0
          }
        }
      }.call(this),
      function() {
        var e, t = function(e, t) {
          return function() {
            return e.apply(t, arguments)
          }
        };
        e = STR.Vendor.$, STR.Tag.Helpers.CriteoHelper = function() {
          function r() {
            this.expireTimeout = t(this.expireTimeout, this), this.startTimeout = t(this.startTimeout, this), this.callbacks = [], this.defineUidReadyCallback(), this.startTimeout(), this.dropJS()
          }
          var n;
          return r.prototype.WAIT_THRESHOLD = 2e3, r.prototype.STR_CALLBACK_NAME = "STRCriteoCallback", r.init = function() {
            var e;
            return e = new this
          }, r.prototype.whenUidReady = function(e) {
            return this.status != null ? e(this.uid, this.status) : this.callbacks.push(e)
          }, r.prototype.defineUidReadyCallback = function() {
            return window[this.STR_CALLBACK_NAME] = function(e) {
              return function(t) {
                var n;
                if (!e.status) return window.clearTimeout(e.timeoutID), n = t ? t.userid : void 0, n != null ? e.setUid(t.userid, t.status) : e.setUid("", "not_available")
              }
            }(this)
          }, r.prototype.startTimeout = function() {
            return this.timeoutID = window.setTimeout(this.expireTimeout, this.WAIT_THRESHOLD)
          }, r.prototype.dropJS = function() {
            return e.ajaxSetup({
              cache: !0
            }), e.ajax({
              url: n(this.STR_CALLBACK_NAME),
              dataType: "script",
              timeout: this.WAIT_THRESHOLD
            }), e.ajaxSetup({
              cache: !1
            })
          }, r.prototype.setUid = function(e, t) {
            var n, r, i, s, o;
            this.uid = e, this.status = t, s = this.callbacks, o = [];
            for (r = 0, i = s.length; r < i; r++) n = s[r], o.push(n(this.uid, this.status));
            return o
          }, r.prototype.expireTimeout = function() {
            return this.setUid("", "expired")
          }, n = function(e) {
            var t;
            return t = "//gum.criteo.com/sync", "" + t + "?r=2&c=158&j=" + e
          }, r
        }()
      }.call(this),
      function() {
        STR.Tag.Helpers.DfpMessageListener = function() {
          function e() {}
          return e.prototype.registerListener = function() {
            return window.addEventListener("message", this.replaceIframeWithPlacementTag)
          }, e.prototype.findPkeyFromPreviousDom = function(e) {
            var t, n, r, i;
            t = e, n = null;
            while (t.length !== 0 && n === null) i = t.prevAll("[data-str-set-targeting-placement]"), i.length > 0 ? n = i.first() : (r = t.parent("[data-str-set-targeting-placement]"), r.length > 0 ? n = r : t = t.parent());
            if (n != null) {
              if (n.attr("data-str-visited-flag") === "true") return console.log("STR Integration Error, trying to access placeholder that has already been used"), null;
              n.attr("data-str-visited-flag", "true")
            }
            return n
          }, e.prototype.replaceTemplatedKeyWithPlacementKey = function() {
            var e, t, n, r;
            e = new STR.Tag.Helpers.DfpMessageListener, r = STR.Vendor.$('div[data-str-native-key="%%PATTERN:strnativekey%%"],div[data-str-native-key=""]').first(), t = e.findPkeyFromPreviousDom(r);
            if (t !== null) return n = t.attr("data-str-set-targeting-placement"), r.attr("data-str-native-key", n), STR.Tag.boot()
          }, e.prototype.getDFPIframe = function(e, t) {
            var n, r, i, s, o, u, a;
            if (e) n = STR.Vendor.$(document.getElementById(e));
            else {
              a = document.getElementsByTagName("iframe");
              for (s = o = 0, u = a.length; o < u; s = ++o) r = a[s], r.contentWindow === event.source && (i = r);
              n = STR.Vendor.$(i)
            }
            return n
          }, e.prototype.generateSTRDivTag = function(e) {
            var t;
            return t = STR.Vendor.$("<div>").attr("id", "str-native-key").attr("data-str-native-key", e.strNativeKey).css("display", "none"), e.strCreativeKey != null && t.attr("data-str-creative-key", e.strCreativeKey), e.strCampaignKey != null && t.attr("data-str-campaign-key", e.strCampaignKey), e.strClickTracker != null && t.attr("data-str-click-tracker", e.strClickTracker), t
          }, e.prototype.replaceIframeWithPlacementTag = function(e) {
            var t, n, r, i, s, o, u, a, f;
            u = null, t = e.data;
            if (typeof t == "string") {
              if (!(t.indexOf("strNativeKey") > -1 && t.indexOf("dfpIframeIdentifier") > -1)) return;
              try {
                u = JSON.parse(t)
              } catch (l) {
                i = l, console.log("Error parsing json", i.message)
              }
            }
            if (u == null || u.strNativeKey == null || u.dfpIframeIdentifier == null) return;
            try {
              r = new STR.Tag.Helpers.DfpMessageListener, o = u.dfpIframeIdentifier.replace(/\//g, "/"), n = r.getDFPIframe(o, u);
              if (n == null) return;
              return f = r.generateSTRDivTag(u), s = r.findPkeyFromPreviousDom(n), s !== null && (a = s.attr("data-str-set-targeting-placement"), f.attr("data-str-native-key", a)), n.after(f), n.remove(), STR.Vendor.$(document.getElementById(o + "__hidden__")).remove(), STR.Tag.boot()
            } catch (l) {
              return i = l, console.log("ERROR in replaceIframeWithPlacementTag", i.message)
            }
          }, e
        }()
      }.call(this),
      function() {
        var e = [].slice;
        STR.Tag.Helpers.FunctionHelper = {
          debounce: function(t, n, r) {
            var i;
            return i = null,
              function() {
                var s, o, u;
                return s = 1 <= arguments.length ? e.call(arguments, 0) : [], u = this, o = function() {
                  return r || t.apply(u, s), i = null
                }, i ? clearTimeout(i) : r && t.apply(u, s), i = setTimeout(o, n || 100)
              }
          }
        }
      }.call(this),
      function() {
        var e;
        e = STR.Vendor.$, STR.Tag.Helpers.HostedVideoHelper = function() {
          function t(t, n, r, i) {
            !t.creative.force_click_to_play && i.placement.allowInstantPlay && !e(n).hasClass("str-no-instant") ? (t.creative.instant_play = !0, this.canAutoPlayHTML5Video = STR.Tag.Helpers.canAutoPlayHTML5Video(), this.canAutoPlayHTML5Video ? (new STR.Tag.Views.InstantPlayHtml5(t, n, r, i)).render() : (new STR.Tag.Views.InstantPlaySprite(t, n, r, i)).render()) : (new STR.Tag.Views.Html5Player(t, n, r, i)).render()
          }
          return t.prototype.render = function() {}, t
        }()
      }.call(this),
      function() {
        STR.Tag.Helpers.Html5Video = {
          generateObjectMarkup: function(e, t, n, r, i) {
            var s;
            return s = STR.Vendor.$("<video>").attr("width", n).attr("height", r).attr("class", "str-html5video-player").attr("src", e).attr("poster", t), i ? s.attr("muted", "true") : s.attr("controls", "true"), s
          }
        }
      }.call(this),
      function() {
        STR.Tag.Helpers.HtmlUtility = {
          decodeString: function(e) {
            var t;
            return e && (t = e.indexOf("<") > -1 && e.indexOf(">") > -1, t || (e = STR.Vendor.$("<div/>").html(e).text())), e
          },
          getParameterByName: function(e) {
            var t, n;
            return e = e.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]"), t = new RegExp("[\\?&]" + e + "=([^&#]*)"), n = t.exec(this.queryString()), n === null || n === "false" ? n = !1 : decodeURIComponent(n[1]).replace(/\+/g, " ") === "true" ? n = !0 : decodeURIComponent(n[1]).replace(/\+/g, " ") === "false" || decodeURIComponent(n[1]).replace(/\+/g, " ") === "0" ? n = !1 : n = decodeURIComponent(n[1]).replace(/\+/g, " "), n
          },
          queryString: function() {
            return location.search
          },
          previewBackfillOnce: !1,
          previewBackfill: function() {
            return this.previewBackfillOnce ? !1 : (this.previewBackfillOnce = !0, this.getParameterByName("str_preview_backfill"))
          },
          previewMediation: function() {
            return this.getParameterByName("str_preview_mediation")
          },
          selectThirdParty: function() {
            return this.getParameterByName("str_select_third_party")
          },
          forceBackfill: function() {
            return this.getParameterByName("str_force_backfill")
          },
          forceFeaturedContent: function() {
            return this.getParameterByName("str_force_featured_content")
          }
        }
      }.call(this),
      function() {
        var e;
        e = STR.Vendor.$, STR.Tag.Helpers.LoadWelcomeFormHelper = {
          noop: function() {},
          noop2: function() {},
          load: function() {
            if (STR.Tag.welcomeFormLoaded != null) return;
            return e(".str-integration-placeholder").each(function(t, n) {
              var r, i;
              return r = e(n), STR.Tag.placementKey = r.attr("data-str-native-key"), STR.Tag.referrer = window.document.referrer, r.removeAttr("data-str-visited-flag"), i = "43347a47", r.attr("data-str-creative-key", i), STR.Tag.placements = {}, STR.Tag.boot()
            }), STR.Tag.welcomeFormLoaded = !0
          }
        }
      }.call(this),
      function() {
        var e;
        e = STR.Vendor.$, STR.Tag.Helpers.MediationHelper = {
          mediateNextThirdPartyPartner: function(t, n) {
            var r, i;
            if (STR.Tag.Helpers.HtmlUtility.previewMediation()) {
              console.log("There is no fill for third party partner");
              return
            }
            return i = null, e("[data-str-mediation-key]").each(function(r, s) {
              if (e(s).attr("data-str-mediation-key") === t && e(s).attr("data-str-placement-index") === n) return i = s
            }), STR.Tag.Models.MediationTracker.fireNoFillForPriorThirdPartyPartner(t, n), r = STR.Tag.placements[t].creativeStore, (new STR.Tag.Models.Waterfall(i, r, t, {
              mediation: !0
            })).findViewAndRender()
          },
          findPlacementKey: function() {
            var e, t, n;
            return t = STR.Vendor.$("#str-in-prog"), n = t.closest("[data-str-mediation-key]").attr("data-str-mediation-key"), e = t.closest("[data-str-mediation-key]").attr("data-str-placement-index"), t.attr("id", "str-done"), [n, e]
          }
        }
      }.call(this),
      function() {
        STR.Tag.Helpers.MediationMessageListener = function() {
          function e() {}
          return e.prototype.registerListener = function() {
            return window.addEventListener("message", this.replaceIframeWithNextThirdPartyTag)
          }, e.prototype.replaceIframeWithNextThirdPartyTag = function(e) {
            var t, n, r, i, s, o, u, a, f, l, c, h, p, d;
            f = null, n = e.data;
            if (typeof n == "string") {
              if (!(n.indexOf("STRMessage") > -1)) return;
              try {
                f = JSON.parse(n)
              } catch (v) {
                i = v, console.log("Error parsing json", i.message)
              }
            }
            if (f == null || f.STRMessage == null || f.STRMessage !== "mediateNext") return;
            try {
              t = window, e.source.parent === t ? s = e.source : s = e.source.parent, d = document.getElementsByTagName("iframe");
              for (a = h = 0, p = d.length; h < p; a = ++h) o = d[a], o.contentWindow === s && (u = o);
              c = STR.Vendor.$(u), l = c.closest("[data-str-mediation-key]").attr("data-str-mediation-key"), r = c.closest("[data-str-mediation-key]").attr("data-str-placement-index"), c.remove();
              if (l && r) return STR.Tag.Helpers.MediationHelper.mediateNextThirdPartyPartner(l, r)
            } catch (v) {
              return i = v, console.log("ERROR in replaceIframeWithNextThirdPartyTag", i.message)
            }
          }, e
        }()
      }.call(this),
      function() {
        STR.Tag.Helpers.ObjectHelper = {
          replaceCacheBusterParam: function(e) {
            return e = e.replace("[timestamp]", (new Date).getTime()), e.replace(/%%/g, "%25%25")
          },
          isHttps: function() {
            return window.location.protocol === "https:"
          },
          windowLocationOrigin: function() {
            return window.location.origin
          },
          referrerParam: function(e, t) {
            var n, r;
            return e.match(/\?/) ? r = "&" : r = "?", n = "strref=" + encodeURIComponent(STR.Tag.Helpers.ObjectHelper.windowLocationOrigin()), r += n, r
          }
        }
      }.call(this),
      function() {
        var e;
        e = STR.Vendor.$, STR.Tag.Helpers.PageGeometryHelper = {
          TABLET_MIN_WIDTH: 768,
          viewportDimensions: function() {
            var e, t;
            return t = e = 0, typeof window.innerWidth == "number" ? (t = window.innerWidth, e = window.innerHeight) : document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight) ? (t = document.documentElement.clientWidth, e = document.documentElement.clientHeight) : document.body && (document.body.clientWidth || document.body.clientHeight) && (t = document.body.clientWidth, e = document.body.clientHeight), [t, e]
          },
          elementDimensions: function(e) {
            var t;
            return t = e.getBoundingClientRect(), [t.width, t.height]
          },
          elementPosition: function(e) {
            var t, n;
            t = e.offsetLeft, n = e.offsetTop;
            while (e.offsetParent) e = e.offsetParent, t += e.offsetLeft, n += e.offsetTop;
            return [t, n]
          },
          thumbnailDimensions: function(t) {
            var n, r, i;
            return i = e(t).find(".str-thumbnail"), r = i != null ? i.width() : void 0, n = i != null ? i.height() : void 0, [r, n]
          },
          isDesktopAndTablet: function() {
            return this.viewportDimensions()[0] >= this.TABLET_MIN_WIDTH
          }
        }
      }.call(this),
      function() {
        STR.Tag.Helpers.PostEngagementDisplayHelper = {
          get: function(e, t, n, r, i, s, o) {
            return s == null && (s = !1), o == null && (o = !1), s ? new STR.Tag.Views.VideoOverlay(e, t, n, i, s, o) : new STR.Tag.Views.Card(e, t, n, i, s, o)
          }
        }
      }.call(this),
      function() {
        var e;
        e = STR.Vendor.$, STR.Tag.Helpers.SharingHelper = {
          isSharingButton: function(e) {
            return STR.Vendor.$(e).parents().hasClass("str-sharing-container")
          },
          facebookShareUrl: function(e) {
            return "http://www.facebook.com/sharer.php?u=" + e
          },
          twitterShareUrl: function(e, t) {
            return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(t) + "&url=" + encodeURIComponent(e)
          },
          emailShareUrl: function(e, t, n) {
            var r;
            return r = n + " Click here to learn more: " + e, "mailto:?subject=" + encodeURIComponent(t) + "&body=" + encodeURIComponent(r)
          },
          createSharingElement: function(t, n, r, i, s, o) {
            var u, a, f, l, c;
            return f = "<span class='str-button-text'>" + r + "</span>", l = "<span class='str-sharing-icon'></span>", c = n === "custom" ? f : f + l, a = e("<a>", {
              "class": "str-" + n + "-share str-share-button",
              target: "_blank",
              href: i,
              html: c
            }), u = e("<div>", {
              "class": "str-sharing-container str-" + n + "-container"
            }).append(a), a.on("click", function(e) {
              return function() {
                return t.handleShare(n), o.trigger("str-share-clicked")
              }
            }(this)), s.append(u)
          },
          createCardSharing: function(e, t, n, r) {
            var i;
            e.share_url && (i = STR.Tag.Helpers.SharingHelper, this.createSharingElement(t, "facebook", "", i.facebookShareUrl(e.share_url), n, r), this.createSharingElement(t, "twitter", "", i.twitterShareUrl(e.share_url, e.title), n, r), this.createSharingElement(t, "email", "", i.emailShareUrl(e.share_url, e.title, e.description), n, r));
            if (this.customButtonPresent(e)) return this.createSharingElement(t, "custom", e.custom_engagement_label, e.custom_engagement_url, n, r)
          },
          customButtonPresent: function(e) {
            return !!e.custom_engagement_url
          }
        }
      }.call(this),
      function() {
        var e;
        e = STR.Vendor.$, STR.Tag.Helpers.SlickStyleHelper = {
          getStyleTag: function() {
            var t;
            return t = e("<style>"), t.append(".slick-slider{position:relative;display:block;box-sizing:border-box;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-touch-callout:none;-khtml-user-select:none;-ms-touch-action:pan-y;touch-action:pan-y;-webkit-tap-highlight-color:transparent}.slick-list{position:relative;display:block;overflow:hidden;margin:0;padding:0;width:100%}.slick-list:focus{outline:0}.slick-list.dragging{cursor:pointer;cursor:hand}.slick-slider .slick-track,.slick-slider .slick-list{-webkit-transform:translate3d(0,0,0);-moz-transform:translate3d(0,0,0);-ms-transform:translate3d(0,0,0);-o-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}.slick-track{position:relative;top:0;left:0;display:block}.slick-track:before,.slick-track:after{display:table;content:''}.slick-track:after{clear:both}.slick-loading .slick-track{visibility:hidden}.slick-slide{display:none;float:left;height:100%;min-height:1px}[dir='rtl'] .slick-slide{float:right}.slick-slide img{display:block}.slick-slide.slick-loading img{display:none}.slick-slide.dragging img{pointer-events:none}.slick-initialized .slick-slide{display:block}.slick-loading .slick-slide{visibility:hidden}.slick-vertical .slick-slide{display:block;height:auto;border:1px solid transparent}.slick-arrow.slick-hidden{display:none}"), t.append("@charset 'UTF-8';.slick-next,.slick-next:focus,.slick-next:hover,.slick-prev,.slick-prev:focus,.slick-prev:hover{color:transparent;background:0 0;outline:0}.slick-dots,.slick-next,.slick-prev{position:absolute;display:block;padding:0}.slick-dots li button:before,.slick-next:before,.slick-prev:before{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.slick-next,.slick-prev{z-index:1;font-size:0;line-height:0;top:50%;width:20px;height:20px;-webkit-transform:translate(0,-50%);-ms-transform:translate(0,-50%);transform:translate(0,-50%);cursor:pointer;border:none}.slick-next:focus:before,.slick-next:hover:before,.slick-prev:focus:before,.slick-prev:hover:before{opacity:1}.slick-next.slick-disabled:before,.slick-prev.slick-disabled:before{opacity:.25}.slick-next:before,.slick-prev:before{font-size:25px;line-height:1;opacity:.75;color:black;}.slick-prev{left:0}[dir=rtl] .slick-prev{right:-25px;left:auto}.slick-prev:before{content:'âŸ¨'}.slick-next:before,[dir=rtl] .slick-prev:before{content:'âŸ©'}.slick-next{right:0}[dir=rtl] .slick-next{right:auto;left:-25px}[dir=rtl] .slick-next:before{content:'â†'}.slick-dotted.slick-slider{margin-bottom:0}.slick-dots{bottom:0;width:100%;margin:0;list-style:none;text-align:center}.slick-dots li{position:relative;display:inline-block;width:20px;height:20px;margin:0 0px;padding:0;cursor:pointer}.slick-dots li button{font-size:0;line-height:0;display:block;width:20px;height:20px;padding:5px;cursor:pointer;color:transparent;border:0;outline:0;background:0 0}.slick-dots li button:focus,.slick-dots li button:hover{outline:0}.slick-dots li button:focus:before,.slick-dots li button:hover:before{opacity:1}.slick-dots li button:before{font-size:25px;line-height:20px;position:absolute;top:0;left:0;width:20px;height:20px;content:'â€¢';text-align:center;opacity:.25;color:#000}.slick-dots li.slick-active button:before{opacity:.75;color:#000}"), t
          }
        }
      }.call(this),
      function() {
        STR.Tag.Helpers.StyleHelper = {
          sharingStyle: function(e) {
            return "#" + e + " div { margin: 0px; padding: 0px; } .str-clear{ clear: both; } #" + e + " .str-embed-wrapper, #" + e + " .str-details-wrapper { width:100%; } #" + e + " .str-embed-container { padding-bottom: 56.25%; height: 0; overflow: hidden; position: relative; } #" + e + " iframe.str-embed-video { position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; max-height: 100%; } #" + e + " .str-sharing-container { margin-bottom:3px; float: left; } #" + e + " .str-sharing-icon { background-size: cover; background-repeat: no-repeat; background-position: 50%; } #" + e + " a.str-facebook-share { background-color: #3c5a98; } #" + e + " a.str-twitter-share { background-color: #00B0ED; } #" + e + " a.str-email-share { background-color: #0084C6; } #" + e + " a.str-custom-share { background-color: #37B99A; }"
          },
          cardStyle: function(e) {
            return "#" + e + ".str-overlay { display:none; position: absolute; width: 100%; background: #000; font-family: Helvetica Neue, Helvetica, sans-serif; opacity: .5; z-index:100; } .str-card-open { overflow: visible !important; } #" + e + " .str-embed-container.str-article-content{ padding-bottom: 0; height: auto; overflow: hidden; position: relative; } .str-card-bg { opacity: 0; background: rgba(0,0,0,0.8); position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 999999998; cursor: default; overflow: hidden; } .str-card-container { background: white; position: absolute; top: 0; left: 0; width: 100%; height: 100%; font-family: Helvetica Neue, Helvetica, sans-serif; box-shadow: 0 0 12px 0 rgba(0,0,0,0.4); z-index: 999999999; cursor: default; opacity: 0; overflow: hidden; outline: none !important; } .str-card-container * { box-sizing: border-box; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; font-family: Helvetica Neue, Helvetica, sans-serif; } .str-card-wrapper { opacity: 0; } .str-no-scroll { overflow: hidden !important; height: auto !important; } .str-header { position: relative; top: 0; left: 0; height: 60px; width: 100%; text-align: center; @include transition(all 500ms ease); } #" + e + " .str-header .str-advertiser { display: inline-block; margin: 2px 0 0; color: black; line-height: 14px; font-size: 14px; font-weight: bold; max-width: calc(100% - 70px); } .str-header .ad-sub { display: block; margin-bottom: 5px; font-weight: 400; font-size: 12px; color: #ababab; } #" + e + " .header-controls { position: relative; height: 100%; width: 100%; padding: 10px 20px; background: #ffffff; background: -moz-linear-gradient(top,  #ffffff 0%, #eeeeee 100%); background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#ffffff), color-stop(100%,#eeeeee)); background: -webkit-linear-gradient(top,  #ffffff 0%,#eeeeee 100%); background: -o-linear-gradient(top,  #ffffff 0%,#eeeeee 100%); background: -ms-linear-gradient(top,  #ffffff 0%,#eeeeee 100%); background: linear-gradient(to bottom,  #ffffff 0%,#eeeeee 100%); filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffffff', endColorstr='#eeeeee',GradientType=0 ); border-bottom: 1px solid #e0e0e0; color: #777; padding: 10px 15px; z-index: 100; } #" + e + " .privacy-policy { background: white; position: absolute; top: -75%; width: 100%; padding: 20px 20px 5px; font-size: 12px; line-height: 18px; color: #777; text-align: center; box-shadow: 0 2px 6px 0 rgba(0,0,0,0.2); z-index:99; } #" + e + " .privacy-policy a { color: #37b99a; font-weight: 400; text-decoration: none; } .privacy-policy button { background: none; display: block; position: relative; margin: 10px auto 0; color: #777; text-align: center; border: none; outline: 0; } .privacy-policy .str-ico-up { width: 24px; height: 24px; display: block; margin: auto; } #" + e + " .str-footer { background: white; background: -moz-linear-gradient(top,  #ffffff 0%, #eeeeee 100%); background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#ffffff), color-stop(100%,#eeeeee)); background: -webkit-linear-gradient(top,  #ffffff 0%,#eeeeee 100%); background: -o-linear-gradient(top,  #ffffff 0%,#eeeeee 100%); background: -ms-linear-gradient(top,  #ffffff 0%,#eeeeee 100%); background: linear-gradient(to bottom,  #ffffff 0%,#eeeeee 100%); filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffffff', endColorstr='#eeeeee',GradientType=0 ); padding: 15px; box-shadow: 0 -1px 0  0 #e0e0e0; bottom: 0; left: 0; width: 100%; height: 60px; text-align: center; } .str-ico-info, .str-ico-close, .str-ico-up { background-repeat: no-repeat; background-position: 50%; display: inline-block; cursor:pointer; width:24px; height:40px; } .str-ico-up { background-image: url('" + STR.Tag.ClientJsUrl + "/assets/card-icon-sprite.png'); background-size: 257px 24px; background-position: -52px -1px; } .str-ico-info { background-image: url('" + STR.Tag.ClientJsUrl + "/assets/card-icon-sprite.png'); background-size: 257px 24px; background-position: -25px 8px; float:right; width: 25px; } .str-ico-close { background-image: url('" + STR.Tag.ClientJsUrl + "/assets/card-icon-sprite.png'); background-size: 185px 18px; background-position: 6px 11px; float:left; } a .str-sharing-icon { float: left; margin: 3px 20px 0 0; height: 24px; width: 24px; } #" + e + " a.str-facebook-share .str-sharing-icon { background-image: url('" + STR.Tag.ClientJsUrl + "/assets/card-icon-sprite.png'); background-size: 257px 24px; background-position: -103px 0px; } #" + e + " a.str-twitter-share .str-sharing-icon { background-image: url('" + STR.Tag.ClientJsUrl + "/assets/card-icon-sprite.png'); background-size: 257px 24px; background-position: -129px 0px; } #" + e + " a.str-email-share .str-sharing-icon { background-image: url('" + STR.Tag.ClientJsUrl + "/assets/card-icon-sprite.png'); background-size: 257px 24px; background-position: -77px 0px; } #" + e + " a.str-custom-share .str-sharing-icon { background-color: #37B99A; } #" + e + ".str-overlay a.str-facebook-share .str-sharing-icon { background-position: -205px 0px; margin-left: 15px; margin-top: 5px; } #" + e + ".str-overlay a.str-email-share .str-sharing-icon { background-position: -179px 0px; margin-top: 5px; } #" + e + ".str-overlay a.str-twitter-share .str-sharing-icon { background-position: -231px 0px; margin-top: 5px; } #" + e + " a.str-custom-share { float: right; height: 40px; margin-top: -5px; padding: 0 15px; font-size: 12px; line-height: 40px; color: #fff; border-radius: 3px; } #" + e + " .str-custom-container { float: right; } #" + e + " .str-card-wrapper.video .str-embed-wrapper, #" + e + " .str-card-wrapper.hosted-video .str-embed-wrapper #" + e + " .str-card-wrapper.autoplay .str-embed-wrapper { background-color: black; } @media only screen and (max-width: 767px) { #" + e + " .str-container { position: fixed; overflow: auto; overflow-y: auto; overflow-x: hidden; } #" + e + " .str-card-wrapper { height: 100%; } #" + e + " .str-embed-wrapper { height: calc(100% - 120px); height: -webkit-calc(100% - 120px); height: -moz-calc(100% - 120px); overflow: auto; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; } #" + e + " .str-embed-container { position: relative; top: 50%; transform: translateY(-50%); -webkit-transform: translateY(-50%); -moz-transform: translateY(-50%); } #" + e + " .str-embed-container.str-article-content { top: 0; transform: none; -webkit-transform: none; -moz-transform: none; } }"
          }
        }
      }.call(this),
      function() {
        var e, t = function(e, t) {
          return function() {
            return e.apply(t, arguments)
          }
        };
        e = STR.Vendor.$, STR.Tag.Helpers.TagUserInformationProvider = function() {
          function n() {
            this._storeCriteoUid = t(this._storeCriteoUid, this), this._storeBlueKaiUid = t(this._storeBlueKaiUid, this), this._setupCriteoProvider = t(this._setupCriteoProvider, this), this._setupBlueKaiProvider = t(this._setupBlueKaiProvider, this), this.callbacks = [], this.userInformation = new STR.Tag.Models.UserInformation, this.disableThirdPartyTracking = e("[data-str-disable-tracking]").length > 0, this.disableThirdPartyTracking || (this._setupBlueKaiProvider(), this._setupCriteoProvider())
          }
          return n.prototype.whenUidReady = function(e) {
            return this._isFinished() ? e(this.userInformation.uid(), this.userInformation) : this.callbacks.push(e)
          }, n.prototype.adServerParams = function() {
            return this.userInformation.adServerParams()
          }, n.prototype.beaconParams = function() {
            return this.userInformation.beaconParams()
          }, n.prototype.dmpBeaconParams = function(e) {
            return this.userInformation.dmpBeaconParams(e)
          }, n.prototype._setupBlueKaiProvider = function() {
            return this.blueKaiUidProvider = STR.Tag.Helpers.BlueKaiHelpers.init(), this.blueKaiUidProvider.whenUidReady(this._storeBlueKaiUid)
          }, n.prototype._setupCriteoProvider = function() {
            return this.criteoUidProvider = STR.Tag.Helpers.CriteoHelper.init(), this.criteoUidProvider.whenUidReady(this._storeCriteoUid)
          }, n.prototype._storeBlueKaiUid = function(e, t, n) {
            return this.userInformation.bluekai.uid = e, this.userInformation.bluekai.status = t, this.userInformation.bluekai.targets = n, this._triggerFinished()
          }, n.prototype._storeCriteoUid = function(e, t) {
            return this.userInformation.criteo.uid = e, this.userInformation.criteo.status = t, this._triggerFinished()
          }, n.prototype._triggerFinished = function() {
            var e, t, n, r, i;
            if (this.userInformation.isReady()) {
              r = this.callbacks, i = [];
              for (t = 0, n = r.length; t < n; t++) e = r[t], i.push(e(this.userInformation.uid(), this.userInformation));
              return i
            }
          }, n.prototype._isFinished = function() {
            return this.disableThirdPartyTracking || this.userInformation.isReady()
          }, n
        }()
      }.call(this),
      function() {
        STR.Tag.Helpers.TargetElementHelper = {
          locateTarget: function(e) {
            return this.dfpWrapper(e) != null ? this.dfpWrapper(e) : e
          },
          dfpWrapper: function(e) {
            return STR.Vendor.$(e).parents("div[id^='div-gpt-ad']").not("div[id$='ad_container']")[0]
          }
        }
      }.call(this),
      function() {
        STR.Tag.Helpers.TextHelper = {
          clampText: function() {
            var e, t, n, r, i, s, o;
            t = document.getElementsByClassName("str-text-clamp");
            if (t) {
              o = [];
              for (i = 0, s = t.length; i < s; i++) e = t[i], n = e.getAttribute("data-str-text-clamp"), r = Math.floor(n), o.push(STR.Vendor.Clamp(e, r));
              return o
            }
          }
        }
      }.call(this),
      function() {
        STR.Tag.Helpers.UidHelper = {
          setup: function() {
            var e;
            return STR.currentSession || (STR.currentSession = STR.Vendor.UUID.generate()), (e = STR.Tag.Helpers).UidProvider || (e.UidProvider = new STR.Tag.Helpers.TagUserInformationProvider)
          }
        }
      }.call(this),
      function() {
        var e;
        e = STR.Vendor.$, STR.Tag.Helpers.VisibilityHelper = function() {
          function t(t, n, r, i, s) {
            this.creative = t, this.element = n, this.$element = e(n), this.placementKey = r, this.placement = i, this.tracker = s
          }
          return t.prototype.insertThirdPartyTags = function() {
            var e, t, n, r;
            e = this.determineAdvertiser(), this.insertMoatTag(this.$element, e, this.creative.campaign_key, this.creative.creative_key, this.creative.variant_key, this.creative.source_id, this.placement.placementAttributes.site_key, this.placementKey), this.insertIframedTag(this.$element), r = this.findSurroundingElements(), n = r[0], t = r[1], n && (this.insertMoatTag(n, e, this.creative.campaign_key, this.creative.creative_key, this.creative.variant_key, this.creative.source_id, this.placement.placementAttributes.site_key, this.placementKey, "-prev"), n.attr("data-str-sibling", this.creative.creative_key));
            if (t) return this.insertMoatTag(t, e, this.creative.campaign_key, this.creative.creative_key, this.creative.variant_key, this.creative.source_id, this.placement.placementAttributes.site_key, this.placementKey, "-next"), t.attr("data-str-sibling", this.creative.creative_key)
          }, t.prototype.insertMoatTag = function(e, t, n, r, i, s, o, u, a) {
            var f;
            return a == null && (a = ""), this.setupGlobalMoatFunctions(t, n, r, o, s, u, a), f = "<script src='https://z.moatads.com/sharethroughv2465247317527/moatad.js?" + STR.Vendor.$.param(this.getMoatCustomParams(t, n, r, i, s, o, u, a)) + "' type='text/javascript'></script>", e.append(f)
          }, t.prototype.insertIframedTag = function(e) {
            var t, n;
            if (["def3f946", "preview-key"].indexOf(this.placementKey) >= 0) return n = this.generateFriendlyIframe(e), e.append(n), t = n.contentWindow.document, t.open(), t.write('<script src="https://z.moatads.com/sharethroughtrial776590751407/moatad.js?moatClientLevel1=&amp;moatClientLevel2=SuPFBmtFK3JEXRnkTQ3WRkkZ&amp;moatClientLevel3=sam-qf7z5eqYz9mJFYeEo2Qef3tF&amp;moatClientLevel4=59tQvAdnYDZ2kcrSCvopV1rU&amp;moatClientSlicer1=b3f99c9f62d349f7fa3bc411&amp;moatClientSlicer2=38ed408d&amp;zMoatDSP=sam&amp;zMoatURLFunc=str-third-party-sam-qf7z5eqYz9mJFYeEo2Qef3tF-38ed408d&amp;zMoatIsInView=str-visibility-sam-qf7z5eqYz9mJFYeEo2Qef3tF-38ed408d&amp;zMoatTimeInView=str-time-sam-qf7z5eqYz9mJFYeEo2Qef3tF-38ed408d" type="text/javascript"></script>'), t.close()
          }, t.prototype.generateFriendlyIframe = function(e) {
            var t;
            return t = document.createElement("iframe"), t.src = "javascript:false", t.style.border = "none", t.style.width = "1px", t.style.height = e.outerHeight() + "px", t.style.top = 0, t.style.right = 0, t.style.position = "absolute", t
          }, t.prototype.getMoatCustomParams = function(e, t, n, r, i, s, o, u) {
            return {
              moatClientLevel1: e != null ? e.replace(/[!'()*]/g, escape) : void 0,
              moatClientLevel2: t,
              moatClientLevel3: n + u,
              moatClientLevel4: r,
              moatClientSlicer1: s,
              moatClientSlicer2: o,
              zMoatDSP: i,
              zMoatURLFunc: u ? "" : this.thirdPartyGuid(n, o, u),
              zMoatIsInView: u ? "" : this.isVisibleGuid(n, o, u),
              zMoatTimeInView: this.timeInViewGuid(n, o, u)
            }
          }, t.prototype.setupGlobalMoatFunctions = function(e, t, n, r, i, s, o) {
            this.setupTimeInViewFunction(n, s, o);
            if (!o) return this.setupVisibleBeacons(n, s, o), this.setupVisibleEvents(n, s, o)
          }, t.prototype.setupVisibleBeacons = function(e, t, n) {
            var r, i, s, o, u;
            r = [], r.push(this.generateVisibleBeacon());
            if (this.placement.status === "live" || ["demo-key", "preview-key"].indexOf(this.placementKey) >= 0) {
              u = this.creative.beacons.visible;
              for (s = 0, o = u.length; s < o; s++) i = u[s], r.push(STR.Tag.Helpers.ObjectHelper.replaceCacheBusterParam(i))
            }
            return window[this.thirdPartyGuid(e, t, n)] = function(e) {
              return function() {
                return r
              }
            }(this)
          }, t.prototype.setupVisibleEvents = function(e, t, n) {
            return window[this.isVisibleGuid(e, t, n)] = function(e) {
              return function(t) {
                return t ? e.$element.trigger("view:visible") : e.$element.trigger("view:notVisible")
              }
            }(this)
          }, t.prototype.setupTimeInViewFunction = function(e, t, n) {
            return window[this.timeInViewGuid(e, t, n)] = function(e) {
              return function(t) {
                return e.tracker.trackEvent("timeInView", {
                  duration: t,
                  sibling: n.replace(/-/, "")
                })
              }
            }(this)
          }, t.prototype.generateVisibleBeacon = function() {
            var t;
            return t = {
              type: "visible"
            }, this.tracker.cannon.generateBeaconRequest(STR.Tag.TrackingHost, "butler", e.extend({}, this.tracker.defaultBeaconParams, t))
          }, t.prototype.thirdPartyGuid = function(e, t, n) {
            return "str-third-party-" + e + "-" + t + n
          }, t.prototype.isVisibleGuid = function(e, t, n) {
            return "str-visibility-" + e + "-" + t + n
          }, t.prototype.timeInViewGuid = function(e, t, n) {
            return "str-time-" + e + "-" + t + n
          }, t.prototype.determineAdvertiser = function() {
            return this.creative.source_id === "sfp" ? this.placement.placementAttributes.publisher_key : this.creative.source_id === "sam" ? this.creative.advertiser_key : this.creative.advertiser
          }, t.prototype.findSurroundingElements = function() {
            var e, t, n, r;
            if (["1604fe49", "5a23d2be", "615e11e1", "6Yv3Ftsoa1RnY185H3s1vqqT", "4W9QfGQYmoe2ZodGHQacSn3L", "PDoPwCrKzGH9Twd9BtZKXtAF", "7962067c", "7VQoHqDS5mgPdJ3xMFKPXQ2q", "c1313fc4", "15369b68", "311da8c5", "e39e56dd"].indexOf(this.placementKey) >= 0) {
              e = this.$element, r = [];
              while (this.continueSearching(r)) {
                r = e.siblings(), t = e.next(), n = e.prev(), e = e.parent();
                if (e.get(0).tagName === "BODY") break
              }
              return [n, t]
            }
            return [void 0, void 0]
          }, t.prototype.continueSearching = function(e) {
            if (e.length === 0) return !0;
            if (e.length === 1)
              if (e[0].offsetParent === null || e[0].offsetHeight === 0) return !0;
            return !1
          }, t
        }()
      }.call(this),
      function() {
        var e, t, n = function(e, t) {
          return function() {
            return e.apply(t, arguments)
          }
        };
        e = STR.Vendor.$, t = STR.Vendor.Mustache, STR.Tag.Views.AdUnit = function() {
          function r(t, r, i, s) {
            this.handleClick = n(this.handleClick, this), this.render = n(this.render, this);
            var o, u;
            this.creative = t.creative, this.creativePayload = t, this.placementIndex = s.creativeRequestIndex, this.element = r, this.$element = e(r), this.placementKey = i, this.placement = s.placement, this.template = s.getTemplate(), o = e(r).find("div[data-str-click-tracker]").addBack("div[data-str-click-tracker]").data("str-click-tracker"), o && this.creative.beacons.click.push(o), u = "" + this.creative.creative_key + "-" + this.placementKey + "-" + this.placementIndex, this.guid = u.replace(/[^a-zA-Z0-9]/g, ""), this.placeholderImage = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
          }
          return r.prototype.EMBED_MINIMUM_WIDTH = 225, r.prototype.SHARE_LABEL_MIN_WIDTH = 360, r.prototype.render = function() {
            var e;
            return this.swapTagWithRenderedCreative(), this.$element.on("click", this.handleClick), this.tracker = new STR.Tag.Models.ViewTracker({
              element: this.element,
              creativeKey: this.creative.creative_key,
              variantKey: this.creative.variant_key,
              placementKey: this.placementKey,
              beacons: this.creative.beacons,
              beaconMetaData: this.creative.beaconMetaData,
              price: this.creativePayload.price,
              priceType: this.creativePayload.priceType,
              priceSignature: this.creativePayload.signature,
              inPlace: this.inPlace(),
              placementIndex: this.placementIndex,
              placementStatus: this.creative.placementStatus,
              dmp: this.creativePayload.dmp,
              arid: this.creative.arid,
              awid: this.creativePayload.auctionWinId,
              deal_id: this.creative.deal_id != null ? this.creative.deal_id : void 0,
              featuredContent: this.creative.featured_content
            }), e = new STR.Tag.Helpers.VisibilityHelper(this.creative, this.element, this.placementKey, this.placement, this.tracker), e.insertThirdPartyTags(), this.adUnitRendered(this.placementKey, this.creative.action, this.creative.arid)
          }, r.prototype.adUnitRendered = function(e, t, n) {
            return STR.Tag.Models.PerformanceTracker.fireAdUnitRenderedBeacon(e, t, n)
          }, r.prototype.swapTagWithRenderedCreative = function() {
            var t;
            return t = this.adUnitBeforeEnterDom(), this.$element.replaceWith(t), this.element = t, this.$element = e(this.element), this.adUnitAfterEnterDom()
          }, r.prototype.adUnitBeforeEnterDom = function() {
            var n, r, i;
            return this.placement.placementAttributes.allow_dynamic_cropping && this.updateThumbnailUrl(), r = t.compile(this.template), n = r(this.creative).trim(), n = e(n).filter("*")[0], this.creative.impression_html && (i = e("<div/>").html(this.creative.impression_html).text(), e(n).append(i)), this.creative.directSold || this.placeOptOut(n), this.addDataAttributes(n), n
          }, r.prototype.adUnitAfterEnterDom = function() {
            return this.placement.placementAttributes.allow_dynamic_cropping && this.updateThumbnailAfterEnterDom(), this.addLabels(), STR.Tag.Helpers.TextHelper.clampText()
          }, r.prototype.updateThumbnailAfterEnterDom = function() {
            var t;
            return this.$element.hasClass("str-thumbnail") ? t = this.$element : t = this.$element.find(".str-thumbnail"), t.length > 0 ? this.placeThumbnailWrapperAndSource(t) : (t = this.$element.find("img[src='" + this.placeholderImage + "']"), t.length > 0 ? this.placeThumbnailWrapperAndSource(t) : this.$element.children().each(function(t) {
              return function(n, r) {
                if (e(r).css("background-image") === 'url("' + t.placeholderImage + '")') return t.placeThumbnailWrapperAndSource(e(r)), !1
              }
            }(this)))
          }, r.prototype.placeThumbnailWrapperAndSource = function(e) {
            var t, n;
            return this.adjustThumbnailAspectRatio(e), n = Math.max(e.outerWidth(), 1), t = Math.max(e.outerHeight(), 1), this.placeWrapper(e, n, t), n = Math.max(e.outerWidth(), 1), t = Math.max(e.outerHeight(), 1), this.updateImgixUrl(e, n, t)
          }, r.prototype.adjustThumbnailAspectRatio = function(e) {
            var t, n;
            if (this.creative.video_aspect_ratio && ["6dc2ae98", "160993bb", "70d37b90", "8edfb47c", "h1N5areUA6UmvQ5YSGPz5QrG", "preview-key"].indexOf(this.placementKey) >= 0) return n = e.outerWidth(), t = n * this.creative.video_aspect_ratio, e.outerHeight(t)
          }, r.prototype.addDataAttributes = function(t) {
            return e(t).attr("data-str-native-key", this.placementKey), this.creative.directSold === "creative" && e(t).attr("data-str-creative-key", this.creative.creative_key), this.creative.directSold === "campaign" && e(t).attr("data-str-campaign-key", this.creative.campaign_key), e(t).attr("data-str-rendered", (new Date).getTime()), e(t).attr("data-str-visited-flag", !0), e(t).css("cursor", "pointer")
          }, r.prototype.addLabels = function() {
            if (this.$element.width() <= this.SHARE_LABEL_MIN_WIDTH) return this.$element.addClass("str-no-share-labels")
          }, r.prototype.updateThumbnailUrl = function() {
            return this.creative.original_thumbnail_url = this.creative.original_thumbnail_url || this.creative.thumbnail_url, this.creative.thumbnail_url = this.placeholderImage
          }, r.prototype.updateImgixUrl = function(e, t, n) {
            var r;
            return r = STR.Tag.Helpers.AdUnitHelper.imgixThumbnailUrl(this.creative.original_thumbnail_url, t, n), e.is("img") ? e.attr("src", r) : e.css("background-image", "url(" + r + ")")
          }, r.prototype.placeWrapper = function(t, n, r) {
            var i, s;
            if (this.$element.find(".thumbnail-wrapper").length === 0) return s = "position:relative;", n > 0 && (s += "width:" + n + "px;"), r > 0 && (s += "height:" + r + "px;"), i = e("<div>", {
              "class": "thumbnail-wrapper",
              style: s
            }), t.wrap(i), this.transferCssAttributes(t, this.$element.find(".thumbnail-wrapper")), this.placeIcon(n, r)
          }, r.prototype.placeOptOut = function(t) {
            var n;
            return e(t).find(".str-opt-out").length > 0 || (n = this.placement.placementAttributes.strOptOutIcon, e(t).append(STR.Tag.Helpers.AdUnitHelper.getOptOut(n)), e(t).css("position", "relative")), e(t).find(".str-opt-out").first().on("click", function(e) {
              return function(t) {
                return window.open(e.privacyPolicyUrl(), "_blank")
              }
            }(this))
          }, r.prototype.privacyPolicyUrl = function() {
            var e;
            return e = this.placement.placementAttributes.strOptOutUrl, this.creative.opt_out_url && this.creative.opt_out_text && (e += "&opt_out_url=" + encodeURIComponent(this.creative.opt_out_url) + "&opt_out_text=" + encodeURIComponent(this.creative.opt_out_text)), e
          }, r.prototype.transferCssAttributes = function(e, t) {
            var n, r, i, s, o;
            r = [{
              attr: "float",
              defaultVal: "none"
            }, {
              attr: "margin-top",
              defaultVal: "auto"
            }, {
              attr: "margin-right",
              defaultVal: "auto"
            }, {
              attr: "margin-bottom",
              defaultVal: "auto"
            }, {
              attr: "margin-left",
              defaultVal: "auto"
            }, {
              attr: "clear",
              defaultVal: "none"
            }], o = [];
            for (i = 0, s = r.length; i < s; i++) n = r[i], o.push(this.swapElementCss(e, t, n.attr, n.defaultVal));
            return o
          }, r.prototype.swapElementCss = function(e, t, n, r) {
            return t.css(n, e.css(n)), e.css(n, r)
          }, r.prototype.placeIcon = function(e, t) {
            var n, r;
            n = STR.Tag.Helpers.AdUnitHelper.getReplacementForType(this.creative.action);
            if (this.creative.action !== "video" || !this.inPlace())
              if (n) return r = STR.Tag.Helpers.AdUnitHelper.getIconWrapper(e), r.append(n), this.$element.find(".thumbnail-wrapper").append(r)
          }, r.prototype.handleClick = function(t) {
            var n;
            return n = !1, e(t.target).hasClass("str-opt-out") && (n = !0), n
          }, r.prototype.inPlace = function() {
            return this.$element.hasClass("str-card-exp") ? !1 : this.$element.hasClass("str-in-place") || this.thumbnailWidth() >= this.EMBED_MINIMUM_WIDTH
          }, r.prototype.thumbnailWidth = function() {
            return this.$element.find(".str-thumbnail").width()
          }, r
        }()
      }.call(this),
      function() {
        var e, t = function(e, t) {
            return function() {
              return e.apply(t, arguments)
            }
          },
          n = {}.hasOwnProperty,
          r = function(e, t) {
            function i() {
              this.constructor = e
            }
            for (var r in t) n.call(t, r) && (e[r] = t[r]);
            return i.prototype = t.prototype, e.prototype = new i, e.__super__ = t.prototype, e
          };
        e = STR.Vendor.$, STR.Tag.Views.Article = function(n) {
          function i(e, n, r, s) {
            this.trackDuration = t(this.trackDuration, this), this.placeArticleContentInPostEngagementDisplay = t(this.placeArticleContentInPostEngagementDisplay, this), i.__super__.constructor.apply(this, arguments)
          }
          return r(i, n), i.prototype.render = function() {
            return i.__super__.render.apply(this, arguments), this.initializePostEngagementDisplay()
          }, i.prototype.initializePostEngagementDisplay = function() {
            return this.postEngagementDisplay = new STR.Tag.Views.Card(this.creative, this.tracker, this.element, this.guid, !1, !0), this.postEngagementDisplay.onOpen(this.placeArticleContentInPostEngagementDisplay), this.postEngagementDisplay.onClose(this.trackDuration)
          }, i.prototype.placeArticleContentInPostEngagementDisplay = function() {
            var t, n;
            return t = e("#" + this.postEngagementDisplay.embedId), n = t.closest(".str-embed-container"), n.addClass("str-article-content"), this.insertArticleContentAfter(t, this.postEngagementDisplay.width(), this.postEngagementDisplay.contentHeight()), STR.Tag.Helpers.isiOS() && this.adjustEmbedContainer(n, this.postEngagementDisplay.contentHeight()), this.articleOpenTime = new Date, this.tracker.handleArticleView()
          }, i.prototype.trackDuration = function() {
            var e, t;
            return e = new Date, t = e - this.articleOpenTime, this.tracker.handleArticleViewDuration(t)
          }, i.prototype.handleClick = function(e) {
            if (i.__super__.handleClick.apply(this, arguments)) return;
            return this.tracker.handleClick(), e.preventDefault(), this.postEngagementDisplay.open()
          }, i.prototype.insertArticleContentAfter = function(t, n, r) {
            var i;
            return i = e("<iframe>", {
              src: this.creative.media_url,
              src: "" + this.creative.media_url + "?referrer=" + encodeURIComponent(this.windowOrigin()) + "&pkey=" + this.placementKey + "&layout=" + this.placement.layout + "&status=" + this.placement.status,
              height: "" + r,
              width: "" + n,
              frameborder: "0"
            }), t.after(i)
          }, i.prototype.adjustEmbedContainer = function(e, t) {
            return e.css({
              height: t,
              overflow: "auto",
              "-webkit-overflow-scrolling": "touch"
            })
          }, i.prototype.windowOrigin = function() {
            return window.location.origin
          }, i
        }(STR.Tag.Views.AdUnit)
      }.call(this),
      function() {
        var e, t, n = function(e, t) {
          return function() {
            return e.apply(t, arguments)
          }
        };
        e = STR.Vendor.$, t = STR.Vendor.Mustache, STR.Tag.Views.Card = function() {
          function r(t, r, i, s, o, u) {
            o == null && (o = !1), u == null && (u = !1), this.registerScreenRotationListener = n(this.registerScreenRotationListener, this), this.registerEscapeKeydownListener = n(this.registerEscapeKeydownListener, this), this.creative = t, this.tracker = r, this.cardId = "str-card-" + s, this.embedId = "str-embed-" + s, this.tagElement = i, this.$tagElement = e(i), this.$body = e("body"), this.$html = e("html"), this.$head = e("head"), this.hasOpened = o, this.postEngagementDisplayOpen = !1, this.oneClickPlay = u, this.generateHTML()
          }
          return r.prototype.toggle = function() {
            return this.postEngagementDisplayOpen ? this.close() : this.open()
          }, r.prototype.registerEscapeKeydownListener = function() {
            return this.escapeHandler = function(e) {
              return function(t) {
                if (t.keyCode === 27) return e.close()
              }
            }(this), e(document).keydown(this.escapeHandler)
          }, r.prototype.registerScreenRotationListener = function() {
            if (window.matchMedia("(max-width: 767px)").matches || window.matchMedia("(min-width: 768px) and (max-width:1024px)").matches) return this.orientationHandler = STR.Tag.Helpers.FunctionHelper.debounce(function(e) {
              return function() {
                return e.creative.action === "article" && e.resetEmbed(), STR.Tag.Helpers.CardHelper.animateIn(e.$tagElement, e.$cardBg, e.$cardContainer, e.$cardWrapper, e.creative, function() {
                  if (e.onOpenCallback != null) return e.onOpenCallback()
                }), 250
              }
            }(this)), e(window).on("orientationchange", this.orientationHandler)
          }, r.prototype.onOpen = function(e) {
            this.onOpenCallback = e;
            if (this.hasOpened) return this.onOpenCallback()
          }, r.prototype.beforeOpen = function(e) {
            this.beforeOpenCallback = e;
            if (this.hasOpened) return this.beforeOpenCallback()
          }, r.prototype.open = function() {
            if (!this.postEngagementDisplayOpen) return this.registerEscapeKeydownListener(), this.registerScreenRotationListener(), this.isSite(/nytimes.com/) || this.$html.addClass("str-no-scroll"), this.toggleMetaViewport(), this.$body.addClass("str-no-scroll").append(this.$cardContainer).append(this.$cardBg), this.$tagElement.addClass("str-card-open"), this.beforeOpenCallback != null && this.beforeOpenCallback(), STR.Tag.Helpers.CardHelper.animateIn(this.$tagElement, this.$cardBg, this.$cardContainer, this.$cardWrapper, this.creative, function(e) {
              return function() {
                e.hasOpened || e.oneClickPlay ? e.tracker.trackUserEvent("openDrawer") : e.tracker.trackUserEvent("openDrawer", {
                  engagement: !0
                }), e.hasOpened = !0, e.postEngagementDisplayOpen = !0;
                if (e.onOpenCallback != null) return e.onOpenCallback()
              }
            }(this))
          }, r.prototype.onClose = function(e) {
            return this.onCloseCallback = e
          }, r.prototype.onBeforeClose = function(e) {
            return this.onBeforeCloseCallback = e
          }, r.prototype.close = function() {
            return this.onBeforeCloseCallback != null && this.onBeforeCloseCallback(), this.tracker.trackUserEvent("closeDrawer"), this.resetEmbed(), e(document).off("keydown", this.escapeHandler), this.orientationHandler && e(window).off("resize", this.orientationHandler), STR.Tag.Helpers.CardHelper.animateOut(this.$tagElement, this.$cardBg, this.$cardContainer, this.$cardWrapper, function(e) {
              return function() {
                e.$tagElement.removeClass("str-card-open"), e.$html.removeClass("str-no-scroll"), e.$body.removeClass("str-no-scroll"), e.$cardContainer.detach(), e.$cardBg.detach(), e.toggleMetaViewport(), e.postEngagementDisplayOpen = !1;
                if (e.onCloseCallback != null) return e.onCloseCallback()
              }
            }(this))
          }, r.prototype.width = function() {
            return Math.floor(this.$cardContainer.width())
          }, r.prototype.contentHeight = function() {
            return Math.floor(this.$cardContainer.height() - STR.Tag.Helpers.CardHelper.HEADER_FOOTER_HEIGHT)
          }, r.prototype.generateHTML = function() {
            return this.createCardElement(), this.addStyle(), this.addHeader(), this.addEmbed(), this.addFooter()
          }, r.prototype.createCardElement = function() {
            return this.$cardBg = e("<div>", {
              "class": "str-card-bg"
            }).click(function(e) {
              return function(t) {
                return t.stopPropagation(), e.close()
              }
            }(this)), this.$cardContainer = e("<div>", {
              id: this.cardId,
              "class": "str-card-container"
            }).on("touchmove", function(e) {
              return e.preventDefault(), e.stopPropagation()
            }), this.$cardWrapper = e("<div>", {
              "class": "str-card-wrapper " + this.creative.action
            }).click(function(e) {
              return e.stopPropagation()
            }), this.$cardContainer.append(this.$cardWrapper)
          }, r.prototype.addStyle = function() {
            var t;
            return t = e("<style>", {
              html: STR.Tag.Helpers.StyleHelper.sharingStyle(this.cardId) + STR.Tag.Helpers.StyleHelper.cardStyle(this.cardId)
            }), this.$cardContainer.append(t)
          }, r.prototype.addHeader = function() {
            var n, i;
            this.$header = e("<div>", {
              "class": "str-header"
            }), this.$cardWrapper.append(this.$header), i = '<div class="header-controls"> <span class="str-ico-close"></span> <span class="str-advertiser"> <span class="ad-sub">{{promoted_by_text}}</span> {{brand_logo}}{{advertiser}} </span>', this.creative.directSold ? i += "</div>" : i += '<span class="str-ico-info"></span> </div> <div class="privacy-policy"> This ad is powered by Sharethrough. <a href="' + STR.Tag.BakeryUrl + '/privacy-policy.html" target="_blank">View our privacy policy</a>. <button><span class="str-ico-up"></span></button> </div>', this.creative.brand_logo_url && (i = STR.Tag.Helpers.AdUnitHelper.insertBrandLogo(i)), n = t.render(i, this.creative), this.$header.append(n), this.$header.find(".str-ico-close").click(function(e) {
              return function() {
                return e.close()
              }
            }(this));
            if (!this.creative.directSold) return this.$header.find(".str-ico-info").click(function() {
              var t;
              return t = e(this).parent().next(), r.prototype.togglePolicy(t)
            }), this.$header.find(".privacy-policy button").click(function() {
              var t;
              return t = e(this).parent(), r.prototype.togglePolicy(t)
            })
          }, r.prototype.addEmbed = function() {
            this.$embedWrapper = e("<div>", {
              "class": "str-embed-wrapper"
            }), this.$embedContainer = e("<div>", {
              "class": "str-embed-container"
            }), this.$embed = e("<div>", {
              id: this.embedId,
              "class": "str-embed-video"
            }), this.$embedContainer.append(this.$embed), this.$embedWrapper.append(this.$embedContainer), this.$cardWrapper.append(this.$embedWrapper);
            if (this.creative.video_aspect_ratio) return this.$embedContainer.css("padding-bottom", "" + this.creative.video_aspect_ratio * 100 + "%")
          }, r.prototype.addFooter = function() {
            var t;
            return this.$footer = e("<div>", {
              "class": "str-footer"
            }), this.$cardWrapper.append(this.$footer), t = STR.Tag.Helpers.SharingHelper.createCardSharing(this.creative, this.tracker, this.$footer, this.$tagElement), this.$footer.append(t)
          }, r.prototype.togglePolicy = function(e) {
            return e.hasClass("open") ? (e.removeClass("open"), e.animate({
              top: "-75%"
            }, 350, "easeInOutQuint")) : (e.addClass("open"), e.animate({
              top: "100%"
            }, 350, "easeInOutQuint"))
          }, r.prototype.resetEmbed = function() {
            return this.$embedContainer.empty(), this.$embedContainer.append(this.$embed)
          }, r.prototype.toggleMetaViewport = function() {
            var t, n;
            n = e('meta[name="viewport"]'), t = e("meta[data-str-meta-viewport]");
            if (t.length > 0) return t.detach();
            if (n.length === 0 && !this.isSite(/cbssports.com/)) return this.$head.append('<meta content="width=device-width, initial-scale=1" name="viewport" data-str-meta-viewport />')
          }, r.prototype.isSite = function(e) {
            var t;
            return t = window.location.hostname.match(e), t && t.length > 0
          }, r
        }()
      }.call(this),
      function() {
        var e, t = function(e, t) {
          return function() {
            return e.apply(t, arguments)
          }
        };
        e = STR.Vendor.$, STR.Tag.Views.Carousel = function() {
          function n(n, r, i, s) {
            this.fireSwipeBeacon = t(this.fireSwipeBeacon, this), this.$element = e(r), this.placementKey = i, this.creativeStore = s, this.template = this.creativeStore.getTemplate(), this.creativeWrapper = n, this.creative = n.creative
          }
          return n.prototype.render = function() {
            return this.renderCarousel()
          }, n.prototype.renderCarousel = function() {
            return this.slideContainer = e("<div>"), this.slideContainer.attr("data-str-native-key", this.placementKey), this.replaceElementWithSlickTemplate(), this.generateSlides(), this.addSlick(), (new STR.Tag.Views.CarouselWrapper(this.creativeWrapper, this.slideContainer[0], this.placementKey, this.creativeStore)).registerMoat()
          }, n.prototype.replaceElementWithSlickTemplate = function() {
            return this.addStyle(), this.$element.replaceWith(this.slideContainer)
          }, n.prototype.addStyle = function() {
            var e;
            return e = STR.Tag.Helpers.SlickStyleHelper.getStyleTag(), e.insertBefore(this.$element)
          }, n.prototype.generateSlides = function() {
            var t, n, r, i, s, o, u;
            this.slideContainer.attr("class", e(this.template).attr("class")), this.slideContainer.attr("style", e(this.template).attr("style")), o = this.creative.slides, u = [];
            for (i = 0, s = o.length; i < s; i++) r = o[i], n = e("<div>"), t = e("<div>"), n.append(t), this.slideContainer.append(n), this.renderSlide(r, t), u.push(this.removeClassAndStylesFromChild(n));
            return u
          }, n.prototype.removeClassAndStylesFromChild = function(e) {
            return e.children().attr("class", ""), e.children().attr("style", "")
          }, n.prototype.renderSlide = function(e, t) {
            return this.creative.media_url = e.media_url, this.creative.title = e.title, this.creative.description = e.description, this.creative.original_thumbnail_url = e.thumbnail_url, this.creative.thumbnail_url = e.thumbnail_url, (new STR.Tag.Views.CarouselSlide(this.creativeWrapper, t, this.placementKey, this.creativeStore, e.slide_key)).render()
          }, n.prototype.addSlick = function() {
            return this.slideContainer.slick({
              arrows: !0,
              dots: !0,
              infinite: !1,
              slidesToShow: 1,
              slidesToScroll: 1,
              draggable: !1,
              swipe: !0
            }), this.slideContainer.on("beforeChange", function(e) {
              return function(t, n, r, i) {
                return e.fireSwipeBeacon(r, i)
              }
            }(this))
          }, n.prototype.fireSwipeBeacon = function(e, t) {
            var n;
            return n = STR.Tag.Helpers.BeaconCannon.getInstance(), n.fireBeacon(STR.Tag.TrackingHost, "butler", {
              type: "swipe",
              placementKey: this.placementKey,
              currentIndex: e,
              nextIndex: t,
              currentSlideKey: this.creative.slides[e].slide_key,
              nextSlideKey: this.creative.slides[t].slide_key,
              arid: this.creative.arid,
              awid: this.creativeWrapper.auctionWinId
            })
          }, n
        }()
      }.call(this),
      function() {
        var e, t = function(e, t) {
            return function() {
              return e.apply(t, arguments)
            }
          },
          n = {}.hasOwnProperty,
          r = function(e, t) {
            function i() {
              this.constructor = e
            }
            for (var r in t) n.call(t, r) && (e[r] = t[r]);
            return i.prototype = t.prototype, e.prototype = new i, e.__super__ = t.prototype, e
          };
        e = STR.Vendor.$, STR.Tag.Views.Clickout = function(n) {
          function i(e, n, r, s) {
            this.isNotLearningCreative = t(this.isNotLearningCreative, this), i.__super__.constructor.apply(this, arguments)
          }
          return r(i, n), i.prototype.render = function() {
            return i.__super__.render.apply(this, arguments), this.doubleclickBeacons = this.tracker.beacons.click.filter(function(e, t, n) {
              return e.match(/doubleclick/)
            }), this.tracker.beacons.click = this.tracker.beacons.click.filter(function(e, t, n) {
              return e.match(/doubleclick/) === null
            }), STR.Tag.Helpers.UidProvider.whenUidReady(function(e) {
              return function(t) {
                return e.uid = t, e.redirectUrl = e.generateRedirectUrl(), STR.Tag.Creatives = {
                  clickoutRedirectUrl: function() {
                    return e.redirectUrl
                  }
                }
              }
            }(this))
          }, i.prototype.handleClick = function(e) {
            if (i.__super__.handleClick.apply(this, arguments)) return;
            return this.tracker.fireThirdPartyPixel(this.doubleclickBeacons), this.doubleclickBeacons = [], window.open(this.redirectUrl, "_blank")
          }, i.prototype.generateRedirectUrl = function() {
            var e;
            return e = STR.Tag.ClickoutHost + "/?clickout_url=" + this.clickoutUrl() + "&tracking_url=" + this.trackingUrl(), this.isNotLearningCreative() && (e += this.thirdPartyBeacons()), e
          }, i.prototype.isNotLearningCreative = function() {
            return this.creative.creative_key.indexOf("learning") === -1
          }, i.prototype.clickoutUrl = function() {
            var e;
            return e = this.creative.media_url, this.creative.directSold && (e += STR.Tag.Helpers.ObjectHelper.referrerParam(e)), encodeURIComponent(e)
          }, i.prototype.trackingUrl = function() {
            var t, n, r, i;
            return t = e.extend({}, this.tracker.defaultBeaconParams), t.umtime = (new Date).getTime(), t.engagement = !0, t.userEvent = "clickout", t.type = "userEvent", t.uid = this.uid, r = function() {
              var e;
              e = [];
              for (n in t) i = t[n], e.push("" + n + "=" + i);
              return e
            }(), encodeURIComponent("" + location.protocol + STR.Tag.TrackingHost + "/butler?" + r.join("&"))
          }, i.prototype.thirdPartyBeacons = function() {
            var e, t, n, r, i, s;
            t = "", s = this.tracker.beacons.click;
            for (r = 0, i = s.length; r < i; r++) e = s[r], n = e.match(/^http/) ? e : "" + location.protocol + e, t += "&tracking_url=" + encodeURIComponent(STR.Tag.Helpers.ObjectHelper.replaceCacheBusterParam(n));
            return t
          }, i
        }(STR.Tag.Views.AdUnit)
      }.call(this),
      function() {
        var e, t = {}.hasOwnProperty,
          n = function(e, n) {
            function i() {
              this.constructor = e
            }
            for (var r in n) t.call(n, r) && (e[r] = n[r]);
            return i.prototype = n.prototype, e.prototype = new i, e.__super__ = n.prototype, e
          };
        e = STR.Vendor.$, STR.Tag.Views.CarouselSlide = function(e) {
          function t(e, n, r, i, s) {
            t.__super__.constructor.apply(this, arguments), this.slideKey = s
          }
          return n(t, e), t.prototype.render = function() {
            return this.swapTagWithRenderedCreative(), this.$element.on("click", this.handleClick), this.disableViewTracker(), STR.Tag.Helpers.UidProvider.whenUidReady(function(e) {
              return function(t) {
                return e.uid = t, e.redirectUrl = e.generateRedirectUrl(), STR.Tag.Creatives = {
                  clickoutRedirectUrl: function() {
                    return e.redirectUrl
                  }
                }
              }
            }(this))
          }, t.prototype.disableViewTracker = function() {
            return this.tracker = {
              defaultBeaconParams: {
                slide_key: this.slideKey
              },
              beacons: {
                click: []
              }
            }, this.tracker.fireThirdPartyPixel = function() {
              return !0
            }
          }, t
        }(STR.Tag.Views.Clickout)
      }.call(this),
      function() {
        var e, t = {}.hasOwnProperty,
          n = function(e, n) {
            function i() {
              this.constructor = e
            }
            for (var r in n) t.call(n, r) && (e[r] = n[r]);
            return i.prototype = n.prototype, e.prototype = new i, e.__super__ = n.prototype, e
          };
        e = STR.Vendor.$, STR.Tag.Views.CarouselWrapper = function(e) {
          function t(e, n, r, i) {
            t.__super__.constructor.apply(this, arguments)
          }
          return n(t, e), t.prototype.registerMoat = function() {
            var e;
            return this.tracker = new STR.Tag.Models.ViewTracker({
              element: this.element,
              creativeKey: this.creative.creative_key,
              variantKey: this.creative.variant_key,
              placementKey: this.placementKey,
              beacons: this.creative.beacons,
              beaconMetaData: this.creative.beaconMetaData,
              price: this.creativePayload.price,
              priceType: this.creativePayload.priceType,
              priceSignature: this.creativePayload.signature,
              inPlace: this.inPlace(),
              placementIndex: this.placementIndex,
              placementStatus: this.creative.placementStatus,
              dmp: this.creativePayload.dmp,
              arid: this.creative.arid,
              awid: this.creativePayload.auctionWinId,
              deal_id: this.creative.deal_id != null ? this.creative.deal_id : void 0,
              featuredContent: this.creative.featured_content
            }), e = new STR.Tag.Helpers.VisibilityHelper(this.creative, this.element, this.placementKey, this.placement, this.tracker), e.insertThirdPartyTags(), this.adUnitRendered(this.placementKey, this.creative.action)
          }, t
        }(STR.Tag.Views.AdUnit)
      }.call(this),
      function() {
        var e, t = {}.hasOwnProperty,
          n = function(e, n) {
            function i() {
              this.constructor = e
            }
            for (var r in n) t.call(n, r) && (e[r] = n[r]);
            return i.prototype = n.prototype, e.prototype = new i, e.__super__ = n.prototype, e
          };
        e = STR.Vendor.$, STR.Tag.Views.FeaturedContent = function(t) {
          function r(e, t, n, i) {
            r.__super__.constructor.apply(this, arguments)
          }
          return n(r, t), r.prototype.render = function() {
            return r.__super__.render.apply(this, arguments), this.redirectUrl = this.generateRedirectUrl(), this.$element.addClass("str-featured-content")
          }, r.prototype.placeOptOut = function() {}, r.prototype.handleClick = function(e) {
            return window.open(this.redirectUrl, "_blank")
          }, r.prototype.generateRedirectUrl = function() {
            var e;
            return e = STR.Tag.ClickoutHost + "/?clickout_url=" + this.clickoutUrl() + "&tracking_url=" + this.trackingUrl()
          }, r.prototype.clickoutUrl = function() {
            return encodeURIComponent(this.creative.media_url)
          }, r.prototype.trackingUrl = function() {
            var t, n, r, i;
            return t = e.extend({}, this.tracker.defaultBeaconParams), t.umtime = (new Date).getTime(), t.engagement = !0, t.userEvent = "clickout", t.type = "userEvent", t.uid = "", t.featuredContent = !0, r = function() {
              var e;
              e = [];
              for (n in t) i = t[n], e.push("" + n + "=" + i);
              return e
            }(), encodeURIComponent("" + location.protocol + STR.Tag.TrackingHost + "/butler?" + r.join("&"))
          }, r
        }(STR.Tag.Views.AdUnit)
      }.call(this),
      function() {
        var e, t = function(e, t) {
            return function() {
              return e.apply(t, arguments)
            }
          },
          n = {}.hasOwnProperty,
          r = function(e, t) {
            function i() {
              this.constructor = e
            }
            for (var r in t) n.call(t, r) && (e[r] = t[r]);
            return i.prototype = t.prototype, e.prototype = new i, e.__super__ = t.prototype, e
          };
        e = STR.Vendor.$, STR.Tag.Views.VideoBase = function(e) {
          function n() {
            this.checkVideoCompletion = t(this.checkVideoCompletion, this), this.handleClose = t(this.handleClose, this), this.handleStop = t(this.handleStop, this), n.__super__.constructor.apply(this, arguments), this.sent3 = !1, this.sent10 = !1, this.sent15 = !1, this.sent30 = !1
          }
          return r(n, e), n.prototype.VIDEO_COMPLETION_INTERVAL = 1e3, n.prototype.removeThumbnail = function() {
            return this.$element.find(".str-thumbnail").remove()
          }, n.prototype.removeEmbedWrapperFromPostEngagementDisplay = function() {
            return this.$element.find(".str-embed-wrapper").remove()
          }, n.prototype.handleStop = function() {
            return this.tracker.handleVideoStop(), clearInterval(this.videoCompletionIntervalId)
          }, n.prototype.handleClose = function() {
            return this.videoTag.paused || this.tracker.handleVideoStop(), clearInterval(this.videoCompletionIntervalId)
          }, n.prototype.checkVideoCompletion = function(e, t) {
            var n;
            n = e / t * 100, this.tracker.trackCompletion(n), !this.sent3 && e >= 2.9 && (this.sent3 = !0, this.tracker.handleSilentAutoplayLength(3e3)), !this.sent10 && e >= 9.9 && (this.sent10 = !0, this.tracker.handleSilentAutoplayLength(1e4)), !this.sent15 && e >= 14.9 && (this.sent15 = !0, this.tracker.handleSilentAutoplayLength(15e3));
            if (!this.sent30 && e >= 29.9) return this.sent30 = !0, this.tracker.handleSilentAutoplayLength(3e4)
          }, n
        }(STR.Tag.Views.AdUnit)
      }.call(this),
      function() {
        var e, t = function(e, t) {
            return function() {
              return e.apply(t, arguments)
            }
          },
          n = {}.hasOwnProperty,
          r = function(e, t) {
            function i() {
              this.constructor = e
            }
            for (var r in t) n.call(t, r) && (e[r] = t[r]);
            return i.prototype = t.prototype, e.prototype = new i, e.__super__ = t.prototype, e
          };
        e = STR.Vendor.$, STR.Tag.Views.Html5Player = function(n) {
          function i(e, n, r, s) {
            this.setStartTime = t(this.setStartTime, this), this.handleStop = t(this.handleStop, this), this.pauseVideo = t(this.pauseVideo, this), this.resizeVideo = t(this.resizeVideo, this), this.togglePlay = t(this.togglePlay, this), this.handlePlay = t(this.handlePlay, this), this.placeVideoInPostEngagementDisplay = t(this.placeVideoInPostEngagementDisplay, this), i.__super__.constructor.apply(this, arguments), this.played = !1
          }
          return r(i, n), i.prototype.render = function() {
            return i.__super__.render.apply(this, arguments), this.initializePostEngagementDisplay()
          }, i.prototype.initializePostEngagementDisplay = function() {
            return this.postEngagementDisplay = STR.Tag.Helpers.PostEngagementDisplayHelper.get(this.creative, this.tracker, this.element, this.placementKey, this.guid, this.inPlace(), !0), this.postEngagementDisplay.beforeOpen != null ? (this.postEngagementDisplay.beforeOpen(this.placeVideoInPostEngagementDisplay), this.postEngagementDisplay.onOpen(this.resizeVideo)) : this.inPlace() || this.postEngagementDisplay.onOpen(this.placeVideoInPostEngagementDisplay), this.postEngagementDisplay.onBeforeClose(this.handleClose), this.$element.on("str-share-clicked", function(e) {
              return function() {
                return e.pauseVideo()
              }
            }(this))
          }, i.prototype.placeVideoInPostEngagementDisplay = function() {
            var t;
            return t = e("#" + this.postEngagementDisplay.embedId), this.insertVideoAfter(t, this.postEngagementDisplay.width(), this.postEngagementDisplay.width() * this.creative.video_aspect_ratio), t.closest(".str-embed-container").addClass("str-html5video-player"), this.playVideo()
          }, i.prototype.handleClick = function(e) {
            var t;
            if (i.__super__.handleClick.apply(this, arguments)) return;
            if (!(STR.Tag.Helpers.SharingHelper.isSharingButton(e.target) || ((t = e.target.className) != null ? t.indexOf("str-html5video-player") : void 0) >= 0)) {
              this.tracker.handleClick(), e.preventDefault(), this.postEngagementDisplay.toggle(), this.inPlace() && this.swapThumbnailWithVideo();
              if (this.postEngagementDisplay.postEngagementDisplayOpen) return this.playVideo()
            }
          }, i.prototype.handlePlay = function() {
            return this.played || (this.videoDuration = this.videoTag.duration, this.creative.instant_play !== !0 && this.tracker.handleNonYoutubePlay(this.videoDuration), this.played = !0), this.setVideoCompletionInterval()
          }, i.prototype.togglePlay = function() {
            return this.videoTag.paused || !this.played ? this.videoTag.play() : this.videoTag.pause(), !1
          }, i.prototype.swapThumbnailWithVideo = function() {
            var e;
            return e = this.$element.find(".str-thumbnail"), this.$videoElement ? this.$videoElement.insertAfter(e) : (this.autoplay && e.height() === 0 && e.height(360), this.insertVideoAfter(e, String(e.outerWidth()), String(e.outerHeight()), this.autoplay), this.inPlaceVideoTag = this.videoTag, this.$element.find(".str-embed-container").remove()), this.removeThumbnail()
          }, i.prototype.swapVideoWithThumbnail = function() {
            if (this.oldThumbnail) return this.$videoElement = this.$element.find(".str-html5video-player"), this.oldThumbnail.insertAfter(this.$videoElement), this.$videoElement.remove()
          }, i.prototype.insertVideoAfter = function(t, n, r, i) {
            var s, o, u;
            return s = e("<div>", {
              style: "position: relative; height: " + r + "px"
            }), o = STR.Tag.Helpers.Html5Video.generateObjectMarkup(this.creative.media_url, this.creative.original_thumbnail_url, n, r, i), s.append(o), this.postEngagementDisplay.preExpandedAtStart ? e(s).insertAfter(t) : t.html(s), u = this.videoTag, this.videoTag = s.find("video")[0], u && (this.startingTime = u.currentTime), s.find("video").on({
              playing: this.handlePlay,
              "ended pause": this.handleStop,
              click: this.togglePlay,
              loadeddata: this.setStartTime
            })
          }, i.prototype.resizeVideo = function(t, n) {
            var r, i;
            return i = this.postEngagementDisplay.width(), r = i * this.creative.video_aspect_ratio, e(this.videoTag).width(i).height(r)
          }, i.prototype.getPlayerWidthAsString = function() {
            var e;
            return e = Math.min(this.$element.width() - 15, 600), String(e)
          }, i.prototype.getPlayerHeightAsString = function() {
            return String(this.getPlayerHeight())
          }, i.prototype.getPlayerHeight = function() {
            return Math.round(this.getPlayerWidthAsString() * this.creative.video_aspect_ratio)
          }, i.prototype.playVideo = function() {
            return this.videoTag.play()
          }, i.prototype.pauseVideo = function() {
            return this.videoTag.pause()
          }, i.prototype.handleStop = function(e) {
            return i.__super__.handleStop.apply(this, arguments), this.tracker.handleVideoViewDuration(this.videoTag.currentTime * 1e3, this.videoTag.muted), this.checkVideoCompletion(this.videoTag.currentTime, this.videoDuration)
          }, i.prototype.removeThumbnail = function() {
            return this.autoplay ? this.oldThumbnail = this.$element.find(".str-thumbnail").detach() : (i.__super__.removeThumbnail.apply(this, arguments), this.$element.find(".icon-wrapper").hide())
          }, i.prototype.setStartTime = function() {
            if (this.startingTime) return this.videoTag.currentTime = this.startingTime
          }, i.prototype.setVideoCompletionInterval = function() {
            var e;
            return e = function(e) {
              return function() {
                return e.checkVideoCompletion(e.videoTag.currentTime, e.videoDuration)
              }
            }(this), this.videoCompletionIntervalId = setInterval(e, this.VIDEO_COMPLETION_INTERVAL)
          }, i.prototype.setThumbnailWrapperBackground = function() {
            var e;
            return e = this.$element.data("str-video-frame-color"), e || (e = "black"), this.$element.find(".thumbnail-wrapper").css("background-color", e)
          }, i
        }(STR.Tag.Views.VideoBase)
      }.call(this),
      function() {
        var e, t = function(e, t) {
            return function() {
              return e.apply(t, arguments)
            }
          },
          n = {}.hasOwnProperty,
          r = function(e, t) {
            function i() {
              this.constructor = e
            }
            for (var r in t) n.call(t, r) && (e[r] = t[r]);
            return i.prototype = t.prototype, e.prototype = new i, e.__super__ = t.prototype, e
          };
        e = STR.Vendor.$, STR.Tag.Views.InstantPlayHtml5 = function(e) {
          function n(e, r, i, s) {
            this.togglePlay = t(this.togglePlay, this), this.handleStop = t(this.handleStop, this), this.registerVisibilityListeners = t(this.registerVisibilityListeners, this), n.__super__.constructor.apply(this, arguments), this.beforeUserEngagement = !0, this.autoplay = !0, this.hasCompleted = !1
          }
          return r(n, e), n.prototype.render = function() {
            return n.__super__.render.apply(this, arguments), this.renderVideoInPlace(), this.registerVisibilityListeners()
          }, n.prototype.renderVideoInPlace = function() {
            return this.postEngagementDisplay.preExpandedAtStart = !0, this.swapThumbnailWithVideo(), this.inPlaceVideoTag.muted = !0, this.setThumbnailWrapperBackground()
          }, n.prototype.registerVisibilityListeners = function() {
            return this.$element.on("view:visible", function(e) {
              return function() {
                if (e.beforeUserEngagement) return e.inPlaceVideoTag.play()
              }
            }(this)), this.$element.on("view:notVisible", function(e) {
              return function() {
                if (e.beforeUserEngagement) return e.inPlaceVideoTag.pause(), e.tracker.handleVideoViewDuration(e.inPlaceVideoTag.currentTime * 1e3, !0)
              }
            }(this))
          }, n.prototype.handleClick = function(e) {
            if (!this.handleUserEngagement()) return n.__super__.handleClick.apply(this, arguments)
          }, n.prototype.handleStop = function(e) {
            n.__super__.handleStop.apply(this, arguments);
            if (e.type === "ended") return this.swapVideoWithThumbnail(), this.$element.off("view:visible"), this.$element.off("view:notVisible"), this.videoTag.currentTime = 0, this.autoplay = !1, this.hasCompleted = !0
          }, n.prototype.playVideoPostEngagement = function() {
            var e;
            return this.tracker.handleAutoplayVideoEngagement(this.inPlaceVideoTag.currentTime * 1e3), this.tracker.handleNonYoutubePlay(this.inPlaceVideoTag.currentTime * 1e3), this.beforeUserEngagement = !1, this.inPlaceVideoTag === this.videoTag ? (this.inPlaceVideoTag.controls = !0, this.inPlaceVideoTag.muted = !1, (e = this.postEngagementDisplay.$overlay) != null ? e.fadeIn() : void 0) : this.inPlaceVideoTag.pause()
          }, n.prototype.togglePlay = function() {
            return this.handleUserEngagement(), !1
          }, n.prototype.handleUserEngagement = function() {
            return this.hasCompleted && this.creative.custom_engagement_url ? (this.tracker.handleShare("custom"), window.open(this.creative.custom_engagement_url, "_blank"), !0) : this.beforeUserEngagement ? (this.beforeUserEngagement = !1, this.playVideoPostEngagement(), this.$element.find(".icon-wrapper").hide(), !1) : this.inPlaceVideoTag.paused ? (this.inPlaceVideoTag.play(), !1) : (this.inPlaceVideoTag.pause(), !1)
          }, n
        }(STR.Tag.Views.Html5Player)
      }.call(this),
      function() {
        var e, t = function(e, t) {
            return function() {
              return e.apply(t, arguments)
            }
          },
          n = {}.hasOwnProperty,
          r = function(e, t) {
            function i() {
              this.constructor = e
            }
            for (var r in t) n.call(t, r) && (e[r] = t[r]);
            return i.prototype = t.prototype, e.prototype = new i, e.__super__ = t.prototype, e
          };
        e = STR.Vendor.$, STR.Tag.Views.InstantPlaySprite = function(e) {
          function n(e, r, i, s) {
            this.registerSilentAutoplayLengthBeacons = t(this.registerSilentAutoplayLengthBeacons, this), this.swapCanvas = t(this.swapCanvas, this), this.drawOriginalThumbnail = t(this.drawOriginalThumbnail, this), this.createCanvasElement = t(this.createCanvasElement, this), this.initAlternativeAutoPlay = t(this.initAlternativeAutoPlay, this), this.registerVisibilityListeners = t(this.registerVisibilityListeners, this), n.__super__.constructor.apply(this, arguments), this.visible = !1, this.beforeUserEngagement = !0, this.hasCompleted = !1, this.FRAME_WIDTH = this.creative.instant_play_mobile_width, this.FRAME_HEIGHT = this.creative.instant_play_mobile_height, this.currentFrame = 0, this.numberOfSources = this.creative.instant_play_mobile_count - 1, this.totalSeconds = this.creative.instant_play_mobile_count * this.FRAMES_PER_SPRITE / this.PLAYER_FPS, this.initializeSources()
          }
          return r(n, e), n.prototype.PLAYER_FPS = 12, n.prototype.MS_IN_SEC = 1e3, n.prototype.FRAMES_PER_SPRITE = 36, n.prototype.initializeSources = function() {
            var e, t, n;
            this.sources = [];
            for (e = t = 0, n = this.numberOfSources; 0 <= n ? t <= n : t >= n; e = 0 <= n ? ++t : --t) this.sources[e] = {
              url: this.creative.instant_play_mobile_url.replace(/0.jpg/, "" + e + ".jpg"),
              loaded: !1
            };
            return this.sourceIndex = 0, this.loadAlternativeVideo(this.sources[this.sourceIndex], this.sourceIndex)
          }, n.prototype.loadAlternativeVideo = function(e, t) {
            return e.image = new Image, e.image.onload = function(n) {
              return function() {
                return e.loaded = !0, t === 0 ? n.initAlternativeAutoPlay() : n.processFrame()
              }
            }(this), e.image.src = e.url
          }, n.prototype.render = function() {
            return n.__super__.render.apply(this, arguments), this.registerVisibilityListeners()
          }, n.prototype.registerVisibilityListeners = function() {
            return this.$element.on("view:visible", function(e) {
              return function() {
                e.visible = !0;
                if (e.beforeUserEngagement && e.processFrame) return window.requestAnimationFrame(e.processFrame)
              }
            }(this)), this.$element.on("view:notVisible", function(e) {
              return function() {
                return e.visible = !1
              }
            }(this))
          }, n.prototype.initAlternativeAutoPlay = function() {
            return this.createCanvasElement(), this.setUpProcessFrame(), this.registerSilentAutoplayLengthBeacons()
          }, n.prototype.createCanvasElement = function() {
            var e, t;
            return e = "str-canvas-" + this.guid, t = this.element.getElementsByClassName("str-thumbnail")[0], this.canvas = document.createElement("canvas"), this.canvas.id = e, this.canvas.classList.add("str-thumbnail"), this.canvas.width = t.offsetWidth, this.canvas.height = t.offsetHeight, t.appendChild(this.canvas), this.context = this.canvas.getContext("2d"), this.image = this.sources[this.sourceIndex].image, this.drawImage(this.canvas, this.context, this.image), this.swapCanvas(t, this.canvas), this.setThumbnailWrapperBackground()
          }, n.prototype.setUpProcessFrame = function() {
            var e, t;
            return t = this.getCurrentDateTime(), e = this.MS_IN_SEC / this.PLAYER_FPS, this.processFrame = function(n) {
              return function() {
                var r, i, s;
                i = n.getCurrentDateTime(), r = i - t, r > e && (t = i - r % e, n.currentFrame++, n.currentFrame === 5 && n.sourceIndex < n.numberOfSources ? n.loadAlternativeVideo(n.sources[n.sourceIndex + 1], n.sourceIndex + 1) : n.currentFrame >= n.FRAMES_PER_SPRITE && (n.sourceIndex < n.numberOfSources ? (n.currentFrame = 0, n.sources[n.sourceIndex + 1].loaded && (n.sourceIndex++, n.image = n.sources[n.sourceIndex].image)) : (s = n.getCurrentVideoTime(), n.visible = !1, n.hasCompleted = !0, n.currentFrame = 0, n.sourceIndex = 0, n.drawOriginalThumbnail(), clearInterval(n.beaconInterval), n.checkVideoCompletion(s, n.totalSeconds), n.tracker.handleVideoViewDuration(s * 1e3, n.beforeUserEngagement))));
                if (n.visible) return n.drawImage(n.canvas, n.context, n.image), window.requestAnimationFrame(n.processFrame)
              }
            }(this), window.requestAnimationFrame(this.processFrame)
          }, n.prototype.getCurrentDateTime = function() {
            return Date.now()
          }, n.prototype.getCurrentVideoTime = function() {
            return (this.currentFrame + 1 + this.sourceIndex * this.FRAMES_PER_SPRITE) / this.PLAYER_FPS
          }, n.prototype.drawImage = function(e, t, n) {
            var r, i;
            return r = Math.floor(this.currentFrame % 6) * this.FRAME_WIDTH, i = Math.floor(this.currentFrame / 6) * this.FRAME_HEIGHT, t.clearRect(0, 0, e.width, e.height), t.drawImage(n, r, i, this.FRAME_WIDTH, this.FRAME_HEIGHT, 0, 0, e.width, e.height)
          }, n.prototype.drawOriginalThumbnail = function() {
            var e;
            return e = new Image, e.onload = function(t) {
              return function() {
                return t.context.clearRect(0, 0, t.canvas.width, t.canvas.height), t.context.drawImage(e, 0, 0, e.width, e.height, 0, 0, t.canvas.width, t.canvas.height)
              }
            }(this), e.src = this.creative.original_thumbnail_url || this.creative.thumbnail_url
          }, n.prototype.swapCanvas = function(e, t) {
            var n;
            return n = e.parentNode, n.replaceChild(t, e)
          }, n.prototype.registerSilentAutoplayLengthBeacons = function() {
            return this.beaconInterval = setInterval(function(e) {
              return function() {
                var t;
                return t = e.getCurrentVideoTime(), e.checkVideoCompletion(t, e.totalSeconds)
              }
            }(this), this.VIDEO_COMPLETION_INTERVAL)
          }, n.prototype.handleClick = function(e) {
            return this.beforeUserEngagement = !1, this.hasCompleted && this.creative.custom_engagement_url ? (this.tracker.handleShare("custom"), window.open(this.creative.custom_engagement_url, "_blank")) : (this.visible = !1, this.startingTime = this.getCurrentVideoTime(), this.tracker.handleAutoplayVideoEngagement(this.startingTime * 1e3), this.tracker.handleNonYoutubePlay(this.startingTime * 1e3), n.__super__.handleClick.apply(this, arguments))
          }, n
        }(STR.Tag.Views.Html5Player)
      }.call(this),
      function() {
        var e, t = function(e, t) {
          return function() {
            return e.apply(t, arguments)
          }
        };
        e = STR.Vendor.$, STR.Tag.Views.SwipeablePlacement = function() {
          function n(n, r, i, s) {
            this.fireSwipeBeacon = t(this.fireSwipeBeacon, this);
            var o;
            this.creativeStore = s, this.$element = e(n), this.$parentElement = r, this.placementKey = i, o = STR.Tag.findPlacementFor(i), this.parentCreativeWrapper = o.parentCreativeWrapper, this.parentPlacementKey = o.parentPlacementKey
          }
          return n.prototype.render = function() {
            this.$element.remove();
            if (this.creativeStore.creativeAvailable()) return this.generateSwipeAdTag()
          }, n.prototype.addStyle = function(t) {
            var n;
            return n = e("<style>"), n.append(".slick-slider{position:relative;display:block;box-sizing:border-box;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-touch-callout:none;-khtml-user-select:none;-ms-touch-action:pan-y;touch-action:pan-y;-webkit-tap-highlight-color:transparent}.slick-list{position:relative;display:block;overflow:hidden;margin:0;padding:0;width:100%}.slick-list:focus{outline:0}.slick-list.dragging{cursor:pointer;cursor:hand}.slick-slider .slick-track,.slick-slider .slick-list{-webkit-transform:translate3d(0,0,0);-moz-transform:translate3d(0,0,0);-ms-transform:translate3d(0,0,0);-o-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}.slick-track{position:relative;top:0;left:0;display:block}.slick-track:before,.slick-track:after{display:table;content:''}.slick-track:after{clear:both}.slick-loading .slick-track{visibility:hidden}.slick-slide{display:none;float:left;height:100%;min-height:1px}[dir='rtl'] .slick-slide{float:right}.slick-slide img{display:block}.slick-slide.slick-loading img{display:none}.slick-slide.dragging img{pointer-events:none}.slick-initialized .slick-slide{display:block}.slick-loading .slick-slide{visibility:hidden}.slick-vertical .slick-slide{display:block;height:auto;border:1px solid transparent}.slick-arrow.slick-hidden{display:none}"), n.append("@charset 'UTF-8';.slick-next,.slick-next:focus,.slick-next:hover,.slick-prev,.slick-prev:focus,.slick-prev:hover{color:transparent;background:0 0;outline:0}.slick-dots,.slick-next,.slick-prev{position:absolute;display:block;padding:0}.slick-dots li button:before,.slick-next:before,.slick-prev:before{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.slick-next,.slick-prev{z-index:1;font-size:0;line-height:0;top:50%;width:20px;height:100%;-webkit-transform:translate(0,-50%);-ms-transform:translate(0,-50%);transform:translate(0,-50%);cursor:pointer;border:none}.slick-next:focus:before,.slick-next:hover:before,.slick-prev:focus:before,.slick-prev:hover:before{opacity:1}.slick-next.slick-disabled:before,.slick-prev.slick-disabled:before{opacity:.25}.slick-next:before,.slick-prev:before{font-size:25px;line-height:1;opacity:.75;color:black;}.slick-prev{left:0}[dir=rtl] .slick-prev{right:-25px;left:auto}.slick-prev:before{content:'âŸ¨'}.slick-next:before,[dir=rtl] .slick-prev:before{content:'âŸ©'}.slick-next{right:0}[dir=rtl] .slick-next{right:auto;left:-25px}[dir=rtl] .slick-next:before{content:'â†'}.slick-dotted.slick-slider{margin-bottom:0}.slick-dots{bottom:0;width:100%;margin:0;list-style:none;text-align:center}.slick-dots li{position:relative;display:inline-block;width:20px;height:20px;margin:0 0px;padding:0;cursor:pointer}.slick-dots li button{font-size:0;line-height:0;display:block;width:20px;height:20px;padding:5px;cursor:pointer;color:transparent;border:0;outline:0;background:0 0}.slick-dots li button:focus,.slick-dots li button:hover{outline:0}.slick-dots li button:focus:before,.slick-dots li button:hover:before{opacity:1}.slick-dots li button:before{font-size:25px;line-height:20px;position:absolute;top:0;left:0;width:20px;height:20px;content:'â€¢';text-align:center;opacity:.25;color:#000}.slick-dots li.slick-active button:before{opacity:.75;color:#000}"), n.insertBefore(t)
          }, n.prototype.generateSwipeAdTag = function() {
            var t, n, r, i;
            i = this.$parentElement.clone(), i.empty(), this.addStyle(this.$parentElement), t = e("<div>"), i.append(t), r = this.$parentElement.clone(!0, !0), this.addSwipeUnitAttributes(r), t.append(r), this.$parentElement.replaceWith(i), this.creativesArray = [this.parentCreativeWrapper];
            while (n = this.creativeStore.nextCreative()) this.appendChildCreative(n, i), this.creativesArray.push(n);
            return this.enableSlick(i)
          }, n.prototype.appendChildCreative = function(t, n) {
            var r, i;
            return i = e("<div>"), r = e("<div>").attr("slick-child", "c"), i.append(r), this.replaceInnerDivWithClickoutAd(t, r), this.addSwipeUnitAttributes(i.children()), n.append(i)
          }, n.prototype.enableSlick = function(e) {
            return e.slick({
              arrows: !0,
              dots: !0,
              infinite: !0,
              slidesToShow: 1,
              slidesToScroll: 1,
              draggable: !1,
              swipe: !0
            }), e.on("beforeChange", function(e) {
              return function(t, n, r, i) {
                return e.fireSwipeBeacon(r, i)
              }
            }(this)), e.addClass("str-swipe-template")
          }, n.prototype.addSwipeUnitAttributes = function(e) {
            return e.attr("class", ""), e.attr("style", "margin:10px 20px 10px 20px;")
          }, n.prototype.fireSwipeBeacon = function(e, t) {
            var n;
            return n = STR.Tag.Helpers.BeaconCannon.getInstance(), n.fireBeacon(STR.Tag.TrackingHost, "butler", {
              type: "swipe",
              parentPlacementKey: this.parentPlacementKey,
              childPlacementKey: this.placementKey,
              currentIndex: e,
              nextIndex: t,
              currentCreativeKey: this.creativesArray[e].creative.creative_key,
              nextCreativeKey: this.creativesArray[t].creative.creative_key,
              parentArid: this.parentCreativeWrapper.creative.arid,
              childArid: this.creativesArray[1].creative.arid,
              currentAwid: this.creativesArray[e].auctionWinId,
              nextAwid: this.creativesArray[t].auctionWinId
            })
          }, n.prototype.replaceInnerDivWithClickoutAd = function(e, t) {
            return (new STR.Tag.Views.Clickout(e, t, this.placementKey, this.creativeStore)).render()
          }, n
        }()
      }.call(this),
      function() {
        var e;
        e = STR.Vendor.$, STR.Tag.Views.ThirdPartyPartner = function() {
          function t(t, n, r, i, s) {
            this.element = t, this.$element = e(this.element), this.placementKey = n, this.thirdPartyKey = r, this.thirdPartyTag = i, this.domPlacementIndex = s, !this.thirdPartyKey.match(/backfill/) && !this.thirdPartyKey.match(/preview/) && STR.Tag.Models.MediationTracker.fireThirdPartyImpressionRequest(this.placementKey, this.thirdPartyKey, this.domPlacementIndex), STR.Tag.Helpers.HtmlUtility.previewMediation() && console.log("Impression request for third party partner")
          }
          return t.prototype.render = function() {
            var t, n, r;
            return n = this.getRandom(), r = this.thirdPartyTag.replace(/{{random}}/g, n), t = e(r), this.determineTagToInsert(t)
          }, t.prototype.determineTagToInsert = function(e) {
            var t, n, r, i;
            return e.hasClass("use-iframe") ? t = e : t = e.find(".use-iframe"), t.length > 0 ? (i = t.data("width"), n = t.data("height"), r = t.data("url"), i.toString().match(/%$/) ? this.insertDynamicIFrame(this.$element, r, i, n) : this.insertFixedIFrame(this.$element, r, i, n)) : this.insertNonIFrame(this.$element, e)
          }, t.prototype.insertFixedIFrame = function(t, n, r, i) {
            var s, o;
            return o = this.getThirdPartyTagWrapper(), s = e("<iframe src='" + n + "' frameborder='0' width='" + r + "' height='" + i + "' id='str-third-party-mediation-key-" + this.placementKey + "' name='str-third-party-mediation-key-" + this.placementKey + "'>"), this.insertThirdPartyTag(t, o, s)
          }, t.prototype.insertDynamicIFrame = function(t, n, r, i) {
            var s, o, u;
            return o = this.getThirdPartyTagWrapper(), o.css({
              width: r,
              height: i,
              margin: "0 auto"
            }), o.insertAfter(t), u = o.height() / o.width(), s = e("<div style='position:relative;height:0;padding-bottom:" + u * 100 + "%'> <iframe src='" + n + "' frameborder='0' style='position:absolute;top:0;left:0;width:100%;height:100%;'></iframe> </div> </div>"), o.append(s), t.remove()
          }, t.prototype.insertNonIFrame = function(e, t) {
            var n;
            return n = this.getThirdPartyTagWrapper(), this.insertThirdPartyTag(e, n, t)
          }, t.prototype.getRandom = function() {
            return Date.now()
          }, t.prototype.getThirdPartyTagWrapper = function() {
            return e("<div/>", {
              "data-str-third-party-source": this.thirdPartyKey,
              "data-str-mediation-key": this.placementKey,
              "data-str-placement-index": this.domPlacementIndex
            })
          }, t.prototype.insertThirdPartyTag = function(t, n, r) {
            return e.ajaxSetup({
              cache: !0
            }), n.append(r), n.insertAfter(t), t.remove(), e.ajaxSetup({
              cache: !1
            })
          }, t
        }()
      }.call(this),
      function() {
        var e;
        e = STR.Vendor.$, STR.Tag.Views.VideoOverlay = function() {
          function t(e, t, n, r, i, s) {
            i == null && (i = !1), s == null && (s = !1), this.creative = e, this.tracker = t, this.overlayId = "str-overlay-" + r, this.embedId = "str-embed-" + r, this.insertIntoDOM(n), this.hasOpened = i, this.postEngagementDisplayOpen = !1, this.preExpandedAtStart = i
          }
          return t.prototype.insertIntoDOM = function(t) {
            var n;
            return this.$overlay = e("<div>", {
              id: this.overlayId,
              "class": "str-overlay"
            }), n = STR.Tag.Helpers.SharingHelper.createCardSharing(this.creative, this.tracker, this.$overlay), this.$overlay.append(n), this.addStyle(), e(t).find(".thumbnail-wrapper").prepend(this.$overlay)
          }, t.prototype.addStyle = function() {
            var t;
            return t = e("<style>", {
              html: STR.Tag.Helpers.StyleHelper.cardStyle(this.overlayId)
            }), this.$overlay.append(t)
          }, t.prototype.toggle = function() {
            return this.postEngagementDisplayOpen ? this.close() : this.open()
          }, t.prototype.onOpen = function(e) {
            this.onOpenCallback = e;
            if (this.hasOpened) return this.onOpenCallback()
          }, t.prototype.open = function() {
            if (!this.postEngagementDisplayOpen) {
              this.$overlay.fadeIn(), this.postEngagementDisplayOpen = !0;
              if (this.onOpenCallback != null) return this.onOpenCallback()
            }
          }, t.prototype.onClose = function(e) {
            return this.onCloseCallback = e
          }, t.prototype.onBeforeClose = function(e) {
            return this.onBeforeCloseCallback = e
          }, t.prototype.close = function() {
            this.onBeforeCloseCallback != null && this.onBeforeCloseCallback(), this.$overlay.fadeOut(), this.postEngagementDisplayOpen = !1;
            if (this.onCloseCallback != null) return this.onCloseCallback()
          }, t
        }()
      }.call(this),
      function() {
        var e, t = function(e, t) {
            return function() {
              return e.apply(t, arguments)
            }
          },
          n = {}.hasOwnProperty,
          r = function(e, t) {
            function i() {
              this.constructor = e
            }
            for (var r in t) n.call(t, r) && (e[r] = t[r]);
            return i.prototype = t.prototype, e.prototype = new i, e.__super__ = t.prototype, e
          };
        e = STR.Vendor.$, STR.Tag.Views.Youtube = function(n) {
          function i(e, n, r, s) {
            this.handleClose = t(this.handleClose, this), this.handleStateChange = t(this.handleStateChange, this), this.handleReady = t(this.handleReady, this), this.combine = t(this.combine, this), i.__super__.constructor.apply(this, arguments), this.played = !1, this.youtubeId = this.extractYoutubeId(this.creative.media_url)
          }
          return r(i, n), i.prototype.render = function() {
            return i.__super__.render.apply(this, arguments), this.initializePostEngagementDisplay(), this.initializeYoutube()
          }, i.prototype.initializePostEngagementDisplay = function() {
            return this.postEngagementDisplay = STR.Tag.Helpers.PostEngagementDisplayHelper.get(this.creative, this.tracker, this.element, this.placementKey, this.guid, this.inPlace()), this.postEngagementDisplay.onBeforeClose(this.handleClose)
          }, i.prototype.initializeYoutube = function() {
            return window.YT != null ? this.createYoutubePlayer() : (document.getElementById("str-yt-api") || this.dropYoutubeTag(), window.onYouTubeIframeAPIReady = this.combine(window.onYouTubeIframeAPIReady, this.createYoutubePlayer))
          }, i.prototype.extractYoutubeId = function(e) {
            var t;
            return t = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i, e.match(t)[1]
          }, i.prototype.combine = function(e, t) {
            return function(n) {
              return function() {
                return t.apply(n, arguments), e != null ? e.apply(n, arguments) : void 0
              }
            }(this)
          }, i.prototype.handleClick = function(e) {
            if (i.__super__.handleClick.apply(this, arguments)) return;
            if (!STR.Tag.Helpers.SharingHelper.isSharingButton(e.target)) return this.tracker.handleClick(), e.preventDefault(), this.postEngagementDisplay.toggle()
          }, i.prototype.createYoutubePlayer = function() {
            var t, n;
            return n = {
              videoId: this.youtubeId,
              events: {
                onReady: this.handleReady,
                onStateChange: this.handleStateChange
              },
              playerVars: {
                wmode: "opaque",
                rel: 0,
                html5: 1,
                showinfo: 0
              }
            }, t = function(e) {
              return function() {
                return e.youtubePlayer = new window.YT.Player(e.postEngagementDisplay.embedId, n)
              }
            }(this), this.inPlace() ? (this.removeEmbedWrapperFromPostEngagementDisplay(), this.addEmbedIdToThumbnail(), n = e.extend({}, n, this.getYoutubeSizeVars()), t()) : this.postEngagementDisplay.onOpen(t)
          }, i.prototype.handleReady = function(e) {
            var t;
            return this.tracker.handleYoutubeReady(), this.videoDuration = typeof(t = this.youtubePlayer).getDuration == "function" ? t.getDuration() : void 0
          }, i.prototype.handleStateChange = function(e) {
            if (e.data === window.YT.PlayerState.PLAYING) return this.setVideoCompletionInterval(), this.played || (this.tracker.handleYoutubePlay(this.videoDuration), this.postEngagementDisplay.postEngagementDisplayOpen || this.postEngagementDisplay.open()), this.played = !0;
            if (e.data === window.YT.PlayerState.PAUSED || e.data === window.YT.PlayerState.ENDED) return this.handleStop()
          }, i.prototype.addEmbedIdToThumbnail = function() {
            return this.$element.find(".str-thumbnail").attr("id", this.postEngagementDisplay.embedId)
          }, i.prototype.getYoutubeSizeVars = function() {
            return {
              width: this.$element.find(".str-thumbnail").width(),
              height: this.$element.find(".str-thumbnail").height()
            }
          }, i.prototype.dropYoutubeTag = function() {
            var e;
            return e = document.createElement("script"), e.id = "str-yt-api", e.src = "//www.youtube.com/iframe_api", document.body.appendChild(e)
          }, i.prototype.handleClose = function() {
            var e;
            return (typeof(e = this.youtubePlayer).getPlayerState == "function" ? e.getPlayerState() : void 0) === window.YT.PlayerState.PLAYING && this.tracker.handleVideoStop(), clearInterval(this.videoCompletionIntervalId)
          }, i.prototype.setVideoCompletionInterval = function() {
            var e;
            return e = function(e) {
              return function() {
                var t;
                return e.checkVideoCompletion(typeof(t = e.youtubePlayer).getCurrentTime == "function" ? t.getCurrentTime() : void 0, e.videoDuration)
              }
            }(this), this.videoCompletionIntervalId = setInterval(e, this.VIDEO_COMPLETION_INTERVAL)
          }, i
        }(STR.Tag.Views.VideoBase)
      }.call(this),
      function() {
        var e;
        e = STR.Vendor.$, STR.Tag.Models.BlueKaiUserInformation = function() {
          function n() {
            this.uid = null, this.status = "uninitialized", this.targets = []
          }
          var t;
          return n.prototype.hasUid = function() {
            return this.uid != null
          }, n.prototype.isReady = function() {
            return this.status !== "uninitialized"
          }, n.prototype.adServerParams = function() {
            var t, n, r;
            return n = {
              status: this.status
            }, this._hasNonBlankUid() && (n.id = this.uid, n.targets = function() {
              var e, t, n, i;
              n = this.targets, i = [];
              for (e = 0, t = n.length; e < t; e++) r = n[e], i.push(r.id);
              return i
            }.call(this)), t = JSON.stringify(n), e.param([{
              name: "bluekai",
              value: t
            }])
          }, n.prototype.beaconParams = function() {
            var e;
            return e = {
              bkuuid: this.uid,
              bkstatus: this.status
            }
          }, n.prototype.dmpBeaconParams = function(e) {
            var n, r, i, s, o, u, a, f;
            u = e || [], u = function() {
              var e, t, n;
              n = [];
              for (e = 0, t = u.length; e < t; e++) r = u[e], n.push(r.toString());
              return n
            }(), i = [];
            for (a = 0, f = u.length; a < f; a++) o = u[a], s = t(this.targets, o), s && i.push(s);
            return i.length > 0 ? (n = JSON.stringify(i), {
              dmp: n
            }) : {}
          }, n.prototype._hasNonBlankUid = function() {
            return this.hasUid() && this.uid !== ""
          }, t = function(e, t) {
            var n, r, i, s;
            for (i = 0, s = e.length; i < s; i++) {
              r = e[i];
              if (r.id === t) {
                n = r;
                break
              }
            }
            return n
          }, n
        }()
      }.call(this),
      function() {
        var e = function(e, t) {
          return function() {
            return e.apply(t, arguments)
          }
        };
        STR.Tag.Models.CreativeStore = function() {
          function t(t, n, r, i) {
            this.creativeAvailable = e(this.creativeAvailable, this), this.directSoldType = e(this.directSoldType, this), this.storeCreatives = e(this.storeCreatives, this), this.placementKey = t, this.creativeKey = r, this.campaignKey = i, this.creativeFactory = n, this.creatives = [], this.callbacks = [], this.featuredContent = [], this.thirdPartyPartners = [], this.creativeRequestIndex = 0, this.hasFetchedDirectSold = !1, this.fetchCreatives()
          }
          return t.prototype.fetchCreatives = function() {
            if (!this.noCreativesReceived && !this.fetching && !this.creativeAvailable() && !this.hasFetchedDirectSold) return this.fetching = !0, STR.Tag.Helpers.UidProvider.whenUidReady(function(e) {
              return function(t) {
                return e.fireImpressionRequest(), STR.Tag.Models.PerformanceTracker.setRequestStartTime(), e.creativeFactory.getCreative(t, e.placementKey, e.storeCreatives, e.creativeKey, e.campaignKey)
              }
            }(this))
          }, t.prototype.storeCreatives = function(e) {
            var t, n, r, i, s, o, u, a, f, l, c, h, p;
            this.fetching = !1, this.adserverRequestId = e.adserverRequestId, this.placement || (this.placement = e.placement), STR.Tag.Models.PerformanceTracker.fireAdServerResponseLatencyBeacon(this.placementKey, this.adserverRequestId), this.noCreativesReceived = e.creatives.length === 0, l = e.creatives;
            for (o = 0, a = l.length; o < a; o++) n = l[o], n.creative.directSold = this.hasFetchedDirectSold = this.directSoldType(n.creative), n.creative.placementStatus = this.placement.status, (i = n.creative).promoted_by_text || (i.promoted_by_text = this.getPromotedByText(n.creative)), n.creative.arid = e.adserverRequestId, n.creative.awid = n.auctionWinId;
            this.creatives = this.creatives.concat(e.creatives), this.featuredContent = this.placement.placementAttributes.featured_content || [], c = this.featuredContent;
            for (u = 0, f = c.length; u < f; u++) r = c[u], r.creative.featured_content = !0, r.creative.arid = e.adserverRequestId, (s = r.creative).beacons || (s.beacons = {
              impression: [],
              visible: [],
              play: [],
              click: [],
              silent_play: [],
              ten_second_silent_play: [],
              fifteen_second_silent_play: [],
              thirty_second_silent_play: [],
              completed_silent_play: []
            });
            this.thirdPartyPartners = this.placement.placementAttributes.third_party_partners || [];
            if (((h = this.placement) != null ? h.status : void 0) !== "off") {
              p = [];
              while (this.callbacks.length > 0) t = this.callbacks.shift(), p.push(t(this));
              return p
            }
          }, t.prototype.getPromotedByText = function(e) {
            return e.directSold ? this.placement.placementAttributes.direct_sell_promoted_by_text || this.placement.placementAttributes.promoted_by_text : this.placement.placementAttributes.promoted_by_text
          }, t.prototype.directSoldType = function(e) {
            var t;
            return t = !1, this.creativeKey ? t = "creative" : this.campaignKey && (t = "campaign"), t
          }, t.prototype.whenResponseReceived = function(e) {
            return this.creativeAvailable() || this.useBackfill() ? e(this) : this.callbacks.push(e)
          }, t.prototype.creativeAvailable = function() {
            return this.creatives.length > 0
          }, t.prototype.nextCreative = function() {
            var e;
            return this.creativeRequestIndex += 1, e = this.creatives.shift(), this.placement.layout === "single" || STR.Tag.findPlacementFor(this.placementKey).isChild ? e : (this.fetchCreatives(), e)
          }, t.prototype.getTemplate = function() {
            var e, t, n;
            return e = (t = this.placement) != null ? (n = t.placementAttributes) != null ? n.template : void 0 : void 0, STR.Tag.Helpers.HtmlUtility.decodeString(e)
          }, t.prototype.hasBackfill = function() {
            var e, t;
            return (e = this.placement) != null ? (t = e.placementAttributes) != null ? t.backfillTag : void 0 : void 0
          }, t.prototype.useBackfill = function() {
            return this.hasBackfill && this.noCreativesReceived
          }, t.prototype.getBackfill = function() {
            var e;
            if (this.hasBackfill) return e = this.placement.placementAttributes.backfillTag, STR.Tag.Helpers.HtmlUtility.decodeString(e)
          }, t.prototype.fireImpressionRequest = function() {
            var e;
            return e = {
              type: "impressionRequest",
              pkey: this.placementKey
            }, this.creativeKey && (e.ckey = this.creativeKey), this.campaignKey && (e.campkey = this.campaignKey), STR.Tag.Helpers.BeaconCannon.getInstance().fireBeacon(STR.Tag.TrackingHost, "butler", e)
          }, t.prototype.hasFeaturedContent = function() {
            return this.featuredContent.length > 0
          }, t.prototype.getFeaturedContent = function() {
            return this.featuredContent.shift()
          }, t.prototype.getThirdPartyPartner = function(e) {
            var t, n, r, i;
            i = this.thirdPartyPartners;
            for (n = 0, r = i.length; n < r; n++) {
              t = i[n];
              if (t.key === e) return t
            }
          }, t.prototype.getChildPlacementKey = function() {
            return this.placement.placementAttributes.child_placement_key
          }, t
        }()
      }.call(this),
      function() {
        var e;
        e = STR.Vendor.$, STR.Tag.Models.CriteoUserInformation = function() {
          function e() {
            this.uid = null, this.status = "uninitialized"
          }
          return e.prototype.isReady = function() {
            return this.status !== "uninitialized"
          }, e.prototype.adServerParams = function() {
            return this.uid ? "&rtusuid=" + this.uid : ""
          }, e
        }()
      }.call(this),
      function() {
        var e, t = function(e, t) {
          return function() {
            return e.apply(t, arguments)
          }
        };
        e = STR.Vendor.$, STR.Tag.Models.Element = function() {
          function n(e, n, r) {
            this.renderSwipeableChildUnits = t(this.renderSwipeableChildUnits, this), this.renderParentPlacement = t(this.renderParentPlacement, this), this.onResponseReceived = t(this.onResponseReceived, this), this.placement = r, this.placementKey = r.placementKey, this.element = e, this.creativeStore = n, this.creativeStore.whenResponseReceived(this.onResponseReceived)
          }
          return n.prototype.onResponseReceived = function() {
            var t;
            if (e(this.element).attr("data-str-placement-index") > 1 && this.creativeStore.placement.layout === "single") {
              e(this.element).remove();
              return
            }
            return t = this.creativeStore.getChildPlacementKey(), t ? this.renderParentPlacement(t) : this.placement.isChild ? this.renderSwipeableChildUnits() : (new STR.Tag.Models.Waterfall(this.element, this.creativeStore, this.placementKey)).findViewAndRender()
          }, n.prototype.renderParentPlacement = function(e) {
            var t;
            t = this.creativeStore.creativeAvailable(), t && (this.insertChildStrDiv(e), this.setupChildPlacement(e)), (new STR.Tag.Models.Waterfall(this.element, this.creativeStore, this.placementKey)).findViewAndRender();
            if (t) return STR.Tag.boot()
          }, n.prototype.renderSwipeableChildUnits = function() {
            return (new STR.Tag.Views.SwipeablePlacement(this.element, this.findRenderedParent(), this.placementKey, this.creativeStore)).render()
          }, n.prototype.insertChildStrDiv = function(t) {
            var n;
            return n = e("<div>").attr("data-str-native-key", t).attr("style", "display:none"), e(this.element).after(n)
          }, n.prototype.setupChildPlacement = function(e) {
            var t, n;
            return t = this.creativeStore.creatives[0], n = STR.Tag.findPlacementFor(e), n.isChild = !0, n.parentPlacementKey = this.placementKey, n.parentCreativeWrapper = t
          }, n.prototype.findRenderedParent = function() {
            return e(this.element).prev("[data-str-native-key]")
          }, n
        }()
      }.call(this),
      function() {
        var e, t = function(e, t) {
          return function() {
            return e.apply(t, arguments)
          }
        };
        e = STR.Vendor.$, STR.Tag.Models.FeedPreprocessor = function() {
          function n(e) {
            this.insertIntoFeed = t(this.insertIntoFeed, this), this.processCallback = e
          }
          return n.prototype.identifyFeeds = function(t) {
            var n, r, i, s, o, u, a, f;
            r = [], e("[data-str-feed-key]").each(function(t, n) {
              return r.push(e(n).data("str-feed-key"))
            }), o = e.unique(r), f = [];
            for (u = 0, a = o.length; u < a; u++) s = o[u], n = t.chooseFactories(!1), i = STR.Tag.findPlacementFor(s), i.creativeStore || i.setCreativeStore(new STR.Tag.Models.CreativeStore(s, n)), f.push(i.creativeStore.whenResponseReceived(this.insertIntoFeed));
            return f
          }, n.prototype.insertIntoFeed = function(t) {
            var n, r, i, s, o, u, a, f;
            u = "[data-str-feed-key='" + t.placementKey + "']", t.placement && (n = t.placement.articlesBeforeFirstAd, r = t.placement.articlesBetweenAds);
            if (r == null || n == null) return;
            o = STR.Tag.findPlacementFor(t.placementKey), i = e(u).filter(function(t) {
              var i;
              return i = e(this).prev().data("strNativeKey") != null || e(this).prev().data("strMediationKey") != null, i ? !1 : t < n ? !1 : t === n ? !0 : (t - n) % r === 0
            });
            for (a = 0, f = i.length; a < f; a++) s = i[a], e(s).before(e("<div>", {
              "data-str-native-key": t.placementKey,
              "data-str-placement-index": o.getDomIndex()
            }));
            return this.processCallback(), this.listenToFeedChanges(t)
          }, n.prototype.listenToFeedChanges = function(t) {
            var n;
            return n = "[data-str-feed-key='" + t.placementKey + "']", e(document).unbind("DOMNodeInserted", t.rebootCallback), t.rebootCallback = STR.Tag.Helpers.FunctionHelper.debounce(function() {
              var r;
              r = e(n).last().get(0);
              if (t.lastSeenItem !== r) return t.lastSeenItem = r, t.fetchCreatives(), STR.Tag.boot()
            }, 250), e(document).bind("DOMNodeInserted", t.rebootCallback)
          }, n
        }()
      }.call(this),
      function() {
        STR.Tag.Models.MediationTracker = {
          fireThirdPartyImpressionRequest: function(e, t, n) {
            var r, i, s, o;
            return r = STR.Tag.Helpers.BeaconCannon.getInstance(), s = STR.Tag.placements[e], i = s.creativeStore, o = s.mediationWaterfallStates.get(n), r.fireBeacon(STR.Tag.TrackingHost, "butler", {
              type: "thirdPartyImpressionRequest",
              pkey: e,
              placementIndex: n,
              networkKey: t,
              arid: i.adserverRequestId,
              networkOrder: o + 1
            })
          },
          fireNoFillForPriorThirdPartyPartner: function(e, t) {
            var n, r, i, s, o, u;
            return i = STR.Tag.placements[e], r = i.creativeStore, u = i.mediationWaterfallStates.get(t), o = r.thirdPartyPartners[u], s = o != null ? o.key : void 0, n = STR.Tag.Helpers.BeaconCannon.getInstance(), n.fireBeacon(STR.Tag.TrackingHost, "butler", {
              type: "thirdPartyNoFill",
              pkey: e,
              placementIndex: t,
              networkKey: s,
              arid: r.adserverRequestId,
              networkOrder: u + 1
            })
          }
        }
      }.call(this),
      function() {
        STR.Tag.Models.PerformanceTracker = {
          PERCENTAGE_OF_TRAFFIC: .05,
          setup: function() {
            return this.activated = !1, this.fired = !1, this.setActivatedBoolean(), this.setBootStartTime()
          },
          setActivatedBoolean: function() {
            var e;
            e = 1 / this.PERCENTAGE_OF_TRAFFIC;
            if (Math.floor(Math.random() * e + 1) === 1) return this.activated = !0
          },
          setBootStartTime: function() {
            return this.bootTime = (new Date).getTime()
          },
          setRequestStartTime: function() {
            return this.requestStartTime = (new Date).getTime()
          },
          fireAdUnitRenderedBeacon: function(e, t, n) {
            var r, i, s;
            if (this.fired) return;
            this.fired = !0;
            if (!this.activated) return;
            return i = (new Date).getTime(), s = i - this.bootTime, r = STR.Tag.Helpers.BeaconCannon.getInstance(), r.fireBeacon(STR.Tag.TrackingHost, "butler", {
              type: "timing",
              pkey: e,
              ctype: t,
              arid: n,
              rendertime: s
            })
          },
          fireAdServerResponseLatencyBeacon: function(e, t) {
            var n, r, i;
            if (!this.activated) return;
            return r = (new Date).getTime(), i = r - this.requestStartTime, n = STR.Tag.Helpers.BeaconCannon.getInstance(), n.fireBeacon(STR.Tag.TrackingHost, "butler", {
              type: "latency",
              pkey: e,
              arid: t,
              latency: i
            })
          }
        }
      }.call(this),
      function() {
        var e = function(e, t) {
          return function() {
            return e.apply(t, arguments)
          }
        };
        STR.Tag.Models.Placement = function() {
          function t(t) {
            this.setCreativeStore = e(this.setCreativeStore, this), this.placeAd = e(this.placeAd, this), this.placementKey = t, this.creativeStore = void 0, this.mediationWaterfallStates = new STR.Tag.Models.MediationWaterfallStates, this.isChild = !1, this.parentPlacementKey = void 0
          }
          return t.prototype.getDomIndex = function() {
            return this.mediationWaterfallStates.addWaterfallState()
          }, t.prototype.endOfWaterfallForElement = function(e) {
            return this.mediationWaterfallStates.get(e) >= this.creativeStore.thirdPartyPartners.length - 1
          }, t.prototype.nextThirdPartyPartnerForElement = function(e) {
            var t;
            return this.endOfWaterfallForElement(e) ? null : (this.mediationWaterfallStates.increment(e), t = this.creativeStore.thirdPartyPartners[this.mediationWaterfallStates.get(e)], t)
          }, t.prototype.placeAd = function(e, t, n) {
            var r, i, s, o;
            return s = STR.Tag.Helpers.TargetElementHelper.locateTarget(e), r = STR.Tag.Factories.FactoryChooser.chooseFactories(t, n), i = t || n, i ? (o = new STR.Tag.Models.CreativeStore(this.placementKey, r, t, n), new STR.Tag.Models.Element(s, o, this)) : (this.creativeStore = this.creativeStore || new STR.Tag.Models.CreativeStore(this.placementKey, r), new STR.Tag.Models.Element(s, this.creativeStore, this))
          }, t.prototype.setCreativeStore = function(e) {
            return this.creativeStore || (this.creativeStore = e)
          }, t
        }(), STR.Tag.Models.MediationWaterfallStates = function() {
          function e() {
            this.waterfallStates = {}, this.NOT_IN_WATERFALL_YET = -1
          }
          return e.prototype.get = function(e) {
            return this.waterfallStates[e]
          }, e.prototype.increment = function(e) {
            return this.waterfallStates[e] += 1
          }, e.prototype.size = function() {
            return Object.keys(this.waterfallStates).length
          }, e.prototype.addWaterfallState = function() {
            var e;
            return e = this.size() + 1, this.waterfallStates[e] = this.NOT_IN_WATERFALL_YET, e
          }, e.prototype.toString = function() {
            var e, t;
            if (this.size() === 0) return "empty";
            e = 1, t = "";
            while (this.get(e) !== void 0) t += "(" + e + ", " + this.get(e) + "),", e += 1;
            return t
          }, e
        }()
      }.call(this),
      function() {
        var e;
        e = STR.Vendor.$, STR.Tag.Models.UserInformation = function() {
          function e() {
            this.bluekai = new STR.Tag.Models.BlueKaiUserInformation, this.criteo = new STR.Tag.Models.CriteoUserInformation
          }
          return e.prototype.isReady = function() {
            return this.bluekai.isReady() && this.criteo.isReady()
          }, e.prototype.uid = function() {
            return this.bluekai.uid
          }, e.prototype.criteoUid = function() {
            return this.criteo.uid
          }, e.prototype.adServerParams = function() {
            return this.bluekai.adServerParams() + this.criteo.adServerParams()
          }, e.prototype.beaconParams = function() {
            return this.bluekai.beaconParams()
          }, e.prototype.dmpBeaconParams = function(e) {
            return this.bluekai.dmpBeaconParams(e != null ? e.bluekai : void 0)
          }, e
        }()
      }.call(this),
      function() {
        var e, t = function(e, t) {
          return function() {
            return e.apply(t, arguments)
          }
        };
        e = STR.Vendor.$, STR.Tag.Models.ViewTracker = function() {
          function n(e) {
            this.handleVideoViewDuration = t(this.handleVideoViewDuration, this), this.handleSilentAutoplayLength = t(this.handleSilentAutoplayLength, this), this.handleAutoplayVideoEngagement = t(this.handleAutoplayVideoEngagement, this), this.handleVideoStop = t(this.handleVideoStop, this), this.handleNonYoutubePlay = t(this.handleNonYoutubePlay, this), this.handleYoutubePlay = t(this.handleYoutubePlay, this), this.handleYoutubeReady = t(this.handleYoutubeReady, this), this.handleArticleViewDuration = t(this.handleArticleViewDuration, this), this.handleArticleView = t(this.handleArticleView, this), this.handleClick = t(this.handleClick, this);
            var n;
            n = e.element, this.creativeKey = e.creativeKey, this.placementKey = e.placementKey, this.variantKey = "" + e.variantKey, this.status = e.placementStatus, this.arid = e.arid, this.awid = e.awid, this.inPlace = e.inPlace, this.placementIndex = e.placementIndex, this.beacons = e.beacons || {
              impression: [],
              visible: [],
              play: [],
              click: [],
              silent_play: [],
              ten_second_silent_play: [],
              fifteen_second_silent_play: [],
              thirty_second_silent_play: [],
              completed_silent_play: []
            }, this.firedCompletionBeacons = {
              25: !1,
              50: !1,
              75: !1,
              95: !1
            }, this.firedSilentDurationBeacons = {
              3e3: !1,
              1e4: !1,
              15e3: !1,
              3e4: !1
            }, this.buildDefaultBeaconParams(e), this.cannon = STR.Tag.Helpers.BeaconCannon.getInstance(), this.trackEvent("impression", STR.Tag.Helpers.UidProvider.dmpBeaconParams(e.dmp)), this.beacons.impression != null && this.fireThirdPartyPixel(this.beacons.impression)
          }
          return n.prototype.buildDefaultBeaconParams = function(t) {
            var n, r, i, s;
            n = STR.Tag.Helpers.PageGeometryHelper.viewportDimensions(), r = STR.Tag.Helpers.PageGeometryHelper.elementDimensions(t.element), i = STR.Tag.Helpers.PageGeometryHelper.elementPosition(t.element), s = STR.Tag.Helpers.PageGeometryHelper.thumbnailDimensions(t.element), this.defaultBeaconParams = {
              session: STR.currentSession,
              bwidth: n[0],
              bheight: n[1],
              pwidth: r[0],
              pheight: r[1],
              pxoff: i[0],
              pyoff: i[1],
              pkey: this.placementKey,
              ckey: this.creativeKey,
              vkey: this.variantKey,
              arid: this.arid,
              awid: this.awid,
              renderInPlace: this.inPlace,
              placementIndex: this.placementIndex,
              deal_id: t.deal_id,
              twidth: s[0],
              theight: s[1]
            }, t.price != null && t.priceType != null && t.priceSignature != null && (this.defaultBeaconParams.ap = t.price, this.defaultBeaconParams.at = t.priceType, this.defaultBeaconParams.as = t.priceSignature), t.beaconMetaData != null && (this.defaultBeaconParams = e.extend({}, t.beaconMetaData, this.defaultBeaconParams));
            if (t.featuredContent != null) return this.defaultBeaconParams.featuredContent = !0
          }, n.prototype.fireThirdPartyPixel = function(e) {
            var t, n, r, i;
            if (this.status !== "pre-live" && this.isNotLearningCreative()) {
              i = [];
              for (n = 0, r = e.length; n < r; n++) t = e[n], i.push(this.cannon.firePixel(t));
              return i
            }
          }, n.prototype.isNotLearningCreative = function() {
            return this.creativeKey.indexOf("learning") === -1
          }, n.prototype.handleClick = function() {
            return this.fireThirdPartyPixel(this.beacons.click), this.handleClick = function() {}
          }, n.prototype.handleArticleView = function() {
            return this.trackUserEvent("articleView", {
              engagement: !0
            }), this.handleClick()
          }, n.prototype.handleArticleViewDuration = function(e) {
            return this.trackUserEvent("articleViewDuration", {
              duration: e
            })
          }, n.prototype.handleYoutubeReady = function() {
            return this.trackEvent("youtubeReady")
          }, n.prototype.handleYoutubePlay = function(e) {
            return this.trackUserEvent("youtubePlay", {
              engagement: !0,
              videoDuration: e
            }), this.beacons.play != null && this.fireThirdPartyPixel(this.beacons.play), this.handleClick()
          }, n.prototype.handleNonYoutubePlay = function(e) {
            return this.trackUserEvent("videoPlay", {
              engagement: !0,
              videoDuration: e
            }), this.beacons.play != null && this.fireThirdPartyPixel(this.beacons.play), this.handleClick()
          }, n.prototype.handleVideoStop = function() {
            return this.trackEvent("videoStop")
          }, n.prototype.handleAutoplayVideoEngagement = function(e) {
            return this.trackUserEvent("autoplayVideoEngagement", {
              engagement: !0,
              videoDuration: e
            })
          }, n.prototype.handleSilentAutoplayLength = function(e) {
            if (!this.firedSilentDurationBeacons[e]) {
              this.firedSilentDurationBeacons[e] = !0, this.trackEvent("silentAutoPlayDuration", {
                duration: e
              });
              if (e === 3e3 && this.beacons.silent_play != null) return this.fireThirdPartyPixel(this.beacons.silent_play);
              if (e === 1e4 && this.beacons.ten_second_silent_play != null) return this.fireThirdPartyPixel(this.beacons.ten_second_silent_play);
              if (e === 15e3 && this.beacons.fifteen_second_silent_play != null) return this.fireThirdPartyPixel(this.beacons.fifteen_second_silent_play);
              if (e === 3e4 && this.beacons.thirty_second_silent_play != null) return this.fireThirdPartyPixel(this.beacons.thirty_second_silent_play)
            }
          }, n.prototype.handleVideoViewDuration = function(e, t) {
            return this.trackEvent("videoViewDuration", {
              duration: e,
              silent: t
            })
          }, n.prototype.handleShare = function(e) {
            return this.trackUserEvent("share", {
              share: e,
              engagement: !0
            })
          }, n.prototype.trackEvent = function(t, n) {
            return n == null && (n = {}), n.type = t, this.cannon.fireBeacon(STR.Tag.TrackingHost, "butler", e.extend({}, this.defaultBeaconParams, n))
          }, n.prototype.trackUserEvent = function(t, n) {
            var r;
            return n == null && (n = {}), r = e.extend({}, {
              userEvent: t
            }, n), this.trackEvent("userEvent", r)
          }, n.prototype.trackCompletion = function(e, t) {
            var n, r, i, s;
            t == null && (t = !1), i = this.firedCompletionBeacons, s = [];
            for (r in i) {
              n = i[r];
              if (e >= r && !n) {
                this.firedCompletionBeacons[r] = !0, this.trackEvent("completionPercent", {
                  value: r,
                  isSilentPlay: t
                }), e >= 95 && this.beacons.completed_silent_play != null && this.fireThirdPartyPixel(this.beacons.completed_silent_play);
                break
              }
              s.push(void 0)
            }
            return s
          }, n
        }()
      }.call(this),
      function() {
        var e;
        e = STR.Vendor.$, STR.Tag.Models.Waterfall = function() {
          function t(t, n, r, i) {
            this.element = t, this.$element = e(t), this.placementKey = r, this.mediation = i != null ? i.mediation : void 0, this.creativeStore = n
          }
          return t.prototype.findViewAndRender = function() {
            var t, n, r, i, s, o, u, a, f;
            return this.mediation ? this.findNonSharethroughViewAndRender() : (t = this.creativeStore.nextCreative(), i = STR.Tag.Helpers.HtmlUtility.previewBackfill(), n = STR.Tag.Helpers.HtmlUtility.forceBackfill(), r = STR.Tag.Helpers.HtmlUtility.forceFeaturedContent(), s = STR.Tag.Helpers.HtmlUtility.previewMediation(), o = STR.Tag.Helpers.HtmlUtility.selectThirdParty(), i ? (f = "//sfp.sharethrough.com/placements/" + this.placementKey + "/backfill", e.get(f, function(t) {
              return function(n) {
                var r;
                return r = e("<div>").html(n), (new STR.Tag.Views.ThirdPartyPartner(t.element, t.placementKey, "backfill-preview", r.prop("outerHTML"), t.getDomPlacementIndex())).render()
              }
            }(this))) : s ? (f = "//sfp.sharethrough.com/placement_networks/" + s + "/tag", e.get(f, function(t) {
              return function(n) {
                debugger;
                var r, i;
                return i = e("<div>").html(n), r = i.html().trim(), (new STR.Tag.Views.ThirdPartyPartner(t.element, t.placementKey, "mediation-preview", r, t.getDomPlacementIndex())).render()
              }
            }(this))) : o ? (u = this.creativeStore.getThirdPartyPartner(o), a = STR.Tag.Helpers.HtmlUtility.decodeString(u.tag), (new STR.Tag.Views.ThirdPartyPartner(this.element, this.placementKey, u.key, a, this.getDomPlacementIndex())).render()) : n && this.creativeStore.hasBackfill() ? (new STR.Tag.Views.ThirdPartyPartner(this.element, this.placementKey, "backfill", this.creativeStore.getBackfill(), this.getDomPlacementIndex())).render() : r && this.creativeStore.hasFeaturedContent() ? (new STR.Tag.Views.FeaturedContent(this.creativeStore.getFeaturedContent(), this.element, this.placementKey, this.creativeStore)).render() : t ? (new(this.viewByType(t.creative.action))(t, this.element, this.placementKey, this.creativeStore)).render() : this.findNonSharethroughViewAndRender())
          }, t.prototype.findNonSharethroughViewAndRender = function() {
            var t, n, r, i;
            return n = STR.Tag.findPlacementFor(this.placementKey), t = this.getDomPlacementIndex(), r = n.nextThirdPartyPartnerForElement(t), r ? (i = STR.Tag.Helpers.HtmlUtility.decodeString(r.tag), (new STR.Tag.Views.ThirdPartyPartner(this.element, this.placementKey, r.key, i, t)).render()) : this.creativeStore.hasBackfill() ? (new STR.Tag.Views.ThirdPartyPartner(this.element, this.placementKey, "backfill", this.creativeStore.getBackfill(), t)).render() : this.creativeStore.hasFeaturedContent() ? (new STR.Tag.Views.FeaturedContent(this.creativeStore.getFeaturedContent(), this.element, this.placementKey, this.creativeStore)).render() : e(this.element).css("display", "none")
          }, t.prototype.viewByType = function(e) {
            return {
              video: STR.Tag.Views.Youtube,
              clickout: STR.Tag.Views.Clickout,
              "hosted-video": STR.Tag.Helpers.HostedVideoHelper,
              article: STR.Tag.Views.Article,
              carousel: STR.Tag.Views.Carousel
            }[e]
          }, t.prototype.getDomPlacementIndex = function() {
            var e, t;
            return e = this.$element.attr("data-str-placement-index"), e || (t = this.$element.find("[data-str-placement-index]"), e = t.attr("data-str-placement-index")), parseInt(e)
          }, t
        }()
      }.call(this),
      function() {
        var e;
        e = STR.Vendor.$, STR.Tag.boot = function() {
          var e, t, n;
          try {
            return (n = STR.Tag).placements || (n.placements = {}), STR.Tag.Models.PerformanceTracker.setup(), STR.Tag.Helpers.UidHelper.setup(), STR.Tag.Helpers.setupRAF(), STR.Tag.preprocess(), STR.Tag.process()
          } catch (r) {
            return t = r, e = STR.Tag.Helpers.BeaconCannon.getInstance(), e.fireBeacon(STR.Tag.TrackingHost, "butler", {
              type: "error",
              name: t.name,
              message: t.message
            })
          }
        }, STR.Tag.preprocess = function() {
          var e, t, n;
          return n = STR.Tag.process, e = STR.Tag.Factories.FactoryChooser, t = new STR.Tag.Models.FeedPreprocessor(n), t.identifyFeeds(e)
        }, STR.Tag.process = function() {
          return e("[data-str-native-key]:not([data-str-visited-flag])").each(function(t, n) {
            var r, i, s, o, u;
            return r = e(n), r.attr("data-str-visited-flag", !0), u = r.data("str-native-key"), s = r.data("str-creative-key") || "", i = r.data("str-campaign-key") || "", o = STR.Tag.findPlacementFor(u), r.attr("data-str-placement-index") === void 0 && r.attr("data-str-placement-index", STR.Tag.getDomIndex(r, o)), o.placeAd(n, s, i)
          })
        }, STR.Tag.findPlacementFor = function(e) {
          return STR.Tag.placements[e] === void 0 && (STR.Tag.placements[e] = new STR.Tag.Models.Placement(e)), STR.Tag.placements[e]
        }, STR.Tag.getDomIndex = function(e, t) {
          var n;
          return n = e.closest("[data-str-native-key='" + t.placementKey + "'][data-str-placement-index]").attr("data-str-placement-index"), n ? n : t.getDomIndex()
        }
      }.call(this),
      function() {
        window.STR == null && (window.STR = {}), STR.PassbackTag = {
          Models: {},
          Helpers: {}
        }
      }.call(this),
      function() {
        STR.PassbackTag.Models.MessageHandler = function() {
          function e() {}
          return e.prototype.firePostMessage = function() {
            var e, t;
            e = {
              STRMessage: "mediateNext"
            }, t = JSON.stringify(e), window.parent.postMessage(t, "*");
            if (window.parent !== window.parent.parent) return window.parent.parent.postMessage(t, "*")
          }, e
        }()
      }.call(this),
      function() {
        STR.PassbackTag.boot = function(e) {
          var t, n, r;
          if (e) return r = e[0], t = e[1], STR.Tag.Helpers.MediationHelper.mediateNextThirdPartyPartner(r, t);
          if (STR.PassbackTag.isInIFrame()) return n = new STR.PassbackTag.Models.MessageHandler, n.firePostMessage()
        }, STR.PassbackTag.isInIFrame = function() {
          return self !== top
        }
      }.call(this)
  }(window.STR);
var messageListener = new STR.Tag.Helpers.DfpMessageListener;
messageListener.registerListener();
var messageListener = new STR.Tag.Helpers.MediationMessageListener;
messageListener.registerListener(), STR.Vendor.$(function() {
  STR.Tag.boot()
});